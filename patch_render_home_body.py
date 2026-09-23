with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

old_start = "function renderHomeBody(conditions, categories) {"
old_end = "\n  return b;\n}\n"

# Find the function block by locating start and the next "\n  return b;\n}\n" after it
start_idx = s.find(old_start)
if start_idx == -1:
    print('FATAL: function not found')
    exit(1)

end_idx = s.find(old_end, start_idx)
if end_idx == -1:
    print('FATAL: function end not found')
    exit(1)

end_idx += len(old_end)

new_fn = '''function renderHomeBody(conditions, categories) {
  let b = '';

  // Hero
  b += '<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">';
  b += '<h1>A comprehensive approach, from Dr. Lin.</h1>';
  b += '<p class="lede">A persistent complaint without a clear explanation can still have debilitating consequences. MC Balans\\' approach assesses how your body\\'s structure, function and regulation relate to your symptoms to address their root cause.</p>';
  b += '<a class="btn btn-primary" href="tel:+31703888111">Call to Book</a>';
  b += '</div><div class="hero-portrait"><div class="portrait-frame" style="aspect-ratio:4/5;background:linear-gradient(155deg,#DCE3D9,#C7D2C1);border-radius:2px;"></div></div></div></section>';

  // Four patient-path cards
  b += '<section class="section" style="padding-top:32px;padding-bottom:0;"><div class="wrap"><div class="path-grid">';
  b += '<a class="path-card" href="/conditions"><h4>I have a persistent physical complaint</h4><p>Treatment or investigations have not resolved it.</p><span class="arrow">\\u2192</span></a>';
  b += '<a class="path-card" href="/conditions"><h4>My tests came back normal</h4><p>But I still experience physical symptoms.</p><span class="arrow">\\u2192</span></a>';
  b += '<a class="path-card" href="/conditions"><h4>I know what my condition is</h4><p>And I\\'m looking for additional treatment options.</p><span class="arrow">\\u2192</span></a>';
  b += '<a class="path-card" href="/treatments"><h4>I\\'m looking for a specific treatment</h4><p>Such as acupuncture, acupotomy or Chinese herbal medicine.</p><span class="arrow">\\u2192</span></a>';
  b += '</div></div></section>';

  // Credibility section
  b += '<section class="cred-section"><div class="wrap"><h2>Dr. Wenzhi Lin</h2><div class="cred-grid">';
  const creds = [
    { num: '01', title: 'Credible', text: 'A practising, licensed medical doctor in the Netherlands.' },
    { num: '02', title: 'Experienced', text: '40+ years of sustained practice across Chinese and Western medicine.' },
    { num: '03', title: 'Respected', text: 'Monthly Medisch Dossier column, NPO documentary, Knight of Orange-Nassau (2012).' },
    { num: '04', title: 'Successful', text: 'Reviews supporting treatment effectiveness.' }
  ];
  creds.forEach(c => { b += `<div class="cred-card"><div class="num">${c.num}</div><h3>${c.title}</h3><p>${c.text}</p></div>`; });
  b += '</div></div></section>';

  // Insurance band
  b += '<div class="insurance-band"><div class="wrap insurance-inner"><p><strong>Insurance:</strong> Consultations and treatments may be reimbursed through your supplementary health insurance (aanvullende verzekering), depending on your individual policy. We can help you check your coverage.</p></div></div>';

  // What We Treat — chips only
  b += '<section class="section" style="background:var(--jade-tint);"><div class="wrap"><div class="section-head"><h2>What We Treat</h2><p>Select a category to see the conditions we treat within it.</p></div>';
  b += '<p style="margin-bottom:20px;"><a class="view-all-link" href="/conditions">View all conditions \\u2192</a></p>';
  b += '<div class="category-chip-row">';
  categories.forEach(cat => {
    const cc = conditions.filter(c => c.category_slug === cat.slug);
    if (!cc.length) return;
    b += `<a class="category-chip" href="/conditions"><span class="chip-name">${esc(cat.name || cat.slug)}</span><span class="chip-count">${cc.length}</span></a>`;
  });
  b += '</div></div></section>';

  return b;
}
'''

s = s[:start_idx] + new_fn + s[end_idx:]

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)

print('renderHomeBody replaced')
