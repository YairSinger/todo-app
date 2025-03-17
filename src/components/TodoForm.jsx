import React, { useState } from 'react';

function TodoForm({ addTodo }) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [poc, setPoc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text, dueDate, poc);
    setText('');
    setDueDate('');
    setPoc('');
  };

  return (
    <form onSubmit={handleSubmit}>
          <label htmlFor="todo-form">Insert new todo</label>
      <div className="form-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo..."
          required
        />
      </div>
      <div className="form-row">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          placeholder="Due date"
        />
      </div>
      <div className="form-row">
        <input
          type="text"
          value={poc}
          onChange={(e) => setPoc(e.target.value)}
          placeholder="Point of Contact"
        />
      </div>
      <button type="submit">Add</button>
    </form>
  );
}

export default TodoForm;


