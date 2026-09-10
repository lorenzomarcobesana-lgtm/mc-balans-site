const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const conditionNames = {
  'burnout-work-related-stress': 'Burnout & work-related stress',
  'anxiety-nervous-tension': 'Anxiety & nervous tension',
  'sleep-problems': 'Sleep Problems',
  'fatigue-low-energy': 'Fatigue & low energy',
  'hay-fever': 'Hay Fever',
  'recurring-colds': 'Recurring Colds',
  'seasonal-depression': 'Seasonal Depression',
  'menstrual-complaints': 'Menstrual Complaints',
  'fertility-support': 'Fertility Support',
  'pregnancy-complaints': 'Pregnancy Complaints',
  'menopause': 'Menopause',
  'migraines': 'Migraines',
  'head-neck-facial-discomfort': 'Head, Neck and Facial Discomfort',
  'non-specific-lower-back-pain': 'Non-Specific Lower Back Pain',
  'joints-pain': 'Joints Pain',
  'hip-pain': 'Hip Pain',
  'muscle-sport-injuries': 'Muscle & Sport Injuries',
  'fibromyalgia-nerve-related-pain': 'Fibromyalgia & Nerve Related Pain',
  'digestive-complaints': 'Digestive Complaints',
  'weight-management': 'Weight Management',
  'eye-related-complaints': 'Eye-related Complaints',
  'asthma': 'Asthma',
  'hair-transplant-aftercare': 'Hair Transplant Aftercare',
  'hair-loss': 'Hair Loss',
  'smoking-addiction': 'Smoking Addiction',
  'sugar-dependency': 'Sugar Dependency'
};

const categoryNames = {
  'pain': 'Pain',
  'stress': 'Stress',
  'allergies-seasonal-health': 'Allergies & Seasonal Health',
  'womens-health': "Women's Health",
  'addiction': 'Addiction',
  'beauty-treatments': 'Beauty Treatments',
  'general-wellness': 'General Wellness'
};

const treatmentNames = {
  'western-medicine-consultation': 'Western Medicine Consultation',
  'tcm-consultation': 'TCM Consultation',
  'acupuncture': 'Acupuncture',
  'acupotomy': 'Acupotomy',
  'cupping': 'Cupping',
  'chinese-herbal-medicine': 'Chinese Herbal Medicine',
  'nutrition-movement': 'Nutrition & Movement',
  'prp-therapy': 'PRP Therapy',
  'moxa-therapy': 'Moxa Therapy',
  'ear-acupuncture': 'Ear Acupuncture'
};

async function main() {
  // Add name columns if they don't exist
  await pool.query('ALTER TABLE conditions ADD COLUMN IF NOT EXISTS name TEXT');
  await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS name TEXT');
  await pool.query('ALTER TABLE treatments ADD COLUMN IF NOT EXISTS name TEXT');
  console.log('✅ Columns ensured.');

  // Update conditions
  for (const [slug, name] of Object.entries(conditionNames)) {
    const res = await pool.query('UPDATE conditions SET name = $1 WHERE slug = $2 RETURNING slug', [name, slug]);
    if (res.rowCount > 0) console.log(`✅ condition: ${slug}`);
    else console.log(`⚠️  condition not found: ${slug}`);
  }

  // Update categories
  for (const [slug, name] of Object.entries(categoryNames)) {
    const res = await pool.query('UPDATE categories SET name = $1 WHERE slug = $2 RETURNING slug', [name, slug]);
    if (res.rowCount > 0) console.log(`✅ category: ${slug}`);
    else console.log(`⚠️  category not found: ${slug}`);
  }

  // Update treatments
  for (const [slug, name] of Object.entries(treatmentNames)) {
    const res = await pool.query('UPDATE treatments SET name = $1 WHERE slug = $2 RETURNING slug', [name, slug]);
    if (res.rowCount > 0) console.log(`✅ treatment: ${slug}`);
    else console.log(`⚠️  treatment not found: ${slug}`);
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
