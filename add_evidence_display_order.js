const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Which sources appear in the sidebar, in what order.
// The other two remain NULL and won't show.
const SIDEBAR_ORDER = {
  '32458717': 1,   // Acupuncture on pain & function — primary
  '38190024': 2,   // Acupuncture vs oral medication — CRITICAL
  '31526013': 3    // Sham-controlled
};

async function main() {
  await pool.query(`ALTER TABLE condition_evidence ADD COLUMN IF NOT EXISTS display_order INTEGER`);
  await pool.query(`ALTER TABLE treatment_evidence ADD COLUMN IF NOT EXISTS display_order INTEGER`);
  console.log('columns ensured');

  for (const [pmid, order] of Object.entries(SIDEBAR_ORDER)) {
    const r = await pool.query(
      `UPDATE condition_evidence ce
       SET display_order = $1
       FROM evidence_resources e
       WHERE ce.evidence_id = e.id
         AND e.source_url LIKE '%' || $2 || '%'
         AND ce.condition_id = 'COND-0001'`,
      [order, pmid]
    );
    console.log('  PMID', pmid, '=>', r.rowCount, 'row updated');
  }

  const check = await pool.query(`
    SELECT ce.display_order, e.id, e.source_url
    FROM condition_evidence ce
    JOIN evidence_resources e ON e.id = ce.evidence_id
    WHERE ce.condition_id = 'COND-0001'
    ORDER BY ce.display_order NULLS LAST
  `);
  console.log('\nFinal LBP sidebar state:');
  check.rows.forEach(r => console.log('  order', r.display_order, '|', r.id, '|', r.source_url));
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
