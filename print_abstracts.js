const data = require('./understanding_candidates.json');
const picks = ['42695120','42700197','42564308','42513485','42398797'];
const seen = new Set();
picks.forEach(pmid => {
  const x = data.find(d => d.pmid === pmid);
  if (!x || seen.has(pmid)) return;
  seen.add(pmid);
  console.log('\n============================================================');
  console.log('PMID ' + x.pmid + '  (' + x.year + ')');
  console.log(x.title);
  console.log('Journal: ' + x.journal);
  console.log('URL: ' + x.url);
  console.log('------------------------------------------------------------');
  console.log(x.abstract.replace(/&#x202f;/g,' ').replace(/&#xa0;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));
});
