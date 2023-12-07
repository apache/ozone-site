// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Apache Ozone',
  tagline: 'Scalable, redundant, distributed storage system optimized for data analytics and object store workloads',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://ozone.apache.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Fail the build if there are any broken links.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  // Fail the build if multiple pages map to the same URL.
  onDuplicateRoutes: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // TODO update this link when the new website's branch is merged.
          editUrl:
            'https://github.com/apache/ozone-site/tree/HDDS-9225-website-v2',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Optional: Add an announcement bar to the top of the website.
      // announcementBar: {
      //   id: 'announce',
      //   backgroundColor: 'var(--color-accent)',
      //   textColor: 'white',
      //   content:
      //       'Sample Announcement Content',
      // },

      // TODO Generate social card for Ozone.
      // image: 'img/ozone-social-card.png',
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
            position: 'left',
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
                to: 'community/how-to-contribute',
                label: 'How to Contribute',
              },
              {
                to: 'community/events-and-media',
                label: 'Events and Media',
              },
              {
                to: 'community/blogs',
                label: 'Blogs',
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
                href: 'https://github.com/apache/ozone/discussions',
              },
              {
                label: 'Jira',
                href: 'https://issues.apache.org/jira/projects/HDDS/issues',
              },
              {
                label: 'Slack',
                href: 'https://infra.apache.org/slack.html',
              },
              {
                label: 'Mailing List',
                href: 'mailto:dev@ozone.apache.org',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@ApacheOzone',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/ApacheOzone',
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
          Copyright © ${new Date().getFullYear()} <a href="https://www.apache.org/">The Apache Software Foundation</a>. Licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0</a>. <br>
          <div>
            <p>The Apache Software Foundation, Apache Ozone, Ozone, Apache, the Apache Feather, and the Apache Ozone project logo are either registered trademarks or trademarks of the Apache Software Foundation.</p>
          </div>
        </div>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
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
