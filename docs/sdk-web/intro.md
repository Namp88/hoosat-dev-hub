---
sidebar_position: 1
---

# Browser SDK (hoosat-sdk-web)

**Browser-compatible TypeScript SDK for building web wallets, browser extensions, and decentralized applications on the Hoosat blockchain.**

## Overview

`hoosat-sdk-web` is a lightweight, browser-native SDK that provides all essential functionality for interacting with the Hoosat blockchain directly from the browser - no backend required.

**NPM Package:** [hoosat-sdk-web](https://www.npmjs.com/package/hoosat-sdk-web)
**GitHub:** [Namp88/hoosat-sdk-web](https://github.com/Namp88/hoosat-sdk-web)
**Version:** 0.1.6
**Size:** ~180KB gzipped

## Key Differences from Node.js SDK

| Feature | Browser SDK | Node.js SDK |
|---------|------------|-------------|
| **Environment** | Browser only | Node.js only |
| **Node Connection** | REST API (HTTP) | gRPC (native protocol) |
| **Real-time Events** | Not supported | WebSocket/gRPC streams |
| **Bundle Size** | ~180KB | ~2MB+ |
| **Installation** | `npm install hoosat-sdk-web` | `npm install hoosat-sdk` |
| **Use Cases** | Web wallets, dApps, extensions | Servers, exchanges, services |
| **Payload Support** | ✓ Full support | ✓ Full support |
| **API Providers** | ✓ Extensible multi-provider | Single node |

## Core Features

### Browser-Native Cryptography

All cryptographic operations work natively in the browser:

```typescript
import { HoosatCrypto } from 'hoosat-sdk-web';

// Generate wallet in browser
const wallet = HoosatCrypto.generateKeyPair('mainnet');
console.log('Address:', wallet.address);

// Sign transactions locally
const signedTx = HoosatCrypto.signTransactionInput(tx, 0, wallet.privateKey, utxo);
```

**Cryptographic features:**
- ECDSA secp256k1 key generation
- Transaction signing with BLAKE3
- Address creation (ECDSA, Schnorr, P2SH)
- Message signing for authentication
- SHA256 and BLAKE3 hashing

### REST API Client with Provider Architecture

Connect to Hoosat nodes with extensible provider system (contributed by [@codecustard](https://github.com/codecustard)):

```typescript
import {
  HoosatBrowserClient,
  createHoosatProxyProvider,
  createHoosatNetworkProvider,
  createMultiProvider
} from 'hoosat-sdk-web';

// Single provider
const provider = createHoosatProxyProvider({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});
const client = new HoosatBrowserClient(provider);

// Multi-provider with failover
const multiProvider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider()
  ],
  'failover'
);
const resilientClient = new HoosatBrowserClient(multiProvider);

// Check balance
const balance = await client.getBalance('hoosat:qz7ulu...');

// Get UTXOs
const utxos = await client.getUtxos([address]);

// Submit transaction
const result = await client.submitTransaction(signedTx);
```

**API features:**
- Address balance queries
- UTXO fetching
- Transaction submission
- Network information
- Fee recommendations
- Health checks
- **Extensible provider system**
- **Automatic failover**
- **Load balancing**
- **Performance optimization**

[Learn more about API Providers →](./guides/api-providers.md)

### Transaction Builder with Payload Support

Build and sign transactions with automatic change calculation and payload support:

```typescript
import { HoosatTxBuilder, HoosatUtils } from 'hoosat-sdk-web';

const builder = new HoosatTxBuilder();

// Add inputs
utxos.utxos.forEach(utxo => {
  builder.addInput(utxo, wallet.privateKey);
});

// Build regular transaction
builder
  .addOutput(recipientAddress, HoosatUtils.amountToSompi('1.0'))
  .setFee('2500')
  .addChangeOutput(wallet.address);

// Or build transaction with payload (for voting, data anchoring, etc.)
const voteData = {
  type: 'vote',
  pollId: 'abc123',
  optionIndex: 1
};

builder
  .addOutput(voteServiceAddress, serviceFee)
  .setSubnetworkId('0300000000000000000000000000000000000000')
  .setPayload(HoosatUtils.encodePayloadAsJson(voteData))
  .setFee(fee.toString())
  .addChangeOutput(wallet.address);

// Sign
const signedTx = builder.sign();
```

**Builder features:**
- Fluent API design
- Automatic change calculation
- Built-in validation
- Spam protection compliance
- Fee estimation
- **Payload support (voting, data anchoring)**
- **Subnetwork configuration**

[Learn more about Payload Transactions →](./guides/payload-transactions.md)

### Message Signing

Sign and verify messages for authentication:

```typescript
import { HoosatSigner } from 'hoosat-sdk-web';

// Sign message
const message = 'Login to MyApp\nTimestamp: ' + Date.now();
const signature = HoosatSigner.signMessage(
  wallet.privateKey.toString('hex'),
  message
);

// Verify signature
const isValid = HoosatSigner.verifyMessage(
  signature,
  message,
  wallet.publicKey.toString('hex')
);

// Create signed message object
const signed = HoosatSigner.createSignedMessage(
  wallet.privateKey.toString('hex'),
  message,
  wallet.address
);
// Returns: { message, signature, address, timestamp }
```

**Signing features:**
- ECDSA message signatures
- Signature verification
- Public key recovery
- Timestamped signed messages
- Authentication support

### QR Code Generation

Generate QR codes for payments and addresses:

```typescript
import { HoosatQR } from 'hoosat-sdk-web';

// Address QR
const qr = await HoosatQR.generateAddressQR('hoosat:qz7ulu...');
document.getElementById('qr').src = qr;

// Payment request QR
const paymentQR = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: 100, // HTN
  label: 'Coffee Shop',
  message: 'Order #12345'
});

// Parse payment URI
const uri = 'hoosat:qz7ulu...?amount=100&label=Payment';
const parsed = HoosatQR.parsePaymentURI(uri);
```

**QR features:**
- Address QR codes
- Payment request QR codes
- URI building and parsing
- Customizable styling
- SVG and PNG output

### Utilities

Helper functions for validation, conversion, and payload encoding/decoding:

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

// Amount conversion
const sompi = HoosatUtils.amountToSompi('1.5'); // HTN to sompi
const htn = HoosatUtils.sompiToAmount('150000000'); // sompi to HTN

// Validation
const isValid = HoosatUtils.isValidAddress(address);
const isValidTx = HoosatUtils.isValidTransactionId(txId);

// Address info
const network = HoosatUtils.getAddressNetwork(address); // 'mainnet' or 'testnet'
const type = HoosatUtils.getAddressType(address); // 'ecdsa', 'schnorr', 'p2sh'

// Formatting
const short = HoosatUtils.truncateAddress(address, 10, 8); // 'hoosat:qz7...uch02'

// Payload encoding/decoding
const hex = HoosatUtils.encodePayloadAsJson({ type: 'vote', pollId: '123' });
const data = HoosatUtils.parsePayloadAsJson(hex);
const isJson = HoosatUtils.isJsonPayload(hex);
const safe = HoosatUtils.decodePayloadSafe(hex);
```

[Learn more about Payload Utilities →](./guides/payload-transactions.md)

## Installation

```bash
npm install hoosat-sdk-web
```

## Quick Start

### 1. Generate Wallet

```typescript
import { HoosatCrypto } from 'hoosat-sdk-web';

const wallet = HoosatCrypto.generateKeyPair('mainnet');

console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey.toString('hex'));
console.log('Public Key:', wallet.publicKey.toString('hex'));
```

### 2. Check Balance

```typescript
import { HoosatWebClient, HoosatUtils } from 'hoosat-sdk-web';

const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

const result = await client.getBalance('hoosat:qz7ulu...');
console.log(`Balance: ${HoosatUtils.sompiToAmount(result.balance)} HTN`);
```

### 3. Send Transaction

```typescript
import {
  HoosatWebClient,
  HoosatTxBuilder,
  HoosatCrypto,
  HoosatUtils
} from 'hoosat-sdk-web';

// Get UTXOs
const utxos = await client.getUtxos([wallet.address]);

// Get fee recommendation
const feeRec = await client.getFeeEstimate();

// Build transaction
const builder = new HoosatTxBuilder();

utxos.utxos.forEach(utxo => {
  builder.addInput(utxo, wallet.privateKey);
});

builder
  .addOutput(recipientAddress, HoosatUtils.amountToSompi('1.0'))
  .setFee(feeRec.normalPriority.toString())
  .addChangeOutput(wallet.address);

// Sign and submit
const signedTx = builder.sign();
const result = await client.submitTransaction(signedTx);

console.log('TX ID:', result.transactionId);
```

## Browser Compatibility

Tested and working in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Use Cases

### Web Wallets

Build full-featured wallets that run entirely in the browser:

```typescript
class BrowserWallet {
  private wallet: KeyPair;
  private client: HoosatWebClient;

  constructor(client: HoosatWebClient) {
    this.client = client;
    // Load or generate wallet
    this.wallet = this.loadWallet() || HoosatCrypto.generateKeyPair();
  }

  async getBalance(): Promise<string> {
    const result = await this.client.getBalance(this.wallet.address);
    return HoosatUtils.sompiToAmount(result.balance);
  }

  async send(to: string, amount: string): Promise<string> {
    const utxos = await this.client.getUtxos([this.wallet.address]);
    const builder = new HoosatTxBuilder();

    utxos.utxos.forEach(utxo => builder.addInput(utxo, this.wallet.privateKey));

    builder
      .addOutput(to, HoosatUtils.amountToSompi(amount))
      .setFee('2500')
      .addChangeOutput(this.wallet.address);

    const signed = builder.sign();
    const result = await this.client.submitTransaction(signed);

    return result.transactionId;
  }

  private loadWallet(): KeyPair | null {
    const stored = localStorage.getItem('wallet');
    if (!stored) return null;

    const { privateKey } = JSON.parse(stored);
    return HoosatCrypto.importKeyPair(privateKey, 'mainnet');
  }
}
```

### Browser Extensions

Create Chrome/Firefox wallet extensions:

```typescript
// background.js
import { HoosatCrypto, HoosatWebClient } from 'hoosat-sdk-web';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sign_transaction') {
    const wallet = getStoredWallet();
    const signed = HoosatCrypto.signTransactionInput(
      request.tx,
      request.inputIndex,
      wallet.privateKey,
      request.utxo
    );
    sendResponse({ success: true, signedTx: signed });
  }
});
```

### DApp Integration

Enable DApp to request signatures from user wallet:

```typescript
// DApp code
async function requestPayment(amount: string) {
  if (!window.hoosatWallet) {
    throw new Error('No Hoosat wallet detected');
  }

  const tx = await window.hoosatWallet.sendTransaction({
    to: merchantAddress,
    amount,
    memo: 'Purchase #12345'
  });

  return tx.transactionId;
}
```

### Point of Sale

Build browser-based payment terminals:

```typescript
import { HoosatQR, HoosatWebClient, HoosatUtils } from 'hoosat-sdk-web';

