import React, { useEffect, useState } from 'react';
import { request } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  TransactionIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from '../components/Icons';
import {
  formatDateTime,
  formatNumber,
  formatTransactionType,
} from '../utils/formatters';

const initialForm = {
  bookId: '',
  type: 'borrow',
  quantity: 1,
  userId: '',
};

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  async function loadData() {
    try {
      const [booksData, txData] = await Promise.all([
        request('/books'),
        request('/transactions'),
      ]);
      setBooks(booksData || []);
      setTransactions(txData || []);

      if (user?.role === 'admin') {
        const usersData = await request('/users');
        setUsers(usersData || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transaction data');
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await request('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          bookId: Number(form.bookId),
          type: form.type,
          quantity: Number(form.quantity),
          userId: form.userId ? Number(form.userId) : undefined,
        }),
      });

      setMessage('Transaction successfully recorded and book inventory updated.');
      setForm(prev => ({ ...prev, quantity: 1, bookId: '' }));
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to record transaction.');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = `${t.book_title} ${t.user_name}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedBook = books.find(b => String(b.id) === String(form.bookId));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Circulation & Inventory Transactions</h1>
          <p>Record book issues, returns, and inventory stock replenishment events.</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircleIcon size={18} />
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircleIcon size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-info">
            <h2>Record Circulation Transaction</h2>
            <p>Database inventory counts update automatically upon transaction processing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label>Transaction Type *</label>
            <div className="type-radio-grid">
              <div
                className={`type-radio-card ${form.type === 'borrow' ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'borrow' }))}
              >
                <div className="type-radio-title">
                  <span>Borrow Book</span>
                  <span className="badge badge-info">Deducts Stock</span>
                </div>
                <div className="type-radio-desc">Issue copy to student or library patron</div>
              </div>

              <div
                className={`type-radio-card ${form.type === 'return' ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'return' }))}
              >
                <div className="type-radio-title">
                  <span>Return Book</span>
                  <span className="badge badge-type-return">Adds Stock</span>
                </div>
                <div className="type-radio-desc">Restore returned copy back to circulation</div>
              </div>

              <div
                className={`type-radio-card ${form.type === 'restock' ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'restock' }))}
              >
                <div className="type-radio-title">
                  <span>Inventory Restock</span>
                  <span className="badge badge-type-restock">Inventory Inflow</span>
                </div>
                <div className="type-radio-desc">Add new procurement or replacement copies</div>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Select Book *</label>
              <select
                className="form-control"
                required
                value={form.bookId}
                onChange={e => setForm(f => ({ ...f, bookId: e.target.value }))}
              >
                <option value="">-- Choose a title from catalog --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.quantity} copies in stock)
                  </option>
                ))}
              </select>
              {selectedBook && (
                <div className="cell-subtext">
                  Current shelf stock:{' '}
                  <strong>
                    {selectedBook.quantity} {Number(selectedBook.quantity) === 1 ? 'copy' : 'copies'}
                  </strong>{' '}
                  available.
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>

            {isAdmin && (
              <div className="form-group">
                <label>
                  Member Account <small>(Admin override)</small>
                </label>
                <select
                  className="form-control"
                  value={form.userId}
                  onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                >
                  <option value="">Self ({user.name})</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (ID: {u.membership_id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <TransactionIcon size={16} />
              <span>{submitting ? 'Recording...' : 'Process Transaction'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-info">
            <h2>Transaction Ledger</h2>
            <p>
              Showing {filteredTransactions.length} of {transactions.length} audit records
            </p>
          </div>

          <div className="panel-header-actions">
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="ALL">All Event Types</option>
              <option value="borrow">Borrow Only</option>
              <option value="return">Return Only</option>
              <option value="restock">Restock Only</option>
            </select>

            <div className="search-bar-wrapper">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search book or member..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <TransactionIcon size={24} />
            </div>
            <h3>No transactions recorded</h3>
            <p>
              {search || filterType !== 'ALL'
                ? 'No records match the current filter criteria.'
                : 'Transactions will appear here as circulation activity occurs.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Member / Operator</th>
                  <th>Action</th>
                  <th>Quantity</th>
                  <th>Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <strong>{tx.book_title}</strong>
                    </td>
                    <td>{tx.user_name}</td>
                    <td>
                      <span className={`badge badge-type-${tx.type}`}>
                        {formatTransactionType(tx.type)}
                      </span>
                    </td>
                    <td>
                      <strong>{formatNumber(tx.quantity)}</strong>
                    </td>
                    <td>{formatDateTime(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
