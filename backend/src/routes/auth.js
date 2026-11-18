import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = Router();

router.post('/setup-admin', async (req, res) => {
  try {
    const { name, membershipId, password } = req.body;

    if (!name || !membershipId || !password || password.length < 8) {
      return res.status(400).json({
        message: 'Name, membership ID and password (at least 8 characters) are required'
      });
    }

    // Check whether an admin already exists
    const [admins] = await pool.execute(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (admins.length > 0) {
      return res.status(403).json({
        message: 'Administrator setup is already completed'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
      [name, membershipId, 'admin', hash]
    );

    res.status(201).json({
      message: 'Administrator account created successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Administrator setup failed'
    });
  }
});

router.post('/login', async (req, res) => {
  try {

    const setupKey = req.headers['x-setup-key'];

    if (
      !process.env.ADMIN_SETUP_KEY ||
      setupKey !== process.env.ADMIN_SETUP_KEY
    ) {
      return res.status(403).json({
        message: 'Unauthorized administrator setup'
      });
    }
    const { membershipId, password } = req.body;
    if (!membershipId || !password) {
      return res.status(400).json({ message: 'Membership ID and password are required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, membership_id, role, password_hash FROM users WHERE membership_id = ?',
      [membershipId]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'Incorrect membership ID or password' });
    }

    const user = rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        membershipId: user.membership_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        membershipId: user.membership_id,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;
