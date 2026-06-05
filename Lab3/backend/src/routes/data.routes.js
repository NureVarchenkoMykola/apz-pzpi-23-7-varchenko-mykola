import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { auth, requireAdmin } from '../middleware/auth.js'
import {
  sequelize,
  User,
  Appliance,
  Tariff,
  ConsumptionRecord,
  Limit,
  AuditLog,
  SystemSetting
} from '../models/index.js'

const router = Router()

router.use(auth)
router.use(requireAdmin)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backupsDir = path.resolve(__dirname, '../../backups')

const EXPORT_MODELS = {
  users: User,
  appliances: Appliance,
  tariffs: Tariff,
  consumption_records: ConsumptionRecord,
  limits: Limit,
  audit_logs: AuditLog,
  system_settings: SystemSetting
}

const IMPORT_ORDER = [
  ['users', User],
  ['appliances', Appliance],
  ['tariffs', Tariff],
  ['limits', Limit],
  ['consumption_records', ConsumptionRecord],
  ['audit_logs', AuditLog],
  ['system_settings', SystemSetting]
]

const CLEAR_ORDER = [
  AuditLog,
  ConsumptionRecord,
  Limit,
  Tariff,
  Appliance,
  SystemSetting,
  User
]

function parseSettingValue(value) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function stringifySettingValue(value) {
  return JSON.stringify(value)
}

function getBackupFileName() {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  return `backup-energy-${timestamp}.json`
}

function isSafeBackupFileName(fileName) {
  return /^backup-energy-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.json$/.test(fileName)
}

function getModelOrder(key) {
  if (key === 'system_settings') {
    return [['setting_key', 'ASC']]
  }

  return [['id', 'ASC']]
}

function getUpdateFields(model) {
  return Object.entries(model.rawAttributes)
    .filter(([, attribute]) => !attribute.primaryKey)
    .map(([key]) => key)
}

async function writeAudit(req, action, detailsObj = null) {
  try {
    await AuditLog.create({
      admin_id: req.user.id,
      action,
      target_user_id: null,
      details: detailsObj ? JSON.stringify(detailsObj) : null
    })
  } catch (e) {
    console.error('AuditLog write failed:', e)
  }
}

async function getSettingsObject() {
  const rows = await SystemSetting.findAll({
    order: [['setting_key', 'ASC']]
  })

  return rows.reduce((acc, row) => {
    acc[row.setting_key] = parseSettingValue(row.setting_value)
    return acc
  }, {})
}

async function setSettingsObject(settings, transaction = null) {
  const entries = Object.entries(settings || {})

  for (const [key, value] of entries) {
    await SystemSetting.upsert({
      setting_key: key,
      setting_value: stringifySettingValue(value),
      updated_at: new Date()
    }, { transaction })
  }
}

async function buildExportPayload(req) {
  const data = {}

  for (const [key, model] of Object.entries(EXPORT_MODELS)) {
    data[key] = await model.findAll({
      raw: true,
      order: getModelOrder(key)
    })
  }

  return {
    metadata: {
      app: 'Energy Monitor',
      version: '1.0.0',
      created_at: new Date().toISOString(),
      created_by_admin_id: req.user.id
    },
    settings: await getSettingsObject(),
    data
  }
}

function validateImportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'invalid import payload'
  }

  if (!payload.data || typeof payload.data !== 'object') {
    return 'import payload must contain data object'
  }

  for (const key of Object.keys(payload.data)) {
    if (!EXPORT_MODELS[key]) {
      return `unsupported import table: ${key}`
    }

    if (!Array.isArray(payload.data[key])) {
      return `${key} must be an array`
    }
  }

  if (payload.data.users) {
    const hasActiveAdmin = payload.data.users.some((user) => {
      return user.role === 'admin' && user.is_blocked !== true
    })

    if (!hasActiveAdmin) {
      return 'import payload must contain at least one active admin'
    }
  }

  return null
}

