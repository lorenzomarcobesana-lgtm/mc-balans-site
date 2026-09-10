const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

app.get('/api/categories', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT c.slug, COALESCE(t.value, c.name, c.slug) AS name
      FROM categories c
      LEFT JOIN translations t ON t.category_id = c.id AND t.field_name = 'name' AND t.locale = $1
      WHERE c.status = 'published'
      ORDER BY c.sort_order
    `, [lang]);
    res.json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/conditions', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT c.id, c.slug, c.summary, c.recognition, c.red_flags, c.understanding, c.approach, c.assessment,
             c.expectations, c.insurance, c.pricing, c.cta,
             cat.slug AS category_slug,
             COALESCE(t.value, c.name, c.slug) AS name
      FROM conditions c
      JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN translations t ON t.condition_id = c.id AND t.field_name = 'name' AND t.locale = $1
      WHERE c.status = 'published'
      ORDER BY c.id
    `, [lang]);
    res.json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/conditions/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = req.query.lang || 'en';
  try {
    const conditionResult = await pool.query(`
      SELECT c.*,
             COALESCE(t_name.value, c.name, c.slug) AS name,
             COALESCE(t_summary.value, c.summary) AS summary,
             COALESCE(t_recognition.value, c.recognition) AS recognition,
             COALESCE(t_redflags.value, c.red_flags) AS red_flags,
             COALESCE(t_understanding.value, c.understanding) AS understanding,
             COALESCE(t_approach.value, c.approach) AS approach,
             COALESCE(t_assessment.value, c.assessment) AS assessment,
             COALESCE(t_expectations.value, c.expectations) AS expectations,
             COALESCE(t_insurance.value, c.insurance) AS insurance,
             COALESCE(t_pricing.value, c.pricing) AS pricing,
             COALESCE(t_cta.value, c.cta) AS cta
      FROM conditions c
      LEFT JOIN translations t_name        ON t_name.condition_id = c.id AND t_name.field_name = 'name' AND t_name.locale = $2
      LEFT JOIN translations t_summary     ON t_summary.condition_id = c.id AND t_summary.field_name = 'summary' AND t_summary.locale = $2
      LEFT JOIN translations t_recognition ON t_recognition.condition_id = c.id AND t_recognition.field_name = 'recognition' AND t_recognition.locale = $2
      LEFT JOIN translations t_redflags    ON t_redflags.condition_id = c.id AND t_redflags.field_name = 'red_flags' AND t_redflags.locale = $2
      LEFT JOIN translations t_understanding ON t_understanding.condition_id = c.id AND t_understanding.field_name = 'understanding' AND t_understanding.locale = $2
      LEFT JOIN translations t_approach    ON t_approach.condition_id = c.id AND t_approach.field_name = 'approach' AND t_approach.locale = $2
      LEFT JOIN translations t_assessment  ON t_assessment.condition_id = c.id AND t_assessment.field_name = 'assessment' AND t_assessment.locale = $2
      LEFT JOIN translations t_expectations ON t_expectations.condition_id = c.id AND t_expectations.field_name = 'expectations' AND t_expectations.locale = $2
      LEFT JOIN translations t_insurance   ON t_insurance.condition_id = c.id AND t_insurance.field_name = 'insurance' AND t_insurance.locale = $2
      LEFT JOIN translations t_pricing     ON t_pricing.condition_id = c.id AND t_pricing.field_name = 'pricing' AND t_pricing.locale = $2
      LEFT JOIN translations t_cta         ON t_cta.condition_id = c.id AND t_cta.field_name = 'cta' AND t_cta.locale = $2
      WHERE c.slug = $1 AND c.status = 'published'
    `, [slug, lang]);
    if (conditionResult.rows.length === 0) return res.status(404).json({ error: 'Condition not found' });
    const condition = conditionResult.rows[0];

    const treatments = await pool.query(`
      SELECT tr.slug,
             COALESCE(tt_name.value, tr.name, tr.slug) AS name,
             COALESCE(tt_summary.value, '') AS summary,
             tr.duration
      FROM conditions c
      JOIN condition_treatments ct ON ct.condition_id = c.id
      JOIN treatments tr ON tr.id = ct.treatment_id
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = tr.id AND tt_name.field_name = 'name' AND tt_name.locale = $2
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = tr.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $2
      WHERE c.slug = $1
      ORDER BY ct.display_order
    `, [slug, lang]);

    const practitioners = await pool.query(`
      SELECT DISTINCT p.id, p.email, p.roles, p.credentials, p.languages_spoken, p.photo_url, p.quote, p.experience_years
      FROM practitioners p
      JOIN practitioner_treatments pt ON pt.practitioner_id = p.id
      JOIN condition_treatments ct ON ct.treatment_id = pt.treatment_id
      JOIN conditions c ON c.id = ct.condition_id
      WHERE c.slug = $1
    `, [slug]);

    const faqs = await pool.query(`
      SELECT f.slug, COALESCE(tq.value, '') AS question, COALESCE(ta.value, '') AS answer
      FROM conditions c
      JOIN condition_faqs cf ON cf.condition_id = c.id
      JOIN faqs f ON f.id = cf.faq_id
      LEFT JOIN translations tq ON tq.faq_id = f.id AND tq.field_name = 'question' AND tq.locale = $2
      LEFT JOIN translations ta ON ta.faq_id = f.id AND ta.field_name = 'answer' AND ta.locale = $2
      WHERE c.slug = $1 ORDER BY cf.display_order
    `, [slug, lang]);

    res.json({ condition, treatments: treatments.rows, practitioners: practitioners.rows, faqs: faqs.rows });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/treatments', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT t.slug, t.duration,
             COALESCE(tt_name.value, t.name, t.slug) AS name,
             COALESCE(tt_summary.value, '') AS summary
      FROM treatments t
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $1
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $1
      WHERE t.status = 'published'
      ORDER BY t.id
    `, [lang]);
    res.json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/treatments/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = req.query.lang || 'en';
  try {
    const treatmentResult = await pool.query(`
      SELECT t.*,
             COALESCE(tt_name.value, t.name, t.slug) AS name,
             COALESCE(tt_summary.value, '') AS summary,
             COALESCE(tt_body.value, '') AS body,
             COALESCE(tt_intake.value, '') AS intake,
             COALESCE(tt_aftercare.value, '') AS aftercare,
             COALESCE(tt_insurance.value, '') AS insurance
      FROM treatments t
      LEFT JOIN translations tt_name       ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $2
      LEFT JOIN translations tt_summary    ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $2
      LEFT JOIN translations tt_body       ON tt_body.treatment_id = t.id AND tt_body.field_name = 'body' AND tt_body.locale = $2
      LEFT JOIN translations tt_intake     ON tt_intake.treatment_id = t.id AND tt_intake.field_name = 'intake' AND tt_intake.locale = $2
      LEFT JOIN translations tt_aftercare  ON tt_aftercare.treatment_id = t.id AND tt_aftercare.field_name = 'aftercare' AND tt_aftercare.locale = $2
      LEFT JOIN translations tt_insurance  ON tt_insurance.treatment_id = t.id AND tt_insurance.field_name = 'insurance' AND tt_insurance.locale = $2
      WHERE t.slug = $1 AND t.status = 'published'
    `, [slug, lang]);
    if (treatmentResult.rows.length === 0) return res.status(404).json({ error: 'Treatment not found' });
    const treatment = treatmentResult.rows[0];

    const conditions = await pool.query(`
      SELECT c.slug, COALESCE(tc.value, c.name, c.slug) AS name
      FROM treatments t
      JOIN condition_treatments ct ON ct.treatment_id = t.id
      JOIN conditions c ON c.id = ct.condition_id
      LEFT JOIN translations tc ON tc.condition_id = c.id AND tc.field_name = 'name' AND tc.locale = $2
      WHERE t.slug = $1
    `, [slug, lang]);

    const combines = await pool.query(`
      SELECT t2.slug, COALESCE(tt2.value, t2.name, t2.slug) AS name
      FROM treatment_combines_with tcw
      JOIN treatments t2 ON t2.id = tcw.treatment_id_b
      JOIN treatments t1 ON t1.id = tcw.treatment_id_a
      LEFT JOIN translations tt2 ON tt2.treatment_id = t2.id AND tt2.field_name = 'name' AND tt2.locale = $2
      WHERE t1.slug = $1
      UNION ALL
      SELECT t1.slug, COALESCE(tt1.value, t1.name, t1.slug) AS name
      FROM treatment_combines_with tcw
      JOIN treatments t1 ON t1.id = tcw.treatment_id_a
      JOIN treatments t2 ON t2.id = tcw.treatment_id_b
      LEFT JOIN translations tt1 ON tt1.treatment_id = t1.id AND tt1.field_name = 'name' AND tt1.locale = $2
      WHERE t2.slug = $1
    `, [slug, lang]);

    const practitioners = await pool.query(`
      SELECT DISTINCT p.id, p.email, p.roles, p.credentials, p.languages_spoken, p.photo_url, p.quote, p.experience_years
      FROM practitioners p
      JOIN practitioner_treatments pt ON pt.practitioner_id = p.id
      JOIN treatments t ON t.id = pt.treatment_id
      WHERE t.slug = $1
    `, [slug]);

    const pricing = await pool.query(`
      SELECT pt.tier_label, pt.amount, pt.currency
      FROM price_tiers pt
      JOIN treatments t ON t.id = pt.treatment_id
      WHERE t.slug = $1 AND pt.show_on_pricing_page = true
    `, [slug]);

    const faqs = await pool.query(`
      SELECT f.slug, COALESCE(tq.value, '') AS question, COALESCE(ta.value, '') AS answer
      FROM treatments t
      JOIN treatment_faqs tf ON tf.treatment_id = t.id
      JOIN faqs f ON f.id = tf.faq_id
      LEFT JOIN translations tq ON tq.faq_id = f.id AND tq.field_name = 'question' AND tq.locale = $2
      LEFT JOIN translations ta ON ta.faq_id = f.id AND ta.field_name = 'answer' AND ta.locale = $2
      WHERE t.slug = $1 ORDER BY tf.display_order
    `, [slug, lang]);

    res.json({ treatment, conditions: conditions.rows, combines: combines.rows, practitioners: practitioners.rows, pricing: pricing.rows, faqs: faqs.rows });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/practitioners', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, email, roles, credentials, languages_spoken, photo_url, quote, experience_years, is_active FROM practitioners WHERE is_active = true ORDER BY id`);
    res.json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/pricing', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pt.id, pt.tier_label, pt.amount, pt.currency,
             COALESCE(c.slug, t.slug) AS entity_slug,
             CASE WHEN pt.condition_id IS NOT NULL THEN 'condition' WHEN pt.treatment_id IS NOT NULL THEN 'treatment' END AS entity_type
      FROM price_tiers pt
      LEFT JOIN conditions c ON c.id = pt.condition_id
      LEFT JOIN treatments t ON t.id = pt.treatment_id
      WHERE pt.show_on_pricing_page = true
      ORDER BY pt.amount
    `);
    res.json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('*', (req, res) => { res.sendFile(__dirname + '/public/database-site.html'); });

app.listen(port, () => { console.log(`MC Balans running on port ${port}`); });
