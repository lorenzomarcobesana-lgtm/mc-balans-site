with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# 1. Footer HTML literal
old_html = '<p data-i18n="footerTagline">Western & TCM, The Hague</p>'
new_html = '<p data-i18n="footerTagline">MC Balans, The Hague</p>'
if old_html in s:
    s = s.replace(old_html, new_html, 1)
    log.append('HTML')
else:
    print('WARN: footer HTML not found')

# 2. i18n en
old_en = "footerTagline:'Western & TCM, The Hague',"
new_en = "footerTagline:'MC Balans, The Hague',"
if old_en in s:
    s = s.replace(old_en, new_en, 1)
    log.append('i18n en')
else:
    print('WARN: i18n en not found')

# 3. i18n nl
old_nl = "footerTagline:'Westers & TCM, Den Haag',"
new_nl = "footerTagline:'MC Balans, Den Haag',"
if old_nl in s:
    s = s.replace(old_nl, new_nl, 1)
    log.append('i18n nl')
else:
    print('WARN: i18n nl not found')

# 4. i18n zh — likely "中西医结合，海牙"
old_zh = "footerTagline:'\\u4e2d\\u897f\\u533b\\u7ed3\\u5408\\uff0c\\u6d77\\u7259',"
new_zh = "footerTagline:'MC Balans\\uff0c\\u6d77\\u7259',"
if old_zh in s:
    s = s.replace(old_zh, new_zh, 1)
    log.append('i18n zh')
else:
    print('WARN: i18n zh not found')

# 5. uiTr nl entry (if present)
old_ui_nl = '"Western & TCM, The Hague": "Westers & TCM, Den Haag",'
new_ui_nl = '"Western & TCM, The Hague": "MC Balans, Den Haag",'
if old_ui_nl in s:
    s = s.replace(old_ui_nl, new_ui_nl, 1)
    log.append('uiTr nl')
else:
    print('note: uiTr nl entry not present')

# 6. uiTr zh entry (if present)
old_ui_zh = '"Western & TCM, The Hague": "\\u4e2d\\u897f\\u533b\\u7ed3\\u5408\\uff0c\\u6d77\\u7259",'
new_ui_zh = '"Western & TCM, The Hague": "MC Balans\\uff0c\\u6d77\\u7259",'
if old_ui_zh in s:
    s = s.replace(old_ui_zh, new_ui_zh, 1)
    log.append('uiTr zh')
else:
    print('note: uiTr zh entry not present')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Updated:', ', '.join(log) if log else 'NONE')
