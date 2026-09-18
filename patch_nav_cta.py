with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# ============ 1. Replace nav markup ============
old_nav = '<a class="nav-cta" href="/treatments/online-tongue-diagnosis" onclick="navigateTo(\'/treatments/online-tongue-diagnosis\')" data-i18n="onlineDiagnosis">Online Diagnosis</a>'
new_nav = '<div class="nav-cta-group"><a class="call" href="tel:+31703888111" data-i18n="callNow">Call now</a><a class="herbal" href="/treatments/online-tongue-diagnosis" onclick="navigateTo(\'/treatments/online-tongue-diagnosis\')" data-i18n="herbalService">Herbal Service</a></div>'

if old_nav in s:
    s = s.replace(old_nav, new_nav, 1)
    log.append('nav markup replaced')
else:
    print('WARN: nav-cta markup not found')

# ============ 2. Replace CSS ============
old_css = """nav.main-nav a.nav-cta{background:var(--jade);color:#fff;opacity:1;font-weight:600;padding:9px 16px;border-radius:2px;margin-left:8px}
nav.main-nav a.nav-cta:hover{background:var(--jade-dark);color:#fff}"""

new_css = """.nav-cta-group{display:flex;flex-direction:column;gap:3px;margin-left:8px;}
.nav-cta-group a{display:block;text-align:center;font-size:11px;font-weight:600;padding:5px 12px;border-radius:2px;white-space:nowrap;text-decoration:none;transition:background .15s;}
.nav-cta-group a.call{background:var(--jade);color:#fff;}
.nav-cta-group a.call:hover{background:var(--jade-dark);color:#fff;}
.nav-cta-group a.herbal{background:transparent;color:var(--jade);border:1px solid var(--jade);}
.nav-cta-group a.herbal:hover{background:var(--jade-tint);}"""

if old_css in s:
    s = s.replace(old_css, new_css, 1)
    log.append('CSS replaced')
else:
    print('WARN: nav-cta CSS not found')

# ============ 3. Update i18n object ============
# EN
old_en = "contact:'Contact',onlineDiagnosis:'Online Diagnosis'}"
new_en = "contact:'Contact',callNow:'Call now',herbalService:'Herbal Service'}"
if old_en in s:
    s = s.replace(old_en, new_en, 1)
    log.append('i18n en')
else:
    print('WARN: i18n en pattern not found')

# NL
old_nl = "contact:'Contact',onlineDiagnosis:'Online diagnose'}"
new_nl = "contact:'Contact',callNow:'Bel nu',herbalService:'Kruidenservice'}"
if old_nl in s:
    s = s.replace(old_nl, new_nl, 1)
    log.append('i18n nl')
else:
    print('WARN: i18n nl pattern not found')

# ZH (unicode-escaped)
old_zh = "contact:'\\u8054\\u7cfb',onlineDiagnosis:'\\u5728\\u7ebf\\u8bca\\u65ad'}"
new_zh = "contact:'\\u8054\\u7cfb',callNow:'\\u7acb\\u5373\\u81f4\\u7535',herbalService:'\\u8349\\u836f\\u670d\\u52a1'}"
if old_zh in s:
    s = s.replace(old_zh, new_zh, 1)
    log.append('i18n zh')
else:
    print('WARN: i18n zh pattern not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('\n'.join(log))
