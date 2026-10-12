const fs = require('fs');

const lines = fs.readFileSync('real-pages-mapped.csv', 'utf8').split('\n').slice(1);
const map = {};

function normalise(p) {
  p = String(p).trim();
  if (!p) return '';
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p.toLowerCase();
}

for (const line of lines) {
  if (!line.trim()) continue;
  const m = line.match(/^"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
  if (!m) continue;
  const oldPath = normalise(m[2]);
  const newPath = normalise(m[3]);
  if (!oldPath || !newPath) continue;
  if (oldPath === newPath) continue;
  if (oldPath === '/') continue; // don't redirect homepage to itself
  map[oldPath] = newPath;
}

const entries = Object.entries(map).sort((a,b) => a[0].localeCompare(b[0]));
const lines2 = [];
lines2.push('// Auto-generated from real-pages-mapped.csv on ' + new Date().toISOString().slice(0, 10));
lines2.push('// Regenerate with: node generate-redirects.js');
lines2.push('// Do not edit by hand — edit the CSV, then rerun the generator.');
lines2.push('');
lines2.push('module.exports = {');
for (const [from, to] of entries) {
  lines2.push('  ' + JSON.stringify(from) + ': ' + JSON.stringify(to) + ',');
}
lines2.push('};');
lines2.push('');
fs.writeFileSync('redirects.js', lines2.join('\n'), 'utf8');

console.log('Wrote redirects.js with ' + entries.length + ' rules.');
console.log('Sample:');
for (const [from, to] of entries.slice(0, 5)) console.log('  ' + from + '  →  ' + to);
