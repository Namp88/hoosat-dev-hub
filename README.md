# Hoosat Developer Hub

Official documentation hub for Hoosat blockchain SDKs, integrations, and developer resources.

Built with [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Overview

This repository contains comprehensive documentation for:

- **JavaScript/TypeScript SDK** - Full-featured SDK for web and Node.js
- **Python SDK** - Pythonic interface for blockchain interaction
- **Rust SDK** - High-performance SDK for systems programming
- **Integration Guides** - Wallets, exchanges, payment gateways
- **Developer Guides** - Tutorials and best practices
- **API Reference** - Complete API documentation

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Local Development

```bash
npm start
# or
yarn start
```

This command starts a local development server at `http://localhost:3000/`. Most changes are reflected live without restarting the server.

### Build

```bash
npm run build
# or
yarn build
```

Generates static content into the `build` directory for production deployment.

### Serve Production Build

```bash
npm run serve
# or
yarn serve
```

Serves the production build locally for testing.

## Project Structure

```
hub/
├── docs/                    # Documentation content
│   ├── intro.md            # Landing page
│   ├── quick-start.md      # Quick start guide
│   ├── sdk-js/             # JavaScript SDK docs
│   ├── sdk-python/         # Python SDK docs
│   ├── sdk-rust/           # Rust SDK docs
│   ├── integrations/       # Integration guides
│   ├── guides/             # Developer guides
│   └── api-reference/      # API documentation
├── blog/                   # Blog posts
├── src/                    # React components
│   ├── components/         # Custom React components
│   ├── css/                # Global styles
│   └── pages/              # Custom pages
├── static/                 # Static assets
│   └── img/                # Images
├── docusaurus.config.ts    # Site configuration
└── sidebars.ts             # Sidebar configuration
```

## Documentation Organization

### SDKs

Each SDK has its own section with:
- Introduction and installation
- Quick start examples
- Feature guides (wallets, transactions, contracts)
- API reference
- Code examples

### Integrations

Integration guides for:
- Cryptocurrency exchanges
- Payment gateways
- Wallet providers
- Block explorers
- Analytics platforms

### Guides

Step-by-step tutorials and best practices for common use cases.

## Contributing

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
- Standard Markdown
- MDX (React components in Markdown)
- Code blocks with syntax highlighting
- Tabs and interactive elements
- Admonitions (notes, warnings, tips)

See [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features) for more.

## Deployment

### GitHub Pages

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

### Vercel / Netlify

Connect your repository and configure build settings:
- Build command: `npm run build`
- Output directory: `build`

### Manual Deployment

Build the static site and deploy the `build/` directory to any static hosting:

```bash
npm run build
# Upload build/ directory to your hosting
```

## Configuration

### Site Config

Edit `docusaurus.config.ts` to configure:
- Site metadata (title, tagline, URL)
- Theme settings
- Navbar and footer
- Plugins

### Sidebar Config

Edit `sidebars.ts` to customize:
- Sidebar structure
- Category groupings
- Auto-generated vs manual sidebars

## License

Copyright 2025 Hoosat

## Support

- [Discord](https://discord.gg/hoosat)
- [GitHub Issues](https://github.com/hoosat/hub/issues)
- [Official Website](https://hoosat.fi)
