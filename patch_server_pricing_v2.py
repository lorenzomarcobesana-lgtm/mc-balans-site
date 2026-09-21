with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

old = """app.get('/api/pricing', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pricing_group,
             MIN(amount) AS min_amount,
             currency
      FROM price_tiers
      WHERE pricing_group IS NOT NULL AND show_on_pricing_page = true
      GROUP BY pricing_group, currency
      ORDER BY CASE pricing_group
        WHEN 'consultations' THEN 1
        WHEN 'treatments' THEN 2
        WHEN 'herbal' THEN 3
        WHEN 'additional' THEN 4
        ELSE 5
      END
    `);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});"""

new = """app.get('/api/pricing', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pricing_group, amount, currency
      FROM price_tiers
      WHERE pricing_group IS NOT NULL
        AND show_on_pricing_page = true
        AND show_in_summary = true
      ORDER BY CASE pricing_group
        WHEN 'consultations' THEN 1
        WHEN 'treatments' THEN 2
        WHEN 'herbal' THEN 3
        WHEN 'additional' THEN 4
        ELSE 5
      END
    `);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});"""

if old in s:
    s = s.replace(old, new, 1)
    print('server pricing endpoint updated')
else:
    print('FATAL: pattern not found')

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)
