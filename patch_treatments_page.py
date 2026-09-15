with open('public/database-site.html') as f: s = f.read()
patches = []

old = """data.forEach(t=>{html+=`<div class="cond-card" onclick="navigateTo('/treatments/${t.slug}')"><div><div class="tag">Treatment</div><h4>${esc(nameOf(t))}</h4><p>${esc(truncate(t.summary||'',110))}</p></div><div class="arrow">View →</div></div>`;});"""

new = """data.forEach(t=>{
const isFeatured = t.slug === 'online-tongue-diagnosis';
const cardClass = isFeatured ? 'cond-card cond-card-featured' : 'cond-card';
const tagText = isFeatured ? 'Online · New' : 'Treatment';
const arrowText = isFeatured ? 'Start →' : 'View →';
html+=`<div class="${cardClass}" onclick="navigateTo('/treatments/${t.slug}')"><div>${isFeatured?'<div class="featured-badge">NEW</div>':''}<div class="tag">${tagText}</div><h4>${esc(nameOf(t))}</h4><p>${esc(truncate(t.summary||'',110))}</p></div><div class="arrow">${arrowText}</div></div>`;
});"""

if old in s:
    s = s.replace(old, new); patches.append('treatment card renderer')
else:
    print('WARN: could not find renderTreatments card line')

old_css = ".cond-card .arrow{margin-top:12px;font-size:12.5px;color:var(--jade);font-weight:600}"
new_css = """.cond-card .arrow{margin-top:12px;font-size:12.5px;color:var(--jade);font-weight:600}
.cond-card-featured{background:linear-gradient(155deg,#EFF5F0,#E2EBE3);border:2px solid var(--jade);}
.cond-card-featured::before{background:var(--jade);}
.cond-card-featured .tag{color:var(--jade-dark);font-weight:600;}
.cond-card-featured .arrow{color:var(--jade-dark);}
.featured-badge{position:absolute;top:14px;right:14px;background:var(--jade);color:#fff;font-family:var(--font-mono);font-size:9.5px;padding:3px 9px;border-radius:100px;letter-spacing:.08em;font-weight:600;}"""

if old_css in s:
    s = s.replace(old_css, new_css); patches.append('featured card CSS')
else:
    print('WARN: could not find .cond-card .arrow CSS')

with open('public/database-site.html', 'w') as f: f.write(s)
print('Patches applied:', patches)
