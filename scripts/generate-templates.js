const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/Redhair777/GUI-guide';
const APPS_DIR = path.join(__dirname, '..', 'apps');
const COMPOSE_NAMES = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];

function titleize(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const key = l.slice(0, l.indexOf('=')).trim();
      return { name: key, label: titleize(key) };
    });
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

    const template = {
      type: 3,
      name: folder,
      title: titleize(folder),
      repository: {
        url: REPO_URL,
        stackfile: `apps/${folder}/${composeFile}`
      }
    };

    const env = parseEnvFile(path.join(appDir, '.env'));
    if (env.length) template.env = env;

    templates.push(template);
  }

  return { version: '2', templates };
}

const result = buildTemplates();
fs.writeFileSync(
  path.join(__dirname, '..', 'templates.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(`Generated templates.json with ${result.templates.length} template(s).`);
