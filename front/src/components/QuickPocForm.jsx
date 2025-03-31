// components/QuickPocForm.jsx
import React, { useState } from 'react';
import EmailVerificationForm from './EmailVerificationForm';



function QuickPocForm({ onPocAdded, emailToAdd, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailToAdd || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   // New state for verification flow
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) return;

    setShowVerificationForm(true);    
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setError(null);
    setShowVerificationForm(false);
  };
     // If verification form is shown, render it
  if (showVerificationForm) {
    return (
      <EmailVerificationForm
        nameToAdd={name}
        onPocAdded={onPocAdded}
        emailToAdd={email}
        onCancel={resetForm}
      />
    );
  }

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