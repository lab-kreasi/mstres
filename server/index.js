const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- 1. KONFIGURASI CORS (UNTUK DOMAIN BARU) ---
const allowedOrigins = [
  'https://labkreasi.my.id',      // Ganti dengan domain asli kamu
  'https://www.plannerku.com', 
  'http://localhost:5173'       // Tetap izinkan testing lokal
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti mobile apps/Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'Kebijakan CORS tidak mengizinkan akses dari origin ini.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// --- 2. KONEKSI DATABASE (NEON DB) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Wajib aktif untuk koneksi cloud (Neon/Render)
  }
});

pool.connect((err) => {
  if (err) console.error('Koneksi database gagal!', err);
  else console.log('Terhubung ke Neon DB 🚀');
});

// --- 3. AUTHENTICATION ENDPOINTS ---

app.post('/api/register', async (req, res) => {
  const { phone_number, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (phone_number, username, password) VALUES ($1, $2, $3) RETURNING id, phone_number, username',
      [phone_number, username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Nomor HP sudah terdaftar!" });
  }
});

app.post('/api/login', async (req, res) => {
  const { phone_number, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Nomor HP tidak ditemukan" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, username: user.username, phone_number: user.phone_number } });
    } else {
      res.status(401).json({ error: "Password salah!" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- 4. DASHBOARD & STATS ---

app.get('/api/dashboard-stats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const moodRes = await pool.query(
      'SELECT ROUND(AVG(score), 1) as average_mood FROM moods WHERE user_id = $1',
      [userId]
    );

    const taskRes = await pool.query(
      'SELECT COUNT(*) as total_tasks FROM tasks WHERE user_id = $1 AND is_completed = false',
      [userId]
    );

    res.json({
      averageMood: moodRes.rows[0].average_mood || 0,
      totalTasks: taskRes.rows[0].total_tasks || 0
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil statistik" });
  }
});

// --- 5. TASKS / PLANNER ---

app.get('/api/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title, created_at as start FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil daftar tugas" });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { user_id, title, category, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, category, created_at, is_completed) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user_id, title, category || 'urgent-important', date || new Date(), false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal menyimpan tugas" });
  }
});

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tasks SET is_completed = NOT is_completed WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui status" });
  }
});

// Endpoint baru untuk menghapus tugas (sinkron dengan Modal)
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: "Tugas berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus tugas" });
  }
});

// --- 6. MOOD TRACKER ---

app.post('/api/moods', async (req, res) => {
  const { user_id, score } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO moods (user_id, score) VALUES ($1, $2) RETURNING *',
      [user_id, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal menyimpan mood" });
  }
});

// --- 7. JURNAL / BRAIN DUMP ---

app.get('/api/journals/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM journals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil jurnal" });
  }
});

// Endpoint baru untuk menghapus jurnal (sinkron dengan Modal)
app.delete('/api/journals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM journals WHERE id = $1', [id]);
    res.json({ message: "Catatan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus catatan" });
  }
});

// --- 8. SERVER LISTEN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});