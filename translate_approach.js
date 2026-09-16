const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const nl = `<p>In plaats van een symptoom geïsoleerd te behandelen, bekijkt elke beoordeling bij MC Balans uw klacht door drie met elkaar verbonden lenzen voordat een behandeling wordt aanbevolen:</p>

<p><strong>Structuur</strong> — hoe de fysieke onderdelen van uw lichaam zich tot elkaar verhouden: botten, spieren, fascia, littekens, zenuwen, bloedvaten en circulatie. Pijn op één plek is vaak het gevolg van spanning, beperking of compensatie ergens anders in de keten. Deze lens kijkt naar wat werkelijk aan wat trekt, en waarom.</p>

<p><strong>Functie</strong> — hoe uw lichaam presteert tijdens het gewone dagelijkse leven: lopen, zitten, slapen, werken. Verschillende systemen in het lichaam zijn bedoeld om samen te werken, en deze lens identificeert waar die coördinatie uit elkaar valt en uw beweging of activiteit beïnvloedt.</p>

<p><strong>Regulatie</strong> — hoe uw lichaam reageert en zich aanpast wanneer iets het normale functioneren verstoort. Dit omvat de invloed van fysieke en emotionele stress op het vermogen van uw lichaam om zichzelf te reguleren en te herstellen, wat een grotere rol kan spelen bij aanhoudende klachten dan mensen verwachten.</p>

<p>Pas wanneer deze drie lenzen op een duidelijk patroon wijzen, beveelt Dr. Lin of een lid van het zorgteam een specifieke aanpak aan — acupunctuur, kruidengeneeskunde, cupping of een andere behandeling — omdat het bij uw geval past, niet omdat het de standaardreactie op uw symptoom is.</p>`;

const zh = `<p>在 MC Balans，我们不会孤立地治疗某个症状，而是从三个相互关联的角度审视您的病症，然后才建议治疗方案：</p>

<p><strong>结构</strong> —— 您身体的各部分如何相互关联：骨骼、肌肉、筋膜、疤痕、神经、血管和循环。一个部位的疼痛往往是身体链条中其他地方出现紧张、受限或代偿的结果。这一视角关注的是什么真正牵动着什么，以及原因何在。</p>

<p><strong>功能</strong> —— 您的身体在日常生活中如何运作：走路、坐着、睡觉、工作。身体的不同系统本应协同工作，这一视角识别出协调性在哪里出了问题并影响您的运动或活动。</p>

<p><strong>调节</strong> —— 当身体的正常功能受到干扰时，您的身体如何反应和适应。这包括身体和情绪压力对您身体自我调节和恢复能力的影响，在持续性症状中，其作用往往比人们想象的更大。</p>

<p>只有当这三个视角指向一个清晰的整体模式时，林医生或医疗团队成员才会推荐具体的治疗方案——针灸、草药、拔罐或其他疗法——因为这是适合您具体情况的选择，而不是对您症状的默认反应。</p>`;

async function upsert(conditionId, locale, value) {
  const ex = await pool.query(
    `SELECT id FROM translations WHERE condition_id = $1 AND field_name = 'approach' AND locale = $2`,
    [conditionId, locale]
  );
  if (ex.rowCount > 0) {
    await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    return 'updated';
  }
  await pool.query(
    `INSERT INTO translations (condition_id, field_name, locale, value) VALUES ($1, 'approach', $2, $3)`,
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
  console.log(`Done — approach translated for ${n} conditions × 2 locales = ${n * 2} rows.`);
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
