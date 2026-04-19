import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import ts from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import globals from "globals";

export default [
  // add more generic rule sets here, such as:
  js.configs.recommended,
  ...ts.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  prettier,
  globalIgnores(["dist/", "tailwind.config.cjs", "src/env.d.ts", ".astro/"]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
      "prefer-const": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
