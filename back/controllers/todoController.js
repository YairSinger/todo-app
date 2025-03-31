// controllers/todoController.js
import { Todo, Poc } from '../models/index.js';

/**
 * Get all todos
 */
export const getAllTodos = async (req, res, next) => {
  try {
    const todos = await Todo.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Poc,
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.json(todos);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new todo
 */
export const createTodo = async (req, res, next) => {
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
    next(err);
  }
};

/**
 * Update a todo
 */
export const updateTodo = async (req, res, next) => {
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
    next(err);
  }
};

/**
 * Delete a todo
 */
export const deleteTodo = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await todo.destroy();
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo
};