// components/QuickPocForm.jsx
import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

function QuickPocForm({ onPocAdded, emailToAdd, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailToAdd || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/pocs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add contact');
      }
      
      const newPoc = await response.json();
      
      // Call the parent callback
      if (onPocAdded) {
        onPocAdded(newPoc);
      }
      
      // Reset form
      setName('');
      setEmail('');
      
    } catch (err) {
      console.error('Error adding POC:', err);
      setError('Failed to add contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-poc-form">
      <h3>Add New Contact</h3>
      {error && <div className="error-mini">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="quickPocName">Name:</label>
          <input
            id="quickPocName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact's full name"
            required
          />
        </div>
        
        <div className="form-row">
          <label htmlFor="quickPocEmail">Email:</label>
          <input
            id="quickPocEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            readOnly={!!emailToAdd}
            required
          />
        </div>
        
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuickPocForm;