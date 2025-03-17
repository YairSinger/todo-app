// App.js
import React, { useState, useEffect } from 'react';
import './index.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState([]);

  // Load todos from localStorage when app loads
  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    setTodos(storedTodos);
  }, []);

  // Save todos to localStorage whenever todos state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Add a new todo
  const addTodo = (text, dueDate, poc) => {
    const newTodo = {
      id: Date.now(),
      text,
      dueDate,
      poc,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  // Toggle todo completion status
  const toggleComplete = (id) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="App">
      <h1>Simple Todo App</h1>
      <div className="app-container">
        <div className="form-container">        
          <TodoForm addTodo={addTodo} />
        </div>
        <div className="list-container">
          <TodoList 
            todos={todos} 
            toggleComplete={toggleComplete} 
            deleteTodo={deleteTodo} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
