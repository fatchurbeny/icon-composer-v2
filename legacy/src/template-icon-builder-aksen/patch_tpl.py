P = "/home/claude/tib/build-aksen/template.html"
t = open(P).read()
def rep(o, n, c=1):
    global t
    k = t.count(o)
    if k != c: raise SystemExit(f"count {k}: {o[:100]!r}")
    t = t.replace(o, n)

# CSS
rep(".side{flex:1 1 320px;min-width:0;background:var(--panel);border-left:1px solid var(--line);padding:16px;display:flex;flex-direction:column;gap:16px}",
    ".side{flex:1 1 320px;min-width:0;background:var(--panel);border-left:1px solid var(--line);padding:16px;display:flex;flex-direction:column;gap:16px;position:relative}")
rep(".big{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}", """.big{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.prow{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:9px;border:1px solid var(--line);background:var(--raised)}
.prow .pt2{width:34px;height:34px;flex:none;border-radius:7px;background:var(--paper);display:grid;place-items:center}
.prow .seg{flex:1}
.prow .seg button{font-size:10.5px;padding:0 2px;height:26px}
.plist{display:flex;flex-direction:column;gap:4px;max-height:236px;overflow:auto}
.accbox{display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--bar)}
.seg.sm button{font-size:12px;padding:0 4px}
#bOv .hp{cursor:pointer}
#bOv .hp:hover{stroke:rgba(58,87,232,.55)!important}
#bOv .hp.cl:hover{fill:rgba(58,87,232,.12)!important}""")
rep("  .app{height:100vh}", "  html,body{height:100%;overflow:hidden}\n  .app{height:100vh}")

# header + texts
rep("<div><b>Template Icon Builder</b>", "<div><b>Template Icon Builder · Aksen</b>")
rep("""<div class="seg" role="group" aria-label="Pratinjau gaya"><button data-pv="A\"""", """<div class="seg" role="group" aria-label="Pratinjau gaya"><button data-pv="X" title="Wadah tinta, isi aksen, penanda di depan dengan celah">Aksen</button><button data-pv="A\"""")
rep("Ikon langsung dirakit dengan gaya garis dan solid.", "Ikon langsung dirakit dengan gaya Aksen bagian, plus Garis·solid dan Solid·garis.")
rep("""<button data-cols="10">10</button></div>""", """<button data-cols="10">10</button><button data-cols="12">12</button><button data-cols="14">14</button></div>""")
rep("""        <label class="optrow"><span>Utama garis · pengubah solid</span><input type="checkbox" id="exA" checked></label>
        <label class="optrow"><span>Utama solid · pengubah garis</span><input type="checkbox" id="exB" checked></label>""",
    """        <label class="optrow"><span>Aksen bagian (Cara 3 + 4)</span><input type="checkbox" id="exX" checked></label>
        <label class="optrow"><span>Utama garis · pengubah solid</span><input type="checkbox" id="exA"></label>
        <label class="optrow"><span>Utama solid · pengubah garis</span><input type="checkbox" id="exB"></label>""")

