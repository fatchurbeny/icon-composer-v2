// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: "list",
  use: {
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
  },
});
