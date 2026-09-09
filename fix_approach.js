const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const formattedApproach = `<p>At MC Balans, we don't start by choosing a treatment and looking for a complaint to apply it to. Every treatment plan follows an assessment that covers conventional medical, structural, functional, regulatory and, where relevant, Traditional Chinese Medicine perspectives — carried out by Dr. Lin or a member of the care team. Acupuncture, herbal medicine, cupping or another approach (often combined) is recommended only once that assessment points to it being the right fit for your specific pattern, not because it's the default response to your complaint.</p>
<p>MC Balans’ assessment starts from the immediate complaint and considers it through three different interconnected lenses to identify the possible underlying connections between dysfunctionalities:</p>
<h4>Structure</h4>
<p>How physical relationships - bones, muscles, fascia, scars, tissue tension, nerves, blood vessels, circulation and general fluid movement - work throughout the body. Issues are not approached in isolation, but rather in terms of what alters fluidity of chain interactions and relationships between connected systems, and why.</p>
<h4>Function</h4>
<p>How the body functions in everyday life, and how interactions between different systems can affect movement, activity and overall well-being.</p>
<h4>Regulation</h4>
<p>How the body responds and adapts when its normal functioning is disrupted, including the influence of physical and emotional stress on the body's ability to regulate itself and respond to an immediate complaint.</p>`;

async function main() {
  const conditions = await pool.query('SELECT id, slug FROM conditions');
  for (const row of conditions.rows) {
    await pool.query(
      'UPDATE conditions SET approach = $1 WHERE id = $2',
      [formattedApproach, row.id]
    );
    console.log(`✅ Updated ${row.slug}`);
  }
  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
