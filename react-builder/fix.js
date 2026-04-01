const fs = require('fs');
let text = fs.readFileSync('c:/Users/ADMIN/Desktop/Stem/react-builder/src/data/blocks.js', 'utf8');
text = text.replace(/\\\\/g, '');
text = text.replace(/\\\\\$/g, '$');
fs.writeFileSync('c:/Users/ADMIN/Desktop/Stem/react-builder/src/data/blocks.js', text, 'utf8');
