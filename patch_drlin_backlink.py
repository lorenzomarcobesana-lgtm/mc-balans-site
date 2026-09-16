with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

patches = []

# 1. Inject isLin const before the html+= for the team card
old1 = "const roles=m.display_role||(Array.isArray(m.roles)?m.roles.join(', '):String(m.roles||'').replace(/[{}]/g,'').split(',').map(r=>r.trim().replace(/_/g,' ')).join(', '));html+=`<div class=\"team-card\">"
new1 = "const roles=m.display_role||(Array.isArray(m.roles)?m.roles.join(', '):String(m.roles||'').replace(/[{}]/g,'').split(',').map(r=>r.trim().replace(/_/g,' ')).join(', '));const isLin=(m.display_role||'').toLowerCase().includes('head')||name.toLowerCase().includes('lin');html+=`<div class=\"team-card\">"

if old1 in s:
    s = s.replace(old1, new1, 1)
    patches.append('isLin const injected')
else:
    print('WARN: team-card opening not found')

# 2. Add the link inside the card, after the email
old2 = "<p>${esc(m.email||'')}</p></div></div>`;"
new2 = r"""<p>${esc(m.email||'')}</p>${isLin?'<a class="profile-link" href="/resources" onclick="event.preventDefault();navigateTo(\'/resources\')">Read her Medisch Dossier column →</a>':''}</div></div>`;"""

if old2 in s:
    s = s.replace(old2, new2, 1)
    patches.append('Dr. Lin link added')
else:
    print('WARN: team-card closing not found')

# 3. CSS for the link
old_css = ".team-info p{font-size:12.5px;color:var(--stone)}"
new_css = """.team-info p{font-size:12.5px;color:var(--stone)}
.profile-link{display:inline-block;margin-top:12px;font-family:var(--font-mono);font-size:11.5px;color:var(--jade);font-weight:600;text-decoration:none;border-bottom:1px solid transparent;}
.profile-link:hover{border-bottom-color:var(--jade);}"""

if old_css in s:
    s = s.replace(old_css, new_css, 1)
    patches.append('CSS added')
else:
    print('WARN: team-info CSS anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Patches applied:', patches if patches else 'NONE')
