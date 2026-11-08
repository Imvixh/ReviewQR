import js from "@eslint/js";

export default [
  {
    ignores: [
      ".next/**",
      "stitch_reviewqr_poster_saas_suite/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "warn",
    },
  },
];
