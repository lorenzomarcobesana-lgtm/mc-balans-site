with open('public/database-site.html', 'rb') as f:
    s = f.read()

log = []

old_fn = b"function t(k){return (i18n[currentLang]&&i18n[currentLang][k])||i18n.en[k]||k;}"
new_fn = b"function T(k){return (i18n[currentLang]&&i18n[currentLang][k])||i18n.en[k]||k;}"
if old_fn in s:
    s = s.replace(old_fn, new_fn)
    log.append('1. function t(k) renamed to T(k)')
else:
    log.append('1. WARN: function t(k) not found')

old_call = b"+t('loading')+"
new_call = b"+T('loading')+"
cnt = s.count(old_call)
s = s.replace(old_call, new_call)
log.append('2. loading calls renamed: %d' % cnt)

with open('public/database-site.html', 'wb') as f:
    f.write(s)

print('\n'.join(log))
