---
sidebar_position: 1
---

# Architecture Overview

Understanding the Hoosat SDK's architecture will help you build better applications and use the SDK more effectively.

## Design Philosophy

The Hoosat SDK is built with these principles:

1. **Modularity** - Each module has a single, well-defined purpose
2. **Type Safety** - Full TypeScript support with comprehensive types
3. **Error Handling** - Consistent error patterns across all methods
4. **Production Ready** - Built for real-world production use
5. **Developer Experience** - Intuitive APIs with excellent documentation

## SDK Structure

```
hoosat-sdk/
├── Client Layer        (HoosatClient)
├── Cryptography       (HoosatCrypto, HoosatSigner)
├── Transactions       (HoosatTxBuilder)
├── Fee Management     (HoosatFeeEstimator)
├── Events            (HoosatEventManager)
├── QR Codes          (HoosatQR)
└── Utilities         (HoosatUtils)
```

## Core Modules

### HoosatClient

The main entry point for all blockchain interactions.

**Purpose:** Connect to Hoosat nodes and query blockchain data

**Key responsibilities:**
- Node connection management
- gRPC communication
- Blockchain queries (blocks, transactions, balances)
- UTXO management
- Transaction submission
- Network information

**Example:**
```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

const info = await client.getInfo();
const balance = await client.getBalance(address);
```

**When to use:**
- Connecting to nodes
- Querying blockchain data
- Submitting transactions
- Monitoring network status

### HoosatCrypto

Cryptographic operations using ECDSA secp256k1.

**Purpose:** Key management and transaction signing

**Key responsibilities:**
- Key pair generation
- Private key import
- Address creation (ECDSA, Schnorr, P2SH)
- Transaction signing
- Hash generation (BLAKE3)
- Fee calculation

**Example:**
```typescript
// Generate new wallet
const wallet = HoosatCrypto.generateKeyPair('mainnet');

// Import existing wallet
const imported = HoosatCrypto.importKeyPair(privateKeyHex);

// Sign transaction
const signedTx = HoosatCrypto.signTransaction(tx, privateKey);
```

**When to use:**
- Creating or importing wallets
- Generating addresses
- Signing transactions
- Cryptographic hashing

### HoosatTxBuilder

Fluent API for building transactions.

**Purpose:** Construct and sign transactions easily

**Key responsibilities:**
- Input management
- Output management
- Automatic change calculation
- Fee setting
- Transaction signing
- Validation

**Example:**
```typescript
const builder = new HoosatTxBuilder();

builder
  .addInput(utxo, privateKey)
  .addOutput(recipientAddress, amount)
  .setFee(estimatedFee)
  .addChangeOutput(myAddress);

const signedTx = builder.sign();
```

**When to use:**
- Building any transaction
- Managing inputs and outputs
- Calculating change
- Signing transactions

### HoosatFeeEstimator

Dynamic fee estimation based on network conditions.

**Purpose:** Calculate optimal transaction fees

**Key responsibilities:**
- Mempool analysis
- Fee rate calculation
- Priority-based recommendations
- Caching for performance
- Outlier filtering

**Example:**
```typescript
const estimator = new HoosatFeeEstimator(client);

// Get all recommendations
const recs = await estimator.getRecommendations();
console.log('Normal priority:', recs.normal.feeRate);

// Estimate for specific transaction
const fee = await estimator.estimateFee(
  FeePriority.Normal,
  inputsCount,
  outputsCount
);
```

**When to use:**
- Before building transactions
- Checking current fee market
- Optimizing transaction costs
- Implementing fee selection UI

### HoosatEventManager

Real-time blockchain event streaming.

**Purpose:** Monitor blockchain changes in real-time

**Key responsibilities:**
- UTXO change subscriptions
- WebSocket connection management
- Automatic reconnection
- Event emission
- Connection state tracking

**Example:**
```typescript
// Subscribe to address
await client.events.subscribeToUtxoChanges([address]);

// Listen for changes
client.events.on(EventType.UtxoChange, (notification) => {
  console.log('UTXOs changed!');
  console.log('Added:', notification.changes.added);
  console.log('Removed:', notification.changes.removed);
});

// Handle connection events
client.events.on(EventType.Reconnected, () => {
  console.log('Reconnected successfully');
});
```

**When to use:**
- Real-time balance monitoring
- Payment detection
- Wallet synchronization
- Transaction confirmation tracking

### HoosatSigner

Message signing for off-chain authentication.

**Purpose:** Sign and verify messages for DApp authentication

**Key responsibilities:**
- Message signing (ECDSA)
- Signature verification
- Public key recovery
- DApp authentication
- Proof of ownership

**Example:**
```typescript
// Sign message
const signature = HoosatSigner.signMessage(privateKey, message);

// Verify signature
const isValid = HoosatSigner.verifyMessage(
  signature,
  message,
  publicKey
);

// Create signed message for DApp
const signedMsg = HoosatSigner.createSignedMessage(
  privateKey,
  'Login to MyApp',
  'mainnet',
  { appId: 'my-app' }
);
```

