const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const LBP_SLUG = 'non-specific-lower-back-pain';
const CHM_SLUG = 'chinese-herbal-medicine';

const sources = [
  {
    pmid: '42695120',
    title: 'Physical, Psychophysical and Psychological Predictors of Persistent or Recurrent Non-Specific Low Back Pain: A Systematic Review and Meta-Analysis',
    year: 2026,
    journal: 'European Journal of Pain',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42695120/',
    link_to: ['condition'],
    relevance_condition: 'Understanding: identifies the physical, psychophysical and psychological factors that predict persistence or recurrence of non-specific low back pain. Supports the site\'s explanation of why pain continues after the original trigger has healed.'
  },
  {
    pmid: '42398797',
    title: 'Chronic pain and stress: unravelling the common neuroinflammatory, immune and endocrine mechanisms for novel therapeutic approaches',
    year: 2026,
    journal: 'Progress in Neuro-Psychopharmacology and Biological Psychiatry',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42398797/',
    link_to: ['condition'],
    relevance_condition: 'Understanding: how stress, immune signalling and endocrine function interact in chronic pain. Supports the site\'s regulatory lens and the role of physical/emotional stress in persistent complaints.'
  },
  {
    pmid: '37975353',
    title: 'Chinese herbal medicine for low back pain: a systematic review and meta-analysis',
    year: 2023,
    journal: '(see PubMed)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37975353/',
    link_to: ['condition', 'treatment'],
    relevance_condition: 'Treatment evidence: Chinese herbal medicine for low back pain. Supports the herbal medicine option within the MC Balans approach.',
    relevance_treatment: 'Primary evidence for Chinese herbal medicine as a treatment for low back pain.'
  }
];

const TYPE = 'peer_reviewed_study';
const STATUS = 'in_review';

async function main() {
  const lbp = await pool.query(`SELECT id FROM conditions WHERE slug = $1`, [LBP_SLUG]);
  const chm = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [CHM_SLUG]);
  const lin = await pool.query(`SELECT id FROM practitioners WHERE email ILIKE '%lin%' ORDER BY id LIMIT 1`);

  if (!lbp.rowCount) { console.error('LBP not found'); process.exit(1); }
  if (!chm.rowCount) { console.error('CHM treatment not found'); process.exit(1); }
  const lbpId = lbp.rows[0].id;
  const chmId = chm.rows[0].id;
  const linId = lin.rows[0]?.id || null;

  console.log('LBP:', lbpId, '| CHM:', chmId, '| Dr. Lin:', linId);

  // Next EVID number
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
  console.log('Next EVID number:', startNum, '\n');

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const id = 'EVID-' + String(startNum + i).padStart(4, '0');

    const cols = ['id', 'type', 'credibility_tier', 'source_url', 'publication_date', 'status'];
    const vals = [id, TYPE, 'primary_clinical_evidence', s.url, s.year + '-01-01', STATUS];
    if (linId) { cols.push('author_id'); vals.push(linId); }
    const ph = vals.map((_, n) => '$' + (n + 1)).join(', ');
    await pool.query(`INSERT INTO evidence_resources (${cols.join(', ')}) VALUES (${ph})`, vals);
    console.log(`inserted ${id}  (PMID ${s.pmid})`);

    // Title
    await pool.query(
      `INSERT INTO translations (evidence_id, field_name, locale, value) VALUES ($1, 'title', 'en', $2)`,
      [id, s.title]
    );
    console.log(`  + title (en)`);

    // Links
    if (s.link_to.includes('condition')) {
      await pool.query(
        `INSERT INTO condition_evidence (condition_id, evidence_id, relevance_note) VALUES ($1, $2, $3)`,
        [lbpId, id, s.relevance_condition]
      );
      console.log(`  + linked to LBP`);
    }
    if (s.link_to.includes('treatment')) {
      await pool.query(
        `INSERT INTO treatment_evidence (treatment_id, evidence_id, relevance_note) VALUES ($1, $2, $3)`,
        [chmId, id, s.relevance_treatment]
      );
      console.log(`  + linked to CHM treatment`);
    }
  }

  console.log('\nDone — 3 sources inserted.');
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
