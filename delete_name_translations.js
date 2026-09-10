const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query(`
    DELETE FROM translations WHERE field_name = 'name' AND locale = 'en' RETURNING id
  `);
  console.log(`Deleted ${res.rowCount} English name translations.`);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
