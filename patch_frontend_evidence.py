with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

patches = []

# Match the exact ending of the CTA card in the sidebar (from line 341)
old = """<p style="font-size:12px;color:var(--stone);">Mon–Fri, 9:30–17:00</p></div></div></div>';"""
new = """<p style="font-size:12px;color:var(--stone);">Mon–Fri, 9:30–17:00</p></div>'+((data.evidence&&data.evidence.length)?'<div class="evidence-card"><h3>'+T('evidenceTitle')+'</h3><ul class="evidence-list">'+data.evidence.map(e=>{const title=e.title||e.id;return '<li><a href="'+esc(e.source_url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a></li>';}).join('')+'</ul></div>':'')+'</div></div>';"""

if old in s:
    s = s.replace(old, new, 1)
    patches.append('condition sidebar evidence card')
else:
    print('WARN: CTA card ending pattern still not found')

# CSS
old_css = ".chip:hover{border-color:var(--jade);}"
new_css = """.chip:hover{border-color:var(--jade);}
.evidence-card{background:var(--white);border:1px solid var(--line);border-radius:4px;padding:20px;margin-top:18px;box-shadow:0 2px 8px rgba(0,0,0,0.05);}
.evidence-card h3{font-size:15px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em;color:var(--stone);margin-bottom:12px;font-weight:500;}
.evidence-list{list-style:none;padding:0;margin:0;}
.evidence-list li{font-size:13px;line-height:1.5;margin-bottom:10px;padding-left:14px;position:relative;}
.evidence-list li:last-child{margin-bottom:0;}
.evidence-list li::before{content:'—';position:absolute;left:0;color:var(--jade);}
.evidence-list a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line);transition:border-color .15s;}
.evidence-list a:hover{border-color:var(--jade);}"""

if old_css in s:
    s = s.replace(old_css, new_css, 1)
    patches.append('CSS')
else:
    print('WARN: CSS anchor not found')

# i18n
for old_str, new_str, label in [
    ("contentPending:'Content pending',loading:'Loading...',", "contentPending:'Content pending',loading:'Loading...',evidenceTitle:'Evidence',", 'en'),
    ("contentPending:'Inhoud in behandeling',loading:'Laden...',", "contentPending:'Inhoud in behandeling',loading:'Laden...',evidenceTitle:'Wetenschappelijk bewijs',", 'nl'),
    ("contentPending:'内容待完善',loading:'加载中...',", "contentPending:'内容待完善',loading:'加载中...',evidenceTitle:'科学证据',", 'zh'),
]:
    if old_str in s:
        s = s.replace(old_str, new_str, 1)
        patches.append('i18n ' + label)
    else:
        print('WARN: i18n ' + label + ' pattern not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Patches applied:', patches if patches else 'NONE')
