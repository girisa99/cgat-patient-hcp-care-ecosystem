import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import stabilityFramework from "./eslint-plugin-stability-framework.js";

export default tseslint.config(
  { ignores: ["dist", "supabase/functions/**"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "stability-framework": stabilityFramework,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": ["warn", {"ignoreRestArgs": true}],
      "no-case-declarations": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "prefer-const": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Stability Framework Rules
      "stability-framework/enforce-naming-conventions": "error",
      "stability-framework/limit-file-complexity": ["warn", { max: 10 }],
      "stability-framework/limit-file-length": ["warn", { max: 300 }],
      "stability-framework/no-duplicate-imports": "error",
      "stability-framework/enforce-update-first": "warn",
    },
  },
  {
    files: ["src/hooks/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
);
