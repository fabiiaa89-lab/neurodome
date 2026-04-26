const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir);

let idCounter = 1;
const extracted = {};

for (const file of files) {
  if (!file.endsWith('.html')) continue;
  let html = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Extract text from <label>, <button>, <div>, <span> that don't have data-i18n or children tags
  // This is a naive regex but good enough for a quick pass
  const regex = /<([a-z0-9-]+)([^>]*)>([^<]+)<\/\1>/gi;
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    const tag = match[1];
    const attrs = match[2];
    const text = match[3].trim();
    
    if (text.length > 2 && !attrs.includes('data-i18n') && !text.includes('{') && !text.includes('var(')) {
      // It's a text node
      const key = 'auto_' + idCounter++;
      extracted[key] = text;
      
      // We will replace it in the HTML later once we have the translations
    }
  }
}

fs.writeFileSync('extracted_texts.json', JSON.stringify(extracted, null, 2));
console.log('Extracted ' + Object.keys(extracted).length + ' texts.');
