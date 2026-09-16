with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

old = "Dr. Lin\\'s monthly Medisch Dossier column, published natively."
new = "Articles, columns and resources from MC Balans."

if old in s:
    s = s.replace(old, new, 1)
    print('lede updated')
else:
    print('WARN: lede string not found')

# Add translations to uiTr maps
old_tr_nl = '  ">Resources<": ">Bronnen<",'
new_tr_nl = '''  ">Resources<": ">Bronnen<",
  "Articles, columns and resources from MC Balans.": "Artikelen, columns en bronnen van MC Balans.",'''

old_tr_zh = '  ">Resources<": ">\\u8d44\\u6e90<",'
new_tr_zh = '''  ">Resources<": ">\\u8d44\\u6e90<",
  "Articles, columns and resources from MC Balans.": "\\u6765\\u81ea MC Balans \\u7684\\u6587\\u7ae0\\u3001\\u4e13\\u680f\\u548c\\u8d44\\u6e90\\u3002",'''

if old_tr_nl in s:
    s = s.replace(old_tr_nl, new_tr_nl, 1)
    print('nl translation added')
else:
    print('WARN: nl anchor not found')

if old_tr_zh in s:
    s = s.replace(old_tr_zh, new_tr_zh, 1)
    print('zh translation added')
else:
    print('WARN: zh anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)
