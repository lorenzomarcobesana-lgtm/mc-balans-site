const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const nl = `<p>Uw eerste bezoek is een consult met Dr. Lin of Dr. Wang. Voordat u wordt binnengeroepen, vult u een kort intakeformulier in met uw medische geschiedenis, verzekeringsgegevens en de reden van uw bezoek.</p>

<p><strong>Intake</strong><br>
We beginnen met uw klacht, in uw eigen woorden, en hoe deze zich heeft ontwikkeld — en controleren op eventuele waarschuwingssymptomen (zie Rode vlaggen).</p>

<p><strong>Conventionele medische beoordeling</strong><br>
We bekijken uw medische geschiedenis en huidige medicatie, sluiten de hierboven genoemde rode-vlag-condities uit en regelen indien nodig verder onderzoek of een verwijzing.</p>

<p><strong>Structurele beoordeling</strong><br>
We kijken hoe de fysieke onderdelen van uw lichaam — botten, spieren, fascia, littekens, weefsel, zenuwen, bloedvaten en circulatie — zich tot elkaar verhouden, en of een verandering op één plek een andere beïnvloedt via spanning, compensatie of beperking elders.</p>

<p><strong>Functionele beoordeling</strong><br>
We kijken hoe uw lichaam beweegt en functioneert in het dagelijks leven, en hoe verschillende regio's samenwerken — of niet — op manieren die verband houden met uw klacht.</p>

<p><strong>Regulerende beoordeling</strong><br>
We kijken hoe uw lichaam reageert en zich aanpast wanneer het normale functioneren wordt verstoord — herstel, circulatie, ontsteking — en hoe fysieke of emotionele stress uw vermogen om te genezen kan beïnvloeden.</p>

<p><strong>TCM-beoordeling (waar passend)</strong><br>
Waar relevant omvat dit een pols- en tongonderzoek als onderdeel van het TCM-diagnostische model, wat een aanvullend perspectief biedt dat uw behandeling kan informeren.</p>

<p>Dit alles komt samen in één beeld, en uw behandelplan volgt daaruit — opgesteld om aan te pakken wat uw klacht werkelijk veroorzaakt, niet alleen het symptoom.</p>`;

const zh = `<p>您的首次就诊是与林医生或王医生的咨询。在您被叫入之前，您需要填写一份简短的接诊表格，涵盖您的病史、保险信息和就诊原因。</p>

<p><strong>接诊</strong><br>
我们从您用自己语言描述的病症及其发展过程开始——并检查是否有任何警示症状（见警示信号）。</p>

<p><strong>常规医学评估</strong><br>
我们查看您的病史和当前用药，排除上述警示信号所提示的病症，并在需要时安排进一步检查或转诊。</p>

<p><strong>结构评估</strong><br>
我们观察您身体的各个结构部分——骨骼、肌肉、筋膜、疤痕、组织、神经、血管和循环——如何相互关联，以及一个部位的变化是否通过紧张、代偿或其他部位的受限而影响另一部位。</p>

<p><strong>功能评估</strong><br>
我们观察您的身体在日常生活中如何运动和发挥功能，以及不同部位如何协同工作——或不协同——从而与您的病症产生关联。</p>

<p><strong>调节评估</strong><br>
我们观察当身体的正常功能受到干扰时，您的身体如何反应和适应——恢复、循环、炎症——以及身体或情绪压力如何影响您的愈合能力。</p>

<p><strong>中医评估（在适当情况下）</strong><br>
在相关情况下，这包括作为中医诊断模型一部分的脉诊和舌诊，提供可以指导您治疗的辅助视角。</p>

<p>所有这些汇总为一幅整体图景，您的治疗计划由此制定——旨在解决真正引起您病症的原因，而不仅仅是症状。</p>`;

async function upsert(conditionId, locale, value) {
  const ex = await pool.query(
    `SELECT id FROM translations WHERE condition_id = $1 AND field_name = 'assessment' AND locale = $2`,
    [conditionId, locale]
  );
  if (ex.rowCount > 0) {
    await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    return 'updated';
  }
  await pool.query(
    `INSERT INTO translations (condition_id, field_name, locale, value) VALUES ($1, 'assessment', $2, $3)`,
    [conditionId, locale, value]
  );
  return 'inserted';
}

async function main() {
  const conds = await pool.query(`SELECT id, slug FROM conditions ORDER BY id`);
  let n = 0;
  for (const c of conds.rows) {
    await upsert(c.id, 'nl', nl);
    await upsert(c.id, 'zh', zh);
    n++;
  }
  console.log(`Done — assessment translated for ${n} conditions × 2 locales = ${n * 2} rows.`);
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
