const fs = require('fs');
const https = require('https');

function translate(text, callback) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=' + encodeURIComponent(text);
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        callback(null, json[0][0][0]);
      } catch (e) {
        callback(e);
      }
    });
  }).on('error', (e) => {
    callback(e);
  });
}

const extracted = JSON.parse(fs.readFileSync('extracted_texts.json', 'utf8'));
const translated = {};
const keys = Object.keys(extracted);
let index = 0;

function processNext() {
  if (index >= keys.length) {
    fs.writeFileSync('translated_texts.json', JSON.stringify(translated, null, 2));
    console.log('Translation completed!');
    return;
  }
  const k = keys[index];
  const text = extracted[k];
  // Skip short texts or emojis
  if (text.length <= 2 || text.match(/^[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]$/)) {
    translated[k] = text;
    index++;
    processNext();
    return;
  }
  
  translate(text, (err, t) => {
    if (err) {
      console.error('Error translating:', text);
      translated[k] = text; // fallback
    } else {
      translated[k] = t;
    }
    index++;
    setTimeout(processNext, 50); // Be gentle with the API
  });
}

processNext();
