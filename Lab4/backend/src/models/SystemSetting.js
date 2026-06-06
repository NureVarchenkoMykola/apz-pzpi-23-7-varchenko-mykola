import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const SystemSetting = sequelize.define('SystemSetting', {
  setting_key: { type: DataTypes.STRING(120), primaryKey: true },
  setting_value: { type: DataTypes.TEXT('long'), allowNull: false },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'system_settings',
  timestamps: false
})