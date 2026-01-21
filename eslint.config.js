import importPlugin from "eslint-plugin-import";
import wc from "eslint-plugin-wc";
import prettier from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";
import ts from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: {
      import: importPlugin,
      "@typescript-eslint": ts,
      wc
    },
    rules: {
      ...prettier.rules,
      ...ts.configs.recommended.rules,
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ],
      "wc/no-constructor-attributes": "error",
      "wc/no-self-class": "error",
      "wc/no-invalid-element-name": "error"
    }
  }
];


