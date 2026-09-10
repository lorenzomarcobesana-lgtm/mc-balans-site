const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || 'https://mc-balans-site.onrender.com';

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const HTML_TEMPLATE = fs.readFileSync(path.join(__dirname, 'public', 'database-site.html'), 'utf8');

// ---------- Utilities ----------
function esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function nl2br(v) { return esc(v).replace(/\n/g, '<br>'); }
function stripTags(v) { return String(v || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
function clip(v, n) { const s = stripTags(v); return s.length > n ? s.slice(0, n).trim() + '…' : s; }

function buildSeoHead({ title, description, canonical, jsonld }) {
  let h = `<title>${esc(title)}</title>\n`;
  h += `<meta name="description" content="${esc(description)}">\n`;
  if (canonical) h += `<link rel="canonical" href="${esc(canonical)}">\n`;
  h += `<meta property="og:title" content="${esc(title)}">\n`;
  h += `<meta property="og:description" content="${esc(description)}">\n`;
  h += `<meta property="og:type" content="website">\n`;
  h += `<meta property="og:url" content="${esc(canonical || SITE_URL)}">\n`;
  h += `<meta name="twitter:card" content="summary">\n`;
  if (jsonld) h += `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n`;
  return h;
}

function renderPage(headHtml, bodyHtml) {
  let html = HTML_TEMPLATE.replace('<!--SEO_HEAD-->', headHtml);
  html = html.replace('<!--APP_CONTENT-->', '<div id="app">' + bodyHtml + '</div>');
  return html;
}

// ---------- Body renderers ----------
function expBox(title, inner) {
  return `<div class="exp-box open"><div class="exp-box-head"><h3>${esc(title)}</h3><span class="plus">+</span></div><div class="exp-box-body"><div class="exp-box-body-inner">${inner}</div></div></div>`;
}

const STAMPS_HTML = `<div class="stamp-strip" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
<span style="font-size:11px;background:var(--jade-tint);color:var(--jade);padding:5px 10px;border-radius:100px;">Licensed MD</span>
<span style="font-size:11px;background:var(--jade-tint);color:var(--jade);padding:5px 10px;border-radius:100px;">40+ Years Experience</span>
<span style="font-size:11px;background:var(--jade-tint);color:var(--jade);padding:5px 10px;border-radius:100px;">Orange-Nassau Knighthood</span>
<span style="font-size:11px;background:var(--jade-tint);color:var(--jade);padding:5px 10px;border-radius:100px;">Medisch Dossier Columnist</span>
</div>`;

function renderConditionBody(c, treatments, practitioners, faqs) {
  const name = esc(c.name || c.slug);
  let b = '';
  b += '<div class="subhero wrap">';
  b += `<div class="breadcrumb"><a href="/">Home</a> / <a href="/conditions">What We Treat</a> / ${name}</div>`;
  b += `<h1>${name}</h1>`;
  if (c.summary) b += `<p class="lede">${esc(c.summary)}</p>`;
  b += STAMPS_HTML;
  b += '</div>';

  b += '<div class="condition-layout" style="display:grid;grid-template-columns:1fr 280px;gap:32px;padding-top:40px;max-width:1180px;margin:0 auto;">';
  b += '<div class="condition-main" style="max-width:800px;">';

  b += expBox('Recognition', c.recognition
    ? `<div style="background:var(--white);border:1px solid var(--line);padding:24px;border-radius:4px;">${nl2br(c.recognition)}</div>`
    : '<div class="placeholder-box">Content pending</div>');
  b += expBox('Red Flags', c.red_flags
    ? `<div style="background:var(--amber-tint);border-left:4px solid var(--red);padding:24px;border-radius:4px;">${nl2br(c.red_flags)}</div>`
    : '<div class="placeholder-box">Content pending</div>');
  b += expBox('Understanding', c.understanding
    ? `<p>${nl2br(c.understanding)}</p>`
    : '<div class="placeholder-box">Content pending</div>');
  b += expBox('MC Balans Approach', c.approach
    ? `<div style="background:var(--jade-tint);padding:24px;border-radius:4px;">${c.approach}</div>`
    : '<div class="placeholder-box">Content pending</div>');
  b += expBox('MC Balans Assessment', c.assessment
    ? `<div style="background:var(--white);border:1px solid var(--line);padding:24px;border-radius:4px;">${c.assessment}</div>`
    : '<div class="placeholder-box">Content pending</div>');

  if (treatments && treatments.length) {
    b += '<h2>Treatments</h2><div class="cond-grid">';
    treatments.forEach(t => {
      b += `<div class="cond-card"><div><div class="tag">Treatment</div><h4>${esc(t.name || t.slug)}</h4><p>${esc(clip(t.summary, 120))}</p></div><a class="arrow" href="/treatments/${t.slug}">View →</a></div>`;
    });
    b += '</div>';
  }

  if (c.pricing) {
    b += `<h2>Pricing</h2><div style="background:var(--white);border:1px solid var(--line);padding:24px;border-radius:4px;">${nl2br(c.pricing)}</div>`;
  }

  b += '<h2>Who will treat me?</h2>';
  if (practitioners && practitioners.length) {
    b += '<div style="background:var(--white);border:1px solid var(--line);padding:24px;border-radius:4px;">';
    practitioners.forEach(p => {
      const pn = p.display_role || (p.email ? p.email.split('@')[0] : p.id);
      b += `<h3>${esc(pn)}</h3>`;
      if (p.credentials) b += `<p>${esc(p.credentials)}</p>`;
      if (p.experience_years) b += `<p>${esc(p.experience_years)} years experience</p>`;
    });
    b += '</div>';
  } else {
    b += '<div class="placeholder-box">Content pending</div>';
  }

  b += expBox('Expectations', c.expectations
    ? `<p>${nl2br(c.expectations)}</p>`
    : '<div class="placeholder-box">Content pending</div>');
  b += expBox('Practical Information', c.insurance
    ? `<div style="background:var(--jade-tint);padding:24px;border-radius:4px;"><p>${nl2br(c.insurance)}</p></div>`
    : '<div class="placeholder-box">Content pending</div>');

  if (faqs && faqs.length) {
    b += expBox('FAQ', faqs.map(f =>
      `<div class="faq-item"><div class="q">${esc(f.question)}</div><div class="a">${esc(f.answer)}</div></div>`
    ).join(''));
  }

  b += '</div>';

  b += '<div class="condition-sidebar" style="position:sticky;top:88px;align-self:start;">';
  b += '<div class="cta-card" style="background:var(--white);border:1px solid var(--line);border-radius:4px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">';
  b += '<h3 style="font-size:20px;margin-bottom:12px;color:var(--jade-dark);">Book an appointment</h3>';
  b += '<p style="font-size:14px;color:var(--stone);margin-bottom:16px;">Ready to take the next step? Call us or book online.</p>';
  b += '<a class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px;display:inline-flex;" href="/contact">Book now</a>';
  b += '<a style="display:block;text-align:center;font-family:var(--font-mono);font-size:15px;color:var(--jade);margin-bottom:8px;text-decoration:none;" href="tel:+31703888111">070 388 8111</a>';
  b += '<p style="font-size:12px;color:var(--stone);">Mon–Fri, 9:30–17:00</p>';
  b += '</div></div></div>';

  return b;
}

function renderTreatmentBody(t, conditions, combines, practitioners, pricing, faqs) {
  const name = esc(t.name || t.slug);
  let b = '';
  b += '<div class="subhero wrap">';
  b += `<div class="breadcrumb"><a href="/">Home</a> / <a href="/treatments">Treatments</a> / ${name}</div>`;
  b += `<h1>${name}</h1>`;
  if (t.summary) b += `<p class="lede">${esc(t.summary)}</p>`;
  b += STAMPS_HTML;
  b += '</div>';

  b += '<div class="wrap treat-layout">';
  b += '<div class="treat-body">';
  if (t.intake) b += `<h3>Intake</h3><p>${nl2br(t.intake)}</p>`;
  if (t.body) b += `<h3>The treatment</h3><p>${nl2br(t.body)}</p>`;
  if (t.aftercare) b += `<h3>Aftercare</h3><p>${nl2br(t.aftercare)}</p>`;
  if (combines && combines.length) {
    b += '<h3>Combines well with</h3><div class="chip-row">';
    combines.forEach(c => { b += `<a class="chip" href="/treatments/${c.slug}" style="text-decoration:none;">${esc(c.name || c.slug)}</a>`; });
    b += '</div>';
  }
  if (faqs && faqs.length) {
    b += '<h3>Frequently asked</h3>';
    faqs.forEach(f => { b += `<div class="faq-item"><div class="q">${esc(f.question)}</div><div class="a">${esc(f.answer)}</div></div>`; });
  }
  b += '</div>';

  b += '<div class="treat-side">';
  b += '<div class="info-card">';
  if (pricing && pricing.length) {
    b += '<div class="row"><div class="k">Price</div><div class="v">';
    pricing.forEach(p => { b += `${esc(p.tier_label || '')}: ${esc(p.currency || '€')}${esc(p.amount)}<br>`; });
    b += '</div></div>';
  }
  if (t.duration) b += `<div class="row"><div class="k">Duration</div><div class="v">${esc(t.duration)}</div></div>`;
  if (t.insurance) b += `<div class="row"><div class="k">Insurance</div><div class="v">${esc(t.insurance)}</div></div>`;
  b += '</div>';

  b += '<div class="info-card"><div style="font-size:12px;color:var(--stone);margin-bottom:10px;">Practitioners</div><div class="practitioner-row">';
  if (practitioners && practitioners.length) {
    practitioners.forEach(p => {
      const pn = p.display_role || (p.email ? p.email.split('@')[0] : p.id);
      b += `<span class="prac-chip">${esc(pn)}</span>`;
    });
  } else b += '<span class="prac-chip">Pending</span>';
  b += '</div></div>';

  b += '<div class="info-card"><div style="font-size:12px;color:var(--stone);margin-bottom:10px;">Treats these conditions</div><div class="chip-groups">';
  if (conditions && conditions.length) {
    conditions.forEach(c => { b += `<a class="chip" href="/conditions/${c.slug}" style="text-decoration:none;display:inline-block;margin:2px;">${esc(c.name || c.slug)}</a>`; });
  } else b += '<span class="chip">Pending</span>';
  b += '</div></div>';

  b += '<a class="btn btn-primary" style="width:100%;justify-content:center;display:inline-flex;" href="/contact">Book an appointment</a>';
  b += '</div></div>';
  return b;
}

function renderHomeBody(conditions, categories) {
  let b = '';
  b += '<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">';
  b += '<h1>A <em>balanced</em> approach to the health of mind and body.</h1>';
  b += '<p class="lede">Dr. Wenzhi Lin brings over 40 years of dual experience between China and the Netherlands. Her comprehensive approach combines Western and Chinese medicine to give patients a more complete view of what\'s going on.</p>';
  b += '<a class="btn btn-primary" href="/contact">Book an appointment</a>';
  b += '</div><div class="hero-portrait"><div class="portrait-frame" style="aspect-ratio:4/5;background:linear-gradient(155deg,#DCE3D9,#C7D2C1);border-radius:2px;"></div></div></div></section>';

  b += '<section class="cred-section"><div class="wrap"><h2>Why do patients trust Dr. Lin?</h2><div class="cred-grid">';
  const creds = [
    { num: '01', title: 'Credible', text: 'A practising, licensed medical doctor in the Netherlands.' },
    { num: '02', title: 'Experienced', text: '40+ years of sustained practice across Chinese and Western medicine.' },
    { num: '03', title: 'Respected', text: 'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).' },
    { num: '04', title: 'Successful', text: 'Reviews supporting treatment effectiveness.' }
  ];
  creds.forEach(c => { b += `<div class="cred-card"><div class="num">${c.num}</div><h3>${c.title}</h3><p>${c.text}</p></div>`; });
  b += '</div></div></section>';

  b += '<div class="insurance-band"><div class="wrap insurance-inner"><p><strong>Insurance:</strong> Consultations may be covered under standard health insurance. TCM treatments may be covered under supplementary insurance (aanvullende verzekering). We can help you check.</p></div></div>';

  b += '<section class="section" style="background:var(--jade-tint);"><div class="wrap"><div class="section-head"><h2>What We Treat</h2></div>';
  categories.forEach(cat => {
    const cc = conditions.filter(c => c.category_slug === cat.slug);
    if (!cc.length) return;
    b += `<div class="category-group"><h3>${esc(cat.name || cat.slug)}</h3><div class="cond-grid">`;
    cc.forEach(c => {
      b += `<div class="cond-card"><div><div class="tag">${esc(cat.name || '')}</div><h4>${esc(c.name || c.slug)}</h4><p>${esc(clip(c.summary, 120))}</p></div><a class="arrow" href="/conditions/${c.slug}">Explore →</a></div>`;
    });
    b += '</div></div>';
  });
  b += '</div></section>';

  return b;
}

function renderConditionsListBody(conditions, categories) {
  let b = '';
  b += '<div class="subhero wrap"><div class="breadcrumb"><a href="/">Home</a> / What We Treat</div><h1>What We Treat</h1><p class="lede">Organised by the complaint, not the treatment — find where it hurts, or what\'s been going on, to see how we approach it.</p></div>';
  b += '<section class="section"><div class="wrap">';
  categories.forEach(cat => {
    const cc = conditions.filter(c => c.category_slug === cat.slug);
    if (!cc.length) return;
    b += `<div class="category-group"><h3>${esc(cat.name || cat.slug)}</h3><div class="cond-grid">`;
    cc.forEach(c => {
      b += `<div class="cond-card"><div><div class="tag">${esc(cat.name || '')}</div><h4>${esc(c.name || c.slug)}</h4><p>${esc(clip(c.summary, 120))}</p></div><a class="arrow" href="/conditions/${c.slug}">Explore →</a></div>`;
    });
    b += '</div></div>';
  });
  b += '</div></section>';
  return b;
}

function renderTreatmentsListBody(treatments) {
  let b = '';
  b += '<div class="subhero wrap"><div class="breadcrumb"><a href="/">Home</a> / Treatments</div><h1>Treatments</h1><p class="lede">See how each treatment works, and what to expect.</p></div>';
  b += '<section class="section"><div class="cond-grid">';
  treatments.forEach(t => {
    b += `<div class="cond-card"><div><div class="tag">Treatment</div><h4>${esc(t.name || t.slug)}</h4><p>${esc(clip(t.summary, 120))}</p></div><a class="arrow" href="/treatments/${t.slug}">View →</a></div>`;
  });
  b += '</div></section>';
  return b;
}

// ---------- API ROUTES (unchanged) ----------
app.get('/api/categories', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT c.slug, COALESCE(t.value, c.name, c.slug) AS name
      FROM categories c
      LEFT JOIN translations t ON t.category_id = c.id AND t.field_name = 'name' AND t.locale = $1
      WHERE c.status = 'published'
      ORDER BY c.sort_order
    `, [lang]);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/conditions', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT c.id, c.slug, c.summary, c.recognition, c.red_flags, c.understanding, c.approach, c.assessment,
             c.expectations, c.insurance, c.pricing, c.cta,
             cat.slug AS category_slug,
             COALESCE(t.value, c.name, c.slug) AS name
      FROM conditions c
      JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN translations t ON t.condition_id = c.id AND t.field_name = 'name' AND t.locale = $1
      WHERE c.status = 'published'
      ORDER BY c.id
    `, [lang]);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/conditions/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = req.query.lang || 'en';
  try {
    const conditionResult = await pool.query(`
      SELECT c.*,
             COALESCE(t_name.value, c.name, c.slug) AS name,
             COALESCE(t_summary.value, c.summary) AS summary,
             COALESCE(t_recognition.value, c.recognition) AS recognition,
             COALESCE(t_redflags.value, c.red_flags) AS red_flags,
             COALESCE(t_understanding.value, c.understanding) AS understanding,
             COALESCE(t_approach.value, c.approach) AS approach,
             COALESCE(t_assessment.value, c.assessment) AS assessment,
             COALESCE(t_expectations.value, c.expectations) AS expectations,
             COALESCE(t_insurance.value, c.insurance) AS insurance,
             COALESCE(t_pricing.value, c.pricing) AS pricing,
             COALESCE(t_cta.value, c.cta) AS cta
      FROM conditions c
      LEFT JOIN translations t_name        ON t_name.condition_id = c.id AND t_name.field_name = 'name' AND t_name.locale = $2
      LEFT JOIN translations t_summary     ON t_summary.condition_id = c.id AND t_summary.field_name = 'summary' AND t_summary.locale = $2
      LEFT JOIN translations t_recognition ON t_recognition.condition_id = c.id AND t_recognition.field_name = 'recognition' AND t_recognition.locale = $2
      LEFT JOIN translations t_redflags    ON t_redflags.condition_id = c.id AND t_redflags.field_name = 'red_flags' AND t_redflags.locale = $2
      LEFT JOIN translations t_understanding ON t_understanding.condition_id = c.id AND t_understanding.field_name = 'understanding' AND t_understanding.locale = $2
      LEFT JOIN translations t_approach    ON t_approach.condition_id = c.id AND t_approach.field_name = 'approach' AND t_approach.locale = $2
      LEFT JOIN translations t_assessment  ON t_assessment.condition_id = c.id AND t_assessment.field_name = 'assessment' AND t_assessment.locale = $2
      LEFT JOIN translations t_expectations ON t_expectations.condition_id = c.id AND t_expectations.field_name = 'expectations' AND t_expectations.locale = $2
      LEFT JOIN translations t_insurance   ON t_insurance.condition_id = c.id AND t_insurance.field_name = 'insurance' AND t_insurance.locale = $2
      LEFT JOIN translations t_pricing     ON t_pricing.condition_id = c.id AND t_pricing.field_name = 'pricing' AND t_pricing.locale = $2
      LEFT JOIN translations t_cta         ON t_cta.condition_id = c.id AND t_cta.field_name = 'cta' AND t_cta.locale = $2
      WHERE c.slug = $1 AND c.status = 'published'
    `, [slug, lang]);
    if (conditionResult.rows.length === 0) return res.status(404).json({ error: 'Condition not found' });
    const condition = conditionResult.rows[0];

    const treatments = await pool.query(`
      SELECT tr.slug,
             COALESCE(tt_name.value, tr.name, tr.slug) AS name,
             COALESCE(tt_summary.value, '') AS summary,
             tr.duration
      FROM conditions c
      JOIN condition_treatments ct ON ct.condition_id = c.id
      JOIN treatments tr ON tr.id = ct.treatment_id
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = tr.id AND tt_name.field_name = 'name' AND tt_name.locale = $2
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = tr.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $2
      WHERE c.slug = $1
      ORDER BY ct.display_order
    `, [slug, lang]);

    const practitioners = await pool.query(`
      SELECT DISTINCT p.id, p.email, p.roles, p.display_role, p.credentials, p.languages_spoken, p.photo_url, p.quote, p.experience_years
      FROM practitioners p
      JOIN practitioner_treatments pt ON pt.practitioner_id = p.id
      JOIN condition_treatments ct ON ct.treatment_id = pt.treatment_id
      JOIN conditions c ON c.id = ct.condition_id
      WHERE c.slug = $1
    `, [slug]);

    const faqs = await pool.query(`
      SELECT f.slug, COALESCE(tq.value, '') AS question, COALESCE(ta.value, '') AS answer
      FROM conditions c
      JOIN condition_faqs cf ON cf.condition_id = c.id
      JOIN faqs f ON f.id = cf.faq_id
      LEFT JOIN translations tq ON tq.faq_id = f.id AND tq.field_name = 'question' AND tq.locale = $2
      LEFT JOIN translations ta ON ta.faq_id = f.id AND ta.field_name = 'answer' AND ta.locale = $2
      WHERE c.slug = $1 ORDER BY cf.display_order
    `, [slug, lang]);

    res.json({ condition, treatments: treatments.rows, practitioners: practitioners.rows, faqs: faqs.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/treatments', async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const result = await pool.query(`
      SELECT t.slug, t.duration,
             COALESCE(tt_name.value, t.name, t.slug) AS name,
             COALESCE(tt_summary.value, '') AS summary
      FROM treatments t
      LEFT JOIN translations tt_name    ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $1
      LEFT JOIN translations tt_summary ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $1
      WHERE t.status = 'published'
      ORDER BY t.id
    `, [lang]);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/treatments/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = req.query.lang || 'en';
  try {
    const treatmentResult = await pool.query(`
      SELECT t.*,
             COALESCE(tt_name.value, t.name, t.slug) AS name,
             COALESCE(tt_summary.value, '') AS summary,
             COALESCE(tt_body.value, '') AS body,
             COALESCE(tt_intake.value, '') AS intake,
             COALESCE(tt_aftercare.value, '') AS aftercare,
             COALESCE(tt_insurance.value, '') AS insurance
      FROM treatments t
      LEFT JOIN translations tt_name       ON tt_name.treatment_id = t.id AND tt_name.field_name = 'name' AND tt_name.locale = $2
      LEFT JOIN translations tt_summary    ON tt_summary.treatment_id = t.id AND tt_summary.field_name = 'summary' AND tt_summary.locale = $2
      LEFT JOIN translations tt_body       ON tt_body.treatment_id = t.id AND tt_body.field_name = 'body' AND tt_body.locale = $2
      LEFT JOIN translations tt_intake     ON tt_intake.treatment_id = t.id AND tt_intake.field_name = 'intake' AND tt_intake.locale = $2
      LEFT JOIN translations tt_aftercare  ON tt_aftercare.treatment_id = t.id AND tt_aftercare.field_name = 'aftercare' AND tt_aftercare.locale = $2
      LEFT JOIN translations tt_insurance  ON tt_insurance.treatment_id = t.id AND tt_insurance.field_name = 'insurance' AND tt_insurance.locale = $2
      WHERE t.slug = $1 AND t.status = 'published'
    `, [slug, lang]);
    if (treatmentResult.rows.length === 0) return res.status(404).json({ error: 'Treatment not found' });
    const treatment = treatmentResult.rows[0];

    const conditions = await pool.query(`
      SELECT c.slug, COALESCE(tc.value, c.name, c.slug) AS name
      FROM treatments t
      JOIN condition_treatments ct ON ct.treatment_id = t.id
      JOIN conditions c ON c.id = ct.condition_id
      LEFT JOIN translations tc ON tc.condition_id = c.id AND tc.field_name = 'name' AND tc.locale = $2
      WHERE t.slug = $1
    `, [slug, lang]);

    const combines = await pool.query(`
      SELECT t2.slug, COALESCE(tt2.value, t2.name, t2.slug) AS name
      FROM treatment_combines_with tcw
      JOIN treatments t2 ON t2.id = tcw.treatment_id_b
      JOIN treatments t1 ON t1.id = tcw.treatment_id_a
      LEFT JOIN translations tt2 ON tt2.treatment_id = t2.id AND tt2.field_name = 'name' AND tt2.locale = $2
      WHERE t1.slug = $1
      UNION ALL
      SELECT t1.slug, COALESCE(tt1.value, t1.name, t1.slug) AS name
      FROM treatment_combines_with tcw
      JOIN treatments t1 ON t1.id = tcw.treatment_id_a
      JOIN treatments t2 ON t2.id = tcw.treatment_id_b
      LEFT JOIN translations tt1 ON tt1.treatment_id = t1.id AND tt1.field_name = 'name' AND tt1.locale = $2
      WHERE t2.slug = $1
    `, [slug, lang]);

    const practitioners = await pool.query(`
      SELECT DISTINCT p.id, p.email, p.roles, p.display_role, p.credentials, p.languages_spoken, p.photo_url, p.quote, p.experience_years
      FROM practitioners p
      JOIN practitioner_treatments pt ON pt.practitioner_id = p.id
      JOIN treatments t ON t.id = pt.treatment_id
      WHERE t.slug = $1
    `, [slug]);

    const pricing = await pool.query(`
      SELECT pt.tier_label, pt.amount, pt.currency
      FROM price_tiers pt
      JOIN treatments t ON t.id = pt.treatment_id
      WHERE t.slug = $1 AND pt.show_on_pricing_page = true
    `, [slug]);

    const faqs = await pool.query(`
      SELECT f.slug, COALESCE(tq.value, '') AS question, COALESCE(ta.value, '') AS answer
      FROM treatments t
      JOIN treatment_faqs tf ON tf.treatment_id = t.id
      JOIN faqs f ON f.id = tf.faq_id
      LEFT JOIN translations tq ON tq.faq_id = f.id AND tq.field_name = 'question' AND tq.locale = $2
      LEFT JOIN translations ta ON ta.faq_id = f.id AND ta.field_name = 'answer' AND ta.locale = $2
      WHERE t.slug = $1 ORDER BY tf.display_order
    `, [slug, lang]);

    res.json({ treatment, conditions: conditions.rows, combines: combines.rows, practitioners: practitioners.rows, pricing: pricing.rows, faqs: faqs.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/practitioners', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, roles, display_role, credentials, languages_spoken, photo_url, quote, experience_years, is_active
      FROM practitioners
      WHERE is_active = true
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/pricing', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pt.id, pt.tier_label, pt.amount, pt.currency,
             COALESCE(c.slug, t.slug) AS entity_slug,
             CASE WHEN pt.condition_id IS NOT NULL THEN 'condition'
                  WHEN pt.treatment_id IS NOT NULL THEN 'treatment' END AS entity_type
      FROM price_tiers pt
      LEFT JOIN conditions c ON c.id = pt.condition_id
      LEFT JOIN treatments t ON t.id = pt.treatment_id
      WHERE pt.show_on_pricing_page = true
      ORDER BY pt.amount
    `);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// ---------- sitemap.xml ----------
app.get('/sitemap.xml', async (req, res) => {
  try {
    const conditions = await pool.query(`SELECT slug, updated_at FROM conditions WHERE status = 'published'`);
    const treatments = await pool.query(`SELECT slug, updated_at FROM treatments WHERE status = 'published'`);
    const staticPages = ['', 'conditions', 'treatments', 'resources', 'about', 'contact'];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const p of staticPages) xml += `  <url><loc>${SITE_URL}/${p}</loc></url>\n`;
    for (const r of conditions.rows) {
      xml += `  <url><loc>${SITE_URL}/conditions/${r.slug}</loc>`;
      if (r.updated_at) xml += `<lastmod>${r.updated_at.toISOString()}</lastmod>`;
      xml += `</url>\n`;
    }
    for (const r of treatments.rows) {
      xml += `  <url><loc>${SITE_URL}/treatments/${r.slug}</loc>`;
      if (r.updated_at) xml += `<lastmod>${r.updated_at.toISOString()}</lastmod>`;
      xml += `</url>\n`;
    }
    xml += `</urlset>`;
    res.type('application/xml').send(xml);
  } catch (e) { console.error(e); res.status(500).send('Error generating sitemap'); }
});

// ---------- robots.txt ----------
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// ---------- HTML pages with SSR-lite body + SEO head ----------
app.get('/', async (req, res) => {
  try {
    const [condR, catR] = await Promise.all([
      pool.query(`SELECT c.slug, c.summary, cat.slug AS category_slug, COALESCE(c.name, c.slug) AS name
                  FROM conditions c JOIN categories cat ON cat.id = c.category_id
                  WHERE c.status = 'published' ORDER BY c.id`),
      pool.query(`SELECT slug, COALESCE(name, slug) AS name FROM categories WHERE status = 'published' ORDER BY sort_order`)
    ]);
    const head = buildSeoHead({
      title: 'MC Balans — Western & Traditional Chinese Medicine, The Hague',
      description: 'Led by Dr. Wenzhi Lin, MC Balans combines Western medical assessment with Traditional Chinese Medicine to treat pain, stress, women\'s health and more in The Hague.',
      canonical: SITE_URL + '/',
      jsonld: { "@context": "https://schema.org", "@type": "MedicalClinic", "name": "MC Balans", "url": SITE_URL }
    });
    res.send(renderPage(head, renderHomeBody(condR.rows, catR.rows)));
  } catch (e) {
    console.error(e);
    res.send(renderPage(buildSeoHead({ title: 'MC Balans', description: 'MC Balans, The Hague.', canonical: SITE_URL + '/' }), ''));
  }
});

app.get('/conditions', async (req, res) => {
  try {
    const [condR, catR] = await Promise.all([
      pool.query(`SELECT c.slug, c.summary, cat.slug AS category_slug, COALESCE(c.name, c.slug) AS name
                  FROM conditions c JOIN categories cat ON cat.id = c.category_id
                  WHERE c.status = 'published' ORDER BY c.id`),
      pool.query(`SELECT slug, COALESCE(name, slug) AS name FROM categories WHERE status = 'published' ORDER BY sort_order`)
    ]);
    const head = buildSeoHead({
      title: 'What We Treat — Conditions | MC Balans',
      description: 'Browse the full list of conditions we treat at MC Balans: pain, stress, women\'s health, allergies, addiction, beauty and general wellness.',
      canonical: SITE_URL + '/conditions'
    });
    res.send(renderPage(head, renderConditionsListBody(condR.rows, catR.rows)));
  } catch (e) {
    console.error(e);
    res.send(renderPage(buildSeoHead({ title: 'What We Treat | MC Balans', description: 'Conditions we treat.', canonical: SITE_URL + '/conditions' }), ''));
  }
});

app.get('/conditions/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const cr = await pool.query(`SELECT * FROM conditions WHERE slug = $1 AND status = 'published'`, [slug]);
    if (cr.rowCount === 0) {
      return res.status(404).send(renderPage(buildSeoHead({
        title: 'Not found | MC Balans', description: 'The page you are looking for does not exist.',
        canonical: `${SITE_URL}/conditions/${slug}`
      }), '<div class="subhero wrap"><h1>Not found</h1></div>'));
    }
    const c = cr.rows[0];
    const [tR, pR, fR] = await Promise.all([
      pool.query(`SELECT tr.slug, COALESCE(tr.name, tr.slug) AS name,
                         COALESCE((SELECT value FROM translations WHERE treatment_id = tr.id AND field_name = 'summary' AND locale = 'en' LIMIT 1), '') AS summary
                  FROM condition_treatments ct JOIN treatments tr ON tr.id = ct.treatment_id
                  WHERE ct.condition_id = $1 ORDER BY ct.display_order`, [c.id]),
      pool.query(`SELECT DISTINCT p.id, p.email, p.roles, p.display_role, p.credentials, p.experience_years
                  FROM practitioners p
                  JOIN practitioner_treatments pt ON pt.practitioner_id = p.id
                  JOIN condition_treatments ct ON ct.treatment_id = pt.treatment_id
                  WHERE ct.condition_id = $1`, [c.id]),
      pool.query(`SELECT f.slug,
                         COALESCE((SELECT value FROM translations WHERE faq_id = f.id AND field_name = 'question' AND locale = 'en' LIMIT 1), '') AS question,
                         COALESCE((SELECT value FROM translations WHERE faq_id = f.id AND field_name = 'answer' AND locale = 'en' LIMIT 1), '') AS answer
                  FROM condition_faqs cf JOIN faqs f ON f.id = cf.faq_id
                  WHERE cf.condition_id = $1 ORDER BY cf.display_order`, [c.id])
    ]);
    const name = c.name || c.slug;
    const head = buildSeoHead({
      title: `${name} — Assessment & Treatment | MC Balans`,
      description: clip(c.summary, 300) || `Assessment and treatment for ${name} at MC Balans, The Hague.`,
      canonical: `${SITE_URL}/conditions/${slug}`,
      jsonld: { "@context": "https://schema.org", "@type": "MedicalCondition", "name": name, "description": stripTags(c.summary || ''), "url": `${SITE_URL}/conditions/${slug}` }
    });
    res.send(renderPage(head, renderConditionBody(c, tR.rows, pR.rows, fR.rows)));
  } catch (e) {
    console.error(e);
    res.status(500).send(renderPage(buildSeoHead({ title: 'MC Balans', description: '', canonical: SITE_URL + '/conditions/' + slug }), ''));
  }
});

app.get('/treatments', async (req, res) => {
  try {
    const tR = await pool.query(`
      SELECT t.slug, COALESCE(t.name, t.slug) AS name,
             COALESCE((SELECT value FROM translations WHERE treatment_id = t.id AND field_name = 'summary' AND locale = 'en' LIMIT 1), '') AS summary
      FROM treatments t WHERE t.status = 'published' ORDER BY t.id
    `);
    const head = buildSeoHead({
      title: 'Treatments — Acupuncture, Cupping, Herbal Medicine | MC Balans',
      description: 'Acupuncture, acupotomy, cupping, Chinese herbal medicine, PRP and more — every treatment at MC Balans follows an assessment, never the other way around.',
      canonical: SITE_URL + '/treatments'
    });
    res.send(renderPage(head, renderTreatmentsListBody(tR.rows)));
  } catch (e) {
    console.error(e);
    res.send(renderPage(buildSeoHead({ title: 'Treatments | MC Balans', description: 'Our treatments.', canonical: SITE_URL + '/treatments' }), ''));
  }
});

app.get('/treatments/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const tr = await pool.query(`
      SELECT t.*,
             COALESCE(t.name, t.slug) AS name,
             COALESCE((SELECT value FROM translations WHERE treatment_id = t.id AND field_name = 'summary' AND locale = 'en' LIMIT 1), '') AS summary,
             COALESCE((SELECT value FROM translations WHERE treatment_id = t.id AND field_name = 'body' AND locale = 'en' LIMIT 1), '') AS body,
             COALESCE((SELECT value FROM translations WHERE treatment_id = t.id AND field_name = 'intake' AND locale = 'en' LIMIT 1), '') AS intake,
             COALESCE((SELECT value FROM translations WHERE treatment_id = t.id AND field_name = 'aftercare' AND locale = 'en' LIMIT 1), '') AS aftercare,
             COALESCE((SELECT value FROM translations WHERE treatment_id = t.id AND field_name = 'insurance' AND locale = 'en' LIMIT 1), '') AS insurance
      FROM treatments t WHERE t.slug = $1 AND t.status = 'published'
    `, [slug]);
    if (tr.rowCount === 0) {
      return res.status(404).send(renderPage(buildSeoHead({
        title: 'Not found | MC Balans', description: '', canonical: `${SITE_URL}/treatments/${slug}`
      }), '<div class="subhero wrap"><h1>Not found</h1></div>'));
    }
    const t = tr.rows[0];
    const [cR, cbR, pR, prR, fR] = await Promise.all([
      pool.query(`SELECT c.slug, COALESCE(c.name, c.slug) AS name
                  FROM condition_treatments ct JOIN conditions c ON c.id = ct.condition_id
                  WHERE ct.treatment_id = $1`, [t.id]),
      pool.query(`SELECT t2.slug, COALESCE(t2.name, t2.slug) AS name
                  FROM treatment_combines_with tcw JOIN treatments t2 ON t2.id = tcw.treatment_id_b
                  WHERE tcw.treatment_id_a = $1
                  UNION
                  SELECT t1.slug, COALESCE(t1.name, t1.slug) AS name
                  FROM treatment_combines_with tcw JOIN treatments t1 ON t1.id = tcw.treatment_id_a
                  WHERE tcw.treatment_id_b = $1`, [t.id]),
      pool.query(`SELECT DISTINCT p.id, p.email, p.display_role FROM practitioners p
                  JOIN practitioner_treatments pt ON pt.practitioner_id = p.id
                  WHERE pt.treatment_id = $1`, [t.id]),
      pool.query(`SELECT tier_label, amount, currency FROM price_tiers
                  WHERE treatment_id = $1 AND show_on_pricing_page = true`, [t.id]),
      pool.query(`SELECT f.slug,
                         COALESCE((SELECT value FROM translations WHERE faq_id = f.id AND field_name = 'question' AND locale = 'en' LIMIT 1), '') AS question,
                         COALESCE((SELECT value FROM translations WHERE faq_id = f.id AND field_name = 'answer' AND locale = 'en' LIMIT 1), '') AS answer
                  FROM treatment_faqs tf JOIN faqs f ON f.id = tf.faq_id
                  WHERE tf.treatment_id = $1 ORDER BY tf.display_order`, [t.id])
    ]);
    const name = t.name || t.slug;
    const head = buildSeoHead({
      title: `${name} — Treatment | MC Balans`,
      description: clip(t.summary, 300) || `${name} at MC Balans, The Hague.`,
      canonical: `${SITE_URL}/treatments/${slug}`,
      jsonld: { "@context": "https://schema.org", "@type": "MedicalTherapy", "name": name, "description": stripTags(t.summary || ''), "url": `${SITE_URL}/treatments/${slug}` }
    });
    res.send(renderPage(head, renderTreatmentBody(t, cR.rows, cbR.rows, pR.rows, prR.rows, fR.rows)));
  } catch (e) {
    console.error(e);
    res.status(500).send(renderPage(buildSeoHead({ title: 'MC Balans', description: '', canonical: SITE_URL + '/treatments/' + slug }), ''));
  }
});

app.get('/about', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'About MC Balans — Dr. Wenzhi Lin & Team',
    description: 'Meet the team, see the clinic, check pricing, or read about our approach to Western and Traditional Chinese Medicine in The Hague.',
    canonical: SITE_URL + '/about'
  }), ''));
});

app.get('/resources', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'Resources — Medisch Dossier column | MC Balans',
    description: 'Articles and columns by Dr. Lin from Medisch Dossier, cross-linked to the conditions and treatments they cover.',
    canonical: SITE_URL + '/resources'
  }), ''));
});

app.get('/contact', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'Contact — Book an appointment | MC Balans',
    description: 'Call 070 388 8111 or email info@mcbalans.nl. Open Monday to Friday, 9:30–17:00.',
    canonical: SITE_URL + '/contact'
  }), ''));
});

app.get('*', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'MC Balans', description: 'MC Balans — Western & Traditional Chinese Medicine, The Hague.',
    canonical: SITE_URL + req.path
  }), ''));
});

app.listen(port, () => { console.log(`MC Balans running on port ${port}`); });
