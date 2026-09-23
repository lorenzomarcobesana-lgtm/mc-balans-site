with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()
log = []

# Current Practical Information block render
old = """html+='<div class="exp-box"><div class="exp-box-head" onclick="this.parentElement.classList.toggle(\\'open\\')"><h3>Practical Information</h3><span class="plus">+</span></div><div class="exp-box-body"><div class="exp-box-body-inner">'+(c.insurance?'<div style="background:var(--jade-tint);padding:24px;border-radius:4px;"><p>'+nl2br(c.insurance)+'</p></div>':'<div class="placeholder-box">Content pending</div>')+'</div></div></div>';"""

new = """html+='<div class="exp-box"><div class="exp-box-head" onclick="this.parentElement.classList.toggle(\\'open\\')"><h3>Practical Information</h3><span class="plus">+</span></div><div class="exp-box-body"><div class="exp-box-body-inner">';
if(c.insurance) html+='<div style="background:var(--jade-tint);padding:24px;border-radius:4px;"><p>'+nl2br(c.insurance)+'</p></div>';
if(c.what_to_bring) html+='<div style="background:var(--white);border:1px solid var(--line);padding:24px;border-radius:4px;margin-top:'+(c.insurance?'16px':'0')+';"><p>'+nl2br(c.what_to_bring)+'</p></div>';
if(!c.insurance && !c.what_to_bring) html+='<div class="placeholder-box">Content pending</div>';
html+='</div></div></div>';"""

if old in s:
    s = s.replace(old, new, 1); log.append('frontend render')
else:
    print('WARN: frontend Practical Information pattern not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)
print('Applied:', ', '.join(log) if log else 'NONE')
