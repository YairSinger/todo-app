import React from 'react';
import TodoItem from './TodoItem';

function TodoList({ todos, toggleComplete, deleteTodo }) {
  if (todos.length === 0) {
    return <div className="empty-list">No tasks yet. Add a task to get started!</div>;
  }
  
  return (
    <div className="todo-table">
      <div className="todo-table-header">
        <div className="header-cell header-status">Status</div>
        <div className="header-cell header-task">Task</div>
        <div className="header-cell header-date">Due Date</div>
        <div className="header-cell header-poc">Point of Contact</div>
        <div className="header-cell header-actions">Actions</div>
      </div>
      <div className="todo-table-body">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
          />
        ))}
      </div>
    </div>
  );
}

export default TodoList;