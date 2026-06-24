const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/Redhair777/GUI-guide';
const APPS_DIR = path.join(__dirname, '..', 'apps');
const COMPOSE_NAMES = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];

function titleize(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function loadMeta(appDir, folder) {
  const metaPath = path.join(appDir, 'meta.json');
  const defaults = { title: titleize(folder), description: '', category: '', logo: '' };
  if (!fs.existsSync(metaPath)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) };
  } catch (e) {
    console.warn(`Could not parse meta.json for ${folder}, using defaults`);
    return defaults;
  }
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

    const meta = loadMeta(appDir, folder);

    const template = {
      type: 3,
      name: folder,
      title: meta.title,
      platform: 'linux',
      repository: {
        url: REPO_URL,
        stackfile: `apps/${folder}/${composeFile}`
      }
    };
    if (meta.description) template.description = meta.description;
    if (meta.category) template.categories = [meta.category];
    if (meta.logo) template.logo = meta.logo;

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
