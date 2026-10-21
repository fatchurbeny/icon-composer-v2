// @ts-check
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { fillShapesGzip } from "../../scripts/vite-fill-shapes.mjs";

export default defineConfig({
  plugins: [fillShapesGzip(), viteSingleFile()],
  build: { outDir: "../../dist/icon-studio", emptyOutDir: true },
});
