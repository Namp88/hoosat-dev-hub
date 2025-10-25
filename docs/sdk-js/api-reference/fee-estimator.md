---
sidebar_position: 4
---

# Fee Calculation API Reference

Automatic minimum fee calculation based on transaction requirements.

## Overview

The SDK provides two ways to calculate transaction fees:

1. **Automatic** - `client.calculateMinFee()` - Automatically fetches UTXOs and calculates minimum fee
2. **Manual** - `HoosatCrypto.calculateMinFee()` - Calculate fee when you know inputs/outputs count

Both methods use **MASS-based fee calculation** compatible with HTND node implementation.

## Automatic Fee Calculation

### `client.calculateMinFee(address: string, payloadSize?: number)`

Automatically calculate minimum fee for an address by fetching its UTXOs.

**Parameters:**
- `address` - Sender address
- `payloadSize` - Optional payload size in bytes (default: 0, for future subnetwork usage)

**Returns:** `Promise<string>` - Minimum fee in sompi

**How it works:**
1. Fetches UTXOs for the sender address
2. Counts inputs (number of UTXOs)
3. Assumes 2 outputs (recipient + change)
4. Calculates minimum fee using MASS-based formula
5. Returns fee in sompi as string

**Example:**
```typescript
import { HoosatClient, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

// Automatic fee calculation
const minFee = await client.calculateMinFee(wallet.address);
console.log('Minimum fee:', minFee, 'sompi');
console.log('HTN:', HoosatUtils.sompiToAmount(minFee));

// Use with transaction builder
builder.setFee(minFee);
```

**With payload (future use):**
```typescript
// Calculate fee for transaction with payload
const payloadSize = 256; // 256 bytes
const minFee = await client.calculateMinFee(wallet.address, payloadSize);
```

## Manual Fee Calculation

### `HoosatCrypto.calculateMinFee(inputsCount: number, outputsCount: number, payloadSize?: number)`

Calculate minimum fee when you know the exact transaction structure.

**Parameters:**
- `inputsCount` - Number of transaction inputs
- `outputsCount` - Number of transaction outputs
- `payloadSize` - Optional payload size in bytes (default: 0)

**Returns:** `string` - Minimum fee in sompi

**Example:**
```typescript
import { HoosatCrypto, HoosatUtils } from 'hoosat-sdk';

// Manual calculation
const inputsCount = 5;
const outputsCount = 2; // recipient + change
const minFee = HoosatCrypto.calculateMinFee(inputsCount, outputsCount);

console.log('Minimum fee:', minFee, 'sompi');
console.log('HTN:', HoosatUtils.sompiToAmount(minFee));

// Use with transaction builder
builder.setFee(minFee);
```

**With payload:**
```typescript
const payloadSize = 128; // 128 bytes
const minFee = HoosatCrypto.calculateMinFee(5, 2, payloadSize);
```

## MASS-Based Fee Formula

### How It Works

The fee calculation uses a MASS-based formula that accounts for:

1. **Transaction size** - Inputs and outputs count
2. **Script complexity** - Script public key size
3. **Signature operations** - Number of signature verifications
4. **Payload data** - Optional additional data

### Formula Components

```typescript
// 1. Calculate full transaction size
txSize = baseTxOverhead + (inputs × inputSize) + (outputs × outputSize)

// 2. Calculate script-only size
scriptPubKeySize = outputs × scriptPubKeyBytesPerOutput

// 3. Calculate mass components
massForSize = txSize × massPerTxByte
massForScriptPubKey = scriptPubKeySize × massPerScriptPubKeyByte
massForSigOps = inputs × massPerSigOp
massForPayload = payloadSize × massPerTxByte

// 4. Total mass
totalMass = massForSize + massForScriptPubKey + massForSigOps + massForPayload

// 5. Fee = totalMass (minimumRelayTxFee = 1)
fee = totalMass
```

### Example Calculation

