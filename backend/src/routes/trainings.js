const express = require('express');
const pool = require('../db');

const router = express.Router();

// Tüm eğitimler (herkese açık)
router.get('/', async (req, res) => {
  const { category, level } = req.query;
  try {
    let conditions = ['is_active=true'];
    const params = [];
    if (category) { conditions.push(`category ILIKE $${params.length + 1}`); params.push(`%${category}%`); }
    if (level) { conditions.push(`level=$${params.length + 1}`); params.push(level); }

    const result = await pool.query(
      `SELECT * FROM trainings WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
