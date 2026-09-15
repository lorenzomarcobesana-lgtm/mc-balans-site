with open('public/database-site.html') as f: s = f.read()
log = []

# 1. Replace the i18n object with a full version
old_i18n = """const i18n={
en:{home:'Home',conditions:'What We Treat',treatments:'Treatments',resources:'Resources',about:'About',contact:'Contact',onlineDiagnosis:'Online Diagnosis'},
nl:{home:'Home',conditions:'Wat we behandelen',treatments:'Behandelingen',resources:'Bronnen',about:'Over ons',contact:'Contact',onlineDiagnosis:'Online diagnose'},
zh:{home:'首页',conditions:'治疗项目',treatments:'疗法',resources:'资源',about:'关于我们',contact:'联系',onlineDiagnosis:'在线诊断'}
};"""

new_i18n = """const i18n={
en:{home:'Home',conditions:'What We Treat',treatments:'Treatments',resources:'Resources',about:'About',contact:'Contact',onlineDiagnosis:'Online Diagnosis',
heroTitle:'A <em>balanced</em> approach to the health of mind and body.',heroLede:'Dr. Wenzhi Lin brings over 40 years of dual experience.',
bookAppointment:'Book an appointment',bookNow:'Book now',
credibilityTitle:'Why do patients trust Dr. Lin?',
cred1Title:'Credible',cred1Text:'A practising, licensed medical doctor in the Netherlands.',
cred2Title:'Experienced',cred2Text:'40+ years of sustained practice across Chinese and Western medicine.',
cred3Title:'Respected',cred3Text:'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).',
cred4Title:'Successful',cred4Text:'Reviews supporting treatment effectiveness.',
insuranceLabel:'Insurance:',insuranceText:'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.',
whatWeTreat:'What We Treat',tagTreatment:'Treatment',
arrowExplore:'Explore →',arrowView:'View →',arrowStart:'Start →',
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
hours:'Mon–Fri, 9:30–17:00',copyright:'© 2026 MC Balans'},
nl:{home:'Home',conditions:'Wat we behandelen',treatments:'Behandelingen',resources:'Bronnen',about:'Over ons',contact:'Contact',onlineDiagnosis:'Online diagnose',
heroTitle:'Een <em>gebalanceerde</em> benadering van de gezondheid van geest en lichaam.',heroLede:'Dr. Wenzhi Lin brengt meer dan 40 jaar dubbele ervaring met zich mee.',
bookAppointment:'Maak een afspraak',bookNow:'Boek nu',
credibilityTitle:'Waarom vertrouwen patiënten Dr. Lin?',
cred1Title:'Geloofwaardig',cred1Text:'Een praktiserend, bevoegd arts in Nederland.',
cred2Title:'Ervaren',cred2Text:'Meer dan 40 jaar ervaring in zowel Chinese als Westerse geneeskunde.',
cred3Title:'Gerespecteerd',cred3Text:'Maandelijkse column in Medisch Dossier, NPO-documentaire, Ridder in de Orde van Oranje-Nassau (2012).',
cred4Title:'Succesvol',cred4Text:'Beoordelingen die de effectiviteit van de behandelingen ondersteunen.',
insuranceLabel:'Verzekering:',insuranceText:'Consultaties kunnen worden gedekt door de basisverzekering. TCM-behandelingen kunnen worden gedekt door een aanvullende verzekering. Wij helpen u graag dit te controleren.',
whatWeTreat:'Wat we behandelen',tagTreatment:'Behandeling',
arrowExplore:'Verken →',arrowView:'Bekijk →',arrowStart:'Start →',
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
hours:'Ma-Vr, 9:30-17:00',copyright:'© 2026 MC Balans'},
zh:{home:'首页',conditions:'治疗项目',treatments:'疗法',resources:'资源',about:'关于我们',contact:'联系',onlineDiagnosis:'在线诊断',
heroTitle:'身心健康的<em>平衡</em>之道。',heroLede:'林文志医生拥有超过40年的中西医双重经验。',
bookAppointment:'预约',bookNow:'立即预约',
credibilityTitle:'患者为何信任林医生？',
cred1Title:'可信',cred1Text:'在荷兰执业且持有执照的医生。',
cred2Title:'经验丰富',cred2Text:'在中西医领域拥有40余年的持续实践经验。',
cred3Title:'受人尊敬',cred3Text:'Medisch Dossier 月度专栏作者，NPO纪录片，奥兰治-拿骚骑士勋章（2012）。',
cred4Title:'成效显著',cred4Text:'支持治疗有效性的患者评价。',
insuranceLabel:'保险：',insuranceText:'咨询可能由基本医疗保险承保。中医治疗可能由补充保险承保。我们可协助您确认。',
whatWeTreat:'治疗项目',tagTreatment:'疗法',
arrowExplore:'了解 →',arrowView:'查看 →',arrowStart:'开始 →',
secRecognition:'识别',secRedFlags:'警示信号',secUnderstanding:'理解',
secApproach:'MC Balans 方法',secAssessment:'MC Balans 评估',
secExpectations:'期望',secPractical:'实用信息',secFAQ:'常见问题',
secTreatments:'疗法',secPricing:'价格',secWhoWillTreat:'谁来治疗我？',
secIntake:'接诊',secTheTreatment:'治疗',secAftercare:'后续护理',
secCombinesWith:'可与以下疗法配合',secFrequentlyAsked:'常见问题',
price:'价格',duration:'时长',insurance:'保险',
practitioners:'治疗师',treatsConditions:'治疗的病症',
contentPending:'内容待完善',loading:'加载中...',
footerTagline:'中西医结合，海牙',footerLed:'由林文志医生带领',
hours:'周一至周五 9:30-17:00',copyright:'© 2026 MC Balans'}
};
function t(k){return (i18n[currentLang]&&i18n[currentLang][k])||i18n.en[k]||k;}
function tr(html){
  if(currentLang==='en')return html;
  const m={
    'A <em>balanced</em> approach to the health of mind and body.':t('heroTitle'),
    'Dr. Wenzhi Lin brings over 40 years of dual experience.':t('heroLede'),
    '>Book an appointment<':'>'+t('bookAppointment')+'<',
    '>Book now<':'>'+t('bookNow')+'<',
    '>Why do patients trust Dr. Lin?<':'>'+t('credibilityTitle')+'<',
    '>Credible<':'>'+t('cred1Title')+'<',
    '>Experienced<':'>'+t('cred2Title')+'<',
    '>Respected<':'>'+t('cred3Title')+'<',
    '>Successful<':'>'+t('cred4Title')+'<',
    'A practising, licensed medical doctor in the Netherlands.':t('cred1Text'),
    '40+ years of sustained practice across Chinese and Western medicine.':t('cred2Text'),
    'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).':t('cred3Text'),
    'Reviews supporting treatment effectiveness.':t('cred4Text'),
    'Insurance:':t('insuranceLabel'),
    'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.':t('insuranceText'),
    '>What We Treat<':'>'+t('whatWeTreat')+'<',
    '>Treatment<':'>'+t('tagTreatment')+'<',
    '>Explore →<':'>'+t('arrowExplore')+'<',
    '>View →<':'>'+t('arrowView')+'<',
    '>Start →<':'>'+t('arrowStart')+'<',
    '>Recognition<':'>'+t('secRecognition')+'<',
    '>Red Flags<':'>'+t('secRedFlags')+'<',
    '>Understanding<':'>'+t('secUnderstanding')+'<',
    '>MC Balans Approach<':'>'+t('secApproach')+'<',
    '>MC Balans Assessment<':'>'+t('secAssessment')+'<',
    '>Expectations<':'>'+t('secExpectations')+'<',
    '>Practical Information<':'>'+t('secPractical')+'<',
    '>FAQ<':'>'+t('secFAQ')+'<',
    '>Who will treat me?<':'>'+t('secWhoWillTreat')+'<',
    '>Treatments<':'>'+t('secTreatments')+'<',
    '>Pricing<':'>'+t('secPricing')+'<',
    '>Content pending<':'>'+t('contentPending')+'<',
    '>Intake<':'>'+t('secIntake')+'<',
    '>The treatment<':'>'+t('secTheTreatment')+'<',
    '>Aftercare<':'>'+t('secAftercare')+'<',
    '>Combines well with<':'>'+t('secCombinesWith')+'<',
    '>Frequently asked<':'>'+t('secFrequentlyAsked')+'<',
    '>Price<':'>'+t('price')+'<',
    '>Duration<':'>'+t('duration')+'<',
    '>Insurance<':'>'+t('insurance')+'<',
    '>Practitioners<':'>'+t('practitioners')+'<',
    '>Treats these conditions<':'>'+t('treatsConditions')+'<'
  };
  Object.keys(m).forEach(k=>{html=html.split(k).join(m[k]);});
  return html;
}"""

