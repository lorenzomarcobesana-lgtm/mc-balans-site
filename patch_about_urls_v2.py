with open('public/database-site.html', 'rb') as f:
    s = f.read()

def rep(old, new, label):
    global s
    old_b = old.encode('utf-8')
    new_b = new.encode('utf-8')
    if old_b in s:
        s = s.replace(old_b, new_b, 1)
        print('OK  ', label)
    else:
        print('FAIL', label)

# 1. Router
rep(
    "else if(p==='/about')renderAbout();",
    """else if(p==='/about')renderAbout('ourteam');
else if(p==='/about/team')renderAbout('ourteam');
else if(p==='/about/clinic')renderAbout('ourclinic');
else if(p==='/about/philosophy')renderAbout('philosophy');
else if(p==='/prices')renderAbout('pricing');""",
    'router'
)

# 2. Function signature
rep(
    "async function renderAbout(){",
    "async function renderAbout(initialTab){",
    'signature'
)

# 3. Static tabs + h1 -> dynamic
old_tabs = """let html='<div class="subhero wrap"><div class="breadcrumb"><a onclick="navigateTo(\\'/\\')">Home</a> / About</div><h1>About MC Balans</h1><p class="lede">Meet the team, see the clinic, check pricing, or read about our approach.</p><div class="about-tabs"><div class="about-tab active" onclick="aboutTab(\\'ourteam\\')">Our Team</div><div class="about-tab" onclick="aboutTab(\\'ourclinic\\')">Our Clinic</div><div class="about-tab" onclick="aboutTab(\\'pricing\\')">Pricing</div><div class="about-tab" onclick="aboutTab(\\'philosophy\\')">Philosophy</div></div></div><section class="section"><div class="wrap">';"""

new_tabs = """const activeTab=initialTab||'ourteam';
const tabMeta={ourteam:{h1:'About MC Balans',lede:'Meet the team, see the clinic, check pricing, or read about our approach.'},ourclinic:{h1:'Our Clinic',lede:'The space where we see patients, in The Hague.'},pricing:{h1:'Pricing',lede:'What consultations and treatments cost.'},philosophy:{h1:'Our Philosophy',lede:'How MC Balans approaches medicine, assessment and treatment.'}};
const tm=tabMeta[activeTab]||tabMeta.ourteam;
const tabList=[{k:'ourteam',l:'Our Team'},{k:'ourclinic',l:'Our Clinic'},{k:'pricing',l:'Pricing'},{k:'philosophy',l:'Philosophy'}];
let tabsHtml='';
tabList.forEach(x=>{tabsHtml+='<div class="about-tab'+(x.k===activeTab?' active':'')+'" data-tab="'+x.k+'" onclick="aboutTab(\\''+x.k+'\\')">'+x.l+'</div>';});
let html='<div class="subhero wrap"><div class="breadcrumb"><a onclick="navigateTo(\\'/\\')">Home</a> / <a onclick="navigateTo(\\'/about\\')">About</a></div><h1>'+tm.h1+'</h1><p class="lede">'+tm.lede+'</p><div class="about-tabs">'+tabsHtml+'</div></div><section class="section"><div class="wrap">';"""

rep(old_tabs, new_tabs, 'tabs')

# 4. Panels — conditional active class
rep(
    '<div class="about-panel active" id="panel-ourteam">',
    '<div class="about-panel\'+(activeTab===\'ourteam\'?\' active\':\'\')+\'" id="panel-ourteam">',
    'panel ourteam'
)

rep(
    '<div class="about-panel" id="panel-ourclinic">',
    '<div class="about-panel\'+(activeTab===\'ourclinic\'?\' active\':\'\')+\'" id="panel-ourclinic">',
    'panel ourclinic'
)

rep(
    '<div class="about-panel" id="panel-pricing">',
    '<div class="about-panel\'+(activeTab===\'pricing\'?\' active\':\'\')+\'" id="panel-pricing">',
    'panel pricing'
)

rep(
    '<div class="about-panel" id="panel-philosophy">',
    '<div class="about-panel\'+(activeTab===\'philosophy\'?\' active\':\'\')+\'" id="panel-philosophy">',
    'panel philosophy'
)

# 5. aboutTab function — update URL on click
old_tab_fn = "function aboutTab(tab){document.querySelectorAll('.about-tab').forEach(t=>t.classList.toggle('active',t.textContent.toLowerCase().replace(' ','')===tab));document.querySelectorAll('.about-panel').forEach(p=>p.classList.remove('active'));const panel=document.getElementById('panel-'+tab);if(panel)panel.classList.add('active');}"

new_tab_fn = """function aboutTab(tab){document.querySelectorAll('.about-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));document.querySelectorAll('.about-panel').forEach(p=>p.classList.remove('active'));const panel=document.getElementById('panel-'+tab);if(panel)panel.classList.add('active');const urlMap={ourteam:'/about/team',ourclinic:'/about/clinic',pricing:'/prices',philosophy:'/about/philosophy'};if(urlMap[tab]&&location.pathname!==urlMap[tab])history.pushState({},'',urlMap[tab]);}"""

rep(old_tab_fn, new_tab_fn, 'aboutTab')

with open('public/database-site.html', 'wb') as f:
    f.write(s)

print('---')
print('File written.')
