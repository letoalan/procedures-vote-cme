import fs from 'node:fs';
import path from 'node:path';

const MAX_LINES = 200;
const DIRS_TO_CHECK = ['src', 'tests', 'docs/wiki'];
const EXTENSIONS = new Set(['.ts', '.js', '.css', '.html', '.md']);

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function getFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const allFiles = DIRS_TO_CHECK.flatMap(getFiles);
const violations = [];

for (const file of allFiles) {
  const lines = countLines(file);
  if (lines > MAX_LINES) {
    violations.push({ file, lines });
  }
}

if (violations.length > 0) {
  console.error(`\x1b[31m[ÉCHEC]\x1b[0m ${violations.length} fichier(s) dépassent la limite stricte de ${MAX_LINES} lignes :`);
  for (const v of violations) {
    console.error(`  - ${v.file}: ${v.lines} lignes (> ${MAX_LINES})`);
  }
  process.exit(1);
} else {
  console.log(`\x1b[32m[SUCCÈS]\x1b[0m Tous les fichiers (${allFiles.length}) respectent la limite de ${MAX_LINES} lignes.`);
  process.exit(0);
}
