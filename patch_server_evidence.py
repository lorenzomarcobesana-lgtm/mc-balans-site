with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

old = "    res.json({ condition, treatments: treatments.rows, practitioners: practitioners.rows, faqs: faqs.rows });"

new = """    const evidence = await pool.query(`
      SELECT e.id, e.source_url, e.publication_date,
             (SELECT value FROM translations WHERE evidence_id = e.id AND field_name = 'title' AND locale = 'en' LIMIT 1) AS title
      FROM condition_evidence ce
      JOIN evidence_resources e ON e.id = ce.evidence_id
      WHERE ce.condition_id = $1 AND ce.display_order IS NOT NULL
      ORDER BY ce.display_order
    `, [condition.id]);

    res.json({ condition, treatments: treatments.rows, practitioners: practitioners.rows, faqs: faqs.rows, evidence: evidence.rows });"""

if old in s:
    s = s.replace(old, new, 1)
    print('Server patched.')
else:
    print('Pattern not found.')
    print('Looking for:', repr(old))

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)
