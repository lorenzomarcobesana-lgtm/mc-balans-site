with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()
log = []

# API treatments list (line ~392)
old_api = """      FROM treatments t
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $1
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $1
      WHERE t.status = 'published'
      ORDER BY t.sort_order NULLS LAST, t.id"""

new_api = """      FROM treatments t
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $1
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $1
      WHERE t.status = 'published'
        AND NOT (t.slug = 'western-medicine-consultation' AND $1 != 'zh')
      ORDER BY t.sort_order NULLS LAST, t.id"""

if old_api in s:
    s = s.replace(old_api, new_api, 1)
    log.append('API list filtered')
else:
    print('WARN: API list pattern not found')

# SSR treatments list (line ~642)
old_ssr = "FROM treatments t WHERE t.status = 'published' ORDER BY t.sort_order NULLS LAST, t.id"
new_ssr = "FROM treatments t WHERE t.status = 'published' AND t.slug != 'western-medicine-consultation' ORDER BY t.sort_order NULLS LAST, t.id"

if old_ssr in s:
    s = s.replace(old_ssr, new_ssr, 1)
    log.append('SSR list filtered')
else:
    print('WARN: SSR list pattern not found')

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)
print('Applied:', ', '.join(log) if log else 'NONE')
