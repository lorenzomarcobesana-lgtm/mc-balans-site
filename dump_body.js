const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const out = {};

  // Conditions
  const conds = await pool.query(`
    SELECT id, slug, name, summary, recognition, red_flags, understanding,
           approach, assessment, expectations, insurance, pricing, cta
    FROM conditions ORDER BY id
  `);
  out.conditions = conds.rows;

  // Treatments
  const treats = await pool.query(`
    SELECT id, slug, name, summary, body, aftercare,
           intake_text_block_id, insurance_coverage_block_id, treatment_selection_approach_id
    FROM treatments ORDER BY sort_order NULLS LAST, id
  `);
  out.treatments = treats.rows;

  // Shared blocks
  const blocks = await pool.query(`
    SELECT id, block_type, value FROM shared_content_blocks ORDER BY id
  `);
  out.shared_blocks = blocks.rows;

  fs.writeFileSync('body_dump.json', JSON.stringify(out, null, 2));
  console.log('Written to body_dump.json');
  console.log('conditions:', conds.rowCount);
  console.log('treatments:', treats.rowCount);
  console.log('shared_blocks:', blocks.rowCount);

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
