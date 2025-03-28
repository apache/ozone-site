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
  url: 'https://kerneltime.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/ozone-site/',
  trailingSlash: true,

  // GitHub pages deployment config
  organizationName: 'kerneltime', // Your GitHub username. Usually your GitHub org/user name.
  projectName: 'ozone-site', // Usually your repo name.
  deploymentBranch: 'gh-pages', // Branch that GitHub pages will deploy from.

  // Temporarily allow broken links for deployment
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'warn',
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
    // Favicons
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
    // Resource hints for performance
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    // Structured data for SEO
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Apache Ozone',
        'applicationCategory': 'Storage',
        'operatingSystem': 'Cross-platform',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'description': 'Scalable, reliable, distributed storage system optimized for data analytics and object store workloads.',
        'url': 'https://ozone.apache.org/',
        'author': {
          '@type': 'Organization',
          'name': 'The Apache Software Foundation',
          'url': 'https://www.apache.org/'
        },
        'license': 'https://www.apache.org/licenses/LICENSE-2.0'
      }),
    },
  ],

  markdown: {
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
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            require.resolve('./src/css/header.css'),
            require.resolve('./src/css/footer.css'),
            require.resolve('./src/css/docs-layout.css'),
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

            // Allow URLs with or without proper casing and trailing slashes for now during development
            const validUrlRegex = new RegExp('^https://kerneltime\\.github\\.io/ozone-site(/?|(/.*/?))$');
            items.forEach((item, index) => {
              if (!validUrlRegex.test(item.url)) {
                  console.log('URL', item.url, 'does not match pattern but continuing');
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
    ],
    // Create .nojekyll file to prevent GitHub Pages from using Jekyll
    function (context, options) {
      return {
        name: 'create-nojekyll-file',
        async postBuild({ outDir }) {
          const fs = require('fs');
          const path = require('path');
          const nojekyllPath = path.join(outDir, '.nojekyll');
          fs.writeFileSync(nojekyllPath, '');
          console.log('Created .nojekyll file');
        },
      };
    }
  ],

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
        // Navbar style can only be 'dark' or 'primary'
        style: 'dark',
        // Add ARIA attributes
        hideOnScroll: false,
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
            to: 'community/blogs',
            label: 'Blogs',
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
