const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Treatment content from the Excel (keyed by treatment slug)
const treatments = {
  "western-medicine-consultation": {
    summary: "A consultation with Dr. Lin to assess your symptoms, medical history and individual health needs, providing a medical perspective alongside MC Balans' broader approach to care and exclude life-threatening medical issues.",
    body: "During a Western Medicine Consultation, Dr. Lin discuss your symptoms, medical history and current concerns to develop a clear understanding of your health situation. Where appropriate, the consultation may include a physical assessment and recommendations for further investigation, referral or treatment. The consultation can also help determine whether Western medical care, TCM, or a combination of approaches may be appropriate for your individual needs.",
    intake: "Upon arrival, you will complete an intake form covering your health history, current symptoms and reason for your visit. Once completed, you will be called in for your consultation with Dr. Lin, who will discuss your concerns and carry out the appropriate medical assessment.",
    aftercare: "",
    insurance: "Consultations and treatments may be totally or partially covered depending on whether your insurance covers alternative/complementary care — we can help you check this."
  },
  "tcm-consultation": {
    summary: "A consultation focused on understanding why your body may not be functioning as it should, combining conventional medical assessment with an extensive analysis of the body's structural, functional and, where appropriate, Traditional Chinese Medicine balance.",
    body: "During a TCM Consultation, we look beyond the question of which disease you may have and instead explore what may be disrupting the way your body functions. This includes an assessment of structural and functional patterns and, where appropriate, the balance of the body from a Traditional Chinese Medicine perspective. The aim is to identify disruptions that may not always be visible through conventional diagnostics, but that may help explain persistent complaints or symptoms.<br>Safety always comes first. When there are indications of a condition requiring further medical diagnosis or treatment, we refer you back to your GP or medical specialist. Our broader functional approach can be particularly relevant for patients who continue to experience complaints despite normal test results or who feel that the underlying cause of their symptoms has not been fully understood.",
    intake: "Upon arrival, you will complete an intake form with your personal and insurance details. You will then be called in for your consultation with one of our TCM practitioners, who will discuss your concerns and carry out an assessment from a Traditional Chinese Medicine perspective.",
    aftercare: "",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "acupuncture": {
    summary: "A traditional Chinese medicine technique using fine needles placed at specific points on the body to relieve tension and restore balance.",
    body: "Acupuncture is a well-established technique within Traditional Chinese Medicine, in which a trained practitioner places fine needles (size depending on the condition) at specific points on the body. Clinical evidence supports its use for a number of complaints, including certain types of pain and migraine. For other complaints, it is used within MC Balans' broader clinical model as a tool for addressing structural, functional and regulatory imbalance. At MC Balans, acupuncture is not a default response to a complaint — it's recommended once your assessment points to it being an appropriate part of your plan, often combined with other techniques to meet your specific needs.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan, which will include an estimate of the number of needed sessions and an expected, realistic outcome, allowing patients to make their own informed decisions regarding their health.",
    aftercare: "Each session is evaluated with the patient to track feeling, progress, and desire to continue the treatment. For certain conditions, follow-up examination sessions are recommended.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "acupotomy": {
    summary: "A specialized technique that combines acupuncture with a fine surgical needle to relieve chronic pain and release tension in muscles, tendons, and joints.",
    body: "Acupotomy, also known as needle knife acupuncture, is a specialized technique that combines the principles of acupuncture with a fine surgical needle. Rather than a standard acupuncture needle, a slightly thicker needle with a small flattened tip is used to target areas of chronic tension, scar tissue, or adhesions beneath the skin. At MC Balans, this treatment is used to help relieve persistent pain and stiffness, particularly in cases where standard acupuncture has had limited effect. The doctor determines the size and placement of treatment based on the specific area and severity of the complaint.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "At each session, the doctor will provide the patient with detailed information regarding size of the needles, their placement, and the reasoning behind their usage and the duration of the session.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "cupping": {
    summary: "A suction-based therapy using cups placed on the skin to improve circulation and release muscular tension.",
    body: "Cupping is a treatment method in which special cups are placed on the skin to create gentle suction. This stimulates circulation and helps release muscle tension. Within Traditional Chinese Medicine, cupping is also understood to support the body's broader recovery processes. At MC Balans, cupping is used as both a standalone treatment and in combination with other therapies where appropriate. Depending on your condition and treatment goals, our doctors determine whether cupping is the most suitable approach or whether it should be integrated into a broader treatment plan.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "During treatment, the doctor carefully places the cups on the affected areas to create controlled suction. The number of cups, their placement, and the treatment duration are adapted to the patient's individual condition and comfort.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "chinese-herbal-medicine": {
    summary: "An individually tailored herbal prescription, prepared to match each patient's specific symptoms and treatment goals.",
    body: "Chinese Herbal Medicine is one of the oldest treatment methods within Traditional Chinese Medicine. Rather than relying on a standard prescription, herbal formulas are tailored to the individual patient, taking into account both the symptoms and the underlying pattern identified during the consultation. At MC Balans, every herbal prescription is prepared specifically for the patient. Chinese Herbal Medicine is often used alongside other treatments such as acupuncture and cupping to support recovery and, within the Traditional Chinese Medicine framework, to help restore the body's balance. As treatment progresses, prescriptions can be adjusted to reflect changes in the patient's condition.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "Patients receive a personalised herbal formula together with clear instructions on its preparation and use. During follow-up appointments, the doctor evaluates progress and adjusts the prescription where necessary to reflect changes in the patient's condition.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "nutrition-movement": {
    summary: "Personalised nutrition and lifestyle guidance that supports recovery and helps prevent recurring complaints.",
    body: "Nutrition and movement form the foundation of a healthy lifestyle and play an important role in both recovery and prevention. While other treatments focus on addressing existing complaints, healthy eating habits and regular physical activity help support the body's natural ability to maintain balance over the long term. At MC Balans, nutritional and lifestyle advice is integrated into treatment wherever appropriate. Recommendations are tailored to each patient's individual situation and complement other treatment methods, helping to support recovery while reducing the likelihood of recurring complaints.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "Patients receive practical advice tailored to their individual circumstances. Depending on the condition being treated, this may include recommendations regarding nutrition, movement, or other lifestyle adjustments that support the body's recovery alongside any medical or Traditional Chinese Medicine treatments.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "prp-therapy": {
    summary: "A Platelet Rich Plasma (PRP) treatment used to support hair transplant aftercare and help with hair loss, drawing on the clinic's experience with hair transplantation and beauty treatments.",
    body: "The doctors at MC Balans are trained in both Western and Eastern medicine, and their years of experience have made them competent in a wide range of treatments. This includes supporting hair transplantation and beauty clinics with aftercare, as well as offering PRP (Platelet Rich Plasma) treatments following hair transplantation. Many people who are not eligible for a hair transplant can also be well helped with PRP treatment, and our healthcare providers are specifically trained for this",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "A small amount of blood is drawn and processed to separate the platelet-rich plasma. The PRP is then prepared and administered to the treatment area using a series of injections. The practitioner will guide you through the procedure and provide any relevant aftercare instructions.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "moxa-therapy": {
    summary: "A supplementary technique within Traditional Chinese Medicine that uses the heat of a burning moxa stick (made from mugwort herb) to stimulate acupuncture points.",
    body: "Moxa therapy is a treatment method widely used within Traditional Chinese Medicine, typically used alongside acupuncture. It involves heating acupuncture points using a moxa stick — a cigar-shaped stick made from mugwort herb. During treatment, the stick is either held above the skin or used to warm the acupuncture needles themselves. The heat is thought to stimulate the flow of energy through the body.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "The practitioner heats the relevant acupuncture points using a moxa stick, either holding it above the skin or using it to warm the needles already in place, depending on the treatment plan.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  },
  "ear-acupuncture": {
    summary: "A specialization within acupuncture using very fine needles (or adhesive patches) placed on specific points of the outer ear.",
    body: "Ear acupuncture is a specialization within acupuncture. A professional acupuncturist places very thin needles in the skin of the ear, stimulating the acupuncture points located there. Instead of needles, an ear seed can also be used for this purpose.",
    intake: "After the intake examination, patient and doctor will together build a personal treatment plan.",
    aftercare: "During treatment, the acupuncturist identifies the relevant points on the outer ear and applies either thin needles or an ear seed, depending on the patient's situation and preference.",
    insurance: "You can claim the invoice with your health insurance if you are additionally insured for alternative care."
  }
};

async function upsertTranslation(treatmentId, fieldName, value, locale = 'en') {
  if (!value) return;
  // Delete existing translation for this field/locale
  await pool.query(
    'DELETE FROM translations WHERE treatment_id = $1 AND field_name = $2 AND locale = $3',
    [treatmentId, fieldName, locale]
  );
  // Insert new translation
  await pool.query(
    'INSERT INTO translations (treatment_id, field_name, locale, value) VALUES ($1, $2, $3, $4)',
    [treatmentId, fieldName, locale, value]
  );
}

async function main() {
  for (const [slug, content] of Object.entries(treatments)) {
    // Find treatment by slug
    const res = await pool.query('SELECT id FROM treatments WHERE slug = $1', [slug]);
    if (res.rows.length === 0) {
      console.log(`⚠️  Treatment not found: ${slug}`);
      continue;
    }
    const treatmentId = res.rows[0].id;
    console.log(`Updating ${slug}...`);
    await upsertTranslation(treatmentId, 'summary', content.summary);
    await upsertTranslation(treatmentId, 'body', content.body);
    await upsertTranslation(treatmentId, 'intake', content.intake);
    await upsertTranslation(treatmentId, 'aftercare', content.aftercare);
    await upsertTranslation(treatmentId, 'insurance', content.insurance);
    console.log(`✅ ${slug} updated`);
  }
  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
