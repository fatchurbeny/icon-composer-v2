const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src/template-icon-builder-aksen');
const source = fs.readFileSync(path.join(srcDir, 'template-v1.4.5.html'), 'utf8');
const built = fs.readFileSync(path.join(root, 'tools/template-icon-builder-aksen-v1.4.5.html'), 'utf8');

for (const match of built.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim()) new vm.Script(match[1]);
}

const shared = fs.readFileSync(path.join(srcDir, 'engine.js'), 'utf8');
const classic = fs.readFileSync(path.join(srcDir, 'engine2-v1.4.5.js'), 'utf8');
assert.ok(built.includes(shared), 'shared engine must remain unchanged');
assert.ok(built.includes(classic), 'build must use the isolated 1.4.3 classic engine');
assert.match(classic, /const CLASSIC_ENGINE_VERSION = "1\.4\.5"/);
assert.match(classic, /function solidLineFit\(/);
assert.match(classic, /const maxSide = 18/);
assert.match(classic, /function solidLineDiagnostic\(/);
assert.match(classic, /function solidMainDetails\(/);
assert.match(classic, /const interior = inBB\(p\.bb, info\.U/);
assert.match(source, /const OUTPUT_VERSION = "1\.4\.5"/);
assert.match(source, /Log output 1\.4\.5/);
assert.match(source, /classic_engine:typeof CLASSIC_ENGINE_VERSION/);
assert.match(source, /function directFillSvgFile\(/);
assert.match(source, /z\.file\(f, directFillSvgFile\(sourceSvg\)\)/);
assert.match(source, /stroke_output:"direct-fill"/);
assert.match(source, /svg_structure:"one-path-per-color"/);
assert.match(source, /fill_rule:"nonzero"/);
assert.match(source, /path\.setAttribute\("fill-rule", "nonzero"\)/);
assert.match(source, /<mask\\b\|\\smask=\|\\sstroke/);

console.log('PASS: Builder v1.4.5 exports overlap-safe direct-fill SVG with nonzero winding.');
