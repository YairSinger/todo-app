// models/PendingPoc.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PendingPoc = sequelize.define('PendingPoc', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'pending_pocs',
  timestamps: true,
  underscored: true
});

export default PendingPoc;