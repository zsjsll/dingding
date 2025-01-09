import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
const global_cfg = [{ ignores: ["dist", "node_modules"] }]

/** @type {import('eslint').Linter.Config[]} */
const js_cfg = [{ name: "js", files: ["**/*.js", "**/*.mjs"] }]

/** @type {import('eslint').Linter.Config[]} */
const ts_cfg = [{ name: "ts", files: ["**/*.ts"] }]

/** @type {import('eslint').Linter.Config[]} */
// @ts-expect-error 123
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...global_cfg,
  ...js_cfg,
  ...ts_cfg,
]
