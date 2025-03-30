// server.js
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import crypto from 'crypto'; // Node.js built-in
import dotenv from 'dotenv';
import axios from 'axios';

const env = dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Instead of body-parser

// Sequelize setup
const sequelize = new Sequelize('todoapp', 'postgres', 'Abba123$', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false // set to true for SQL query logging
});

async function sendEmail(toEmail, expirationTime, passcode) {
  try {
      const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY, // Public Key (for browser-based requests)
          accessToken: process.env.EMAILJS_PRIVATE_KEY, // Private Key (for server-side requests)
          template_params: {
              email: toEmail,
              expiration_time: expirationTime,
              passcode: passcode,
          },
      });

      console.log('Email sent successfully:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error sending email:', error.response ? error.response.data : error.message);
  }
}


// Define POC model
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
  tableName: 'pocs',
  timestamps: true,
  underscored: true
});

// Define PendingPoc model
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
},{
  tableName: 'pending_pocs',
  timestamps: true,
  underscored: true
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
    field: 'due_date'
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
  tableName: 'todos',
  timestamps: true,
  underscored: true
});

// Set up associations
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
// POC ROUTES

// Get all POCs
app.get('/api/pocs', async (req, res) => {
  try {
    const pocs = await Poc.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(Array.isArray(pocs) ? pocs : []);
    
  } catch (err) {
    console.error('Error fetching POCs:', err);
    res.status(500).json([]);
  }
});

// Route to initiate email verification
app.post('/api/pocs/verify', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    // Validate email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if email already exists in confirmed POCs
    const existingPoc = await Poc.findOne({ where: { email } });
    if (existingPoc) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    
    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Remove any previous pending verification for this email
    await PendingPoc.destroy({ where: { email } });
    
    // Store in database
    await PendingPoc.create({
      name,
      email,
      verificationCode,
      expiresAt
    });
    
    // Send verification email - for testing just log the code
    console.log(`Verification code for ${email}: ${verificationCode}`);
    //TODO fix mail
    sendEmail(email, expiresAt.toLocaleString(), verificationCode);
    
    
    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (err) {
    console.error('Error initiating email verification:', err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Route to confirm email verification
app.post('/api/pocs/confirm', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    // Find the pending verification
    const pendingPoc = await PendingPoc.findOne({ 
      where: { 
        email,
        verificationCode: code,
        expiresAt: { [Sequelize.Op.gt]: new Date() } // Check if not expired
      } 
    });
    
    if (!pendingPoc) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification code' 
      });
    }
    
    // Create confirmed POC
    const newPoc = await Poc.create({
      name: pendingPoc.name,
      email: pendingPoc.email
    });
    
    // Delete the pending verification
    await pendingPoc.destroy();
    
    res.status(201).json(newPoc);
  } catch (err) {
    console.error('Error confirming email verification:', err);
    res.status(500).json({ error: 'Failed to confirm email' });
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
    
    
    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }
    console.log(`triying to delete poc number:`, id);
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