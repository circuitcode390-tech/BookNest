import React, { useEffect, useState } from 'react';
import { request } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  BookIcon,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
} from '../components/Icons';
import { formatNumber, formatISBN } from '../utils/formatters';

const initialForm = {
  title: '',
  author: '',
  genre: '',
  isbn: '',
  quantity: 0,
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  async function loadBooks() {
    try {
      setLoading(true);
      const data = await request('/books');
      setBooks(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
      };

      if (editingId) {
        await request(`/books/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('Book record updated successfully.');
      } else {
        await request('/books', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('New book added to library catalog.');
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      loadBooks();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    }
  }

  function startEdit(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelForm() {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(false);
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await request(`/books/${id}`, { method: 'DELETE' });
      setMessage('Book record deleted successfully.');
      loadBooks();
    } catch (err) {
      setError(err.message || 'Failed to delete book record.');
    }
  }

  const genres = Array.from(new Set(books.map(b => b.genre).filter(Boolean))).sort();

  const filteredBooks = books.filter(b => {
    const matchesSearch = `${b.title} ${b.author} ${b.isbn}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'ALL' || b.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Book Management</h1>
          <p>Maintain the central catalog, track inventory levels, and manage book metadata.</p>
        </div>
        <div className="page-header-actions">
          {isAdmin && !showForm && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setForm(initialForm);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <PlusIcon size={16} />
              <span>Add New Book</span>
            </button>
          )}
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

      {isAdmin && showForm && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-info">
              <h2>{editingId ? 'Edit Book Record' : 'Register New Book'}</h2>
              <p>Complete the book details below to update the catalog</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelForm}>
              <XIcon size={14} />
              <span>Cancel</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Introduction to Algorithms"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Author(s) *</label>
                <input
                  type="text"
                  name="author"
                  className="form-control"
                  placeholder="e.g. Thomas H. Cormen"
                  value={form.author}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Genre / Category *</label>
                <input
                  type="text"
                  name="genre"
                  className="form-control"
                  placeholder="e.g. Computer Science"
                  value={form.genre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  className="form-control"
                  placeholder="e.g. 978-0262033848"
                  value={form.isbn}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Stock Quantity * <small>(Copies available)</small>
                </label>
                <input
                  type="number"
                  min="0"
                  name="quantity"
                  className="form-control"
                  value={form.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Changes' : 'Add Book to Catalog'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdmin && (
        <div className="alert alert-info">
          <AlertCircleIcon size={18} />
          <span>
            You have view-only access to the catalog. Administrator credentials are required to add,
            edit, or remove books.
          </span>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-info">
            <h2>Book Catalog</h2>
            <p>
              Showing {filteredBooks.length} of {books.length} registered titles
            </p>
          </div>

          <div className="panel-header-actions">
            {genres.length > 0 && (
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '140px' }}
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {genres.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            )}

            <div className="search-bar-wrapper">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, author, or ISBN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookIcon size={24} />
            </div>
            <h3>No books found</h3>
            <p>
              {search || selectedGenre !== 'ALL'
                ? 'Try adjusting your search criteria or filter.'
                : 'No books have been recorded in the catalog yet.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>ISBN</th>
                  <th>Available Stock</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => {
                  const qty = Number(book.quantity);
                  return (
                    <tr key={book.id}>
                      <td>
                        <strong>{book.title}</strong>
                      </td>
                      <td>{book.author}</td>
                      <td>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                          {book.genre}
                        </span>
                      </td>
                      <td>
                        <span className="badge-code">{formatISBN(book.isbn)}</span>
                      </td>
                      <td>
                        {qty === 0 ? (
                          <span className="badge badge-out-of-stock">0 Copies (Out)</span>
                        ) : qty < 2 ? (
                          <span className="badge badge-low-stock">{qty} Left (Low)</span>
                        ) : (
                          <span className="badge badge-available">{formatNumber(qty)} In Stock</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => startEdit(book)}
                              title="Edit book details"
                            >
                              <EditIcon size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(book.id, book.title)}
                              title="Delete book record"
                            >
                              <TrashIcon size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
