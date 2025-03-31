// components/PocManager.jsx
import React, { useState, useEffect } from 'react';
import EmailVerificationForm from './EmailVerificationForm';

const API_URL = 'http://localhost:5000/api';

function PocManager({ onUpdate }) {
  const [pocs, setPocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pocEmail, setPocEmail] = useState('');
  
  // New state for verification flow
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  useEffect(() => {
    fetchPocs();
  }, []);

  const fetchPocs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/pocs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch POCs');
      }
      
      const data = await response.json();
      setPocs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching POCs:', err);
      setError('Failed to load POCs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) return;
    
    // If we're adding a new POC, show the verification form
    if (!isEditing) {
      setShowVerificationForm(true);
      return;
    }
    
    // Otherwise, proceed with editing an existing POC
    try {
      const response = await fetch(`${API_URL}/pocs/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update POC');
      }
      
      // Refresh POC list
      fetchPocs();
      
      // Call the onUpdate callback to refresh todos and send event if provided
      if (onUpdate) {
        onUpdate();
      } else {
        // If no onUpdate callback was provided, at least dispatch the event
        window.dispatchEvent(new CustomEvent('pocsUpdated'));
      }
      
      // Reset form
      resetForm();
      
    } catch (err) {
      console.error('Error updating POC:', err);
      setError('Failed to update POC');
    }
  };

  const handlePocAdded = (newPoc) => {
    // Add the new POC to the local list
    setPocs([...pocs, newPoc]);
    
    // Call the onUpdate callback to refresh todos if provided
    if (onUpdate) {
      onUpdate();
    } else {
      // If no onUpdate callback was provided, at least dispatch the event
      window.dispatchEvent(new CustomEvent('pocsUpdated'));
    }
    
    // Reset form and hide verification form
    resetForm();
    
  };

  const handleEdit = (poc) => {
    setName(poc.name);
    setEmail(poc.email);
    setIsEditing(true);
    setEditId(poc.id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/pocs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete POC');
      }
      
      // Refresh POC list
      fetchPocs();
      
      // Call the onUpdate callback to refresh todos if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error deleting POC:', err);
      setError('Failed to delete POC');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPocEmail('');
    setIsEditing(false);
    setEditId(null);
    setShowVerificationForm(false);
  };

  // If verification form is shown, render it
  if (showVerificationForm) {
    return (
      <EmailVerificationForm
        nameToAdd={name}
        onPocAdded={handlePocAdded}
        emailToAdd={email}
        onCancel={resetForm}
      />
    );
  }

  return (
    <div className="poc-manager">
      <h3>{isEditing ? 'Edit Contact' : 'Add Contact'}</h3>
      
      <form onSubmit={handleSubmit} className="poc-form">
        <div className="form-row">
          <label htmlFor="pocName">Name:</label>
          <input
            id="pocName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
        </div>
        
        <div className="form-row">
          <label htmlFor="pocEmail">Email:</label>
          <input
            id="pocEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        
        <div className="form-buttons">
          <button type="submit">
            {isEditing ? 'Update Contact' : 'Add Contact'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      <h3>Contacts</h3>
      
      {loading ? (
        <div className="loading">Loading contacts...</div>
      ) : pocs.length === 0 ? (
        <div className="empty-list">No contacts found</div>
      ) : (
        <div className="poc-list">
           <select
              id="pocEmail"
              value={pocEmail}
              onChange={(e) => setPocEmail(e.target.value)}
              required
            >
              <option value="">-- Registered Persons --</option>
              {/* Ensure pocs is an array before mapping */}
              {Array.isArray(pocs) && pocs.map(poc => (
                <option key={poc.id} value={poc.email}>
                  {poc.name} ({poc.email})
                </option>
              ))}              
            </select>
            <div className="poc-actions">
                <button onClick={() => {
                  const selectPoc = pocs.find(poc => poc.email === pocEmail);
                  if(selectPoc)
                    handleEdit(selectPoc);
                  } 
                }                 
                
                className="edit-btn">
                  Edit
                </button>
                <button onClick={() => {
                   const selectPoc = pocs.find(poc => poc.email === pocEmail);
                   if(selectPoc)
                    handleDelete(selectPoc.id)

                }
                } className="delete-btn">
                  Delete
                </button>
              </div>         
        </div>
      )}
    </div>
  );
}

export default PocManager;