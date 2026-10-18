# Usulan komponen kit: Fase 2b

Tanggal: 2026-10-18 · Status: **menunggu persetujuan Ika** · Prosedur: `docs/design/UI-RULES.md` bagian "Menambah atau mengubah komponen".

Langkah 3–6 Fase 2b butuh empat wilayah layar yang belum punya komponen di kit. Usulan ini menyiapkan komponennya dulu, supaya kode persona tidak membuat kelas atau warna sendiri.

- Prototipe yang bisa dibuka di Chrome: `docs/design/proposals/komponen-fase-2b.html`
- CSS usulan: `docs/design/proposals/komponen-fase-2b.css`

Semua nilai diambil dari sumber artboard di `docs/design/artboards/` (Edit, Builder, dan Tinjau).

## Ringkasan

| # | Komponen | Dipakai di | Kenapa komponen yang ada tidak cukup |
|---|---|---|---|
| 1 | `.ic-artboard`, `.ic-selbox`, `.ic-filmstrip` | Composer · Edit | `.ic-page__card` berukuran tetap 116 px, tanpa grid, dan hanya punya 2 handle hiasan. Edit butuh artboard 520 px bergrid, 8 handle seleksi, dan strip set. |
| 2 | `.ic-slidegrid`, `.ic-slidegroup`, `.ic-iconcard` | Builder · Periksa | `.ic-page` berukuran tetap dan labelnya di atas. Kartu Builder lebarnya cair (4 kolom per slide), id mono di bawah, dan ada cincin merah untuk dobel. |
| 3 | `.ic-sheet`, `.ic-sizetest` | Tinjau · Lembar kontak | Belum ada komponen di atas latar terang. Teks di atas putih butuh warna sendiri, dan sel lembar kontak punya state "dikeluarkan". |
| 4 | `.ic-dropzone`, `.ic-field--area` | Builder · Impor | `.ic-empty` memakai garis `--ic-bg-button`, padahal handoff bagian 7 meminta `--ic-line-5`. `.ic-empty` juga tidak punya state seret. `.ic-field` hanya satu baris, sedangkan tempel JSON butuh banyak baris. |

## Token baru (`tokens.css`)

| Token | Nilai | Kegunaan | Sumber |
|---|---|---|---|
| `--ic-artboard-size` | `520px` | sisi artboard edit | Edit.dc.html |
| `--ic-artboard-cells` | `16` | jumlah sel grid artboard | Edit.dc.html (32,5 px) |
| `--ic-artboard-grid-line` | `#00000010` | garis grid di atas artboard putih | Edit.dc.html |
| `--ic-bg-filmstrip` | `#1F1F1FEE` | latar filmstrip | Edit.dc.html |
| `--ic-h-filmstrip` | `84px` | tinggi filmstrip | Edit.dc.html, handoff 3.2 |
| `--ic-text-on-light-2` | `#5E6068` | nama file di lembar kontak (kontras 6,3:1 di putih) | Tinjau.dc.html |
| `--ic-text-on-light-3` | `#6A6C74` | meta judul lembar kontak (kontras 5,3:1 di putih) | Tinjau.dc.html |
| `--ic-line-on-light` | `#C9C9C9` | garis sel yang dikeluarkan | Tinjau.dc.html |

Token yang sudah ada dipakai ulang: `--ic-select-ring`, `--ic-accent`, `--ic-err`, `--ic-bg-artboard`, `--ic-text-on-light` (juga untuk latar label "dikeluarkan"), `--ic-line-5`, dan `--ic-bg-selected`.

## 1. Artboard edit, kotak seleksi, filmstrip

```html
<div class="ic-artboard-wrap">
  <span class="ic-artboard__label">koper-siap <span class="ic-meta">· 48 × 48</span></span>
  <div class="ic-artboard" data-grid="on">
    <svg class="ic-artboard__art">…hasil engine.compose…</svg>
    <div class="ic-selbox" style="left: 292px; top: 48px; width: 180px; height: 180px">
      <span class="ic-selbox__h" data-at="nw"></span> … 8 handle: nw n ne e se s sw w
    </div>
    <span class="ic-tooltip" style="left: …; top: …">X 35.25  Y 12.75</span>
  </div>
</div>
<div class="ic-filmstrip" role="listbox" aria-label="Ikon dalam set">
  <span class="ic-label">Set</span>
  <button class="ic-filmstrip__item" role="option" aria-selected="true" aria-label="koper-siap">…</button>
</div>
```

- **State:**
  - grid mati: `data-grid="off"` (dikendalikan tombol grid di bilah konteks);
  - item filmstrip aktif: `aria-selected="true"` dengan `--ic-select-ring`.
- **Posisi inline:** posisi dan ukuran `.ic-selbox` serta tooltip adalah geometri hasil mesin dalam piksel artboard, bukan gaya. Karena itu boleh inline, sama seperti `.ic-tooltip` di kit.
- **Handle:** saat ini hanya penanda visual. Seret dan ubah ukuran dikerjakan di langkah 4 dengan pointer event di kanvas.

## 2. Grup slide dan kartu ikon