async function createPaymentRequest(amount: number, orderId: string) {
  // Generate payment QR
  const qr = await HoosatQR.generatePaymentQR({
    address: merchantAddress,
    amount,
    label: 'Coffee Shop',
    message: `Order #${orderId}`
  });

  // Display QR
  document.getElementById('payment-qr').src = qr;

  // Monitor for payment
  const client = new HoosatWebClient({ baseUrl: API_URL });
  const interval = setInterval(async () => {
    const balance = await client.getBalance(merchantAddress);
    // Check if payment received...
  }, 2000);
}
```

## Architecture

```
┌─────────────────────────────────┐
│         Browser App             │
│  (Web Wallet / dApp / Extension)│
└────────────┬────────────────────┘
             │
             │ hoosat-sdk-web
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼─────┐
│ Crypto │      │ REST API │
│ (Local)│      │  Client  │
└────────┘      └────┬─────┘
                     │
                     │ HTTP/HTTPS
                     │
               ┌─────▼──────┐
               │   Hoosat   │
               │ REST Proxy │
               └─────┬──────┘
                     │
                     │ gRPC
                     │
               ┌─────▼──────┐
               │   Hoosat   │
               │    Node    │
               └────────────┘
```

## Security Considerations

### Private Key Storage

```typescript
// Store encrypted private keys
import { HoosatCrypto } from 'hoosat-sdk-web';

