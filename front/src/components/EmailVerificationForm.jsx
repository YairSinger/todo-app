// components/EmailVerificationForm.jsx
import React, { useState } from 'react';


const API_URL = import.meta.env.VITE_API_URL;

function EmailVerificationForm({ onPocAdded, emailToAdd, onCancel , nameToAdd}) {
  // Step tracking
  const [step, setStep] = useState('input'); // 'input', 'verify', 'success'
  
  // Form data
  const [name, setName] = useState(nameToAdd ||'');
  const [email, setEmail] = useState(emailToAdd || '');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Validate email format
  const isValidEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  // Step 1: Submit the initial form and request verification code
  const handleSubmitInitial = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/pocs/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      // Move to verification step
      setStep('verify');
      setMessage('Verification code sent! Check your email.');
    } catch (err) {
      console.error('Error initiating verification:', err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the code and create POC
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/pocs/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }
      
      // Move to success step
      setStep('success');
      setMessage('Email verified successfully!');
      
      // Notify parent component of the new POC
      setTimeout(() => {
        if (onPocAdded) {
          onPocAdded(data);
        }
      }, 1500); // Show success message briefly before closing
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/pocs/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code');
      }
      
      setMessage('New verification code sent! Check your email.');
    } catch (err) {
      console.error('Error resending code:', err);
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // Render different steps
  const renderInputStep = () => (
    <>
      <h3>Add New Contact</h3>
      <form onSubmit={handleSubmitInitial}>
        <div className="form-row">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>
        
        <div className="form-row">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
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
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </>
  );

  const renderVerifyStep = () => (
    <>
      <h3>Verify Email</h3>
      <p className="verification-info">
        We've sent a 6-digit verification code to <strong>{email}</strong>.
        Please enter it below to complete your registration.
      </p>
      
      <form onSubmit={handleSubmitVerification}>
        <div className="form-row">
          <label htmlFor="code">Verification Code:</label>
          <input
            id="code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
        </div>
        
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          <button type="button" onClick={handleResendCode} disabled={loading} className="link-button">
            Resend Code
          </button>
        </div>
      </form>
      
      <div className="form-footer">
        <button type="button" onClick={() => setStep('input')} className="back-btn">
          ← Back
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <div className="verification-success">
      <h3>Email Verified Successfully!</h3>
      <p>Your contact has been added and you can now assign tasks to {email}.</p>
    </div>
  );

  return (
    <div className="email-verification-form">
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      {step === 'input' && renderInputStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
}

export default EmailVerificationForm;