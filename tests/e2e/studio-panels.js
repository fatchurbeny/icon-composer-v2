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

/**
 * Buka tab Transform di panel Lapisan Composer · Edit. Memilih lapisan membuka tab Lapisan,
 * jadi tes yang memakai kontrol Transform berpindah tab lebih dulu.
 * @param {import("@playwright/test").Page} page
 */
export async function openTransform(page) {
  await openPanel(page, "edit-layers");
  await page.click('[data-panel="edit-layers"] [role="tab"][data-value="transform"]');
}
