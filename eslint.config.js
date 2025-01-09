import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
// @ts-expect-error 123
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["webpack/webpack-autojs-loader/index.js",""],
    rules: { "@typescript-eslint/no-unused-vars": 0, "prefer-const": 2 },
  },
  // { ignores:  ["webpack/**/*.js", "**/temp.ts"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // {rules: { "@typescript-eslint/no-unused-vars": 0, "prefer-const": 0 }}
  // { name: "js", files: ["**/*.js"],ignores:["webpack/webpack-autojs-loader/index.js"] ,rules: { "@typescript-eslint/no-unused-vars": 0, "prefer-const": 0 } },
]
