// Generates every document with tools/sample-data.json into the given output dir (Node).
const fs = require('fs');
const path = require('path');
const DocGen = require('../js/docgen.js');
const out = process.argv[2] || path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });
const data = JSON.parse(fs.readFileSync(path.join(__dirname, process.argv[3] || 'sample-data.json'), 'utf8'));
(async () => {
  for (const key of Object.keys(DocGen.DOCS)) {
    const buf = await DocGen.generate(key, data, path.join(__dirname, '..', 'templates') + path.sep);
    const file = path.join(out, key + '.docx');
    fs.writeFileSync(file, buf);
    console.log('wrote', file, buf.length, 'bytes');
  }
})().catch((e) => { console.error(e); process.exit(1); });
