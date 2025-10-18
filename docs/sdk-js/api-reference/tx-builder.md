---
sidebar_position: 3
---

# HoosatTxBuilder API Reference

Complete API reference for `HoosatTxBuilder` - the fluent transaction builder for Hoosat blockchain.

## Overview

`HoosatTxBuilder` provides an intuitive, chainable API for building transactions with:
- Automatic change calculation
- Input/output management
- Built-in validation
- Spam protection compliance
- Fee management

## Constructor

### `new HoosatTxBuilder(options?: TxBuilderOptions)`

Create a new transaction builder.

**Parameters:**
```typescript
interface TxBuilderOptions {
  debug?: boolean;  // Enable debug logging (default: false)
}
```

**Example:**
```typescript
const builder = new HoosatTxBuilder({ debug: true });
```

## Building Transactions

### `addInput(utxo: UtxoForSigning, privateKey?: Buffer)`

Add an input to the transaction.

**Parameters:**
- `utxo` - UTXO to spend
- `privateKey` - Private key for signing this input (optional if signing later)

**Returns:** `this` (for chaining)

**Example:**
```typescript
// Add input with key
builder.addInput(utxo, wallet.privateKey);

// Add input, sign later
builder.addInput(utxo);
```

**UTXO format:**
```typescript
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
```

### `addOutput(address: string, amount: string | bigint)`

Add an output (recipient).

**Parameters:**
- `address` - Recipient Hoosat address
- `amount` - Amount in sompi (string or bigint)

**Returns:** `this` (for chaining)

**Examples:**
```typescript
// Send 1 HTN (100,000,000 sompi)
builder.addOutput('hoosat:qz7ulu...', '100000000');

// Send using bigint
builder.addOutput('hoosat:qz7ulu...', 100000000n);

// Convert HTN to sompi
const sompi = HoosatUtils.amountToSompi('1.5');
builder.addOutput('hoosat:qz7ulu...', sompi);
```

**Validation:**
```typescript
// Validate address before adding
if (HoosatUtils.isValidAddress(address)) {
  builder.addOutput(address, amount);
}
```

### `addChangeOutput(changeAddress: string)`

Add change output (remaining funds back to sender).

**Parameters:**
- `changeAddress` - Address to send change to (usually sender's address)

**Returns:** `this` (for chaining)

**Example:**
```typescript
builder.addChangeOutput(wallet.address);
```

**Automatic calculation:**
- Change = Total Inputs - Total Outputs - Fee
- If change < 1000 sompi (dust), it's added to fee instead
- Change output is NOT added if resulting amount is dust

### `setFee(fee: string | bigint)`

Set transaction fee.

**Parameters:**
- `fee` - Fee amount in sompi (string or bigint)

**Returns:** `this` (for chaining)

**Examples:**
```typescript
// Set fee from string
builder.setFee('1000');

// Set fee from bigint
builder.setFee(1000n);

// Set fee from estimator
const feeEstimate = await feeEstimator.estimateFee(
  FeePriority.Normal,
  2,  // inputs
  2   // outputs
);
builder.setFee(feeEstimate.totalFee);
```

### `setLockTime(lockTime: string | bigint)`

Set transaction lock time.

**Parameters:**
- `lockTime` - Lock time value (default: 0)

**Returns:** `this` (for chaining)

**Example:**
```typescript
builder.setLockTime('0');
```

**Note:** Lock time is rarely needed for standard transactions.

## Signing

### `sign(globalPrivateKey?: Buffer)`

Sign the transaction.

**Parameters:**
- `globalPrivateKey` - Private key to sign all inputs (optional if keys provided per-input)

**Returns:** `Transaction` - Signed transaction ready for submission

**Examples:**
```typescript
// Sign with global key
const signedTx = builder.sign(wallet.privateKey);

// Sign if keys were provided per-input
const signedTx = builder.sign();

// Submit signed transaction
const result = await client.submitTransaction(signedTx);
```

### `build()`

Build transaction without signing.

**Returns:** `Transaction` - Unsigned transaction

**Example:**
```typescript
const unsignedTx = builder.build();

// Sign manually later
const signedTx = HoosatCrypto.signTransaction(unsignedTx, privateKey);
```

### `buildAndSign(globalPrivateKey?: Buffer)`

Build and sign in one step (alias for `sign()`).

**Returns:** `Transaction`

## Validation

### `validate()`

Validate the transaction before building.

**Throws:** Error if validation fails

**Validation checks:**
- At least one input
- At least one output
- Maximum 2 recipient outputs (spam protection)
- Maximum 3 total outputs (2 recipients + 1 change)
- Fee is set
- Sufficient input amount
- Valid addresses

**Example:**
```typescript
try {
  builder.validate();
  const signedTx = builder.sign(wallet.privateKey);
} catch (error) {
  console.error('Invalid transaction:', error.message);
}
```

**Note:** `sign()` and `build()` call `validate()` automatically.

## Information Methods

### `getTotalInputAmount()`

Get total amount from all inputs.

**Returns:** `bigint` - Total input amount in sompi

**Example:**
```typescript
const totalIn = builder.getTotalInputAmount();
console.log('Total inputs:', HoosatUtils.sompiToAmount(totalIn), 'HTN');
```

### `getTotalOutputAmount()`

Get total amount from all outputs (excluding change).

**Returns:** `bigint` - Total output amount in sompi

**Example:**
```typescript
const totalOut = builder.getTotalOutputAmount();
console.log('Total outputs:', HoosatUtils.sompiToAmount(totalOut), 'HTN');
```

### `getInputCount()`

Get number of inputs.

**Returns:** `number`

### `getOutputCount()`

Get number of outputs (including change if added).

**Returns:** `number`

### `estimateFee(feePerByte?: number)`

Estimate fee based on transaction size.

**Parameters:**
- `feePerByte` - Fee rate in sompi/byte (default: 1)

**Returns:** `string` - Estimated fee in sompi

**Example:**
```typescript
const estimatedFee = builder.estimateFee(10);  // 10 sompi/byte
builder.setFee(estimatedFee);
```

**Note:** For production use, prefer `HoosatFeeEstimator` for dynamic network-based fees.

## State Management

### `clear()`

Reset the builder to initial state.

**Returns:** `this`

**Example:**
```typescript
builder.clear();  // Remove all inputs, outputs, reset fee
```

**Use case:** Reuse the same builder instance for multiple transactions.

## Complete Example

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatTxBuilder,
  HoosatFeeEstimator,
  HoosatUtils,
  FeePriority
} from 'hoosat-sdk';

