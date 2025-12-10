---
sidebar_position: 3
---

# Payload Transactions

**Send structured data on-chain with transaction payloads for voting, data anchoring, and application protocols.**

## Overview

Hoosat blockchain supports **arbitrary data payloads** in transactions through **subnetwork 0x03**. This enables:

- **Voting systems** - On-chain polls and governance
- **Data anchoring** - Timestamped document hashes
- **Application protocols** - Custom dApp communication
- **Mining pool identification** - Worker and rig tracking
- **NFT metadata** - Asset attributes and provenance

Payloads can contain:
- **JSON data** - Structured application data
- **Plain text** - Messages and identifiers
- **Binary data** - Hashes and signatures

## Quick Start

### Send Vote Transaction

```typescript
import {
  HoosatBrowserClient,
  HoosatTxBuilder,
  HoosatUtils,
  createHoosatProxyProvider
} from 'hoosat-sdk-web';

const client = new HoosatBrowserClient(createHoosatProxyProvider());

// Prepare vote data
const voteData = {
  type: 'vote',
  pollId: '550e8400-e29b-41d4-a716-446655440000',
  optionIndex: 2,
  timestamp: Date.now()
};

// Encode as hex payload
const payload = HoosatUtils.encodePayloadAsJson(voteData);
const payloadSize = payload.length / 2; // bytes

// Get UTXOs
const utxos = await client.getUtxos([wallet.address]);

// Calculate fee (including payload)
const fee = HoosatCrypto.calculateMinFee(1, 2, payloadSize);

// Build transaction
const builder = new HoosatTxBuilder();

builder
  .addInput(utxos[0], wallet.privateKey)
  .addOutput(voteServiceAddress, serviceFee)
  .setSubnetworkId('0300000000000000000000000000000000000000')
  .setPayload(payload)
  .setFee(fee.toString())
  .addChangeOutput(wallet.address);

const signedTx = builder.sign();
const txId = await client.submitTransaction(signedTx);

console.log('Vote cast! TX:', txId);
```

## Encoding Payloads

### HoosatUtils.encodePayload()

Encode plain text to hex payload.

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

// Simple text
const hex = HoosatUtils.encodePayload('Hello World');
console.log(hex); // "48656c6c6f20576f726c64"

// Mining worker ID
const workerHex = HoosatUtils.encodePayload('RIG-GPU-01');

// Transaction memo
const memoHex = HoosatUtils.encodePayload('Payment for services');
```

### HoosatUtils.encodePayloadAsJson()

Encode JSON object to hex payload.

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

// Vote data
const voteData = {
  type: 'vote',
  pollId: 'abc123',
  optionIndex: 1,
  timestamp: Date.now()
};

const hex = HoosatUtils.encodePayloadAsJson(voteData);
// "7b2274797065223a22766f7465222c22706f6c6c4964223a22616263313233222c..."

// Poll creation
const pollData = {
  type: 'poll_create',
  v: 1,
  title: 'Network Upgrade Vote',
  options: ['Approve', 'Reject', 'Abstain'],
  startDate: Date.now(),
  endDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
  votingType: 'single',
  category: 'governance'
};

const pollHex = HoosatUtils.encodePayloadAsJson(pollData);
```

## Decoding Payloads

### HoosatUtils.decodePayload()

Decode hex payload to UTF-8 text.

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

const hex = '48656c6c6f20576f726c64';
const text = HoosatUtils.decodePayload(hex);
console.log(text); // "Hello World"

