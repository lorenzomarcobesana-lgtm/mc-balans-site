const https = require('https');
const fs = require('fs');

// What you're searching for. Edit this list.
const QUERIES = [
  { topic: 'acupuncture', condition: 'non-specific low back pain', maxResults: 10 },
  { topic: 'acupuncture', condition: 'migraine', maxResults: 10 },
  { topic: 'cupping', condition: 'pain', maxResults: 10 },
  { topic: 'acupotomy', condition: 'chronic pain', maxResults: 10 },
  { topic: 'chinese herbal medicine', condition: 'low back pain', maxResults: 10 },
  { topic: 'moxibustion', condition: 'low back pain', maxResults: 10 },
  { topic: 'ear acupuncture', condition: 'insomnia', maxResults: 10 },
  { topic: 'acupuncture', condition: 'anxiety', maxResults: 10 },
  { topic: 'acupuncture', condition: 'menopause', maxResults: 10 },
  { topic: 'acupuncture', condition: 'fertility', maxResults: 10 },
];

// Filters — this is your "credibility threshold"
const MIN_YEAR = 2017;
const STUDY_TYPES = ['systematic review', 'meta-analysis', 'guideline'];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MCBalans-Evidence-Research/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

async function searchPubMed(topic, condition, maxResults) {
  const term = `${topic} AND ${condition} AND (systematic review[pt] OR meta-analysis[pt] OR guideline[pt]) AND ${MIN_YEAR}:3000[dp]`;
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${maxResults}&term=${encodeURIComponent(term)}`;
  const result = await fetchJson(url);
  const ids = result.esearchresult.idlist || [];
  return ids;
}

async function fetchSummaries(ids) {
  if (!ids.length) return [];
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`;
  const result = await fetchJson(url);
  const out = [];
  for (const id of ids) {
    const item = result.result[id];
    if (!item) continue;
    out.push({
      pmid: id,
      title: item.title,
      journal: item.fulljournalname || item.source,
      year: (item.pubdate || '').slice(0, 4),
      authors: (item.authors || []).slice(0, 3).map(a => a.name).join(', '),
      doi: (item.articleids || []).find(x => x.idtype === 'doi')?.value || null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
    });
  }
  return out;
}

async function fetchAbstracts(ids) {
  if (!ids.length) return {};
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(',')}`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MCBalans-Evidence-Research/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const abstracts = {};
        const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g;
        const articles = data.match(articleRegex) || [];
        for (const art of articles) {
          const pmidMatch = art.match(/<PMID[^>]*>(\d+)<\/PMID>/);
          const abstractMatch = art.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
          if (pmidMatch && abstractMatch) {
            abstracts[pmidMatch[1]] = abstractMatch
              .map(m => m.replace(/<[^>]*>/g, '').trim())
              .join('\n');
          }
        }
        resolve(abstracts);
      });
    }).on('error', reject);
  });
}

async function main() {
  const output = [];
  for (const q of QUERIES) {
    console.log(`\nSearching: ${q.topic} / ${q.condition}`);
    try {
      const ids = await searchPubMed(q.topic, q.condition, q.maxResults);
      if (!ids.length) { console.log('  no results'); continue; }
      const summaries = await fetchSummaries(ids);
      const abstracts = await fetchAbstracts(ids);
      for (const s of summaries) {
        s.topic = q.topic;
        s.condition = q.condition;
        s.abstract = abstracts[s.pmid] || '';
        output.push(s);
      }
      console.log(`  found ${summaries.length}`);
      await new Promise(r => setTimeout(r, 400)); // rate-limit courtesy
    } catch (e) {
      console.log('  error: ' + e.message);
    }
  }
  fs.writeFileSync('evidence_candidates.json', JSON.stringify(output, null, 2));
  console.log(`\nWritten ${output.length} candidates to evidence_candidates.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
