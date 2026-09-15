import json

with open('public/database-site.html', 'rb') as f:
    s = f.read()

log = []

nl = {
    'A <em>balanced</em> approach to the health of mind and body.': 'Een <em>gebalanceerde</em> benadering van de gezondheid van geest en lichaam.',
    'Dr. Wenzhi Lin brings over 40 years of dual experience.': 'Dr. Wenzhi Lin brengt meer dan 40 jaar dubbele ervaring met zich mee.',
    'Book an appointment': 'Maak een afspraak',
    'Book now': 'Boek nu',
    '>Recognition<': '>Herkennen<',
    '>Red Flags<': '>Rode vlaggen<',
    '>Understanding<': '>Begrijpen<',
    '>MC Balans Approach<': '>MC Balans benadering<',
    '>MC Balans Assessment<': '>MC Balans beoordeling<',
    '>Expectations<': '>Verwachtingen<',
    '>Practical Information<': '>Praktische informatie<',
    '>FAQ<': '>Veelgestelde vragen<',
    '>Who will treat me?<': '>Wie behandelt mij?<',
    '>Treatments<': '>Behandelingen<',
    '>Pricing<': '>Tarieven<',
    '>Intake<': '>Intake<',
    '>The treatment<': '>De behandeling<',
    '>Aftercare<': '>Nazorg<',
    '>Combines well with<': '>Combineert goed met<',
    '>Frequently asked<': '>Veelgestelde vragen<',
    '>Price<': '>Prijs<',
    '>Duration<': '>Duur<',
    '>Insurance<': '>Verzekering<',
    '>Practitioners<': '>Behandelaars<',
    '>Treats these conditions<': '>Behandelt deze klachten<',
    '>Content pending<': '>Inhoud in behandeling<',
    '>Why do patients trust Dr. Lin?<': '>Waarom vertrouwen patiënten Dr. Lin?<',
    '>Credible<': '>Geloofwaardig<',
    '>Experienced<': '>Ervaren<',
    '>Respected<': '>Gerespecteerd<',
    '>Successful<': '>Succesvol<',
    'A practising, licensed medical doctor in the Netherlands.': 'Een praktiserend, bevoegd arts in Nederland.',
    '40+ years of sustained practice across Chinese and Western medicine.': 'Meer dan 40 jaar ervaring in zowel Chinese als Westerse geneeskunde.',
    'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).': 'Maandelijkse column in Medisch Dossier, NPO-documentaire, Ridder in de Orde van Oranje-Nassau (2012).',
    'Reviews supporting treatment effectiveness.': 'Beoordelingen die de effectiviteit van de behandelingen ondersteunen.',
    'Insurance:': 'Verzekering:',
    'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.': 'Consultaties kunnen worden gedekt door de basisverzekering. TCM-behandelingen kunnen worden gedekt door een aanvullende verzekering. Wij helpen u graag dit te controleren.',
    '>Explore →<': '>Verken →<',
    '>View →<': '>Bekijk →<',
    '>Start →<': '>Start →<',
    '>Explore<': '>Ontdek<',
    'Western & TCM, The Hague': 'Westers & TCM, Den Haag',
    'Led by Dr. Wenzhi Lin': 'Onder leiding van Dr. Wenzhi Lin',
    'Mon–Fri, 9:30–17:00': 'Ma-Vr, 9:30-17:00',
    'About MC Balans': 'Over MC Balans',
    'Meet the team, see the clinic, check pricing, or read about our approach.': 'Ontmoet het team, bekijk de kliniek, controleer tarieven of lees over onze aanpak.',
    '>Our Team<': '>Ons team<',
    '>Our Clinic<': '>Onze kliniek<',
    '>Philosophy<': '>Filosofie<',
    'The space, in The Hague': 'De ruimte, in Den Haag',
    'What each treatment costs': 'Wat elke behandeling kost',
    'Vision & Mission': 'Visie en missie',
    'Our Philosophy': 'Onze filosofie',
    'Most patients book by phone — call directly, or send a message and expect a reply by email.': 'De meeste patiënten boeken telefonisch — bel direct, of stuur een bericht en ontvang een antwoord per e-mail.',
    '>Phone<': '>Telefoon<',
    '>Email<': '>E-mail<',
    '>Hours<': '>Openingstijden<',
    '>Name<': '>Naam<',
    '>Send message<': '>Bericht verzenden<',
    "Dr. Lin's monthly Medisch Dossier column, published natively.": "De maandelijkse Medisch Dossier-column van Dr. Lin, native gepubliceerd.",
    '>Acupuncture for knee injury<': '>Acupunctuur bij knieblessure<',
    '>Read →<': '>Lees →<',
    '>Resources<': '>Bronnen<',
    '>Contact<': '>Contact<'
}

