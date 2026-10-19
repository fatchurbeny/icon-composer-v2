// @ts-check
/**
 * Palet warna data mesin (bukan warna UI). Dari Icon Composer 1.5.1.
 */

/** Pilihan warna aksen (ACC_OPTS IC). */
export const ACCENT_OPTIONS = ["#F05A5A", "#FF7A45", "#FFB547", "#C3DC1E", "#2EB67D", "#3A7BFF", "#8B5CF6", "#F27BA8"];

/** Pilihan warna aksen gaya offset: patokan offset-composer 1.0.1 lalu pilihan IC. */
export const OFFSET_ACCENT_OPTIONS = ["#B8405A", ...ACCENT_OPTIONS];

/** Warna garis lapisan (LINE_OPTS IC). `null` = ikuti warna set. */
export const LINE_OPTIONS = [null, "#1A1A1A", "#3A3C44", "#1A73E8", "#E2552D", "#FFFFFF"];

/** Warna isi lapisan (FILL_OPTS IC). `null` = ikuti warna set. */
export const FILL_OPTIONS = [null, "#C3DC1E", "#5BA8FF", "#FFB547", "#F27BA8", "#E4E4DE"];
