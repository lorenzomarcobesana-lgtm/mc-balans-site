const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const translations = {
  'SHARED-0001': {
    nl: "Na het intakegesprek stellen patiënt en arts samen een persoonlijk behandelplan op, met een inschatting van het aantal benodigde sessies en een realistisch verwacht resultaat, zodat patiënten hun eigen weloverwogen beslissingen over hun gezondheid kunnen nemen.",
    zh: "接诊检查后，患者和医生将共同制定个人治疗计划，包括所需疗程数量的估计和切合实际的预期结果，使患者能够就自身健康做出明智的决定。"
  },
  'SHARED-0002': {
    nl: "Bij aankomst vult u een intakeformulier in met uw medische geschiedenis, huidige symptomen en de reden van uw bezoek. Zodra dit is ingevuld, wordt u binnengeroepen voor uw consult met Dr. Lin, die uw zorgen bespreekt en de passende medische beoordeling uitvoert.",
    zh: "到达后，您将填写一份接诊表格，涵盖您的病史、当前症状和就诊原因。填写完成后，您将被叫入与林医生进行咨询，林医生将讨论您的疑虑并进行适当的医学评估。"
  },
  'SHARED-0003': {
    nl: "Bij aankomst vult u een intakeformulier in met uw persoonlijke gegevens en verzekeringsgegevens. Vervolgens wordt u binnengeroepen voor uw consult met een van onze TCM-behandelaars, die uw zorgen bespreekt en een beoordeling uitvoert vanuit het perspectief van de Traditionele Chinese Geneeskunde.",
    zh: "到达后，您将填写一份包含个人信息和保险信息的接诊表格。随后您将被叫入与我们的一位中医师进行咨询，中医师将讨论您的疑虑并从中医角度进行评估。"
  },
  'SHARED-0004': {
    nl: "U kunt de factuur indienen bij uw zorgverzekeraar als u aanvullend verzekerd bent voor alternatieve zorg.",
    zh: "如果您额外投保了替代疗法保险，您可以向健康保险公司报销账单。"
  },
  'SHARED-0005': {
    nl: "Consultaties en behandelingen kunnen geheel of gedeeltelijk worden vergoed, afhankelijk van of uw verzekering alternatieve/aanvullende zorg dekt — wij helpen u dit graag controleren.",
    zh: "咨询和治疗可能全部或部分由保险承保，具体取决于您的保险是否涵盖替代/辅助医疗——我们可协助您确认。"
  },
  'SHARED-0006': {
    nl: "Bij MC Balans beginnen we niet met het kiezen van een behandeling en het zoeken naar een klacht waarop we die kunnen toepassen. Elk behandelplan volgt een volledige beoordeling — conventioneel medisch, structureel, functioneel, regulerend en, waar relevant, Traditionele Chinese Geneeskunde — uitgevoerd door Dr. Lin. Acupunctuur, kruidengeneeskunde, cupping of een andere aanpak (vaak gecombineerd) wordt pas aanbevolen wanneer die beoordeling aangeeft dat het de juiste keuze is voor uw specifieke patroon, niet omdat het de standaardreactie op uw klacht is.",
    zh: "在 MC Balans，我们不会先选择一种疗法，然后再去找一个适合的病症。每个治疗计划都遵循一次完整的评估——包括常规医学、结构、功能、调节以及（在相关情况下）中医——由林医生执行。只有在评估表明某疗法适合您的具体情况时，才会推荐针灸、草药、拔罐或其他方法（通常结合使用），而不是把它当作对您症状的默认反应。"
  }
};

async function upsert(blockId, locale, value) {
  const ex = await pool.query(
    `SELECT id FROM translations WHERE shared_block_id = $1 AND locale = $2`,
    [blockId, locale]
  );
  if (ex.rowCount > 0) {
    await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    return 'updated';
  }
  await pool.query(
    `INSERT INTO translations (shared_block_id, field_name, locale, value) VALUES ($1, 'text', $2, $3)`,
    [blockId, locale, value]
  );
  return 'inserted';
}

async function main() {
  for (const [blockId, data] of Object.entries(translations)) {
    for (const locale of ['nl', 'zh']) {
      if (!data[locale]) continue;
      const result = await upsert(blockId, locale, data[locale]);
      console.log(`  ${result}: ${blockId} (${locale})`);
    }
  }
  console.log('\nDone — 6 shared blocks × 2 locales = 12 rows.');
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