# constants
rep('const TIB_VERSION = "1.0.0";', 'const TIB_VERSION = "1.1.0";')
rep('const STORE = "template-icon-builder-v1";', 'const STORE = "template-icon-builder-aksen-v1";')
rep('const MODES = ["A", "B"];', '''const MODES = ["X", "A", "B"];
/* patokan tiap keluarga gaya; keduanya sama dengan Icon Composer */
const STY = {X:{sw:3.5, gap:1.25, cap:"round", join:"round", scale:{main:88, mod:80, deco:100}}, C:{sw:2, gap:2, cap:"butt", join:"miter", scale:{main:84, mod:100, deco:100}}};
function useStyle(kind){ const s = STY[kind === "X" ? "X" : "C"]; Object.assign(style, s, {scale:{...s.scale}}); }
const FILLS = ["none","full","offset","half"], SPARKS = ["none","star4","star4x2"];
function sparkHome(slot, type){ const h = (DECOS[type] || {home:[9, 9]}).home; return slot === "TL" || slot === "ML" ? [48 - h[0], h[1]] : [h[0], h[1]]; }
function normAcc(it, a){
  a = a || {};
  it.under = FILLS.includes(a.fill) ? a.fill : (FILLS.includes(it.under) ? it.under : "none");
  it.mstyle = a.marker === "fill" || a.marker === "line" ? a.marker : (it.mstyle === "fill" ? "fill" : "line");
  const pr = a.parts !== undefined ? a.parts : it.parts;
  if (pr && typeof pr === "object"){ const p = {}; for (const [k, v] of Object.entries(pr)) if (/^\\d+$/.test(k) && ROLES.includes(v)) p[k] = v; it.parts = Object.keys(p).length ? p : null; } else it.parts = null;
  const sp = a.spark !== undefined ? a.spark : (it.deco && it.deco.type);
  if (SPARKS.includes(sp) && sp !== "none"){
    const pos = Array.isArray(a.spark_pos) && a.spark_pos.length === 2 && a.spark_pos.every(v => Number.isFinite(+v)) ? a.spark_pos.map(v => Math.max(0, Math.min(48, +v))) : (it.deco && it.deco.type === sp && Number.isFinite(it.deco.x) ? [it.deco.x, it.deco.y] : sparkHome(it.slot, sp));
    it.deco = {type:sp, x:pos[0], y:pos[1], r:0, color:"accent"};
  } else it.deco = {type:"none", x:9, y:9, r:0, color:"accent"};
  it.vis = {main:true, mod:true, deco:true};
  return it;
}''')
rep('''const MODE_INFO = {
''', '''const MODE_INFO = {
  X:{label:"Aksen bagian · penanda di depan", short:"Aksen", dir:"aksen", en:["two tone icon", "accent icon", "line icon", "rounded icon"], id:["ikon dua warna", "ikon aksen", "ikon garis"], ten:"accent line icon", tid:"garis aksen"},
''')
rep('''  if (MODES.includes(st.mode)) pv = st.mode;
}''', '''  const fam = st.family === "classic" ? "classic" : "accent";
  pv = fam === "classic" ? (["A", "B"].includes(st.mode) ? st.mode : "A") : "X";
  $("exX").checked = fam === "accent"; $("exA").checked = fam === "classic"; $("exB").checked = fam === "classic";
}''')
rep('''    on: true, vis:{main:true, mod:true, deco:false}, deco:{type:"none"}
  };
}''', '''    on: true, vis:{main:true, mod:true, deco:true}, deco:{type:"none"}, _acc:o.accent
  };
}''')
rep('''  items = j.icons.map(toItem);''', '''  items = j.icons.map(toItem).map(it => { const a = it._acc; delete it._acc; return normAcc(it, a); });''')
rep('''  if (M && M.plate) f.push(["warn", "Tanpa body: mode Solid·garis memakai pelat bulat"]);''',
    '''  if (M && M.plate) f.push(["warn", "Tanpa body: mode Solid·garis memakai pelat bulat, isi bidang Aksen tidak tersedia"]);''')

# render
rep('''function render(it, kind, opt){
  opt = opt || {};
  if (!MAINS[it.main]) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${opt.size || 48}" height="${opt.size || 48}"></svg>`;
  return compose(''', '''function render(it, kind, opt){
  opt = opt || {};
  if (!MAINS[it.main]) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${opt.size || 48}" height="${opt.size || 48}"></svg>`;
  useStyle(kind);
  if (kind === "X") return composeAccent({...it, vis:{main:true, mod:true, deco:true}, deco:it.deco || {type:"none"}}, {size: opt.size || 48, idp: opt.idp});
  return compose(''')

