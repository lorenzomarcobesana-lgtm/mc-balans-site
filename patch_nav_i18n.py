with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# EN
old = "onlineDiagnosis:'Online Diagnosis',"
new = "callNow:'Call now',herbalService:'Herbal Service',"
if old in s:
    s = s.replace(old, new, 1)
    log.append('en')
else:
    print('WARN: en pattern not found')

# NL
old = "onlineDiagnosis:'Online diagnose',"
new = "callNow:'Bel nu',herbalService:'Kruidenservice',"
if old in s:
    s = s.replace(old, new, 1)
    log.append('nl')
else:
    print('WARN: nl pattern not found')

# ZH
old = "onlineDiagnosis:'\\u5728\\u7ebf\\u8bca\\u65ad',"
new = "callNow:'\\u7acb\\u5373\\u81f4\\u7535',herbalService:'\\u8349\\u836f\\u670d\\u52a1',"
if old in s:
    s = s.replace(old, new, 1)
    log.append('zh')
else:
    print('WARN: zh pattern not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Locales updated:', log)
