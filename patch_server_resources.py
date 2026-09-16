with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

# Anchor: insert new endpoints before the catch-all
anchor = "app.get('*', (req, res) => {"

new_endpoints = """// ---------- API: RESOURCES ----------
app.get('/api/resources', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT r.id, r.entry_type, r.publication_name, r.publication_date,
             r.canonical_url, r.external_url, r.sort_order,
             COALESCE(
               (SELECT value FROM translations WHERE resource_id = r.id AND field_name = 'title' AND locale = $1 LIMIT 1),
               r.title
             ) AS title,
             COALESCE(
               (SELECT value FROM translations WHERE resource_id = r.id AND field_name = 'description' AND locale = $1 LIMIT 1),
               r.description
             ) AS description
      FROM resources r
      WHERE r.status = 'published'
      ORDER BY r.sort_order NULLS LAST, r.publication_date DESC NULLS LAST, r.id
    `, [lang]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error /api/resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/resources/:id', async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT r.*,
             COALESCE(
               (SELECT value FROM translations WHERE resource_id = r.id AND field_name = 'title' AND locale = $2 LIMIT 1),
               r.title
             ) AS title,
             COALESCE(
               (SELECT value FROM translations WHERE resource_id = r.id AND field_name = 'description' AND locale = $2 LIMIT 1),
               r.description
             ) AS description
      FROM resources r
      WHERE r.id = $1 AND r.status = 'published'
    `, [id, lang]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error /api/resources/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

"""

if anchor not in s:
    print('FATAL: catch-all anchor not found')
    exit(1)

if '/api/resources' in s:
    print('endpoint already present — nothing to do')
    exit(0)

s = s.replace(anchor, new_endpoints + anchor, 1)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)

print('endpoints inserted')
