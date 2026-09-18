with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# 1. tr() map entry
old_tr = "['>Why do patients trust Dr. Lin?<','>'+t('credibilityTitle')+'<'],"
new_tr = "['>Dr. Wenzhi Lin<','>'+t('credibilityTitle')+'<'],"
if old_tr in s:
    s = s.replace(old_tr, new_tr, 1)
    log.append('tr() map')
else:
    print('WARN: tr() map entry not found')

# 2. uiTr NL
old_nl_key = '">Why do patients trust Dr. Lin?<": ">Waarom vertrouwen pati\\u00ebnten Dr. Lin?<",'
new_nl_key = '">Dr. Wenzhi Lin<": ">Dr. Wenzhi Lin<",'
if old_nl_key in s:
    s = s.replace(old_nl_key, new_nl_key, 1)
    log.append('nl uiTr')
else:
    print('WARN: nl uiTr entry not found')

# 3. uiTr ZH
old_zh_key = '">Why do patients trust Dr. Lin?<": ">\\u60a3\\u8005\\u4e3a\\u4f55\\u4fe1\\u4efb\\u6797\\u533b\\u751f\\uff1f<",'
new_zh_key = '">Dr. Wenzhi Lin<": ">\\u6797\\u6587\\u5fd7\\u533b\\u751f<",'
if old_zh_key in s:
    s = s.replace(old_zh_key, new_zh_key, 1)
    log.append('zh uiTr')
else:
    print('WARN: zh uiTr entry not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('\n'.join(log))
