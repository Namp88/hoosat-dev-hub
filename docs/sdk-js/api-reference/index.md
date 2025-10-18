---
sidebar_position: 1
---

# API Reference Overview

Complete API reference for the Hoosat JavaScript/TypeScript SDK.

## Core Modules

The Hoosat SDK provides 8 core modules for interacting with the Hoosat blockchain:

### [HoosatClient](./client.md)

Main client for connecting to Hoosat nodes and querying blockchain data.

**Key Features:**
- Node connection management
- Blockchain queries (blocks, DAG info, network stats)
- Balance and UTXO queries
- Transaction submission
- Multi-node failover support

**Quick Example:**
```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

const balance = await client.getBalance(address);
```

### [HoosatCrypto](./crypto.md)

Cryptographic operations for key management and transactions.

**Key Features:**
- Key pair generation (ECDSA secp256k1)
- Wallet import/export
- Address generation
- Transaction signing
- BLAKE3 hashing

**Quick Example:**
```typescript
const wallet = HoosatCrypto.generateKeyPair('mainnet');
console.log('Address:', wallet.address);
```

### [HoosatTxBuilder](./tx-builder.md)

Fluent transaction builder with automatic change calculation.

**Key Features:**
- Chainable API
- Automatic change calculation
- Input/output management
- Built-in validation
- Spam protection compliance

**Quick Example:**
```typescript
const builder = new HoosatTxBuilder();

builder
  .addInput(utxo, wallet.privateKey)
  .addOutput(recipientAddress, amount)
  .setFee(feeEstimate.totalFee)
  .addChangeOutput(wallet.address);

const signedTx = builder.sign();
```

### [HoosatFeeEstimator](./fee-estimator.md)

Dynamic fee estimation based on network conditions.

**Key Features:**
- Real-time network analysis
- Four priority levels (Low, Normal, High, Urgent)
- Mempool-based recommendations
- Intelligent caching
- Mass-based calculation

**Quick Example:**
```typescript
const estimator = new HoosatFeeEstimator(client);

const fee = await estimator.estimateFee(
  FeePriority.Normal,
  2,  // inputs
  2   // outputs
);
```

### [HoosatUtils](./utils.md)

Utility functions for validation, conversion, and formatting.

**Key Features:**
- Amount conversion (HTN ↔ sompi)
- Address validation
- Network detection
- Amount formatting
- Private key validation

**Quick Example:**
```typescript
// Convert HTN to sompi
const sompi = HoosatUtils.amountToSompi('1.5');

// Validate address
if (HoosatUtils.isValidAddress(address)) {
  // Process address
}
```

### [HoosatEventManager](./event-manager.md)

Real-time event streaming and WebSocket management.

**Key Features:**
- UTXO change monitoring
- Block notifications
- Virtual DAG updates
- Automatic reconnection
- Multi-subscription support

**Quick Example:**
```typescript
await client.events.subscribeToUtxoChanges([address]);

client.events.on(EventType.UtxoChange, (notification) => {
  console.log('Balance changed!');
});
```

### [HoosatQR](./qr.md)

QR code generation and payment URI handling.

**Key Features:**
- Payment request QR codes
- Address QR codes
- URI encoding/decoding
- Customizable styling
- Mobile wallet integration

**Quick Example:**
```typescript
const qr = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: HoosatUtils.amountToSompi('1.5'),
  label: 'My Store',
  message: 'Order #12345'
});
```

### [HoosatSigner](./signer.md)

Message signing and verification for authentication.

**Key Features:**
- Cryptographic message signing
- Signature verification
- Address ownership proofs
- Authentication challenges
- Authorization tokens

**Quick Example:**
```typescript
const signature = HoosatSigner.signMessage(message, wallet.privateKey);

const isValid = HoosatSigner.verifyMessage(
  message,
  signature,
  wallet.address
);
```

## Type Definitions

### Common Types

```typescript
// Network type
type HoosatNetwork = 'mainnet' | 'testnet';

// Key pair
interface KeyPair {
  address: string;
  publicKey: Buffer;
  privateKey: Buffer;
}

// API result wrapper
interface BaseResult<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

// UTXO entry
interface UtxoForSigning {
  outpoint: {
    transactionId: string;
    index: number;
  };
  utxoEntry: {
    amount: string;
    scriptPublicKey: {
      scriptPublicKey: string;
      version: number;
    };
    blockDaaScore: string;
    isCoinbase: boolean;
  };
}

// Transaction
interface Transaction {
  version: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  lockTime: string;
  subnetworkId: string;
  gas: string;
  payload: string;
}
```

### Event Types

```typescript
enum EventType {
  UtxoChange = 'utxo_change',
  BlockAdded = 'block_added',
  VirtualDagChanged = 'virtual_dag_changed'
}

interface UtxoChangeNotification {
  address: string;
  added: UtxoEntry[];
  removed: UtxoEntry[];
}

interface BlockAddedNotification {
  blockHash: string;
  blockHeader: BlockHeader;
}
```