zh = {
    'A <em>balanced</em> approach to the health of mind and body.': '身心健康的<em>平衡</em>之道。',
    'Dr. Wenzhi Lin brings over 40 years of dual experience.': '林文志医生拥有超过40年的中西医双重经验。',
    'Book an appointment': '预约',
    'Book now': '立即预约',
    '>Recognition<': '>识别<',
    '>Red Flags<': '>警示信号<',
    '>Understanding<': '>理解<',
    '>MC Balans Approach<': '>MC Balans 方法<',
    '>MC Balans Assessment<': '>MC Balans 评估<',
    '>Expectations<': '>期望<',
    '>Practical Information<': '>实用信息<',
    '>FAQ<': '>常见问题<',
    '>Who will treat me?<': '>谁来治疗我？<',
    '>Treatments<': '>疗法<',
    '>Pricing<': '>价格<',
    '>Intake<': '>接诊<',
    '>The treatment<': '>治疗<',
    '>Aftercare<': '>后续护理<',
    '>Combines well with<': '>可与以下疗法配合<',
    '>Frequently asked<': '>常见问题<',
    '>Price<': '>价格<',
    '>Duration<': '>时长<',
    '>Insurance<': '>保险<',
    '>Practitioners<': '>治疗师<',
    '>Treats these conditions<': '>治疗的病症<',
    '>Content pending<': '>内容待完善<',
    '>Why do patients trust Dr. Lin?<': '>患者为何信任林医生？<',
    '>Credible<': '>可信<',
    '>Experienced<': '>经验丰富<',
    '>Respected<': '>受人尊敬<',
    '>Successful<': '>成效显著<',
    'A practising, licensed medical doctor in the Netherlands.': '在荷兰执业且持有执照的医生。',
    '40+ years of sustained practice across Chinese and Western medicine.': '在中西医领域拥有40余年的持续实践经验。',
    'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).': 'Medisch Dossier 月度专栏作者，NPO纪录片，奥兰治-拿骚骑士勋章（2012）。',
    'Reviews supporting treatment effectiveness.': '支持治疗有效性的患者评价。',
    'Insurance:': '保险：',
    'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.': '咨询可能由基本医疗保险承保。中医治疗可能由补充保险承保。我们可协助您确认。',
    '>Explore →<': '>了解 →<',
    '>View →<': '>查看 →<',
    '>Start →<': '>开始 →<',
    '>Explore<': '>探索<',
    'Western & TCM, The Hague': '中西医结合，海牙',
    'Led by Dr. Wenzhi Lin': '由林文志医生带领',
    'Mon–Fri, 9:30–17:00': '周一至周五 9:30-17:00',
    'About MC Balans': '关于 MC Balans',
    'Meet the team, see the clinic, check pricing, or read about our approach.': '认识团队，查看诊所，了解价格，或阅读我们的方法。',
    '>Our Team<': '>我们的团队<',
    '>Our Clinic<': '>我们的诊所<',
    '>Philosophy<': '>理念<',
    'The space, in The Hague': '海牙的空间',
    'What each treatment costs': '每次治疗的费用',
    'Vision & Mission': '愿景与使命',
    'Our Philosophy': '我们的理念',
    'Most patients book by phone — call directly, or send a message and expect a reply by email.': '大多数患者通过电话预约——直接致电，或发送消息，我们会通过电子邮件回复。',
    '>Phone<': '>电话<',
    '>Email<': '>电子邮件<',
    '>Hours<': '>营业时间<',
    '>Name<': '>姓名<',
    '>Send message<': '>发送消息<',
    "Dr. Lin's monthly Medisch Dossier column, published natively.": '林医生在 Medisch Dossier 的月度专栏。',
    '>Acupuncture for knee injury<': '>针灸治疗膝关节损伤<',
    '>Read →<': '>阅读 →<',
    '>Resources<': '>资源<',
    '>Contact<': '>联系<'
}

