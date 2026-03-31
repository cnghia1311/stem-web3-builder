const fs = require('fs');
const file = 'src/data/blocks.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');
// Remove lines 1514-1575 (0-indexed: 1513-1574), keep 0-1512 and 1575+
const before = lines.slice(0, 1513);
const after = lines.slice(1575);
fs.writeFileSync(file, before.concat(after).join('\n'));
console.log('Done! Removed lines 1514-1575. Total lines now:', before.length + after.length);
