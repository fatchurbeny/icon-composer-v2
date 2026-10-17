const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = path.resolve(__dirname, "..");
const builder = fs.readFileSync(path.join(root, "tools/template-icon-builder-aksen-v1.6.0.html"), "utf8");
function expect(pattern, message){ if (!pattern.test(builder)) throw new Error(message); }

[...builder.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.trim())
  .forEach((source, i) => new vm.Script(source, {filename: `builder-v1.6.0#${i}`}));

expect(/const TIB_VERSION = "1\.6\.0"/, "Versi Builder bukan 1.6.0");
expect(/const LIB_RE = \/\^\(lu\|tb\|hg\|cu\):\//, "Namespace cu tidak diterima");
expect(/const CU_DATA = \{"format":"cu-icons"/, "Library Kustom belum disematkan");
expect(/"espresso-tamper":\{/, "Ikon cu:espresso-tamper tidak ada");
expect(/function cuRoles\(key, n\)/, "Peran bawaan Library Kustom tidak dipakai");
expect(/data-psrc="cu"/, "Tombol sumber Kustom tidak ditemukan");
expect(/Library Kustom \(cu:\)/, "LICENSES.txt belum mencantumkan Library Kustom");
expect(/custom:Object\.fromEntries/, "Vocabulary belum mengekspor Library Kustom");
expect(/id="exSlot"/, "Fitur v1.5.1 (ekspor slot) hilang");
console.log("builder-custom-v1.6.0: OK");
