const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const LOCALES = ['nl', 'zh'];

const categories = {
  'pain':                      { nl: { name: 'Pijn' },                                zh: { name: '疼痛' } },
  'stress':                    { nl: { name: 'Stress' },                              zh: { name: '压力' } },
  'allergies-seasonal-health': { nl: { name: 'Allergieën & seizoensgebonden gezondheid' }, zh: { name: '过敏与季节健康' } },
  'womens-health':             { nl: { name: 'Vrouwengezondheid' },                   zh: { name: '女性健康' } },
  'addiction':                 { nl: { name: 'Verslaving' },                          zh: { name: '成瘾' } },
  'beauty-treatments':         { nl: { name: 'Schoonheidsbehandelingen' },            zh: { name: '美容护理' } },
  'general-wellness':          { nl: { name: 'Algemeen welzijn' },                    zh: { name: '综合健康' } }
};

const conditions = {
  'burnout-work-related-stress': {
    nl: { name: 'Burn-out & werkgerelateerde stress',
          summary: 'Burn-out is een staat van fysieke en emotionele uitputting veroorzaakt door langdurige stress. Bij MC Balans bieden we persoonlijke ondersteuning om energie, veerkracht en algeheel welzijn te herstellen.' },
    zh: { name: '倦怠与工作压力',
          summary: '倦怠是由长期压力引起的身体和情感耗竭状态。在 MC Balans，我们提供个性化的支持，帮助恢复精力、韧性和整体健康。' }
  },
  'anxiety-nervous-tension': {
    nl: { name: 'Angst & nerveuze spanning',
          summary: 'Aanhoudende angst kan zowel het mentale als het fysieke welzijn beïnvloeden. Onze holistische aanpak is gericht op het verminderen van spanning, het herstellen van balans en het ondersteunen van emotionele gezondheid.' },
    zh: { name: '焦虑与紧张',
          summary: '持续的焦虑会影响心理和身体健康。我们的整体方法旨在帮助减轻紧张、恢复平衡并支持情绪健康。' }
  },
  'sleep-problems': {
    nl: { name: 'Slaapproblemen',
          summary: 'Slaap speelt een essentiële rol in fysieke en mentale gezondheid. We hanteren een persoonlijke aanpak om factoren te identificeren die uw slaap kunnen beïnvloeden en om langdurige verbetering te ondersteunen.' },
    zh: { name: '睡眠问题',
          summary: '睡眠对身心健康至关重要。我们采取个性化的方法来识别可能影响您睡眠的因素，并支持长期改善。' }
  },
  'fatigue-low-energy': {
    nl: { name: 'Vermoeidheid & weinig energie',
          summary: 'Aanhoudende vermoeidheid kan elk aspect van het dagelijks leven beïnvloeden. De behandeling richt zich op het begrijpen van mogelijke onderliggende factoren, terwijl energieniveaus en algeheel welzijn worden ondersteund.' },
    zh: { name: '疲劳与精力不足',
          summary: '持续的疲劳会影响日常生活的方方面面。治疗侧重于了解可能的潜在因素，同时支持能量水平和整体健康。' }
  },
  'hay-fever': {
    nl: { name: 'Hooikoorts',
          summary: 'Hooikoorts kan het comfort en de levenskwaliteit tijdens het allergieseizoen aanzienlijk beïnvloeden. We bieden persoonlijke behandelingen gericht op het beheersen van symptomen en het ondersteunen van het natuurlijke evenwicht van het lichaam.' },
    zh: { name: '花粉症',
          summary: '花粉症会显著影响过敏季节的舒适度和生活质量。我们提供个性化治疗，旨在帮助控制症状并支持身体的自然平衡。' }
  },
  'recurring-colds': {
    nl: { name: 'Terugkerende verkoudheid',
          summary: 'Frequente verkoudheid kan erop wijzen dat de weerstand van het lichaam baat kan hebben bij extra ondersteuning. We hanteren een holistische aanpak om het algehele welzijn en herstel te versterken.' },
    zh: { name: '反复感冒',
          summary: '频繁感冒可能表明身体的抵抗力需要额外支持。我们采取整体方法来增强整体健康和恢复能力。' }
  },
  'seasonal-depression': {
    nl: { name: 'Seizoensgebonden depressie',
          summary: 'Seizoensveranderingen kunnen de stemming, motivatie en energie beïnvloeden. Onze persoonlijke aanpak is gericht op het ondersteunen van emotioneel welzijn en het herstellen van balans gedurende het hele jaar.' },
    zh: { name: '季节性抑郁',
          summary: '季节变化会影响情绪、动力和精力。我们的个性化方法旨在支持情绪健康并在全年恢复平衡。' }
  },
  'menstrual-complaints': {
    nl: { name: 'Menstruatieklachten',
          summary: 'Menstruatiesymptomen kunnen sterk van persoon tot persoon verschillen. We creëren persoonlijke behandelplannen om hormonale balans te ondersteunen en het algehele welzijn te verbeteren.' },
    zh: { name: '月经不适',
          summary: '月经症状因人而异。我们制定个性化治疗计划以支持荷尔蒙平衡并改善整体健康。' }
  },
  'fertility-support': {
    nl: { name: 'Vruchtbaarheidsondersteuning',
          summary: 'Proberen zwanger te worden kan zowel lichamelijk als emotioneel veeleisend zijn. We bieden aanvullende zorg om uw vruchtbaarheidstraject te ondersteunen, naast conventionele medische behandeling waar passend.' },
    zh: { name: '生育支持',
          summary: '尝试受孕在身体和情感上都可能很有挑战。我们提供辅助护理，旨在支持您的生育历程，并在适当的情况下配合常规医学治疗。' }
  },
  'pregnancy-complaints': {
    nl: { name: 'Zwangerschapsklachten',
          summary: 'Zwangerschap brengt vele fysieke en emotionele veranderingen met zich mee. Onze behandelingen zijn afgestemd op het ondersteunen van comfort, welzijn en ontspanning tijdens de zwangerschap.' },
    zh: { name: '孕期不适',
          summary: '怀孕带来许多身体和情感变化。我们的治疗旨在支持整个孕期的舒适、健康和放松。' }
  },
  'menopause': {
    nl: { name: 'Menopauze',
          summary: 'Hormonale veranderingen tijdens de menopauze kunnen tot een breed scala aan symptomen leiden. We bieden persoonlijke zorg om het welzijn tijdens deze levensfase te ondersteunen.' },
    zh: { name: '更年期',
          summary: '更年期期间的荷尔蒙变化可能导致各种症状。我们提供个性化护理，帮助支持这一人生阶段的健康。' }
  },
  'migraines': {
    nl: { name: 'Migraine',
          summary: 'Migraine kan een aanzienlijke impact hebben op het dagelijks leven. We hanteren een geïndividualiseerde aanpak om symptomen te helpen beheersen en het welzijn op lange termijn te ondersteunen.' },
    zh: { name: '偏头痛',
          summary: '偏头痛会对日常生活产生重大影响。我们采取个性化的方法来帮助控制症状并支持长期健康。' }
  },
  'head-neck-facial-discomfort': {
    nl: { name: 'Hoofd-, nek- en gezichtsongemak',
          summary: 'Pijn en spanning in het hoofd, de nek of het gezicht kunnen vele mogelijke oorzaken hebben. Onze behandelingen zijn afgestemd op uw individuele symptomen en algehele gezondheid.' },
    zh: { name: '头部、颈部与面部不适',
          summary: '影响头部、颈部或面部的疼痛和紧张可能有多种原因。我们的治疗根据您的个人症状和整体健康状况量身定制。' }
  },
  'non-specific-lower-back-pain': {
    nl: { name: 'Aspecifieke lage rugpijn',
          summary: 'Aanhoudende lage rugpijn zonder een enkele identificeerbare structurele oorzaak. Bij MC Balans beoordelen we eerst conventioneel, en kijken vervolgens naar structurele, functionele en regulerende patronen — gecombineerd met Traditionele Chinese Geneeskunde waar passend — voordat we een plan aanbevelen.' },
    zh: { name: '非特异性下背痛',
          summary: '持续的下背痛，没有单一可识别的结构性原因。在 MC Balans，我们首先进行常规评估，然后结合结构、功能和调节模式——在适当情况下结合中医——再推荐治疗方案。' }
  },
  'joints-pain': {
    nl: { name: 'Gewrichtspijn',
          summary: 'Gewrichtspijn kan het dagelijkse bewegen moeilijker maken. De behandeling richt zich op het verbeteren van comfort, het ondersteunen van mobiliteit en het bevorderen van algeheel welzijn.' },
    zh: { name: '关节疼痛',
          summary: '关节疼痛会使日常活动更加困难。治疗侧重于改善舒适度、支持活动能力和促进整体健康。' }
  },
  'hip-pain': {
    nl: { name: 'Heuppijn',
          summary: 'Heuppijn kan beweging, houding en levenskwaliteit beïnvloeden. We hanteren een persoonlijke aanpak om herstel te ondersteunen en mobiliteit te verbeteren.' },
    zh: { name: '髋部疼痛',
          summary: '髋部疼痛会影响运动、姿势和生活质量。我们采取个性化的方法来支持恢复和改善活动能力。' }
  },
  'muscle-sport-injuries': {
    nl: { name: 'Spier- en sportblessures',
          summary: 'Of u nu herstelt van een blessure of omgaat met aanhoudende spierpijn, de behandeling is afgestemd op het ondersteunen van genezing, het verminderen van ongemak en het bevorderen van herstel.' },
    zh: { name: '肌肉与运动损伤',
          summary: '无论是从损伤中恢复还是应对持续的肌肉疼痛，治疗都是量身定制的，以支持愈合、减轻不适并促进恢复。' }
  },
  'fibromyalgia-nerve-related-pain': {
    nl: { name: 'Fibromyalgie & zenuwpijn',
          summary: 'Chronische pijncondities kunnen complex zijn en het dagelijks leven op vele manieren beïnvloeden. Onze holistische aanpak richt zich op het ondersteunen van symptoombestrijding en het verbeteren van algeheel welzijn.' },
    zh: { name: '纤维肌痛与神经痛',
          summary: '慢性疼痛状况可能很复杂，并以多种方式影响日常生活。我们的整体方法侧重于支持症状管理并改善整体健康。' }
  },
  'digestive-complaints': {
    nl: { name: 'Spijsverteringsklachten',
          summary: 'Spijsverteringsproblemen kunnen comfort, energie en algehele gezondheid beïnvloeden. We streven ernaar het spijsverteringswelzijn te ondersteunen via persoonlijke behandelplannen die op uw behoeften zijn afgestemd.' },
    zh: { name: '消化不适',
          summary: '消化问题会影响舒适度、能量和整体健康。我们通过根据您的需求量身定制的个性化治疗计划来支持消化健康。' }
  },
  'weight-management': {
    nl: { name: 'Gewichtsbeheer',
          summary: 'Duurzaam gewichtsbeheer omvat meer dan alleen dieet. We bieden persoonlijke begeleiding en aanvullende behandelingen om uw gezondheidsdoelen te ondersteunen.' },
    zh: { name: '体重管理',
          summary: '可持续的体重管理不仅仅是饮食。我们提供个性化指导和辅助治疗，以支持您的健康目标。' }
  },
  'eye-related-complaints': {
    nl: { name: 'Oogklachten',
          summary: 'Sommige oogsymptomen kunnen baat hebben bij aanvullende behandeling naast conventionele zorg. We hanteren een individuele aanpak op basis van uw symptomen en algehele gezondheid.' },
    zh: { name: '眼部不适',
          summary: '某些眼部症状可能受益于常规护理之外的辅助治疗。我们根据您的症状和整体健康状况采取个性化的方法。' }
  },
  'asthma': {
    nl: { name: 'Astma',
          summary: 'Astma kan de ademhaling en dagelijkse activiteiten beïnvloeden. Aanvullende behandelingen kunnen het algehele welzijn ondersteunen naast uw bestaande medische zorg.' },
    zh: { name: '哮喘',
          summary: '哮喘会影响呼吸和日常活动。辅助治疗可以在您现有的医疗护理之外帮助支持整体健康。' }
  },
  'hair-transplant-aftercare': {
    nl: { name: 'Nazorg haartransplantatie',
          summary: 'Goede nazorg speelt een belangrijke rol bij het herstel na een haartransplantatie. We bieden ondersteunende behandelingen die zijn ontworpen om genezing en algehele hoofdhuidgezondheid te bevorderen.' },
    zh: { name: '植发术后护理',
          summary: '适当的术后护理在植发后的恢复中起着重要作用。我们提供旨在促进愈合和整体头皮健康的支持性治疗。' }
  },
  'hair-loss': {
    nl: { name: 'Haaruitval',
          summary: 'Haaruitval kan vele verschillende oorzaken hebben en zowel het zelfvertrouwen als het welzijn beïnvloeden. We bieden persoonlijke ondersteuning gericht op het aanpakken van onderliggende factoren waar passend.' },
    zh: { name: '脱发',
          summary: '脱发可能由多种原因引起，并影响自信和健康。我们提供个性化支持，旨在适当解决潜在因素。' }
  },
  'smoking-addiction': {
    nl: { name: 'Rookverslaving',
          summary: 'Rookverslaving is een afhankelijkheid van nicotine die het moeilijk kan maken om te stoppen met roken ondanks de wens om te stoppen. De behandeling richt zich op het ondersteunen van het individu bij het verminderen of stoppen met roken en het aanpakken van de fysieke en gedragsmatige aspecten van nicotineafhankelijkheid.' },
    zh: { name: '烟瘾',
          summary: '烟瘾是对尼古丁的依赖，即使有戒烟的意愿也很难戒烟。治疗侧重于支持个人减少或停止吸烟，并解决尼古丁依赖的身体和行为方面。' }
  },
  'sugar-dependency': {
    nl: { name: 'Suikerverslaving',
          summary: 'Suikerverslaving verwijst naar een terugkerend verlangen naar of afhankelijkheid van zoete voeding en dranken, waardoor het moeilijk kan zijn om de suikerinname te verminderen. De behandeling richt zich op het begrijpen van individuele gewoonten en het ondersteunen van gezondere patronen rond voeding en consumptie.' },
    zh: { name: '糖依赖',
          summary: '糖依赖是指对甜食和饮料的反复渴望或依赖，这会使减少糖摄入量变得困难。治疗侧重于了解个人习惯并支持更健康的饮食和消费模式。' }
  }
};

