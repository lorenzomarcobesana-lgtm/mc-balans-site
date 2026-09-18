const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const SLUG = 'online-tongue-diagnosis';

const SUMMARY_EN = "A personalised herbal formulation, prepared by MC Balans following an individual remote assessment.";
const SUMMARY_NL = "Een persoonlijke kruidenformulering, bereid door MC Balans na een individuele beoordeling op afstand.";
const SUMMARY_ZH = "\u7531 MC Balans \u5728\u8fdc\u7a0b\u4e2a\u522b\u8bc4\u4f30\u540e\u914d\u5236\u7684\u4e2a\u6027\u5316\u8349\u836f\u65b9\u3002";

const BODY_EN = `<p><strong>How it works</strong></p>
<p>The service follows the same assessment logic as the clinic. Dr. Lin reviews your tongue photographs and health information, and formulates a herbal blend for your specific case. From there, the process is straightforward.</p>
<p><strong>Step 1</strong><br>You take three photographs of your tongue. Take them as close and as clearly as you can, so the tongue is sharp in the picture.</p>
<p><strong>Step 2</strong><br>Upload the photographs and complete the health questionnaire. Submit your request when ready.</p>
<p><strong>Step 3</strong><br>Within two working days, Dr. Lin reviews your assessment and sends you a formulation proposal by email.</p>
<p><strong>Step 4</strong><br>Follow the payment link in that email to purchase the prepared blend — dispensed as tea bags — and have it delivered to your home.</p>
<p><a href="#">Applications</a></p>`;

const BODY_NL = `<p><strong>Hoe het werkt</strong></p>
<p>De service volgt dezelfde beoordelingslogica als de kliniek. Dr. Lin beoordeelt uw tongfoto's en gezondheidsinformatie en stelt een kruidenmengsel samen voor uw specifieke situatie. Van daaruit is het proces eenvoudig.</p>
<p><strong>Stap 1</strong><br>U maakt drie foto's van uw tong. Maak ze zo dichtbij en zo helder mogelijk, zodat de tong scherp op de foto staat.</p>
<p><strong>Stap 2</strong><br>Upload de foto's en vul de gezondheidsvragenlijst in. Verzend uw aanvraag wanneer u klaar bent.</p>
<p><strong>Stap 3</strong><br>Binnen twee werkdagen beoordeelt Dr. Lin uw aanvraag en stuurt u een voorstel voor een formulering per e-mail.</p>
<p><strong>Stap 4</strong><br>Volg de betaallink in die e-mail om het bereide mengsel te kopen — geleverd als theezakjes — en thuis te laten bezorgen.</p>
<p><a href="#">Aanvragen</a></p>`;

const BODY_ZH = `<p><strong>\u5982\u4f55\u8fd0\u4f5c</strong></p>
<p>\u8be5\u670d\u52a1\u9075\u5faa\u4e0e\u8bca\u6240\u76f8\u540c\u7684\u8bc4\u4f30\u903b\u8f91\u3002\u6797\u533b\u751f\u4f1a\u5ba1\u67e5\u60a8\u7684\u820c\u5934\u7167\u7247\u548c\u5065\u5eb7\u4fe1\u606f\uff0c\u5e76\u4e3a\u60a8\u7684\u5177\u4f53\u60c5\u51b5\u914d\u5236\u4e2a\u4eba\u5316\u7684\u8349\u836f\u65b9\u3002\u4e4b\u540e\u7684\u6d41\u7a0b\u975e\u5e38\u7b80\u5355\u3002</p>
<p><strong>\u7b2c 1 \u6b65</strong><br>\u60a8\u62cd\u6444\u4e09\u5f20\u820c\u5934\u7684\u7167\u7247\u3002\u8bf7\u5c3d\u53ef\u80fd\u9760\u8fd1\u4e14\u6e05\u6670\u5730\u62cd\u6444\uff0c\u4f7f\u820c\u5934\u5728\u7167\u7247\u4e2d\u6e05\u6670\u9510\u5229\u3002</p>
<p><strong>\u7b2c 2 \u6b65</strong><br>\u4e0a\u4f20\u7167\u7247\u5e76\u5b8c\u6210\u5065\u5eb7\u95ee\u5377\u3002\u5b8c\u6210\u540e\u63d0\u4ea4\u60a8\u7684\u7533\u8bf7\u3002</p>
<p><strong>\u7b2c 3 \u6b65</strong><br>\u4e24\u4e2a\u5de5\u4f5c\u65e5\u5185\uff0c\u6797\u533b\u751f\u5c06\u5ba1\u67e5\u60a8\u7684\u8bc4\u4f30\u5e76\u901a\u8fc7\u7535\u5b50\u90ae\u4ef6\u5411\u60a8\u53d1\u9001\u914d\u65b9\u65b9\u6848\u3002</p>
<p><strong>\u7b2c 4 \u6b65</strong><br>\u901a\u8fc7\u90ae\u4ef6\u4e2d\u7684\u4ed8\u6b3e\u94fe\u63a5\u8d2d\u4e70\u914d\u5236\u597d\u7684\u8349\u836f\u65b9\u2014\u2014\u4ee5\u8336\u5305\u5f62\u5f0f\u63d0\u4f9b\u2014\u2014\u5e76\u5bc4\u9001\u5230\u60a8\u5bb6\u4e2d\u3002</p>
<p><a href="#">\u7533\u8bf7</a></p>`;

async function updateTranslation(treatmentId, field, locale, value) {
  const ex = await pool.query(
    `SELECT id FROM translations WHERE treatment_id = $1 AND field_name = $2 AND locale = $3`,
    [treatmentId, field, locale]
  );
  if (ex.rowCount > 0) {
    await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    return 'updated';
  }
  await pool.query(
    `INSERT INTO translations (treatment_id, field_name, locale, value) VALUES ($1, $2, $3, $4)`,
    [treatmentId, field, locale, value]
  );
  return 'inserted';
}

async function main() {
  const r = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [SLUG]);
  if (r.rowCount === 0) { console.error('Treatment not found'); process.exit(1); }
  const id = r.rows[0].id;
  console.log('Treatment:', id);

  await pool.query(`UPDATE treatments SET summary = $1, body = $2, updated_at = NOW() WHERE id = $3`, [SUMMARY_EN, BODY_EN, id]);
  console.log('summary + body updated (en)');

  const log = [];
  log.push('summary nl: ' + await updateTranslation(id, 'summary', 'nl', SUMMARY_NL));
  log.push('summary zh: ' + await updateTranslation(id, 'summary', 'zh', SUMMARY_ZH));
  log.push('body nl: ' + await updateTranslation(id, 'body', 'nl', BODY_NL));
  log.push('body zh: ' + await updateTranslation(id, 'body', 'zh', BODY_ZH));
  console.log(log.join('\n'));

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
