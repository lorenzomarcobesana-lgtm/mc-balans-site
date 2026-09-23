with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

with open('public/database-site.html', 'r', encoding='utf-8') as f:
    h = f.read()

log = []

# --- 1. Server: API condition-detail treatments query ---
old = """      WHERE c.slug = $1
      ORDER BY ct.display_order
    `, [slug, lang]);"""
new = """      WHERE c.slug = $1
        AND tr.slug NOT IN ('western-medicine-consultation', 'tcm-consultation')
      ORDER BY ct.display_order
    `, [slug, lang]);"""
if old in s:
    s = s.replace(old, new, 1); log.append('server API filter')
else:
    print('WARN: API filter pattern not found')

# --- 2. Server: SSR treatments query ---
old = """                  FROM condition_treatments ct JOIN treatments tr ON tr.id = ct.treatment_id
                  WHERE ct.condition_id = $1 ORDER BY ct.display_order"""
new = """                  FROM condition_treatments ct JOIN treatments tr ON tr.id = ct.treatment_id
                  WHERE ct.condition_id = $1
                    AND tr.slug NOT IN ('western-medicine-consultation', 'tcm-consultation')
                  ORDER BY ct.display_order"""
if old in s:
    s = s.replace(old, new, 1); log.append('server SSR filter')
else:
    print('WARN: SSR filter pattern not found')

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)

# --- 3. Frontend: change heading and add sub-line ---
old = '<h2>Treatments</h2>'
new = '<h2>Treatment may include</h2><p style="color:var(--stone);font-size:14px;margin-bottom:20px;">The specific plan depends on what we find during your assessment.</p>'
if old in h:
    h = h.replace(old, new, 1); log.append('frontend heading + sub-line')
else:
    print('WARN: frontend heading pattern not found — try grep for <h2>Treatments</h2>')

# --- 4. uiTr NL entries ---
nl_anchor = '  "Articles, columns and resources from MC Balans.": "Artikelen, columns en bronnen van MC Balans.",'
nl_add = '\n  "Treatment may include": "Behandeling kan omvatten",\n  "The specific plan depends on what we find during your assessment.": "Het specifieke plan hangt af van wat we tijdens uw beoordeling vinden.",'
if nl_anchor in h and 'Behandeling kan omvatten' not in h:
    h = h.replace(nl_anchor, nl_anchor + nl_add, 1); log.append('uiTr nl')
elif 'Behandeling kan omvatten' in h:
    log.append('uiTr nl: already present')
else:
    print('WARN: uiTr nl anchor not found')

# --- 5. uiTr ZH entries ---
zh_anchor = r'  "Articles, columns and resources from MC Balans.": "\u6765\u81ea MC Balans \u7684\u6587\u7ae0\u3001\u4e13\u680f\u548c\u8d44\u6e90\u3002",'
zh_add = r'''
  "Treatment may include": "\u6cbb\u7597\u53ef\u80fd\u5305\u62ec",
  "The specific plan depends on what we find during your assessment.": "\u5177\u4f53\u65b9\u6848\u53d6\u51b3\u4e8e\u6211\u4eec\u5728\u8bc4\u4f30\u4e2d\u7684\u53d1\u73b0\u3002",'''
if zh_anchor in h and '治疗可能包括' not in h:
    h = h.replace(zh_anchor, zh_anchor + zh_add, 1); log.append('uiTr zh')
elif '治疗可能包括' in h:
    log.append('uiTr zh: already present')
else:
    print('WARN: uiTr zh anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(h)

print('\n'.join(log))
