import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import sonarjs from "eslint-plugin-sonarjs"

/** @type {import('eslint').Linter.Config[]} */
const global_cfg = [{ ignores: ["dist", "node_modules"], rules: {} }]

/** @type {import('eslint').Linter.Config[]} */
const js_cfg = [{ name: "js", files: ["**/*.js", "**/*.mjs"], rules: {} }]

/** @type {import('eslint').Linter.Config[]} */
const ts_cfg = [{ name: "ts", files: ["**/*.ts"], rules: {} }]

/** @type {import('eslint').Linter.Config[]} */

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  sonarjs.configs.recommended,
  ...tseslint.configs.recommended,
  ...global_cfg,
  ...js_cfg,
  ...ts_cfg,
]
