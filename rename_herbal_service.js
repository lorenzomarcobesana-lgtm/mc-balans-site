const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const SLUG = 'online-tongue-diagnosis';
const NEW_EN = 'Online Personalised Herbal Service';
const NEW_NL = 'Online persoonlijke kruidenservice';
const NEW_ZH = '\u5728\u7ebf\u4e2a\u6027\u5316\u8349\u836f\u670d\u52a1';

async function main() {
  // Find the treatment
  const r = await pool.query(`SELECT id, name FROM treatments WHERE slug = $1`, [SLUG]);
  if (r.rowCount === 0) { console.error('Treatment not found'); process.exit(1); }
  const id = r.rows[0].id;
  console.log('Treatment:', id, '| old name:', r.rows[0].name);

  // Update the name column
  await pool.query(`UPDATE treatments SET name = $1, updated_at = NOW() WHERE id = $2`, [NEW_EN, id]);
  console.log('✅ treatments.name updated to:', NEW_EN);

  // Check and update/create translations
  const locales = { nl: NEW_NL, zh: NEW_ZH };
  for (const [locale, value] of Object.entries(locales)) {
    const existing = await pool.query(
      `SELECT id FROM translations WHERE treatment_id = $1 AND field_name = 'name' AND locale = $2`,
      [id, locale]
    );
    if (existing.rowCount > 0) {
      await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, existing.rows[0].id]);
      console.log(`✅ translations.name ${locale} updated`);
    } else {
      await pool.query(
        `INSERT INTO translations (treatment_id, field_name, locale, value) VALUES ($1, 'name', $2, $3)`,
        [id, locale, value]
      );
      console.log(`✅ translations.name ${locale} inserted`);
    }
  }

  // Verify
  const v = await pool.query(`SELECT slug, name FROM treatments WHERE slug = $1`, [SLUG]);
  console.log('\nFinal:', JSON.stringify(v.rows[0]));

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