const treatments = {
  'western-medicine-consultation': {
    nl: { name: 'Westers geneeskundig consult',
          summary: 'Een consult met Dr. Lin om uw symptomen, medische geschiedenis en individuele gezondheidsbehoeften te beoordelen, met een medisch perspectief naast de bredere zorgbenadering van MC Balans en om levensbedreigende medische aandoeningen uit te sluiten.' },
    zh: { name: '西医咨询',
          summary: '与林医生的咨询，评估您的症状、病史和个人健康需求，提供医学视角以及 MC Balans 更广泛的护理方法，并排除危及生命的医疗问题。' }
  },
  'tcm-consultation': {
    nl: { name: 'TCM-consult',
          summary: 'Een consult gericht op het begrijpen waarom uw lichaam mogelijk niet functioneert zoals het zou moeten, waarbij conventionele medische beoordeling wordt gecombineerd met een uitgebreide analyse van de structurele en functionele aspecten van het lichaam en, waar passend, de balans vanuit Traditionele Chinese Geneeskunde.' },
    zh: { name: '中医咨询',
          summary: '咨询侧重于了解您的身体为何可能无法正常运作，将常规医学评估与对身体结构和功能模式的深入分析相结合，并在适当的情况下结合中医平衡。' }
  },
  'acupuncture': {
    nl: { name: 'Acupunctuur',
          summary: 'Een traditionele Chinese geneeskundetechniek waarbij fijne naalden op specifieke punten van het lichaam worden geplaatst om spanning te verlichten en balans te herstellen.' },
    zh: { name: '针灸',
          summary: '一种传统中医技术，在身体特定穴位放置细针，以缓解紧张并恢复平衡。' }
  },
  'acupotomy': {
    nl: { name: 'Acupotomie',
          summary: 'Een gespecialiseerde techniek die acupunctuur combineert met een fijne chirurgische naald om chronische pijn te verlichten en spanning in spieren, pezen en gewrichten los te laten.' },
    zh: { name: '针刀',
          summary: '一种专业技术，将针灸与细小的外科针相结合，以缓解慢性疼痛并释放肌肉、肌腱和关节的紧张。' }
  },
  'cupping': {
    nl: { name: 'Cupping',
          summary: 'Een zuigtherapie waarbij kopjes op de huid worden geplaatst om de bloedsomloop te verbeteren en spierspanning los te laten.' },
    zh: { name: '拔罐',
          summary: '一种基于吸力的疗法，将罐置于皮肤上以改善循环并释放肌肉紧张。' }
  },
  'chinese-herbal-medicine': {
    nl: { name: 'Chinese kruidengeneeskunde',
          summary: 'Een individueel afgestemd kruidenrecept, bereid op basis van de specifieke symptomen en behandeldoelen van elke patiënt.' },
    zh: { name: '中药',
          summary: '根据每位患者的具体症状和治疗目标量身定制的个性化草药处方。' }
  },
  'nutrition-movement': {
    nl: { name: 'Voeding & beweging',
          summary: 'Persoonlijke begeleiding op het gebied van voeding en levensstijl die herstel ondersteunt en terugkerende klachten helpt voorkomen.' },
    zh: { name: '营养与运动',
          summary: '个性化的营养和生活方式指导，支持恢复并帮助预防复发性症状。' }
  },
  'prp-therapy': {
    nl: { name: 'PRP-therapie',
          summary: 'Een Platelet Rich Plasma-behandeling ter ondersteuning van de nazorg van haartransplantaties en bij haaruitval.' },
    zh: { name: 'PRP 治疗',
          summary: '一种用于支持植发术后护理和帮助治疗脱发的富血小板血浆治疗。' }
  },
  'moxa-therapy': {
    nl: { name: 'Moxa-therapie',
          summary: 'Een aanvullende techniek binnen de Traditionele Chinese Geneeskunde waarbij de warmte van een brandende moxa-stick (gemaakt van bijvoetkruid) wordt gebruikt om acupunctuurpunten te stimuleren.' },
    zh: { name: '艾灸',
          summary: '一种传统中医辅助技术，利用燃烧的艾条（由艾草制成）的热量刺激穴位。' }
  },
  'ear-acupuncture': {
    nl: { name: 'Ooracupunctuur',
          summary: 'Een specialisatie binnen acupunctuur waarbij zeer fijne naalden (of kleefpleisters) op specifieke punten van het uitwendige oor worden geplaatst.' },
    zh: { name: '耳针',
          summary: '针灸的一个专门领域，使用非常细的针（或耳穴贴）置于外耳特定穴位。' }
  },
  'online-tongue-diagnosis': {
    nl: { name: 'Online tongdiagnose',
          summary: 'Bij veel klachten hoeft u met de hedendaagse technologie uw huis niet meer te verlaten. Op basis van een foto van de tong en het beantwoorden van een paar eenvoudige vragen kunt u uw persoonlijke kruidenmengsel thuisgestuurd krijgen.' },
    zh: { name: '在线舌诊',
          summary: '对于许多症状，借助当今的技术，您不再需要离家。只需上传舌头的照片并回答几个简单的问题，您就可以让个人定制的草药配方寄送到家。' }
  }
};

