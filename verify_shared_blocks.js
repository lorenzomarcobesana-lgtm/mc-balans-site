const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});
async function main() {
  const blocks = await pool.query(`SELECT id, block_type FROM shared_content_blocks WHERE id IN ('BLK-APPROACH','BLK-ASSESS')`);
  console.log('Shared blocks:', blocks.rows);

  const tr = await pool.query(`SELECT shared_block_id, locale, LEFT(value, 60) AS preview FROM translations WHERE shared_block_id IN ('BLK-APPROACH','BLK-ASSESS')`);
  console.log('Translations:', tr.rows);

  const cnt = await pool.query(`SELECT COUNT(*) FROM conditions WHERE approach_block_id = 'BLK-APPROACH' AND assessment_block_id = 'BLK-ASSESS'`);
  console.log('Linked conditions:', cnt.rows[0].count);

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
