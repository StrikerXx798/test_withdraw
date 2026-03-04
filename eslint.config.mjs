import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default defineConfig([
  // Базовые правила Next.js + Core Web Vitals
  ...nextCoreWebVitals,

  // Отключаем конфликтующие с Prettier правила форматирования
  prettierConfig,

  // Превращаем несоответствие Prettier в ошибки ESLint
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  // Глобальные игноры
  globalIgnores(["**/node_modules/**", ".next/**", "out/**", "build/**", "coverage/**"]),
]);
