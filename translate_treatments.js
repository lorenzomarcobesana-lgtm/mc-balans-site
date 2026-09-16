const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oku5FeSE9TPO@ep-small-term-b1ouga0z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const data = {
  'western-medicine-consultation': {
    nl: {
      body: `Tijdens een Westers geneeskundig consult bespreekt Dr. Lin uw symptomen, medische geschiedenis en huidige zorgen om een duidelijk beeld van uw gezondheidssituatie te krijgen. Waar passend kan het consult een fysieke beoordeling en aanbevelingen voor verder onderzoek, verwijzing of behandeling omvatten. Het consult kan ook helpen bepalen of westerse medische zorg, TCM, of een combinatie van benaderingen passend is voor uw individuele behoeften.`
    },
    zh: {
      body: `在您与林医生进行西医咨询时，医生会讨论您的症状、病史和当前困扰，以清晰了解您的健康状况。在适当情况下，咨询可能包括身体评估以及进一步检查、转诊或治疗的建议。咨询还可以帮助确定西医治疗、中医治疗或两者的结合是否适合您的个人需求。`
    }
  },
  'tcm-consultation': {
    nl: {
      body: `Tijdens een TCM-consult kijken we verder dan de vraag welke ziekte u mogelijk heeft en onderzoeken we wat de manier waarop uw lichaam functioneert mogelijk verstoort. Dit omvat een beoordeling van structurele en functionele patronen en, waar passend, de balans van het lichaam vanuit het perspectief van de Traditionele Chinese Geneeskunde. Het doel is om verstoringen te identificeren die niet altijd zichtbaar zijn via conventionele diagnostiek, maar die aanhoudende klachten of symptomen kunnen helpen verklaren.<br>Veiligheid staat altijd voorop. Wanneer er aanwijzingen zijn voor een aandoening die verdere medische diagnose of behandeling vereist, verwijzen we u terug naar uw huisarts of medisch specialist. Onze bredere functionele benadering kan bijzonder relevant zijn voor patiënten die klachten blijven ervaren ondanks normale testresultaten, of die het gevoel hebben dat de onderliggende oorzaak van hun symptomen niet volledig is begrepen.`
    },
    zh: {
      body: `在中医咨询中，我们不止步于判断您可能患有何种疾病，而是探讨是什么干扰了您身体的正常运作。这包括对结构和功能模式的评估，以及在适当情况下从中医角度对身体的平衡进行评估。目标是识别那些常规诊断可能无法发现的干扰，而它们可能有助于解释持续的症状或不适。<br>安全始终是首要的。当有迹象表明某种病症需要进一步的医学诊断或治疗时，我们会将您转回您的家庭医生或专科医生。我们的整体功能方法对于那些尽管检查结果正常但仍持续出现症状、或感觉症状的根本原因未被充分了解的患者尤其有帮助。`
    }
  },
  'online-tongue-diagnosis': {
    nl: {
      body: `<p><strong>Hoe werkt het?</strong></p>
<p>Bij veel klachten hoeft u met de hedendaagse technologie uw huis niet meer te verlaten. Op basis van een foto van de tong en het beantwoorden van een paar eenvoudige vragen kunt u uw persoonlijke kruidenmengsel thuisgestuurd krijgen.</p>
<p><strong>Stap 1</strong><br>U maakt drie foto's van uw tong. Maak de foto's zo dichtbij mogelijk, zodat de tong helder en scherp op de foto staat.</p>
<p><strong>Stap 2</strong><br>Upload de foto's in het formulier en vul de vragenlijst in. Druk vervolgens op 'aanvragen' en volg de betaalinstructies.</p>
<p><strong>Stap 3</strong><br>Binnen 2 werkdagen ontvangt u een e-mail met een voorstel voor een persoonlijke kruidenmix.</p>
<p><strong>Stap 4</strong><br>Klik op de link in de e-mail en volg de betaalinstructies om de theezakjes met kruiden te kopen en thuis te laten bezorgen.</p>
<p><a href="#">Aanvragen</a></p>`
    },
    zh: {
      body: `<p><strong>如何运作？</strong></p>
<p>对于许多症状，借助当今的技术，您不再需要离家。只需上传舌头的照片并回答几个简单的问题，您就可以让个人定制的草药配方寄送到家。</p>
<p><strong>第 1 步</strong><br>您拍三张舌头的照片。请尽可能靠近拍摄，使舌头在照片中清晰锐利。</p>
<p><strong>第 2 步</strong><br>在表格中上传照片并填写问卷。然后按"申请"并按照付款说明操作。</p>
<p><strong>第 3 步</strong><br>您将在两个工作日内收到一封电子邮件，其中包含个人草药配方的方案。</p>
<p><strong>第 4 步</strong><br>点击电子邮件中的链接，按照付款说明购买草药茶包，并寄送到您家中。</p>
<p><a href="#">申请</a></p>`
    }
  },
  'acupuncture': {
    nl: {
      body: `Acupunctuur is een gevestigde techniek binnen de Traditionele Chinese Geneeskunde, waarbij een getrainde behandelaar fijne naalden (formaat afhankelijk van de klacht) op specifieke punten van het lichaam plaatst. Klinisch bewijs ondersteunt het gebruik ervan voor een aantal klachten, waaronder bepaalde soorten pijn en migraine. Voor andere klachten wordt het binnen het bredere klinische model van MC Balans gebruikt als hulpmiddel om structurele, functionele en regulerende onbalans aan te pakken. Bij MC Balans is acupunctuur geen standaardreactie op een klacht — het wordt aanbevolen zodra uw beoordeling aangeeft dat het een passend onderdeel van uw plan is, vaak gecombineerd met andere technieken om aan uw specifieke behoeften te voldoen.`,
      aftercare: `Elke sessie wordt met de patiënt geëvalueerd om het gevoel, de voortgang en de wens om de behandeling voort te zetten te volgen. Voor bepaalde aandoeningen worden follow-up onderzoekssessies aanbevolen.`
    },
    zh: {
      body: `针灸是中医中一项成熟的技法，受过训练的治疗师将细针（尺寸取决于病症）放置在身体的特定穴位。临床证据支持其用于多种病症，包括某些类型的疼痛和偏头痛。对于其他病症，它作为 MC Balans 更广泛临床模型中的工具，用于处理结构、功能和调节方面的失衡。在 MC Balans，针灸不是对病症的默认反应——只有当您的评估表明它是您治疗计划中适当的一部分时才会推荐，通常与其他技术结合使用以满足您的具体需求。`,
      aftercare: `每次疗程都会与患者进行评估，以跟踪感受、进展以及继续治疗的意愿。对于某些病症，建议进行随访检查。`
    }
  },
  'acupotomy': {
    nl: {
      body: `Acupotomie, ook wel naaldmes-acupunctuur genoemd, is een gespecialiseerde techniek die de principes van acupunctuur combineert met een fijne chirurgische naald. In plaats van een standaard acupunctuurnaald wordt een iets dikkere naald met een kleine afgeplatte punt gebruikt om gebieden met chronische spanning, littekenweefsel of verklevingen onder de huid te behandelen. Bij MC Balans wordt deze behandeling gebruikt om aanhoudende pijn en stijfheid te verlichten, met name in gevallen waarin standaard acupunctuur beperkt effect heeft gehad. De arts bepaalt het formaat en de plaatsing van de behandeling op basis van het specifieke gebied en de ernst van de klacht.`,
      aftercare: `Bij elke sessie geeft de arts de patiënt gedetailleerde informatie over het formaat van de naalden, hun plaatsing, de reden achter het gebruik en de duur van de sessie.`
    },
    zh: {
      body: `针刀，也称为针刀针灸，是一种将针灸原理与细小的外科针相结合的专业技术。它不是标准的针灸针，而是使用略微较粗、末端略微扁平的针，针对皮肤下的慢性紧张、疤痕组织或粘连区域。在 MC Balans，此疗法用于缓解持续性的疼痛和僵硬，特别是标准针灸效果有限的情况。医生根据具体部位和病症的严重程度来决定治疗的规格和位置。`,
      aftercare: `每次疗程中，医生会向患者详细说明针的规格、位置、使用原因以及疗程时长。`
    }
  },
  'cupping': {
    nl: {
      body: `Cupping is een behandelmethode waarbij speciale kopjes op de huid worden geplaatst om een zachte zuigkracht te creëren. Dit stimuleert de bloedsomloop en helpt spierspanning los te laten. Binnen de Traditionele Chinese Geneeskunde wordt cupping ook gezien als ondersteunend voor de bredere herstelprocessen van het lichaam. Bij MC Balans wordt cupping zowel als zelfstandige behandeling als in combinatie met andere therapieën gebruikt waar passend. Afhankelijk van uw aandoening en behandeldoelen bepalen onze artsen of cupping de meest geschikte aanpak is of dat het in een breder behandelplan moet worden geïntegreerd.`,
      aftercare: `Tijdens de behandeling plaatst de arts de kopjes zorgvuldig op de aangedane gebieden om gecontroleerde zuigkracht te creëren. Het aantal kopjes, hun plaatsing en de behandelduur worden aangepast aan de individuele conditie en het comfort van de patiënt.`
    },
    zh: {
      body: `拔罐是一种治疗方法，将特制的罐置于皮肤上产生温和的吸力。这可以刺激循环并帮助释放肌肉紧张。在中医中，拔罐也被认为有助于身体更广泛的恢复过程。在 MC Balans，拔罐既可单独使用，也可在适当情况下与其他疗法结合使用。根据您的病症和治疗目标，我们的医生会判断拔罐是否是最合适的方法，或者是否应将其纳入更广泛的治疗计划。`,
      aftercare: `治疗过程中，医生会小心地将罐放在患处，以产生可控的吸力。罐的数量、位置和治疗时间会根据患者的具体情况和舒适度进行调整。`
    }
  },
  'chinese-herbal-medicine': {
    nl: {
      body: `Chinese kruidengeneeskunde is een van de oudste behandelmethode binnen de Traditionele Chinese Geneeskunde. In plaats van te vertrouwen op een standaardrecept, worden kruidenformules afgestemd op de individuele patiënt, rekening houdend met zowel de symptomen als het onderliggende patroon dat tijdens het consult is vastgesteld. Bij MC Balans wordt elk kruidenrecept specifiek voor de patiënt bereid. Chinese kruidengeneeskunde wordt vaak gebruikt naast andere behandelingen zoals acupunctuur en cupping om herstel te ondersteunen en, binnen het TCM-kader, om het evenwicht van het lichaam te helpen herstellen. Naarmate de behandeling vordert, kunnen recepten worden aangepast aan veranderingen in de toestand van de patiënt.`,
      aftercare: `Patiënten ontvangen een persoonlijke kruidenformule met duidelijke instructies over de bereiding en het gebruik. Tijdens vervolgconsulten evalueert de arts de voortgang en past het recept indien nodig aan op basis van veranderingen in de toestand van de patiënt.`
    },
    zh: {
      body: `中药是中医中最古老的治疗方法之一。我们不依赖固定处方，而是根据患者个人情况量身定制草药配方，兼顾症状以及问诊中识别出的潜在模式。在 MC Balans，每份草药处方都专门为患者配制。中药常与针灸、拔罐等其他疗法配合使用，以支持恢复，并在中医框架内帮助恢复身体的平衡。随着治疗的进展，处方可根据患者情况的变化进行调整。`,
      aftercare: `患者将收到一份个性化的草药配方，以及有关其配制和使用的明确说明。在后续就诊中，医生会评估进展，并在必要时根据患者情况的变化调整处方。`
    }
  },
  'nutrition-movement': {
    nl: {
      body: `Voeding en beweging vormen de basis van een gezonde levensstijl en spelen een belangrijke rol bij zowel herstel als preventie. Terwijl andere behandelingen zich richten op het aanpakken van bestaande klachten, ondersteunen gezonde eetgewoonten en regelmatige lichaamsbeweging het natuurlijke vermogen van het lichaam om op de lange termijn balans te bewaren. Bij MC Balans wordt voedings- en leefstijladvies waar passend geïntegreerd in de behandeling. Aanbevelingen zijn afgestemd op de individuele situatie van elke patiënt en vullen andere behandelmethoden aan, om herstel te ondersteunen en de kans op terugkerende klachten te verkleinen.`,
      aftercare: `Patiënten ontvangen praktisch advies dat is afgestemd op hun individuele omstandigheden. Afhankelijk van de behandelde aandoening kan dit aanbevelingen omvatten met betrekking tot voeding, beweging of andere leefstijlaanpassingen die het herstel van het lichaam ondersteunen naast medische of TCM-behandelingen.`
    },
    zh: {
      body: `营养和运动是健康生活方式的基础，在恢复和预防中都发挥着重要作用。其他疗法侧重于处理已有的症状，而健康的饮食习惯和规律的体育锻炼则有助于支持身体长期保持平衡的自然能力。在 MC Balans，营养和生活方式建议在适当情况下纳入治疗。建议根据每位患者的具体情况进行调整，并与其他治疗方法相辅相成，帮助支持恢复，同时降低复发性症状的可能性。`,
      aftercare: `患者将获得根据其个人情况量身定制的实用建议。根据所治疗的病症，这可能包括有关营养、运动或其他有助于身体恢复的生活方式调整建议，并与医学或中医治疗相结合。`
    }
  },
  'prp-therapy': {
    nl: {
      body: `De artsen bij MC Balans zijn opgeleid in zowel westerse als oosterse geneeskunde, en hun jarenlange ervaring heeft hen bekwaam gemaakt in een breed scala aan behandelingen. Dit omvat het ondersteunen van haartransplantatie- en schoonheidsklinieken bij de nazorg, evenals het aanbieden van PRP (Platelet Rich Plasma) behandelingen na haartransplantatie. Veel mensen die niet in aanmerking komen voor een haartransplantatie kunnen ook goed worden geholpen met een PRP-behandeling, en onze zorgverleners zijn hier specifiek voor opgeleid.`,
      aftercare: `Een kleine hoeveelheid bloed wordt afgenomen en verwerkt om de platelet-rich plasma te scheiden. De PRP wordt vervolgens bereid en via een reeks injecties in het behandelgebied toegediend. De behandelaar begeleidt u door de procedure en geeft relevante nazorginstructies.`
    },
    zh: {
      body: `MC Balans 的医生接受过中西医双重训练，多年的经验使他们在广泛的治疗领域具备专业能力。这包括支持植发诊所和美容诊所的术后护理，以及提供植发后的 PRP（富血小板血浆）治疗。许多不适合植发的人也可以通过 PRP 治疗得到良好帮助，我们的医疗人员为此接受了专门培训。`,
      aftercare: `抽取少量血液并处理以分离富血小板血浆。然后将 PRP 准备好，通过一系列注射施用于治疗区域。治疗师将引导您完成整个过程并提供相关的术后护理说明。`
    }
  },
  'moxa-therapy': {
    nl: {
      body: `Moxa-therapie is een behandelmethode die veel wordt gebruikt binnen de Traditionele Chinese Geneeskunde, meestal naast acupunctuur. Het omvat het verwarmen van acupunctuurpunten met behulp van een moxa-stick — een sigaarvormige stok gemaakt van bijvoetkruid. Tijdens de behandeling wordt de stok ofwel boven de huid gehouden of gebruikt om de acupunctuurnaalden zelf te verwarmen. De warmte wordt geacht de energiestroom door het lichaam te stimuleren.`,
      aftercare: `De behandelaar verwarmt de relevante acupunctuurpunten met een moxa-stick, door deze boven de huid te houden of te gebruiken om de naalden die al op hun plaats zitten te verwarmen, afhankelijk van het behandelplan.`
    },
    zh: {
      body: `艾灸是中医中广泛使用的一种治疗方法，通常与针灸配合使用。它使用艾条——一种由艾草制成的雪茄状条状物——加热穴位。治疗过程中，艾条要么悬于皮肤上方，要么用来加热已经插入的针灸针。热量被认为可以促进体内能量的流动。`,
      aftercare: `治疗师使用艾条加热相关穴位，可以悬于皮肤上方，也可以用来加热已放置的针，具体取决于治疗计划。`
    }
  },
  'ear-acupuncture': {
    nl: {
      body: `Ooracupunctuur is een specialisatie binnen de acupunctuur. Een professionele acupuncturist plaatst zeer dunne naalden in de huid van het oor, waarmee de daar gelegen acupunctuurpunten worden gestimuleerd. In plaats van naalden kan hiervoor ook een oorkorrel worden gebruikt.`,
      aftercare: `Tijdens de behandeling identificeert de acupuncturist de relevante punten op het uitwendige oor en plaatst daar dunne naalden of een oorkorrel, afhankelijk van de situatie en voorkeur van de patiënt.`
    },
    zh: {
      body: `耳针是针灸中的一个专门领域。专业的针灸师将非常细的针放置于耳部皮肤，刺激位于那里的穴位。除了针之外，也可以使用耳豆。`,
      aftercare: `治疗过程中，针灸师识别外耳上的相关穴位，并根据患者的情况和偏好放置细针或耳豆。`
    }
  }
};

