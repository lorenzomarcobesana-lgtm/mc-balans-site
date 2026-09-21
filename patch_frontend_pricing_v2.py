with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

old = "html+='<div class=\"pricing-row\"><span class=\"pricing-label\">'+esc(label)+'</span><span class=\"pricing-amount\">from '+esc(p.currency||'\\u20ac')+esc(p.min_amount)+'</span></div>';"
new = "html+='<div class=\"pricing-row\"><span class=\"pricing-label\">'+esc(label)+'</span><span class=\"pricing-amount\">from '+esc(p.currency||'\\u20ac')+esc(p.amount)+'</span></div>';"

if old in s:
    s = s.replace(old, new, 1)
    print('frontend updated')
else:
    print('WARN: pricing row pattern not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)
