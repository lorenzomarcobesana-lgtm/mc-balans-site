const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const BLOCK_INTAKE_STD  = 'SHARED-0001';
const BLOCK_INTAKE_WEST = 'SHARED-0002';
const BLOCK_INTAKE_TCM  = 'SHARED-0003';
const BLOCK_INS_ALT     = 'SHARED-0004';
const BLOCK_INS_WEST    = 'SHARED-0005';
const BLOCK_TSA         = 'SHARED-0006';

const INTAKE_STD_TEXT  = `After the intake examination, patient and doctor will together build a personal treatment plan, which will include an estimate of the number of needed sessions and an expected, realistic outcome, allowing patients to make their own informed decisions regarding their health.`;
const INTAKE_WEST_TEXT = `Upon arrival, you will complete an intake form covering your health history, current symptoms and reason for your visit. Once completed, you will be called in for your consultation with Dr. Lin, who will discuss your concerns and carry out the appropriate medical assessment.`;
const INTAKE_TCM_TEXT  = `Upon arrival, you will complete an intake form with your personal and insurance details. You will then be called in for your consultation with one of our TCM practitioners, who will discuss your concerns and carry out an assessment from a Traditional Chinese Medicine perspective.`;
const INS_ALT_TEXT     = `You can claim the invoice with your health insurance if you are additionally insured for alternative care.`;
const INS_WEST_TEXT    = `Consultations and treatments may be totally or partially covered depending on whether your insurance covers alternative/complementary care — we can help you check.`;
const TSA_TEXT         = `At MC Balans, we don't start by choosing a treatment and looking for a complaint to apply it to. Every treatment plan follows a full assessment — conventional medical, structural, functional, regulatory and, where relevant, Traditional Chinese Medicine — carried out by Dr. Lin. Acupuncture, herbal medicine, cupping or another approach (often combined) is recommended only once that assessment points to it being the right fit for your specific pattern, not because it's the default response to your complaint.`;

async function main() {
  const blocks = [
    [BLOCK_INTAKE_STD,  'intake_text',                 INTAKE_STD_TEXT],
    [BLOCK_INTAKE_WEST, 'intake_text',                 INTAKE_WEST_TEXT],
    [BLOCK_INTAKE_TCM,  'intake_text',                 INTAKE_TCM_TEXT],
    [BLOCK_INS_ALT,     'insurance_coverage',          INS_ALT_TEXT],
    [BLOCK_INS_WEST,    'insurance_coverage',          INS_WEST_TEXT],
    [BLOCK_TSA,         'treatment_selection_approach',TSA_TEXT]
  ];
  for (const [id, type, value] of blocks) {
    await pool.query(
      `INSERT INTO shared_content_blocks (id, block_type, value) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET block_type = $2, value = $3`,
      [id, type, value]
    );
  }
  console.log('3. blocks upserted');

  const treatments = await pool.query(`SELECT id, slug FROM treatments ORDER BY slug`);
  for (const t of treatments.rows) {
    const trs = await pool.query(
      `SELECT field_name, value FROM translations
       WHERE treatment_id = $1 AND locale = 'en'
         AND field_name IN ('summary','body','aftercare')`,
      [t.id]
    );
    for (const r of trs.rows) {
      await pool.query(`UPDATE treatments SET ${r.field_name} = $1 WHERE id = $2`, [r.value, t.id]);
    }
  }
  console.log('4. summary/body/aftercare copied to treatments');

  for (const t of treatments.rows) {
    const intakeR = await pool.query(
      `SELECT value FROM translations
       WHERE treatment_id = $1 AND locale = 'en' AND field_name = 'intake' LIMIT 1`,
      [t.id]
    );
    let intakeBlock = BLOCK_INTAKE_STD;
    if (intakeR.rowCount > 0) {
      const v = intakeR.rows[0].value || '';
      if (v.startsWith('Upon arrival, you will complete an intake form covering your health history')) {
        intakeBlock = BLOCK_INTAKE_WEST;
      } else if (v.startsWith('Upon arrival, you will complete an intake form with your personal')) {
        intakeBlock = BLOCK_INTAKE_TCM;
      }
    }
    await pool.query(
      `UPDATE treatments SET intake_text_block_id = $1, treatment_selection_approach_id = $2 WHERE id = $3`,
      [intakeBlock, BLOCK_TSA, t.id]
    );

    const insR = await pool.query(
      `SELECT value FROM translations
       WHERE treatment_id = $1 AND locale = 'en' AND field_name = 'insurance' LIMIT 1`,
      [t.id]
    );
    let insBlock = BLOCK_INS_ALT;
    if (insR.rowCount > 0) {
      const v = insR.rows[0].value || '';
      if (v.startsWith('Consultations and treatments may be')) {
        insBlock = BLOCK_INS_WEST;
      }
    }
    await pool.query(`UPDATE treatments SET insurance_coverage_block_id = $1 WHERE id = $2`, [insBlock, t.id]);
  }
  console.log('5. block pointers assigned');

  await pool.query(`ALTER TABLE treatments DROP COLUMN IF EXISTS aftercare_text_block_id`);
  console.log('6. aftercare_text_block_id dropped');

  const del = await pool.query(
    `DELETE FROM translations
     WHERE treatment_id IS NOT NULL AND locale = 'en'
       AND field_name IN ('summary','body','intake','aftercare','insurance')
     RETURNING id`
  );
  console.log(`7. deleted ${del.rowCount} obsolete translation rows`);

  const missing = await pool.query(`SELECT slug FROM treatments WHERE aftercare IS NULL OR aftercare = ''`);
  if (missing.rowCount > 0) {
    console.log('   NOTE — treatments with no aftercare text:');
    missing.rows.forEach(r => console.log('     - ' + r.slug));
  }
  const nullSummary = await pool.query(`SELECT slug FROM treatments WHERE summary IS NULL OR summary = ''`);
  if (nullSummary.rowCount > 0) {
    console.log('   NOTE — treatments with no summary:');
    nullSummary.rows.forEach(r => console.log('     - ' + r.slug));
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
