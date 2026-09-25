with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()
log = []

# 1. Add the four routes after the existing /about route
old_about = """app.get('/about', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'About MC Balans — Dr. Wenzhi Lin & Team',
    description: 'Meet the team, see the clinic, check pricing, or read about our approach to Western and Traditional Chinese Medicine in The Hague.',
    canonical: SITE_URL + '/about'
  }), ''));
});"""

new_about = """app.get('/about', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'About MC Balans — Dr. Wenzhi Lin & Team',
    description: 'Meet the team, see the clinic, check pricing, or read about our approach to Western and Traditional Chinese Medicine in The Hague.',
    canonical: SITE_URL + '/about'
  }), ''));
});

app.get('/about/team', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'Our Team — MC Balans',
    description: 'Meet the MC Balans team, led by Dr. Wenzhi Lin, licensed medical doctor with over 40 years of dual training in Western and Chinese medicine.',
    canonical: SITE_URL + '/about/team'
  }), ''));
});

app.get('/about/clinic', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'Our Clinic — MC Balans, The Hague',
    description: 'The MC Balans clinic in The Hague: treatment rooms, consultation rooms and Chinese herbal dispensary.',
    canonical: SITE_URL + '/about/clinic'
  }), ''));
});

app.get('/about/philosophy', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'Our Philosophy — MC Balans',
    description: 'How MC Balans approaches medicine: conventional assessment first, then structural, functional and regulatory analysis, with Traditional Chinese Medicine where relevant.',
    canonical: SITE_URL + '/about/philosophy'
  }), ''));
});

app.get('/prices', (req, res) => {
  res.send(renderPage(buildSeoHead({
    title: 'Pricing — MC Balans',
    description: 'Consultation and treatment pricing at MC Balans, The Hague. Most treatments are reimbursed through supplementary insurance.',
    canonical: SITE_URL + '/prices'
  }), ''));
});"""

if old_about in s:
    s = s.replace(old_about, new_about, 1)
    log.append('routes')
else:
    print('WARN: /about route pattern not found')

# 2. Update sitemap static pages
old_sitemap = "const staticPages = ['', 'conditions', 'treatments', 'resources', 'about', 'contact'];"
new_sitemap = "const staticPages = ['', 'conditions', 'treatments', 'resources', 'about', 'about/team', 'about/clinic', 'about/philosophy', 'prices', 'contact'];"

if old_sitemap in s:
    s = s.replace(old_sitemap, new_sitemap, 1)
    log.append('sitemap')
else:
    print('WARN: sitemap staticPages pattern not found — check server.js manually')

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)
print('Server applied:', ', '.join(log))
