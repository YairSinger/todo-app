// models/Todo.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'due_date' // Map camelCase in JS to snake_case in DB
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'todos',
  timestamps: true,
  underscored: true
});

export default Todo;