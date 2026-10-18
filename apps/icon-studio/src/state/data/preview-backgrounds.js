// @ts-check
/**
 * Latar lembar kontak Tinjau (data pratinjau ekspor, bukan warna UI). Nilai dari artboard Tinjau.
 * `ink`, `ink2`, dan `ink3` adalah warna teks di atas latar itu (judul, nama file, meta).
 */
export const PREVIEW_BACKGROUNDS = [
  { id: "white", label: "Latar putih", color: "#FFFFFF", ink: "#141414", ink2: "#5E6068", ink3: "#6A6C74" },
  { id: "grey", label: "Latar abu", color: "#ECEBE7", ink: "#141414", ink2: "#5E6068", ink3: "#6A6C74" },
  { id: "dark", label: "Latar gelap", color: "#17171B", ink: "#F2F2F2", ink2: "#B4B6BD", ink3: "#A3A5AE" },
  { id: "yellow", label: "Latar kuning", color: "#FBEFB4", ink: "#141414", ink2: "#5E6068", ink3: "#6A6C74" },
  { id: "transparent", label: "Latar transparan", color: "repeating-conic-gradient(#D9D9D9 0 25%, #FFFFFF 0 50%) 0 0 / 8px 8px", ink: "#141414", ink2: "#5E6068", ink3: "#6A6C74" },
];

/** Latar baris uji 32 px (artboard Tinjau). */
export const SIZETEST_BACKGROUNDS = { light: "#ECEBE7", dark: "#141414" };