/**
 * @openapi
 * /api/admin/data/settings:
 *   get:
 *     tags:
 *       - Admin Data
 *     summary: Get system settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 site_name: "Energy Monitor"
 *                 default_language: "uk"
 *                 default_currency: "UAH"
 *                 allow_registration: true
 *                 backup_retention_days: 30
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await getSettingsObject()
    res.json(settings)
  } catch (e) {
    next(e)
  }
})

/**
 * @openapi
 * /api/admin/data/settings:
 *   patch:
 *     tags:
 *       - Admin Data
 *     summary: Update system settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               site_name: "Energy Monitor"
 *               default_language: "uk"
 *               default_currency: "UAH"
 *               allow_registration: true
 *               backup_retention_days: 30
 *     responses:
 *       200:
 *         description: Updated settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.patch('/settings', async (req, res, next) => {
  try {
    await setSettingsObject(req.body || {})

    await writeAudit(req, 'SYSTEM_SETTINGS_UPDATE', req.body || {})

    const settings = await getSettingsObject()
    res.json(settings)
  } catch (e) {
    next(e)
  }
})

/**
 * @openapi
 * /api/admin/data/export:
 *   get:
 *     tags:
 *       - Admin Data
 *     summary: Export system data and settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export payload with metadata, settings and database data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     app: { type: string, example: "Energy Monitor" }
 *                     version: { type: string, example: "1.0.0" }
 *                     created_at: { type: string, format: date-time }
 *                     created_by_admin_id: { type: integer, example: 1 }
 *                 settings:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     users: { type: array, items: { type: object } }
 *                     appliances: { type: array, items: { type: object } }
 *                     tariffs: { type: array, items: { type: object } }
 *                     consumption_records: { type: array, items: { type: object } }
 *                     limits: { type: array, items: { type: object } }
 *                     audit_logs: { type: array, items: { type: object } }
 *                     system_settings: { type: array, items: { type: object } }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/export', async (req, res, next) => {
  try {
    const payload = await buildExportPayload(req)

    await writeAudit(req, 'SYSTEM_EXPORT', {
      tables: Object.keys(payload.data)
    })

    res.json(payload)
  } catch (e) {
    next(e)
  }
})

/**
 * @openapi
 * /api/admin/data/import:
 *   post:
 *     tags:
 *       - Admin Data
 *     summary: Import system data and settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [merge, replace]
 *                 example: "merge"
 *                 description: "merge updates or inserts records; replace clears existing data before import"
 *               settings:
 *                 type: object
 *                 example:
 *                   site_name: "Energy Monitor"
 *                   default_language: "uk"
 *                   default_currency: "UAH"
 *                   allow_registration: true
 *                   backup_retention_days: 30
 *               data:
 *                 type: object
 *                 properties:
 *                   users: { type: array, items: { type: object } }
 *                   appliances: { type: array, items: { type: object } }
 *                   tariffs: { type: array, items: { type: object } }
 *                   limits: { type: array, items: { type: object } }
 *                   consumption_records: { type: array, items: { type: object } }
 *                   audit_logs: { type: array, items: { type: object } }
 *                   system_settings: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Import completed
 *       400:
 *         description: Invalid import payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.post('/import', async (req, res, next) => {
  try {
    const error = validateImportPayload(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    const mode = req.body.mode === 'replace' ? 'replace' : 'merge'
    const inputData = req.body.data || {}
    const inputSettings = req.body.settings || {}

    const imported = await sequelize.transaction(async (transaction) => {
      if (mode === 'replace') {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction })

        for (const model of CLEAR_ORDER) {
          await model.destroy({
            where: {},
            transaction
          })
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction })
      }

      await setSettingsObject(inputSettings, transaction)

      const result = {}

      for (const [key, model] of IMPORT_ORDER) {
        const rows = Array.isArray(inputData[key]) ? inputData[key] : []

        if (rows.length === 0) {
          result[key] = 0
          continue
        }

        await model.bulkCreate(rows, {
          transaction,
          updateOnDuplicate: getUpdateFields(model)
        })

        result[key] = rows.length
      }

      return result
    })

    await writeAudit(req, 'SYSTEM_IMPORT', {
      mode,
      imported
    })

    res.json({
      message: 'import completed',
      mode,
      imported
    })
  } catch (e) {
    next(e)
  }
})

/**
 * @openapi
 * /api/admin/data/backups:
 *   post:
 *     tags:
 *       - Admin Data
 *     summary: Create system backup file (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Backup created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file: { type: string, example: "backup-energy-2026-06-05T12-00-00.000Z.json" }
 *                 created_at: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.post('/backups', async (req, res, next) => {
  try {
    await fs.mkdir(backupsDir, { recursive: true })

    const payload = await buildExportPayload(req)
    const file = getBackupFileName()
    const filePath = path.join(backupsDir, file)

    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')

    await writeAudit(req, 'SYSTEM_BACKUP_CREATE', {
      file
    })

    res.status(201).json({
      file,
      created_at: payload.metadata.created_at
    })
  } catch (e) {
    next(e)
  }
})

/**
 * @openapi
 * /api/admin/data/backups:
 *   get:
 *     tags:
 *       - Admin Data
 *     summary: List system backup files (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   file: { type: string, example: "backup-energy-2026-06-05T12-00-00.000Z.json" }
 *                   size_bytes: { type: integer, example: 2048 }
 *                   created_at: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/backups', async (req, res, next) => {
  try {
    await fs.mkdir(backupsDir, { recursive: true })

    const files = await fs.readdir(backupsDir)
    const backupFiles = files.filter((file) => isSafeBackupFileName(file))

    const items = await Promise.all(backupFiles.map(async (file) => {
      const stat = await fs.stat(path.join(backupsDir, file))

      return {
        file,
        size_bytes: stat.size,
        created_at: stat.birthtime
      }
    }))

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.json(items)
  } catch (e) {
    next(e)
  }
})

/**
 * @openapi
 * /api/admin/data/backups/{file}:
 *   get:
 *     tags:
 *       - Admin Data
 *     summary: Download system backup file (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *           example: "backup-energy-2026-06-05T12-00-00.000Z.json"
 *     responses:
 *       200:
 *         description: Backup file download
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid backup file name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Backup file not found
 */
router.get('/backups/:file', async (req, res, next) => {
  try {
    const file = String(req.params.file || '')

    if (!isSafeBackupFileName(file)) {
      return res.status(400).json({ message: 'invalid backup file name' })
    }

    const filePath = path.join(backupsDir, file)

    await fs.access(filePath)

    await writeAudit(req, 'SYSTEM_BACKUP_DOWNLOAD', {
      file
    })

    res.download(filePath, file)
  } catch (e) {
    next(e)
  }
})

export default router