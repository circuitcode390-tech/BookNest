import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Could not load books', error: e.message });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (
      !title?.trim() ||
      !author?.trim() ||
      !genre?.trim() ||
      !isbn?.trim() ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        message: 'Enter valid title, author, genre, ISBN and non-negative quantity',
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );

    res.status(201).json({ id: result.insertId, message: 'Book added' });
  } catch (e) {
    res.status(e.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: e.code === 'ER_DUP_ENTRY' ? 'ISBN already exists' : 'Could not add book',
      error: e.message,
    });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (
      !title?.trim() ||
      !author?.trim() ||
      !genre?.trim() ||
      !isbn?.trim() ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        message: 'All fields are required and quantity must be zero or more',
      });
    }

    const [result] = await pool.execute(
      'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book updated' });
  } catch (e) {
    res.status(e.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: 'Could not update book',
      error: e.message,
    });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const [r] = await pool.execute('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted' });
  } catch (e) {
    res.status(500).json({
      message: 'Could not delete book. Books with transaction history cannot be deleted.',
      error: e.message,
    });
  }
});

export default router;
