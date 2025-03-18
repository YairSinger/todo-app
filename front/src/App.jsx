// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import PocManager from './components/PocManager';

// API service for todos
const API_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPocManager, setShowPocManager] = useState(false);

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
      setTodos(data);
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
  const addTodo = async (text, dueDate, pocEmail) => {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, dueDate, pocEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Server sent an error response
        throw new Error(data.error || 'Failed to add todo');
      }
      
      setTodos([...todos, data]);
      return data; // Return the new todo in case caller wants to use it
    } catch (err) {
      console.error('Error adding todo:', err);
      // Re-throw the error so the form component can handle it
      throw err;
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update todo');
      }

      const updatedTodo = await response.json();
      
      // Update local state after successful API call
      setTodos(
        todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error updating todo:', err);
      setError(err.message || 'Failed to update todo.');
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete todo');
      }
      
      // Update local state after successful API call
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError(err.message || 'Failed to delete todo.');
    }
  };

  const togglePocManager = () => {
    setShowPocManager(!showPocManager);
  };
  
  // Function to refresh POC data across components
  const refreshPocs = () => {
    // This will be passed to both TodoForm and PocManager
    fetchTodos();
    // We'll also trigger a custom event that TodoForm can listen for
    window.dispatchEvent(new CustomEvent('pocsUpdated'));
  };

  // Filter todos by completion status
  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="App">
      <h1>Todo Manager</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="app-container">
        <div className="form-container">
          <h2>Add New Task</h2>
          <TodoForm addTodo={addTodo} refreshTrigger={refreshPocs} />
          
          <div className="manage-pocs">
            <button 
              onClick={togglePocManager} 
              className="poc-toggle-btn"
            >
              {showPocManager ? 'Hide Contact Manager' : 'Manage Contacts'}
            </button>
            
            {showPocManager && <PocManager onUpdate={refreshPocs} />}
          </div>
        </div>
        <div className="lists-container">
          {loading ? (
            <div className="loading">Loading todos...</div>
          ) : (
            <>
              <div className="list-section">
                <h2>Tasks To Do ({incompleteTodos.length})</h2>
                <TodoList 
                  todos={incompleteTodos} 
                  toggleComplete={toggleComplete} 
                  deleteTodo={deleteTodo} 
                />
              </div>
              
              <div className="list-section">
                <h2>Completed Tasks ({completedTodos.length})</h2>
                <TodoList 
                  todos={completedTodos} 
                  toggleComplete={toggleComplete} 
                  deleteTodo={deleteTodo} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;