async function upsert(treatmentId, fieldName, locale, value) {
  const ex = await pool.query(
    `SELECT id FROM translations WHERE treatment_id = $1 AND field_name = $2 AND locale = $3`,
    [treatmentId, fieldName, locale]
  );
  if (ex.rowCount > 0) {
    await pool.query(`UPDATE translations SET value = $1, updated_at = NOW() WHERE id = $2`, [value, ex.rows[0].id]);
    return 'updated';
  }
  await pool.query(
    `INSERT INTO translations (treatment_id, field_name, locale, value) VALUES ($1, $2, $3, $4)`,
    [treatmentId, fieldName, locale, value]
  );
  return 'inserted';
}

async function main() {
  let count = 0;
  for (const [slug, locales] of Object.entries(data)) {
    const r = await pool.query(`SELECT id FROM treatments WHERE slug = $1`, [slug]);
    if (r.rowCount === 0) { console.log('MISSING treatment: ' + slug); continue; }
    const id = r.rows[0].id;
    for (const locale of ['nl', 'zh']) {
      if (!locales[locale]) continue;
      for (const field of Object.keys(locales[locale])) {
        await upsert(id, field, locale, locales[locale][field]);
        count++;
      }
    }
    console.log('  ✅ ' + slug);
  }
  console.log(`\nDone — ${count} rows for treatment bodies and aftercare.`);
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