if old_i18n in s:
    s = s.replace(old_i18n, new_i18n); log.append('i18n + t() + tr() installed')
else:
    print('WARN: i18n block not found in expected form')

# 2. Broaden applyNavTranslations to handle any [data-i18n] element (nav + footer)
old_fn = "function applyNavTranslations(){document.querySelectorAll('nav.main-nav a[data-i18n]').forEach(a=>{const k=a.getAttribute('data-i18n');if(i18n[currentLang]&&i18n[currentLang][k]){a.textContent=i18n[currentLang][k];}});}"
new_fn = "function applyNavTranslations(){document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(i18n[currentLang]&&i18n[currentLang][k]){el.textContent=i18n[currentLang][k];}});}"
if old_fn in s: s = s.replace(old_fn, new_fn); log.append('applyNavTranslations broadened')
else: print('WARN: applyNavTranslations not found')

# 3. Wrap every app.innerHTML=html with tr()
count_before = s.count('app.innerHTML=html;')
s = s.replace('app.innerHTML=html;', 'app.innerHTML=tr(html);')
log.append('wrapped %d app.innerHTML=html calls' % count_before)

# 4. Translate loading message
old_load = "app.innerHTML='<div class=\"loading\">Loading...</div>';"
new_load = "app.innerHTML='<div class=\"loading\">'+t('loading')+'</div>';"
count_load = s.count(old_load)
s = s.replace(old_load, new_load)
log.append('wrapped %d loading messages' % count_load)

# 5. Add data-i18n to footer elements
s = s.replace('<p>Western & TCM, The Hague</p>', '<p data-i18n="footerTagline">Western & TCM, The Hague</p>')
s = s.replace('<p>Led by Dr. Wenzhi Lin</p>', '<p data-i18n="footerLed">Led by Dr. Wenzhi Lin</p>')
s = s.replace('<p>Mon–Fri, 9:30–17:00</p>', '<p data-i18n="hours">Mon–Fri, 9:30–17:00</p>')
s = s.replace('<div class="footer-bottom">© 2026 MC Balans</div>', '<div class="footer-bottom" data-i18n="copyright">© 2026 MC Balans</div>')
log.append('footer data-i18n added')

with open('public/database-site.html', 'w') as f: f.write(s)
print('\n'.join(log))
