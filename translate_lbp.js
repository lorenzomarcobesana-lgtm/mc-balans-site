const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const nl = {
  recognition: `Aspecifieke lage rugpijn is pijn in de onderrug waarvoor geen enkel structureel probleem — zoals een breuk of een beknelde zenuw — volledig verklaart wat u voelt. Het is het meest voorkomende type lage rugpijn, en het kan nog steeds aanzienlijk, frustrerend en beperkend zijn, zelfs zonder een specifieke diagnose erachter.
U kunt het herkennen als:
●	Een zeurende pijn, stijfheid of scherpe pijn ergens langs de onderrug — van een doffe dagelijkse pijn tot pijn die het bukken, zitten of lang staan beperkt
●	Pijn die wordt beïnvloed door houding, beweging, stress of hoe moe u bent
●	Stijfheid, vooral 's ochtends vroeg of na lang zitten
●	Pijn die niet volledig is verdwenen ondanks rust, pijnstillers of eerdere behandeling
Als uw pijn uitstraalt naar uw been, volgt op een blessure, of plotseling en hevig opkwam, kan dat wijzen op iets specifiekers — zie het gedeelte hieronder over wanneer u het moet laten controleren.`,

  red_flags: `Voordat iets anders gebeurt, controleert MC Balans of uw klacht geen onmiddellijke of specialistische medische aandacht vereist. Plotselinge hevige pijn met gevoelloosheid, zwakte of verlies van blaascontrole vereist dringende medische aandacht. Neem direct contact op met uw huisarts of MC Balans — voordat u met een TCM-behandeling begint — als u ook het volgende opmerkt:
●	Pijn na een val, ongeval of blessure
●	Gevoelloosheid, tintelingen of zwakte die zich uitbreiden naar uw been of voet
●	Onverklaarbaar gewichtsverlies, koorts, of pijn die erger is 's nachts of in rust
●	Een geschiedenis van kanker, osteoporose of langdurig gebruik van steroïden
Deze tekenen kunnen wijzen op aandoeningen zoals een hernia, zenuwbeknelling, een breuk, infectie of, zelden, iets ernstigers — en ze vereisen eerst een conventionele medische beoordeling, niet acupunctuur. Als niets hiervan op u van toepassing is, valt uw pijn hoogstwaarschijnlijk in de aspecifieke categorie waar deze pagina over gaat.`,

  understanding: `De meeste lage rugpijn wordt niet veroorzaakt door schade die duidelijk zichtbaar is op een scan. In plaats daarvan is het vaak het gevolg van hoe uw rug wordt belast, hoe deze beweegt, hoe goed deze herstelt, en hoe uw zenuwstelsel pijnsignalen reguleert — allemaal factoren die pijn kunnen laten voortduren, zelfs nadat een oorspronkelijke trigger is genezen. Waar de pijn wordt gevoeld, is vaak niet waar het probleem begint of eindigt.
Dit is precies waarom MC Balans niet stopt bij het behandelen van het symptoom, maar probeert te begrijpen wat er onder de klacht ligt.`,

  expectations: `De meeste patiënten merken enige verlichting voordat hun klacht volledig is opgelost, maar het oplossen van terugkerende problemen vergt meestal meer dan één sessie — hoeveel, en hoe snel, verschilt van persoon tot persoon en hangt af van wat uw beoordeling vindt. Uw behandelaar geeft u een duidelijker beeld van wat u kunt verwachten zodra deze u heeft beoordeeld, en past het plan aan naarmate de behandeling vordert.`,

  insurance: `Consultaties en behandelingen kunnen geheel of gedeeltelijk worden vergoed, afhankelijk van of uw verzekering alternatieve/aanvullende zorg dekt (aanvullende verzekering) — wij helpen u dit graag controleren.`,

  pricing: `Beoordeling begint vanaf €35 voor een Westers geneeskundig consult (onder 20 minuten) of vanaf €45 voor een eerste TCM-consult. De prijs van de behandeling hangt af van wat wordt aanbevolen — bijvoorbeeld acupunctuur is €70 per sessie en cupping is €10.`,

  cta: `BEL`
};

