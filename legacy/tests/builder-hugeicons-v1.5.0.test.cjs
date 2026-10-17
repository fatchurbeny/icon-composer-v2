const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = path.resolve(__dirname, "..");
const builder = fs.readFileSync(path.join(root, "tools/template-icon-builder-aksen-v1.5.0.html"), "utf8");
const composer = fs.readFileSync(path.join(root, "tools/icon-composer-aksen-v1.5.0.html"), "utf8");

function checkScripts(html, label) {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1])
    .filter(source => source.trim());
  scripts.forEach((source, index) => new vm.Script(source, {filename: `${label}#${index}`}));
}

function expect(text, pattern, message) {
  if (!pattern.test(text)) throw new Error(message);
}

checkScripts(builder, "builder-v1.5.0");
checkScripts(composer, "composer-v1.5.0");

for (const [html, label] of [[builder, "Builder"], [composer, "Composer"]]) {
  expect(html, /@hugeicons\/core-free-icons@4\.3\.5\/\+esm/, `${label}: URL Hugeicons tidak ditemukan`);
  expect(html, /const LIB_RE = \/\^\(lu\|tb\|hg\):\//, `${label}: namespace hg tidak diterima`);
  expect(html, /function loadHugeicons\(\)/, `${label}: loader Hugeicons tidak ditemukan`);
  expect(html, /Hugeicons Free berlisensi MIT/, `${label}: keterangan lisensi Hugeicons tidak ditemukan`);
}

expect(builder, /data-psrc="hg"/, "Builder: tombol Hugeicons tidak ditemukan");
expect(builder, /data-pbody="body"/, "Builder: filter punya body tidak ditemukan");
expect(builder, /data-pbody="line"/, "Builder: filter hanya garis tidak ditemukan");
expect(builder, /hugeicons:\[\.\.\.hgNames\(\)\]\.sort\(\)/, "Builder: vocabulary Hugeicons tidak diekspor");
expect(builder, /Hugeicons Free \(https:\/\/hugeicons\.com\) — MIT License/, "Builder: LICENSES.txt belum mencantumkan Hugeicons");
expect(builder, /function includePreviewStyleInExport\(kind\)/, "Builder: sinkronisasi gaya preview ke pilihan ekspor tidak ditemukan");
expect(builder, /MODES\.forEach\(mode => \{ const checkbox = \$\("ex" \+ mode\); if \(checkbox\) checkbox\.checked = mode === kind; \}\)/, "Builder: pilihan gaya ekspor belum eksklusif");
expect(builder, /if \(d\.pv\)\{ pv = d\.pv; includePreviewStyleInExport\(pv\);/, "Builder: gaya yang dipilih belum otomatis dicentang untuk ekspor");
expect(builder, /setiap warna harus berupa path fill langsung/, "Builder: validasi path fill Canva tidak ditemukan");
expect(builder, /editableColors\.length > 5/, "Builder: batas warna editable Canva tidak divalidasi");
expect(builder, /<use\\b\|<symbol\\b\|<clipPath\\b/, "Builder: referensi SVG nonlangsung belum ditolak");
expect(builder, /const previous = colors\.findIndex\(color => colorKey\(color\) === key\)/, "Builder: urutan warna belum mengikuti lapisan terakhir");
expect(builder, /if \(previous >= 0\) colors\.splice\(previous, 1\);\s*colors\.push\(fill\);/, "Builder: detail warna depan dapat tertutup saat direct-fill");
expect(composer, /data-libsrc="hg"/, "Composer: tombol Hugeicons tidak ditemukan");
expect(composer, /zip\.file\("LICENSES\.txt"/, "Composer: LICENSES.txt tidak ikut ZIP");
expect(composer, /data-bodyfilter="body"/, "Composer: filter punya body tidak ditemukan");
expect(composer, /data-bodyfilter="line"/, "Composer: filter hanya garis tidak ditemukan");
expect(composer, /id="luCatMenu"[^>]*role="listbox"/, "Composer: dropdown kategori kustom tidak ditemukan");
if (/<select[^>]+id="luCat"/.test(composer)) throw new Error("Composer: dropdown kategori masih memakai select native");
expect(composer, /class="mobile-nav"/, "Composer: bottom navigation mobile tidak ditemukan");
expect(composer, /#vEditor \.stage\{position:fixed/, "Composer: kanvas mobile belum fixed");
expect(composer, /data-mpanel="components"/, "Composer: panel komponen mobile tidak ditemukan");
expect(composer, /data-mpanel="style"/, "Composer: panel gaya mobile tidak ditemukan");
expect(composer, /data-mpanel="set"/, "Composer: panel set mobile tidak ditemukan");

console.log("PASS: Builder dan Composer v1.5.0 mendukung lazy-load Hugeicons, namespace hg, vocabulary, dan lisensi.");
