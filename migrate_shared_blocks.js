const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const APPROACH_ID = 'BLK-APPROACH';   // 12 chars
const ASSESS_ID   = 'BLK-ASSESS';     // 10 chars

async function main() {
  // 1. Get current text from any condition (they're all the same)
  const c = await pool.query(`SELECT approach, assessment FROM conditions WHERE approach IS NOT NULL LIMIT 1`);
  if (c.rowCount === 0) { console.error('No conditions with approach text'); process.exit(1); }
  const { approach, assessment } = c.rows[0];

  // 2. Create shared blocks
  await pool.query(`INSERT INTO shared_content_blocks (id, block_type) VALUES ($1, 'condition_approach') ON CONFLICT (id) DO NOTHING`, [APPROACH_ID]);
  await pool.query(`INSERT INTO shared_content_blocks (id, block_type) VALUES ($1, 'condition_assessment') ON CONFLICT (id) DO NOTHING`, [ASSESS_ID]);
  console.log('✅ Shared blocks created');

  // 3. Insert/update translations
  for (const [blockId, text] of [[APPROACH_ID, approach], [ASSESS_ID, assessment]]) {
    const ex = await pool.query(`SELECT id FROM translations WHERE shared_block_id = $1 AND locale = 'en'`, [blockId]);
    if (ex.rowCount > 0) {
      await pool.query(`UPDATE translations SET value = $1 WHERE shared_block_id = $2 AND locale = 'en'`, [text, blockId]);
    } else {
      await pool.query(`INSERT INTO translations (shared_block_id, field_name, locale, value) VALUES ($1, 'text', 'en', $2)`, [blockId, text]);
    }
  }
  console.log('✅ Translations saved');

  // 4. Add FK columns to conditions
  await pool.query(`ALTER TABLE conditions ADD COLUMN IF NOT EXISTS approach_block_id VARCHAR(12) REFERENCES shared_content_blocks(id)`);
  await pool.query(`ALTER TABLE conditions ADD COLUMN IF NOT EXISTS assessment_block_id VARCHAR(12) REFERENCES shared_content_blocks(id)`);
  console.log('✅ Columns added');

  // 5. Link every condition to the shared blocks
  const upd = await pool.query(`UPDATE conditions SET approach_block_id = $1, assessment_block_id = $2 RETURNING id`, [APPROACH_ID, ASSESS_ID]);
  console.log(`✅ ${upd.rowCount} conditions linked`);

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
