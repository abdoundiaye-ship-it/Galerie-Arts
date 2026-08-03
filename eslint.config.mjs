import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "assets-source/**",
      "supabase/.branches/**",
      "playwright-report/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
