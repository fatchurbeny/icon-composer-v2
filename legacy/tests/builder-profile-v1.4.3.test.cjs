const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src/template-icon-builder-aksen');
const source = fs.readFileSync(path.join(srcDir, 'template-v1.4.3.html'), 'utf8');
const built = fs.readFileSync(path.join(root, 'tools/template-icon-builder-aksen-v1.4.3.html'), 'utf8');

for (const match of built.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim()) new vm.Script(match[1]);
}

const shared = fs.readFileSync(path.join(srcDir, 'engine.js'), 'utf8');
const classic = fs.readFileSync(path.join(srcDir, 'engine2-v1.4.3.js'), 'utf8');
assert.ok(built.includes(shared), 'shared engine must remain unchanged');
assert.ok(built.includes(classic), 'build must use the isolated 1.4.3 classic engine');
assert.match(classic, /const CLASSIC_ENGINE_VERSION = "1\.4\.3"/);
assert.match(classic, /function solidLineFit\(/);
assert.match(classic, /const maxSide = 18/);
assert.match(classic, /function solidLineDiagnostic\(/);
assert.match(classic, /function solidMainDetails\(/);
assert.match(classic, /const interior = inBB\(p\.bb, info\.U/);
assert.match(source, /const OUTPUT_VERSION = "1\.4\.3"/);
assert.match(source, /Log engine klasik 1\.4\.3/);
assert.match(source, /classic_engine:typeof CLASSIC_ENGINE_VERSION/);
assert.match(source, /updates:\["Solid·garis: struktur luar mengikuti warna body"/);

console.log('PASS: Builder v1.4.3 uses an isolated classic engine and records its Solid·garis update log.');
