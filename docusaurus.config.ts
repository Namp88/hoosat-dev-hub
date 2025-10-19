import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Hoosat Developer Hub',
  tagline: 'Documentation, SDKs, and Integration Guides for Hoosat Blockchain',
  favicon: 'img/icon128.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://hub.hoosat.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'hoosat', // Usually your GitHub org/user name.
  projectName: 'hub', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Namp88/hoosat-dev-hub/tree/main/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/icon128.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Hoosat Dev Hub',
      logo: {
        alt: 'Hoosat Logo',
        src: 'img/icon128.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'gettingStartedSidebar',
          position: 'left',
          label: 'Getting Started',
        },
        {
          type: 'dropdown',
          label: 'SDKs',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'sdkJsSidebar',
              label: 'Node.js SDK',
            },
            {
              type: 'docSidebar',
              sidebarId: 'sdkWebSidebar',
              label: 'Browser SDK',
            },
            {
              type: 'docSidebar',
              sidebarId: 'hoosatMoSidebar',
              label: 'Motoko Package (IC)',
            },
          ],
        },
        {
          type: 'docSidebar',
          sidebarId: 'restApiSidebar',
          position: 'left',
          label: 'REST API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'walletExtensionSidebar',
          position: 'left',
          label: 'Wallet Extension',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/',
            },
            {
              label: 'Quick Start',
              to: '/docs/quick-start',
            },
            {
              label: 'Node.js SDK',
              to: '/docs/sdk-js',
            },
            {
              label: 'Browser SDK',
              to: '/docs/sdk-web/intro',
            },
            {
              label: 'Motoko Package',
              to: '/docs/hoosat-mo',
            },
            {
              label: 'REST API',
              to: '/docs/rest-api/intro',
            },
            {
              label: 'Wallet Extension',
              to: '/docs/wallet-extension/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/mFBfNpNA',
            },
            {
              label: 'Twitter',
              href: 'https://x.com/HoosatNetwork',
            },
            {
              label: 'Telegram',
              href: 'https://t.me/HoosatNetwork',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub (Developer)',
              href: 'https://github.com/Namp88',
            },
            {
              label: 'GitHub (Organization)',
              href: 'https://github.com/Hoosat-Oy',
            },
            {
              label: 'Official Website',
              href: 'https://network.hoosat.fi',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Hoosat. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
