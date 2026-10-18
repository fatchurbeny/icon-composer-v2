// @ts-check
/**
 * @module engines/classic/data
 * Data bawaan mesin classic: objek utama, preferensi mode, pengubah, slot, dan dekorasi.
 * Dipindah apa adanya dari Icon Composer 1.5.1 dan Template Icon Builder 1.6.0 (identik),
 * kecuali dekorasi bintang (`star4`, `star4x2`) yang hanya ada di Icon Composer.
 */

/**
 * Membuat salinan data classic yang boleh diubah app (ikon pustaka ditambahkan ke MAINS/MODS).
 * @param {{starDecos?: boolean}} [options] starDecos: sertakan dekorasi bintang (Icon Composer)
 */
export function createClassicData(options = {}) {
  /* Mains: 48-unit grid. b = outer body (closed; stroked in outline mode, filled in solid mode), s = details (always ink). "INK" = solid ink fill. */
  const MAINS = {
    face: {
      n: "Wajah",
      b: `<circle cx="24" cy="26" r="15"/>`,
      s: `<path d="M24 11V6.5"/><circle cx="19.5" cy="24" r="1.4" fill="INK" stroke="none"/><circle cx="28.5" cy="24" r="1.4" fill="INK" stroke="none"/><path d="M22.5 30H25.5"/>`,
    },
    doc: {
      n: "Dokumen",
      b: `<path d="M12 5H30L38 13V43H12Z"/>`,
      s: `<path d="M30 5V13H38"/><path d="M18 21H32M18 27H32M18 33H26"/>`,
    },
    clock: {
      n: "Jam",
      b: `<circle cx="24" cy="24" r="16"/>`,
      s: `<path d="M24 14V24H31"/>`,
    },
    bell: {
      n: "Lonceng",
      b: `<path d="M13 34V22A11 11 0 0 1 35 22V34Z"/>`,
      s: `<path d="M8 34H40"/><path d="M24 7V11"/><path d="M20.5 38.5A3.5 3.5 0 0 0 27.5 38.5"/>`,
    },
    cart: {
      n: "Troli",
      b: `<path d="M12.5 16H40.5L36.5 32H15.5Z"/>`,
      s: `<path d="M5 9H10.5L15.5 32"/><circle cx="18.5" cy="39" r="2.5"/><circle cx="33.5" cy="39" r="2.5"/>`,
    },
    box: {
      n: "Kotak",
      b: `<path d="M8 18H32V41H8Z"/>`,
      s: `<path d="M8 18L14 11H38L32 18"/><path d="M38 11V34L32 41"/><path d="M17 11L11 18"/><path d="M20 23V27"/>`,
    },
    truck: {
      n: "Truk",
      b: `<path d="M21 33H5V24L10 17H21Z"/>`,
      s: `<path d="M5 33H43"/><circle cx="12" cy="37" r="3.5"/><circle cx="34" cy="37" r="3.5"/><path d="M10 22V25H16"/>`,
    },
    door: {
      n: "Pintu",
      b: `<path d="M13 42V6H35V42Z"/>`,
      s: `<path d="M6 42H42"/><path d="M18 22V26"/>`,
    },
    heart: {
      n: "Hati",
      b: `<path d="M24 40L9.5 25.5A8.2 8.2 0 0 1 24 15.2A8.2 8.2 0 0 1 38.5 25.5Z"/>`,
      s: ``,
    },
    ticket: {
      n: "Tiket",
      b: `<path d="M5 13H43V20A4 4 0 0 0 43 28V35H5V28A4 4 0 0 0 5 20Z"/>`,
      s: `<path d="M31 16V32" stroke-dasharray="2.5 2.5"/>`,
    },
    laptop: {
      n: "Laptop",
      b: `<path d="M10 11H38V31H10Z"/>`,
      s: `<path d="M4 36H44"/><path d="M21 36V34H27V36"/>`,
    },
    chat: {
      n: "Obrolan",
      b: `<path d="M7 9H41V33H23L15 40V33H7Z"/>`,
      s: `<path d="M15 18H33M15 24H27"/>`,
    },
    home: {
      n: "Rumah",
      b: `<path d="M11 41V19L24 8.5L37 19V41Z"/>`,
      s: `<path d="M7 22L24 8L41 22"/><path d="M20 41V31H28V41"/>`,
    },
    pot: {
      n: "Panci",
      b: `<path d="M9 22H39V34A6 6 0 0 1 33 40H15A6 6 0 0 1 9 34Z"/>`,
      s: `<path d="M9 26H4V31H9M39 26H44V31H39"/><path d="M6 22H42"/>`,
    },
    book: {
      n: "Buku",
      b: `<path d="M10 6H34V42H10Z"/>`,
      s: `<path d="M15 6V42"/><path d="M20 14H29M20 19H29M20 24H25"/>`,
    },
    pin: {
      n: "Lokasi",
      b: `<path d="M24 42S11 29.5 11 20A13 13 0 0 1 37 20C37 29.5 24 42 24 42Z"/>`,
      s: `<circle cx="24" cy="20" r="4.5"/>`,
    },
    user: {
      n: "Pengguna",
      b: `<circle cx="24" cy="16" r="8"/><path d="M8 41A16 16 0 0 1 40 41Z"/>`,
      s: ``,
    },
    calendar: {
      n: "Kalender",
      b: `<path d="M7 11H41V41H7Z"/>`,
      s: `<path d="M7 19H41"/><path d="M15 6V14M33 6V14"/><path d="M14 27H18M22 27H26M30 27H34M14 34H18M22 34H26"/>`,
    },
    phone: {
      n: "Ponsel",
      b: `<path d="M14 4H34V44H14Z"/>`,
      s: `<path d="M14 10H34M14 37H34"/><path d="M22.5 40.5H25.5"/>`,
    },
    store: {
      n: "Toko",
      b: `<path d="M9 17V41H39V17Z"/><path d="M6 17L10 7H38L42 17Z"/>`,
      s: `<path d="M19 41V29H29V41"/>`,
    },
  };
  /* Color modes: which layer is outline, which is solid. */
  const PREFS = {
    A: { main: "outline", mod: "solid", label: "Utama garis · pengubah solid" },
    B: { main: "solid", mod: "outline", label: "Utama solid · pengubah garis" },
    C: { main: "outline", mod: "outline", label: "Keduanya garis" },
  };
  /* Modifiers: local coords, sil = solid silhouette (accent, also knockout), det = ink details on top. */
  const MODS = {
    bubble: {
      n: "Obrolan",
      w: 24,
      h: 20,
      slot: "BL",
      sil: `<path d="M1.5 0H22.5A1.5 1.5 0 0 1 24 1.5V13.5A1.5 1.5 0 0 1 22.5 15H8L3 20V15H1.5A1.5 1.5 0 0 1 0 13.5V1.5A1.5 1.5 0 0 1 1.5 0Z"/>`,
      det: `<circle cx="7.5" cy="7.5" r="1.25" fill="INK" stroke="none"/><circle cx="12" cy="7.5" r="1.25" fill="INK" stroke="none"/><circle cx="16.5" cy="7.5" r="1.25" fill="INK" stroke="none"/>`,
    },
    card: {
      n: "Kartu",
      w: 24,
      h: 16,
      slot: "BL",
      sil: `<rect width="24" height="16" rx="1.2"/>`,
      det: `<rect y="4" width="24" height="3" fill="INK" stroke="none"/><path d="M14 11.5H19.5"/>`,
    },
    doc: {
      n: "Dokumen",
      w: 18,
      h: 22,
      slot: "BL",
      sil: `<path d="M0 0H12L18 6V22H0Z"/>`,
      det: `<path d="M12 0V6H18"/><path d="M4 13H12M4 17H9"/>`,
    },
    lock: {
      n: "Gembok",
      w: 18,
      h: 21,
      slot: "BL",
      sil: `<rect y="8.5" width="18" height="12.5" rx="1"/>`,
      det: `<path d="M4 8.5V5.5A5 5 0 0 1 14 5.5V8.5"/><circle cx="9" cy="13.5" r="1.7" fill="INK" stroke="none"/><rect x="8.25" y="14" width="1.5" height="3.5" fill="INK" stroke="none"/>`,
    },
    mail: {
      n: "Amplop",
      w: 24,
      h: 16,
      slot: "BL",
      sil: `<rect width="24" height="16" rx="0.8"/>`,
      det: `<path d="M0.5 0.5L12 9L23.5 0.5"/>`,
    },
    plus: {
      n: "Plus",
      w: 14,
      h: 14,
      slot: "TR",
      sil: `<circle cx="7" cy="7" r="7"/>`,
      det: `<path d="M7 3.5V10.5M3.5 7H10.5"/>`,
    },
    check: {
      n: "Centang",
      w: 14,
      h: 14,
      slot: "TR",
      sil: `<circle cx="7" cy="7" r="7"/>`,
      det: `<path d="M3.8 7.2L6.1 9.5L10.3 4.9"/>`,
    },
    cross: {
      n: "Silang",
      w: 14,
      h: 14,
      slot: "TR",
      sil: `<circle cx="7" cy="7" r="7"/>`,
      det: `<path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"/>`,
    },
    parcel: {
      n: "Paket",
      w: 20,
      h: 16,
      slot: "BR",
      sil: `<rect width="20" height="16" rx="0.6"/>`,
      det: `<rect x="8.5" width="3" height="5" fill="INK" stroke="none"/>`,
    },
    pinm: {
      n: "Pin",
      w: 14,
      h: 20,
      slot: "BL",
      sil: `<path d="M7 20S0 12.5 0 7A7 7 0 0 1 14 7C14 12.5 7 20 7 20Z"/>`,
      det: `<circle cx="7" cy="7" r="2.1" fill="INK" stroke="none"/>`,
    },
    pencil: {
      n: "Pensil",
      w: 20,
      h: 20,
      slot: "BR",
      sil: `<path d="M2 14L14 2L18 6L6 18H2Z"/>`,
      det: `<path d="M2 18V15L5 18Z" fill="INK" stroke="none"/><path d="M11.5 4.5L15.5 8.5"/>`,
    },
    cone: {
      n: "Kerucut",
      w: 20,
      h: 21,
      slot: "BL",
      sil: `<path d="M7 0H13L18 18H20V21H0V18H2Z"/>`,
      det: `<path d="M4.6 9.5H15.4M3.2 14.5H16.8"/>`,
    },
    clockm: {
      n: "Jam",
      w: 16,
      h: 16,
      slot: "BL",
      sil: `<circle cx="8" cy="8" r="8"/>`,
      det: `<path d="M7 3.8V9H11.2"/>`,
    },
    star: {
      n: "Bintang",
      w: 18,
      h: 17,
      slot: "TR",
      sil: `<path d="M9 0L11.6 5.6L17.6 6.3L13.2 10.5L14.3 16.5L9 13.6L3.7 16.5L4.8 10.5L0.4 6.3L6.4 5.6Z"/>`,
      det: ``,
    },
    heartm: {
      n: "Hati",
      w: 18,
      h: 16,
      slot: "BL",
      sil: `<path d="M9 16L1.6 8.6A4.6 4.6 0 0 1 9 3.2A4.6 4.6 0 0 1 16.4 8.6Z"/>`,
      det: ``,
    },
    bulb: {
      n: "Lampu",
      w: 16,
      h: 21,
      slot: "TR",
      sil: `<path d="M8 0A8 8 0 0 1 12.5 14.6V16H3.5V14.6A8 8 0 0 1 8 0Z"/>`,
      det: `<path d="M4.5 19H11.5"/><path d="M6.2 10L8 7.5L9.8 10V16"/>`,
    },
  };

  const SLOT_GLYPH = {
    TL: "↖",
    TC: "↑",
    TR: "↗",
    ML: "←",
    C: "·",
    MR: "→",
    BL: "↙",
    BC: "↓",
    BR: "↘",
  };
  const SHIFT = {
    TL: [3, 3],
    TC: [0, 3],
    TR: [-3, 3],
    ML: [3, 0],
    MR: [-3, 0],
    BL: [3, -3],
    BC: [0, -3],
    BR: [-3, -3],
  };

  const DECOS = {
    speed: { n: "Gerak", d: "M-3 -2.4H3M-1.5 2.4H3", home: [4.5, 34] },
    spark: {
      n: "Percikan",
      dots: true,
      d: "M0 -3.4V-2.6M-2.6 1.2V2M2.6 1.2V2",
      home: [9, 8],
    },
    base: { n: "Dasar", d: "M-6 0H-1.5M0.8 0H6", home: [10, 46] },
    burst: {
      n: "Sinar",
      d: "M0 -3.5V-1M-3.6 -2.2L-2 -0.8M3.6 -2.2L2 -0.8",
      home: [24, 4],
    },
  };
  if (options.starDecos)
    Object.assign(DECOS, {
      star4: {
        n: "Kilau",
        star: true,
        d: "M0 -4C0.6 -1 1 -0.6 4 0C1 0.6 0.6 1 0 4C-0.6 1 -1 0.6 -4 0C-1 -0.6 -0.6 -1 0 -4Z",
        home: [9, 9],
      },
      star4x2: {
        n: "Kilau ganda",
        star: true,
        d: "M-1 -2.5C-0.4 0.5 0 0.9 3 1.5C0 2.1 -0.4 2.5 -1 5.5C-1.6 2.5 -2 2.1 -5 1.5C-2 0.9 -1.6 0.5 -1 -2.5ZM4.5 -6C4.8 -4.5 5 -4.3 6.5 -4C5 -3.7 4.8 -3.5 4.5 -2C4.2 -3.5 4 -3.7 2.5 -4C4 -4.3 4.2 -4.5 4.5 -6Z",
        home: [9, 10],
      },
    });
  return { MAINS, PREFS, MODS, SLOT_GLYPH, SHIFT, DECOS };
}
