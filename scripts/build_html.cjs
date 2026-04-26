const fs = require('fs');

let template = fs.readFileSync('index.template.html', 'utf8');

const regex = /<!-- INJECT_PAGE:([a-z0-9-]+) -->/g;
let match;
while ((match = regex.exec(template)) !== null) {
  const pageName = match[1];
  try {
    const pageContent = fs.readFileSync('src/pages/' + pageName + '.html', 'utf8');
    template = template.replace(match[0], pageContent);
  } catch (e) {
    console.warn(`Warning: Could not find page src/pages/${pageName}.html`);
  }
}

fs.writeFileSync('index.html', template);
console.log('Build completed! index.html updated.');