# board boxes + overlay
rep('''function boxesT(it){
  const g = geom(it), ms = style.scale.main/100;
  return {main:{x:24 + it.mx - 20*ms, y:24 + it.my - 20*ms, w:40*ms, h:40*ms}, mod: g.md ? {x:g.L, y:g.T, w:g.W, h:g.H} : null};
}''', '''function boxesT(it){
  useStyle(pv);
  const g = geom(it), ms = style.scale.main/100, d = it.deco || {type:"none"};
  const deco = pv === "X" && d.type !== "none" ? (d.type === "star4" ? {x:d.x - 4.5, y:d.y - 4.5, w:9, h:9} : {x:d.x - 5.5, y:d.y - 6.5, w:12.5, h:12.5}) : null;
  return {main:{x:24 + it.mx - 20*ms, y:24 + it.my - 20*ms, w:40*ms, h:40*ms}, mod: g.md ? {x:g.L, y:g.T, w:g.W, h:g.H} : null, deco};
}
const LAYER_LAB = {main:"Objek utama", mod:"Pengubah", deco:"Kilau"};''')
rep('''  const b = boxesT(it), sb = b[layer];
  let o = "";
  for (const k of ["main", "mod"]){ const x = b[k]; if (!x) continue; o += `<rect data-layer="${k}" x="${r3(x.x - 1)}" y="${r3(x.y - 1)}" width="${r3(x.w + 2)}" height="${r3(x.h + 2)}" fill="transparent" style="cursor:move"/>`; }
  if (sb){
    const lab = layer === "main" ? "Objek utama" : "Pengubah", tw''', '''  if (layer === "deco" && !(pv === "X" && it.deco && it.deco.type !== "none")) layer = "main";
  const b = boxesT(it), sb = b[layer];
  let o = "";
  const hit = k => { const x = b[k]; return x ? `<rect data-layer="${k}" x="${r3(x.x - 1)}" y="${r3(x.y - 1)}" width="${r3(x.w + 2)}" height="${r3(x.h + 2)}" fill="transparent" style="cursor:move"/>` : ""; };
  o += hit("main");
  if (pv === "X" && layer === "main"){
    useStyle("X"); const info = mainInfo(it.main), g = geom(it);
    o += `<g transform="${g.mainT}">` + info.parts.map((p, i) => {
      const css = `style="fill:${p.closed ? "rgba(0,0,0,0)" : "none"};stroke:rgba(0,0,0,0);stroke-width:${r3(4/g.ms/p.k)}px;pointer-events:${p.closed ? "all" : "stroke"}"`;
      const el = p.svg.replace(/^<(\\w+)/, `<$1 data-layer="main" data-part="${i}" class="hp${p.closed ? " cl" : ""}" ${css}`).replace(/ fill="INK"| stroke="none"/g, "");
      return `<g${p.k === 1 ? "" : ` transform="scale(${p.k})"`}><title>Bagian ${i + 1}: klik untuk ganti warna</title>${el}</g>`;
    }).join("") + `</g>`;
  }
  o += hit("mod") + hit("deco");
  if (sb){
    const lab = LAYER_LAB[layer], tw''')
rep('''  $("bMode").textContent = MODE_INFO[pv].label;''', '''  $("bMode").textContent = MODE_INFO[pv].label + (pv === "X" ? " · klik bagian untuk ganti warna" : "");''')

# detail: accent panel
rep('''  const pos = layer === "main" ? [it.mx, it.my] : [it.nx, it.ny];''', '''  if (layer === "deco" && !(pv === "X" && it.deco && it.deco.type !== "none")) layer = "main";
  const pos = posOf(it, layer), R0 = layer === "deco" ? [0, 48] : [-12, 12];''')
rep('''    ${layer === "mod" && it.mod !== "none" ? `<div style="display:flex;gap:14px''', '''    ${pv === "X" && it.deco && it.deco.type !== "none" ? `<button class="part" data-pt="deco" style="text-align:left" aria-pressed="${layer === "deco"}"><span class="th"><svg viewBox="-8 -8 16 16"><path d="${DECOS[it.deco.type].d}" fill="${style.accent}"/></svg></span><span class="tx"><span class="hint">Dekorasi</span><b>${DECOS[it.deco.type].n}</b></span></button>` : ""}
    ${layer === "mod" && it.mod !== "none" ? `<div style="display:flex;gap:14px''')