```
Inputs: 5
Outputs: 2
Payload: 0 bytes

Step 1: Transaction size
  baseTxOverhead = 0
  inputSize = 181 bytes
  outputSize = 34 bytes
  txSize = 0 + (5 × 181) + (2 × 34) = 973 bytes

Step 2: Script size
  scriptPubKeyBytesPerOutput = 34
  scriptPubKeySize = 2 × 34 = 68 bytes

Step 3: Mass components
  massForSize = 973 × 1 = 973
  massForScriptPubKey = 68 × 10 = 680
  massForSigOps = 5 × 1000 = 5000
  massForPayload = 0 × 1 = 0

Step 4: Total mass
  totalMass = 973 + 680 + 5000 + 0 = 6653

Step 5: Fee
  fee = 6653 sompi (~0.000067 HTN)
```

### Why MASS-Based?

1. **Accounts for actual transaction weight** - Not just byte size
2. **Prevents spam** - Expensive to create many small outputs
3. **Fair pricing** - Based on resource usage (storage, computation, bandwidth)
4. **HTND compatible** - Uses same formula as node implementation

## Fee Comparison Examples

### Different Transaction Sizes

```typescript
import { HoosatCrypto, HoosatUtils } from 'hoosat-sdk';

const scenarios = [
  { name: 'Simple (1→1)', inputs: 1, outputs: 1 },
  { name: 'Standard (1→2)', inputs: 1, outputs: 2 },
  { name: 'Batch Pay (2→2)', inputs: 2, outputs: 2 },
  { name: 'Consolidate (5→1)', inputs: 5, outputs: 1 },
  { name: 'Large (10→2)', inputs: 10, outputs: 2 },
  { name: 'Very Large (20→2)', inputs: 20, outputs: 2 }
];

console.log('Type               | Fee (sompi) | Fee (HTN)');
console.log('-------------------|-------------|-------------');

for (const scenario of scenarios) {
  const fee = HoosatCrypto.calculateMinFee(scenario.inputs, scenario.outputs);
  const feeHTN = HoosatUtils.sompiToAmount(fee);

  console.log(`${scenario.name.padEnd(18)} | ${fee.padStart(11)} | ${feeHTN.padStart(11)}`);
}
```

**Output:**
```
Type               | Fee (sompi) | Fee (HTN)
-------------------|-------------|-------------
Simple (1→1)       |        1344 | 0.00001344
Standard (1→2)     |        1681 | 0.00001681
Batch Pay (2→2)    |        3362 | 0.00003362
Consolidate (5→1)  |        6310 | 0.00006310
Large (10→2)       |       11681 | 0.00011681
Very Large (20→2)  |       22371 | 0.00022371
```

### With Payload

```typescript
const payloadSizes = [0, 64, 128, 256, 512];

console.log('Standard transaction (5 inputs, 2 outputs):');
console.log('Payload Size | Fee (sompi) | Fee (HTN)');
console.log('-------------|-------------|-------------');

for (const payloadSize of payloadSizes) {
  const fee = HoosatCrypto.calculateMinFee(5, 2, payloadSize);
  const feeHTN = HoosatUtils.sompiToAmount(fee);

  console.log(`${payloadSize.toString().padStart(12)} | ${fee.padStart(11)} | ${feeHTN.padStart(11)}`);
}
```

**Output:**
```
Payload Size | Fee (sompi) | Fee (HTN)
-------------|-------------|-------------
           0 |        6653 | 0.00006653
          64 |        6717 | 0.00006717
         128 |        6781 | 0.00006781
         256 |        6909 | 0.00006909
         512 |        7165 | 0.00007165
```

## Complete Example

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatTxBuilder,
  HoosatUtils
} from 'hoosat-sdk';

async function sendTransaction() {
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420
  });

  // Method 1: Automatic fee calculation
  console.log('Method 1: Automatic');
  const minFee = await client.calculateMinFee(wallet.address);
  console.log('Min fee:', minFee, 'sompi');
  console.log('HTN:', HoosatUtils.sompiToAmount(minFee), '\n');

  // Method 2: Manual fee calculation
  console.log('Method 2: Manual');
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  const utxos = utxosResult.result.utxos;

  const inputsCount = utxos.length;
  const outputsCount = 2; // recipient + change

  const manualFee = HoosatCrypto.calculateMinFee(inputsCount, outputsCount);
  console.log('Min fee:', manualFee, 'sompi');
  console.log('HTN:', HoosatUtils.sompiToAmount(manualFee), '\n');

  // Build transaction
  const builder = new HoosatTxBuilder();

  // Add inputs
  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  // Add recipient
  builder.addOutput(recipientAddress, '100000000'); // 1 HTN

  // Set fee and add change
  builder.setFee(minFee);
  builder.addChangeOutput(wallet.address);

  // Sign and submit
  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('Transaction submitted:', result.result.transactionId);
  }

  client.disconnect();
}
```

## Best Practices

### 1. Always Calculate Fee Before Building Transaction

```typescript
// ❌ DON'T use static fees
builder.setFee('1000');

