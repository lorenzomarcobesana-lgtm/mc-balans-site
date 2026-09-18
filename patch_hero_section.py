with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# ============ CHANGE 1: "Why do patients trust Dr. Lin?" → "Dr. Wenzhi Lin" ============
OLD_HEADING = 'Why do patients trust Dr. Lin?'
NEW_HEADING = 'Dr. Wenzhi Lin'

# i18n en
old_i18n = "credibilityTitle:'" + OLD_HEADING + "',"
new_i18n = "credibilityTitle:'" + NEW_HEADING + "',"
if old_i18n in s:
    s = s.replace(old_i18n, new_i18n, 1)
    log.append('i18n en heading')
else:
    print('WARN: i18n en heading not found')

# HTML in renderHome
old_html = '<h2>' + OLD_HEADING + '</h2>'
new_html = '<h2>' + NEW_HEADING + '</h2>'
if old_html in s:
    s = s.replace(old_html, new_html, 1)
    log.append('HTML heading')
else:
    print('WARN: HTML heading not found')

# tr() map
old_tr = "['" + OLD_HEADING + "',T('credibilityTitle')],"
new_tr = "['" + NEW_HEADING + "',T('credibilityTitle')],"
if old_tr in s:
    s = s.replace(old_tr, new_tr, 1)
    log.append('tr() map heading')
else:
    print('WARN: tr() map heading not found')

# uiTr NL
NL_OLD = "Waarom vertrouwen pati\\u00ebnten Dr. Lin?"
old_nl = '"' + OLD_HEADING + '": "' + NL_OLD + '",'
new_nl = '"' + NEW_HEADING + '": "Dr. Wenzhi Lin",'
if old_nl in s:
    s = s.replace(old_nl, new_nl, 1)
    log.append('nl heading')
else:
    print('WARN: nl heading not found')

# uiTr ZH
old_zh = '"' + OLD_HEADING + '": ">\\u60a3\\u8005\\u4e3a\\u4f55\\u4fe1\\u4efb\\u6797\\u533b\\u751f\\uff1f<",'
# Try without the ><
if old_zh not in s:
    old_zh = '"' + OLD_HEADING + '": "\\u60a3\\u8005\\u4e3a\\u4f55\\u4fe1\\u4efb\\u6797\\u533b\\u751f\\uff1f",'
new_zh = '"' + NEW_HEADING + '": "\\u6797\\u6587\\u5fd7\\u533b\\u751f",'
if old_zh in s:
    s = s.replace(old_zh, new_zh, 1)
    log.append('zh heading')
else:
    print('WARN: zh heading not found')

# ============ CHANGE 2: What We Treat → chips only ============
old_section = """html+='<section class="section" style="background:var(--jade-tint);"><div class="wrap"><div class="section-head"><h2>What We Treat</h2></div>';
categories.forEach(cat=>{
const catConditions=conditions.filter(c=>c.category_slug===cat.slug);
if(catConditions.length>0){
html+='<div class="category-group"><h3>'+esc(nameOf(cat))+'</h3><div class="cond-grid">';
catConditions.forEach(c=>{html+=`<div class="cond-card" onclick="navigateTo('/conditions/${c.slug}')"><div><div class="tag">${esc(nameOf(cat))}</div><h4>${esc(nameOf(c))}</h4><p>${esc(truncate(c.summary||'',110))}</p></div><div class="arrow">Explore →</div></div>`;});
html+='</div></div>';
}
});
html+='</div></section>';"""

new_section = """html+='<section class="section" style="background:var(--jade-tint);"><div class="wrap"><div class="section-head"><h2>What We Treat</h2><p>Select a category to see the conditions we treat within it.</p></div>';
html+='<div class="category-chip-row">';
categories.forEach(cat=>{
const catConditions=conditions.filter(c=>c.category_slug===cat.slug);
if(catConditions.length>0){
html+='<a class="category-chip" onclick="navigateTo(\\'/conditions\\')"><span class="chip-name">'+esc(nameOf(cat))+'</span><span class="chip-count">'+catConditions.length+'</span></a>';
}
});
html+='</div>';
html+='</div></section>';"""

if old_section in s:
    s = s.replace(old_section, new_section, 1)
    log.append('What We Treat section')
else:
    print('WARN: What We Treat section pattern not found')

# Add CSS for the category chips
old_css = ".chip:hover{border-color:var(--jade);}"
new_css = """.chip:hover{border-color:var(--jade);}
.category-chip-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;}
.category-chip{display:inline-flex;align-items:center;gap:12px;background:var(--white);border:1px solid var(--line);border-radius:100px;padding:14px 22px;cursor:pointer;transition:border-color .15s, transform .15s;text-decoration:none;}
.category-chip:hover{border-color:var(--jade);transform:translateY(-1px);}
.category-chip .chip-name{font-family:var(--font-body);font-size:15px;font-weight:500;color:var(--ink);}
.category-chip .chip-count{font-family:var(--font-mono);font-size:11px;color:var(--stone);background:var(--jade-tint);padding:3px 9px;border-radius:100px;line-height:1;}"""

if old_css in s:
    s = s.replace(old_css, new_css, 1)
    log.append('CSS')
else:
    print('WARN: CSS anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('\n'.join(log))
