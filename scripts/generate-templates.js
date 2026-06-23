const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/Redhair777/GUI-guide';
const APPS_DIR = path.join(__dirname, '..', 'apps');
const COMPOSE_NAMES = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];

function titleize(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildTemplates() {
  const templates = [];
  const folders = fs.readdirSync(APPS_DIR).filter(f =>
    fs.statSync(path.join(APPS_DIR, f)).isDirectory()
  );

  for (const folder of folders) {
    const appDir = path.join(APPS_DIR, folder);
    const composeFile = COMPOSE_NAMES.find(n => fs.existsSync(path.join(appDir, n)));
    if (!composeFile) {
      console.warn(`Skipping ${folder}: no compose file found`);
      continue;
    }

    templates.push({
      type: 3,
      name: folder,
      title: titleize(folder),
      repository: {
        url: REPO_URL,
        stackfile: `apps/${folder}/${composeFile}`
      }
    });
  }

  return { version: '2', templates };
}

const result = buildTemplates();
fs.writeFileSync(
  path.join(__dirname, '..', 'templates.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(`Generated templates.json with ${result.templates.length} template(s).`);
