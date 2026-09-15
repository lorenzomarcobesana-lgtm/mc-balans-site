import re
with open('public/database-site.html') as f: s = f.read()
log = []

# --- 1. Nav links: prevent wrapping ---
old = 'nav.main-nav a{font-size:13.5px;color:var(--ink);opacity:.7;cursor:pointer;padding:8px 13px;border-radius:2px}'
new = 'nav.main-nav a{font-size:13.5px;color:var(--ink);opacity:.7;cursor:pointer;padding:8px 13px;border-radius:2px;white-space:nowrap}'
if old in s: s = s.replace(old, new); log.append('nav nowrap')

# --- 2. Replace i18n block ---
i18n_new = """const i18n={
en:{
home:'Home',conditions:'What We Treat',treatments:'Treatments',resources:'Resources',about:'About',contact:'Contact',onlineDiagnosis:'Online Diagnosis',
bookAppointment:'Book an appointment',bookNow:'Book now',
credibilityTitle:'Why do patients trust Dr. Lin?',
cred1Title:'Credible',cred1Text:'A practising, licensed medical doctor in the Netherlands.',
cred2Title:'Experienced',cred2Text:'40+ years of sustained practice across Chinese and Western medicine.',
cred3Title:'Respected',cred3Text:'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).',
cred4Title:'Successful',cred4Text:'Reviews supporting treatment effectiveness.',
insuranceBandLead:'Insurance:',
insuranceBandText:'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.',
whatWeTreat:'What We Treat',
tagTreatment:'Treatment',
arrowExplore:'Explore →',arrowView:'View →',arrowStart:'Start →',
explore:'Explore',
footerTagline:'Western & TCM, The Hague',
footerLed:'Led by Dr. Wenzhi Lin',
hours:'Mon–Fri, 9:30–17:00',
copyright:'© 2026 MC Balans',
loading:'Loading...',
secRecognition:'Recognition',secRedFlags:'Red Flags',secUnderstanding:'Understanding',
secApproach:'MC Balans Approach',secAssessment:'MC Balans Assessment',
secExpectations:'Expectations',secPractical:'Practical Information',secFAQ:'FAQ',
secTreatments:'Treatments',secPricing:'Pricing',secWhoWillTreat:'Who will treat me?',
secIntake:'Intake',secTheTreatment:'The treatment',secAftercare:'Aftercare',
secCombinesWith:'Combines well with',secFrequentlyAsked:'Frequently asked',
price:'Price',duration:'Duration',insurance:'Insurance',
practitioners:'Practitioners',treatsConditions:'Treats these conditions',
contentPending:'Content pending'
},
nl:{
home:'Home',conditions:'Wat we behandelen',treatments:'Behandelingen',resources:'Bronnen',about:'Over ons',contact:'Contact',onlineDiagnosis:'Online diagnose',
bookAppointment:'Maak een afspraak',bookNow:'Boek nu',
credibilityTitle:'Waarom vertrouwen patienten Dr. Lin?',
cred1Title:'Geloofwaardig',cred1Text:'Een praktiserend, bevoegd arts in Nederland.',
cred2Title:'Ervaren',cred2Text:'40+ jaar ervaring in zowel Chinese als Westerse geneeskunde.',
cred3Title:'Gerespecteerd',cred3Text:'Maandelijkse column in Medisch Dossier, NPO-documentaire, Ridder in de Orde van Oranje-Nassau (2012).',
cred4Title:'Succesvol',cred4Text:'Beoordelingen die de effectiviteit van de behandelingen ondersteunen.',
insuranceBandLead:'Verzekering:',
insuranceBandText:'Consultaties kunnen worden gedekt door de basisverzekering. TCM-behandelingen kunnen worden gedekt door een aanvullende verzekering. Wij helpen u graag dit te controleren.',
whatWeTreat:'Wat we behandelen',
tagTreatment:'Behandeling',
arrowExplore:'Verken →',arrowView:'Bekijk →',arrowStart:'Start →',
explore:'Ontdek',
footerTagline:'Westers & TCM, Den Haag',
footerLed:'Onder leiding van Dr. Wenzhi Lin',
hours:'Ma-Vr, 9:30-17:00',
copyright:'© 2026 MC Balans',
loading:'Laden...',
secRecognition:'Herkennen',secRedFlags:'Rode vlaggen',secUnderstanding:'Begrip',
secApproach:'MC Balans benadering',secAssessment:'MC Balans assessment',
secExpectations:'Verwachtingen',secPractical:'Praktische informatie',secFAQ:'Veelgestelde vragen',
secTreatments:'Behandelingen',secPricing:'Tarieven',secWhoWillTreat:'Wie behandelt mij?',
secIntake:'Intake',secTheTreatment:'De behandeling',secAftercare:'Nazorg',
secCombinesWith:'Combineert goed met',secFrequentlyAsked:'Veelgestelde vragen',
price:'Prijs',duration:'Duur',insurance:'Verzekering',
practitioners:'Behandelaars',treatsConditions:'Behandelt deze klachten',
contentPending:'Inhoud in behandeling'
},
zh:{
home:'首页',conditions:'治疗项目',treatments:'疗法',resources:'资源',about:'关于我们',contact:'联系',onlineDiagnosis:'在线诊断',
bookAppointment:'预约',bookNow:'立即预约',
credibilityTitle:'患者为何信任林医生？',
cred1Title:'可信',cred1Text:'在荷兰执业且持有执照的医生。',
cred2Title:'经验丰富',cred2Text:'在中西医领域拥有40余年的持续实践经验。',
cred3Title:'受人尊敬',cred3Text:'Medisch Dossier 月度专栏作者，NPO纪录片，奥兰治-拿骚骑士勋章（2012）。',
cred4Title:'成效显著',cred4Text:'支持治疗有效性的患者评价。',
insuranceBandLead:'保险：',
insuranceBandText:'咨询可能由基本医疗保险承保。中医治疗可能由补充保险承保。我们可协助您确认。',
whatWeTreat:'治疗项目',
tagTreatment:'疗法',
arrowExplore:'了解 →',arrowView:'查看 →',arrowStart:'开始 →',
explore:'探索',
footerTagline:'中西医结合，海牙',
footerLed:'由林文志医生带领',
hours:'周一至周五，9:30-17:00',
copyright:'© 2026 MC Balans',
loading:'加载中...',
secRecognition:'识别',secRedFlags:'警示信号',secUnderstanding:'理解',
secApproach:'MC Balans 方法',secAssessment:'MC Balans 评估',
secExpectations:'期望',secPractical:'实用信息',secFAQ:'常见问题',
secTreatments:'疗法',secPricing:'价格',secWhoWillTreat:'谁来治疗我？',
secIntake:'接诊',secTheTreatment:'治疗',secAftercare:'后续护理',
secCombinesWith:'可与以下疗法配合',secFrequentlyAsked:'常见问题',
price:'价格',duration:'时长',insurance:'保险',
practitioners:'治疗师',treatsConditions:'治疗的病症',
contentPending:'内容待完善'
}
};
function t(k){return (i18n[currentLang]&&i18n[currentLang][k])||i18n.en[k]||k;}"""

