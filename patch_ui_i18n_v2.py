import re

# ---------- Read as bytes ----------
with open('public/database-site.html', 'rb') as f:
    s = f.read()

log = []

# ---------- 1. Replace the i18n block (byte-level, regex on markers) ----------
# Find "const i18n={" and the matching "};"
m_start = s.find(b'const i18n=')
if m_start == -1:
    print('FATAL: const i18n= not found')
    exit(1)
m_end = s.find(b'};', m_start)
if m_end == -1:
    print('FATAL: end of i18n block not found')
    exit(1)
m_end += 2

# Build the new i18n block (as Python string, encoded to UTF-8)
new_i18n = """const i18n={
en:{
home:'Home',conditions:'What We Treat',treatments:'Treatments',resources:'Resources',about:'About',contact:'Contact',onlineDiagnosis:'Online Diagnosis',
bookAppointment:'Book an appointment',bookNow:'Book now',
heroTitle:'A <em>balanced</em> approach to the health of mind and body.',heroLede:'Dr. Wenzhi Lin brings over 40 years of dual experience.',
credibilityTitle:'Why do patients trust Dr. Lin?',
cred1Title:'Credible',cred1Text:'A practising, licensed medical doctor in the Netherlands.',
cred2Title:'Experienced',cred2Text:'40+ years of sustained practice across Chinese and Western medicine.',
cred3Title:'Respected',cred3Text:'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).',
cred4Title:'Successful',cred4Text:'Reviews supporting treatment effectiveness.',
insuranceLabel:'Insurance:',insuranceText:'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.',
whatWeTreat:'What We Treat',tagTreatment:'Treatment',
arrowExplore:'Explore \\u2192',arrowView:'View \\u2192',arrowStart:'Start \\u2192',
secRecognition:'Recognition',secRedFlags:'Red Flags',secUnderstanding:'Understanding',
secApproach:'MC Balans Approach',secAssessment:'MC Balans Assessment',
secExpectations:'Expectations',secPractical:'Practical Information',secFAQ:'FAQ',
secTreatments:'Treatments',secPricing:'Pricing',secWhoWillTreat:'Who will treat me?',
secIntake:'Intake',secTheTreatment:'The treatment',secAftercare:'Aftercare',
secCombinesWith:'Combines well with',secFrequentlyAsked:'Frequently asked',
price:'Price',duration:'Duration',insurance:'Insurance',
practitioners:'Practitioners',treatsConditions:'Treats these conditions',
contentPending:'Content pending',loading:'Loading...',
footerTagline:'Western & TCM, The Hague',footerLed:'Led by Dr. Wenzhi Lin',
hours:'Mon\\u2013Fri, 9:30\\u201317:00',copyright:'\\u00a9 2026 MC Balans'},
nl:{
home:'Home',conditions:'Wat we behandelen',treatments:'Behandelingen',resources:'Bronnen',about:'Over ons',contact:'Contact',onlineDiagnosis:'Online diagnose',
bookAppointment:'Maak een afspraak',bookNow:'Boek nu',
heroTitle:'Een <em>gebalanceerde</em> benadering van de gezondheid van geest en lichaam.',heroLede:'Dr. Wenzhi Lin brengt meer dan 40 jaar dubbele ervaring met zich mee.',
credibilityTitle:'Waarom vertrouwen pati\\u00ebnten Dr. Lin?',
cred1Title:'Geloofwaardig',cred1Text:'Een praktiserend, bevoegd arts in Nederland.',
cred2Title:'Ervaren',cred2Text:'Meer dan 40 jaar ervaring in zowel Chinese als Westerse geneeskunde.',
cred3Title:'Gerespecteerd',cred3Text:'Maandelijkse column in Medisch Dossier, NPO-documentaire, Ridder in de Orde van Oranje-Nassau (2012).',
cred4Title:'Succesvol',cred4Text:'Beoordelingen die de effectiviteit van de behandelingen ondersteunen.',
insuranceLabel:'Verzekering:',insuranceText:'Consultaties kunnen worden gedekt door de basisverzekering. TCM-behandelingen kunnen worden gedekt door een aanvullende verzekering. Wij helpen u graag dit te controleren.',
whatWeTreat:'Wat we behandelen',tagTreatment:'Behandeling',
arrowExplore:'Verken \\u2192',arrowView:'Bekijk \\u2192',arrowStart:'Start \\u2192',
secRecognition:'Herkennen',secRedFlags:'Rode vlaggen',secUnderstanding:'Begrijpen',
secApproach:'MC Balans benadering',secAssessment:'MC Balans beoordeling',
secExpectations:'Verwachtingen',secPractical:'Praktische informatie',secFAQ:'Veelgestelde vragen',
secTreatments:'Behandelingen',secPricing:'Tarieven',secWhoWillTreat:'Wie behandelt mij?',
secIntake:'Intake',secTheTreatment:'De behandeling',secAftercare:'Nazorg',
secCombinesWith:'Combineert goed met',secFrequentlyAsked:'Veelgestelde vragen',
price:'Prijs',duration:'Duur',insurance:'Verzekering',
practitioners:'Behandelaars',treatsConditions:'Behandelt deze klachten',
contentPending:'Inhoud in behandeling',loading:'Laden...',
footerTagline:'Westers & TCM, Den Haag',footerLed:'Onder leiding van Dr. Wenzhi Lin',
hours:'Ma-Vr, 9:30-17:00',copyright:'\\u00a9 2026 MC Balans'},
zh:{
home:'\\u9996\\u9875',conditions:'\\u6cbb\\u7597\\u9879\\u76ee',treatments:'\\u7597\\u6cd5',resources:'\\u8d44\\u6e90',about:'\\u5173\\u4e8e\\u6211\\u4eec',contact:'\\u8054\\u7cfb',onlineDiagnosis:'\\u5728\\u7ebf\\u8bca\\u65ad',
bookAppointment:'\\u9884\\u7ea6',bookNow:'\\u7acb\\u5373\\u9884\\u7ea6',
heroTitle:'\\u8eab\\u5fc3\\u5065\\u5eb7\\u7684<em>\\u5e73\\u8861</em>\\u4e4b\\u9053\\u3002',heroLede:'\\u6797\\u6587\\u5fd7\\u533b\\u751f\\u62e5\\u6709\\u8d85\\u8fc740\\u5e74\\u7684\\u4e2d\\u897f\\u533b\\u53cc\\u91cd\\u7ecf\\u9a8c\\u3002',
credibilityTitle:'\\u60a3\\u8005\\u4e3a\\u4f55\\u4fe1\\u4efb\\u6797\\u533b\\u751f\\uff1f',
cred1Title:'\\u53ef\\u4fe1',cred1Text:'\\u5728\\u8377\\u5170\\u6267\\u4e1a\\u4e14\\u6301\\u6709\\u6267\\u7167\\u7684\\u533b\\u751f\\u3002',
cred2Title:'\\u7ecf\\u9a8c\\u4e30\\u5bcc',cred2Text:'\\u5728\\u4e2d\\u897f\\u533b\\u9886\\u57df\\u62e5\\u670940\\u4f59\\u5e74\\u7684\\u6301\\u7eed\\u5b9e\\u8df5\\u7ecf\\u9a8c\\u3002',
cred3Title:'\\u53d7\\u4eba\\u5c0a\\u656c',cred3Text:'Medisch Dossier \\u6708\\u5ea6\\u4e13\\u680f\\u4f5c\\u8005\\uff0cNPO\\u7eaa\\u5f55\\u7247\\uff0c\\u5965\\u5170\\u6cbb-\\u62ff\\u9a9a\\u9a91\\u58eb\\u52cb\\u7ae0\\uff082012\\uff09\\u3002',
cred4Title:'\\u6210\\u6548\\u663e\\u8457',cred4Text:'\\u652f\\u6301\\u6cbb\\u7597\\u6709\\u6548\\u6027\\u7684\\u60a3\\u8005\\u8bc4\\u4ef7\\u3002',
insuranceLabel:'\\u4fdd\\u9669\\uff1a',insuranceText:'\\u54a8\\u8be2\\u53ef\\u80fd\\u7531\\u57fa\\u672c\\u533b\\u7597\\u4fdd\\u9669\\u627f\\u4fdd\\u3002\\u4e2d\\u533b\\u6cbb\\u7597\\u53ef\\u80fd\\u7531\\u8865\\u5145\\u4fdd\\u9669\\u627f\\u4fdd\\u3002\\u6211\\u4eec\\u53ef\\u534f\\u52a9\\u60a8\\u786e\\u8ba4\\u3002',
whatWeTreat:'\\u6cbb\\u7597\\u9879\\u76ee',tagTreatment:'\\u7597\\u6cd5',
arrowExplore:'\\u4e86\\u89e3 \\u2192',arrowView:'\\u67e5\\u770b \\u2192',arrowStart:'\\u5f00\\u59cb \\u2192',
secRecognition:'\\u8bc6\\u522b',secRedFlags:'\\u8b66\\u793a\\u4fe1\\u53f7',secUnderstanding:'\\u7406\\u89e3',
secApproach:'MC Balans \\u65b9\\u6cd5',secAssessment:'MC Balans \\u8bc4\\u4f30',
secExpectations:'\\u671f\\u671b',secPractical:'\\u5b9e\\u7528\\u4fe1\\u606f',secFAQ:'\\u5e38\\u89c1\\u95ee\\u9898',
secTreatments:'\\u7597\\u6cd5',secPricing:'\\u4ef7\\u683c',secWhoWillTreat:'\\u8c01\\u6765\\u6cbb\\u7597\\u6211\\uff1f',
secIntake:'\\u63a5\\u8bca',secTheTreatment:'\\u6cbb\\u7597',secAftercare:'\\u540e\\u7eed\\u62a4\\u7406',
secCombinesWith:'\\u53ef\\u4e0e\\u4ee5\\u4e0b\\u7597\\u6cd5\\u914d\\u5408',secFrequentlyAsked:'\\u5e38\\u89c1\\u95ee\\u9898',
price:'\\u4ef7\\u683c',duration:'\\u65f6\\u957f',insurance:'\\u4fdd\\u9669',
practitioners:'\\u6cbb\\u7597\\u5e08',treatsConditions:'\\u6cbb\\u7597\\u7684\\u75c5\\u75c7',
contentPending:'\\u5185\\u5bb9\\u5f85\\u5b8c\\u5584',loading:'\\u52a0\\u8f7d\\u4e2d...',
footerTagline:'\\u4e2d\\u897f\\u533b\\u7ed3\\u5408\\uff0c\\u6d77\\u7259',footerLed:'\\u7531\\u6797\\u6587\\u5fd7\\u533b\\u751f\\u5e26\\u9886',
hours:'\\u5468\\u4e00\\u81f3\\u5468\\u4e94 9:30-17:00',copyright:'\\u00a9 2026 MC Balans'}
};
function t(k){return (i18n[currentLang]&&i18n[currentLang][k])||i18n.en[k]||k;}
function tr(html){
if(currentLang==='en')return html;
const m=[
['A <em>balanced</em> approach to the health of mind and body.',t('heroTitle')],
['Dr. Wenzhi Lin brings over 40 years of dual experience.',t('heroLede')],
['>Book an appointment<','>'+t('bookAppointment')+'<'],
['>Book now<','>'+t('bookNow')+'<'],
['>Why do patients trust Dr. Lin?<','>'+t('credibilityTitle')+'<'],
['>Credible<','>'+t('cred1Title')+'<'],
['>Experienced<','>'+t('cred2Title')+'<'],
['>Respected<','>'+t('cred3Title')+'<'],
['>Successful<','>'+t('cred4Title')+'<'],
['A practising, licensed medical doctor in the Netherlands.',t('cred1Text')],
['40+ years of sustained practice across Chinese and Western medicine.',t('cred2Text')],
['Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).',t('cred3Text')],
['Reviews supporting treatment effectiveness.',t('cred4Text')],
['Insurance:',t('insuranceLabel')],
['Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.',t('insuranceText')],
['>What We Treat<','>'+t('whatWeTreat')+'<'],
['>Treatment<','>'+t('tagTreatment')+'<'],
['>Explore \\u2192<','>'+t('arrowExplore')+'<'],
['>View \\u2192<','>'+t('arrowView')+'<'],
['>Start \\u2192<','>'+t('arrowStart')+'<'],
['>Recognition<','>'+t('secRecognition')+'<'],
['>Red Flags<','>'+t('secRedFlags')+'<'],
['>Understanding<','>'+t('secUnderstanding')+'<'],
['>MC Balans Approach<','>'+t('secApproach')+'<'],
['>MC Balans Assessment<','>'+t('secAssessment')+'<'],
['>Expectations<','>'+t('secExpectations')+'<'],
['>Practical Information<','>'+t('secPractical')+'<'],
['>FAQ<','>'+t('secFAQ')+'<'],
['>Who will treat me?<','>'+t('secWhoWillTreat')+'<'],
['>Treatments<','>'+t('secTreatments')+'<'],
['>Pricing<','>'+t('secPricing')+'<'],
['>Content pending<','>'+t('contentPending')+'<'],
['>Intake<','>'+t('secIntake')+'<'],
['>The treatment<','>'+t('secTheTreatment')+'<'],
['>Aftercare<','>'+t('secAftercare')+'<'],
['>Combines well with<','>'+t('secCombinesWith')+'<'],
['>Frequently asked<','>'+t('secFrequentlyAsked')+'<'],
['>Price<','>'+t('price')+'<'],
['>Duration<','>'+t('duration')+'<'],
['>Insurance<','>'+t('insurance')+'<'],
['>Practitioners<','>'+t('practitioners')+'<'],
['>Treats these conditions<','>'+t('treatsConditions')+'<']
];
for(let i=0;i<m.length;i++){html=html.split(m[i][0]).join(m[i][1]);}
return html;
}"""