rep('''<input type="range" id="dX" min="-12" max="12" step="0.5" value="${pos[0]}">''', '''<input type="range" id="dX" min="${R0[0]}" max="${R0[1]}" step="0.5" value="${pos[0]}">''')
rep('''<input type="range" id="dY" min="-12" max="12" step="0.5" value="${pos[1]}">''', '''<input type="range" id="dY" min="${R0[0]}" max="${R0[1]}" step="0.5" value="${pos[1]}">''')
rep('''    <p class="hint">Skala, tebal garis, celah knockout dan warna mengikuti patokan Icon Composer untuk semua ikon. Yang bisa diubah per ikon hanya objek, pengubah dan posisinya.</p>`;
}''', '''    ${accPanel(it)}
    <p class="hint">Skala, tebal garis, celah knockout dan warna mengikuti patokan Icon Composer untuk semua ikon. Yang bisa diubah per ikon: objek, pengubah, posisi, dan pengaturan Aksen.</p>`;
}
function posOf(it, l){ return l === "main" ? [it.mx, it.my] : l === "mod" ? [it.nx, it.ny] : [it.deco.x, it.deco.y]; }
function accPanel(it){
  if (pv !== "X") return `<div class="accbox"><span class="cap">Gaya aksen</span><p class="hint">Warna bagian, isi bidang, penanda dan kilau diatur di pratinjau Aksen.</p><button class="btn sm" data-pv="X">Buka pratinjau Aksen</button></div>`;
  useStyle("X");
  const info = mainInfo(it.main), R = rolesOf(it, info), hasBody = info.parts.some(p => p.body);
  const rows = info.parts.map((p, i) => `<div class="prow"><span class="pt2">${partThumb(info, i, R)}</span><div class="seg" role="group" aria-label="Warna bagian ${i + 1}">${ROLES.map(r => `<button data-prole="${i}:${r}" aria-pressed="${R[i] === r}" ${!p.closed && r.startsWith("fill") ? "disabled" : ""}>${ROLE_NAME[r]}</button>`).join("")}</div></div>`).join("");
  return `<div class="accbox">
    <div class="hd"><span class="cap">Gaya aksen</span><button class="btn sm" data-pauto="1">${it.parts ? "Kembali ke otomatis" : "Otomatis"}</button></div>
    <p class="hint">Klik bagian ikon di kanvas untuk berganti warna, atau pilih di sini. Satu kelompok aksen per ikon.</p>
    <div class="plist">${rows}</div>
    <span>Isi bidang <span class="sub">· Cara 3</span></span>
    <div class="seg sm" role="group" aria-label="Isi bidang">${FILLS.map(k => `<button data-under="${k}" aria-pressed="${it.under === k}" ${!hasBody && k !== "none" ? "disabled" : ""}>${UNDER_NAME[k]}</button>`).join("")}</div>
    ${it.mod !== "none" ? `<span>Penanda <span class="sub">· Cara 4, di depan dengan celah</span></span>
    <div class="seg sm" role="group" aria-label="Penanda"><button data-mstyle="line" aria-pressed="${it.mstyle === "line"}">Garis</button><button data-mstyle="fill" aria-pressed="${it.mstyle === "fill"}">Isi</button></div>` : ""}
    <span>Kilau</span>
    <div class="seg sm" role="group" aria-label="Kilau">${SPARKS.map(k => `<button data-spark="${k}" aria-pressed="${(it.deco || {}).type === k}">${k === "none" ? "Tanpa" : DECOS[k].n}</button>`).join("")}</div>
  </div>`;
}''')
rep('''function setPos(it, which, x, y){
  const c = v => Math.max(-12, Math.min(12, Math.round(v*2)/2));
  if (which === "main"){ it.mx = c(x); it.my = c(y); } else { it.nx = c(x); it.ny = c(y); }''', '''function setPos(it, which, x, y){
  const c = v => Math.max(-12, Math.min(12, Math.round(v*2)/2)), c2 = v => Math.max(0, Math.min(48, Math.round(v*2)/2));
  if (which === "deco"){ it.deco.x = c2(x); it.deco.y = c2(y); return; }
  if (which === "main"){ it.mx = c(x); it.my = c(y); } else { it.nx = c(x); it.ny = c(y); }''')
