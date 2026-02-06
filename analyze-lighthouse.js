const report = require('./lighthouse-mobile-report.json');

console.log('\n=== MAJOR PERFORMANCE ISSUES ===\n');

const opportunities = Object.values(report.audits)
  .filter(a => a.details && a.details.type === 'opportunity' && a.score !== null && a.score < 1)
  .sort((a,b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0));

opportunities.slice(0, 7).forEach((opp, i) => {
  console.log(`${i+1}. ${opp.title}`);
  console.log(`   Score: ${Math.round((opp.score || 0) * 100)}/100`);
  console.log(`   Potential Savings: ${opp.details.overallSavingsMs}ms`);
  if (opp.details.items && opp.details.items.length > 0) {
    opp.details.items.slice(0, 2).forEach(item => {
      const url = item.url || item.node?.snippet || JSON.stringify(item).substring(0, 80);
      console.log(`   - ${url.substring(url.lastIndexOf('/') + 1, 80)}`);
    });
  }
  console.log('');
});

console.log('\n=== DIAGNOSTICS ===\n');
const diagnostics = Object.values(report.audits)
  .filter(a => a.score !== null && a.score < 1 && a.id !== 'screenshot-thumbnails' && a.id !== 'final-screenshot')
  .filter(a => !a.details || a.details.type !== 'opportunity')
  .slice(0, 5);

diagnostics.forEach((diag, i) => {
  console.log(`${i+1}. ${diag.title}`);
  console.log(`   Score: ${Math.round((diag.score || 0) * 100)}/100`);
  if (diag.displayValue) console.log(`   Value: ${diag.displayValue}`);
  console.log('');
});