s = s[:m_start] + new_i18n.encode('utf-8') + s[m_end:]
log.append('1. i18n block + t() + tr() replaced')

# ---------- 2. Broaden applyNavTranslations selector ----------
old_sel = b"document.querySelectorAll('nav.main-nav a[data-i18n]').forEach(a=>{const k=a.getAttribute('data-i18n');if(i18n[currentLang]&&i18n[currentLang][k]){a.textContent=i18n[currentLang][k];}});"
new_sel = b"document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(i18n[currentLang]&&i18n[currentLang][k]){el.textContent=i18n[currentLang][k];}});"
if old_sel in s:
    s = s.replace(old_sel, new_sel)
    log.append('2. applyNavTranslations selector broadened')
else:
    print('WARN: applyNavTranslations body not found')

# ---------- 3. Wrap every app.innerHTML=html with tr() ----------
cnt = s.count(b'app.innerHTML=html;')
s = s.replace(b'app.innerHTML=html;', b'app.innerHTML=tr(html);')
log.append('3. wrapped %d app.innerHTML=html occurrences' % cnt)

# ---------- 4. Wrap loading messages ----------
load_before = b"app.innerHTML='<div class=\"loading\">Loading...</div>';"
cnt_load = s.count(load_before)
s = s.replace(load_before, b"app.innerHTML='<div class=\"loading\">'+t('loading')+'</div>';")
log.append('4. wrapped %d loading messages' % cnt_load)

# ---------- 5. Footer data-i18n ----------
s = s.replace(b'<p>Western & TCM, The Hague</p>', b'<p data-i18n="footerTagline">Western & TCM, The Hague</p>')
s = s.replace(b'<p>Led by Dr. Wenzhi Lin</p>', b'<p data-i18n="footerLed">Led by Dr. Wenzhi Lin</p>')
s = s.replace(b'<p>Mon\xe2\x80\x93Fri, 9:30\xe2\x80\x9317:00</p>', b'<p data-i18n="hours">Mon\xe2\x80\x93Fri, 9:30\xe2\x80\x9317:00</p>')
log.append('5. footer data-i18n added')

# ---------- Write ----------
with open('public/database-site.html', 'wb') as f:
    f.write(s)

print('\n'.join(log))
