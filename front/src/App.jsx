// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

// API service for todos
const API_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set document title
  useEffect(() => {
    document.title = "Todo Manager";
  }, []);
  
  // Load todos from API when app loads
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos from the API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      
      const data = await response.json();
      
      // Transform data from snake_case to camelCase
      const formattedData = data.map(todo => ({
        id: todo.id,
        text: todo.text,
        dueDate: todo.due_date,
        poc: todo.poc,
        completed: todo.completed
      }));
      
      setTodos(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Using local storage as fallback.');
      
      // Fallback to localStorage if API fails
      const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
      setTodos(storedTodos);
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async (text, dueDate, poc) => {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, dueDate, poc }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add todo');
      }
      
      const newTodo = await response.json();
      
      // Transform from snake_case to camelCase
      const formattedTodo = {
        id: newTodo.id,
        text: newTodo.text,
        dueDate: newTodo.due_date,
        poc: newTodo.poc,
        completed: newTodo.completed
      };
      
      setTodos([...todos, formattedTodo]);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo. Using local storage as fallback.');
      
      // Fallback to local state if API fails
      const newTodo = {
        id: Date.now(),
        text,
        dueDate,
        poc,
        completed: false
      };
      
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
  };

  // Toggle todo completion status
  const toggleComplete = async (id) => {
    try {
      // Find the todo to toggle
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) return;
      
      const newCompletedStatus = !todoToToggle.completed;
      
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: newCompletedStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      // Update local state after successful API call
      setTodos(
        todos.map(todo => 
          todo.id === id ? { ...todo, completed: newCompletedStatus } : todo
        )
      );
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Using local storage as fallback.');
      
      // Fallback to local state if API fails
      const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      
      // Update local state after successful API call
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Using local storage as fallback.');
      
      // Fallback to local state if API fails
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
  };

  return (
    <div className="App">
      <h1>Todo Manager</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="app-container">
        <div className="form-container">
          <TodoForm addTodo={addTodo} />
        </div>
        <div className="list-container">
          {loading ? (
            <div className="loading">Loading todos...</div>
          ) : (
            <TodoList 
              todos={todos} 
              toggleComplete={toggleComplete} 
              deleteTodo={deleteTodo} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;