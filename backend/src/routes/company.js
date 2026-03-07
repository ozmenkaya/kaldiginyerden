const express = require('express');
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Şirket profili getir
router.get('/profile', authMiddleware, requireRole('company'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, u.email FROM company_profiles c JOIN users u ON u.id=c.user_id WHERE c.user_id=$1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profil bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Şirket profili güncelle
router.put('/profile', authMiddleware, requireRole('company'), async (req, res) => {
  const { company_name, sector, company_size, city, website, description, contact_person, contact_phone } = req.body;
  try {
    await pool.query(
      `UPDATE company_profiles SET
        company_name=$1, sector=$2, company_size=$3, city=$4, website=$5,
        description=$6, contact_person=$7, contact_phone=$8, updated_at=NOW()
       WHERE user_id=$9`,
      [company_name, sector, company_size, city, website, description, contact_person, contact_phone, req.user.id]
    );
    res.json({ message: 'Profil güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// İş ilanı oluştur
router.post('/jobs', authMiddleware, requireRole('company'), async (req, res) => {
  const { title, description, requirements, location, employment_type, salary_range,
    flexible_hours, remote_option, deadline } = req.body;
  try {
    const company = await pool.query('SELECT id FROM company_profiles WHERE user_id=$1', [req.user.id]);
    if (company.rows.length === 0) return res.status(404).json({ error: 'Şirket profili bulunamadı' });

    const result = await pool.query(
      `INSERT INTO job_postings (company_id, title, description, requirements, location, employment_type,
        salary_range, flexible_hours, remote_option, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [company.rows[0].id, title, description, requirements, location, employment_type,
        salary_range, flexible_hours, remote_option, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// İş ilanlarım
router.get('/jobs', authMiddleware, requireRole('company'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(a.id) as application_count
       FROM job_postings j
       JOIN company_profiles c ON c.id=j.company_id
       LEFT JOIN applications a ON a.job_id=j.id
       WHERE c.user_id=$1
       GROUP BY j.id ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// İlan güncelle
router.put('/jobs/:id', authMiddleware, requireRole('company'), async (req, res) => {
  const { title, description, requirements, location, employment_type, salary_range,
    flexible_hours, remote_option, deadline, is_active } = req.body;
  try {
    const company = await pool.query('SELECT id FROM company_profiles WHERE user_id=$1', [req.user.id]);
    await pool.query(
      `UPDATE job_postings SET title=$1, description=$2, requirements=$3, location=$4,
        employment_type=$5, salary_range=$6, flexible_hours=$7, remote_option=$8,
        deadline=$9, is_active=$10, updated_at=NOW()
       WHERE id=$11 AND company_id=$12`,
      [title, description, requirements, location, employment_type, salary_range,
        flexible_hours, remote_option, deadline, is_active, req.params.id, company.rows[0].id]
    );
    res.json({ message: 'İlan güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Başvuranlar
router.get('/jobs/:id/applications', authMiddleware, requireRole('company'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.first_name, p.last_name, p.city, p.desired_position, p.cv_file_path,
              p.skills, u.email
       FROM applications a
       JOIN participant_profiles p ON p.id=a.participant_id
       JOIN users u ON u.id=p.user_id
       JOIN job_postings j ON j.id=a.job_id
       JOIN company_profiles c ON c.id=j.company_id
       WHERE j.id=$1 AND c.user_id=$2
       ORDER BY a.created_at DESC`,
      [req.params.id, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Başvuru durumu güncelle
router.patch('/applications/:id/status', authMiddleware, requireRole('company'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Geçersiz durum' });
  try {
    await pool.query(
      'UPDATE applications SET status=$1, updated_at=NOW() WHERE id=$2',
      [status, req.params.id]
    );
    res.json({ message: 'Durum güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
