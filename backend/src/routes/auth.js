
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = Router();

router.get('/setup-status', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM users'
    );

    res.json({
      setupRequired: Number(rows[0].total) === 0
    });

  } catch (error) {
    res.status(500).json({
      message: 'Could not check setup status'
    });
  }
});

router.post('/setup-admin', async (req, res) => {
  let connection;
  let lockAcquired = false;

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

    const { name, membershipId, password } = req.body;

    if (!name || !membershipId || !password || password.length < 8) {
      return res.status(400).json({
        message: 'Name, membership ID and password are required'
      });
    }

    connection = await pool.getConnection();

    const [lockRows] = await connection.query(
      "SELECT GET_LOCK('booknest_admin_setup', 10) AS acquired"
    );

    if (lockRows[0].acquired !== 1) {
      return res.status(503).json({
        message: 'Admin setup is busy. Please try again.'
      });
    }

    lockAcquired = true;

    const [admins] = await connection.execute(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (admins.length > 0) {
      return res.status(403).json({
        message: 'Administrator setup is already completed'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await connection.execute(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
      [name, membershipId, 'admin', hash]
    );

    return res.status(201).json({
      message: 'Administrator account created successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Administrator setup failed'
    });

  } finally {
    if (connection) {
      if (lockAcquired) {
        await connection.query(
          "SELECT RELEASE_LOCK('booknest_admin_setup')"
        ).catch(console.error);
      }
      connection.release();
    }
  }
});


// Normal login
router.post('/login', async (req, res) => {
  try {
    const { membershipId, password } = req.body;

    if (!membershipId || !password) {
      return res.status(400).json({
        message: 'Membership ID and password are required'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, membership_id, role, password_hash FROM users WHERE membership_id = ?',
      [membershipId]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({
        message: 'Incorrect membership ID or password'
      });
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
    res.status(500).json({
      message: 'Login failed'
    });
  }
});

export default router;
