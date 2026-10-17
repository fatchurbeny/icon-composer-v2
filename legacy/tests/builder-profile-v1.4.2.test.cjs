const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/template-icon-builder-aksen/template-v1.4.2.html'), 'utf8');
const built = fs.readFileSync(path.join(root, 'tools/template-icon-builder-aksen-v1.4.2.html'), 'utf8');

for (const match of built.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim()) new vm.Script(match[1]);
}
for (const name of ['engine.js', 'engine2.js']) {
  const engine = fs.readFileSync(path.join(root, 'src/template-icon-builder-aksen', name), 'utf8');
  assert.ok(built.includes(engine), `${name} must remain unchanged in the new build`);
}
assert.match(source, /data-creator="hashtagben"/);
assert.match(source, /data-creator="chital"/);
assert.match(source, /class="creator-menu"/);
assert.match(source, /data-locale="en"/);
assert.match(source, /data-locale="id"/);
assert.doesNotMatch(source, /<select class="inp" id="exLocale">/);
assert.match(source, /data-kw="25"/);
assert.doesNotMatch(source, /<select class="inp" id="exKw"/);
assert.match(source, /id="exOutline"/);
assert.match(source, /outlineSvgFile\(sourceSvg\)/);
assert.match(source, /flattenSvgMasks\(doc\)/);
assert.match(source, /differenceMultiPolygons\(source, cut\)/);
assert.match(source, /clone\.childNodes/);
assert.match(source, /if \(el\.closest\("defs"\)\) continue/);
assert.match(source, /group\.setAttribute\("stroke", "none"\)/);
assert.match(source, /path\.setAttribute\("fill-rule", "evenodd"\)/);
assert.match(source, /if \(\/<mask\\b\|\\smask=\/\.test\(result\)\) throw new Error/);
assert.match(source, /stroke_output:outline \? "outlined-fill" : "editable-stroke"/);
assert.doesNotMatch(built, /\/\*@OUTLINE@\*\//);
assert.match(source, /creator_profile_id:artist, artist/);
assert.match(source, /const artist = \$\("exCreator"\)\.value === "chital" \? "chital" : "hashtagben"/);
assert.match(source, /z\.file\("submission-profile\.json"/);
assert.match(source, /const OUTPUT_VERSION = "1\.4\.2"/);

console.log('PASS: Builder v1.4.2 syntax, unchanged engines, brand selector, Artist mapping, and submission profile output.');
