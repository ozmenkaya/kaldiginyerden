const express = require('express');
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// ============ FORM TEMPLATE CRUD (Admin) ============

// Tüm form şablonlarını getir
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const { form_type } = req.query;
    let query = 'SELECT * FROM form_templates';
    const params = [];
    if (form_type) {
      query += ' WHERE form_type=$1';
      params.push(form_type);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// Tek sablon + alanlari getir
router.get('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const template = await pool.query('SELECT * FROM form_templates WHERE id=$1', [req.params.id]);
    if (!template.rows.length) return res.status(404).json({ error: 'Form bulunamadi' });

    const fields = await pool.query(
      'SELECT * FROM form_fields WHERE template_id=$1 ORDER BY field_order ASC',
      [req.params.id]
    );
    res.json({ ...template.rows[0], fields: fields.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// Yeni form sablonu olustur
router.post('/templates', authMiddleware, requireRole('admin'), async (req, res) => {
  const { title, description, form_type, fields } = req.body;
  if (!title || !form_type) return res.status(400).json({ error: 'Baslik ve form tipi zorunludur' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tpl = await client.query(
      'INSERT INTO form_templates (title, description, form_type, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, description, form_type, req.user.id]
    );
    const templateId = tpl.rows[0].id;

    if (fields && fields.length > 0) {
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        await client.query(
          `INSERT INTO form_fields (template_id, field_key, label, field_type, options, is_required, is_matchable, match_weight, field_order, placeholder, validation_rules)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [templateId, f.field_key, f.label, f.field_type, JSON.stringify(f.options || null),
           f.is_required || false, f.is_matchable || false, f.match_weight || 1.0,
           i, f.placeholder || null, JSON.stringify(f.validation_rules || null)]
        );
      }
    }

    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM form_fields WHERE template_id=$1 ORDER BY field_order', [templateId]);
    res.status(201).json({ ...tpl.rows[0], fields: result.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  } finally {
    client.release();
  }
});

// Form sablonu guncelle
router.put('/templates/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { title, description, form_type, is_active, fields } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE form_templates SET title=$1, description=$2, form_type=$3, is_active=$4, updated_at=NOW() WHERE id=$5',
      [title, description, form_type, is_active, req.params.id]
    );

    // Mevcut alanlari sil ve yeniden olustur
    await client.query('DELETE FROM form_fields WHERE template_id=$1', [req.params.id]);

    if (fields && fields.length > 0) {
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        await client.query(
          `INSERT INTO form_fields (template_id, field_key, label, field_type, options, is_required, is_matchable, match_weight, field_order, placeholder, validation_rules)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [req.params.id, f.field_key, f.label, f.field_type, JSON.stringify(f.options || null),
           f.is_required || false, f.is_matchable || false, f.match_weight || 1.0,
           i, f.placeholder || null, JSON.stringify(f.validation_rules || null)]
        );
      }
    }

    await client.query('COMMIT');
    const result = await pool.query(
      'SELECT * FROM form_templates WHERE id=$1', [req.params.id]
    );
    const fieldsResult = await pool.query(
      'SELECT * FROM form_fields WHERE template_id=$1 ORDER BY field_order', [req.params.id]
    );
    res.json({ ...result.rows[0], fields: fieldsResult.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  } finally {
    client.release();
  }
});

// Form sablonu sil
router.delete('/templates/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM form_templates WHERE id=$1', [req.params.id]);
    res.json({ message: 'Form sablonu silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// Form sablonu aktif/pasif
router.patch('/templates/:id/toggle', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE form_templates SET is_active = NOT is_active, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// ============ FORM RESPONSES ============

// Kullanici form yaniti gonder
router.post('/responses', authMiddleware, async (req, res) => {
  const { template_id, response_data } = req.body;
  if (!template_id || !response_data) return res.status(400).json({ error: 'Eksik veri' });
  try {
    const result = await pool.query(
      `INSERT INTO form_responses (template_id, user_id, response_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (template_id, user_id) DO UPDATE SET response_data=$3, updated_at=NOW()
       RETURNING *`,
      [template_id, req.user.id, JSON.stringify(response_data)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// Kullanicinin kendi yanitlarini getir
router.get('/responses/my', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fr.*, ft.title, ft.form_type FROM form_responses fr
       JOIN form_templates ft ON ft.id = fr.template_id
       WHERE fr.user_id=$1 ORDER BY fr.submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// Admin: tum yanitlari getir
router.get('/responses', authMiddleware, requireRole('admin'), async (req, res) => {
  const { template_id } = req.query;
  try {
    let query = `SELECT fr.*, ft.title as form_title, ft.form_type, u.email
                 FROM form_responses fr
                 JOIN form_templates ft ON ft.id = fr.template_id
                 JOIN users u ON u.id = fr.user_id`;
    const params = [];
    if (template_id) {
      query += ' WHERE fr.template_id=$1';
      params.push(template_id);
    }
    query += ' ORDER BY fr.submitted_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// ============ MATCHING ALGORITHM ============

// Eslestirme calistir
router.post('/match', authMiddleware, requireRole('admin'), async (req, res) => {
  const { company_template_id, participant_template_id } = req.body;
  if (!company_template_id || !participant_template_id) {
    return res.status(400).json({ error: 'Sirket ve katilimci form sablonu secilmeli' });
  }

  try {
    // Sirket formunun eslesilebilir alanlarini getir
    const companyFields = await pool.query(
      'SELECT * FROM form_fields WHERE template_id=$1 AND is_matchable=true ORDER BY field_order',
      [company_template_id]
    );
    // Katilimci formunun eslesilebilir alanlarini getir
    const participantFields = await pool.query(
      'SELECT * FROM form_fields WHERE template_id=$1 AND is_matchable=true ORDER BY field_order',
      [participant_template_id]
    );

    // Eslesilebilir alanlari key'e gore eslesme
    const matchableKeys = new Set();
    const companyFieldMap = {};
    const participantFieldMap = {};

    companyFields.rows.forEach(f => {
      companyFieldMap[f.field_key] = f;
      matchableKeys.add(f.field_key);
    });
    participantFields.rows.forEach(f => {
      participantFieldMap[f.field_key] = f;
      matchableKeys.add(f.field_key);
    });

    // Tum sirket yanitlarini getir
    const companyResponses = await pool.query(
      `SELECT fr.*, u.email as company_email FROM form_responses fr
       JOIN users u ON u.id = fr.user_id
       WHERE fr.template_id=$1`,
      [company_template_id]
    );

    // Tum katilimci yanitlarini getir
    const participantResponses = await pool.query(
      `SELECT fr.*, u.email as participant_email FROM form_responses fr
       JOIN users u ON u.id = fr.user_id
       WHERE fr.template_id=$1`,
      [participant_template_id]
    );

    const results = [];

    for (const compResp of companyResponses.rows) {
      for (const partResp of participantResponses.rows) {
        const fieldScores = {};
        let totalWeight = 0;
        let weightedScore = 0;

        for (const key of matchableKeys) {
          const cField = companyFieldMap[key];
          const pField = participantFieldMap[key];
          if (!cField || !pField) continue;

          const cVal = compResp.response_data[key];
          const pVal = partResp.response_data[key];
          const weight = Math.max(cField.match_weight || 1, pField.match_weight || 1);

          let score = 0;

          if (cVal === undefined || pVal === undefined || cVal === null || pVal === null) {
            score = 0;
          } else if (cField.field_type === 'multiselect' || pField.field_type === 'multiselect') {
            const cArr = Array.isArray(cVal) ? cVal : [cVal];
            const pArr = Array.isArray(pVal) ? pVal : [pVal];
            const intersection = cArr.filter(v => pArr.includes(v));
            const union = [...new Set([...cArr, ...pArr])];
            score = union.length > 0 ? (intersection.length / union.length) * 100 : 0;
          } else if (cField.field_type === 'number' || cField.field_type === 'range') {
            const cNum = parseFloat(cVal);
            const pNum = parseFloat(pVal);
            if (!isNaN(cNum) && !isNaN(pNum)) {
              const maxVal = Math.max(Math.abs(cNum), Math.abs(pNum), 1);
              score = Math.max(0, 100 - (Math.abs(cNum - pNum) / maxVal) * 100);
            }
          } else if (cField.field_type === 'checkbox') {
            score = (String(cVal) === String(pVal)) ? 100 : 0;
          } else {
            const cStr = String(cVal).toLowerCase().trim();
            const pStr = String(pVal).toLowerCase().trim();
            if (cStr === pStr) {
              score = 100;
            } else if (cStr.includes(pStr) || pStr.includes(cStr)) {
              score = 70;
            } else {
              const cWords = cStr.split(/[\s,;]+/).filter(Boolean);
              const pWords = pStr.split(/[\s,;]+/).filter(Boolean);
              const matched = cWords.filter(w => pWords.some(pw => pw.includes(w) || w.includes(pw)));
              score = cWords.length > 0 ? (matched.length / cWords.length) * 60 : 0;
            }
          }

          fieldScores[key] = { score: Math.round(score * 100) / 100, weight, cVal, pVal };
          totalWeight += weight;
          weightedScore += score * weight;
        }

        const totalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) / 100 : 0;

        // Sonucu kaydet
        await pool.query(
          `INSERT INTO match_results (company_response_id, participant_response_id, total_score, field_scores)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (company_response_id, participant_response_id) DO UPDATE SET total_score=$3, field_scores=$4, created_at=NOW()`,
          [compResp.id, partResp.id, totalScore, JSON.stringify(fieldScores)]
        );

        results.push({
          company_email: compResp.company_email,
          participant_email: partResp.participant_email,
          total_score: totalScore,
          field_scores: fieldScores,
        });
      }
    }

    results.sort((a, b) => b.total_score - a.total_score);
    res.json({ total_matches: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

// Eslestirme sonuclarini getir
router.get('/match/results', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*,
              cr.response_data as company_data, cu.email as company_email,
              pr.response_data as participant_data, pu.email as participant_email
       FROM match_results mr
       JOIN form_responses cr ON cr.id = mr.company_response_id
       JOIN users cu ON cu.id = cr.user_id
       JOIN form_responses pr ON pr.id = mr.participant_response_id
       JOIN users pu ON pu.id = pr.user_id
       ORDER BY mr.total_score DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
});

module.exports = router;
