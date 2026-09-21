with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# 1. Path cards section — insert before the credibility section
path_section = r"""html+='<section class="section" style="padding-top:32px;padding-bottom:0;"><div class="wrap"><div class="path-grid">';
html+='<a class="path-card" onclick="navigateTo(\'/conditions\')"><h4>I have a persistent physical complaint</h4><p>Treatment or investigations have not resolved it.</p><span class="arrow">\u2192</span></a>';
html+='<a class="path-card" onclick="navigateTo(\'/conditions\')"><h4>My tests came back normal</h4><p>But I still experience physical symptoms.</p><span class="arrow">\u2192</span></a>';
html+='<a class="path-card" onclick="navigateTo(\'/conditions\')"><h4>I know what my condition is</h4><p>And I\'m looking for additional treatment options.</p><span class="arrow">\u2192</span></a>';
html+='<a class="path-card" onclick="navigateTo(\'/treatments\')"><h4>I\'m looking for a specific treatment</h4><p>Such as acupuncture, acupotomy or Chinese herbal medicine.</p><span class="arrow">\u2192</span></a>';
html+='</div></div></section>';
"""

anchor = "html+='<section class=\"cred-section\">"
if anchor in s:
    s = s.replace(anchor, path_section + anchor, 1)
    log.append('path cards')
else:
    print('WARN: cred-section anchor not found')

# 2. View all conditions link — insert before the category chip row
view_all = r"""html+='<p style="margin-bottom:20px;"><a class="view-all-link" onclick="navigateTo(\'/conditions\')">View all conditions \u2192</a></p>';
"""

anchor2 = "html+='<div class=\"category-chip-row\">';"
if anchor2 in s:
    s = s.replace(anchor2, view_all + anchor2, 1)
    log.append('view-all link')
else:
    print('WARN: chip row anchor not found')

# 3. CSS
css_anchor = ".category-chip-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;}"
css_new = """.path-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.path-card{background:var(--white);border:1px solid var(--line);border-radius:4px;padding:24px 22px;cursor:pointer;transition:border-color .15s,transform .15s;display:flex;flex-direction:column;justify-content:space-between;min-height:150px;}
.path-card:hover{border-color:var(--jade);transform:translateY(-2px);}
.path-card h4{font-size:16px;margin-bottom:10px;color:var(--ink);line-height:1.35;}
.path-card p{font-size:13.5px;color:var(--stone);margin:0 0 16px;flex-grow:1;line-height:1.5;}
.path-card .arrow{font-family:var(--font-mono);font-size:14px;color:var(--jade);font-weight:600;}
.view-all-link{font-family:var(--font-mono);font-size:12px;color:var(--jade);text-transform:uppercase;letter-spacing:.06em;cursor:pointer;font-weight:600;text-decoration:none;border-bottom:1px solid transparent;}
.view-all-link:hover{border-bottom-color:var(--jade);}
@media(max-width:900px){.path-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:560px){.path-grid{grid-template-columns:1fr;}}
.category-chip-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;}"""

if css_anchor in s:
    s = s.replace(css_anchor, css_new, 1)
    log.append('CSS')
else:
    print('WARN: CSS anchor not found')

# 4. uiTr NL entries
nl_anchor = '  "Articles, columns and resources from MC Balans.": "Artikelen, columns en bronnen van MC Balans.",'
nl_entries = """
  "View all conditions →": "Bekijk alle aandoeningen →",
  "I have a persistent physical complaint": "Ik heb een aanhoudende lichamelijke klacht",
  "Treatment or investigations have not resolved it.": "Behandeling of onderzoek heeft het niet opgelost.",
  "My tests came back normal": "Mijn tests kwamen normaal terug",
  "But I still experience physical symptoms.": "Maar ik ervaar nog steeds lichamelijke symptomen.",
  "I know what my condition is": "Ik ken mijn aandoening",
  "And I'm looking for additional treatment options.": "En ik zoek aanvullende behandelopties.",
  "I'm looking for a specific treatment": "Ik zoek een specifieke behandeling",
  "Such as acupuncture, acupotomy or Chinese herbal medicine.": "Zoals acupunctuur, acupotomie of Chinese kruidengeneeskunde.","""

if nl_anchor in s:
    s = s.replace(nl_anchor, nl_anchor + nl_entries, 1)
    log.append('uiTr nl')
else:
    print('WARN: uiTr nl anchor not found')

# 5. uiTr ZH entries
zh_anchor = r'  "Articles, columns and resources from MC Balans.": "\u6765\u81ea MC Balans \u7684\u6587\u7ae0\u3001\u4e13\u680f\u548c\u8d44\u6e90\u3002",'
zh_entries = """
  "View all conditions →": "查看所有病症 →",
  "I have a persistent physical complaint": "我有持续的身体症状",
  "Treatment or investigations have not resolved it.": "治疗或检查未能解决它。",
  "My tests came back normal": "我的检查结果正常",
  "But I still experience physical symptoms.": "但我仍然感到身体不适。",
  "I know what my condition is": "我知道自己的病症",
  "And I'm looking for additional treatment options.": "我正在寻求其他治疗方案。",
  "I'm looking for a specific treatment": "我在寻找特定的疗法",
  "Such as acupuncture, acupotomy or Chinese herbal medicine.": "例如针灸、针刀或中药。","""

if zh_anchor in s:
    s = s.replace(zh_anchor, zh_anchor + zh_entries, 1)
    log.append('uiTr zh')
else:
    print('WARN: uiTr zh anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Applied:', ', '.join(log) if log else 'NONE')
