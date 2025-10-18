# Hoosat Developer Hub

Official documentation hub for Hoosat blockchain - comprehensive SDKs, APIs, and developer resources.

🌐 **Live Site:** [hub.hoosat.fi](https://hub.hoosat.fi)

Built with [Docusaurus](https://docusaurus.io/), a modern static website generator.

## 📚 What's Included

This repository contains comprehensive documentation for:

- **Node.js SDK** (`hoosat-sdk`) - Full-featured SDK for server-side applications with gRPC support
- **Browser SDK** (`hoosat-sdk-web`) - Lightweight SDK for web applications (~150KB gzipped)
- **REST API** - HTTP API for any programming language
- **Wallet Extension** - Browser extension wallet with dApp integration support
- **Integration Examples** - DApp integration, transaction building, event streaming
- **Developer Guides** - Quick start, tutorials, and best practices

## 🚀 Getting Started

### Prerequisites

- Node.js 20.0 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This command starts a local development server at `http://localhost:3000/`. Most changes are reflected live without restarting the server.

### Build

```bash
npm run build
```

Generates static content into the `build` directory for production deployment.

### Serve Production Build

```bash
npm run serve
```

Serves the production build locally for testing.

## 📁 Project Structure

```
hub/
├── docs/                       # Documentation content
│   ├── intro.md               # Introduction
│   ├── quick-start.md         # Quick start guide
│   ├── sdk-js/                # Node.js SDK documentation
│   ├── sdk-web/               # Browser SDK documentation
│   ├── rest-api/              # REST API documentation
│   └── wallet-extension/      # Wallet extension documentation
├── blog/                      # Blog posts (optional)
├── src/                       # React components and pages
│   ├── components/            # Custom React components
│   │   └── HomepageFeatures/ # Landing page sections
│   ├── css/                   # Global styles
│   └── pages/                 # Custom pages
├── static/                    # Static assets
│   └── img/                   # Images (logo, icons)
├── docusaurus.config.ts       # Site configuration
└── sidebars.ts                # Sidebar navigation
```

## 📖 Documentation Organization

### SDKs

Each SDK has its own section with:
- Introduction and installation
- Quick start examples
- Getting started guides
- API reference
- Practical examples
- Security best practices

### REST API

HTTP API documentation with:
- Base URL and authentication
- Node endpoints
- Address endpoints
- Blockchain queries
- Transaction submission
- Network information

### Wallet Extension

Browser extension documentation:
- User guide for wallet users
- DApp integration guide for developers
- API reference
- Security considerations

## 🛠️ Contributing

### Adding Documentation

1. Create a new markdown file in the appropriate `docs/` subdirectory
2. Add frontmatter with `sidebar_position` if needed
3. The sidebar will auto-generate based on file structure
4. Use code blocks with language tags for syntax highlighting

Example:

```markdown
---
sidebar_position: 2
---

# Your Page Title

Content here...

```javascript
// Code example
const client = new HoosatClient();
```
```

### Markdown Features

Docusaurus supports:
- Standard Markdown and MDX (React components in Markdown)
- Code blocks with syntax highlighting
- Tabs for multiple examples
- Admonitions (notes, warnings, tips)
- Interactive elements

See [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features) for more.

## 🚢 Deployment

The site can be deployed to various platforms:

### GitHub Pages

```bash
npm run deploy
```

### Vercel / Netlify

Connect your repository and configure:
- Build command: `npm run build`
- Output directory: `build`

### Manual Deployment

```bash
npm run build
# Upload build/ directory to your hosting provider
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## ⚙️ Configuration

### Site Config

Edit `docusaurus.config.ts` to configure:
- Site metadata (title, tagline, URL)
- Theme settings (colors, dark mode)
- Navbar and footer links
- Social card images
- Plugins and presets

### Sidebar Config

Edit `sidebars.ts` to customize:
- Sidebar structure and organization
- Category groupings
- Auto-generated vs manual sidebars

## 🎨 Features

- **Modern Landing Page** - Product showcase, features, quick start
- **Responsive Design** - Mobile, tablet, and desktop support
- **Dark Mode** - Automatic theme switching
- **Search** - Built-in documentation search
- **Fast Performance** - Static site generation
- **SEO Optimized** - Meta tags and social cards

## 🔗 Links

- **Official Website**: [network.hoosat.fi](https://network.hoosat.fi)
- **Discord**: [Join community](https://discord.gg/mFBfNpNA)
- **Twitter**: [@HoosatNetwork](https://x.com/HoosatNetwork)
- **Telegram**: [HoosatNetwork](https://t.me/HoosatNetwork)
- **GitHub Organization**: [Hoosat-Oy](https://github.com/Hoosat-Oy)
- **Developer GitHub**: [Namp88](https://github.com/Namp88)

## 📦 Related Packages

- [`hoosat-sdk`](https://www.npmjs.com/package/hoosat-sdk) - Node.js SDK
- [`hoosat-sdk-web`](https://www.npmjs.com/package/hoosat-sdk-web) - Browser SDK
- `hoosat-proxy` - REST API server
- `hoosat-web-extension` - Browser wallet extension

## 📄 License

Copyright © 2025 Hoosat. Built with Docusaurus.

## 💬 Support

- **Documentation Issues**: [GitHub Issues](https://github.com/Namp88/hoosat-dev-hub/issues)
- **Community Support**: [Discord](https://discord.gg/mFBfNpNA) | [Telegram](https://t.me/HoosatNetwork)
- **Developer Contact**: [@Namp88](https://github.com/Namp88)
