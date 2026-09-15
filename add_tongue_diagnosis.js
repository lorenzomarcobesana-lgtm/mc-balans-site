const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const TSA_BLOCK = 'SHARED-0006';
const COMBINES_WITH_SLUG = 'chinese-herbal-medicine';
const SLUG = 'online-tongue-diagnosis';
const NAME = 'Online Tongue Diagnosis';

const SUMMARY = `With many complaints, you no longer have to leave your house with today's technology. Based on a photo of the tongue and answering a few simple questions, you too can have your personal herbal blend sent home.`;

const BODY = `<p><strong>How does it work?</strong></p>
<p>With many complaints, you no longer have to leave your house with today's technology. Based on a photo of the tongue and answering a few simple questions, you too can have your personal herbal blend sent home.</p>
<p><strong>Step 1</strong><br>You take three pictures of your tongue. You take the photos as close as possible so that the tongue is clear and sharp in the picture.</p>
<p><strong>Step 2</strong><br>Upload the photos in the form and fill out the questionnaire. Then press 'request' and follow the payment instructions.</p>
<p><strong>Step 3</strong><br>You will receive an email within 2 working days with a proposal for a personal herb mix.</p>
<p><strong>Step 4</strong><br>Click on the link in the email and follow the payment instructions to purchase the tea bags with herbs and have them delivered to your home.</p>
<p><a href="#">Applications</a></p>`;

async function main() {
  // 1. Find the ID prefix for treatments
  const sampleId = await pool.query(`SELECT id FROM treatments LIMIT 1`);
  if (sampleId.rowCount === 0) { console.error('No treatments found'); process.exit(1); }
  const prefixMatch = sampleId.rows[0].id.match(/^([A-Z]+)-/);
  const prefix = prefixMatch ? prefixMatch[1] : 'TREAT';
  console.log('ID prefix:', prefix);

  const ids = await pool.query(`SELECT id FROM treatments WHERE id LIKE $1`, [prefix + '-%']);
  let max = 0;
  for (const r of ids.rows) {
    const n = parseInt(r.id.replace(prefix + '-', ''), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  const newId = prefix + '-' + String(max + 1).padStart(4, '0');
  console.log('New treatment id:', newId);

  // 2. Confirm slug is free
  const exists = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [SLUG]);
  if (exists.rowCount > 0) { console.error('Slug already exists:', SLUG); process.exit(1); }
  console.log('Slug is free:', SLUG);

  // 3. Find Dr. Lin
  const lin = await pool.query(`SELECT id, email FROM practitioners WHERE email ILIKE '%lin%' ORDER BY id LIMIT 1`);
  if (lin.rowCount === 0) { console.error('Dr. Lin not found — check practitioners table'); process.exit(1); }
  const linId = lin.rows[0].id;
  console.log('Dr. Lin id:', linId, '(', lin.rows[0].email, ')');

  // 4. Find Chinese Herbal Medicine
  const chm = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [COMBINES_WITH_SLUG]);
  if (chm.rowCount === 0) { console.error('Chinese Herbal Medicine not found'); process.exit(1); }
  const chmId = chm.rows[0].id;
  console.log('Chinese Herbal Medicine id:', chmId);

  // 5. Insert treatment
  await pool.query(
    `INSERT INTO treatments
      (id, slug, name, duration, summary, body, intake, aftercare, insurance,
       intake_text_block_id, insurance_coverage_block_id, treatment_selection_approach_id,
       author_id, medical_reviewer_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,NULL,NULL,NULL,NULL,NULL,$7,$8,$8,'published')`,
    [newId, SLUG, NAME, '2 working days', SUMMARY, BODY, TSA_BLOCK, linId]
  );
  console.log('✅ Treatment inserted');

  // 6. Link practitioner
  await pool.query(
    `INSERT INTO practitioner_treatments (practitioner_id, treatment_id, role) VALUES ($1, $2, $3)`,
    [linId, newId, 'primary']
  );
  console.log('✅ Dr. Lin linked as primary practitioner');

  // 7. Combines with Chinese Herbal Medicine
  await pool.query(
    `INSERT INTO treatment_combines_with (treatment_id_a, treatment_id_b) VALUES ($1, $2)`,
    [newId, chmId]
  );
  console.log('✅ Combines-with link created (→ Chinese Herbal Medicine)');

  console.log('\nDone. Treatment is live at /treatments/' + SLUG);
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
