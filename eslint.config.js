import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      ".claude/**",
      "legacy/**",
      "releases/**",
      "graphify-out/**",
      "docs/design/artboards/**",
      "packages/ui/icons.js",
      "packages/export/vendor/**",
      "tests/fixtures/vendor/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  prettier,
];
