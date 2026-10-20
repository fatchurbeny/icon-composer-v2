// @ts-check
/**
 * Palet warna data mesin (bukan warna UI). Dari Icon Composer 1.5.1.
 */

/** Pilihan warna aksen (ACC_OPTS IC). */
export const ACCENT_OPTIONS = ["#F05A5A", "#FF7A45", "#FFB547", "#C3DC1E", "#2EB67D", "#3A7BFF", "#8B5CF6", "#F27BA8"];

/** Pilihan warna aksen gaya offset: patokan offset-composer 1.0.1 lalu pilihan IC. */
export const OFFSET_ACCENT_OPTIONS = ["#B8405A", ...ACCENT_OPTIONS];

/** Pilihan warna aksen gaya hand-writing: palet coret-composer 1.0.0 (`ACC`). */
export const HAND_WRITING_ACCENT_OPTIONS = ["#FDBF57", "#7FC4BE", "#F28B82", "#A7C7F2", "#C3A6E8", "#9DCB86"];

/** Pilihan warna tinta gaya hand-writing: palet coret-composer 1.0.0 (`INKS`). */
export const HAND_WRITING_INK_OPTIONS = ["#2B1D2E", "#141414", "#1F2A37", "#3B2418"];

/** Warna garis lapisan (LINE_OPTS IC). `null` = ikuti warna set. */
export const LINE_OPTIONS = [null, "#1A1A1A", "#3A3C44", "#1A73E8", "#E2552D", "#FFFFFF"];

/** Warna isi lapisan (FILL_OPTS IC). `null` = ikuti warna set. */
export const FILL_OPTIONS = [null, "#C3DC1E", "#5BA8FF", "#FFB547", "#F27BA8", "#E4E4DE"];

/** Warna tinta set (garis utama). Diambil dari LINE_OPTIONS tanpa pilihan "ikuti warna set". */
export const INK_OPTIONS = LINE_OPTIONS.filter((c) => c !== null);

/**
 * Palet kurasi siap pakai. Peran: `ink` tinta, `accent` aksen, `fill` isi objek utama, `bg` latar.
 * Latar hanya contoh latar pratinjau dan tidak ikut ke SVG. Tinta, aksen, dan isi = 3 warna,
 * jadi set tetap di bawah batas 5 warna Canva (kecuali lapisan diberi warna sendiri).
 * @type {{id: string, name: string, ink: string, accent: string, fill: string, bg: string}[]}
 */
export const CURATED_PALETTES = [
  { id: "kantor-cerah", name: "Kantor Cerah", ink: "#1A1A1A", accent: "#3A7BFF", fill: "#C3DC1E", bg: "#F4F3EF" },
  { id: "senja-hangat", name: "Senja Hangat", ink: "#3B2A2A", accent: "#E2552D", fill: "#FFB547", bg: "#FFF4E6" },
  { id: "hutan-tenang", name: "Hutan Tenang", ink: "#22313F", accent: "#2EB67D", fill: "#E4E4DE", bg: "#F3F7F2" },
  { id: "laut-dalam", name: "Laut Dalam", ink: "#14213D", accent: "#1A73E8", fill: "#5BA8FF", bg: "#EEF4FB" },
  { id: "permen-manis", name: "Permen Manis", ink: "#3A3C44", accent: "#F27BA8", fill: "#FFD6E5", bg: "#FFF7FA" },
  { id: "sogan", name: "Sogan", ink: "#3D2A1E", accent: "#A0522D", fill: "#E8C9A0", bg: "#FAF3E8" },
  { id: "tropis", name: "Tropis", ink: "#1F2D2B", accent: "#FF7A45", fill: "#2EC4B6", bg: "#FFFBEA" },
  { id: "lavender", name: "Lavender", ink: "#2E2A40", accent: "#8B5CF6", fill: "#C4B5FD", bg: "#F7F5FF" },
  { id: "monokrom", name: "Monokrom", ink: "#1A1A1A", accent: "#3A3C44", fill: "#9A9AA0", bg: "#FFFFFF" },
  { id: "retro-pop", name: "Retro Pop", ink: "#23395B", accent: "#F05A5A", fill: "#FFB547", bg: "#FDF6E3" },
];
