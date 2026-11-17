import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  LibraryIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
} from '../components/Icons';

export default function Login() {
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ membershipId, password }),
      });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-brand-logo">
            <LibraryIcon size={26} />
          </div>
          <h1>Library Management System</h1>
          <p>Sign in with your membership or staff credentials to access the portal.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircleIcon size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="membershipId">Membership / Staff ID</label>
            <input
              id="membershipId"
              type="text"
              className="form-control"
              placeholder="e.g. ADMIN001"
              value={membershipId}
              onChange={e => setMembershipId(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter account password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: '6px' }}
            disabled={busy}
          >
            {busy ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer-info">
          Library Management System &bull; Secure Institutional Access
        </div>
      </div>
    </div>
  );
}
