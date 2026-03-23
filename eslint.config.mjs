/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import pluginDocusaurus from "@docusaurus/eslint-plugin";
import css from "@eslint/css";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import pluginImport from "eslint-plugin-import-x";
import pluginReact from "eslint-plugin-react";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default defineConfig([
  // General
  {
    ignores: [
      "static/**",
      "node_modules/**",
      "build/**",
      ".docusaurus/**",
      ".github/**",
    ],
  },

  // JS
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: {
      "unused-imports": pluginUnusedImports,
      import: pluginImport,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      // unused vars (but ignore underscore-prefixed)
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node built-ins (path, fs, etc.)
            "external", // npm packages (react, @docusaurus/*, etc.)
            "internal", // paths configured as internal (e.g. @site/*)
            ["parent", "sibling", "index"], // relative imports
          ],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-unused-vars": "off",
    },
  },

  // React
  {
    files: ["**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",
    },
  },

  // CSS
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      "css/no-invalid-properties": "off",
      "css/no-important": "off",
      "css/use-baseline": "off",
    },
  },

  // Docusaurus
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { "@docusaurus": pluginDocusaurus },
    rules: {
      ...pluginDocusaurus.configs.recommended.rules,
      "@docusaurus/no-html-links": "error",
      "@docusaurus/prefer-docusaurus-heading": "error",
      // for i18n
      // "@docusaurus/no-untranslated-text": ["warn", { ignoredStrings: [] }]
    },
  },
]);
