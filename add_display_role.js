const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query('ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS display_role TEXT');
  console.log('✅ display_role column added');
  const rows = await pool.query('SELECT id, email, display_role FROM practitioners ORDER BY id');
  rows.rows.forEach(r => console.log(`  ${r.id}  ${r.email}  =>  ${r.display_role}`));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
