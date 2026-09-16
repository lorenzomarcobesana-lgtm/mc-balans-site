with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

patches = []

# --- NL additions (insert after the existing >Email< entry) ---
old_nl = '  ">Email<": ">E-mail<",'
new_nl = '''  ">Email<": ">E-mail<",
  "Phone: ": "Telefoon: ",
  "Email: ": "E-mail: ",
  "Mon-Fri, 9:30-17:00": "Ma-Vr, 9:30-17:00",'''

if old_nl in s:
    s = s.replace(old_nl, new_nl, 1)
    patches.append('nl strings')

# --- ZH additions ---
old_zh = '  ">Email<": ">\\u7535\\u5b50\\u90ae\\u4ef6<",'
new_zh = '''  ">Email<": ">\\u7535\\u5b50\\u90ae\\u4ef6<",
  "Phone: ": "\\u7535\\u8bdd\\uff1a",
  "Email: ": "\\u7535\\u5b50\\u90ae\\u4ef6\\uff1a",
  "Mon-Fri, 9:30-17:00": "\\u5468\\u4e00\\u81f3\\u5468\\u4e94 9:30-17:00",'''

if old_zh in s:
    s = s.replace(old_zh, new_zh, 1)
    patches.append('zh strings')
else:
    print('WARN: zh anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Patches applied:', patches if patches else 'NONE')
