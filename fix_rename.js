const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const SLUG = 'online-tongue-diagnosis';
const NEW_EN = 'Personalised Herbal Service';
const NEW_NL = 'Persoonlijke kruidenservice';
const NEW_ZH = '\u4e2a\u6027\u5316\u8349\u836f\u670d\u52a1';

async function main() {
  const r = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [SLUG]);
  if (r.rowCount === 0) { console.error('Not found'); process.exit(1); }
  const id = r.rows[0].id;

  await pool.query(`UPDATE treatments SET name = $1, updated_at = NOW() WHERE id = $2`, [NEW_EN, id]);
  console.log('treatments.name:', NEW_EN);

  for (const [locale, value] of Object.entries({ nl: NEW_NL, zh: NEW_ZH })) {
    const ex = await pool.query(
      `SELECT id FROM translations WHERE treatment_id = $1 AND field_name = 'name' AND locale = $2`,
      [id, locale]
    );
    if (ex.rowCount > 0) {
      await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    } else {
      await pool.query(
        `INSERT INTO translations (treatment_id, field_name, locale, value) VALUES ($1, 'name', $2, $3)`,
        [id, locale, value]
      );
    }
    console.log('translations.name ' + locale + ':', value);
  }
  await pool.end();
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
