// components/TodoForm.jsx
import React, { useState, useEffect } from 'react';
import QuickPocForm from './QuickPocForm';

const API_URL = 'http://localhost:5000/api';

function TodoForm({ addTodo, refreshTrigger }) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [pocEmail, setPocEmail] = useState('');
  const [customPocEmail, setCustomPocEmail] = useState('');
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  
  const [pocs, setPocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pocError, setPocError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Fetch POCs when component mounts
  useEffect(() => {
    fetchPocs();
    
    // Listen for POC updates from other components
    const handlePocsUpdated = () => {
      console.log("POCs updated event received, refreshing data");
      fetchPocs();
    };
    
    // Add event listener
    window.addEventListener('pocsUpdated', handlePocsUpdated);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('pocsUpdated', handlePocsUpdated);
    };
  }, []);
  
  // Re-fetch POCs when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchPocs();
    }
  }, [refreshTrigger]);

  const fetchPocs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/pocs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setPocs(data);
      } else {
        console.error('Expected array but got:', data);
        setPocs([]);  // Set to empty array if response is not an array
        setError('Received invalid data format from server');
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching POCs:', err);
      setError('Failed to load contacts');
      setPocs([]);  // Ensure pocs is an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    // Clear any previous errors
    setSubmitError(null);
    
    // Determine which email to use
    const emailToUse = useCustomEmail ? customPocEmail : pocEmail;
    
    // Validate required POC
    if (!emailToUse) {
      setSubmitError('Please assign this task to a contact. A contact is required for all tasks.');
      return;
    }
    
    // Check if the email exists in the POCs list
    if (!isEmailRegistered(emailToUse) && !pocError) {
      setPocError(`Email "${emailToUse}" is not registered. Would you like to add it as a new contact?`);
      return;
    }
    
    // If we got here, the email is registered
    try {
      await addTodo(text, dueDate, emailToUse);
      
      // Reset form only if task was added successfully
      setText('');
      setDueDate('');
      setPocEmail('');
      setCustomPocEmail('');
      setUseCustomEmail(false);
      setPocError(null);
    } catch (err) {
      setSubmitError(err.message || 'Failed to add task. Please try again.');
    }
  };

  const isEmailRegistered = (email) => {
    // Ensure pocs is an array before using .some
    return Array.isArray(pocs) && pocs.some(poc => poc.email.toLowerCase() === email.toLowerCase());
  };

  const handleAddPoc = () => {
    setShowQuickForm(true);
  };

  const handlePocAdded = (newPoc) => {
    // Add the new POC to the local list - ensure pocs is an array first
    setPocs(Array.isArray(pocs) ? [...pocs, newPoc] : [newPoc]);
    
    // Select the newly added POC
    if (useCustomEmail) {
      setPocEmail(newPoc.email);
      setCustomPocEmail('');
      setUseCustomEmail(false);
    } else {
      setPocEmail(newPoc.email);
    }
    
    // Hide the form and error
    setShowQuickForm(false);
    setPocError(null);
  };

  const handleCancelQuickForm = () => {
    setShowQuickForm(false);
    // Keep the error to let the user try another option
  };

  const handleUseExistingPoc = () => {
    // Switch to dropdown selection
    setUseCustomEmail(false);
    setCustomPocEmail('');
    setPocError(null);
  };

  // If the quick form is shown, render it instead of the regular form
  if (showQuickForm) {
    return (
      <QuickPocForm 
        onPocAdded={handlePocAdded} 
        emailToAdd={useCustomEmail ? customPocEmail : ''} 
        onCancel={handleCancelQuickForm} 
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="taskText">Task:</label>
        <input
          id="taskText"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>
      
      <div className="form-row">
        <label htmlFor="dueDate">Due Date:</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      
      <div className="form-row">
        <label htmlFor="pocEmail">
          Assigned To: <span className="required-field">*</span>
        </label>
        {loading ? (
          <div className="loading-mini">Loading contacts...</div>
        ) : error ? (
          <div className="error-mini">{error}</div>
        ) : useCustomEmail ? (
          <div className="custom-email-input">
            <input
              type="email"
              value={customPocEmail}
              onChange={(e) => setCustomPocEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
            <button 
              type="button" 
              className="link-button"
              onClick={handleUseExistingPoc}
            >
              Use existing contact
            </button>
          </div>
        ) : (
          <div className="select-container">
            <select
              id="pocEmail"
              value={pocEmail}
              onChange={(e) => setPocEmail(e.target.value)}
              required
            >
              <option value="">-- Select Person --</option>
              {/* Ensure pocs is an array before mapping */}
              {Array.isArray(pocs) && pocs.map(poc => (
                <option key={poc.id} value={poc.email}>
                  {poc.name} ({poc.email})
                </option>
              ))}
            </select>
            <button 
              type="button" 
              className="link-button"
              onClick={() => setUseCustomEmail(true)}
            >
              Enter email mannually
            </button>
          </div>
        )}
      </div>
      
      {pocError && (
        <div className="poc-error">
          <p>{pocError}</p>
          <div className="poc-error-actions">
            <button type="button" onClick={handleAddPoc} className="action-btn">
              Add New Contact
            </button>
            <button type="button" onClick={() => setPocError(null)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="error-message">
          {submitError}
        </div>
      )}
      
      <button type="submit">Add Task</button>
    </form>
  );
}

export default TodoForm;