// With 0x prefix
const hex2 = '0x48656c6c6f';
const text2 = HoosatUtils.decodePayload(hex2);
console.log(text2); // "Hello"
```

### HoosatUtils.parsePayloadAsJson()

Decode and parse JSON payload.

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

// Vote transaction
const voteHex = '7b2274797065223a22766f7465222c22706f6c6c4964223a22616263313233227d';
const voteData = HoosatUtils.parsePayloadAsJson(voteHex);

console.log(voteData);
// { type: 'vote', pollId: 'abc123', ... }

// Typed parsing
interface VotePayload {
  type: 'vote';
  pollId: string;
  optionIndex: number;
  timestamp: number;
}

const typedVote = HoosatUtils.parsePayloadAsJson<VotePayload>(voteHex);
console.log(`Voted for option ${typedVote.optionIndex}`);
```

### HoosatUtils.isJsonPayload()

Check if payload contains JSON.

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

const jsonHex = '7b2274797065223a22766f7465227d';
console.log(HoosatUtils.isJsonPayload(jsonHex)); // true

const textHex = '48656c6c6f';
console.log(HoosatUtils.isJsonPayload(textHex)); // false

// Conditional parsing
if (HoosatUtils.isJsonPayload(payload)) {
  const data = HoosatUtils.parsePayloadAsJson(payload);
  console.log('Structured data:', data);
} else {
  const text = HoosatUtils.decodePayload(payload);
  console.log('Text payload:', text);
}
```

### HoosatUtils.decodePayloadSafe()

Safe decoding with validation metadata.

```typescript
import { HoosatUtils } from 'hoosat-sdk-web';

const result = HoosatUtils.decodePayloadSafe(payload);

console.log({
  decoded: result.decoded,        // Decoded text
  isValidUtf8: result.isValidUtf8, // UTF-8 valid?
  isJson: result.isJson,          // Valid JSON?
  raw: result.raw                 // Original hex
});

// Safe transaction processing
function processPayload(hexPayload: string) {
  const { decoded, isValidUtf8, isJson } = HoosatUtils.decodePayloadSafe(hexPayload);

  if (isJson) {
    const data = JSON.parse(decoded);
    handleJsonPayload(data);
  } else if (isValidUtf8) {
    handleTextPayload(decoded);
  } else {
    handleBinaryPayload(hexPayload);
  }
}
```

## Building Payload Transactions

### HoosatTxBuilder with Payload

```typescript
import {
  HoosatTxBuilder,
  HoosatUtils,
  HoosatCrypto
} from 'hoosat-sdk-web';

const builder = new HoosatTxBuilder();

// Prepare payload
const payload = HoosatUtils.encodePayloadAsJson({
  type: 'vote',
  pollId: 'abc123',
  optionIndex: 1
});

// Build transaction
builder
  .addInput(utxo, wallet.privateKey)
  .addOutput(recipient, amount)
  .setSubnetworkId('0300000000000000000000000000000000000000') // REQUIRED for payloads
  .setPayload(payload) // Set hex-encoded payload
  .setFee(fee.toString())
  .addChangeOutput(wallet.address);

const signedTx = builder.sign();
```

### Fee Calculation with Payload

Payloads increase transaction size, affecting fees:

```typescript
import { HoosatCrypto, HoosatUtils } from 'hoosat-sdk-web';

// Prepare payload
const payload = HoosatUtils.encodePayloadAsJson(data);
const payloadSize = payload.length / 2; // Bytes

// Calculate fee including payload
const fee = HoosatCrypto.calculateMinFee(
  inputs.length,    // Number of inputs
  outputs.length,   // Number of outputs
  payloadSize       // Payload size in bytes
);

builder.setFee(fee.toString());
```

## Practical Examples

### Vote Service Integration

Complete vote casting workflow:

```typescript
import {
  HoosatBrowserClient,
  HoosatTxBuilder,
  HoosatUtils,
  HoosatCrypto,
  createHoosatProxyProvider
} from 'hoosat-sdk-web';

interface VoteParams {
  wallet: { address: string; privateKey: Buffer };
  voteServiceAddress: string;
  serviceFee: string; // sompi
  pollId: string;
  optionIndex: number;
}

