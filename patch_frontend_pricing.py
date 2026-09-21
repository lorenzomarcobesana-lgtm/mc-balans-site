import re

with open('public/database-site.html', 'r', encoding='utf-8') as f:
    s = f.read()

log = []

# 1. Remove the intro from renderTreatments
old = "const intro=data.intro||'';"
if old in s:
    s = s.replace(old, "const intro='';", 1)
    log.append('treatments intro disabled')
else:
    print('WARN: intro variable not found')

# 2. Replace the About pricing panel
pattern = r"html\+='<div class=\"about-panel\" id=\"panel-pricing\">.*?</div>';"
new_panel = '''html+='<div class="about-panel" id="panel-pricing"><div class="section-head"><h2>Pricing</h2><p>At MC Balans you pay per consultation or per treatment. The number and type of treatments depend on your individual assessment and how you respond to treatment. Your practitioner will discuss this with you after your first consultation.</p></div>';
html+='<div class="pricing-summary">';
if(prices && prices.length){
  const labels={consultations:'Consultations',treatments:'Treatments',herbal:'Chinese herbal medicine',additional:'Additional treatments'};
  prices.forEach(p=>{
    const label=labels[p.pricing_group]||p.pricing_group;
    html+='<div class="pricing-row"><span class="pricing-label">'+esc(label)+'</span><span class="pricing-amount">from '+esc(p.currency||'\\u20ac')+esc(p.min_amount)+'</span></div>';
  });
} else {
  html+='<div class="placeholder-box">Pricing information pending</div>';
}
html+='</div>';
html+='<p style="margin-top:24px;color:var(--stone);font-size:14px;">Most treatments are covered under supplementary insurance (aanvullende verzekering). Whether and how much is reimbursed depends on your individual policy. We can help you check your coverage.</p>';
html+='</div>';'''

new_s, n = re.subn(pattern, lambda m: new_panel, s, count=1)

if n > 0:
    s = new_s
    log.append('pricing panel replaced')
else:
    print('WARN: pricing panel pattern not found')

# 3. CSS for pricing summary
old_css = ".pricing-table{width:100%;border-collapse:collapse}"
new_css = """.pricing-summary{background:var(--white);border:1px solid var(--line);border-radius:4px;margin-top:8px;}
.pricing-row{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--line);}
.pricing-row:last-child{border-bottom:none;}
.pricing-label{font-size:15px;color:var(--ink);}
.pricing-amount{font-family:var(--font-mono);font-size:15px;color:var(--jade);font-weight:500;}
.pricing-table{width:100%;border-collapse:collapse}"""

if old_css in s:
    s = s.replace(old_css, new_css, 1)
    log.append('CSS')
else:
    print('WARN: CSS anchor not found')

with open('public/database-site.html', 'w', encoding='utf-8') as f:
    f.write(s)

print('Applied:', ', '.join(log) if log else 'NONE')
