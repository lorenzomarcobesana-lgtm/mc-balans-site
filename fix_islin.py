with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

# Only add if missing
if "const isLin=" in s:
    print('isLin already defined — nothing to do')
else:
    # Match the end of the roles declaration inside team.forEach
    marker = ".join(', '));html+=`<div class=\"team-card\">"
    replacement = ".join(', '));const isLin=(m.display_role||'').toLowerCase().includes('head')||name.toLowerCase().includes('lin');html+=`<div class=\"team-card\">"
    if marker in s:
        s = s.replace(marker, replacement, 1)
        print('isLin const inserted')
    else:
        print('FATAL: marker not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)
