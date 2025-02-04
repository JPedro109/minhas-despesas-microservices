import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/no-explicit-any": ["error"],
    },
  },
  {
    ignores: [
      "commitlint.config.js",
      "jest.config.js",
      "jest-unit-config.js",
      "jest-integration-config.js",
    ],
  },
];
