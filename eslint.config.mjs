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

import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import pluginPrettier from "eslint-plugin-prettier/recommended";
import pluginDocusaurus from "@docusaurus/eslint-plugin";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginImport from "eslint-plugin-import";


const apacheLicenseRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce Apache License header in source files"
    },
    fixable: "code",
    messages: {
      missingHeader: "Missing Apache License header at the top of the file"
    }
  },
  create(context) {
    const REQUIRED_HEADER = `/*
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
 */`;

    return {
      Program(node) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const text = sourceCode.getText();

        if (!text.startsWith(REQUIRED_HEADER)) {
          context.report({
            node,
            messageId: "missingHeader",
            fix(fixer) {
              return fixer.insertTextBefore(node, REQUIRED_HEADER + "\n\n");
            }
          });
        }
      }
    };
  }
};

export default defineConfig([
  // General
  {
    ignores: [
      "static/**",
      "*.config*",
      "node_modules/**",
      "build/**",
      "dist/**",
      ".docusaurus/**"
    ]
  },

  // Prettier integration
  pluginPrettier,

  // JS
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: {
      "unused-imports": pluginUnusedImports,
      import: pluginImport
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      // unused vars (but ignore underscore-prefixed)
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "import/no-duplicates": "error",
      "no-unused-vars": "off"
    }
  },

  // React
  {
    files: ["**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: { version: "detect" }
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error"
    }
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
      "css/use-baseline": "off"
    }
  },

  // Docusaurus
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { "@docusaurus": pluginDocusaurus },
    rules: {
      "@docusaurus/no-html-links": "error",
      "@docusaurus/prefer-docusaurus-heading": "error",
      "@docusaurus/string-literal-i18n-messages": "error",
      // for i18n
      // "@docusaurus/no-untranslated-text": ["warn", { ignoredStrings: [] }]
    }
  },

  // CSpell
  // Comment out for now, it's buggy
  // {
  //   files: ["**/*.{md,mdx}"],
  //   plugins: { cspell },
  //   rules: {
  //     "cspell/spellchecker": ["warn", { configFile: "cspell.yaml" }]
  //   }
  // },
  // {
  //   files: ["**/*.{js,mjs,cjs,jsx}"],
  //   plugins: { cspell },
  //   rules: {
  //     "cspell/spellchecker": [
  //       "warn",
  //       {
  //         configFile: "cspell.yaml",
  //         // Check only comments and strings, not the code
  //         checkComments: true,
  //         checkStrings: true,
  //         checkIdentifiers: false
  //       }
  //     ]
  //   }
  // },

  // Custom rule to enforce Apache License header
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      custom: {
        rules: { "apache-license": apacheLicenseRule }
      }
    },
    rules: {
      "custom/apache-license": "error"
    }
  }
]);
