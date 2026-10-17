// @ts-check
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: "../../dist/template-icon-builder",
    emptyOutDir: true,
  },
});
