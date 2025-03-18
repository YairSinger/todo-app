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

//define POC model
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
},{
  tableName: 'pocs',  // explicitly set table name
  timestamps: true,    // add createdAt and updatedAt columns
  underscored: true    // use snake_case for auto-generated fields
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

Poc.hasMany(Todo, {
  foreignKey:{
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
// POC ROUTES - Updated to always return arrays

// Get all POCs
app.get('/api/pocs', async (req, res) => {
  try {
    const pocs = await Poc.findAll({
      order: [['name', 'ASC']]
    });
    
    // Ensure we're sending an array (even if empty)
    // Sequelize's findAll should already return an array, but let's make it explicit
    res.json(Array.isArray(pocs) ? pocs : []);
    
  } catch (err) {
    console.error('Error fetching POCs:', err);
    // Return empty array instead of error object to maintain consistent type
    res.status(500).json([]);
  }
});

app.post('/api/pocs', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const newPoc = await Poc.create({
      name,
      email
    });
    
    res.status(201).json(newPoc);
  } catch (err) {
    console.error('Error adding POC:', err);
    res.status(500).json({ error: 'Failed to add POC' });
  }
});

app.put('/api/pocs/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  try {
    const poc = await Poc.findByPk(id);
    
    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }
    
    poc.name = name;
    poc.email = email;
    await poc.save();
    
    res.json(poc);
  } catch (err) {
    console.error('Error updating POC:', err);
    res.status(500).json({ error: 'Failed to update POC' });
  }
});

app.delete('/api/pocs/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const poc = await Poc.findByPk(id);
    
    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }
    
    await poc.destroy();
    
    res.json({ message: 'POC deleted successfully' });
  } catch (err) {
    console.error('Error deleting POC:', err);
    res.status(500).json({ error: 'Failed to delete POC' });
  }
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Poc,
        attributes: ['id','name', 'email']
      }]
    });
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
// Add a new todo
app.post('/api/todos', async (req, res) => {
  const { text, dueDate, pocEmail } = req.body;
  
  try {
    // Check if pocEmail is provided
    if (!pocEmail) {
      return res.status(400).json({ 
        error: 'POC email is required. Please assign this task to a registered contact.' 
      });
    }
    
    // Find POC by email
    const poc = await Poc.findOne({ where: { email: pocEmail } });
    
    if (!poc) {
      return res.status(404).json({ 
        error: `No registered contact found with email ${pocEmail}. Please register this contact first.` 
      });
    }
    
    // Create todo with the found POC's ID
    const newTodo = await Todo.create({
      text,
      dueDate,
      pocId: poc.id
    });
    
    // Fetch the created todo with POC info
    const todoWithPoc = await Todo.findByPk(newTodo.id, {
      include: [{ 
        model: Poc,
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.status(201).json(todoWithPoc);
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});
// Update todo (toggle completion or other updates)
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed, text, dueDate, pocEmail } = req.body;
  
  try {
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
     // Update POC if email provided
     if (pocEmail !== undefined) {
      if (pocEmail) {
        const poc = await Poc.findOne({ where: { email: pocEmail } });
        if (poc) {
          todo.pocId = poc.id;
        } else {
          return res.status(404).json({ error: 'POC email not found' });
        }
      } else {
        // If empty email is provided, set POC to null
        todo.pocId = null;
      }
    }
    
    // Update other fields if they're provided
    if (completed !== undefined) todo.completed = completed;
    if (text !== undefined) todo.text = text;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    
    await todo.save();
    
     // Fetch the updated todo with POC info
     const updatedTodo = await Todo.findByPk(id, {
      include: [{ 
        model: Poc,
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.json(updatedTodo);
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
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});