async function castVote(params: VoteParams): Promise<string> {
  const client = new HoosatBrowserClient(createHoosatProxyProvider());

  // 1. Encode vote payload
  const voteData = {
    type: 'vote',
    pollId: params.pollId,
    optionIndex: params.optionIndex,
    timestamp: Date.now()
  };

  const payload = HoosatUtils.encodePayloadAsJson(voteData);
  const payloadSize = payload.length / 2;

  console.log(`Vote payload: ${payloadSize} bytes`);

  // 2. Get UTXOs
  const utxos = await client.getUtxos([params.wallet.address]);

  if (utxos.length === 0) {
    throw new Error('No UTXOs available');
  }

  // 3. Calculate fee (service fee + tx fee)
  const txFee = HoosatCrypto.calculateMinFee(1, 2, payloadSize);

  // 4. Build transaction
  const builder = new HoosatTxBuilder();

  builder.addInput(utxos[0], params.wallet.privateKey);
  builder.addOutput(params.voteServiceAddress, params.serviceFee);
  builder.setSubnetworkId('0300000000000000000000000000000000000000');
  builder.setPayload(payload);
  builder.setFee(txFee.toString());
  builder.addChangeOutput(params.wallet.address);

  // 5. Sign and submit
  const signedTx = builder.sign();
  const txId = await client.submitTransaction(signedTx);

  console.log('Vote cast! TX:', txId);
  return txId;
}

// Usage
const txId = await castVote({
  wallet: myWallet,
  voteServiceAddress: 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
  serviceFee: HoosatUtils.amountToSompi('0.01'),
  pollId: '550e8400-e29b-41d4-a716-446655440000',
  optionIndex: 2
});
```

### Create Poll

```typescript
interface PollParams {
  wallet: { address: string; privateKey: Buffer };
  serviceAddress: string;
  title: string;
  description: string;
  options: string[];
  durationDays: number;
  votingType: 'single' | 'multiple';
  votingMode: 'standard' | 'weighted';
  category: string;
  minBalance?: number;
}

async function createPoll(params: PollParams): Promise<string> {
  const client = new HoosatBrowserClient(createHoosatProxyProvider());

  // 1. Build poll payload
  const pollData = {
    type: 'poll_create',
    v: 1,
    title: params.title,
    description: params.description,
    options: params.options,
    startDate: Date.now(),
    endDate: Date.now() + (params.durationDays * 24 * 60 * 60 * 1000),
    votingType: params.votingType,
    votingMode: params.votingMode,
    category: params.category,
    minBalance: params.minBalance || 0
  };

  const payload = HoosatUtils.encodePayloadAsJson(pollData);
  const payloadSize = payload.length / 2;

  console.log(`Poll payload: ${payloadSize} bytes`);
  console.log('Poll data:', pollData);

  // 2. Get UTXOs
  const utxos = await client.getUtxos([params.wallet.address]);

  // 3. Calculate fees
  const serviceFee = HoosatUtils.amountToSompi('0.1'); // 0.1 HTN for poll creation
  const txFee = HoosatCrypto.calculateMinFee(1, 2, payloadSize);

  // 4. Build transaction
  const builder = new HoosatTxBuilder();

  builder.addInput(utxos[0], params.wallet.privateKey);
  builder.addOutput(params.serviceAddress, serviceFee);
  builder.setSubnetworkId('0300000000000000000000000000000000000000');
  builder.setPayload(payload);
  builder.setFee(txFee.toString());
  builder.addChangeOutput(params.wallet.address);

  // 5. Submit
  const signedTx = builder.sign();
  const txId = await client.submitTransaction(signedTx);

  console.log('Poll created! TX:', txId);
  return txId;
}

