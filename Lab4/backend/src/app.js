import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger/swagger.js'
import authRoutes from './routes/auth.routes.js'
import appliancesRoutes from './routes/appliances.routes.js'
import tariffsRoutes from './routes/tariffs.routes.js'
import consumptionRoutes from './routes/consumption.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import limitsRoutes from './routes/limits.routes.js'
import adminRoutes from './routes/admin.routes.js'
import dataRoutes from './routes/data.routes.js'
import os from 'os'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '20mb' }))

  app.get('/health', (req, res) => {
    res.json({ ok: true })
  })

  app.get('/instance', (req, res) => {
    res.json({
      ok: true,
      instance: os.hostname()
    })
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use('/api/auth', authRoutes)
  app.use('/api/appliances', appliancesRoutes)
	app.use('/api/tariffs', tariffsRoutes)
	app.use('/api/consumption', consumptionRoutes)
	app.use('/api/reports', reportsRoutes)
	app.use('/api/limits', limitsRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/admin/data', dataRoutes)
  return app
}
