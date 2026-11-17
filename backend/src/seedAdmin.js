import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './config/db.js';

dotenv.config();

const [name, membershipId, password] = process.argv.slice(2);

if (!name || !membershipId || !password || password.length < 6) {
  console.log('Usage: node src/seedAdmin.js "Admin Name" ADMIN001 password123');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 10);
  await pool.execute(
    'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
    [name, membershipId, 'admin', hash]
  );
  console.log('Admin account created successfully.');
} catch (e) {
  console.error('Error creating admin account:', e.message);
} finally {
  await pool.end();
}
