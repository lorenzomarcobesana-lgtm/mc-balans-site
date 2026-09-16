const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const RES_ID = 'RES-0001';
const AUTHOR_URL = 'https://medischdossier.org/auteur/wendylinauteur-nl/';

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
  const existing = await pool.query(`SELECT id FROM resources WHERE id = $1`, [RES_ID]);
  if (existing.rowCount > 0) {
    console.log(RES_ID + ' already exists — aborting');
    process.exit(0);
  }

  const lin = await pool.query(`SELECT id FROM practitioners WHERE email ILIKE '%lin%' ORDER BY id LIMIT 1`);
  if (!lin.rowCount) { console.error('Dr. Lin not found'); process.exit(1); }
  const linId = lin.rows[0].id;
  console.log('Dr. Lin:', linId);

  await pool.query(`
    INSERT INTO resources (
      id, entry_type, title, description, canonical_url, external_url,
      publication_name, author_id, medical_reviewer_id, status
    ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $7, 'published')
  `, [RES_ID, 'journal_column', title.en, description.en, AUTHOR_URL, 'Medisch Dossier', linId]);
  console.log('inserted ' + RES_ID);

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

  console.log('done');
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
