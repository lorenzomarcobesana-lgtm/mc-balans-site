with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

old = """    const result = await pool.query(`
      SELECT t.slug, t.duration,
             COALESCE(tt_name.value, t.name, t.slug) AS name,
             COALESCE(tt_summary.value, t.summary) AS summary
      FROM treatments t
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $1
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $1
      WHERE t.status = 'published'
      ORDER BY t.sort_order NULLS LAST, t.id
    `, [lang]);
    res.json(result.rows);"""

new = """    const result = await pool.query(`
      SELECT t.slug, t.duration,
             COALESCE(tt_name.value, t.name, t.slug) AS name,
             COALESCE(tt_summary.value, t.summary) AS summary
      FROM treatments t
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $1
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $1
      WHERE t.status = 'published'
      ORDER BY t.sort_order NULLS LAST, t.id
    `, [lang]);

    const introResult = await pool.query(`
      SELECT COALESCE(
        (SELECT value FROM translations WHERE shared_block_id = 'SHARED-0006' AND locale = $1 LIMIT 1),
        (SELECT value FROM shared_content_blocks WHERE id = 'SHARED-0006')
      ) AS intro
    `, [lang]);

    res.json({
      intro: introResult.rows[0]?.intro || '',
      treatments: result.rows
    });"""

if old in s:
    s = s.replace(old, new, 1)
    print('server patched')
else:
    print('FATAL: pattern not found')
    exit(1)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)
