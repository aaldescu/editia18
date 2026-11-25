// Builds two outputs from src/:
//   dist/index.html    full standalone document (served by nginx in Docker / Dokploy)
//   dist/fragment.html body-only page with everything inlined (used for the claude.ai preview)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const src = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const scripts = ['schematics.js', 'questions.js', 'evidence.js', 'app.js']
  .map((f) => `<script>\n${src(f).replace(/<\/script/gi, '<\\/script')}\n</script>`).join('\n');
const fragment = src('index.html').replace('<!--SCRIPTS-->', scripts);
const full = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#D9581F">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23D9581F'/%3E%3Ctext x='16' y='22' font-family='monospace' font-size='15' font-weight='700' text-anchor='middle' fill='white'%3E18%3C/text%3E%3C/svg%3E">
</head>
<body>
${fragment}
</body>
</html>
`;
mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('../dist/index.html', import.meta.url), full);
writeFileSync(new URL('../dist/fragment.html', import.meta.url), fragment);
console.log('built dist/index.html (' + full.length + ' bytes)');
