// Isolated export regression checks; no network, browser storage or uploads.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const old = fs.readFileSync(path.join(root, 'src/template-icon-builder-aksen/template.html'), 'utf8');
const src = fs.readFileSync(path.join(root, 'src/template-icon-builder-aksen/template-v1.4.1.html'), 'utf8');
const built = fs.readFileSync(path.join(root, 'tools/template-icon-builder-aksen-v1.4.1.html'), 'utf8');
const oldBuilt = fs.readFileSync(path.join(root, 'tools/template-icon-builder-aksen.html'), 'utf8');
for (const html of [oldBuilt, built]) {
  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) if (m[1].trim()) new vm.Script(m[1]);
}
for (const name of ['engine.js', 'engine2.js']) {
  const engine = fs.readFileSync(path.join(root, 'src/template-icon-builder-aksen', name), 'utf8');
  assert.ok(oldBuilt.includes(engine), `original ${name}`);
  assert.ok(built.includes(engine), `new ${name}`);
}
assert.equal(src.slice(src.indexOf('function dedupeAttrs'), src.indexOf('function finalManifest')), old.slice(old.indexOf('function dedupeAttrs'), old.indexOf('function finalManifest')));
function parseCsv(s) {
  const rows = []; let row = [], cell = '', quoted = false;
  s = s.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') { if (quoted && s[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if (c === '\r' && !quoted && s[i + 1] === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; }
    else cell += c;
  }
  assert.equal(quoted, false);
  assert.equal(cell, '');
  return rows;
}
const fields = Object.fromEntries(['exX', 'exA', 'exB'].map(k => [k, {checked:true}]));
Object.assign(fields, {exStatus:{textContent:''}, exKw:{value:'15'}, exName:{value:'test'}, exLocale:{value:'en'}, exArtist:{value:' hashtagben '}, exDescription:{value:'A "quoted", description\nSecond line'}});
const item = {id:'scan-market', slides:[2], role:'slot', main:'store', mod:'lu:search'};
let files, saved = 0;
class Zip {
  constructor() { files = {}; }
  file(name, data) { files[name] = data; }
  async generateAsync() { return {}; }
}
const ctx = vm.createContext({
  $: k => fields[k], window:{JSZip:Zip}, JSZip:Zip,
  MODES:['X','A','B'], MODE_INFO:{X:{dir:'aksen'}, A:{dir:'garis-solid'}, B:{dir:'solid-garis'}},
  items:[item], exportList:() => ctx.items, loadTags:async()=>{}, kebab2:s=>s,
  svgFile:()=>'<svg/>', meta:()=>({title_en:'Scan Market', title_id:'Pindai Pasar', keywords_en:'market, research, "quoted"', keywords_id:'pasar, riset', search:'lookup'}),
  packOf:()=>({en:'Marketing Process'}), resourceHTML:()=>'<html/>', finalManifest:()=>({}), LICENSES:'licenses', saveFile:async()=>{saved++;}
});
const csv = src.split('\n').find(l=>l.startsWith('const csvCell ='));
const exp = src.slice(src.indexOf('async function doExport()'), src.indexOf('/* ---------- ekspor skill'));
vm.runInContext(csv+'\n'+exp, ctx);
(async()=>{
  for (const locale of ['en','id']) {
    fields.exLocale.value = locale;
    await ctx.doExport();
    const data = parseCsv(files['metadata.csv']);
    assert.deepEqual(data[0], ['filename','title','keywords','Artist','locale','description']);
    assert.equal(data.length, 4);
    for (const row of data.slice(1)) {
      assert.equal(row.length, 6);
      assert.ok(Object.keys(files).some(f=>f.endsWith('/'+row[0])));
      assert.equal(row[1], locale==='en'?'Scan Market':'Pindai Pasar');
      assert.equal(row[3], 'hashtagben');
      assert.equal(row[4], locale);
      assert.equal(row[5], fields.exDescription.value);
    }
    const internal = parseCsv(files['metadata-internal.csv']);
    assert.equal(internal[0].length, 13);
    assert.equal(internal.length, 4);
    assert.ok(files['resource-page.html']);
    assert.ok(files['manifest-final.json']);
    assert.ok(files['LICENSES.txt']);
  }
  ctx.items = [item, {...item}];
  await ctx.doExport();
  assert.match(fields.exStatus.textContent, /duplikat/);
  assert.equal(saved, 2);
  console.log('PASS: script syntax, unchanged engines/SVG export, six Canva columns, EN/ID mapping, multiline CSV escaping, all three style filenames, internal metadata, duplicate-name guard.');
})().catch(e=>{console.error(e); process.exitCode=1;});
