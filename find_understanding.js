const https = require('https');
const fs = require('fs');

// Mechanism and persistence queries — why NSLBP sticks around.
// Broader publication-type filter than the treatment search (reviews, not just SRs).
const QUERIES = [
  { label: 'mechanisms',   term: 'non-specific low back pain AND (mechanism OR mechanisms OR pathophysiology) AND review[pt]', max: 5 },
  { label: 'central-sens', term: 'central sensitization AND low back pain AND review[pt]', max: 5 },
  { label: 'nociplastic',  term: 'nociplastic pain AND low back pain', max: 5 },
  { label: 'persistence',  term: 'persistent low back pain AND (prognosis OR chronicity OR transition) AND review[pt]', max: 5 },
  { label: 'biopsychosocial', term: 'biopsychosocial AND low back pain AND review[pt]', max: 5 }
];

const MIN_YEAR = 2015;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MCBalans-Evidence-Research/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e){ reject(e); } });
    }).on('error', reject);
  });
}

async function search(term, max) {
  const full = term + ` AND ${MIN_YEAR}:3000[dp]`;
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${max}&term=${encodeURIComponent(full)}`;
  const r = await fetchJson(url);
  return r.esearchresult.idlist || [];
}

async function summaries(ids) {
  if (!ids.length) return [];
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`;
  const r = await fetchJson(url);
  return ids.map(id => {
    const item = r.result[id];
    if (!item) return null;
    return {
      pmid: id,
      title: item.title,
      journal: item.fulljournalname || item.source,
      year: (item.pubdate || '').slice(0, 4),
      authors: (item.authors || []).slice(0, 3).map(a => a.name).join(', '),
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
    };
  }).filter(Boolean);
}

async function abstracts(ids) {
  if (!ids.length) return {};
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(',')}`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MCBalans-Evidence-Research/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const out = {};
        const arts = data.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
        for (const a of arts) {
          const pmidM = a.match(/<PMID[^>]*>(\d+)<\/PMID>/);
          const absM = a.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
          if (pmidM && absM) {
            out[pmidM[1]] = absM.map(m => m.replace(/<[^>]*>/g,'').trim()).join('\n');
          }
        }
        resolve(out);
      });
    }).on('error', reject);
  });
}

async function main() {
  const output = [];
  for (const q of QUERIES) {
    console.log(`\nSearching: ${q.label}`);
    try {
      const ids = await search(q.term, q.max);
      if (!ids.length) { console.log('  none'); continue; }
      const sums = await summaries(ids);
      const abs = await abstracts(ids);
      for (const s of sums) {
        s.query_label = q.label;
        s.abstract = abs[s.pmid] || '';
        output.push(s);
      }
      console.log(`  found ${sums.length}`);
      await new Promise(r => setTimeout(r, 400));
    } catch (e) { console.log('  error: ' + e.message); }
  }
  fs.writeFileSync('understanding_candidates.json', JSON.stringify(output, null, 2));
  console.log(`\nWritten ${output.length} candidates to understanding_candidates.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
