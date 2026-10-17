# Peta konteks proyek dengan graphify

[graphify](https://github.com/Graphify-Labs/graphify) mengubah folder kode dan dokumen menjadi knowledge graph. Kode diurai secara lokal dengan tree-sitter, dan dokumen diproses lewat pass semantik. Hasilnya dipakai agen (Codex) untuk memahami struktur repo tanpa membaca ulang semua file.

## 1. Instalasi (sekali, di Mac)

```bash
uv tool install graphifyy          # atau: pipx install graphifyy
graphify install --project --platform codex
graphify hook install              # rebuild otomatis saat commit/checkout
```

Nama paket di PyPI adalah `graphifyy` (dengan dua huruf y).

`graphify install --project --platform codex` memasang instruksi graphify ke konfigurasi proyek untuk Codex. **Periksa `git diff` setelahnya.** Kalau perintah itu mengubah `AGENTS.md`, pastikan aturan di bagian 1–6 `AGENTS.md` tetap utuh, dan tambahan graphify berada di bagian terpisah di akhir file.

## 2. Membangun dan memperbarui graf

Di Codex, perintahnya diawali `$`. Di Claude Code, diawali `/`.

```
$graphify .                 # pemetaan pertama
$graphify . --update        # setelah perubahan struktur (modul baru, fungsi dipindah)
$graphify . --no-viz        # tanpa graph.html, lebih cepat
```

Setelah `git pull`, jalankan `graphify update .` di terminal.

Hasil di `graphify-out/` **di-commit** ke git:

| File | Isi |
|---|---|
| `GRAPH_REPORT.md` | konsep kunci, koneksi tak terduga, pertanyaan yang disarankan. **Agen membacanya di awal setiap tugas.** |
| `graph.json` | graf lengkap, bisa di-query tanpa membaca ulang file |
| `graph.html` | graf interaktif untuk dibuka pemilik di browser |

`graphify hook install` juga memasang merge driver, supaya `graph.json` digabung otomatis saat merge dan tidak meninggalkan konflik.

## 3. Yang dipetakan dan yang tidak

**Dipetakan:**
- `packages/` (mesin, repetisi, ekspor: inti pengetahuan proyek)
- `apps/*/src/`
- `docs/` (kontrak, spesifikasi mesin, keputusan)
- `scripts/`
- `AGENTS.md`, `README.md`

**Tidak dipetakan** (lewat `.graphifyignore`):
- `legacy/`: HTML monolit 270 KB – 2 MB dengan data ikon tertanam. Isinya membuat graf bising, dan perilakunya sudah dijelaskan di `docs/engines/*.md` dan `docs/legacy/INVENTORY.md`.
- `dist/`, `releases/`: hasil build.
- `tests/fixtures/vendor/`, `**/*.min.js`, `**/fill-shapes.json`, `**/icon-data*.json`: data pustaka pihak ketiga.
- `node_modules/`, `graphify-out/`.

graphify juga menghormati `.gitignore`.

## 4. Cara agen memakai graf

1. **Awal tugas:** baca `graphify-out/GRAPH_REPORT.md`.
2. **Mencari letak sesuatu:** gunakan query, bukan grep seluruh repo.
   ```bash
   graphify query "di mana knockout pengubah dihitung untuk sticker?"
   graphify path "planVariations" "composeSticker"
   graphify explain "signature"
   ```
   Kode keluar: `0` ada jawaban, `3` nama ambigu, `4` simpul tidak ditemukan.
3. **Tingkat kepercayaan sisi graf:**
   - `EXTRACTED` (dari AST): boleh dipercaya.
   - `INFERRED` dan `AMBIGUOUS` (dari pass semantik): anggap petunjuk, lalu verifikasi dengan membaca file.
4. **Akhir tugas:** kalau ada modul atau fungsi publik yang ditambah, dipindah, atau dihapus, jalankan `$graphify . --update` dan commit `graphify-out/` bersama perubahan kode.

## 5. Konvensi kode agar graf mudah dibaca

- Satu mesin = satu folder `packages/engines/<id>/`, dengan fungsi bernama seragam: `compose<Id>`, `axes<Id>`, `signature<Id>`, `adapt<Id>`.
- Setiap file `packages/` diawali JSDoc `@module` yang menyebut lapisannya (`core`, `icon-sources`, `engines`, `repetition`, `export`).
- Dokumen di `docs/` menyebut nama fungsi persis seperti di kode (dalam backtick), supaya graphify bisa menghubungkan dokumen dengan kode.
- Hindari ekspor default anonim. Selalu pakai ekspor bernama.

## 6. Hubungan dengan Project claude.ai

Project "Icon-Creator" di claude.ai berisi ringkasan untuk percakapan (misalnya `PROJECT-KNOWLEDGE.md`). Sumber kebenaran teknis tetap di repo ini (`docs/` + `graphify-out/`). Setiap rilis, ringkasan di Project diperbarui dari `docs/` (Fase 7 di `MIGRATION-PLAN.md`).
