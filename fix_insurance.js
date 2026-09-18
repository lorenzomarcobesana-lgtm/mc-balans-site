const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const NEW_EN = "Consultations and treatments may be reimbursed through your supplementary health insurance (aanvullende verzekering), depending on your individual policy. We can help you check your coverage.";
const NEW_NL = "Consultaties en behandelingen kunnen worden vergoed via uw aanvullende verzekering, afhankelijk van uw individuele polis. Wij helpen u graag uw dekking te controleren.";
const NEW_ZH = "\u54a8\u8be2\u548c\u6cbb\u7597\u53ef\u80fd\u901a\u8fc7\u60a8\u7684\u8865\u5145\u4fdd\u9669\uff08aanvullende verzekering\uff09\u62a5\u9500\uff0c\u5177\u4f53\u53d6\u51b3\u4e8e\u60a8\u7684\u4e2a\u4eba\u4fdd\u5355\u3002\u6211\u4eec\u53ef\u534f\u52a9\u60a8\u786e\u8ba4\u627f\u4fdd\u8303\u56f4\u3002";

const OLD_HOME = "Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.";
const NEW_HOME = NEW_EN;

async function main() {
  const log = [];

  // --- DB: update SHARED-0004 value ---
  const r1 = await pool.query(
    `UPDATE shared_content_blocks SET value = $1, updated_at = NOW() WHERE id = 'SHARED-0004' RETURNING id`,
    [NEW_EN]
  );
  log.push(r1.rowCount ? '✅ SHARED-0004 value updated' : '⚠️ SHARED-0004 not found');

  // --- DB: update SHARED-0004 translations for nl and zh ---
  const r2 = await pool.query(
    `UPDATE translations SET value = $1, updated_at = NOW() WHERE shared_block_id = 'SHARED-0004' AND locale = 'nl' RETURNING id`,
    [NEW_NL]
  );
  log.push(r2.rowCount ? '✅ SHARED-0004 nl translation updated' : '⚠️ SHARED-0004 nl translation not found');

  const r3 = await pool.query(
    `UPDATE translations SET value = $1, updated_at = NOW() WHERE shared_block_id = 'SHARED-0004' AND locale = 'zh' RETURNING id`,
    [NEW_ZH]
  );
  log.push(r3.rowCount ? '✅ SHARED-0004 zh translation updated' : '⚠️ SHARED-0004 zh translation not found');

  // --- DB: repoint Western Medicine Consultation to SHARED-0004 ---
  const r4 = await pool.query(
    `UPDATE treatments SET insurance_coverage_block_id = 'SHARED-0004', updated_at = NOW() WHERE slug = 'western-medicine-consultation' RETURNING id, insurance_coverage_block_id`,
    []
  );
  log.push(r4.rowCount ? '✅ Western Medicine Consultation repointed to SHARED-0004' : '⚠️ Western Medicine Consultation not found');

  // --- Frontend: replace homepage insurance string + uiTr keys ---
  let html = fs.readFileSync('public/database-site.html', 'utf8');
  const before = html.length;

  // The homepage band + the two uiTr keys are all the OLD_HOME string
  const countOld = html.split(OLD_HOME).length - 1;
  html = html.split(OLD_HOME).join(NEW_HOME);
  log.push(`✅ replaced ${countOld} occurrences of old homepage insurance string`);

  fs.writeFileSync('public/database-site.html', html);
  log.push(`✅ database-site.html written (${before} → ${html.length} bytes)`);

  console.log(log.join('\n'));

  // Verify
  const v1 = await pool.query(`SELECT value FROM shared_content_blocks WHERE id = 'SHARED-0004'`);
  console.log('\nSHARED-0004 now:', v1.rows[0]?.value?.slice(0, 80) + '...');

  const v2 = await pool.query(`SELECT slug, insurance_coverage_block_id FROM treatments WHERE slug IN ('western-medicine-consultation','acupuncture','tcm-consultation') ORDER BY slug`);
  console.log('\nTreatments using insurance block:');
  v2.rows.forEach(r => console.log('  ' + r.slug.padEnd(35) + r.insurance_coverage_block_id));

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
