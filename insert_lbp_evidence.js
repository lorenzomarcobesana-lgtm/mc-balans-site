const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const LBP_SLUG = 'non-specific-lower-back-pain';
const ACUPUNCTURE_SLUG = 'acupuncture';

const sources = [
  {
    pmid: '32458717',
    title: 'Systematic review and meta-analysis of effects of acupuncture on pain and function in non-specific low back pain',
    year: 2020,
    url: 'https://pubmed.ncbi.nlm.nih.gov/32458717/',
    relevance_condition: 'Primary evidence: acupuncture for chronic non-specific low back pain. 25 RCTs, 7,584 participants. Shows pain reduction versus no treatment, sham, and usual care.',
    relevance_treatment: 'Anchor study for acupuncture as a treatment for chronic low back pain.'
  },
  {
    pmid: '31526013',
    title: 'Evidence of efficacy of acupuncture in the management of low back pain: a systematic review and meta-analysis of randomised placebo- or sham-controlled trials',
    year: 2020,
    url: 'https://pubmed.ncbi.nlm.nih.gov/31526013/',
    relevance_condition: 'Sham-controlled evidence: moderate evidence for pain reduction immediately after treatment. No significant effect on function.',
    relevance_treatment: 'Sham-controlled evidence for pain reduction specifically — sets the boundary of what can be claimed.'
  },
  {
    pmid: '41179904',
    title: 'Neuroimaging evidence for central mechanisms of acupuncture in non-specific low back pain: a systematic review and meta-analysis',
    year: 2025,
    url: 'https://pubmed.ncbi.nlm.nih.gov/41179904/',
    relevance_condition: 'Mechanism-level support — covers both acute and chronic non-specific low back pain, showing effects on pain-processing regions.',
    relevance_treatment: 'Mechanistic evidence for acupuncture in pain processing.'
  },
  {
    pmid: '38190024',
    title: 'Acupuncture Versus Oral Medications for Acute/Subacute Non-Specific Low Back Pain: A Systematic Review and Meta-Analysis',
    year: 2024,
    url: 'https://pubmed.ncbi.nlm.nih.gov/38190024/',
    relevance_condition: 'CRITICAL: acupuncture more effective and safer than oral medication for acute/subacute non-specific low back pain. 14 studies, 1,263 participants.',
    relevance_treatment: 'Head-to-head comparison: acupuncture vs oral medication, showing acupuncture superiority for acute/subacute LBP.'
  },
  {
    pmid: '33443607',
    title: 'Acupuncture for the Management of Low Back Pain',
    year: 2021,
    url: 'https://pubmed.ncbi.nlm.nih.gov/33443607/',
    relevance_condition: 'Secondary synthesis citing ACP 2017 guideline, which recommends acupuncture as first-line treatment for chronic low back pain.',
    relevance_treatment: 'Context study: places acupuncture within guideline-recommended first-line care.'
  }
];

const TYPE = 'peer_reviewed_study';
const TIER = 'primary_clinical_evidence';
const STATUS = 'in_review';

async function main() {
  // Lookup
  const lbp = await pool.query(`SELECT id FROM conditions WHERE slug = $1`, [LBP_SLUG]);
  const acu = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [ACUPUNCTURE_SLUG]);
  const lin = await pool.query(`SELECT id FROM practitioners WHERE email ILIKE '%lin%' ORDER BY id LIMIT 1`);
  if (!lbp.rowCount) { console.error('LBP condition not found'); process.exit(1); }
  if (!acu.rowCount) { console.error('Acupuncture treatment not found'); process.exit(1); }
  const lbpId = lbp.rows[0].id;
  const acuId = acu.rows[0].id;
  const linId = lin.rows[0]?.id || null;

  console.log('LBP:', lbpId, '| Acupuncture:', acuId, '| Dr. Lin:', linId);
  console.log('Type:', TYPE, '| Tier:', TIER, '| Status:', STATUS);
  console.log('');

  // Find next EVID number
  const existing = await pool.query(`SELECT id FROM evidence_resources`);
  let max = 0;
  for (const r of existing.rows) {
    const m = (r.id || '').match(/-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  const startNum = max + 1;
  console.log('Next EVID number:', startNum);
  console.log('');

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const id = 'EVID-' + String(startNum + i).padStart(4, '0');

    const cols = ['id', 'type', 'credibility_tier', 'source_url', 'publication_date', 'status'];
    const vals = [id, TYPE, TIER, s.url, s.year + '-01-01', STATUS];
    if (linId) { cols.push('author_id'); vals.push(linId); }

    const placeholders = vals.map((_, n) => '$' + (n + 1)).join(', ');
    await pool.query(`INSERT INTO evidence_resources (${cols.join(', ')}) VALUES (${placeholders})`, vals);
    console.log(`  inserted ${id}  (PMID ${s.pmid})`);

    // Title goes into translations (no title column on table)
    await pool.query(
      `INSERT INTO translations (evidence_id, field_name, locale, value) VALUES ($1, 'title', 'en', $2)`,
      [id, s.title]
    );
    console.log(`    + title (en)`);

    // Link to LBP
    await pool.query(
      `INSERT INTO condition_evidence (condition_id, evidence_id, relevance_note) VALUES ($1, $2, $3)`,
      [lbpId, id, s.relevance_condition]
    );
    console.log(`    + linked to LBP`);

    // Link to Acupuncture
    await pool.query(
      `INSERT INTO treatment_evidence (treatment_id, evidence_id, relevance_note) VALUES ($1, $2, $3)`,
      [acuId, id, s.relevance_treatment]
    );
    console.log(`    + linked to Acupuncture`);
  }

  console.log('');
  console.log('Done — 5 sources, 5 titles, 10 links.');
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