**When to use:**
- DApp authentication
- Proving address ownership
- Off-chain message signing
- Secure login systems

### HoosatQR

QR code generation and parsing.

**Purpose:** Generate payment QR codes

**Key responsibilities:**
- Address QR generation
- Payment URI QR codes
- URI parsing
- Multiple output formats

**Example:**
```typescript
// Simple address QR
const qr = await HoosatQR.generateAddressQR(address);

// Payment request with amount
const paymentQR = await HoosatQR.generatePaymentQR({
  address,
  amount: 100,
  label: 'Coffee Shop',
  message: 'Order #123'
});

// Parse scanned QR
const parsed = HoosatQR.parsePaymentURI(scannedUri);
```

**When to use:**
- Payment request generation
- Address sharing
- Mobile wallet integration
- Point-of-sale systems

### HoosatUtils

Utility functions for validation and conversion.

**Purpose:** Helper functions for common operations

**Key responsibilities:**
- Address validation
- Amount conversion (HTN ↔ sompi)
- Hash validation
- Key validation
- Formatting helpers
- Network detection

**Example:**
```typescript
// Validate address
const isValid = HoosatUtils.isValidAddress(address);

// Convert amounts
const sompi = HoosatUtils.amountToSompi('1.5');  // HTN to sompi
const htn = HoosatUtils.sompiToAmount(sompi);    // sompi to HTN

// Format
const truncated = HoosatUtils.truncateAddress(address);
const formatted = HoosatUtils.formatAmount('1.23456', 2);

// Get address info
const network = HoosatUtils.getAddressNetwork(address);
const type = HoosatUtils.getAddressType(address);
```

**When to use:**
- Validating user input
- Converting between units
- Formatting for display
- Address type detection

## Data Flow

### Query Flow

```
Application
    ↓
HoosatClient
    ↓
gRPC Client
    ↓
Hoosat Node
    ↓
Response
    ↓
BaseResult<T>
    ↓
Application
```

### Transaction Flow

```
Application
    ↓
HoosatTxBuilder
    ↓
HoosatCrypto (signing)
    ↓
HoosatClient.submitTransaction()
    ↓
gRPC Client
    ↓
Hoosat Node
    ↓
Transaction ID
    ↓
Application
```

### Event Flow

```
Hoosat Node
    ↓
gRPC Stream
    ↓
HoosatEventManager
    ↓
Event Emitter
    ↓
Application Listeners
```

## Error Handling Pattern

All SDK methods follow a consistent error handling pattern:

```typescript
interface BaseResult<T> {
  ok: boolean;
  result: T | null;
  error: string | null;
}
```

**Usage:**
```typescript
const result = await client.getBalance(address);

if (result.ok) {
  // Success - result.result contains data
  const balance = result.result.balance;
} else {
  // Error - result.error contains error message
  console.error('Error:', result.error);
}
```

**Benefits:**
- No try-catch needed for expected errors
- Explicit success/error handling
- Type-safe error checking
- Consistent across all methods

## Module Dependencies

```
HoosatClient
  ├── HoosatEventManager (embedded)
  ├── gRPC Client
  └── Protocol Buffers

HoosatTxBuilder
  ├── HoosatCrypto (for signing)
  └── HoosatUtils (for validation)

HoosatFeeEstimator
  └── HoosatClient (for mempool data)

HoosatSigner
  ├── HoosatCrypto (for hashing)
  └── secp256k1 library

HoosatQR
  ├── HoosatUtils (for validation)
  └── qrcode library

HoosatUtils
  └── No dependencies (pure functions)
```

## Performance Considerations

### Caching

**Fee Estimator** caches mempool data:
```typescript
const estimator = new HoosatFeeEstimator(client, {
  cacheDuration: 60000  // Cache for 1 minute
});
```

### Connection Pooling

**Multi-node setup** maintains persistent connections:
```typescript
const client = new HoosatClient({
  nodes: [...],  // Connections managed automatically
  healthCheckInterval: 30000
});
```

### Event Streaming

**EventManager** uses single WebSocket connection:
```typescript
// Single connection for all addresses
await client.events.subscribeToUtxoChanges([
  address1,
  address2,
  address3
]);
```

## Type System

The SDK provides comprehensive TypeScript types:

```typescript
import type {
  // Client types
  HoosatClientConfig,
  NodeConfig,
  NodeStatus,

  // Transaction types
  Transaction,
  TransactionInput,
  TransactionOutput,
  UtxoForSigning,

  // Result types
  BaseResult,
  GetInfo,
  GetBalance,

  // Event types
  EventManagerConfig,
  UtxoChangeNotification,

  // Crypto types
  KeyPair,
  SignedMessage
} from 'hoosat-sdk';
```

## Next Steps