// Usage
const txId = await createPoll({
  wallet: myWallet,
  serviceAddress: 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
  title: 'Community Treasury Vote',
  description: 'How should we allocate Q1 2025 funds?',
  options: [
    'Development (40%)',
    'Marketing (30%)',
    'Security (20%)',
    'Reserve (10%)'
  ],
  durationDays: 7,
  votingType: 'single',
  votingMode: 'weighted',
  category: 'governance',
  minBalance: 100
});
```

### Data Anchoring

Anchor document hashes on-chain:

```typescript
async function anchorDocument(
  wallet: { address: string; privateKey: Buffer },
  documentHash: string,
  metadata: {
    filename: string;
    size: number;
    parties: string[];
  }
): Promise<string> {
  const client = new HoosatBrowserClient(createHoosatProxyProvider());

  // 1. Prepare anchor payload
  const anchorData = {
    type: 'anchor',
    v: 1,
    documentHash,
    timestamp: Date.now(),
    metadata
  };

  const payload = HoosatUtils.encodePayloadAsJson(anchorData);
  const payloadSize = payload.length / 2;

  // 2. Get UTXOs
  const utxos = await client.getUtxos([wallet.address]);

  // 3. Calculate fee
  const fee = HoosatCrypto.calculateMinFee(1, 1, payloadSize);

  // 4. Build self-transaction (send to self with payload)
  const builder = new HoosatTxBuilder();

  const minAmount = '1000'; // Dust threshold

  builder.addInput(utxos[0], wallet.privateKey);
  builder.addOutput(wallet.address, minAmount);
  builder.setSubnetworkId('0300000000000000000000000000000000000000');
  builder.setPayload(payload);
  builder.setFee(fee.toString());
  builder.addChangeOutput(wallet.address);

  // 5. Submit
  const signedTx = builder.sign();
  const txId = await client.submitTransaction(signedTx);

  console.log('Document anchored! TX:', txId);
  return txId;
}

// Usage
const txId = await anchorDocument(
  myWallet,
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  {
    filename: 'contract_v2.pdf',
    size: 245760,
    parties: ['Alice Corp', 'Bob LLC']
  }
);
```

## Browser Wallet Integration

### Window Injected Provider

```typescript
// Wallet extension: inject provider
window.hoosat = {
  async sendTransaction(params: {
    to: string;
    amount: number | string;
    payload?: string;
  }): Promise<{ transactionId: string }> {
    // Get active wallet
    const wallet = await getActiveWallet();

    // Build transaction with payload
    const builder = new HoosatTxBuilder();
    const utxos = await getUtxos(wallet.address);

    const amount = typeof params.amount === 'number'
      ? HoosatUtils.amountToSompi(params.amount.toString())
      : params.amount;

    let payloadSize = 0;

    builder.addInput(utxos[0], wallet.privateKey);
    builder.addOutput(params.to, amount);

    // Add payload if provided
    if (params.payload) {
      builder.setSubnetworkId('0300000000000000000000000000000000000000');
      builder.setPayload(params.payload);
      payloadSize = params.payload.length / 2;
    }

    // Calculate fee
    const fee = HoosatCrypto.calculateMinFee(1, 2, payloadSize);
    builder.setFee(fee.toString());
    builder.addChangeOutput(wallet.address);

    // Sign and submit
    const signedTx = builder.sign();
    const txId = await submitTransaction(signedTx);

    return { transactionId: txId };
  }
};
```

### DApp Usage

```typescript
// DApp: use injected provider
async function castVote(pollId: string, optionIndex: number) {
  if (!window.hoosat) {
    throw new Error('Hoosat wallet not detected');
  }

  // Encode vote payload
  const voteData = {
    type: 'vote',
    pollId,
    optionIndex,
    timestamp: Date.now()
  };

  const payload = HoosatUtils.encodePayloadAsJson(voteData);

  // Request transaction with payload
  const result = await window.hoosat.sendTransaction({
    to: 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
    amount: 0.01, // Service fee in HTN
    payload
  });

  console.log('Vote cast! TX:', result.transactionId);
  return result.transactionId;
}
```

## Best Practices

### 1. Always Use Subnetwork 0x03

Payloads ONLY work on subnetwork 0x03:

```typescript
// Correct
builder.setSubnetworkId('0300000000000000000000000000000000000000');
builder.setPayload(payload);

