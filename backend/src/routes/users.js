import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Could not load users', error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (
      !name?.trim() ||
      !membershipId?.trim() ||
      !password ||
      password.length < 6 ||
      !['admin', 'student', 'librarian'].includes(role)
    ) {
      return res.status(400).json({
        message: 'Provide name, membership ID, valid role, and password (at least 6 characters)',
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.execute(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
      [name.trim(), membershipId.trim(), role, hash]
    );

    res.status(201).json({ id: r.insertId, message: 'User created' });
  } catch (e) {
    res.status(e.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: e.code === 'ER_DUP_ENTRY' ? 'Membership ID already exists' : 'Could not create user',
      error: e.message,
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (
      !name?.trim() ||
      !membershipId?.trim() ||
      !['admin', 'student', 'librarian'].includes(role)
    ) {
      return res.status(400).json({
        message: 'Name, membership ID, and valid role are required',
      });
    }

    let sql = 'UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?';
    let values = [name.trim(), membershipId.trim(), role, req.params.id];

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      sql = 'UPDATE users SET name = ?, membership_id = ?, role = ?, password_hash = ? WHERE id = ?';
      values = [name.trim(), membershipId.trim(), role, await bcrypt.hash(password, 10), req.params.id];
    }

    const [r] = await pool.execute(sql, values);
    if (!r.affectedRows) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated' });
  } catch (e) {
    res.status(e.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: 'Could not update user',
      error: e.message,
    });
  }
});

router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  try {
    const [r] = await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({
      message: 'Could not delete user. Users with transaction history cannot be deleted.',
      error: e.message,
    });
  }
});

export default router;
