const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // 1. Check if resources already exists
  const existing = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name='resources'
  `);
  if (existing.rowCount > 0) {
    console.log('resources table already exists — showing columns');
    const cols = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name='resources' ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log('  ', r.column_name, '|', r.data_type));
    process.exit(0);
  }

  // 2. Create resources table
  await pool.query(`
    CREATE TABLE resources (
      id VARCHAR(12) PRIMARY KEY CHECK (id ~ '^RES-[0-9]{4}$'),
      entry_type TEXT NOT NULL,
      title TEXT,
      description TEXT,
      body TEXT,
      canonical_url TEXT,
      external_url TEXT,
      publication_name TEXT,
      publication_date DATE,
      author_id VARCHAR REFERENCES practitioners(id),
      medical_reviewer_id VARCHAR REFERENCES practitioners(id),
      status TEXT NOT NULL DEFAULT 'draft',
      sort_order INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ resources table created');

  // 3. Junction table: resources ↔ conditions
  await pool.query(`
    CREATE TABLE resource_conditions (
      resource_id VARCHAR REFERENCES resources(id) ON DELETE CASCADE,
      condition_id VARCHAR REFERENCES conditions(id) ON DELETE CASCADE,
      display_order INTEGER,
      PRIMARY KEY (resource_id, condition_id)
    )
  `);
  console.log('✅ resource_conditions table created');

  // 4. Junction table: resources ↔ treatments
  await pool.query(`
    CREATE TABLE resource_treatments (
      resource_id VARCHAR REFERENCES resources(id) ON DELETE CASCADE,
      treatment_id VARCHAR REFERENCES treatments(id) ON DELETE CASCADE,
      display_order INTEGER,
      PRIMARY KEY (resource_id, treatment_id)
    )
  `);
  console.log('✅ resource_treatments table created');

  // 5. Add resource_id to translations (if not already there)
  await pool.query(`
    ALTER TABLE translations ADD COLUMN IF NOT EXISTS resource_id VARCHAR REFERENCES resources(id) ON DELETE CASCADE
  `);
  console.log('✅ translations.resource_id column ensured');

  // 6. Show the result
  console.log('\nFinal resources table:');
  const cols = await pool.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name='resources' ORDER BY ordinal_position
  `);
  cols.rows.forEach(r => console.log('  ', r.column_name.padEnd(20), r.data_type));

  await pool.end();
  console.log('\nStep 1 done. No site impact — nothing reads this table yet.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
