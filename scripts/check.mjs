import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
let files = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:js|mjs)$/.test(file)) {
      execFileSync(process.execPath, ['--check', file]);
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) {
        if (!fs.existsSync(path.resolve(path.dirname(file),match[1]))) throw new Error(`Missing import in ${file}: ${match[1]}`);
      }
      files++;
    } else if (file.endsWith('.html')) {
      for (const match of fs.readFileSync(file,'utf8').matchAll(/(?:src|href)="([^"#]+)"/g)) {
        if (!/^https?:/.test(match[1]) && !fs.existsSync(path.resolve(path.dirname(file),match[1]))) throw new Error(`Missing file in ${file}: ${match[1]}`);
      }
    }
  }
}
walk(root);
console.log(`OK: ${files} JavaScript files, local imports and HTML references.`);
