const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const TABLES = {
  conditions: {
    table: 'conditions',
    keyColumn: 'slug',
    label: 'Conditions',
    order: 'id',
    listColumns: ['id','slug','name'],
    hide: ['id','slug','created_at','updated_at','category_id','author_id','medical_reviewer_id','search_vector','ai_summary']
  },
  treatments: {
    table: 'treatments',
    keyColumn: 'slug',
    label: 'Treatments',
    order: 'sort_order, id',
    listColumns: ['id','slug','name'],
    hide: ['id','slug','created_at','updated_at','parent_treatment_id','intake_text_block_id','treatment_selection_approach_id','insurance_coverage_block_id','author_id','medical_reviewer_id','search_vector']
  },
  shared_content_blocks: {
    table: 'shared_content_blocks',
    keyColumn: 'id',
    label: 'Shared blocks',
    order: 'id',
    listColumns: ['id','value'],
    hide: ['id','created_at','updated_at','block_type']
  },
  ui_strings: {
    table: 'ui_strings',
    keyColumn: 'id',
    label: 'UI strings',
    order: 'string_key, locale',
    listColumns: ['id','string_key','locale','value'],
    hide: ['id','updated_at','string_key','locale']
  }
};

const SKIP_TYPES = new Set(['tsvector']);

module.exports = function(app, pool) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS edit_history (
      id SERIAL PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      snapshot JSONB NOT NULL,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `).then(() => pool.query(`
    CREATE INDEX IF NOT EXISTS edit_history_lookup
    ON edit_history (entity_type, entity_id, saved_at DESC);
  `)).then(() => console.log('edit_history ready'))
    .catch(e => console.error('edit_history init failed:', e));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-me-please',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }
  }));

  const router = express.Router();

  function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Not authenticated' });
    res.redirect('/admin/login');
  }

  router.get('/login', (req, res) => res.send(loginPage()));

  router.post('/login', express.urlencoded({ extended: false }), (req, res) => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) return res.status(500).send('ADMIN_PASSWORD_HASH not set');
    if (!bcrypt.compareSync(req.body.password || '', hash)) {
      return res.status(401).send(loginPage('Wrong password.'));
    }
    req.session.isAdmin = true;
    res.redirect('/admin');
  });

  router.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/admin/login');
  });

  router.get('/', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  });

  router.get('/api/tables', requireAdmin, (req, res) => {
    res.json(Object.entries(TABLES).map(([key, cfg]) => ({ key, label: cfg.label })));
  });

  router.get('/api/list/:tableKey', requireAdmin, async (req, res) => {
    const cfg = TABLES[req.params.tableKey];
    if (!cfg) return res.status(400).json({ error: 'Unknown table' });
    try {
      const r = await pool.query(`SELECT ${cfg.listColumns.join(', ')} FROM ${cfg.table} ORDER BY ${cfg.order}`);
      res.json(r.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/row/:tableKey/:key', requireAdmin, async (req, res) => {
    const cfg = TABLES[req.params.tableKey];
    if (!cfg) return res.status(400).json({ error: 'Unknown table' });
    try {
      const r = await pool.query(`SELECT * FROM ${cfg.table} WHERE ${cfg.keyColumn} = $1`, [req.params.key]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(r.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/row/:tableKey/:key', requireAdmin, async (req, res) => {
    const cfg = TABLES[req.params.tableKey];
    if (!cfg) return res.status(400).json({ error: 'Unknown table' });
    const key = req.params.key;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const current = await client.query(`SELECT * FROM ${cfg.table} WHERE ${cfg.keyColumn} = $1 FOR UPDATE`, [key]);
      if (!current.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }

      const colr = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [cfg.table]);
      const types = {};
      for (const r of colr.rows) types[r.column_name] = r.data_type;

      const TEXT_TYPES = new Set(['text','character varying','character']);
      const fields = Object.keys(req.body).filter(k =>
        types[k] !== undefined && !cfg.hide.includes(k) && !SKIP_TYPES.has(types[k])
      );
      if (!fields.length) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'No editable fields' }); }

      await client.query(
        'INSERT INTO edit_history (entity_type, entity_id, snapshot) VALUES ($1, $2, $3)',
        [cfg.table, String(current.rows[0].id), JSON.stringify(current.rows[0])]
      );

      const setClauses = fields.map((k, i) => `"${k}" = $${i + 1}`);
      const values = fields.map(k => {
        const v = req.body[k];
        if (v === '' && !TEXT_TYPES.has(types[k])) return null;
        return v;
      });
      values.push(key);

      await client.query(
        `UPDATE ${cfg.table} SET ${setClauses.join(', ')}, updated_at = NOW() WHERE ${cfg.keyColumn} = $${values.length}`,
        values
      );
      await client.query('COMMIT');
      res.json({ ok: true, saved: fields });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(e);
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  router.get('/api/meta', requireAdmin, async (req, res) => {
    try {
      const cats = await pool.query('SELECT id, name, slug FROM categories ORDER BY id');
      const pracs = await pool.query('SELECT id, COALESCE(display_role, roles) AS role FROM practitioners ORDER BY id');
      res.json({ categories: cats.rows, practitioners: pracs.rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/conditions/create', requireAdmin, async (req, res) => {
    const { name, slug, category_id, author_id, medical_reviewer_id, status } = req.body || {};
    if (!name || !slug || !category_id || !author_id) {
      return res.status(400).json({ error: 'name, slug, category_id and author_id are required' });
    }
    const cleanSlug = String(slug).toLowerCase().trim()
      .replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
    if (!cleanSlug) return res.status(400).json({ error: 'slug contains no valid characters' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const dup = await client.query('SELECT 1 FROM conditions WHERE slug = $1', [cleanSlug]);
      if (dup.rows.length) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'A condition with this slug already exists' }); }

      const next = await client.query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 6) AS INTEGER)), 0) + 1 AS n FROM conditions WHERE id ~ '^COND-[0-9]+$'"
      );
      const newId = 'COND-' + String(next.rows[0].n).padStart(4, '0');

      await client.query(`
        INSERT INTO conditions (id, slug, name, category_id, author_id, medical_reviewer_id, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [newId, cleanSlug, name, category_id, author_id, medical_reviewer_id || author_id, status || 'draft']);

      await client.query('COMMIT');
      res.json({ ok: true, id: newId, slug: cleanSlug });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(e);
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.use('/admin', router);
};

function loginPage(error) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Admin login</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;max-width:340px;margin:80px auto;padding:24px;color:#1a1a1a}
input,button{font-size:15px;padding:10px;width:100%;box-sizing:border-box;margin:8px 0;border:1px solid #ccc;border-radius:4px}
button{background:#1a1a1a;color:#fff;border:none;cursor:pointer}
.error{color:#b00;font-size:14px;margin:8px 0}
</style></head>
<body>
<h1>Admin login</h1>
${error ? '<p class="error">' + error + '</p>' : ''}
<form method="POST" action="/admin/login">
<input type="password" name="password" placeholder="Password" autofocus required>
<button type="submit">Log in</button>
</form>
</body></html>`;
}
