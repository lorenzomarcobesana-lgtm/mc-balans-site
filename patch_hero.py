with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

# --- Define old and new strings ---
OLD_HEAD = 'A <em>balanced</em> approach to the health of mind and body.'
OLD_LEDE = 'Dr. Wenzhi Lin brings over 40 years of dual experience.'

NEW_HEAD = 'A comprehensive approach, from Dr. Lin.'
NEW_LEDE = "A persistent complaint without a clear explanation can still have debilitating consequences. MC Balans' approach assesses how your body's structure, function and regulation relate to your symptoms to address their root cause."

# Escaped versions for single-quoted JS contexts (i18n block, tr() map, HTML literal)
NEW_LEDE_JSE = NEW_LEDE.replace("'", "\\'")

log = []

# 1. i18n en block
old_i18n = "heroTitle:'" + OLD_HEAD + "',heroLede:'" + OLD_LEDE + "',"
new_i18n = "heroTitle:'" + NEW_HEAD + "',heroLede:'" + NEW_LEDE_JSE + "',"
if old_i18n in s:
    s = s.replace(old_i18n, new_i18n, 1)
    log.append('i18n en updated')
else:
    print('WARN: i18n en pattern not found')

# 2. tr() map pairs (also fixing lowercase t to uppercase T)
old_tr = "['" + OLD_HEAD + "',t('heroTitle')],\n['" + OLD_LEDE + "',t('heroLede')],"
new_tr = "['" + NEW_HEAD + "',T('heroTitle')],\n['" + NEW_LEDE_JSE + "',T('heroLede')],"
if old_tr in s:
    s = s.replace(old_tr, new_tr, 1)
    log.append('tr() map updated')
else:
    print('WARN: tr() map pattern not found — trying alternate')
    # Alternative: maybe with different whitespace
    alt_old_tr = "['" + OLD_HEAD + "',t('heroTitle')],"
    if alt_old_tr in s:
        s = s.replace("['" + OLD_HEAD + "',t('heroTitle')],", "['" + NEW_HEAD + "',T('heroTitle')],", 1)
        s = s.replace("['" + OLD_LEDE + "',t('heroLede')],", "['" + NEW_LEDE_JSE + "',T('heroLede')],", 1)
        log.append('tr() map updated (line-by-line)')

# 3. Hero HTML in renderHome — replace <h1>...</h1> and lede paragraph
old_h1 = '<h1>' + OLD_HEAD + '</h1>'
new_h1 = '<h1>' + NEW_HEAD + '</h1>'
if old_h1 in s:
    s = s.replace(old_h1, new_h1, 1)
    log.append('hero h1 updated')
else:
    print('WARN: hero h1 not found')

old_lede = '<p class="lede">' + OLD_LEDE + '</p>'
new_lede = '<p class="lede">' + NEW_LEDE_JSE + '</p>'
if old_lede in s:
    s = s.replace(old_lede, new_lede, 1)
    log.append('hero lede updated')
else:
    print('WARN: hero lede not found')

# 4. uiTr NL entries
NL_HEAD = "Een integrale benadering, van Dr. Lin."
NL_LEDE = "Een aanhoudende klacht zonder duidelijke verklaring kan nog steeds invaliderende gevolgen hebben. De benadering van MC Balans beoordeelt hoe de structuur, functie en regulatie van uw lichaam zich verhouden tot uw symptomen, om de onderliggende oorzaak aan te pakken."

old_nl_head = '"' + OLD_HEAD + '": "Een <em>gebalanceerde</em> benadering van de gezondheid van geest en lichaam.",'
new_nl_head = '"' + NEW_HEAD + '": "' + NL_HEAD + '",'
if old_nl_head in s:
    s = s.replace(old_nl_head, new_nl_head, 1)
    log.append('nl heading updated')
else:
    print('WARN: nl heading not found')

old_nl_lede = '"' + OLD_LEDE + '": "Dr. Wenzhi Lin brengt meer dan 40 jaar dubbele ervaring met zich mee.",'
new_nl_lede = '"' + NEW_LEDE + '": "' + NL_LEDE + '",'
if old_nl_lede in s:
    s = s.replace(old_nl_lede, new_nl_lede, 1)
    log.append('nl lede updated')
else:
    print('WARN: nl lede not found')

# 5. uiTr ZH entries (unicode-escaped style)
ZH_HEAD = "\\u5168\\u9762\\u7684\\u8bca\\u7597\\u65b9\\u6cd5\\uff0c\\u6765\\u81ea\\u6797\\u533b\\u751f\\u3002"
ZH_LEDE = "\\u4e00\\u4e2a\\u6ca1\\u6709\\u660e\\u786e\\u89e3\\u91ca\\u7684\\u6301\\u7eed\\u75c7\\u72b6\\u4ecd\\u7136\\u53ef\\u80fd\\u5e26\\u6765\\u4ee4\\u4eba\\u8870\\u5f31\\u7684\\u5f71\\u54cd\\u3002MC Balans \\u7684\\u65b9\\u6cd5\\u8bc4\\u4f30\\u60a8\\u8eab\\u4f53\\u7684\\u7ed3\\u6784\\u3001\\u529f\\u80fd\\u548c\\u8c03\\u8282\\u4e0e\\u60a8\\u7684\\u75c7\\u72b6\\u4e4b\\u95f4\\u7684\\u5173\\u7cfb\\uff0c\\u4ee5\\u89e3\\u51b3\\u5176\\u6839\\u672c\\u539f\\u56e0\\u3002"

old_zh_head = '"' + OLD_HEAD + '": "\\u8eab\\u5fc3\\u5065\\u5eb7\\u7684<em>\\u5e73\\u8861</em>\\u4e4b\\u9053\\u3002",'
new_zh_head = '"' + NEW_HEAD + '": "' + ZH_HEAD + '",'
if old_zh_head in s:
    s = s.replace(old_zh_head, new_zh_head, 1)
    log.append('zh heading updated')
else:
    print('WARN: zh heading not found')

old_zh_lede = '"' + OLD_LEDE + '": "\\u6797\\u6587\\u5fd7\\u533b\\u751f\\u62e5\\u6709\\u8d85\\u8fc740\\u5e74\\u7684\\u4e2d\\u897f\\u533b\\u53cc\\u91cd\\u7ecf\\u9a8c\\u3002",'
new_zh_lede = '"' + NEW_LEDE + '": "' + ZH_LEDE + '",'
if old_zh_lede in s:
    s = s.replace(old_zh_lede, new_zh_lede, 1)
    log.append('zh lede updated')
else:
    print('WARN: zh lede not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('\n'.join(log))