async function upsert(entityColumn, entityId, fieldName, locale, value) {
  const existing = await pool.query(
    `SELECT id FROM translations WHERE ${entityColumn} = $1 AND field_name = $2 AND locale = $3`,
    [entityId, fieldName, locale]
  );
  if (existing.rowCount > 0) {
    await pool.query(
      `UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`,
      [value, existing.rows[0].id]
    );
    return 'updated';
  } else {
    await pool.query(
      `INSERT INTO translations (${entityColumn}, field_name, locale, value) VALUES ($1, $2, $3, $4)`,
      [entityId, fieldName, locale, value]
    );
    return 'inserted';
  }
}

async function processEntity(table, column, slug, data) {
  const r = await pool.query(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
  if (r.rowCount === 0) { console.log('  MISSING ' + table + ': ' + slug); return; }
  const id = r.rows[0].id;
  for (const locale of LOCALES) {
    if (!data[locale]) continue;
    for (const field of Object.keys(data[locale])) {
      await upsert(column, id, field, locale, data[locale][field]);
    }
  }
  console.log('  ✅ ' + table + ': ' + slug);
}

async function main() {
  console.log('\n=== CATEGORIES ===');
  for (const [slug, data] of Object.entries(categories)) await processEntity('categories', 'category_id', slug, data);

  console.log('\n=== CONDITIONS ===');
  for (const [slug, data] of Object.entries(conditions)) await processEntity('conditions', 'condition_id', slug, data);

  console.log('\n=== TREATMENTS ===');
  for (const [slug, data] of Object.entries(treatments)) await processEntity('treatments', 'treatment_id', slug, data);

  // Report totals
  const total = await pool.query(
    `SELECT locale, COUNT(*) AS n FROM translations WHERE locale IN ('nl','zh') GROUP BY locale ORDER BY locale`
  );
  console.log('\n=== TOTALS ===');
  total.rows.forEach(r => console.log('  ' + r.locale + ': ' + r.n + ' rows'));

  await pool.end();
  console.log('\nDone.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