async function buildAndSendTransaction() {
  // Setup
  const client = new HoosatClient({ host: '54.38.176.95', port: 42420 });
  const wallet = HoosatCrypto.generateKeyPair();

  // Get UTXOs
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  const utxos = utxosResult.result.utxos;

  // Estimate fee
  const feeEstimator = new HoosatFeeEstimator(client);
  const feeEstimate = await feeEstimator.estimateFee(
    FeePriority.Normal,
    utxos.length,  // inputs
    2              // outputs
  );

  // Build transaction
  const builder = new HoosatTxBuilder();

  // Add all UTXOs as inputs
  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  // Add recipient output
  builder.addOutput(
    'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
    HoosatUtils.amountToSompi('0.1')  // Send 0.1 HTN
  );

  // Set fee
  builder.setFee(feeEstimate.totalFee);

  // Add change
  builder.addChangeOutput(wallet.address);

  // Check amounts
  console.log('Total in:', HoosatUtils.sompiToAmount(builder.getTotalInputAmount()), 'HTN');
  console.log('Total out:', HoosatUtils.sompiToAmount(builder.getTotalOutputAmount()), 'HTN');
  console.log('Fee:', HoosatUtils.sompiToAmount(feeEstimate.totalFee), 'HTN');

  // Sign and submit
  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('Success! TX ID:', result.result.transactionId);
  } else {
    console.error('Failed:', result.error);
  }
}
```

## Spam Protection

Hoosat inherits spam protection from Kaspa:

**Hard limits:**
- Maximum 2 recipient outputs per transaction
- Maximum 3 total outputs (2 recipients + 1 change)

**Examples:**

```typescript
// Valid - 1 recipient + change
builder
  .addInput(utxo1, privateKey)
  .addOutput('recipient1', '100000000')
  .addChangeOutput(myAddress);  // Total: 2 outputs

// Valid - 2 recipients + change
builder
  .addInput(utxo1, privateKey)
  .addOutput('recipient1', '100000000')
  .addOutput('recipient2', '50000000')
  .addChangeOutput(myAddress);  // Total: 3 outputs

// Invalid - 3 recipients (will throw error)
builder
  .addInput(utxo1, privateKey)
  .addOutput('recipient1', '100000000')
  .addOutput('recipient2', '50000000')
  .addOutput('recipient3', '25000000');  // ERROR!
```

**Sending to 3+ recipients:** Use batch payments (multiple transactions)

See: [Batch Payments Guide](../guides/batch-payments.md)

## Error Handling

Common errors:

**Insufficient funds:**
```typescript
// Total outputs + fee > Total inputs
// Solution: Add more UTXOs or reduce send amount
```

**Too many recipients:**
```typescript
// More than 2 recipient outputs
// Solution: Use batch payments
```

**Invalid address:**
```typescript
// Malformed recipient address
// Solution: Validate with HoosatUtils.isValidAddress()
```

**Missing fee:**
```typescript
// Fee not set
// Solution: Call setFee()
```

## Advanced Patterns

### UTXO Selection

```typescript
// Select UTXOs strategically
const sorted = utxos.sort((a, b) =>
  Number(BigInt(b.utxoEntry.amount) - BigInt(a.utxoEntry.amount))
);

// Add largest UTXOs first
for (const utxo of sorted) {
  builder.addInput(utxo, wallet.privateKey);

  // Stop when we have enough
  if (builder.getTotalInputAmount() >= neededAmount) {
    break;
  }
}
```

### Dynamic Fee Adjustment

```typescript
// Build transaction to calculate size
builder.addInput(utxo, privateKey);
builder.addOutput(recipient, amount);

// Get actual size-based fee
const fee = builder.estimateFee(feeRate);

// Rebuild with correct fee
builder.clear();
builder.addInput(utxo, privateKey);
builder.addOutput(recipient, amount);
builder.setFee(fee);
builder.addChangeOutput(myAddress);
```

## Next Steps

- [HoosatFeeEstimator](./fee-estimator.md) - Dynamic fee estimation
- [Transaction Guide](../guides/transactions.md) - Detailed transaction guide
- [Batch Payments](../guides/batch-payments.md) - Sending to multiple recipients