### Fee Estimation

```typescript
enum FeePriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Urgent = 'urgent'
}

interface FeeEstimate {
  feeRate: number;
  totalFee: string;
  priority: FeePriority;
}

interface FeeRecommendations {
  low: FeeEstimate;
  normal: FeeEstimate;
  high: FeeEstimate;
  urgent: FeeEstimate;
  mempoolSize: number;
  timestamp: number;
  medianFeeRate: number;
  averageFeeRate: number;
}
```

## Module Comparison

| Module | Purpose | Common Use Cases |
|--------|---------|------------------|
| **HoosatClient** | Blockchain queries | Check balance, get UTXOs, submit transactions |
| **HoosatCrypto** | Key management | Generate wallets, sign transactions, hash data |
| **HoosatTxBuilder** | Build transactions | Send payments, consolidate UTXOs, batch transfers |
| **HoosatFeeEstimator** | Fee calculation | Determine optimal fees, network analysis |
| **HoosatUtils** | Validation & conversion | Validate addresses, convert amounts, format data |
| **HoosatEventManager** | Real-time monitoring | Track balance changes, monitor blocks |
| **HoosatQR** | Payment requests | Generate QR codes, handle payment URIs |
| **HoosatSigner** | Authentication | Prove ownership, sign messages, verify signatures |

## Quick Start Examples

### Check Balance

```typescript
import { HoosatClient, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

const result = await client.getBalance(address);

if (result.ok) {
  const htn = HoosatUtils.sompiToAmount(result.result.balance);
  console.log(`Balance: ${htn} HTN`);
}
```

### Send Transaction

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatTxBuilder,
  HoosatFeeEstimator,
  HoosatUtils,
  FeePriority
} from 'hoosat-sdk';

const client = new HoosatClient({ host: '54.38.176.95', port: 42420 });
const wallet = HoosatCrypto.importKeyPair(process.env.WALLET_PRIVATE_KEY!);

// Get UTXOs
const utxosResult = await client.getUtxosByAddresses([wallet.address]);
const utxos = utxosResult.result.utxos;

// Estimate fee
const feeEstimator = new HoosatFeeEstimator(client);
const fee = await feeEstimator.estimateFee(FeePriority.Normal, utxos.length, 2);

// Build and sign transaction
const builder = new HoosatTxBuilder();

for (const utxo of utxos) {
  builder.addInput(utxo, wallet.privateKey);
}

builder
  .addOutput(recipientAddress, HoosatUtils.amountToSompi('1.0'))
  .setFee(fee.totalFee)
  .addChangeOutput(wallet.address);

const signedTx = builder.sign();

// Submit
const result = await client.submitTransaction(signedTx);

if (result.ok) {
  console.log('TX ID:', result.result.transactionId);
}
```

### Monitor Balance

```typescript
import { HoosatClient, EventType, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient({ host: '54.38.176.95', port: 42420 });

await client.events.subscribeToUtxoChanges([address]);

client.events.on(EventType.UtxoChange, (notification) => {
  let change = 0n;

  for (const utxo of notification.added) {
    change += BigInt(utxo.utxoEntry.amount);
  }

  for (const utxo of notification.removed) {
    change -= BigInt(utxo.utxoEntry.amount);
  }

  console.log('Balance changed by:', HoosatUtils.sompiToAmount(change), 'HTN');
});
```

## Error Handling

All SDK methods use a consistent error handling pattern:

```typescript
interface BaseResult<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

// Usage
const result = await client.getBalance(address);

if (result.ok) {
  // Success - use result.result
  console.log('Balance:', result.result.balance);
} else {
  // Error - check result.error
  console.error('Error:', result.error);
}
```

**Benefits:**
- Type-safe error handling
- No thrown exceptions for API calls
- Explicit success/failure checking
- Detailed error messages

## Constants

### Network Prefixes

```typescript
const MAINNET_PREFIX = 'hoosat:';
const TESTNET_PREFIX = 'hoosattest:';
```

### Unit Conversion

```typescript
const SOMPI_PER_HTN = 100000000n;  // 1 HTN = 100,000,000 sompi
```

### Dust Threshold

```typescript
const DUST_THRESHOLD = 1000n;  // 1000 sompi
```

### Address Versions

```typescript
const ADDRESS_VERSION_SCHNORR = 0x00;
const ADDRESS_VERSION_ECDSA = 0x01;
const ADDRESS_VERSION_P2SH = 0x08;
```

### Spam Protection Limits

```typescript
const MAX_RECIPIENT_OUTPUTS = 2;   // Max recipients per transaction
const MAX_TOTAL_OUTPUTS = 3;       // Max total outputs (recipients + change)
```

## Next Steps

- [Getting Started](../getting-started/installation.md) - Install and setup
- [Quick Start Guide](../getting-started/quick-start.md) - First transaction
- [Core Concepts](../core-concepts/architecture.md) - Understand architecture
- [Examples](../examples) - Working code examples
- [Guides](../guides) - Detailed usage guides
