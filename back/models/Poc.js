// models/Poc.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Poc = sequelize.define('Poc', {
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
  }
}, {
  tableName: 'pocs',
  timestamps: true,
  underscored: true
});

export default Poc;