```html
<div class="ic-slidegrid">
  <div class="ic-slidegroup">
    <div class="ic-slidegroup__head"><span class="ic-slidegroup__no">02</span><span class="ic-slidegroup__title">Riset pasar</span><span class="ic-hsep"></span><span class="ic-meta">4 slot</span></div>
    <div class="ic-cardgrid">
      <button class="ic-iconcard" aria-selected="true">
        <span class="ic-iconcard__art">…svg…<span class="ic-flag" data-level="warn">mirip</span></span>
        <span class="ic-iconcard__id">scan-market</span>
      </button>
    </div>
  </div>
</div>
```

- **Kolom:** `--ic-cols` (bawaan 2 grup, 4 kartu).
- **State:**

| Keadaan | Penanda | Tampilan |
|---|---|---|
| Terpilih | `aria-selected="true"` | cincin biru |
| Dobel | `data-level="err"` | cincin merah 2 px + `.ic-flag[err]` "dobel" |
| Terpilih sekaligus dobel | keduanya | cincin merah di dalam cincin biru |
| Mirip | `.ic-flag[warn]` | lencana saja, tanpa cincin (sesuai artboard) |

- **Tanpa "Kelompokkan per slide":** dipakai satu `.ic-cardgrid` tanpa grup.

## 3. Lembar kontak dan uji 32 px

```html
<div class="ic-sheet" style="--ic-sheet-bg: #FFFFFF; --ic-sheet-icon: 96px" data-names="on">
  <div class="ic-sheet__head"><span class="ic-sheet__title">Travel Set</span><span class="ic-sheet__meta">sticker 1.1.0 · 11 ikon · 128 px</span></div>
  <div class="ic-sheet__grid">
    <button class="ic-sheet__cell" aria-pressed="true"><span class="ic-sheet__badge">dikeluarkan</span>…svg…<span class="ic-sheet__file">koper-siap-sticker.svg</span></button>
  </div>
</div>
<div class="ic-sizetest">
  <div class="ic-sizetest__panel"><span class="ic-label">Uji 32 px di latar terang</span><div class="ic-sizetest__row" style="--ic-sizetest-bg: #ECEBE7">…</div></div>
</div>
```

- **State sel:** sel adalah tombol toggle, mengikuti pola `.ic-tile`.
  - `aria-pressed="true"`: ikut diunduh.
  - `aria-pressed="false"`: dikeluarkan. Tampil dengan opasitas 35%, garis `--ic-line-on-light`, dan label "dikeluarkan".
- **Latar dan ukuran:**
  - `--ic-sheet-bg` dan `--ic-sizetest-bg` adalah warna data pratinjau dari `state/data/preview-backgrounds.js`, bukan warna UI.
  - Ukuran 128/64/32 di bilah konteks mengatur `--ic-sheet-icon`.
- **Nama file:** "Nama file" mati → `data-names="off"`.

## 4. Area drop dan field banyak baris

```html
<div class="ic-dropzone" data-dragover="false">
  <span class="ic-dropzone__title">Seret manifest JSON ke sini</span>
  <span>Atau pilih file dari Claude Design. …</span>
  <div class="ic-dropzone__actions"><label class="ic-btn ic-btn--primary">Pilih file…<input type="file" accept=".json"></label><button class="ic-btn">Muat contoh</button></div>
  <label class="ic-field ic-field--area"><textarea aria-label="Tempel JSON manifest"></textarea></label>
</div>
```

- **State:** `data-dragover="true"` saat file diseret di atas area. Tampilannya garis biru dan latar `--ic-bg-selected`.
- **Input file:** disembunyikan secara visual. Label tombol tetap bisa difokus dan diklik, sama seperti di app sekarang.

## Pertanyaan untuk Ika

1. **Grid artboard edit.** Artboard Edit menggambar 16 sel (satu garis tiap 3 unit kanvas 48), sedangkan DESIGN-HANDOFF 3.2 menulis "grid 8 unit". Usulan ini mengikuti artboard (16 sel). Kalau maksudnya 8 sel (tiap 6 unit), cukup ubah `--ic-artboard-cells` menjadi 8.
2. **Klik sel lembar kontak.** Usulan: satu klik mengeluarkan atau memasukkan ikon, sesuai bilah status artboard. Klik dua kali membuka ikon di Composer · Edit. Setuju?
3. **Tempel JSON di Builder.** TIB lama punya kotak tempel JSON, artboard tidak menampilkannya. Usulan: tetap ada di dalam area drop. Kalau tidak perlu, `.ic-field--area` tidak dibuat.

## Setelah disetujui

1. Token masuk ke `packages/ui/tokens.css` dan kelas ke `packages/ui/components.css`. Komentar "usulan" dibuang.
2. Contoh semua state ditambahkan ke `docs/design/ui-kit.html`, satu bagian per komponen.
3. Satu baris per komponen ditambahkan ke tabel DESIGN-HANDOFF bagian 4. Bagian 3.2, 3.3, 3.4, dan 7 merujuk nama kelasnya.
4. `CHANGELOG.md` dicatat, lalu `npm run lint:ui` dijalankan.
5. File usulan ini ditandai "disetujui" dan dipertahankan sebagai catatan keputusan.
