with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# Hero button (line 281)
old = r"""<button class="btn btn-primary" onclick="navigateTo(\'/contact\')">Book an appointment</button>"""
new = r"""<a class="btn btn-primary" href="tel:+31703888111">Call to Book</a>"""
if old in s:
    s = s.replace(old, new, 1); log.append('hero button')
else: print('WARN: hero button')

# Sidebar button on condition pages (line 359)
old = r"""<button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px;" onclick="navigateTo(\'/contact\')">Book now</button>"""
new = r"""<a class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px;display:inline-flex;" href="tel:+31703888111">Call to Book</a>"""
if old in s:
    s = s.replace(old, new, 1); log.append('sidebar button')
else: print('WARN: sidebar button')

# Treatment sidebar button (line 445) with herbal exception
old = r"""html+='<a class="btn btn-primary" style="width:100%;justify-content:center;" onclick="navigateTo(\'/contact\')">Book an appointment</a>';"""
new = r"""html+='<a class="btn btn-primary" style="width:100%;justify-content:center;display:inline-flex;" href="'+(slug==='online-tongue-diagnosis'?'#':'tel:+31703888111')+'">'+(slug==='online-tongue-diagnosis'?'Intake Survey':'Call to Book')+'</a>';"""
if old in s:
    s = s.replace(old, new, 1); log.append('treatment sidebar button')
else: print('WARN: treatment sidebar button')

# uiTr NL entries (lines 495-496) — no angle brackets
old = '  "Book an appointment": "Maak een afspraak",'
new = '  "Call to Book": "Bel om te boeken",'
if old in s:
    s = s.replace(old, new, 1); log.append('uiTr nl entry 1')
else: print('WARN: uiTr nl entry 1')

old = '  "Book now": "Boek nu",\n'
if old in s:
    s = s.replace(old, '', 1); log.append('uiTr nl entry 2 removed')
else: print('WARN: uiTr nl entry 2')

# uiTr ZH entries (lines 570-571) — unicode-escaped
old = '  "Book an appointment": "\\u9884\\u7ea6",'
new = '  "Call to Book": "\\u81f4\\u7535\\u9884\\u7ea6",'
if old in s:
    s = s.replace(old, new, 1); log.append('uiTr zh entry 1')
else: print('WARN: uiTr zh entry 1')

old = '  "Book now": "\\u7acb\\u5373\\u9884\\u7ea6",\n'
if old in s:
    s = s.replace(old, '', 1); log.append('uiTr zh entry 2 removed')
else: print('WARN: uiTr zh entry 2')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('\n'.join(log))
