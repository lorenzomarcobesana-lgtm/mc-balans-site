const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const approachText = `<p>Rather than treating a symptom in isolation, every assessment at MC Balans looks at your complaint through three connected lenses before any treatment is recommended:</p>

<p><strong>Structure</strong> — how the physical parts of your body relate to one another: bones, muscles, fascia, scars, nerves, blood vessels, and circulation. Pain in one spot is often the result of tension, restriction, or compensation happening somewhere else in the chain. This lens looks at what's actually pulling on what, and why.</p>

<p><strong>Function</strong> — how your body performs during ordinary daily life: walking, sitting, sleeping, working. Different systems in the body are meant to work together, and this lens identifies where that coordination is breaking down and affecting your movement or activity.</p>

<p><strong>Regulation</strong> — how your body responds and adapts when something disrupts its normal functioning. This includes the influence of physical and emotional stress on your body's ability to regulate itself and recover, which can play a bigger role in persistent complaints than people expect.</p>

<p>Only once these three lenses point to a clear pattern does Dr. Lin or a member of the care team recommend a specific approach — acupuncture, herbal medicine, cupping, or another treatment — because it fits your case, not because it's the default response to your symptom.</p>`;

const assessmentText = `<p>Your first visit is a consultation with Dr. Lin or Dr. Wang. Before you're called in, you'll fill out a short intake form covering your health history, insurance details, and the reason for your visit.</p>

<p><strong>Intake</strong><br>
We start with your complaint, in your own words, and how it's developed — and check for any warning symptoms (see Red Flags).</p>

<p><strong>Conventional medical assessment</strong><br>
We review your medical history and current medication, rule out the red-flag conditions above, and arrange further diagnostics or a referral if needed.</p>

<p><strong>Structural assessment</strong><br>
We look at how the physical parts of your body — bones, muscles, fascia, scars, tissue, nerves, blood vessels, and circulation — relate to one another, and whether a change in one place is affecting another through tension, compensation, or restriction elsewhere.</p>

<p><strong>Functional assessment</strong><br>
We look at how your body moves and functions in daily life, and how different regions work together — or don't — in ways connected to your complaint.</p>

<p><strong>Regulatory assessment</strong><br>
We look at how your body responds and adapts when its normal functioning is disrupted — recovery, circulation, inflammation — and how physical or emotional stress may be affecting your ability to heal.</p>

<p><strong>TCM assessment (where appropriate)</strong><br>
Where relevant, this includes a pulse and tongue examination as part of the TCM diagnostic model, offering a complementary perspective that can inform your treatment.</p>

<p>All of this comes together into one picture, and your treatment plan follows from it — built to address what's actually causing your complaint, not just the symptom.</p>`;

async function main() {
  const conditions = await pool.query('SELECT id, slug FROM conditions');
  for (const row of conditions.rows) {
    await pool.query(
      'UPDATE conditions SET approach = $1, assessment = $2 WHERE id = $3',
      [approachText, assessmentText, row.id]
    );
    console.log(`✅ Updated ${row.slug}`);
  }
  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
