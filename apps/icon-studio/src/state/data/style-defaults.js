// @ts-check
/**
 * Warna dan patokan gaya bawaan (data mesin, bukan warna UI; lihat UI-RULES "Dilarang" butir 1).
 * Dipindah apa adanya dari Icon Composer 1.5.1 dan Template Icon Builder 1.6.0.
 */

/** Gaya set Composer bawaan. */
export const DEFAULT_SET_STYLE = {family:"classic", ink:"#1A1A1A", accent:"#C3DC1E", sw:2, gap:2, cap:"butt", join:"miter", pref:"A",
  colors:{main:{line:null, fill:null}, mod:{line:null, fill:null}, deco:{line:null, fill:null}},
  scale:{main:84, mod:100, deco:100},
  fx:{mode:"none", color:"#FFF0B8", dx:1.5, dy:1.5}};

/** Patokan bawaan tiap keluarga gaya (sama di IC dan TIB). */
export const FAMILY_DEFAULT = {
  classic:{sw:2, gap:2, cap:"butt", join:"miter", accent:"#C3DC1E", scale:{main:84, mod:100, deco:100}},
  accent:{sw:3.5, gap:1.25, cap:"round", join:"round", accent:"#F05A5A", scale:{main:88, mod:80, deco:100}}
};


/** Gaya Builder: patokan Icon Composer (garis 2, celah 2, ujung rata, tinta + aksen). */
export function defaultManifestStyle(){
  return {ink:"#1A1A1A", accent:"#C3DC1E", sw:2, gap:2, cap:"butt", join:"miter", pref:"A",
    colors:{main:{line:null, fill:null}, mod:{line:null, fill:null}, deco:{line:null, fill:null}},
    scale:{main:84, mod:100, deco:100}, fx:{mode:"none"}};
}

/** Nilai bawaan item offset-composer 1.0.1 (`DEF`), dipakai saat impor untuk field yang hilang. */
export const OFFSET_COMPOSER_DEFAULT = {mode:"solid", acc:"#B8405A", ink:"#1A1A1A", dx:4, dy:4, sw:2.6, size:72, dTick:true, tickPos:"TR", dGround:true, dCloud:false, dGrass:false};