// Encrypt with user password
function encryptPrivateKey(privateKey: Buffer, password: string): string {
  // Use Web Crypto API for encryption
  // ...
  return encrypted;
}

// Store in localStorage
localStorage.setItem('encrypted_wallet', encryptedData);
```

### Never Expose Private Keys

```typescript
// Never send private keys to servers
// Never log private keys
// Never include in error messages

// Good - keep keys in memory only
let privateKey: Buffer = wallet.privateKey;

// Use key
const signed = HoosatCrypto.signTransactionInput(...);

// Clear from memory
privateKey.fill(0);
privateKey = null as any;
```

## Latest Features

### API Provider Architecture (v0.1.6)

Extensible provider system with automatic failover and performance optimization:

- **HoosatProxyProvider** - Official proxy endpoint
- **HoosatNetworkProvider** - Community network endpoint
- **MultiProvider** - Failover, fastest-response, round-robin strategies
- **Custom providers** - Build your own providers

[Read the API Provider Guide →](./guides/api-providers.md)

### Payload Transactions (v0.1.6)

Send structured data on-chain for voting, data anchoring, and application protocols:

- **Payload encoding** - JSON and text to hex conversion
- **Payload decoding** - Hex to JSON/text with validation
- **Transaction builder** - setSubnetworkId(), setPayload() methods
- **Fee calculation** - Payload size included in fees
- **Real-world examples** - Vote service, data anchoring

[Read the Payload Transactions Guide →](./guides/payload-transactions.md)

## Next Steps

- [Installation](./getting-started/installation.md) - Detailed installation guide
- [Quick Start](./getting-started/quick-start.md) - Build your first dApp
- [API Providers](./guides/api-providers.md) - Resilient API connectivity
- [Payload Transactions](./guides/payload-transactions.md) - On-chain data
- [API Reference](./api-reference) - Complete API documentation
- [Examples](./examples) - Working examples
- [Browser Wallet](./guides/browser-wallet.md) - Integration guides