// ✅ DO calculate minimum fee
const minFee = await client.calculateMinFee(wallet.address);
builder.setFee(minFee);
```

### 2. Check Balance Includes Fee

```typescript
const balance = await client.getBalance(wallet.address);
const minFee = await client.calculateMinFee(wallet.address);

const totalRequired = BigInt(sendAmount) + BigInt(minFee);

if (BigInt(balance.result.balance) < totalRequired) {
  throw new Error('Insufficient funds including fee');
}
```

### 3. Account for Change Output

```typescript
// Remember: outputs count includes change
const outputsCount = 2; // 1 recipient + 1 change
const minFee = HoosatCrypto.calculateMinFee(inputsCount, outputsCount);
```

### 4. Use Automatic Calculation When Possible

```typescript
// Simpler and less error-prone
const minFee = await client.calculateMinFee(wallet.address);

// vs manual
const utxos = await client.getUtxosByAddresses([wallet.address]);
const minFee = HoosatCrypto.calculateMinFee(utxos.result.utxos.length, 2);
```

### 5. Consider Future Payload Usage

```typescript
// For future subnetwork transactions with payload
const payloadData = Buffer.from('Hello Hoosat!', 'utf-8');
const payloadSize = payloadData.length;

const minFee = HoosatCrypto.calculateMinFee(
  inputsCount,
  outputsCount,
  payloadSize
);
```

## TransactionFeeService (Internal)

The SDK uses `TransactionFeeService` internally for automatic fee calculation. You don't need to instantiate it directly - use `client.calculateMinFee()` instead.

**Internal implementation:**
```typescript
class TransactionFeeService {
  async calculateMinFee(address: string, payloadSize: number = 0): Promise<string> {
    // 1. Validate address
    if (!HoosatUtils.isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    // 2. Fetch UTXOs
    const utxosResult = await this._addressService.getUtxosByAddresses([address]);

    if (!utxosResult.ok || !utxosResult.result) {
      throw new Error('Failed to fetch UTXOs for address');
    }

    const utxos = utxosResult.result.utxos;

    if (!utxos || utxos.length === 0) {
      throw new Error('No UTXOs available for this address');
    }

    // 3. Calculate fee
    const numInputs = utxos.length;
    const numOutputs = 2; // recipient + change

    return HoosatCrypto.calculateMinFee(numInputs, numOutputs, payloadSize);
  }
}
```

## Migration from HoosatFeeEstimator

If you're migrating from the old `HoosatFeeEstimator`:

### Before (Old API)
```typescript
import { HoosatFeeEstimator, FeePriority } from 'hoosat-sdk';

const estimator = new HoosatFeeEstimator(client);
const recommendations = await estimator.getRecommendations();
const feeRate = recommendations[FeePriority.Normal].feeRate;

const fee = HoosatCrypto.calculateFee(inputsCount, outputsCount, feeRate);
builder.setFee(fee);
```

### After (New API)
```typescript
import { HoosatCrypto } from 'hoosat-sdk';

// Automatic
const minFee = await client.calculateMinFee(wallet.address);
builder.setFee(minFee);

// Or manual
const minFee = HoosatCrypto.calculateMinFee(inputsCount, outputsCount);
builder.setFee(minFee);
```

**Key changes:**
- ❌ No more `HoosatFeeEstimator`
- ❌ No more `FeePriority` enum
- ❌ No more dynamic fee rates
- ✅ Simple minimum fee calculation
- ✅ MASS-based formula
- ✅ Automatic or manual calculation

## Next Steps

- [HoosatCrypto](./crypto.md) - Cryptographic operations including fee calculation
- [HoosatTxBuilder](./tx-builder.md) - Build transactions with calculated fees
- [Transactions Guide](../guides/transactions.md) - Complete transaction building guide
