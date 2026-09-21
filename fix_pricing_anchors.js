const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // 1. Add column
  await pool.query(`ALTER TABLE price_tiers ADD COLUMN IF NOT EXISTS show_in_summary BOOLEAN DEFAULT FALSE`);
  console.log('show_in_summary column ensured');

  // 2. Move cupping from treatments → additional
  const moved = await pool.query(`
    UPDATE price_tiers pt SET pricing_group = 'additional'
    FROM treatments t
    WHERE pt.treatment_id = t.id AND t.slug = 'cupping'
  `);
  console.log(`cupping moved to additional: ${moved.rowCount} rows`);

  // 3. Clear all anchors, then set per group
  await pool.query(`UPDATE price_tiers SET show_in_summary = FALSE`);

  // Consultations anchor: Consultation <20 min (Western first visit)
  const c1 = await pool.query(`
    UPDATE price_tiers pt SET show_in_summary = TRUE
    FROM treatments t
    WHERE pt.treatment_id = t.id AND t.slug = 'western-medicine-consultation'
      AND pt.tier_label ILIKE '%<20%'
  `);
  console.log(`consultations anchor: ${c1.rowCount} row(s)`);

  // Treatments anchor: Acupuncture
  const t1 = await pool.query(`
    UPDATE price_tiers pt SET show_in_summary = TRUE
    FROM treatments t
    WHERE pt.treatment_id = t.id AND t.slug = 'acupuncture'
  `);
  console.log(`treatments anchor: ${t1.rowCount} row(s)`);

  // Herbal anchor: cheapest row (tea bags from €6)
  const h1 = await pool.query(`
    UPDATE price_tiers SET show_in_summary = TRUE
    WHERE id = (
      SELECT id FROM price_tiers
      WHERE pricing_group = 'herbal' AND show_on_pricing_page = true
      ORDER BY amount ASC LIMIT 1
    )
  `);
  console.log(`herbal anchor: ${h1.rowCount} row(s)`);

  // Additional anchor: Cupping
  const a1 = await pool.query(`
    UPDATE price_tiers pt SET show_in_summary = TRUE
    FROM treatments t
    WHERE pt.treatment_id = t.id AND t.slug = 'cupping'
  `);
  console.log(`additional anchor: ${a1.rowCount} row(s)`);

  // Report the resulting state
  console.log('\nSummary rows:');
  const r = await pool.query(`
    SELECT pricing_group, tier_label, amount, currency, show_in_summary
    FROM price_tiers
    WHERE show_on_pricing_page = true
    ORDER BY pricing_group, amount
  `);
  r.rows.forEach(row => {
    console.log(`  ${row.pricing_group.padEnd(15)} ${String(row.amount).padStart(7)}  ${row.show_in_summary ? '← SUMMARY' : ''}  ${row.tier_label||''}`);
  });

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
