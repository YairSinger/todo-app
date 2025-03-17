// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sequelize setup
const sequelize = new Sequelize('todoapp', 'postgres', 'Abba123$', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false // set to true for SQL query logging
});

// Define Todo model
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
  poc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'todos',  // explicitly set table name
  timestamps: true,    // add createdAt and updatedAt columns
  underscored: true    // use snake_case for auto-generated fields
});

// Initialize database
const initDb = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync the model with the database (create the table if it doesn't exist)
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Initialize database on server start
initDb();

// ROUTES

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [['id', 'ASC']]
    });
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
app.post('/api/todos', async (req, res) => {
  const { text, dueDate, poc } = req.body;
  
  try {
    const newTodo = await Todo.create({
      text,
      dueDate,
      poc
    });
    
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Update todo (toggle completion)
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  try {
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todo.completed = completed;
    await todo.save();
    
    res.json(todo);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await todo.destroy();
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});