const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Tüm aktif ilanlar (herkes görebilir)
router.get('/', async (req, res) => {
  const { city, sector, remote, flexible, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let conditions = ['j.is_active=true'];
    const params = [];
    if (city) { conditions.push(`j.location ILIKE $${params.length + 1}`); params.push(`%${city}%`); }
    if (remote === 'true') { conditions.push('j.remote_option=true'); }
    if (flexible === 'true') { conditions.push('j.flexible_hours=true'); }
    if (sector) { conditions.push(`c.sector ILIKE $${params.length + 1}`); params.push(`%${sector}%`); }

    const query = `
      SELECT j.*, c.company_name, c.sector, c.city as company_city, c.logo_path, c.is_verified
      FROM job_postings j
      JOIN company_profiles c ON c.id=j.company_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY j.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// İlana başvur
router.post('/:id/apply', authMiddleware, async (req, res) => {
  if (req.user.role !== 'participant') return res.status(403).json({ error: 'Sadece katılımcılar başvurabilir' });
  const { cover_letter } = req.body;
  try {
    const profile = await pool.query('SELECT id FROM participant_profiles WHERE user_id=$1', [req.user.id]);
    if (profile.rows.length === 0) return res.status(404).json({ error: 'Profil bulunamadı' });

    const result = await pool.query(
      'INSERT INTO applications (participant_id, job_id, cover_letter) VALUES ($1,$2,$3) RETURNING *',
      [profile.rows[0].id, req.params.id, cover_letter]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Bu ilana zaten başvurdunuz' });
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