rep('''  <div class="iss"><span class="dot warn">!</span><span class="t"><b>Tidak dikenal</b>''', '''  <div class="iss"><span class="dot ok">✓</span><span class="t"><b>Gaya Aksen</b><br><span class="hint">Wadah tinta, isi atau bidang aksen, penanda pengubah di depan dengan celah. Warna bagian otomatis bisa diubah dengan klik bagian di kanvas.</span></span></div>
  <div class="iss"><span class="dot warn">!</span><span class="t"><b>Tidak dikenal</b>''')

# review: pickTarget never deco
rep('''  pickTarget = layer;
  const dm = dupMap();''', '''  pickTarget = layer === "deco" ? "main" : layer;
  const dm = dupMap();''')

# sheet columns
rep('''function sheetGrid(n){ if (sheetCols !== "auto") return +sheetCols; return n <= 12 ? 4 : n <= 24 ? 6 : n <= 40 ? 8 : 10; }''',
    '''/* satu halaman Resource Page: kolom bertambah mengikuti jumlah ikon */
function sheetGrid(n){ if (sheetCols !== "auto") return +sheetCols; return n <= 12 ? 4 : n <= 24 ? 6 : n <= 40 ? 8 : n <= 60 ? 10 : n <= 96 ? 12 : 14; }''')

# metadata / export
rep('''    icons: list.map(it => ({id:it.id, name:it.name, main:it.main, mod:it.mod, anchor:it.slot, offset:{main:[it.mx, it.my], mod:[it.nx, it.ny]}, slides:it.slides, role:it.role, keywords:it.keywords}))};''',
    '''    version:2, style:{...((man && man.style) || {}), family: pv === "X" ? "accent" : "classic", mode: pv === "X" ? ((man && man.style && man.style.mode) || "A") : pv, ink:style.ink, accent:style.accent},
    icons: list.map(it => ({id:it.id, name:it.name, main:it.main, mod:it.mod, anchor:it.slot, offset:{main:[it.mx, it.my], mod:[it.nx, it.ny]},
      accent:{fill:it.under, marker:it.mstyle, spark:(it.deco || {}).type || "none", ...((it.deco || {}).type && it.deco.type !== "none" ? {spark_pos:[it.deco.x, it.deco.y]} : {}), parts:it.parts || "auto"},
      slides:it.slides, role:it.role, keywords:it.keywords}))};''')
rep('''Setiap ikon adalah gabungan objek + pengubah, digambar ulang dengan gaya Icon Composer (garis 2, celah knockout 2, dua warna).\\n`;''',
    '''Setiap ikon adalah gabungan objek + pengubah, digambar ulang dengan gaya Icon Composer:\\n- aksen/: garis 3,5 ujung bulat, celah knockout 1,25, wadah tinta + bagian aksen, penanda di depan\\n- garis-solid/ dan solid-garis/: garis 2, celah knockout 2, dua warna\\n`;''')
rep('''    style:{modes:Object.fromEntries(MODES.map(m => [m, MODE_INFO[m].label])), grid:48, stroke:style.sw, gap:style.gap, cap:style.cap, colors:{ink:style.ink, accent:style.accent}},''',
    '''    style:{families:{accent:{stroke:STY.X.sw, gap:STY.X.gap, cap:STY.X.cap, fill:FILLS, marker:["line","fill"], spark:SPARKS}, classic:{stroke:STY.C.sw, gap:STY.C.gap, cap:STY.C.cap, modes:{A:MODE_INFO.A.label, B:MODE_INFO.B.label}}}, grid:48, colors:{ink:style.ink, accent:style.accent}},''')
rep('''  if (["exA", "exB", "exSkipBad", "exName"].includes(id)) renderExport();''', '''  if (["exX", "exA", "exB", "exSkipBad", "exName"].includes(id)) renderExport();''')

