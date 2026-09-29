const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

module.exports = function(app, pool) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-me-please',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
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

  router.get('/api/conditions', requireAdmin, async (req, res) => {
    try {
      const r = await pool.query('SELECT id, name, slug, status FROM conditions ORDER BY id');
      res.json(r.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/condition/:slug', requireAdmin, async (req, res) => {
    try {
      const r = await pool.query('SELECT * FROM conditions WHERE slug = $1', [req.params.slug]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(r.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/condition/:slug', requireAdmin, async (req, res) => {
    const slug = req.params.slug;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const current = await client.query('SELECT * FROM conditions WHERE slug = $1', [slug]);
      if (!current.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Not found' });
      }

      const colr = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'conditions'
          AND column_name NOT IN ('id', 'created_at', 'updated_at')
      `);
      const types = {};
      for (const r of colr.rows) types[r.column_name] = r.data_type;

      const TEXT_TYPES = new Set(['text', 'character varying', 'character']);
      const fields = Object.keys(req.body).filter(k => types[k] !== undefined);
      if (!fields.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'No editable fields provided' });
      }

      await client.query(
        'INSERT INTO condition_history (condition_id, snapshot) VALUES ($1, $2)',
        [current.rows[0].id, JSON.stringify(current.rows[0])]
      );

      const setClauses = fields.map((k, i) => `"${k}" = $${i + 1}`);
      const values = fields.map(k => {
        const v = req.body[k];
        if (v === '' && !TEXT_TYPES.has(types[k])) return null;
        return v;
      });
      values.push(slug);

      await client.query(
        `UPDATE conditions SET ${setClauses.join(', ')}, updated_at = NOW() WHERE slug = $${values.length}`,
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
