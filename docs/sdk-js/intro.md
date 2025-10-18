---
sidebar_position: 1
slug: /sdk-js
---

# Hoosat SDK (JavaScript/TypeScript)

**Professional TypeScript SDK for the Hoosat blockchain.** Full-featured toolkit for building production-ready applications with robust error handling, real-time monitoring, and advanced transaction management.

## Overview

The Hoosat SDK provides a complete, type-safe interface for interacting with the Hoosat blockchain. Built with TypeScript, it offers first-class support for modern JavaScript applications while maintaining full backward compatibility with Node.js environments.

### Package Information

- **Package Name:** `hoosat-sdk`
- **Current Version:** 0.2.1
- **License:** MIT
- **TypeScript:** Full type definitions included
- **Node.js:** >= 20.0.0

## Key Features

### Core Functionality

- **Full Node Integration** - Connect to any Hoosat node via gRPC
- **Cryptographic Utilities** - Key generation, address creation, transaction signing (ECDSA secp256k1)
- **Transaction Builder** - Intuitive API with automatic fee calculation and change handling
- **Network Analytics** - Block data, mempool analysis, hashrate estimation
- **Balance & UTXO Management** - Query balances, manage UTXOs efficiently
- **QR Code Generation** - Payment URIs and address QR codes

### Advanced Features

- **Real-time Event System** - `HoosatEventManager` with automatic reconnection and error handling
- **Dynamic Fee Estimation** - Network-aware fee recommendations based on mempool analysis
- **Transaction Status Tracking** - Check if transactions are PENDING, CONFIRMED, or NOT_FOUND
- **UTXO Selection Strategies** - Optimize fees and privacy (largest-first, smallest-first, random)
- **Batch Payments** - Send to multiple recipients efficiently (2 recipients per tx)
- **UTXO Consolidation** - Optimize wallet structure by combining small UTXOs
- **UTXO Splitting** - Prepare for future payments by splitting large UTXOs

### Production-Ready

- **Spam Protection Compliance** - Built-in limits (max 2 recipients per tx) following Kaspa inheritance
- **Comprehensive Error Handling** - Robust error categorization and recovery
- **Multi-Node Failover** - Automatic node switching with health monitoring for high availability
- **Retry Strategies** - Exponential backoff, circuit breaker patterns
- **Network Monitoring** - Real-time statistics and health checks
- **Type Safety** - Full TypeScript support with comprehensive types
- **Test Coverage** - Unit tests with Vitest (90%+ coverage for critical components)

## Quick Links

- [Installation Guide](./getting-started/installation.md) - Get up and running
- [Quick Start](./getting-started/quick-start.md) - Your first Hoosat application
- [Core Concepts](./core-concepts/architecture.md) - Understand the SDK architecture
- [API Reference](./api-reference/client.md) - Complete API documentation
- [Examples](./examples/index.md) - Working code examples
- [GitHub Repository](https://github.com/Namp88/hoosat-sdk)
- [NPM Package](https://www.npmjs.com/package/hoosat-sdk)

## What Can You Build?

### Wallets
Create full-featured cryptocurrency wallets with:
- Key generation and management
- Balance tracking
- Transaction sending/receiving
- Real-time balance updates
- QR code support

### Payment Systems
Build payment processing solutions:
- Payment request generation
- Invoice creation
- Transaction verification
- Batch payment processing
- Webhook notifications

### Block Explorers
Develop blockchain data platforms:
- Block and transaction querying
- Address monitoring
- Network statistics
- Mempool analysis

### DeFi Applications
Create decentralized finance apps:
- Token operations
- Smart contract interaction
- Multi-signature wallets
- Automated trading bots

## Architecture Overview

The SDK is organized into focused modules:

```
hoosat-sdk/
├── HoosatClient          # Main client for blockchain interaction
├── HoosatCrypto          # Cryptographic operations
├── HoosatTxBuilder       # Transaction building
├── HoosatFeeEstimator    # Dynamic fee estimation
├── HoosatEventManager    # Real-time event streaming
├── HoosatQR              # QR code generation
├── HoosatSigner          # Message signing
└── HoosatUtils           # Utility functions
```

Each module is designed to work independently or together, giving you flexibility in how you structure your application.

## Example: Send Your First Transaction

```typescript
import { 
  HoosatClient, 
  HoosatCrypto, 
  HoosatTxBuilder,
  HoosatFeeEstimator,
  FeePriority 
} from 'hoosat-sdk';

// Connect to node
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

// Generate or import wallet
const wallet = HoosatCrypto.generateKeyPair();

// Get UTXOs
const utxos = await client.getUtxosByAddresses([wallet.address]);

// Estimate fee
const feeEstimator = new HoosatFeeEstimator(client);
const fee = await feeEstimator.estimateFee(
  FeePriority.Normal,
  utxos.result.utxos.length,
  2
);

// Build transaction
const builder = new HoosatTxBuilder();
utxos.result.utxos.forEach(utxo => {
  builder.addInput(utxo, wallet.privateKey);
});

builder.addOutput('recipient_address', '100000000'); // 1 HTN
builder.setFee(fee.totalFee);
builder.addChangeOutput(wallet.address);

// Sign and submit
const signedTx = builder.sign();
const result = await client.submitTransaction(signedTx);

console.log('Transaction ID:', result.result.transactionId);
```

## Next Steps

Ready to get started? Follow these guides:

1. **[Installation](./getting-started/installation.md)** - Install the SDK in your project
2. **[Quick Start](./getting-started/quick-start.md)** - Build your first Hoosat app
3. **[Core Concepts](./core-concepts/architecture.md)** - Learn the fundamentals
4. **[Examples](./examples/index.md)** - Explore working code samples

## Community & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/Namp88/hoosat-sdk/issues)
- **Email:** namp2988@gmail.com
- **Hoosat Network:** [https://network.hoosat.fi](https://network.hoosat.fi/)

## License

MIT License - see [LICENSE](https://github.com/Namp88/hoosat-sdk/blob/master/LICENSE) for details.

Copyright © 2025 Andrei Kliubchenko
