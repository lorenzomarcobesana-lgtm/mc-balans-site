const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Connessione al database online (Neon)
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

// Imposta lo schema public per tutte le query
pool.on('connect', (client) => {
    client.query('SET search_path TO public');
});

function getLang(req) {
    return req.query.lang || 'nl';
}

// ==========================================
// API: CONDIZIONI (legge TUTTO dalle traduzioni, fallback alle colonne)
// ==========================================
app.get('/api/conditions', async (req, res) => {
    const lang = getLang(req);
    try {
        const result = await pool.query(`
            SELECT c.id, c.slug,
                   COALESCE(t_name.value, c.slug) as name,
                   COALESCE(t_summary.value, c.summary) as summary,
                   COALESCE(t_recognition.value, c.recognition) as recognition,
                   COALESCE(t_red_flags.value, c.red_flags) as red_flags,
                   COALESCE(t_understanding.value, c.understanding) as understanding,
                   COALESCE(t_approach.value, c.approach) as approach,
                   COALESCE(t_assessment.value, c.assessment) as assessment,
                   cat.slug as category_slug
            FROM conditions c
            JOIN categories cat ON cat.id = c.category_id
            LEFT JOIN translations t_name ON t_name.condition_id = c.id AND t_name.field_name = 'name' AND t_name.locale = $1
            LEFT JOIN translations t_summary ON t_summary.condition_id = c.id AND t_summary.field_name = 'summary' AND t_summary.locale = $1
            LEFT JOIN translations t_recognition ON t_recognition.condition_id = c.id AND t_recognition.field_name = 'recognition' AND t_recognition.locale = $1
            LEFT JOIN translations t_red_flags ON t_red_flags.condition_id = c.id AND t_red_flags.field_name = 'red_flags' AND t_red_flags.locale = $1
            LEFT JOIN translations t_understanding ON t_understanding.condition_id = c.id AND t_understanding.field_name = 'understanding' AND t_understanding.locale = $1
            LEFT JOIN translations t_approach ON t_approach.condition_id = c.id AND t_approach.field_name = 'approach' AND t_approach.locale = $1
            LEFT JOIN translations t_assessment ON t_assessment.condition_id = c.id AND t_assessment.field_name = 'assessment' AND t_assessment.locale = $1
            WHERE c.status = 'published'
            ORDER BY c.id
        `, [lang]);
        res.json(result.rows);
    } catch (error) {
        console.error('Errore /api/conditions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/conditions/:slug', async (req, res) => {
    const { slug } = req.params;
    const lang = getLang(req);
    try {
        const conditionResult = await pool.query(`
            SELECT c.id, c.slug,
                   COALESCE(t_name.value, c.slug) as name,
                   COALESCE(t_summary.value, c.summary) as summary,
                   COALESCE(t_recognition.value, c.recognition) as recognition,
                   COALESCE(t_red_flags.value, c.red_flags) as red_flags,
                   COALESCE(t_understanding.value, c.understanding) as understanding,
                   COALESCE(t_approach.value, c.approach) as approach,
                   COALESCE(t_assessment.value, c.assessment) as assessment
            FROM conditions c
            LEFT JOIN translations t_name ON t_name.condition_id = c.id AND t_name.field_name = 'name' AND t_name.locale = $1
            LEFT JOIN translations t_summary ON t_summary.condition_id = c.id AND t_summary.field_name = 'summary' AND t_summary.locale = $1
            LEFT JOIN translations t_recognition ON t_recognition.condition_id = c.id AND t_recognition.field_name = 'recognition' AND t_recognition.locale = $1
            LEFT JOIN translations t_red_flags ON t_red_flags.condition_id = c.id AND t_red_flags.field_name = 'red_flags' AND t_red_flags.locale = $1
            LEFT JOIN translations t_understanding ON t_understanding.condition_id = c.id AND t_understanding.field_name = 'understanding' AND t_understanding.locale = $1
            LEFT JOIN translations t_approach ON t_approach.condition_id = c.id AND t_approach.field_name = 'approach' AND t_approach.locale = $1
            LEFT JOIN translations t_assessment ON t_assessment.condition_id = c.id AND t_assessment.field_name = 'assessment' AND t_assessment.locale = $1
            WHERE c.slug = $2 AND c.status = 'published'
        `, [lang, slug]);
        if (conditionResult.rows.length === 0) return res.status(404).json({ error: 'Condition not found' });
        const condition = conditionResult.rows[0];

        const treatments = await pool.query(`
            SELECT t.slug,
                   COALESCE(tt.value, t.slug) as name,
                   COALESCE(tt2.value, '') as summary
            FROM conditions c
            JOIN condition_treatments ct ON ct.condition_id = c.id
            JOIN treatments t ON t.id = ct.treatment_id
            LEFT JOIN translations tt ON tt.treatment_id = t.id AND tt.field_name = 'name' AND tt.locale = $1
            LEFT JOIN translations tt2 ON tt2.treatment_id = t.id AND tt2.field_name = 'summary' AND tt2.locale = $1
            WHERE c.slug = $2 ORDER BY ct.display_order
        `, [lang, slug]);

        const faqs = await pool.query(`
            SELECT f.slug, tq.value as question, ta.value as answer
            FROM conditions c
            JOIN condition_faqs cf ON cf.condition_id = c.id
            JOIN faqs f ON f.id = cf.faq_id
            LEFT JOIN translations tq ON tq.faq_id = f.id AND tq.field_name = 'question' AND tq.locale = $1
            LEFT JOIN translations ta ON ta.faq_id = f.id AND ta.field_name = 'answer' AND ta.locale = $1
            WHERE c.slug = $2 ORDER BY cf.display_order
        `, [lang, slug]);

        res.json({ condition, treatments: treatments.rows, faqs: faqs.rows });
    } catch (error) {
        console.error('Errore /api/conditions/:slug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// API: TRATTAMENTI
// ==========================================
app.get('/api/treatments', async (req, res) => {
    const lang = getLang(req);
    try {
        const result = await pool.query(`
            SELECT t.id, t.slug, t.duration,
                   COALESCE(tt.value, t.slug) as name,
                   COALESCE(tt2.value, '') as summary
            FROM treatments t
            LEFT JOIN translations tt ON tt.treatment_id = t.id AND tt.field_name = 'name' AND tt.locale = $1
            LEFT JOIN translations tt2 ON tt2.treatment_id = t.id AND tt2.field_name = 'summary' AND tt2.locale = $1
            WHERE t.status = 'published'
            ORDER BY t.id
        `, [lang]);
        res.json(result.rows);
    } catch (error) {
        console.error('Errore /api/treatments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/treatments/:slug', async (req, res) => {
    const { slug } = req.params;
    const lang = getLang(req);
    try {
        const treatmentResult = await pool.query(`
            SELECT t.id, t.slug, t.duration,
                   COALESCE(tt.value, t.slug) as name,
                   COALESCE(tt2.value, '') as summary,
                   COALESCE(tt3.value, '') as body
            FROM treatments t
            LEFT JOIN translations tt ON tt.treatment_id = t.id AND tt.field_name = 'name' AND tt.locale = $1
            LEFT JOIN translations tt2 ON tt2.treatment_id = t.id AND tt2.field_name = 'summary' AND tt2.locale = $1
            LEFT JOIN translations tt3 ON tt3.treatment_id = t.id AND tt3.field_name = 'body' AND tt3.locale = $1
            WHERE t.slug = $2 AND t.status = 'published'
        `, [lang, slug]);
        if (treatmentResult.rows.length === 0) return res.status(404).json({ error: 'Treatment not found' });
        const treatment = treatmentResult.rows[0];

        const conditions = await pool.query(`
            SELECT c.slug, COALESCE(tc.value, c.slug) as name
            FROM treatments t
            JOIN condition_treatments ct ON ct.treatment_id = t.id
            JOIN conditions c ON c.id = ct.condition_id
            LEFT JOIN translations tc ON tc.condition_id = c.id AND tc.field_name = 'name' AND tc.locale = $1
            WHERE t.slug = $2
        `, [lang, slug]);

        res.json({ treatment, conditions: conditions.rows });
    } catch (error) {
        console.error('Errore /api/treatments/:slug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// API: CATEGORIE
// ==========================================
app.get('/api/categories', async (req, res) => {
    const lang = getLang(req);
    try {
        const result = await pool.query(`
            SELECT c.slug, COALESCE(t.value, c.slug) as name
            FROM categories c
            LEFT JOIN translations t ON t.category_id = c.id AND t.field_name = 'name' AND t.locale = $1
            WHERE c.status = 'published'
            ORDER BY c.sort_order
        `, [lang]);
        res.json(result.rows);
    } catch (error) {
        console.error('Errore /api/categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// API: PRATICANTI & PREZZI
// ==========================================
app.get('/api/practitioners', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, email, roles, is_active FROM practitioners WHERE is_active = true ORDER BY id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/pricing', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pt.id, pt.tier_label, pt.amount, pt.currency,
                   CASE WHEN pt.condition_id IS NOT NULL THEN c.slug
                        WHEN pt.treatment_id IS NOT NULL THEN t.slug
                   END as entity_slug,
                   CASE WHEN pt.condition_id IS NOT NULL THEN 'condition'
                        WHEN pt.treatment_id IS NOT NULL THEN 'treatment'
                   END as entity_type
            FROM price_tiers pt
            LEFT JOIN conditions c ON c.id = pt.condition_id
            LEFT JOIN treatments t ON t.id = pt.treatment_id
            WHERE pt.show_on_pricing_page = true
            ORDER BY pt.amount
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// SERVE IL FRONTEND (TUTTE LE ROTTE)
// ==========================================
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'database-site.html'));
});

// ==========================================
// AVVIA IL SERVER
// ==========================================
app.listen(port, () => {
    console.log(`MC Balans website running on port ${port}`);
    console.log(`Database: Neon (online)`);
});
