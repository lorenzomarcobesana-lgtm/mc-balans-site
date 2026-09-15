const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // 1. Add the column
  await pool.query(`ALTER TABLE treatments ADD COLUMN IF NOT EXISTS sort_order INTEGER`);
  console.log('1. sort_order column ensured');

  // 2. Seed values from current display order (by id) — 10, 20, 30... for easy inserting
  const rows = await pool.query(`SELECT id, slug FROM treatments ORDER BY id`);
  let n = 10;
  for (const r of rows.rows) {
    const cur = await pool.query(`SELECT sort_order FROM treatments WHERE id = $1`, [r.id]);
    if (cur.rows[0].sort_order === null) {
      await pool.query(`UPDATE treatments SET sort_order = $1 WHERE id = $2`, [n, r.id]);
    }
    n += 10;
  }
  console.log('2. sort_order values seeded (10, 20, 30, ...)');

  // 3. Show result
  const after = await pool.query(`SELECT slug, sort_order FROM treatments ORDER BY sort_order, id`);
  console.log('Current order:');
  after.rows.forEach(r => console.log('  ' + String(r.sort_order).padStart(3) + '  ' + r.slug));

  await pool.end();
  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
