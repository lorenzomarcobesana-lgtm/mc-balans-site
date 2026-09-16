import re

with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

new_func = """async function renderResources(){
  app.innerHTML='<div class="loading">'+T('loading')+'</div>';
  try{
    const res=await fetch(API+'/resources?lang='+currentLang);
    if(!res.ok)throw new Error('Load failed');
    const resources=await res.json();
    let html='<div class="subhero wrap"><div class="breadcrumb"><a onclick="navigateTo(\\'/\\')">Home</a> / Resources</div><h1>Resources</h1><p class="lede">Dr. Lin\\'s monthly Medisch Dossier column, published natively.</p></div><section class="section"><div class="wrap">';
    if(resources.length===0){
      html+='<div class="placeholder-box">Content pending</div>';
    } else {
      resources.forEach(r=>{
        const url=r.external_url||r.canonical_url||'#';
        const meta=[r.publication_name,r.publication_date?String(r.publication_date).slice(0,10):null].filter(Boolean).join(' \\u00b7 ');
        html+='<div class="resource-card" style="margin-bottom:16px;"><div class="rc-text"><span class="resource-badge">'+esc((r.entry_type||'').replace(/_/g,' '))+'</span><h4>'+esc(r.title||r.id)+'</h4><p>'+esc(r.description||'')+'</p></div>'+(meta?'<div class="rc-meta">'+esc(meta)+'</div>':'')+'<a class="btn btn-outline" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Read \\u2192</a></div>';
      });
    }
    html+='</div></section>';
    app.innerHTML=tr(html);
  }catch(e){app.innerHTML='<div class="error">Resources error: '+e.message+'</div>';}
}
"""

pattern = r"function renderResources\(\)\{[^\n]*\n"
new_s, n = re.subn(pattern, new_func, s, count=1)

if n == 0:
    print('FATAL: could not find renderResources function')
    exit(1)

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(new_s)

print('renderResources replaced')
