# Aturan UI untuk agen (wajib dipatuhi)

Aturan ini membuat UI tetap konsisten walau ditulis oleh banyak sesi LLM. Pelanggaran yang bisa dideteksi mesin ditangkap `npm run lint:ui` (`scripts/lint-ui.mjs`). Sisanya dicek saat review.

## Selalu

1. **Pakai komponen dari kit.** Sebelum menulis UI, cari komponennya di `docs/design/ui-kit.html` dan tabel bagian 4 di `DESIGN-HANDOFF.md`. Salin struktur HTML-nya persis, termasuk atribut ARIA dan `data-ic`.
2. **Pakai token.** Warna, ukuran huruf, tinggi kontrol, radius, dan spasi diambil dari `var(--ic-…)` di `packages/ui/tokens.css`.
3. **State lewat ARIA.** Pilihan: `aria-pressed`. Tab dan baris: `aria-selected`. Persona: `aria-current="page"`. Langkah: `aria-current="step"`. Dropdown dan panel: `aria-expanded`. Toggle: `aria-checked`.
4. **Perilaku lewat `data-ic`.** Tab, segmented, dropdown, slider, angka, toggle, dan lipat panel diaktifkan `components.js`. Dengarkan event `ic-change`, jangan memasang handler klik sendiri untuk perilaku yang sudah ada.
5. **Ikon UI lewat `uiIcon()` / `<i data-icon>`.** Ukuran 13, 16, atau 20.
6. **Teks Indonesia** sesuai `DESIGN-HANDOFF.md` bagian 6 dan `docs/GLOSSARY.md`.
7. **Elemen asli.** `<button type="button">` untuk aksi, `<a href>` untuk navigasi, `<input>` + `<label>` untuk isian.

## Dilarang

1. Menulis warna literal (`#hex`, `rgb()`, `hsl()`, nama warna) di luar `packages/ui/tokens.css`. Pengecualian: warna **data** mesin (palet isi ikon) yang berasal dari `packages/engines`.
2. Membuat kelas baru berprefiks `ic-` di luar `packages/ui/components.css`.
3. Memakai kelas state `.on`, `.active`, `.selected`, `.is-*`.
4. Menulis `font-family`, `font-size` angka, atau `border-radius` angka di CSS aplikasi. Pakai token.
5. Menggambar ikon UI dengan tangan, memakai emoji sebagai ikon, atau memuat set ikon lain.
6. Memakai framework UI, library komponen, atau CSS utility (Tailwind dan sejenisnya).
7. Menambah warna persona di luar empat titik yang diizinkan (pill aktif, titik logo, nomor langkah aktif, garis `.ic-actionbtn--persona`).
8. `outline: none` tanpa `box-shadow: var(--ic-focus)`.
9. Tombol ikon atau tool tanpa `aria-label`.

## Pengecualian

- Warna data mesin dan pratinjau (palet ikon, latar lembar kontak) ditulis di file `…/data/…` dan dikecualikan dari aturan warna literal.
- Template file ekspor di `apps/icon-studio/src/state/data/export/` (mis. `resource-page.html` di ZIP Builder) bukan UI: font dan ukuran hurufnya bagian dari keluaran yang dijaga golden, jadi dikecualikan dari aturan font dan ukuran huruf literal.

## Menambah atau mengubah komponen

Komponen baru hanya boleh dibuat kalau tidak ada komponen kit yang cocok. Langkahnya:

1. Tulis usulan singkat di PR: nama, kegunaan, kenapa komponen yang ada tidak cukup.
2. Tambah CSS di `packages/ui/components.css` (hanya token), perilaku di `components.js` bila perlu, lalu contoh semua state di `docs/design/ui-kit.html`.
3. Tambah baris di tabel komponen `DESIGN-HANDOFF.md` bagian 4.
4. Kalau butuh nilai baru, tambah token dulu di `tokens.css` dengan komentar kegunaannya. Jangan memakai nilai literal "sementara".
5. Catat di `CHANGELOG.md`.

## Checklist sebelum menyatakan UI selesai

- [ ] `npm run lint:ui` lulus.
- [ ] Layar dibandingkan dengan artboard di Claude Design dan contoh di `ui-kit.html`.
- [ ] Semua kontrol bisa dipakai dengan keyboard.
- [ ] Tidak ada teks Inggris yang tidak perlu.
- [ ] Tidak ada kelas, warna, atau ikon baru di luar `packages/ui`.
