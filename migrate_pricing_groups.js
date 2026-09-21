const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const GROUPS = {
  'consultations': ['western-medicine-consultation', 'tcm-consultation'],
  'treatments':    ['acupuncture', 'acupotomy', 'cupping', 'ear-acupuncture'],
  'herbal':        ['chinese-herbal-medicine'],
  'additional':    ['moxa-therapy', 'nutrition-movement', 'prp-therapy']
};

async function main() {
  await pool.query(`ALTER TABLE price_tiers ADD COLUMN IF NOT EXISTS pricing_group TEXT`);
  console.log('pricing_group column ensured');

  // Clear existing values on all rows
  await pool.query(`UPDATE price_tiers SET pricing_group = NULL`);

  for (const [group, slugs] of Object.entries(GROUPS)) {
    const r = await pool.query(`
      UPDATE price_tiers pt
      SET pricing_group = $1
      FROM treatments t
      WHERE pt.treatment_id = t.id AND t.slug = ANY($2::text[])
    `, [group, slugs]);
    console.log(`  ${group}: ${r.rowCount} rows`);
  }

  // Report
  console.log('\nGroup summary:');
  const s = await pool.query(`
    SELECT pricing_group, COUNT(*) AS rows, MIN(amount) AS min_amount, MAX(amount) AS max_amount, currency
    FROM price_tiers WHERE pricing_group IS NOT NULL
    GROUP BY pricing_group, currency
    ORDER BY pricing_group
  `);
  s.rows.forEach(r => console.log(`  ${r.pricing_group.padEnd(15)} ${r.rows} rows, min ${r.currency}${r.min_amount}, max ${r.currency}${r.max_amount}`));

  // Check for orphans
  const orphans = await pool.query(`SELECT COUNT(*) AS n FROM price_tiers WHERE pricing_group IS NULL AND show_on_pricing_page = true`);
  console.log(`\nOrphan rows (not shown in summary): ${orphans.rows[0].n}`);

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
