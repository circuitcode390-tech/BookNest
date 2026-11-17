import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api';
import {
  BookIcon,
  LayersIcon,
  AlertCircleIcon,
  TransactionIcon,
  TrendingUpIcon,
  CheckCircleIcon,
} from '../components/Icons';
import {
  formatDate,
  formatNumber,
  formatTransactionType,
  formatISBN,
} from '../utils/formatters';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([request('/books'), request('/transactions')])
      .then(([booksData, transactionsData]) => {
        setBooks(booksData || []);
        setTransactions(transactionsData || []);
      })
      .catch(err => {
        setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalCopies = books.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
  const lowStockBooks = books.filter(b => Number(b.quantity) < 2);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard Overview</h1>
          <p>Real-time metrics and inventory status across the library collection.</p>
        </div>
        <div className="page-header-actions">
          <Link to="/transactions" className="btn btn-primary">
            <TransactionIcon size={16} />
            <span>New Transaction</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircleIcon size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Catalog Titles</span>
            <div className="stat-icon-wrapper stat-icon-blue">
              <BookIcon size={18} />
            </div>
          </div>
          <div className="stat-value">{loading ? '—' : formatNumber(books.length)}</div>
          <div className="stat-note">Unique book records registered</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Copies</span>
            <div className="stat-icon-wrapper stat-icon-emerald">
              <LayersIcon size={18} />
            </div>
          </div>
          <div className="stat-value">{loading ? '—' : formatNumber(totalCopies)}</div>
          <div className="stat-note">Available units across all shelves</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Low Stock Alerts</span>
            <div className="stat-icon-wrapper stat-icon-amber">
              <AlertCircleIcon size={18} />
            </div>
          </div>
          <div className="stat-value">{loading ? '—' : formatNumber(lowStockBooks.length)}</div>
          <div className="stat-note">Titles with fewer than 2 copies</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Transactions</span>
            <div className="stat-icon-wrapper stat-icon-purple">
              <TransactionIcon size={18} />
            </div>
          </div>
          <div className="stat-value">{loading ? '—' : formatNumber(transactions.length)}</div>
          <div className="stat-note">Circulation events recorded</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-info">
              <h2>Inventory Summary</h2>
              <p>Current stock levels for recent catalog entries</p>
            </div>
            <Link to="/books" className="btn btn-secondary btn-sm">
              <span>View All Books</span>
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <BookIcon size={24} />
              </div>
              <h3>No books in collection</h3>
              <p>Add books through Book Management to begin tracking inventory.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Title & Author</th>
                    <th>Genre</th>
                    <th>ISBN</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {books.slice(0, 7).map(book => {
                    const qty = Number(book.quantity);
                    return (
                      <tr key={book.id}>
                        <td>
                          <strong>{book.title}</strong>
                          <div className="cell-subtext">{book.author}</div>
                        </td>
                        <td>{book.genre}</td>
                        <td>
                          <span className="badge-code">{formatISBN(book.isbn)}</span>
                        </td>
                        <td>{formatNumber(qty)}</td>
                        <td>
                          {qty === 0 ? (
                            <span className="badge badge-out-of-stock">Out of Stock</span>
                          ) : qty < 2 ? (
                            <span className="badge badge-low-stock">Low Stock</span>
                          ) : (
                            <span className="badge badge-available">In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-info">
              <h2>Action Required</h2>
              <p>Titles requiring replenishment</p>
            </div>
            <span className="badge badge-warning">{lowStockBooks.length} items</span>
          </div>

          {lowStockBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ color: '#059669', background: '#ecfdf5' }}>
                <CheckCircleIcon size={24} />
              </div>
              <h3>Healthy Inventory</h3>
              <p>All titles maintain sufficient stock levels.</p>
            </div>
          ) : (
            <div className="low-stock-list">
              {lowStockBooks.slice(0, 5).map(book => (
                <div key={book.id} className="low-stock-card">
                  <div className="low-stock-info">
                    <div className="low-stock-icon">
                      <AlertCircleIcon size={16} />
                    </div>
                    <div>
                      <div className="low-stock-title">{book.title}</div>
                      <div className="low-stock-author">{book.author}</div>
                    </div>
                  </div>
                  <span className="badge badge-danger">
                    {book.quantity} {Number(book.quantity) === 1 ? 'copy' : 'copies'} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-info">
            <h2>Recent Circulation Activity</h2>
            <p>Latest borrowing, returns, and inventory restocking</p>
          </div>
          <Link to="/transactions" className="btn btn-secondary btn-sm">
            <span>Transaction Logs</span>
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <TransactionIcon size={24} />
            </div>
            <h3>No transaction activity recorded</h3>
            <p>Transactions will appear here once members borrow or return items.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Member</th>
                  <th>Transaction Type</th>
                  <th>Quantity</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map(tx => (
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
                    <td>{formatNumber(tx.quantity)}</td>
                    <td>{formatDate(tx.created_at)}</td>
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
