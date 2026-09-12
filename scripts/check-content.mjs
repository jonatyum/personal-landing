// Parses every content file and checks it has a `main` entry.
// Astro's file loader only logs a parse error and leaves the collection empty, and a warm
// .astro cache hides it locally, so a broken YAML can reach CI unnoticed.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from 'js-yaml';

const DIR = 'src/content';
const problems = [];
let count = 0;

for (const name of await readdir(DIR)) {
  if (!name.endsWith('.yaml') && !name.endsWith('.yml')) continue;
  count++;
  const path = join(DIR, name);
  let data;
  try {
    data = load(await readFile(path, 'utf8'));
  } catch (error) {
    problems.push(`${path}: ${error.message.split('\n')[0]}`);
    continue;
  }
  if (!data || typeof data !== 'object' || !('main' in data)) {
    problems.push(`${path}: no "main" entry`);
  }
}

if (problems.length > 0) {
  console.error('Broken content files:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`check-content: ${count} files parsed, all with a "main" entry.`);
