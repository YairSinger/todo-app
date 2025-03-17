// components/TodoItem.js
import React from 'react';

function TodoItem({ todo, toggleComplete, deleteTodo }) {
  // Format the due date for display if it exists
  const formattedDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '-';
  
  return (
    <div className="todo-row">
      <div className="todo-cell todo-status">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleComplete(todo.id)}
        />
      </div>
      <div className="todo-cell todo-task" style={{ 
        textDecoration: todo.completed ? 'line-through' : 'none' 
      }}>
        {todo.text}
      </div>
      <div className="todo-cell todo-date">
        {formattedDate}
      </div>
      <div className="todo-cell todo-poc">
        {todo.poc || '-'}
      </div>
      <div className="todo-cell todo-actions">
        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
      </div>
    </div>
  );
}

export default TodoItem;