// Wrong - will fail
builder.setPayload(payload);
// Missing setSubnetworkId() ❌
```

### 2. Include Payload Size in Fee

```typescript
// Calculate fee including payload
const payload = HoosatUtils.encodePayloadAsJson(data);
const payloadSize = payload.length / 2; // bytes

const fee = HoosatCrypto.calculateMinFee(
  inputs.length,
  outputs.length,
  payloadSize // IMPORTANT
);
```

### 3. Validate Payload Size

```typescript
const MAX_PAYLOAD_SIZE = 10000; // 10KB

const payload = HoosatUtils.encodePayloadAsJson(data);

if (payload.length / 2 > MAX_PAYLOAD_SIZE) {
  throw new Error('Payload too large');
}
```

### 4. Version Your Payloads

```typescript
// Good - future-proof
const payload = {
  v: 1,  // Schema version
  type: 'vote',
  // ... data
};

// Can upgrade schema later:
// v: 2 → new fields
// v: 3 → breaking changes
```

### 5. Include Timestamps

```typescript
const payload = {
  type: 'vote',
  timestamp: Date.now(), // UNIX timestamp
  // ... data
};
```

### 6. Handle Encoding Errors

```typescript
try {
  const payload = HoosatUtils.encodePayloadAsJson(data);
  builder.setPayload(payload);
} catch (error) {
  console.error('Payload encoding failed:', error);
  // Handle: invalid JSON, circular refs, BigInt, etc.
}
```

### 7. Safe Decoding

```typescript
// Use safe decode for unknown payloads
const { decoded, isValidUtf8, isJson } = HoosatUtils.decodePayloadSafe(payload);

if (isJson) {
  try {
    const data = JSON.parse(decoded);
    processVote(data);
  } catch {
    console.error('Invalid JSON payload');
  }
} else if (isValidUtf8) {
  console.log('Text payload:', decoded);
} else {
  console.log('Binary payload');
}
```

## Real-World Examples

### Vote Service Poll

```typescript
// Actual vote service payload
const pollPayload = {
  type: 'poll_create',
  v: 1,
  title: 'Super pupper',
  description: 'So test description',
  options: ['1', '3', '4', '10'],
  startDate: 1765307520000,
  endDate: 1765566720000,
  votingType: 'single',
  votingMode: 'standard',
  category: 'marketing',
  minBalance: 11
};

const hex = HoosatUtils.encodePayloadAsJson(pollPayload);
// Transaction sent on Dec 9, 2025
```

### Mining Worker ID

```typescript
// Mining pool coinbase payload
const workerInfo = '1.6.2/hoo_gpu/1.2.12 via htn-stratum-bridge_v1.6.0 as worker RIG02';
const hex = HoosatUtils.encodePayload(workerInfo);
// Used by mining pools to identify workers
```

## Payload Utilities Reference

| Method | Description | Input | Output |
|--------|-------------|-------|--------|
| `encodePayload(text)` | Encode UTF-8 to hex | `string` | `string` (hex) |
| `encodePayloadAsJson(data)` | Encode JSON to hex | `unknown` | `string` (hex) |
| `decodePayload(hex)` | Decode hex to UTF-8 | `string` (hex) | `string` |
| `parsePayloadAsJson<T>(hex)` | Decode and parse JSON | `string` (hex) | `T` |
| `isJsonPayload(hex)` | Check if JSON | `string` (hex) | `boolean` |
| `decodePayloadSafe(hex)` | Safe decode with metadata | `string` (hex) | `object` |

## Next Steps

- [API Providers](./api-providers.md) - Resilient API connectivity
- [Browser Wallet](./browser-wallet.md) - Complete wallet implementation
- [API Reference](../api-reference) - Full API documentation
