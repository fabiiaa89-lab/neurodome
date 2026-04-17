const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Extract CSS
const styleRegex = /<style>([\s\S]*?)<\/style>/;
const styleMatch = html.match(styleRegex);
if (styleMatch) {
    fs.mkdirSync('css', { recursive: true });
    fs.writeFileSync('css/styles.css', styleMatch[1]);
    html = html.replace(styleRegex, '<link rel="stylesheet" href="css/styles.css">\n<link rel="stylesheet" href="css/features.css">');
}

// 2. Extract JS
const scriptRegex = /<script>\s*'use strict';([\s\S]*?)<\/script>/;
const scriptMatch = html.match(scriptRegex);
if (scriptMatch) {
    fs.mkdirSync('js', { recursive: true });
    fs.writeFileSync('js/app.js', "'use strict';\n" + scriptMatch[1]);
    html = html.replace(scriptRegex, '<script src="js/app.js"></script>\n<script src="js/features.js"></script>');
}

fs.writeFileSync('index.html', html);
console.log('Split successful');