# clicks
rep('''  if (d.pv){ pv = d.pv; persist(); return showView(view); }''', '''  if (d.pv){ pv = d.pv; persist(); return showView(view); }
  if (d.prole){ const it = curIt(); if (it){ const [i, r] = d.prole.split(":"); useStyle("X"); const info = mainInfo(it.main); it.parts = Object.fromEntries(rolesOf(it, info).map((x, j) => [j, x])); it.parts[i] = r; persist(); renderReview(); } return; }
  if (d.pauto){ const it = curIt(); if (it){ it.parts = null; persist(); renderReview(); } return; }
  if (d.under){ const it = curIt(); if (it){ it.under = d.under; persist(); renderReview(); } return; }
  if (d.mstyle){ const it = curIt(); if (it){ it.mstyle = d.mstyle; persist(); renderReview(); } return; }
  if (d.spark){ const it = curIt(); if (it){ const h = sparkHome(it.slot, d.spark); it.deco = d.spark === "none" ? {type:"none", x:9, y:9, r:0, color:"accent"} : {type:d.spark, x:(it.deco && it.deco.type !== "none") ? it.deco.x : h[0], y:(it.deco && it.deco.type !== "none") ? it.deco.y : h[1], r:0, color:"accent"}; if (d.spark === "none" && layer === "deco") layer = "main"; persist(); renderReview(); } return; }''')
rep('''  if (d.pt){ layer = pickTarget = d.pt; pickQ = "";''', '''  if (d.pt === "deco"){ layer = "deco"; renderBoard(); return renderDetail(); }
  if (d.pt){ layer = pickTarget = d.pt; pickQ = "";''')
rep('''  if (d.nudge){ const it = curIt(); if (it){ const p = layer === "main" ? [it.mx, it.my] : [it.nx, it.ny];''', '''  if (d.nudge){ const it = curIt(); if (it){ const p = posOf(it, layer);''')
rep('''if (layer === "main"){ const sh = it.mod !== "none" ? (SHIFT[it.slot] || [0, 0]) : [0, 0]; it.mx = sh[0]; it.my = sh[1]; } else { it.nx = 0; it.ny = 0; } persist(); renderReview(); } return; }''',
    '''if (layer === "main"){ const sh = it.mod !== "none" ? (SHIFT[it.slot] || [0, 0]) : [0, 0]; it.mx = sh[0]; it.my = sh[1]; } else if (layer === "deco"){ const h = sparkHome(it.slot, it.deco.type); it.deco.x = h[0]; it.deco.y = h[1]; } else { it.nx = 0; it.ny = 0; } persist(); renderReview(); } return; }''')
rep('''  if (id === "dX" || id === "dY"){ const p = layer === "main" ? [it.mx, it.my] : [it.nx, it.ny];''', '''  if (id === "dX" || id === "dY"){ const p = posOf(it, layer);''')

# pointer: drag + click-to-cycle parts
rep('''  layer = pickTarget = t.dataset.layer;
  const r = $("board").getBoundingClientRect(), p = layer === "main" ? [it.mx, it.my] : [it.nx, it.ny];
  drag = {sx:e.clientX, sy:e.clientY, f:48/r.width, x0:p[0], y0:p[1]};''', '''  layer = t.dataset.layer; pickTarget = layer === "deco" ? "main" : layer;
  const r = $("board").getBoundingClientRect(), p = posOf(it, layer);
  drag = {sx:e.clientX, sy:e.clientY, f:48/r.width, x0:p[0], y0:p[1], part:t.dataset.part, moved:false};''')
rep('''$("bOv").addEventListener("pointermove", e => { const it = curIt(); if (!drag || !it) return; setPos(''', '''$("bOv").addEventListener("pointermove", e => { const it = curIt(); if (!drag || !it) return; if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3) return; drag.moved = true; setPos(''')
rep('''["pointerup", "pointercancel"].forEach(ev => $("bOv").addEventListener(ev, () => { if (!drag) return; drag = null; persist(); renderReview(); }));''',
    '''["pointerup", "pointercancel"].forEach(ev => $("bOv").addEventListener(ev, () => {
  if (!drag) return;
  const it = curIt();
  if (ev === "pointerup" && !drag.moved && drag.part != null && pv === "X" && it) cycleRole(it, +drag.part);
  drag = null; persist(); renderReview();
}));''')

# boot: normalise stored items
rep('''      items.forEach(ensureItem); issuesG = validateManifest(); sel = items[0] && items[0].uid;''', '''      items.forEach(ensureItem); items.forEach(it => normAcc(it, null)); issuesG = validateManifest(); sel = items[0] && items[0].uid;''')
open(P, "w").write(t)
print("ok")
