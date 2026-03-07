const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// CV upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR + '/cv/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Sadece PDF, DOC, DOCX yüklenebilir'));
  }
});

// Profil getir
router.get('/profile', authMiddleware, requireRole('participant'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, u.email FROM participant_profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=$1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profil bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Profil güncelle
router.put('/profile', authMiddleware, requireRole('participant'), async (req, res) => {
  const { first_name, last_name, phone, city, birth_year, education_level, last_work_year,
    career_break_reason, bio, skills, desired_sectors, desired_position, availability } = req.body;
  try {
    await pool.query(
      `UPDATE participant_profiles SET 
        first_name=$1, last_name=$2, phone=$3, city=$4, birth_year=$5,
        education_level=$6, last_work_year=$7, career_break_reason=$8, bio=$9,
        skills=$10, desired_sectors=$11, desired_position=$12, availability=$13,
        updated_at=NOW()
      WHERE user_id=$14`,
      [first_name, last_name, phone, city, birth_year, education_level, last_work_year,
        career_break_reason, bio, skills, desired_sectors, desired_position, availability, req.user.id]
    );
    res.json({ message: 'Profil güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// CV yükle
router.post('/cv', authMiddleware, requireRole('participant'), upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi' });
  try {
    await pool.query(
      'UPDATE participant_profiles SET cv_file_path=$1, updated_at=NOW() WHERE user_id=$2',
      [req.file.filename, req.user.id]
    );
    res.json({ message: 'CV yüklendi', filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Başvurular
router.get('/applications', authMiddleware, requireRole('participant'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, j.title, j.location, c.company_name
       FROM applications a
       JOIN participant_profiles p ON p.id=a.participant_id
       JOIN job_postings j ON j.id=a.job_id
       JOIN company_profiles c ON c.id=j.company_id
       WHERE p.user_id=$1 ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Eğitimlerime katıl
router.post('/trainings/:trainingId/enroll', authMiddleware, requireRole('participant'), async (req, res) => {
  try {
    const profile = await pool.query('SELECT id FROM participant_profiles WHERE user_id=$1', [req.user.id]);
    if (profile.rows.length === 0) return res.status(404).json({ error: 'Profil bulunamadı' });
    await pool.query(
      'INSERT INTO training_enrollments (participant_id, training_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [profile.rows[0].id, req.params.trainingId]
    );
    res.json({ message: 'Eğitime kaydolundu' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Katıldığım eğitimler
router.get('/trainings', authMiddleware, requireRole('participant'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, te.status, te.completed_at
       FROM training_enrollments te
       JOIN trainings t ON t.id=te.training_id
       JOIN participant_profiles p ON p.id=te.participant_id
       WHERE p.user_id=$1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
