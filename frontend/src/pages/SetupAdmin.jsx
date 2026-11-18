
import React, { useState } from 'react';
import { request } from '../api';

export default function SetupAdmin() {
  const [name, setName] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);

    try {
      const data = await request('/auth/setup-admin', {
        method: 'POST',
        headers: {
          'x-setup-key': setupKey,
        },
        body: JSON.stringify({
          name,
          membershipId,
          password,
        }),
      });

      setMessage(data.message);
      setName('');
      setMembershipId('');
      setPassword('');
      setSetupKey('');
    } catch (err) {
      setError(err.message || 'Administrator setup failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Create First Administrator</h1>
          <p>Register the initial BookNest administrator account.</p>
        </div>

        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membershipId">Administrator ID</label>
            <input
              id="membershipId"
              className="form-control"
              value={membershipId}
              onChange={e => setMembershipId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setupKey">Administrator Setup Key</label>
            <input
              id="setupKey"
              type="password"
              className="form-control"
              value={setupKey}
              onChange={e => setSetupKey(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px' }}
            disabled={busy}
          >
            {busy ? 'Creating account...' : 'Create Administrator'}
          </button>
        </form>

        <div className="login-footer-info">
          BookNest &bull; Secure Administrator Setup
        </div>
      </div>
    </div>
  );
}