const zh = {
  recognition: `非特异性下背痛是指下背部的疼痛，没有任何单一的结构性问题——如骨折或神经受压——能完全解释您所感受到的。它是最常见的下背痛类型，即使背后没有明确的诊断，它仍然可能是显著的、令人沮丧的、限制生活的。
您可能会将其识别为：
●	下背部任何位置的酸痛、僵硬或剧痛——从日常的钝痛到限制弯腰、久坐或久站 的疼痛
●	受姿势、运动、压力或疲劳影响的疼痛
●	僵硬，尤其是清晨或久坐之后
●	尽管休息、服用止痛药或经过既往治疗仍未完全缓解的疼痛
如果您的疼痛向下放射至腿部、发生在受伤之后，或突然剧烈出现，这可能指向更具体的问题——请参阅下方关于何时需要检查的部分。`,

  red_flags: `在其他一切之前，MC Balans 会先确认您的症状不需要紧急或专科医疗处理。伴随麻木、无力或膀胱控制丧失的突然剧痛需要紧急医疗处理。如果您还注意到以下情况，请及时联系您的家庭医生或 MC Balans——在开始任何中医治疗之前：
●	跌倒、事故或受伤后出现的疼痛
●	麻木、刺痛或无力向您的腿部或脚部蔓延
●	不明原因的体重减轻、发热，或夜间或静息时加重的疼痛
●	癌症、骨质疏松或长期使用类固醇的病史
这些迹象可能指向椎间盘突出、神经受压、骨折、感染，或罕见情况下更严重的问题——它们需要先接受常规医学评估，而不是针灸。如果这些都不适用于您，您的疼痛很可能属于本页讨论的非特异性类别。`,

  understanding: `大多数下背痛并非由扫描能清晰显示的损伤引起。相反，它通常与您的背部如何承受负荷、如何运动、恢复得如何，以及您的神经系统如何调节疼痛信号有关——所有这些都可能让疼痛持续，即使最初的诱因已经愈合。疼痛所感觉到的位置，往往不是问题开始或结束的地方。
这正是为什么 MC Balans 不止步于治疗症状，而是努力理解症状背后的原因。`,

  expectations: `大多数患者在症状完全解决之前会感到一些缓解，但解决反复出现的问题通常需要不止一次疗程——需要多少次、多快见效，因 人而异，取决于您的评估结果。您的治疗师会在评估后给您一个更清晰的预期，并随着治疗的进展调整计划。`,

  insurance: `咨询和治疗可能全部或部分由保险承保，具体取决于您的保险是否涵盖替代/辅助医疗（补充保险）——我们可协助您确认。`,

  pricing: `评估起价为€35（西医咨询，20分钟以内）或€45（首次中医咨询）。治疗费用取决于所推荐的内容——例如，针灸每次€70，拔罐€10。`,

  cta: `致电`
};

async function upsert(conditionId, fieldName, locale, value) {
  const ex = await pool.query(
    `SELECT id FROM translations WHERE condition_id = $1 AND field_name = $2 AND locale = $3`,
    [conditionId, fieldName, locale]
  );
  if (ex.rowCount > 0) {
    await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    return 'updated';
  }
  await pool.query(
    `INSERT INTO translations (condition_id, field_name, locale, value) VALUES ($1, $2, $3, $4)`,
    [conditionId, fieldName, locale, value]
  );
  return 'inserted';
}

async function main() {
  const r = await pool.query(`SELECT id FROM conditions WHERE slug = 'non-specific-lower-back-pain'`);
  if (r.rowCount === 0) { console.error('LBP not found'); process.exit(1); }
  const id = r.rows[0].id;
  let count = 0;
  for (const field of Object.keys(nl)) {
    await upsert(id, field, 'nl', nl[field]);
    await upsert(id, field, 'zh', zh[field]);
    count += 2;
  }
  console.log(`Done — LBP full record: ${count} rows for ${Object.keys(nl).length} fields × 2 locales.`);
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
