// @ts-check
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: "../../dist/icon-composer",
    emptyOutDir: true,
  },
});
