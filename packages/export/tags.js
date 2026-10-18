// @ts-check
/**
 * @module export/tags
 * Tag pustaka (Lucide, Tabler) untuk kata kunci metadata, judul Title Case, dan terjemahan EN → ID.
 * Dipindah apa adanya dari Icon Composer 1.5.1 dan Template Icon Builder 1.6.0 (identik).
 */
import { SOURCE_URLS } from "@icon-studio/icon-sources";
import { ID_EN } from "@icon-studio/icon-sources/catalog";

/** Kata sambung yang tetap huruf kecil di Title Case. */
export const SMALL = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "for",
  "to",
  "in",
  "on",
  "at",
  "by",
  "with",
  "vs",
]);

/** @param {unknown} s */
export function titleCase(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && SMALL.has(w.toLowerCase())
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

/** Kamus EN → ID untuk kata kunci: kebalikan sebagian ID_EN ditambah kosakata umum ikon. */
export const EN_ID = (() => {
  /** @type {Record<string, string>} */
  const d = {};
  for (const [id, en] of Object.entries(ID_EN)) if (!d[en]) d[en] = id;
  return Object.assign(d, {
    plus: "tambah",
    add: "tambah",
    minus: "kurang",
    check: "centang",
    done: "selesai",
    x: "silang",
    close: "tutup",
    star: "bintang",
    favorite: "favorit",
    search: "cari",
    find: "temukan",
    clock: "jam",
    time: "waktu",
    timer: "pengatur waktu",
    hourglass: "jam pasir",
    bell: "lonceng",
    notification: "notifikasi",
    alert: "peringatan",
    lock: "gembok",
    security: "keamanan",
    secure: "aman",
    shield: "perisai",
    protection: "perlindungan",
    heart: "hati",
    love: "cinta",
    like: "suka",
    pencil: "pensil",
    edit: "sunting",
    write: "tulis",
    settings: "pengaturan",
    cloud: "awan",
    share: "bagikan",
    download: "unduh",
    upload: "unggah",
    refresh: "muat ulang",
    info: "informasi",
    sparkles: "kilau",
    magic: "ajaib",
    zap: "kilat",
    energy: "energi",
    eye: "mata",
    view: "lihat",
    flag: "bendera",
    goal: "tujuan",
    bookmark: "penanda",
    link: "tautan",
    user: "pengguna",
    users: "pengguna",
    person: "orang",
    people: "orang",
    team: "tim",
    group: "grup",
    message: "pesan",
    chat: "obrolan",
    comment: "komentar",
    gift: "hadiah",
    trophy: "piala",
    award: "penghargaan",
    target: "target",
    rocket: "roket",
    launch: "peluncuran",
    lightbulb: "bola lampu",
    idea: "ide",
    creative: "kreatif",
    calendar: "kalender",
    schedule: "jadwal",
    date: "tanggal",
    event: "acara",
    money: "uang",
    payment: "pembayaran",
    tag: "label",
    location: "lokasi",
    map: "peta",
    send: "kirim",
    mail: "surat",
    email: "email",
    file: "berkas",
    document: "dokumen",
    paper: "kertas",
    box: "kotak",
    package: "paket",
    cart: "troli",
    shopping: "belanja",
    home: "rumah",
    house: "rumah",
    phone: "telepon",
    book: "buku",
    read: "baca",
    learning: "belajar",
    education: "pendidikan",
    school: "sekolah",
    teacher: "guru",
    student: "siswa",
    presentation: "presentasi",
    meeting: "rapat",
    workshop: "lokakarya",
    work: "kerja",
    office: "kantor",
    tool: "alat",
    tools: "peralatan",
    build: "membangun",
    hammer: "palu",
    coffee: "kopi",
    break: "istirahat",
    sun: "matahari",
    morning: "pagi",
    leaf: "daun",
    nature: "alam",
    music: "musik",
    thumbs: "jempol",
    feedback: "umpan balik",
    rating: "penilaian",
    list: "daftar",
    task: "tugas",
    note: "catatan",
    sticky: "tempel",
    wall: "dinding",
    table: "meja",
    chair: "kursi",
    door: "pintu",
    welcome: "selamat datang",
    hand: "tangan",
    wave: "lambaian",
    cut: "potong",
    scissors: "gunting",
    tape: "selotip",
    print: "cetak",
    printer: "printer",
    outline: "garis",
    icon: "ikon",
    line: "garis",
    filled: "solid",
    solid: "solid",
    glyph: "glif",
  });
})();

/** @param {string} w */
export function trID(w) {
  if (EN_ID[w]) return EN_ID[w];
  const parts = w.split(/[\s-]+/);
  const tr = parts.map((p) => EN_ID[p]);
  return tr.every(Boolean) ? tr.join(" ") : null;
}

const STOP = new Set([
  "logo",
  "brand",
  "social",
  "emoji",
  "overview",
  "projects",
  "ui",
  "app",
  "web3",
  "crypto",
  "nft",
]);

/**
 * Indeks tag pustaka, dimuat sekali dari CDN versi terkunci.
 * @param {{fetch?: typeof fetch}} [options]
 */
export function createTagIndex(options = {}) {
  const fetchFn = options.fetch || ((url) => fetch(url));
  /** @type {Record<string, string[]> | null} */
  let LU_TAGS = null;
  /** @type {Record<string, string[]> | null} */
  let TB_TAGS = null;

  async function loadTags() {
    const get = (/** @type {string} */ u) =>
      fetchFn(u)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    if (!LU_TAGS) LU_TAGS = (await get(SOURCE_URLS.lucideTags)) || {};
    if (!TB_TAGS) {
      const j = await get(SOURCE_URLS.tablerMeta);
      TB_TAGS = {};
      if (j)
        for (const [k, v] of Object.entries(j))
          if (v && v.category !== "Brand") TB_TAGS[k] = v.tags || [];
    }
  }

  /**
   * Kata dari nama ikon ditambah tag pustaka, tanpa kata merek dan kata umum.
   * @param {string} n nama ikon di pustaka (hasil libName)
   */
  function tagsOf(n) {
    const base = n.replace(/-\d+$/, "");
    const t = [
      ...((LU_TAGS && LU_TAGS[n]) || []),
      ...((TB_TAGS && TB_TAGS[n]) || []),
      ...((TB_TAGS && TB_TAGS[base]) || []),
    ];
    return [
      ...new Set([
        ...base.split("-").filter((w) => w.length > 1 && !/^\d+$/.test(w)),
        ...t.map((x) => String(x).toLowerCase()),
      ]),
    ].filter((w) => !STOP.has(w));
  }

  return { loadTags, tagsOf };
}
