// @ts-check
/**
 * Pembantu tes untuk kolom studio akordeon: hanya satu panel terbuka per kolom,
 * jadi tes membuka panel tujuannya lebih dulu sebelum memakai isinya.
 */

/**
 * Buka panel studio (klik tombol lipat bila panel masih tertutup).
 * @param {import("@playwright/test").Page} page
 * @param {string} id nilai `data-panel`
 */
export async function openPanel(page, id) {
  const btn = page.locator(
    `[data-panel="${id}"] > .ic-panel__head > .ic-panel__collapse`,
  );
  if ((await btn.getAttribute("aria-expanded")) === "false") await btn.click();
}
