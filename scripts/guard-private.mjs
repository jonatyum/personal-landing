// Fails if git tracks personal material (docs/, the .tex CV, perfil*).
import { execFileSync } from 'node:child_process';

const PRIVATE = [/^docs\//, /^private\//, /\.tex$/, /(^|\/)perfil[^/]*$/];

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const leaks = tracked.filter((file) => PRIVATE.some((re) => re.test(file)));

if (leaks.length > 0) {
  console.error('Private files tracked by git:');
  for (const file of leaks) console.error(`  ${file}`);
  process.exit(1);
}

console.log(`guard: ${tracked.length} tracked files, none private.`);
