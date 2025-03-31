// models/index.js
import Poc from './Poc.js';
import PendingPoc from './PendingPoc.js';
import Todo from './Todo.js';

// Set up associations
Poc.hasMany(Todo, {
  foreignKey: {
    name: 'pocId',
    field: 'poc_id',
    allowNull: false
  }
});

Todo.belongsTo(Poc, {
  foreignKey: {
    name: 'pocId',
    field: 'poc_id',
    allowNull: false
  }
});

export { Poc, PendingPoc, Todo };