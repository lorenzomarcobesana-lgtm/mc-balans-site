with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

old = "contentPending:'\\u5185\\u5bb9\\u5f85\\u5b8c\\u5584',loading:'\\u52a0\\u8f7d\\u4e2d...',"
new = "contentPending:'\\u5185\\u5bb9\\u5f85\\u5b8c\\u5584',loading:'\\u52a0\\u8f7d\\u4e2d...',evidenceTitle:'\\u79d1\\u5b66\\u8bc1\\u636e',"

if old in s:
    s = s.replace(old, new, 1)
    print('zh i18n fixed')
else:
    print('pattern not found — check with: grep -n evidenceTitle public/database-site.html')
    print('looking for:', repr(old))

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)
