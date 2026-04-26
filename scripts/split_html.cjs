const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const regex = /<!-- ══════════════════════════════════════[\s\S]*?══════════════════════════════════════ -->\s*<div class="screen" id="screen-([a-z0-9-]+)">([\s\S]*?)(?=<!-- ══════════════════════════════════════|<\/body>)/gi;

if (!fs.existsSync('src/pages')) {
  fs.mkdirSync('src/pages', { recursive: true });
}

let template = html;
let match;

// Need to reset regex index to loop correctly
while ((match = regex.exec(html)) !== null) {
  const pageName = match[1];
  const pageContent = '<div class="screen" id="screen-' + pageName + '">' + match[2] + '\n';
  fs.writeFileSync('src/pages/' + pageName + '.html', pageContent);
  template = template.replace(match[0], '<!-- INJECT_PAGE:' + pageName + ' -->\n');
}

// Strip unnecessary large decorative comments from the template
template = template.replace(/<!-- ══════════════════════════════════════[\s\S]*?══════════════════════════════════════ -->\s*/g, '');

fs.writeFileSync('index.template.html', template);
console.log('Split completed!');
