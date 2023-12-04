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
      // Optional: Add an announcement bat to the top of the website.
      // announcementBar: {
      //   id: 'announce',
      //   backgroundColor: 'var(--color-accent)',
      //   textColor: 'white',
      //   content:
      //       'Sample Announcement Content',
      // },

      // TODO Generate social card for Ozone.
      // image: 'img/ozone-social-card.jpg',
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
            label: 'Apache',
            items: [
              {
                label: 'Apache Software Foundation',
                href: 'https://www.apache.org/'
              },
              {
                label: 'Events',
                href: 'https://www.apache.org/events/current-event'
              },
              {
                label: 'License',
                href: 'https://www.apache.org/licenses/'
              },
              {
                label: 'Sponsors',
                href: 'https://www.apache.org/foundation/thanks.html'
              },
              {
                label: 'Sponsorship',
                href: 'https://www.apache.org/foundation/sponsorship.html'
              },
              {
                label: 'Privacy Policy',
                href: 'https://privacy.apache.org/policies/privacy-policy-public.html'
              },
              {
                label: 'Security',
                href: 'https://www.apache.org/security/'
              }
            ]
          },
          // {
          //   type: 'docsVersionDropdown',
          //   position: 'right',
          // },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          // {
          //   href: 'https://github.com/apache/ozone',
          //   label: 'GitHub',
          //   position: 'right',
          // },
          {
            href: 'https://github.com/apache/ozone',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub Repo',
          },
        ],
      },
      footer: {
        // TODO style the footer. Leaving the stock docusaurus one as a reference.
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                icon: 'img/ozone-logo.svg',
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: "PLACEHOLDER",
        apiKey: "PLACEHOLDER",
        indexName: "PLACEHOLDER",
        placeholder: "foobar",
        searchParameters: {}
      }
    }),
    scripts: ['/script/matomo.js'],
    // TODO HDDS-9566
};

module.exports = config;
