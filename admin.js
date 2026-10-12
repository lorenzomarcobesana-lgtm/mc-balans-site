const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const PgStore = require('connect-pg-simple')(session);
const multer = require('multer');
const sharp = require('sharp');
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
  },
  practitioners: {
    table: 'practitioners',
    keyColumn: 'id',
    label: 'Practitioners',
    order: 'id',
    listColumns: ['id','display_role','email'],
    hide: ['id','created_at','updated_at','roles','is_active']
  }
};

const TRANSLATABLE = {
  conditions: {
    table: 'conditions',
    keyColumn: 'slug',
    fkColumn: 'condition_id',
    label: 'Condition',
    fields: ['name','summary','recognition','red_flags','understanding','approach','assessment','expectations','insurance','pricing']
  },
  treatments: {
    table: 'treatments',
    keyColumn: 'slug',
    fkColumn: 'treatment_id',
    label: 'Treatment',
    fields: ['name','summary','body','intake','aftercare','insurance','treatment_selection_approach']
  },
  shared_content_blocks: {
    table: 'shared_content_blocks',
    keyColumn: 'id',
    fkColumn: 'shared_block_id',
    label: 'Shared block',
    fields: ['value']
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
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'change-me-please',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto', maxAge: 7 * 24 * 60 * 60 * 1000 }
  }));

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts. Try again in 15 minutes.'
  });

  const router = express.Router();

  function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Not authenticated' });
    res.redirect('/admin/login');
  }

  router.get('/login', (req, res) => res.send(loginPage()));

  router.post('/login', loginLimiter, express.urlencoded({ extended: false }), (req, res) => {
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
      const pracs = await pool.query('SELECT id, display_role AS role FROM practitioners ORDER BY id');
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

  router.post('/api/treatments/create', requireAdmin, async (req, res) => {
    const { name, slug, author_id, medical_reviewer_id, status, duration, parent_treatment_id } = req.body || {};
    if (!name || !slug || !author_id) {
      return res.status(400).json({ error: 'name, slug and author_id are required' });
    }
    const cleanSlug = String(slug).toLowerCase().trim()
      .replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
    if (!cleanSlug) return res.status(400).json({ error: 'slug contains no valid characters' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const dup = await client.query('SELECT 1 FROM treatments WHERE slug = $1', [cleanSlug]);
      if (dup.rows.length) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'A treatment with this slug already exists' }); }

      const next = await client.query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 7) AS INTEGER)), 0) + 1 AS n FROM treatments WHERE id ~ '^TREAT-[0-9]+$'"
      );
      const newId = 'TREAT-' + String(next.rows[0].n).padStart(4, '0');

      const nextOrder = await client.query("SELECT COALESCE(MAX(sort_order), 0) + 10 AS n FROM treatments");

      await client.query(`
        INSERT INTO treatments (id, slug, name, author_id, medical_reviewer_id, status, duration, parent_treatment_id, sort_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [newId, cleanSlug, name, author_id, medical_reviewer_id || author_id, status || 'draft', duration || null, parent_treatment_id || null, nextOrder.rows[0].n]);

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

  router.get('/api/treatments-list', requireAdmin, async (req, res) => {
    try {
      const r = await pool.query("SELECT id, name, slug FROM treatments ORDER BY name");
      res.json(r.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/translation-targets', requireAdmin, (req, res) => {
    res.json(Object.entries(TRANSLATABLE).map(([key, cfg]) => ({ key, label: cfg.label })));
  });

  router.get('/api/translations/:tableKey/:key', requireAdmin, async (req, res) => {
    const cfg = TRANSLATABLE[req.params.tableKey];
    if (!cfg) return res.status(400).json({ error: 'Unknown table' });
    try {
      const base = await pool.query(`SELECT * FROM ${cfg.table} WHERE ${cfg.keyColumn} = $1`, [req.params.key]);
      if (!base.rows[0]) return res.status(404).json({ error: 'Not found' });
      const row = base.rows[0];

      const trans = await pool.query(
        `SELECT field_name, locale::text AS locale, value FROM translations WHERE ${cfg.fkColumn} = $1`,
        [row.id]
      );

      const out = { id: row.id, key: row[cfg.keyColumn], label: row.name || row[cfg.keyColumn], fields: {} };
      for (const field of cfg.fields) {
        out.fields[field] = { en: row[field] || '', nl: '', zh: '' };
      }
      for (const t of trans.rows) {
        if (!cfg.fields.includes(t.field_name)) continue;
        if (t.locale === 'en') continue;
        if (out.fields[t.field_name] && (t.locale === 'nl' || t.locale === 'zh')) {
          out.fields[t.field_name][t.locale] = t.value || '';
        }
      }
      res.json(out);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/translations/:tableKey/:key', requireAdmin, async (req, res) => {
    const cfg = TRANSLATABLE[req.params.tableKey];
    if (!cfg) return res.status(400).json({ error: 'Unknown table' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const base = await client.query(`SELECT * FROM ${cfg.table} WHERE ${cfg.keyColumn} = $1 FOR UPDATE`, [req.params.key]);
      if (!base.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }
      const row = base.rows[0];

      await client.query(
        'INSERT INTO edit_history (entity_type, entity_id, snapshot) VALUES ($1, $2, $3)',
        [cfg.table + '_i18n', String(row.id), JSON.stringify(row)]
      );

      const saved = [];
      for (const field of cfg.fields) {
        const data = req.body[field];
        if (!data || typeof data !== 'object') continue;

        if (typeof data.en === 'string' && data.en !== row[field]) {
          await client.query(
            `UPDATE ${cfg.table} SET "${field}" = $1, updated_at = NOW() WHERE ${cfg.keyColumn} = $2`,
            [data.en, req.params.key]
          );
          saved.push(field + '.en');
        }

        for (const locale of ['nl','zh']) {
          if (typeof data[locale] !== 'string') continue;
          const val = data[locale];
          const existing = await client.query(
            `SELECT id, value FROM translations WHERE ${cfg.fkColumn} = $1 AND field_name = $2 AND locale = $3`,
            [row.id, field, locale]
          );
          if (existing.rows.length) {
            if (existing.rows[0].value !== val) {
              if (val === '') {
                await client.query('DELETE FROM translations WHERE id = $1', [existing.rows[0].id]);
              } else {
                await client.query('UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2', [val, existing.rows[0].id]);
              }
              saved.push(field + '.' + locale);
            }
          } else if (val !== '') {
            await client.query(
              `INSERT INTO translations (${cfg.fkColumn}, field_name, locale, value) VALUES ($1, $2, $3, $4)`,
              [row.id, field, locale, val]
            );
            saved.push(field + '.' + locale);
          }
        }
      }

      await client.query('COMMIT');
      res.json({ ok: true, saved });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(e);
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  router.get('/api/relations-options', requireAdmin, async (req, res) => {
    try {
      const t = await pool.query("SELECT id, name FROM treatments ORDER BY name");
      const f = await pool.query("SELECT id, slug AS name FROM faqs ORDER BY slug");
      const e = await pool.query("SELECT id, COALESCE((SELECT value FROM translations WHERE evidence_id = evidence_resources.id AND field_name = 'title' AND locale = 'en' LIMIT 1), id) AS name FROM evidence_resources ORDER BY id");
      res.json({ treatments: t.rows, faqs: f.rows, evidence: e.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/relations/:slug', requireAdmin, async (req, res) => {
    try {
      const c = await pool.query("SELECT id FROM conditions WHERE slug = $1", [req.params.slug]);
      if (!c.rows[0]) return res.status(404).json({ error: 'Condition not found' });
      const cid = c.rows[0].id;

      const t = await pool.query("SELECT ct.treatment_id, ct.display_order, tr.name FROM condition_treatments ct JOIN treatments tr ON tr.id = ct.treatment_id WHERE ct.condition_id = $1 ORDER BY ct.display_order", [cid]);
      const f = await pool.query("SELECT cf.faq_id, cf.display_order, fa.slug FROM condition_faqs cf JOIN faqs fa ON fa.id = cf.faq_id WHERE cf.condition_id = $1 ORDER BY cf.display_order", [cid]);
      const e = await pool.query("SELECT ce.evidence_id, ce.relevance_note, ce.display_order FROM condition_evidence ce WHERE ce.condition_id = $1 ORDER BY ce.display_order NULLS LAST", [cid]);
      const p = await pool.query("SELECT id, tier_label, amount, currency, show_on_pricing_page, pricing_group, show_in_summary FROM price_tiers WHERE condition_id = $1 ORDER BY id", [cid]);

      res.json({ conditionId: cid, treatments: t.rows, faqs: f.rows, evidence: e.rows, pricing: p.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/relations/:slug/treatments', requireAdmin, async (req, res) => {
    const items = (req.body && req.body.items) || [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const c = await client.query("SELECT id FROM conditions WHERE slug = $1", [req.params.slug]);
      if (!c.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Condition not found' }); }
      const cid = c.rows[0].id;
      const curr = await client.query("SELECT * FROM condition_treatments WHERE condition_id = $1", [cid]);
      await client.query('INSERT INTO edit_history (entity_type, entity_id, snapshot) VALUES ($1, $2, $3)', ['condition_treatments', cid, JSON.stringify(curr.rows)]);
      await client.query("DELETE FROM condition_treatments WHERE condition_id = $1", [cid]);
      for (let i = 0; i < items.length; i++) {
        await client.query("INSERT INTO condition_treatments (condition_id, treatment_id, display_order) VALUES ($1, $2, $3)", [cid, items[i].treatment_id, i]);
      }
      await client.query('COMMIT');
      res.json({ ok: true, saved: items.length });
    } catch (e) { await client.query('ROLLBACK'); console.error(e); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
  });

  router.post('/api/relations/:slug/faqs', requireAdmin, async (req, res) => {
    const items = (req.body && req.body.items) || [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const c = await client.query("SELECT id FROM conditions WHERE slug = $1", [req.params.slug]);
      if (!c.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Condition not found' }); }
      const cid = c.rows[0].id;
      const curr = await client.query("SELECT * FROM condition_faqs WHERE condition_id = $1", [cid]);
      await client.query('INSERT INTO edit_history (entity_type, entity_id, snapshot) VALUES ($1, $2, $3)', ['condition_faqs', cid, JSON.stringify(curr.rows)]);
      await client.query("DELETE FROM condition_faqs WHERE condition_id = $1", [cid]);
      for (let i = 0; i < items.length; i++) {
        await client.query("INSERT INTO condition_faqs (condition_id, faq_id, display_order) VALUES ($1, $2, $3)", [cid, items[i].faq_id, i]);
      }
      await client.query('COMMIT');
      res.json({ ok: true, saved: items.length });
    } catch (e) { await client.query('ROLLBACK'); console.error(e); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
  });

  router.post('/api/relations/:slug/evidence', requireAdmin, async (req, res) => {
    const items = (req.body && req.body.items) || [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const c = await client.query("SELECT id FROM conditions WHERE slug = $1", [req.params.slug]);
      if (!c.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Condition not found' }); }
      const cid = c.rows[0].id;
      const curr = await client.query("SELECT * FROM condition_evidence WHERE condition_id = $1", [cid]);
      await client.query('INSERT INTO edit_history (entity_type, entity_id, snapshot) VALUES ($1, $2, $3)', ['condition_evidence', cid, JSON.stringify(curr.rows)]);
      await client.query("DELETE FROM condition_evidence WHERE condition_id = $1", [cid]);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const order = (it.display_order === null || it.display_order === undefined || it.display_order === '') ? null : parseInt(it.display_order, 10);
        await client.query("INSERT INTO condition_evidence (condition_id, evidence_id, relevance_note, display_order) VALUES ($1, $2, $3, $4)", [cid, it.evidence_id, it.relevance_note || null, order]);
      }
      await client.query('COMMIT');
      res.json({ ok: true, saved: items.length });
    } catch (e) { await client.query('ROLLBACK'); console.error(e); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
  });

  router.post('/api/relations/:slug/pricing', requireAdmin, async (req, res) => {
    const items = (req.body && req.body.items) || [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const c = await client.query("SELECT id FROM conditions WHERE slug = $1", [req.params.slug]);
      if (!c.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Condition not found' }); }
      const cid = c.rows[0].id;
      const curr = await client.query("SELECT * FROM price_tiers WHERE condition_id = $1", [cid]);
      await client.query('INSERT INTO edit_history (entity_type, entity_id, snapshot) VALUES ($1, $2, $3)', ['price_tiers', cid, JSON.stringify(curr.rows)]);
      await client.query("DELETE FROM price_tiers WHERE condition_id = $1", [cid]);
      for (const it of items) {
        const amount = parseFloat(it.amount);
        if (isNaN(amount)) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Amount must be a number' }); }
        await client.query(
          "INSERT INTO price_tiers (condition_id, tier_label, amount, currency, show_on_pricing_page, pricing_group, show_in_summary) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [cid, it.tier_label || null, amount, it.currency || 'EUR', it.show_on_pricing_page !== false, it.pricing_group || null, it.show_in_summary === true]
        );
      }
      await client.query('COMMIT');
      res.json({ ok: true, saved: items.length });
    } catch (e) { await client.query('ROLLBACK'); console.error(e); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
  });

  const mediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        return cb(new Error('Only JPEG, PNG, WebP and GIF are accepted.'));
      }
      cb(null, true);
    }
  });

  router.get('/api/media', requireAdmin, async (req, res) => {
    try {
      const r = await pool.query('SELECT id, filename, mime_type, byte_size, width, height, alt_text, category, created_at FROM media ORDER BY id DESC');
      res.json(r.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/media/upload', requireAdmin, mediaUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      let buffer = req.file.buffer;
      let mime = req.file.mimetype;
      let width = null, height = null;

      if (/^image\/(jpeg|png|webp)$/.test(mime)) {
        const pipeline = sharp(buffer).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true });
        const meta = await pipeline.metadata();
        buffer = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
        width = meta.width; height = meta.height;
        mime = 'image/jpeg';
      }

      const category = (req.body && req.body.category) ? String(req.body.category).slice(0, 60) : 'uncategorised';
      const r = await pool.query(
        'INSERT INTO media (filename, mime_type, data, byte_size, width, height, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, filename, mime_type, byte_size, width, height, category',
        [req.file.originalname.slice(0, 200), mime, buffer, buffer.length, width, height, category]
      );
      res.json({ ok: true, media: r.rows[0], url: '/media/' + r.rows[0].id });
    } catch (e) {
      console.error('media upload:', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/api/media/:id/alt', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Bad id' });
    try {
      await pool.query('UPDATE media SET alt_text = $1 WHERE id = $2', [String(req.body.alt_text || '').slice(0, 300), id]);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/media/:id/category', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Bad id' });
    try {
      await pool.query('UPDATE media SET category = $1 WHERE id = $2', [String(req.body.category || 'uncategorised').slice(0, 60), id]);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/media/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Bad id' });
    try {
      await pool.query('DELETE FROM media WHERE id = $1', [id]);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  pool.query('CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())').catch(e => console.error('site_settings init:', e));

  router.get('/api/site-settings', requireAdmin, async (req, res) => {
    try {
      const r = await pool.query('SELECT key, value FROM site_settings');
      const out = {};
      for (const row of r.rows) out[row.key] = row.value;
      res.json(out);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/site-settings/:key', requireAdmin, async (req, res) => {
    const key = String(req.params.key || '').slice(0, 100);
    const value = String((req.body && req.body.value) || '').slice(0, 500);
    if (!key) return res.status(400).json({ error: 'Missing key' });
    try {
      await pool.query(
        'INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
        [key, value]
      );
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
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
