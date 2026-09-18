import re

with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

new_fn = """async function renderTreatments(){
try{
app.innerHTML='<div class="loading">'+T('loading')+'</div>';
const res=await fetch(API+'/treatments?lang='+currentLang);
if(!res.ok)throw new Error('Load failed');
const data=await res.json();
const list=data.treatments||data;
const intro=data.intro||'';
let html='<div class="subhero wrap"><div class="breadcrumb"><a onclick="navigateTo(\\'/\\')">Home</a> / '+i18n[currentLang].treatments+'</div><h1>'+i18n[currentLang].treatments+'</h1>'+(intro?'<p class="lede">'+intro+'</p>':'')+'</div><section class="section"><div class="wrap">';
const groups=[
{key:'assessment', heading:'Consultations & assessment', slugs:['western-medicine-consultation','tcm-consultation']},
{key:'techniques', heading:'Treatment techniques', slugs:['acupuncture','acupotomy','cupping','chinese-herbal-medicine','moxa-therapy','ear-acupuncture']},
{key:'supportive', heading:'Supportive care', slugs:['nutrition-movement','prp-therapy']},
{key:'online', heading:'Online', slugs:['online-tongue-diagnosis']}
];
groups.forEach(g=>{
const items=list.filter(t=>g.slugs.includes(t.slug));
if(!items.length)return;
html+='<h2 style="font-family:var(--font-display);font-size:22px;margin:32px 0 16px;">'+g.heading+'</h2>';
html+='<div class="cond-grid">';
items.forEach(t=>{
const isFeatured=t.slug==='online-tongue-diagnosis';
const cardClass=isFeatured?'cond-card cond-card-featured':'cond-card';
const tagText=isFeatured?'Online · New':'Treatment';
const arrowText=isFeatured?'Start →':'View →';
html+=`<div class="${cardClass}" onclick="navigateTo('/treatments/${t.slug}')"><div>${isFeatured?'<div class="featured-badge">NEW</div>':''}<div class="tag">${tagText}</div><h4>${esc(nameOf(t))}</h4><p>${esc(truncate(t.summary||'',110))}</p></div><div class="arrow">${arrowText}</div></div>`;
});
html+='</div>';
});
html+='</div></section>';app.innerHTML=tr(html);
}catch(e){app.innerHTML='<div class="error">Treatments error: '+e.message+'</div>';}
}"""

# Match the full renderTreatments function, up to the closing brace before renderTreatment
pattern = r"async function renderTreatments\(\)\{[\s\S]*?\n\}\n\nasync function renderTreatment"
new_s, n = re.subn(pattern, lambda m: new_fn + "\n\nasync function renderTreatment", s, count=1)

if n == 0:
    print('FATAL: could not match renderTreatments')
    exit(1)

# Add the group headings to uiTr maps so they translate
old_nl = '  "Articles, columns and resources from MC Balans.": "Artikelen, columns en bronnen van MC Balans.",'
new_nl = '''  "Articles, columns and resources from MC Balans.": "Artikelen, columns en bronnen van MC Balans.",
  "Consultations & assessment": "Consultaties & beoordeling",
  "Treatment techniques": "Behandeltechnieken",
  "Supportive care": "Ondersteunende zorg",
  "Online": "Online",'''

old_zh = '  "Articles, columns and resources from MC Balans.": "\\u6765\\u81ea MC Balans \\u7684\\u6587\\u7ae0\\u3001\\u4e13\\u680f\\u548c\\u8d44\\u6e90\\u3002",'
new_zh = '''  "Articles, columns and resources from MC Balans.": "\\u6765\\u81ea MC Balans \\u7684\\u6587\\u7ae0\\u3001\\u4e13\\u680f\\u548c\\u8d44\\u6e90\\u3002",
  "Consultations & assessment": "\\u54a8\\u8be2\\u4e0e\\u8bc4\\u4f30",
  "Treatment techniques": "\\u6cbb\\u7597\\u6280\\u672f",
  "Supportive care": "\\u8f85\\u52a9\\u62a4\\u7406",
  "Online": "\\u5728\\u7ebf",'''

if old_nl in new_s:
    new_s = new_s.replace(old_nl, new_nl, 1)
    print('nl headings added')
else:
    print('WARN: nl anchor not found')

if old_zh in new_s:
    new_s = new_s.replace(old_zh, new_zh, 1)
    print('zh headings added')
else:
    print('WARN: zh anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(new_s)

print('renderTreatments replaced')