def js_obj(d):
    parts = ['{']
    for k, v in d.items():
        parts.append('  ' + json.dumps(k, ensure_ascii=True) + ': ' + json.dumps(v, ensure_ascii=True) + ',')
    parts.append('}')
    return '\n'.join(parts)

override = (
    "/* === UI translation override === */\n"
    "const uiTr = {\n"
    "nl: " + js_obj(nl) + ",\n"
    "zh: " + js_obj(zh) + "\n"
    "};\n"
    "function tr(html){\n"
    "  if(typeof currentLang === 'undefined') return html;\n"
    "  if(currentLang === 'en') return html;\n"
    "  if(!uiTr || !uiTr[currentLang]) return html;\n"
    "  var m = uiTr[currentLang];\n"
    "  Object.keys(m).forEach(function(k){ html = html.split(k).join(m[k]); });\n"
    "  return html;\n"
    "}\n"
)

last_script = s.rfind(b'</script>')
if last_script == -1:
    log.append('FATAL: no </script> found')
else:
    s = s[:last_script] + override.encode('utf-8') + s[last_script:]
    log.append('1. tr() override appended before final </script>')

prefix = b"function renderResources(){app.innerHTML='"
idx = s.find(prefix)
if idx == -1:
    log.append('2. WARN renderResources prefix not found')
else:
    after = s[idx + len(prefix):]
    end_idx = after.find(b"';}")
    if end_idx == -1:
        log.append('2. WARN renderResources closing not found')
    else:
        s = s[:idx + len(prefix)] + b'tr(' + after[:end_idx + 1] + b')' + after[end_idx + 1:]
        log.append('2. renderResources wrapped')

prefix = b"function renderContact(){app.innerHTML='"
idx = s.find(prefix)
if idx == -1:
    log.append('3. WARN renderContact prefix not found')
else:
    after = s[idx + len(prefix):]
    end_idx = after.find(b"';}")
    if end_idx == -1:
        log.append('3. WARN renderContact closing not found')
    else:
        s = s[:idx + len(prefix)] + b'tr(' + after[:end_idx + 1] + b')' + after[end_idx + 1:]
        log.append('3. renderContact wrapped')

fs = s.find(b'<footer')
fe = s.find(b'</footer>', fs) if fs != -1 else -1
if fs == -1 or fe == -1:
    log.append('4. WARN footer not found')
else:
    fh = s[fs:fe]
    for label, key in [(b'What We Treat', b'conditions'), (b'Treatments', b'treatments'), (b'Resources', b'resources'), (b'About', b'about')]:
        old = b'>' + label + b'</a>'
        new = b' data-i18n="' + key + b'">' + label + b'</a>'
        if old in fh:
            fh = fh.replace(old, new, 1)
    for label, key in [(b'Explore', b'footerExplore'), (b'Contact', b'footerContact')]:
        old = b'<h5>' + label + b'</h5>'
        new = b'<h5 data-i18n="' + key + b'">' + label + b'</h5>'
        if old in fh:
            fh = fh.replace(old, new, 1)
    s = s[:fs] + fh + s[fe:]
    log.append('4. footer data-i18n attributes added')

with open('public/database-site.html', 'wb') as f:
    f.write(s)

print('\n'.join(log))
