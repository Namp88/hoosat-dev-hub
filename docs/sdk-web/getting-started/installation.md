---
sidebar_position: 1
---

# Installation

Install the Hoosat Browser SDK in your web application.

## Prerequisites

- **Node.js** 16+ (for build tools)
- **TypeScript** 5+ (optional, but recommended)
- Modern browser with ES6+ support

## NPM Installation

```bash
npm install hoosat-sdk-web
```

Or with yarn:

```bash
yarn add hoosat-sdk-web
```

Or with pnpm:

```bash
pnpm add hoosat-sdk-web
```

## CDN Usage

For quick prototyping, use the UMD bundle via CDN:

```html
<script src="https://unpkg.com/hoosat-sdk-web@latest/dist/hoosat-sdk.umd.js"></script>
<script>
  const { HoosatCrypto, HoosatWebClient } = window.HoosatSDK;

  // Use the SDK
  const wallet = HoosatCrypto.generateKeyPair('mainnet');
  console.log('Address:', wallet.address);
</script>
```

## Module Bundlers

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // No special configuration needed
  // hoosat-sdk-web works out of the box with Vite
});
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
```

### Create React App

```bash
npm install hoosat-sdk-web buffer
```

```typescript
// src/index.tsx
import { Buffer } from 'buffer';

window.Buffer = Buffer;

// Now you can use the SDK
import { HoosatCrypto } from 'hoosat-sdk-web';
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Verify Installation

Create a test file to verify the SDK works:

```typescript
// test-sdk.ts
import { HoosatCrypto, HoosatUtils } from 'hoosat-sdk-web';

// Generate test wallet
const wallet = HoosatCrypto.generateKeyPair('testnet');

console.log('SDK installed successfully!');
console.log('Test wallet address:', wallet.address);
console.log('Network:', HoosatUtils.getAddressNetwork(wallet.address));
```

Run the test:

```bash
npx tsx test-sdk.ts
```

## Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 90+ | Fully supported |
| Firefox | 88+ | Fully supported |
| Safari | 14+ | Fully supported |
| Edge | 90+ | Fully supported |
| Opera | 76+ | Fully supported |
| Mobile Safari | iOS 14+ | Fully supported |
| Chrome Mobile | Android 90+ | Fully supported |

## Common Issues

### Buffer not defined

If you see `Buffer is not defined` error:

```typescript
// Add at the top of your entry file
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
```

### Module not found

Ensure you're using a bundler that supports ES modules (Vite, Webpack 5, etc.)

## Next Steps

- [Quick Start](./quick-start.md) - Build your first dApp
- [Configuration](./configuration.md) - Configure the SDK
- [API Reference](../api-reference) - Complete API documentation