s, n = re.subn(r"const i18n=\{[\s\S]*?\n\};", i18n_new, s, count=1)
log.append('i18n replaced' if n else 'WARN: i18n block not found')

# --- 3. Replace applyNavTranslations with applyTranslations + observer ---
old_fn = r"function applyNavTranslations\(\)\{[\s\S]*?\}\);"
new_fn = """function applyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(i18n[currentLang]&&i18n[currentLang][k]) el.textContent=i18n[currentLang][k];
  });
  const map = {
    'Book an appointment': t('bookAppointment'),
    'Book now': t('bookNow'),
    'Why do patients trust Dr. Lin?': t('credibilityTitle'),
    'Credible': t('cred1Title'), 'Experienced': t('cred2Title'),
    'Respected': t('cred3Title'), 'Successful': t('cred4Title'),
    'A practising, licensed medical doctor in the Netherlands.': t('cred1Text'),
    '40+ years of sustained practice across Chinese and Western medicine.': t('cred2Text'),
    'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).': t('cred3Text'),
    'Reviews supporting treatment effectiveness.': t('cred4Text'),
    'Insurance:': t('insuranceBandLead'),
    'Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.': t('insuranceBandText'),
    'What We Treat': t('whatWeTreat'),
    'Treatment': t('tagTreatment'),
    'View →': t('arrowView'), 'Explore →': t('arrowExplore'), 'Start →': t('arrowStart'),
    'Content pending': t('contentPending'),
    'Loading...': t('loading'),
    'Recognition': t('secRecognition'), 'Red Flags': t('secRedFlags'),
    'Understanding': t('secUnderstanding'), 'MC Balans Approach': t('secApproach'),
    'MC Balans Assessment': t('secAssessment'), 'Expectations': t('secExpectations'),
    'Practical Information': t('secPractical'), 'FAQ': t('secFAQ'),
    'Who will treat me?': t('secWhoWillTreat'),
    'Intake': t('secIntake'), 'The treatment': t('secTheTreatment'),
    'Aftercare': t('secAftercare'), 'Combines well with': t('secCombinesWith'),
    'Frequently asked': t('secFrequentlyAsked'),
    'Price': t('price'), 'Duration': t('duration'), 'Insurance': t('insurance'),
    'Practitioners': t('practitioners'), 'Treats these conditions': t('treatsConditions'),
    'Western & TCM, The Hague': t('footerTagline'),
    'Led by Dr. Wenzhi Lin': t('footerLed'),
    'Mon–Fri, 9:30–17:00': t('hours'),
    'Explore': t('explore')
  };
  const walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  const nodes=[]; let n; while((n=walker.nextNode())) nodes.push(n);
  nodes.forEach(node=>{
    if(node.parentElement&&['SCRIPT','STYLE'].includes(node.parentElement.tagName)) return;
    const txt=node.nodeValue||''; const trimmed=txt.trim();
    if(map[trimmed]) node.nodeValue=txt.replace(trimmed, map[trimmed]);
  });
}
function setupTranslationObserver(){
  const app=document.getElementById('app');
  if(!app) return;
  let lock=false;
  const obs=new MutationObserver(()=>{
    if(lock) return; lock=true;
    applyTranslations();
    setTimeout(()=>{lock=false;},0);
  });
  obs.observe(app, {childList:true});
}"""
s, n = re.subn(old_fn, new_fn, s, count=1)
log.append('applyTranslations replaced' if n else 'WARN: applyNavTranslations not found')

# --- 4. setLang update ---
old_sl = "applyNavTranslations();route();}"
new_sl = "applyTranslations();route();}"
if old_sl in s: s = s.replace(old_sl, new_sl); log.append('setLang')
else: log.append('WARN: setLang pattern not found')

# --- 5. DOMContentLoaded update ---
old_dom = "document.addEventListener('DOMContentLoaded',()=>{route();});"
new_dom = "document.addEventListener('DOMContentLoaded',()=>{applyTranslations();route();setupTranslationObserver();});"
if old_dom in s: s = s.replace(old_dom, new_dom); log.append('DOMContentLoaded')
else: log.append('WARN: DOMContentLoaded not found')

with open('public/database-site.html', 'w') as f: f.write(s)
print('\n'.join(log))
