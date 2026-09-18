with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

old = """groups.forEach(g=>{
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
});"""

new = """groups.forEach(g=>{
const items=list.filter(t=>g.slugs.includes(t.slug));
if(!items.length)return;
html+='<div class="exp-box" style="margin-bottom:12px;"><div class="exp-box-head" onclick="this.parentElement.classList.toggle(\\'open\\')"><h3>'+g.heading+'</h3><span class="plus">+</span></div><div class="exp-box-body"><div class="exp-box-body-inner"><div class="cond-grid">';
items.forEach(t=>{
const isFeatured=t.slug==='online-tongue-diagnosis';
const cardClass=isFeatured?'cond-card cond-card-featured':'cond-card';
const tagText=isFeatured?'Online · New':'Treatment';
const arrowText=isFeatured?'Start →':'View →';
html+=`<div class="${cardClass}" onclick="navigateTo('/treatments/${t.slug}')"><div>${isFeatured?'<div class="featured-badge">NEW</div>':''}<div class="tag">${tagText}</div><h4>${esc(nameOf(t))}</h4><p>${esc(truncate(t.summary||'',110))}</p></div><div class="arrow">${arrowText}</div></div>`;
});
html+='</div></div></div></div>';
});"""

if old in s:
    s = s.replace(old, new, 1)
    print('treatments accordion applied')
else:
    print('FATAL: pattern not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)
