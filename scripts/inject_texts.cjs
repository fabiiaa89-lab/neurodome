const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir);

const extracted = JSON.parse(fs.readFileSync('extracted_texts.json', 'utf8'));
const translated = JSON.parse(fs.readFileSync('translated_texts.json', 'utf8'));

let idCounter = 1;
let dictEs = {};
let dictEn = {};

for (const file of files) {
  if (!file.endsWith('.html')) continue;
  let html = fs.readFileSync(path.join(dir, file), 'utf8');
  
  const regex = /<([a-z0-9-]+)([^>]*)>([^<]+)<\/\1>/gi;
  
  html = html.replace(regex, (match, tag, attrs, text) => {
    text = text.trim();
    if (text.length > 2 && !attrs.includes('data-i18n') && !text.includes('{') && !text.includes('var(')) {
      const key = 'auto_' + idCounter;
      idCounter++;
      
      dictEs[key] = extracted[key] || text;
      dictEn[key] = translated[key] || text;
      
      return `<${tag}${attrs} data-i18n="${key}">${text}</${tag}>`;
    }
    return match;
  });
  
  fs.writeFileSync(path.join(dir, file), html);
}

fs.writeFileSync('translations.js', `
const EXTRA_ES = ${JSON.stringify(dictEs, null, 2)};
const EXTRA_EN = ${JSON.stringify(dictEn, null, 2)};
`);

console.log('Injection completed!');
