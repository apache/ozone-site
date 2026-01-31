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

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import Ajv from 'ajv';

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Apache Ozone',
  tagline: 'Scalable, reliable, distributed storage system optimized for data analytics and object store workloads.',
  // TODO: HDDS-12129 Delete this before the site goes live to enable search engine indexing.
  noIndex: true,
  // Set the production URL of the website. Must be updated when the final site is deployed.
  // This must match the URL the website is hosted at for social media previews to work.
  // If you are testing the social media image (themeConfig.image) locally, set this to http://localhost:3001.
  url: 'https://ozone-site-v2.staged.apache.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Fail the build if there are any broken links.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onBrokenAnchors: 'throw',
  // Fail the build if multiple pages map to the same URL.
  onDuplicateRoutes: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  /*
  Docusaurus does not currently support multiple favicons out of the box.
  Manually insert head tags to configure support for favicons on multiple platforms.
  */
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: 'favicon.ico',
        sizes: '32x32'
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: 'favicon.svg',
        type: "image/svg+xml"
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        href: 'apple-touch-icon.png',
      },
    },
  ],

  markdown: {
    mermaid: true,
    /*
    Validate markdown frontmatter against a more restrictive schema than what Docusaurus allows.
    This ensures all pages are using a minimal set of consistent keys.
    It can also be used to require all pages to define certain markdown front matter keys.
    See https://docusaurus.io/docs/api/docusaurus-config#markdown for reference.
    */
    parseFrontMatter: async (params) => {
      // Reuse the default parser.
      const result = await params.defaultParseFrontMatter(params);

      // Validate front matter against the schema.
      const schemaPath = './.github/resource/frontmatter.schema.json';
      const frontMatterSchema = require(schemaPath);
      const ajv = new Ajv();
      const validate = ajv.compile(frontMatterSchema);
      const isValid = validate(result.frontMatter);

      if (!isValid) {
        console.error('Front matter validation error in', params.filePath + ':\n', validate.errors);
        console.error('Front matter validation failed against JSON schema', schemaPath);
        process.exit(1);
      }

      return result;
    },
    /*
    Validate internal markdown links to ensure they don't contain number prefixes or file extensions.
    These can break when the ordering or format of the target page is updated.
    Docusaurus can resolve links without these.
    See https://docusaurus.io/docs/api/docusaurus-config#markdown for reference.
    */
    preprocessor: (/** @type {{filePath: string, fileContent: string}} */ params) => {
      const {filePath, fileContent} = params;

      // Match markdown links but exclude images (which start with !)
      // Uses negative lookbehind (?<!!) to skip ![alt](url) image syntax
      const internalLinkPattern = /(?<!!)\[([^\]]+)\]\(([^()\s]+(?:\([^)]*\)[^()\s]*)*)\)/g;
      // Match two-digit number prefixes at start or after slash
      const numberPrefixPattern = /(^|\/)\d{2}-/;

      let matches;
      const invalidLinks = [];

      while ((matches = internalLinkPattern.exec(fileContent)) !== null) {
        const linkText = matches[1];
        const linkPath = matches[2];

        // Skip external links (http://, https://, mailto:, etc.)
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(linkPath)) {
          continue;
        }

        const pathWithoutFragment = linkPath.split('#')[0];

        // Skip absolute paths to pages/static (e.g., /download, /foo.pdf) since they are not versioned
        // Only check absolute paths to /docs/ which breaks versioning
        const isAbsoluteNonDocsPath = linkPath.startsWith('/') && !linkPath.startsWith('/docs/');
        if (isAbsoluteNonDocsPath) {
          continue;
        }

        // Check for absolute paths to docs (breaks versioning)
        const isAbsoluteDocsPath = linkPath.startsWith('/docs/');

        // Check for number prefixes
        const hasNumberPrefix = numberPrefixPattern.test(linkPath);

        // Check for extensions that Docusaurus converts to routes (should be omitted in links)
        const hasDocExtension = /\.(mdx?|jsx?|tsx)$/.test(pathWithoutFragment);

        if (isAbsoluteDocsPath || hasNumberPrefix || hasDocExtension) {
          invalidLinks.push({
            text: linkText,
            path: linkPath,
            line: fileContent.substring(0, matches.index).split('\n').length
          });
        }
      }

      if (invalidLinks.length > 0) {
        const errorMsg = invalidLinks.map(link =>
          `  Line ${link.line}: [${link.text}](${link.path})`
        ).join('\n');

        console.error('Invalid internal links found in', filePath + ':\n' + errorMsg);
        console.error('\nInternal links should not include absolute paths to docs, number prefixes, or route file extensions (.md, .mdx, .js, .jsx, .tsx).');
        console.error('Example: use \'./ozone-manager#persisted-state\' instead of \'./02-ozone-manager.md#persisted-state\'');
        process.exit(1);
      }

      return fileContent;
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: undefined,
          // TODO update this link when the new website's branch is merged.
          editUrl:
            'https://github.com/apache/ozone-site/tree/HDDS-9225-website-v2',
        },
        blog: {
          showReadingTime: true,
          // TODO update this link when the new website's branch is merged.
          editUrl:
            'https://github.com/apache/ozone-site/tree/HDDS-9225-website-v2/',
        },
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            require.resolve('./src/css/header.css'),
            require.resolve('./src/css/footer.css'),
          ],
        },
        sitemap: {
          /*
          Check that all generated URLs from the build use kebab-case and lowercase.
          See https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap#ex-config for reference.
          */
          createSitemapItems: async (params) => {
            const {defaultCreateSitemapItems, ...rest} = params;
            const items = await defaultCreateSitemapItems(rest);

            // TODO Base URL must be updated when the new website's branch is merged.
            const validUrlRegex = new RegExp('^https://ozone-site-v2\.staged\.apache\.org/([a-z0-9][a-z0-9\./-]*[a-z0-9/])?$');
            items.forEach((item, index) => {
              if (!validUrlRegex.test(item.url)) {
                  console.error('Generated URL', item.url, 'does not match the allowed RegEx:', validUrlRegex);
                  console.error('All URLs should use kebab case and lowercase letters.');
                  process.exit(1);
              }
            });
            return items;
          },
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        pwaHead: [
          {
            tagName: 'link',
            rel: 'manifest',
            href: 'pwa/manifest.json',
          },
        ],
      },
    ]
  ],

  themes: ['@docusaurus/theme-mermaid'],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true, // Automatically use dark mode when the user's system prefers it
      },
      // Optional: Add an announcement bar to the top of the website.
      // announcementBar: {
      //   id: 'announce',
      //   backgroundColor: 'var(--color-accent)',
      //   textColor: 'white',
      //   content:
      //       'Sample Announcement Content',
      // },

      image: 'img/social-card.png',
      navbar: {
        title: 'Apache Ozone',
        logo: {
          alt: 'Ozone Logo',
          src: 'img/ozone-logo.svg',
        },
        items: [
          {
            label: 'Docs',
            to: 'docs',
          },
          {
            to: 'download',
            label: 'Download',
          },
          {
            to: 'roadmap',
            label: 'Roadmap',
          },
          {
            to: 'faq',
            label: 'FAQ',
          },
          {
            to: '/blog',
            label: 'Blog',
          },
          {
            label: 'Community',
            items: [
              {
                to: 'community/communication-channels',
                label: 'Communication Channels',
              },
              {
                to: 'community/who-uses-ozone',
                label: 'Who Uses Ozone?',
              },
              {
                to: 'community/report-an-issue',
                label: 'Report An Issue',
              },
              {
                to: 'community/ask-a-question',
                label: 'Ask a Question',
              },
              {
                to: 'community/how-to-contribute',
                label: 'How to Contribute',
              },
              {
                to: 'community/events-and-media',
                label: 'Events and Media',
              },
            ]
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/apache/ozone',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub Repo',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Apache Software Foundation',
            items: [
              {
                label: 'Foundation',
                href: 'https://www.apache.org/'
              },
              {
                label: 'License',
                href: 'https://www.apache.org/licenses/'
              },
              {
                label: 'Events',
                href: 'https://www.apache.org/events/current-event'
              },
              {
                label: 'Sponsorship',
                href: 'https://www.apache.org/foundation/sponsorship.html'
              },
              {
                label: 'Privacy',
                href: 'https://privacy.apache.org/policies/privacy-policy-public.html'
              },
              {
                label: 'Security',
                href: 'https://www.apache.org/security/'
              },
              {
                label: 'Thanks',
                href: 'https://www.apache.org/foundation/thanks.html'
              },
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/apache/ozone/discussions'
              },
              {
                label: 'Jira Issues',
                href: 'https://issues.apache.org/jira/projects/HDDS/issues'
              },
              {
                label: 'Slack',
                href: 'https://infra.apache.org/slack.html'
              },
              {
                label: 'Mailing List',
                href: 'mailto:dev@ozone.apache.org'
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@ApacheOzone'
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/ApacheOzone'
              },
            ],
          },
          {
            title: 'Repositories',
            items: [
              {
                label: 'Ozone',
                to: 'https://github.com/apache/ozone',
              },
              {
                label: 'Website',
                to: 'https://github.com/apache/ozone-site',
              },
              {
                label: 'Docker Image',
                to: 'https://github.com/apache/ozone-docker',
              },
              {
                label: 'Docker Runner Image',
                to: 'https://github.com/apache/ozone-docker-runner',
              },
            ],
          },
        ],
        copyright: `
        <div>
          Copyright © ${new Date().getFullYear()} <a href="https://www.apache.org/" class=copyright-link>The Apache Software Foundation</a>. Licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0" class=copyright-link>Apache License, Version 2.0</a>. <br>
          <div>
            <p>The Apache Software Foundation, Apache Ozone, Ozone, Apache, the Apache Feather, and the Apache Ozone project logo are either registered trademarks or trademarks of the Apache Software Foundation.</p>
          </div>
        </div>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash'],
      },
      // TODO HDDS-9566
      algolia: {
        appId: "PLACEHOLDER",
        apiKey: "PLACEHOLDER",
        indexName: "PLACEHOLDER",
        searchParameters: {}
      }
    }),
    scripts: ['/script/matomo.js'],
};

module.exports = config;
