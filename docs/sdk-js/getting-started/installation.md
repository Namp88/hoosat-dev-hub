---
sidebar_position: 1
---

# Installation

This guide will help you install and set up the Hoosat SDK in your project.

## Prerequisites

Before installing the SDK, make sure you have:

- **Node.js** version 20.0.0 or higher
- **npm** (comes with Node.js) or **yarn** or **pnpm**
- **TypeScript** 5.0.0+ (optional but recommended)

### Check Your Node.js Version

```bash
node --version
# Should output v20.0.0 or higher
```

If you need to upgrade Node.js, visit [nodejs.org](https://nodejs.org/).

## Installation Methods

### Using npm

```bash
npm install hoosat-sdk
```

### Using yarn

```bash
yarn add hoosat-sdk
```

### Using pnpm

```bash
pnpm add hoosat-sdk
```

## Verify Installation

After installation, verify that the package is installed correctly:

```bash
npm list hoosat-sdk
```

You should see output similar to:

```
your-project@1.0.0
└── hoosat-sdk@0.2.1
```

## TypeScript Setup (Recommended)

The SDK is written in TypeScript and includes full type definitions. For the best development experience, we recommend using TypeScript.

### Initialize TypeScript in Your Project

If you don't have TypeScript configured yet:

```bash
npm install --save-dev typescript @types/node
npx tsc --init
```

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## First Import Test

Create a test file to verify everything works:

**test-sdk.ts** (TypeScript):
```typescript
import { HoosatClient, HoosatUtils } from 'hoosat-sdk';

console.log('Hoosat SDK imported successfully!');

// Test a utility function
const isValid = HoosatUtils.isValidAddress('hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02');
console.log('Address validation works:', isValid);
```

**test-sdk.js** (JavaScript):
```javascript
const { HoosatClient, HoosatUtils } = require('hoosat-sdk');

console.log('Hoosat SDK imported successfully!');

const isValid = HoosatUtils.isValidAddress('hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02');
console.log('Address validation works:', isValid);
```

### Run the Test

**TypeScript:**
```bash
# Install tsx for running TypeScript directly
npm install -g tsx

# Run the test
tsx test-sdk.ts
```

**JavaScript:**
```bash
node test-sdk.js
```

Expected output:
```
Hoosat SDK imported successfully!
Address validation works: true
```

## Next Steps

Now that you have the SDK installed, continue with:

- [Quick Start Guide](./quick-start.md) - Build your first Hoosat application
- [Configuration](./configuration.md) - Learn about client configuration options
- [Core Concepts](../core-concepts/architecture.md) - Understand SDK architecture

## Troubleshooting

### Installation Issues

**Problem:** npm install fails with permission errors

**Solution:** Use nvm to manage Node.js versions or check npm permissions

**Problem:** TypeScript compilation errors

**Solution:** Clear cache and reinstall dependencies

**Problem:** Module not found errors

**Solution:** Verify import syntax (ES6 vs CommonJS)

## Package Information

- **Latest Version:** [npm](https://www.npmjs.com/package/hoosat-sdk)
- **Changelog:** [GitHub](https://github.com/Namp88/hoosat-sdk/blob/master/CHANGELOG.md)
- **License:** MIT
