// Fails if the build contains private source files or pending-content markers.
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const DIST = 'dist';
const FORBIDDEN_EXT = new Set(['.tex', '.md']);
const FORBIDDEN_NAME = /(^|\/)perfil[^/]*$/;
const TEXT_EXT = new Set(['.html', '.xml', '.txt', '.json', '.js', '.css', '.svg']);
// Content placeholders are written in Spanish: PENDIENTE, CONFIRMAR, FALTA.
const MARKERS = /\b(PENDIENTE|CONFIRMAR|FALTA)\b/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const problems = [];
let count = 0;

try {
  for await (const path of walk(DIST)) {
    count++;
    const rel = relative(DIST, path);
    const ext = extname(path).toLowerCase();
    if (FORBIDDEN_EXT.has(ext) || FORBIDDEN_NAME.test(rel)) {
      problems.push(`${rel}: file not allowed in the build`);
      continue;
    }
    if (!TEXT_EXT.has(ext)) continue;
    const match = (await readFile(path, 'utf8')).match(MARKERS);
    if (match) problems.push(`${rel}: contains the marker "${match[1]}"`);
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`${DIST}/ does not exist. Run "npm run build" first.`);
    process.exit(1);
  }
  throw error;
}

if (problems.length > 0) {
  console.error('The build cannot be published:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`check-dist: ${count} files checked, no problems.`);
