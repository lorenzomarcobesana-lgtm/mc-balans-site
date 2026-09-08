const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3002;

app.use(express.json());

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'mc_balans',
    user: 'lorenzomarcobesana',
    password: '',
});

// API
app.get('/api/conditions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.slug, c.summary, c.recognition, c.red_flags, c.understanding, c.approach, c.assessment,
                   cat.slug as category_slug, COALESCE(t.value, c.slug) as name
            FROM conditions c
            JOIN categories cat ON cat.id = c.category_id
            LEFT JOIN translations t ON t.condition_id = c.id AND t.field_name = 'name' AND t.locale = 'nl'
            WHERE c.status = 'published'
            ORDER BY c.id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/conditions/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const conditionResult = await pool.query(`
            SELECT c.*, COALESCE(t.value, c.slug) as name
            FROM conditions c
            LEFT JOIN translations t ON t.condition_id = c.id AND t.field_name = 'name' AND t.locale = 'nl'
            WHERE c.slug = $1 AND c.status = 'published'
        `, [slug]);
        if (conditionResult.rows.length === 0) return res.status(404).json({ error: 'Condition not found' });
        const condition = conditionResult.rows[0];

        const treatments = await pool.query(`
            SELECT t.slug, COALESCE(tt.value, t.slug) as name, COALESCE(tt2.value, '') as summary
            FROM conditions c
            JOIN condition_treatments ct ON ct.condition_id = c.id
            JOIN treatments t ON t.id = ct.treatment_id
            LEFT JOIN translations tt ON tt.treatment_id = t.id AND tt.field_name = 'name' AND tt.locale = 'nl'
            LEFT JOIN translations tt2 ON tt2.treatment_id = t.id AND tt2.field_name = 'summary' AND tt2.locale = 'nl'
            WHERE c.slug = $1 ORDER BY ct.display_order
        `, [slug]);

        const faqs = await pool.query(`
            SELECT f.slug, tq.value as question, ta.value as answer
            FROM conditions c
            JOIN condition_faqs cf ON cf.condition_id = c.id
            JOIN faqs f ON f.id = cf.faq_id
            LEFT JOIN translations tq ON tq.faq_id = f.id AND tq.field_name = 'question' AND tq.locale = 'nl'
            LEFT JOIN translations ta ON ta.faq_id = f.id AND ta.field_name = 'answer' AND ta.locale = 'nl'
            WHERE c.slug = $1 ORDER BY cf.display_order
        `, [slug]);

        res.json({ condition, treatments: treatments.rows, faqs: faqs.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/treatments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.slug, t.duration, COALESCE(tt.value, t.slug) as name, COALESCE(tt2.value, '') as summary
            FROM treatments t
            LEFT JOIN translations tt ON tt.treatment_id = t.id AND tt.field_name = 'name' AND tt.locale = 'nl'
            LEFT JOIN translations tt2 ON tt2.treatment_id = t.id AND tt2.field_name = 'summary' AND tt2.locale = 'nl'
            WHERE t.status = 'published'
            ORDER BY t.id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.slug, COALESCE(t.value, c.slug) as name
            FROM categories c
            LEFT JOIN translations t ON t.category_id = c.id AND t.field_name = 'name' AND t.locale = 'nl'
            WHERE c.status = 'published'
            ORDER BY c.sort_order
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Frontend (percorso del file esistente)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Current_MCB.html'));
});

app.listen(port, () => {
    console.log(`MC Balans (DB) running on http://localhost:${port}`);
});
