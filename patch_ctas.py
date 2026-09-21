with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# ---- 1. i18n en ----
old = "bookAppointment:'Book an appointment',bookNow:'Book now',"
new = "bookAppointment:'Call to Book',bookNow:'Call to Book',"
if old in s:
    s = s.replace(old, new, 1); log.append('i18n en')
else: print('WARN: i18n en')

# ---- 2. i18n nl ----
old = "bookAppointment:'Maak een afspraak',bookNow:'Boek nu',"
new = "bookAppointment:'Bel om te boeken',bookNow:'Bel om te boeken',"
if old in s:
    s = s.replace(old, new, 1); log.append('i18n nl')
else: print('WARN: i18n nl')

# ---- 3. i18n zh ----
old = "bookAppointment:'\\u9884\\u7ea6',bookNow:'\\u7acb\\u5373\\u9884\\u7ea6',"
new = "bookAppointment:'\\u81f4\\u7535\\u9884\\u7ea6',bookNow:'\\u81f4\\u7535\\u9884\\u7ea6',"
if old in s:
    s = s.replace(old, new, 1); log.append('i18n zh')
else: print('WARN: i18n zh')

# ---- 4. tr() map — first entry ----
old = "['>Book an appointment<','>'+t('bookAppointment')+'<'],"
new = "['>Call to Book<','>'+T('bookAppointment')+'<'],"
if old in s:
    s = s.replace(old, new, 1); log.append('tr() map entry 1')
else: print('WARN: tr() map entry 1')

# ---- 5. tr() map — second entry (delete) ----
old = "['>Book now<','>'+t('bookNow')+'<'],\n"
if old in s:
    s = s.replace(old, '', 1); log.append('tr() map entry 2 removed')
else:
    old2 = "['>Book now<','>'+t('bookNow')+'<'],"
    if old2 in s:
        s = s.replace(old2, '', 1); log.append('tr() map entry 2 removed (no newline)')
    else: print('WARN: tr() map entry 2')

# ---- 6. uiTr NL — old book entries ----
old = '">Book an appointment<": ">Maak een afspraak<",'
new = '">Call to Book<": ">Bel om te boeken<",'
if old in s:
    s = s.replace(old, new, 1); log.append('uiTr nl entry 1')
else: print('WARN: uiTr nl entry 1')

old = '">Book now<": ">Boek nu<",'
if old in s:
    s = s.replace(old, '', 1); log.append('uiTr nl entry 2 removed')
else: print('WARN: uiTr nl entry 2')

# ---- 7. uiTr ZH — old book entries ----
old = '">Book an appointment<": ">\\u9884\\u7ea6<",'
new = '">Call to Book<": ">\\u81f4\\u7535\\u9884\\u7ea6<",'
if old in s:
    s = s.replace(old, new, 1); log.append('uiTr zh entry 1')
else: print('WARN: uiTr zh entry 1')

old = '">Book now<": ">\\u7acb\\u5373\\u9884\\u7ea6<",'
if old in s:
    s = s.replace(old, '', 1); log.append('uiTr zh entry 2 removed')
else: print('WARN: uiTr zh entry 2')

# ---- 8. Sidebar copy translation entries (new) ----
old_nl_anchor = '  "Articles, columns and resources from MC Balans.": "Artikelen, columns en bronnen van MC Balans.",'
new_nl_anchor = old_nl_anchor + '\n  "Ready to make an appointment? Call us directly.": "Klaar om een afspraak te maken? Bel ons direct.",'
if old_nl_anchor in s and 'Ready to make an appointment' not in s:
    s = s.replace(old_nl_anchor, new_nl_anchor, 1); log.append('uiTr nl sidebar copy')
elif 'Ready to make an appointment' in s:
    log.append('uiTr nl sidebar copy: already present')
else: print('WARN: nl sidebar anchor')

old_zh_anchor = '  "Articles, columns and resources from MC Balans.": "\\u6765\\u81ea MC Balans \\u7684\\u6587\\u7ae0\\u3001\\u4e13\\u680f\\u548c\\u8d44\\u6e90\\u3002",'
new_zh_anchor = old_zh_anchor + '\n  "Ready to make an appointment? Call us directly.": "\\u51c6\\u5907\\u9884\\u7ea6\\u4e86\\u5417\\uff1f\\u8bf7\\u76f4\\u63a5\\u81f4\\u7535\\u6211\\u4eec\\u3002",'
if old_zh_anchor in s and 'Ready to make an appointment' not in s:
    s = s.replace(old_zh_anchor, new_zh_anchor, 1); log.append('uiTr zh sidebar copy')
elif 'Ready to make an appointment' in s:
    log.append('uiTr zh sidebar copy: already present')
else: print('WARN: zh sidebar anchor')

# ---- 9. Hero button ----
old = '<button class="btn btn-primary" onclick="navigateTo(\'/contact\')">Book an appointment</button>'
new = '<a class="btn btn-primary" href="tel:+31703888111">Call to Book</a>'
if old in s:
    s = s.replace(old, new, 1); log.append('hero button')
else: print('WARN: hero button')

# ---- 10. Sidebar heading ----
old = '<h3 style="font-size:20px;margin-bottom:12px;color:var(--jade-dark);">Book an appointment</h3>'
new = '<h3 style="font-size:20px;margin-bottom:12px;color:var(--jade-dark);">Call to Book</h3>'
if old in s:
    s = s.replace(old, new, 1); log.append('sidebar heading')
else: print('WARN: sidebar heading')

# ---- 11. Sidebar copy ----
old = '<p style="font-size:14px;color:var(--stone);margin-bottom:16px;">Ready to take the next step? Call us or book online.</p>'
new = '<p style="font-size:14px;color:var(--stone);margin-bottom:16px;">Ready to make an appointment? Call us directly.</p>'
if old in s:
    s = s.replace(old, new, 1); log.append('sidebar copy')
else: print('WARN: sidebar copy')

# ---- 12. Sidebar button ----
old = '<button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px;" onclick="navigateTo(\'/contact\')">Book now</button>'
new = '<a class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px;display:inline-flex;" href="tel:+31703888111">Call to Book</a>'
if old in s:
    s = s.replace(old, new, 1); log.append('sidebar button')
else: print('WARN: sidebar button')

# ---- 13. Treatment sidebar button (with herbal exception) ----
old = """<a class="btn btn-primary" style="width:100%;justify-content:center;" onclick="navigateTo('/contact')">Book an appointment</a>"""
new = """<a class="btn btn-primary" style="width:100%;justify-content:center;display:inline-flex;" href="'+(slug==='online-tongue-diagnosis'?'#':'tel:+31703888111')+'">'+(slug==='online-tongue-diagnosis'?'Intake Survey':'Call to Book')+'</a>"""
if old in s:
    s = s.replace(old, new, 1); log.append('treatment sidebar button (with herbal exception)')
else: print('WARN: treatment sidebar button')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('\n'.join(log))
