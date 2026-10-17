// @ts-check
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js", "packages/**/test/**/*.test.js"],
    exclude: ["legacy/**", "tests/e2e/**"],
  },
});
