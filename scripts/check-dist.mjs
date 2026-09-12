// Fails if the build contains private source files or pending-content markers.
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const DIST = 'dist';
const FORBIDDEN_EXT = new Set(['.tex', '.md']);
const FORBIDDEN_NAME = /(^|\/)perfil[^/]*$/;
const TEXT_EXT = new Set(['.html', '.xml', '.txt', '.json', '.js', '.css', '.svg']);
// Content placeholders are written in Spanish: PENDIENTE, CONFIRMAR, FALTA.
const MARKERS = /\b(PENDIENTE|CONFIRMAR|FALTA)\b/;
// With a base path (GitHub Pages project site), every root-relative URL must start with it.
const BASE = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const ROOT_URL = /\s(?:href|src)="(\/(?!\/)[^"]*)"/g;
// Once the site has its own domain, a *.github.io address in the output means the build ran
// with the old Pages origin: the canonical URLs, sitemap and alternates would all point away.
const GITHUB_PAGES_HOST = /\bhttps?:\/\/[^"'\s/]*\.github\.io\b/;
// Local or private-network hosts in the output mean a shell variable leaked into the build.
const PRIVATE_HOST =
  /\b(?:https?:)?\/\/(?:localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)(?::\d+)?/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const problems = [];
let count = 0;

// The custom domain, if this build publishes one.
const domain = await readFile(join(DIST, 'CNAME'), 'utf8')
  .then((text) => text.trim())
  .catch(() => '');

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
    const text = await readFile(path, 'utf8');
    const match = text.match(MARKERS);
    if (match) problems.push(`${rel}: contains the marker "${match[1]}"`);
    const host = text.match(PRIVATE_HOST);
    if (host) problems.push(`${rel}: points to a local or private host (a shell variable leaked into the build?)`);
    if (domain) {
      const stale = text.match(GITHUB_PAGES_HOST);
      if (stale) problems.push(`${rel}: "${stale[0]}" is the old Pages origin, but CNAME says ${domain}`);
    }
    if (BASE && ext === '.html') {
      for (const [, url] of text.matchAll(ROOT_URL)) {
        if (url !== BASE && !url.startsWith(`${BASE}/`)) {
          problems.push(`${rel}: "${url}" does not start with the base path ${BASE}`);
        }
      }
    }
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
