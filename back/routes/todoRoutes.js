// routes/todoRoutes.js
import express from 'express';
import todoController from '../controllers/todoController.js';

const router = express.Router();

// Get all todos
router.get('/', todoController.getAllTodos);

// Create a new todo
router.post('/', todoController.createTodo);

// Update a todo
router.put('/:id', todoController.updateTodo);

// Delete a todo
router.delete('/:id', todoController.deleteTodo);

export default router;