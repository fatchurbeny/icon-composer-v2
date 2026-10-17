P = "/home/claude/tib/build-aksen/template.html"
t = open(P).read()
def rep(o, n, c=1):
    global t
    k = t.count(o)
    if k != c: raise SystemExit(f"count {k}: {o[:100]!r}")
    t = t.replace(o, n)

rep('const TIB_VERSION = "1.1.0";', 'const TIB_VERSION = "1.2.0";')
rep('''        <label class="f">Nama pack<input class="inp" id="exName" maxlength="60"></label>''',
    '''        <label class="f">Nama pack (nama file ZIP)<input class="inp" id="exName" maxlength="60"></label>
        <div class="two"><label class="f">Tema pack (EN)<input class="inp" id="exPackEn" maxlength="40" placeholder="Startup Pitch"></label><label class="f">Tema pack (ID)<input class="inp" id="exPackId" maxlength="40" placeholder="Pitch Startup"></label></div>
        <label class="f">ID brand Canva <span class="hint">· hanya untuk metadata, disimpan di browser ini</span><input class="inp mono" id="exBrand" maxlength="40" placeholder="BA…"></label>
        <p class="hint" id="exSearchEx"></p>''')

# helpers
rep('''/* ---------- metadata ---------- */''', '''/* ---------- metadata ---------- */
/* judul & pencarian: [nama ikon] [tema pack] [gaya] Icon, dicari dengan brand:<ID> [id] [tema pack] */
const BRAND_KEY = "tib-canva-brand-id";
function brandId(){ try { return (localStorage.getItem(BRAND_KEY) || "").trim(); } catch { return ""; } }
function packOf(){ const p = man && man.pack; if (!p) return {en:"", id:""}; if (typeof p === "string") return {en:p, id:p}; return {en:String(p.en || p.id || ""), id:String(p.id || p.en || "")}; }
const SMALL = new Set(["a","an","the","and","or","of","for","to","in","on","at","by","with","vs"]);
function titleCase(s){ return String(s || "").trim().split(/\\s+/).map((w, i) => i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }
const STYLE_WORD = {X:"Accent Line", A:"Two Tone", B:"Solid Two Tone", C:"Outline"};
function searchOf(it){ const b = brandId(), pk = packOf().en.toLowerCase().trim(); return [b ? "brand:" + b : "", it.id.replace(/-/g, " "), pk].filter(Boolean).join(" "); }''')
rep('''  const en = [...new Set([...lc(it.keywords.en), it.name.en.toLowerCase(), ...mainT.slice(0, 6), ...modT.slice(0, 4), ...styleEN, "icon"])].slice(0, N);
  const idw = [...new Set([...lc(it.keywords.id), it.name.id.toLowerCase(), ...[...mainT.slice(0, 6), ...modT.slice(0, 4)].map(trID).filter(Boolean), ...styleID, "ikon"])].slice(0, N);
  return {
    title_en: `${it.name.en} ${MODE_INFO[kind].ten}`,
    title_id: `Ikon ${it.name.id.charAt(0).toLowerCase() + it.name.id.slice(1)} ${MODE_INFO[kind].tid}`,
    keywords_en: en.join(", "), keywords_id: idw.join(", ")
  };''', '''  const pk = packOf();
  const en = [...new Set([...lc(it.keywords.en), it.name.en.toLowerCase(), ...lc([pk.en]), ...mainT.slice(0, 6), ...modT.slice(0, 4), ...styleEN, "icon"])].slice(0, N);
  const idw = [...new Set([...lc(it.keywords.id), it.name.id.toLowerCase(), ...lc([pk.id]), ...[...mainT.slice(0, 6), ...modT.slice(0, 4)].map(trID).filter(Boolean), ...styleID, "ikon"])].slice(0, N);
  const nid = it.name.id.charAt(0).toLowerCase() + it.name.id.slice(1);
  return {
    title_en: [titleCase(it.name.en), titleCase(pk.en), STYLE_WORD[kind], "Icon"].filter(Boolean).join(" "),
    title_id: ["Ikon", nid, pk.id.toLowerCase(), MODE_INFO[kind].tid].filter(Boolean).join(" "),
    keywords_en: en.join(", "), keywords_id: idw.join(", "), search: searchOf(it)
  };''')

