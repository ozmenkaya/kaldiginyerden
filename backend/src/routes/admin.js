const express = require('express');
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Dashboard istatistikleri
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [users, participants, companies, jobs, applications, trainings] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM participant_profiles'),
      pool.query('SELECT COUNT(*) FROM company_profiles'),
      pool.query('SELECT COUNT(*) FROM job_postings WHERE is_active=true'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM trainings WHERE is_active=true'),
    ]);
    res.json({
      total_users: users.rows[0].count,
      total_participants: participants.rows[0].count,
      total_companies: companies.rows[0].count,
      active_jobs: jobs.rows[0].count,
      total_applications: applications.rows[0].count,
      active_trainings: trainings.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tüm kullanıcılar
router.get('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = 'SELECT id, email, role, is_active, created_at FROM users';
    const params = [];
    if (role) { query += ' WHERE role=$1'; params.push(role); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı aktif/pasif yap
router.patch('/users/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
  const { is_active } = req.body;
  try {
    await pool.query('UPDATE users SET is_active=$1 WHERE id=$2', [is_active, req.params.id]);
    res.json({ message: 'Kullanıcı durumu güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Admin oluştur
router.post('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role',
      [email, hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Şirket doğrula
router.patch('/companies/:id/verify', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('UPDATE company_profiles SET is_verified=$1 WHERE id=$2', [true, req.params.id]);
    res.json({ message: 'Şirket doğrulandı' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tüm şirketler
router.get('/companies', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.email, u.is_active FROM company_profiles c
       JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Eğitim oluştur
router.post('/trainings', authMiddleware, requireRole('admin'), async (req, res) => {
  const { title, description, category, duration_hours, level, format, url, thumbnail } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trainings (created_by, title, description, category, duration_hours, level, format, url, thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, title, description, category, duration_hours, level, format, url, thumbnail]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Eğitim güncelle/sil
router.put('/trainings/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { title, description, category, duration_hours, level, format, url, thumbnail, is_active } = req.body;
  try {
    await pool.query(
      `UPDATE trainings SET title=$1, description=$2, category=$3, duration_hours=$4,
       level=$5, format=$6, url=$7, thumbnail=$8, is_active=$9 WHERE id=$10`,
      [title, description, category, duration_hours, level, format, url, thumbnail, is_active, req.params.id]
    );
    res.json({ message: 'Eğitim güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
