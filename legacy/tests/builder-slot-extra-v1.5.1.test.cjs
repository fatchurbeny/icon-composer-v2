const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = path.resolve(__dirname, "..");
const builder = fs.readFileSync(path.join(root, "tools/template-icon-builder-aksen-v1.5.1.html"), "utf8");

function expect(pattern, message){ if (!pattern.test(builder)) throw new Error(message); }

[...builder.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.trim())
  .forEach((source, i) => new vm.Script(source, {filename: `builder-v1.5.1#${i}`}));

expect(/const TIB_VERSION = "1\.5\.1"/, "Versi Builder bukan 1.5.1");
expect(/id="exSlot"/, "Pilihan ekspor ikon slot tidak ditemukan");
expect(/id="exExtra"/, "Pilihan ekspor ikon ekstra tidak ditemukan");
expect(/id="exSplit"/, "Pilihan pisahkan folder tidak ditemukan");
expect(/const ROLE_DIR = \{slot:"slot-deck", extra:"ekstra"\}/, "Nama folder slot-deck/ekstra tidak ditemukan");
expect(/const f = pathOf\(it, s\)/, "Path file ZIP belum memakai pathOf");
if (/if \(it\.role === "extra"\) it\.on = false/.test(builder)) throw new Error("Ekstra masih dikeluarkan otomatis saat impor");
expect(/Extra icons in the same set/, "Resource Page belum dikelompokkan slot dan ekstra");
console.log("builder-slot-extra-v1.5.1: OK");