# csv
rep('''  const rows = [["file","id","style","title_en","title_id","keywords_en","keywords_id","slides","role","main","modifier"].join(",")];''',
    '''  const rows = [["file","id","style","title_en","title_id","keywords_en","keywords_id","search","pack","slides","role","main","modifier"].join(",")];''')
rep('''    rows.push([f, it.id, MODE_INFO[s].dir, m.title_en, m.title_id, m.keywords_en, m.keywords_id, it.slides.join(" "), it.role, it.main, it.mod].map(csvCell).join(","));''',
    '''    rows.push([f, it.id, MODE_INFO[s].dir, m.title_en, m.title_id, m.keywords_en, m.keywords_id, m.search, packOf().en, it.slides.join(" "), it.role, it.main, it.mod].map(csvCell).join(","));''')

# resource page: id + search phrase (without brand id)
rep('''  const cell = (it, i) => `<figure>${render(it, pv, {idp:"rp" + i})}<figcaption>${esc(it.id)}</figcaption></figure>`;''',
    '''  const cell = (it, i) => `<figure>${render(it, pv, {idp:"rp" + i})}<figcaption>${esc(it.id)}<small>${esc(searchOf(it))}</small></figcaption></figure>`;''')
rep('''figcaption{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#5E6068}</style>''',
    '''figcaption{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#5E6068;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}small{font-size:9px;color:#8B8D96}</style>''')

# export view: fill inputs + example
rep('''  if (!$("exName").value) $("exName").value = (man && man.deck && man.deck.title) ? man.deck.title + " Icons" : "Icon Pack";''',
    '''  if (!$("exName").value) $("exName").value = (man && man.deck && man.deck.title) ? man.deck.title + " Icons" : "Icon Pack";
  const pk = packOf(); if (document.activeElement !== $("exPackEn")) $("exPackEn").value = pk.en; if (document.activeElement !== $("exPackId")) $("exPackId").value = pk.id;
  if (document.activeElement !== $("exBrand")) $("exBrand").value = brandId();
  const b0 = brandId(), okB = !b0 || /^BA[A-Za-z0-9_-]{6,}$/.test(b0);
  if (list[0]){ const m0 = meta(list[0], styles[0] || pv, 15); $("exSearchEx").innerHTML = `Judul: <b>${esc(m0.title_en)}</b><br>Cari di Elements: <span class="mono">${esc(m0.search)}</span>${!pk.en ? "<br>Tema pack kosong: judul tidak memuat tema." : ""}${!b0 ? "<br>ID brand kosong: kolom search tanpa filter brand." : okB ? "" : "<br>ID brand biasanya diawali BA. Periksa lagi."}`; }''')
rep('''  const styles = MODES.filter(m => $("ex" + m).checked);
  const dm = dupMap(), flagged''', '''  const dm = dupMap(), flagged''')
rep('''  const list = exportList(), cols = sheetGrid(list.length);
  document.querySelectorAll("[data-cols]")''', '''  const list = exportList(), cols = sheetGrid(list.length), styles = MODES.filter(m => $("ex" + m).checked);
  document.querySelectorAll("[data-cols]")''')

# inputs
rep('''  if (id === "pQ"){''', '''  if (id === "exBrand"){ try { localStorage.setItem(BRAND_KEY, e.target.value.trim()); } catch {} renderExport(); return; }
  if (id === "exPackEn" || id === "exPackId"){ if (man){ const p = packOf(); man.pack = {en: id === "exPackEn" ? e.target.value : p.en, id: id === "exPackId" ? e.target.value : p.id}; persist(); } renderExport(); return; }
  if (id === "pQ"){''')

# import summary + validation
rep('''    <p class="hint" style="margin-top:8px">${esc((man.deck && man.deck.title) || "Tanpa judul")} · mode deck''',
    '''    <p class="hint" style="margin-top:8px">${esc((man.deck && man.deck.title) || "Tanpa judul")} · tema pack ${esc(packOf().en || "–")} · mode deck''')
rep('''  if (man.format !== "tib-manifest") out.push(["warn", "Kolom format bukan \\"tib-manifest\\". Tetap dibaca."]);''',
    '''  if (man.format !== "tib-manifest") out.push(["warn", "Kolom format bukan \\"tib-manifest\\". Tetap dibaca."]);
  if (!packOf().en) out.push(["warn", "Manifest tanpa \\"pack\\" (tema pack). Isi Tema pack di langkah Ekspor agar judul dan pencarian unik."]);''')
open(P, "w").write(t); print("ok")
