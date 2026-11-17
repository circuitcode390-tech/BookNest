import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, b.title AS book_title, u.name AS user_name 
      FROM transactions t 
      JOIN books b ON b.id = t.book_id 
      JOIN users u ON u.id = t.user_id 
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Could not load transactions', error: e.message });
  }
});

router.post('/', async (req, res) => {
  const { bookId, type, quantity, userId } = req.body;
  const amount = Number(quantity);

  if (
    !bookId ||
    !['borrow', 'return', 'restock'].includes(type) ||
    !Number.isInteger(amount) ||
    amount < 1
  ) {
    return res.status(400).json({
      message: 'Choose a book, valid transaction type, and quantity greater than zero',
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [books] = await connection.execute(
      'SELECT quantity FROM books WHERE id = ? FOR UPDATE',
      [bookId]
    );

    if (!books.length) {
      throw new Error('Book not found');
    }

    const current = books[0].quantity;
    const delta = type === 'borrow' ? -amount : amount;

    if (current + delta < 0) {
      throw new Error('Not enough copies available');
    }

    const targetUser = req.user.role === 'admin' && userId ? Number(userId) : req.user.id;
    const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [targetUser]);

    if (!users.length) {
      throw new Error('User not found');
    }

    await connection.execute('UPDATE books SET quantity = ? WHERE id = ?', [
      current + delta,
      bookId,
    ]);

    await connection.execute(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)',
      [bookId, targetUser, type, amount]
    );

    await connection.commit();
    res.status(201).json({ message: 'Transaction recorded' });
  } catch (e) {
    await connection.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    connection.release();
  }
});

export default router;
