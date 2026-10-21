// @ts-check
/**
 * Isi rich tooltip (`.ic-tip`) untuk tool rail, per nama tool. Gestur ditulis dengan kata kerja tebal
 * (`**Seret**`), seperti petunjuk bilah status. Isi harus sesuai perilaku yang benar-benar ada.
 */
import { esc } from "./ui.js";

/** Pintasan tool (huruf tunggal, tanpa pengubah), seperti Affinity. */
export const TOOL_KEYS = /** @type {Record<string, string>} */ ({ select: "V", hand: "H", zoom: "Z", magnifier: "Z" });

/** @type {Record<string, {title: string, desc: string, gestures: string[]}>} */
export const TOOL_TIPS = {
  select: {
    title: "Pilih",
    desc: "Memilih halaman, kartu ikon, sel matriks, atau lapisan.",
    gestures: ["**Klik** untuk memilih.", "**Klik dua kali** halaman untuk mengedit ikon.", "**Alt** + **Panah** mengubah urutan set."],
  },
  move: {
    title: "Geser lapisan",
    desc: "Memindah lapisan ikon di mode Edit.",
    gestures: ["**Seret** lapisan di artboard.", "**Panah** menggeser 0,5 unit, **Shift** + **Panah** 2 unit.", "**Delete** melepas pengubah atau dekorasi."],
  },
  "add-main": {
    title: "Objek utama",
    desc: "Membuka Pustaka untuk mengganti objek utama ikon terpilih.",
    gestures: ["**Klik** tool, lalu **klik** ikon di Pustaka.", "Belum ada ikon terpilih: ikon baru dibuat."],
  },
  "add-mod": {
    title: "Pengubah",
    desc: "Membuka Pustaka untuk mengganti pengubah ikon terpilih.",
    gestures: ["**Klik** tool, lalu **klik** ikon di Pustaka.", "Posisi pengubah mengikuti slot bawaannya."],
  },
  deco: {
    title: "Dekorasi",
    desc: "Membuka pengaturan dekorasi atau kilau ikon terpilih.",
    gestures: ["**Klik** tool untuk memilih lapisan dekorasi.", "Jenis dan rotasi diatur di panel Transform atau Ikon."],
  },
  combine: {
    title: "Kombinasi massal",
    desc: "Membuka matriks Kombinasi dari pool set ini.",
    gestures: ["**Klik** tool untuk pindah ke persona Kombinasi."],
  },
  eyedropper: {
    title: "Ambil warna",
    desc: "Mengambil warna dari ikon untuk dipakai sebagai warna lapisan.",
    gestures: ["Belum aktif di versi ini. Atur warna lewat panel Warna."],
  },
  swap: {
    title: "Ganti objek",
    desc: "Membuka Pustaka untuk mengganti objek utama ikon terpilih.",
    gestures: ["**Klik** tool, lalu **klik** ikon di Pustaka."],
  },
  tag: {
    title: "Kata kunci",
    desc: "Membuka detail ikon: id, nama, dan kata kunci.",
    gestures: ["**Klik** tool untuk membuka tab Ikon."],
  },
  magnifier: {
    title: "Perbesar ikon",
    desc: "Memperbesar lembar kontak untuk memeriksa detail.",
    gestures: ["**Klik** untuk memperbesar di titik itu.", "**Alt** + **Klik** untuk memperkecil.", "**⌘** + **Roda** juga memperbesar."],
  },
  compare: {
    title: "Bandingkan",
    desc: "Berganti antara SVG asli dan hasil direct fill untuk Canva.",
    gestures: ["**Klik** tool untuk berganti tampilan."],
  },
  hand: {
    title: "Geser tampilan",
    desc: "Menggeser kanvas tanpa mengubah isi.",
    gestures: ["**Seret** untuk menggeser kanvas.", "**Spasi** + **Seret** dari tool lain.", "**Tombol tengah** + **Seret** juga menggeser."],
  },
  zoom: {
    title: "Perbesar",
    desc: "Memperbesar atau memperkecil kanvas.",
    gestures: ["**Klik** untuk memperbesar di titik itu.", "**Alt** + **Klik** untuk memperkecil.", "**⌘** + **Roda** atau **pinch** untuk zoom halus.", "**⌘ 0** sesuaikan layar, **⌘ 1** 100%."],
  },
};

/** @param {string} tool */
export const tipId = (tool) => `tip-tool-${tool}`;

/** `**teks**` menjadi <b>teks</b>, sisanya di-escape. @param {string} s */
const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

/**
 * Markup `.ic-tip` untuk satu tool (tersembunyi; ditampilkan components.js).
 * @param {string} tool
 * @param {string} [fallbackTitle]
 */
export function toolTipMarkup(tool, fallbackTitle = "") {
  const t = TOOL_TIPS[tool];
  if (!t) return "";
  const key = TOOL_KEYS[tool];
  return `<div class="ic-tip" role="tooltip" id="${tipId(tool)}" hidden><div class="ic-tip__head">${esc(t.title || fallbackTitle)}${key ? `<span class="ic-tip__key">${key}</span>` : ""}</div><p class="ic-tip__desc">${esc(t.desc)}</p>${t.gestures.length ? `<ul class="ic-tip__list">${t.gestures.map((g) => `<li>${bold(g)}</li>`).join("")}</ul>` : ""}</div>`;
}
