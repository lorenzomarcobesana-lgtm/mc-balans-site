const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const RES_ID = 'RES-0001';

const title = {
  en: "Dr. Lin's Medisch Dossier Column",
  nl: "Dr. Lin's Medisch Dossier Column",
  zh: "\u6797\u533b\u751f\u7684 Medisch Dossier \u4e13\u680f"
};

const description = {
  en: "Dr. Lin's regular Medisch Dossier column on medicine, health and her clinical approach.",
  nl: "Dr. Lin's vaste column in Medisch Dossier over geneeskunde, gezondheid en haar klinische benadering.",
  zh: "\u6797\u533b\u751f\u5728 Medisch Dossier \u7684\u5b9a\u671f\u4e13\u680f\uff0c\u63a2\u8ba8\u533b\u5b66\u3001\u5065\u5eb7\u4ee5\u53ca\u5979\u7684\u4e34\u5e8a\u65b9\u6cd5\u3002"
};

async function main() {
  // 1. Drop old constraint
  await pool.query(`ALTER TABLE translations DROP CONSTRAINT IF EXISTS translations_check`);
  console.log('dropped old constraint');

  // 2. Recreate with resource_id included
  await pool.query(`
    ALTER TABLE translations ADD CONSTRAINT translations_check
    CHECK (
      ((category_id IS NOT NULL)::integer +
       (condition_id IS NOT NULL)::integer +
       (treatment_id IS NOT NULL)::integer +
       (evidence_id IS NOT NULL)::integer +
       (faq_id IS NOT NULL)::integer +
       (shared_block_id IS NOT NULL)::integer +
       (resource_id IS NOT NULL)::integer) = 1
    )
  `);
  console.log('recreated constraint with resource_id');

  // 3. Delete any partial translations for RES-0001 (there shouldn't be any, but be safe)
  await pool.query(`DELETE FROM translations WHERE resource_id = $1`, [RES_ID]);

  // 4. Insert the six translations
  for (const locale of ['en', 'nl', 'zh']) {
    await pool.query(
      `INSERT INTO translations (resource_id, field_name, locale, value) VALUES ($1, 'title', $2, $3)`,
      [RES_ID, locale, title[locale]]
    );
    console.log('  + title ' + locale);
  }

  for (const locale of ['en', 'nl', 'zh']) {
    await pool.query(
      `INSERT INTO translations (resource_id, field_name, locale, value) VALUES ($1, 'description', $2, $3)`,
      [RES_ID, locale, description[locale]]
    );
    console.log('  + description ' + locale);
  }

  // 5. Verify
  const t = await pool.query(`SELECT COUNT(*) AS n FROM translations WHERE resource_id = $1`, [RES_ID]);
  console.log('\ntranslations for RES-0001:', t.rows[0].n);

  await pool.end();
  console.log('done');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
