import importPlugin from "eslint-plugin-import";
import wc from "eslint-plugin-wc";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    plugins: {
      import: importPlugin,
      wc
    },
    rules: {
      ...prettier.rules,
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


