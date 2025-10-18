---
sidebar_position: 2
---

# Transaction Guide

Complete guide to building, signing, and submitting transactions on the Hoosat blockchain.

## Overview

Transactions on Hoosat follow the UTXO (Unspent Transaction Output) model:
- **Inputs**: UTXOs you're spending (your available funds)
- **Outputs**: New UTXOs being created (recipients)
- **Fee**: Paid to miners for processing
- **Change**: Remaining funds sent back to you

## Basic Transaction Flow

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatTxBuilder,
  HoosatFeeEstimator,
  HoosatUtils,
  FeePriority
} from 'hoosat-sdk';

async function sendTransaction() {
  // 1. Setup
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420
  });

  const wallet = HoosatCrypto.importKeyPair(
    process.env.WALLET_PRIVATE_KEY!,
    'mainnet'
  );

  // 2. Get UTXOs
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  if (!utxosResult.ok) {
    throw new Error(`Failed to get UTXOs: ${utxosResult.error}`);
  }
  const utxos = utxosResult.result.utxos;

  // 3. Estimate fee
  const feeEstimator = new HoosatFeeEstimator(client);
  const feeEstimate = await feeEstimator.estimateFee(
    FeePriority.Normal,
    utxos.length,
    2  // 1 recipient + 1 change
  );

  // 4. Build transaction
  const builder = new HoosatTxBuilder();

  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  builder.addOutput(
    'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
    HoosatUtils.amountToSompi('1.0')  // Send 1 HTN
  );

  builder.setFee(feeEstimate.totalFee);
  builder.addChangeOutput(wallet.address);

  // 5. Sign and submit
  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('Success! TX ID:', result.result.transactionId);
  } else {
    console.error('Failed:', result.error);
  }

  client.disconnect();
}
```

## UTXO Selection

### Strategy 1: Use All UTXOs

Simplest approach - consolidate all UTXOs into one transaction:

```typescript
const utxosResult = await client.getUtxosByAddresses([wallet.address]);
const utxos = utxosResult.result.utxos;

const builder = new HoosatTxBuilder();

// Add all UTXOs
for (const utxo of utxos) {
  builder.addInput(utxo, wallet.privateKey);
}

// Calculate total
const totalBalance = utxos.reduce(
  (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
  0n
);

console.log('Total available:', HoosatUtils.sompiToAmount(totalBalance), 'HTN');
```

**Pros:**
- Simple to implement
- Consolidates UTXOs (reduces future transaction sizes)

**Cons:**
- Higher fees for large UTXO counts
- Unnecessary if you only need partial balance

### Strategy 2: Select Minimum Required

Select only enough UTXOs to cover the amount + fee:

```typescript
async function selectUtxos(
  utxos: UtxoForSigning[],
  requiredAmount: bigint,
  estimatedFee: bigint
): Promise<UtxoForSigning[]> {
  // Sort by amount (largest first)
  const sorted = [...utxos].sort((a, b) => {
    const amountA = BigInt(a.utxoEntry.amount);
    const amountB = BigInt(b.utxoEntry.amount);
    return amountA > amountB ? -1 : 1;
  });

  const selected: UtxoForSigning[] = [];
  let total = 0n;
  const needed = requiredAmount + estimatedFee;

  for (const utxo of sorted) {
    selected.push(utxo);
    total += BigInt(utxo.utxoEntry.amount);

    if (total >= needed) {
      break;
    }
  }

  if (total < needed) {
    throw new Error('Insufficient funds');
  }

  return selected;
}

// Usage
const sendAmount = HoosatUtils.amountToSompi('1.0');
const estimatedFee = BigInt(await feeEstimator.estimateFee(
  FeePriority.Normal,
  2,
  2
).then(e => e.totalFee));

const selectedUtxos = await selectUtxos(
  utxos,
  BigInt(sendAmount),
  estimatedFee
);

console.log(`Selected ${selectedUtxos.length} of ${utxos.length} UTXOs`);
```

**Pros:**
- Lower fees (fewer inputs)
- More efficient

**Cons:**
- May leave many small UTXOs

### Strategy 3: Avoid Dust UTXOs

Prioritize consolidating small UTXOs:

```typescript
function selectUtxosAvoidDust(
  utxos: UtxoForSigning[],
  requiredAmount: bigint
): UtxoForSigning[] {
  const DUST_THRESHOLD = 1000n;  // 1000 sompi

  // Separate dust and non-dust
  const dust = utxos.filter(u => BigInt(u.utxoEntry.amount) < DUST_THRESHOLD);
  const regular = utxos.filter(u => BigInt(u.utxoEntry.amount) >= DUST_THRESHOLD);

  // Try to use dust UTXOs first
  let selected: UtxoForSigning[] = [...dust];
  let total = selected.reduce((sum, u) => sum + BigInt(u.utxoEntry.amount), 0n);

  // Add regular UTXOs if needed
  const sortedRegular = regular.sort((a, b) => {
    const amountA = BigInt(a.utxoEntry.amount);
    const amountB = BigInt(b.utxoEntry.amount);
    return amountA > amountB ? -1 : 1;
  });

  for (const utxo of sortedRegular) {
    if (total >= requiredAmount) break;
    selected.push(utxo);
    total += BigInt(utxo.utxoEntry.amount);
  }

  return selected;
}
```

## Fee Management

### Fixed Fee

Set a specific fee amount:

```typescript
builder.setFee('10000');  // 10,000 sompi
```

### Dynamic Fee Estimation

Use network conditions to determine optimal fee:

```typescript
const feeEstimator = new HoosatFeeEstimator(client);

// Get recommendations for all priority levels
const recommendations = await feeEstimator.getRecommendations();

console.log('Network Status:');
console.log(`Mempool: ${recommendations.mempoolSize} transactions`);
console.log(`Median fee: ${recommendations.medianFeeRate} sompi/byte`);
console.log();

console.log('Fee Options:');
console.log(`Low:    ${HoosatUtils.sompiToAmount(recommendations.low.totalFee)} HTN`);
console.log(`Normal: ${HoosatUtils.sompiToAmount(recommendations.normal.totalFee)} HTN`);
console.log(`High:   ${HoosatUtils.sompiToAmount(recommendations.high.totalFee)} HTN`);
console.log(`Urgent: ${HoosatUtils.sompiToAmount(recommendations.urgent.totalFee)} HTN`);

// Choose based on urgency
const priority = recommendations.mempoolSize > 100
  ? FeePriority.High
  : FeePriority.Normal;

const feeEstimate = await feeEstimator.estimateFee(
  priority,
  inputsCount,
  outputsCount
);

builder.setFee(feeEstimate.totalFee);
```

### Adaptive Fee Strategy

Automatically adjust based on network conditions:

```typescript
async function getAdaptiveFee(
  estimator: HoosatFeeEstimator,
  inputsCount: number,
  outputsCount: number
): Promise<string> {
  const recs = await estimator.getRecommendations();

  let priority: FeePriority;

  if (recs.mempoolSize < 50) {
    priority = FeePriority.Low;
    console.log('Network is quiet - using low priority');
  } else if (recs.mempoolSize < 150) {
    priority = FeePriority.Normal;
    console.log('Normal network activity');
  } else if (recs.mempoolSize < 300) {
    priority = FeePriority.High;
    console.log('Network is busy - using high priority');
  } else {
    priority = FeePriority.Urgent;
    console.log('Network is congested - using urgent priority');
  }

  const estimate = await estimator.estimateFee(priority, inputsCount, outputsCount);
  return estimate.totalFee;
}

// Usage
const fee = await getAdaptiveFee(feeEstimator, 2, 2);
builder.setFee(fee);
```

## Change Output

### Automatic Change Calculation

The builder automatically calculates change:

```typescript
builder.addChangeOutput(wallet.address);

// Change = Total Inputs - Total Outputs - Fee
```

### Dust Protection

If change is below 1000 sompi (dust threshold), it's added to the fee instead:

```typescript
const totalIn = builder.getTotalInputAmount();
const totalOut = builder.getTotalOutputAmount();
const fee = BigInt(feeEstimate.totalFee);

const change = totalIn - totalOut - fee;

if (change < 1000n) {
  console.log('Change is dust - adding to fee');
  // Builder handles this automatically
}
```

### Multiple Change Addresses

Split change across multiple addresses (useful for privacy):

```typescript
const change = totalIn - totalOut - fee;

if (change >= 2000n) {  // At least 2000 sompi
  const half = change / 2n;

  builder.addOutput(changeAddress1, half.toString());
  builder.addOutput(changeAddress2, (change - half).toString());
}
```

Note: Remember spam protection limits (max 2 recipients + 1 change).

## Sending to Multiple Recipients

### Two Recipients (Direct)

Maximum allowed without batching:

```typescript
const builder = new HoosatTxBuilder();

// Add inputs
for (const utxo of utxos) {
  builder.addInput(utxo, wallet.privateKey);
}

// Add 2 recipients
builder.addOutput(
  'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
  HoosatUtils.amountToSompi('1.0')
);

builder.addOutput(
  'hoosat:qzk8h2q7wn9p3j5m6x4r8t5v3w9y2k4m7p8q6r9t3v5w8x2z4b7c9d',
  HoosatUtils.amountToSompi('0.5')
);

// Add fee and change
builder.setFee(feeEstimate.totalFee);
builder.addChangeOutput(wallet.address);

// Sign and submit
const signedTx = builder.sign();
const result = await client.submitTransaction(signedTx);
```

### Three or More Recipients (Batch Payment)

Use multiple transactions:

```typescript
interface Payment {
  address: string;
  amount: string;
}

async function sendBatchPayment(
  client: HoosatClient,
  wallet: KeyPair,
  payments: Payment[]
): Promise<string[]> {
  const txIds: string[] = [];

  // Get all UTXOs
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  let availableUtxos = utxosResult.result.utxos;

  // Process in batches of 2
  for (let i = 0; i < payments.length; i += 2) {
    const batch = payments.slice(i, i + 2);

    console.log(`Processing batch ${Math.floor(i / 2) + 1}/${Math.ceil(payments.length / 2)}`);

    const builder = new HoosatTxBuilder();

    // Select UTXOs for this batch
    const totalNeeded = batch.reduce(
      (sum, p) => sum + BigInt(p.amount),
      0n
    );

    let selectedUtxos: UtxoForSigning[] = [];
    let total = 0n;

    for (const utxo of availableUtxos) {
      selectedUtxos.push(utxo);
      total += BigInt(utxo.utxoEntry.amount);

      if (total >= totalNeeded + 100000n) {  // +buffer for fee
        break;
      }
    }

    // Add inputs
    for (const utxo of selectedUtxos) {
      builder.addInput(utxo, wallet.privateKey);
    }

    // Add recipients
    for (const payment of batch) {
      builder.addOutput(payment.address, payment.amount);
    }

    // Estimate and set fee
    const feeEstimator = new HoosatFeeEstimator(client);
    const feeEstimate = await feeEstimator.estimateFee(
      FeePriority.Normal,
      selectedUtxos.length,
      batch.length + 1  // recipients + change
    );

    builder.setFee(feeEstimate.totalFee);
    builder.addChangeOutput(wallet.address);

    // Submit
    const signedTx = builder.sign();
    const result = await client.submitTransaction(signedTx);

    if (result.ok) {
      txIds.push(result.result.transactionId);
      console.log(`Batch ${Math.floor(i / 2) + 1} sent:`, result.result.transactionId);
    } else {
      throw new Error(`Batch ${Math.floor(i / 2) + 1} failed: ${result.error}`);
    }

    // Remove used UTXOs
    const usedIds = new Set(selectedUtxos.map(u => u.outpoint.transactionId));
    availableUtxos = availableUtxos.filter(
      u => !usedIds.has(u.outpoint.transactionId)
    );

    // Wait a bit between transactions
    if (i + 2 < payments.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return txIds;
}

// Usage
const payments: Payment[] = [
  {
    address: 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
    amount: HoosatUtils.amountToSompi('1.0')
  },
  {
    address: 'hoosat:qzk8h2q7wn9p3j5m6x4r8t5v3w9y2k4m7p8q6r9t3v5w8x2z4b7c9d',
    amount: HoosatUtils.amountToSompi('0.5')
  },
  {
    address: 'hoosat:qpm4n7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0',
    amount: HoosatUtils.amountToSompi('0.25')
  }
];

const txIds = await sendBatchPayment(client, wallet, payments);
console.log('All payments sent:', txIds);
```

## Transaction Status

### Check Transaction Status

```typescript
async function waitForConfirmation(
  client: HoosatClient,
  txId: string,
  maxAttempts: number = 30
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await client.getTransactionStatus(txId);

    if (result.ok) {
      const status = result.result;

      if (status.isAccepted) {
        console.log('Transaction confirmed!');
        console.log('Block:', status.blockHash);
        console.log('Block time:', status.blockTime);
        return true;
      }
    }

    console.log(`Attempt ${i + 1}/${maxAttempts}: Pending...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('Timeout waiting for confirmation');
  return false;
}

// Usage
const result = await client.submitTransaction(signedTx);

if (result.ok) {
  const txId = result.result.transactionId;
  console.log('Transaction submitted:', txId);

  const confirmed = await waitForConfirmation(client, txId);

  if (confirmed) {
    console.log('Payment successful!');
  } else {
    console.log('Payment status unknown - check explorer');
  }
}
```

### Real-time Status Monitoring

Use event subscriptions for instant updates:

```typescript
import { EventType } from 'hoosat-sdk';

async function submitWithMonitoring(
  client: HoosatClient,
  signedTx: Transaction,
  changeAddress: string
) {
  // Subscribe to UTXO changes on change address
  await client.events.subscribeToUtxoChanges([changeAddress]);

  let confirmed = false;

  client.events.on(EventType.UtxoChange, (notification) => {
    console.log('UTXO change detected - transaction confirmed!');
    confirmed = true;
  });

  // Submit transaction
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('TX submitted:', result.result.transactionId);
    console.log('Waiting for confirmation...');

    // Wait for event or timeout
    await Promise.race([
      new Promise(resolve => {
        const interval = setInterval(() => {
          if (confirmed) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
      }),
      new Promise(resolve => setTimeout(() => resolve(false), 60000))  // 60s timeout
    ]);

    if (confirmed) {
      console.log('Confirmed via real-time event!');
    } else {
      console.log('Timeout - check status manually');
    }
  }

  await client.events.unsubscribeFromAll();
}
```

## Error Handling

### Comprehensive Error Handling

```typescript
async function sendTransactionWithErrorHandling(
  client: HoosatClient,
  wallet: KeyPair,
  recipientAddress: string,
  amount: string
) {
  try {
    // Validate inputs
    if (!HoosatUtils.isValidAddress(recipientAddress)) {
      throw new Error('Invalid recipient address');
    }

    if (!HoosatUtils.isValidAmount(amount)) {
      throw new Error('Invalid amount');
    }

    // Get UTXOs
    const utxosResult = await client.getUtxosByAddresses([wallet.address]);

    if (!utxosResult.ok) {
      throw new Error(`Failed to get UTXOs: ${utxosResult.error}`);
    }

    const utxos = utxosResult.result.utxos;

    if (utxos.length === 0) {
      throw new Error('No UTXOs available - wallet is empty');
    }

    // Calculate total balance
    const totalBalance = utxos.reduce(
      (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
      0n
    );

    console.log('Balance:', HoosatUtils.sompiToAmount(totalBalance), 'HTN');

    // Check sufficient balance
    const sendAmount = BigInt(amount);
    const estimatedFee = 100000n;  // Rough estimate

    if (totalBalance < sendAmount + estimatedFee) {
      throw new Error(
        `Insufficient funds. Have: ${HoosatUtils.sompiToAmount(totalBalance)} HTN, ` +
        `Need: ${HoosatUtils.sompiToAmount((sendAmount + estimatedFee).toString())} HTN`
      );
    }

    // Build transaction
    const builder = new HoosatTxBuilder();

    for (const utxo of utxos) {
      builder.addInput(utxo, wallet.privateKey);
    }

    builder.addOutput(recipientAddress, amount);

    // Get accurate fee
    const feeEstimator = new HoosatFeeEstimator(client);
    const feeEstimate = await feeEstimator.estimateFee(
      FeePriority.Normal,
      utxos.length,
      2
    );

    builder.setFee(feeEstimate.totalFee);
    builder.addChangeOutput(wallet.address);

    // Validate before signing
    try {
      builder.validate();
    } catch (error) {
      throw new Error(`Transaction validation failed: ${error.message}`);
    }

    // Sign
    const signedTx = builder.sign();

    // Submit
    const result = await client.submitTransaction(signedTx);

    if (!result.ok) {
      throw new Error(`Transaction submission failed: ${result.error}`);
    }

    console.log('Success! TX ID:', result.result.transactionId);
    return result.result.transactionId;

  } catch (error) {
    console.error('Transaction failed:', error.message);

    // Categorize errors
    if (error.message.includes('Insufficient funds')) {
      console.error('Solution: Wait for incoming transactions or reduce amount');
    } else if (error.message.includes('Invalid address')) {
      console.error('Solution: Double-check recipient address');
    } else if (error.message.includes('network')) {
      console.error('Solution: Check network connection and node status');
    } else if (error.message.includes('UTXO')) {
      console.error('Solution: Wait for pending transactions to confirm');
    }

    throw error;
  }
}
```

### Retry Logic

```typescript
async function submitWithRetry(
  client: HoosatClient,
  signedTx: Transaction,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.submitTransaction(signedTx);

      if (result.ok) {
        return result.result.transactionId;
      }

      // Check if error is retryable
      const error = result.error || '';

      if (error.includes('already exists')) {
        console.log('Transaction already submitted');
        // Extract TX ID from error or calculate it
        return HoosatCrypto.getTransactionId(signedTx);
      }

      if (error.includes('mempool is full')) {
        console.log(`Mempool full - retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
        continue;
      }

      // Non-retryable error
      throw new Error(error);

    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      console.log(`Attempt ${attempt} failed:`, error.message);
      console.log('Retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  throw new Error('Max retries exceeded');
}
```

## Advanced Patterns

### UTXO Consolidation

Combine many small UTXOs into one large UTXO:

```typescript
async function consolidateUtxos(
  client: HoosatClient,
  wallet: KeyPair
): Promise<string> {
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  const utxos = utxosResult.result.utxos;

  console.log(`Consolidating ${utxos.length} UTXOs...`);

  const feeEstimator = new HoosatFeeEstimator(client);
  const feeEstimate = await feeEstimator.estimateFee(
    FeePriority.Low,  // Use low priority for consolidation
    utxos.length,
    1  // Single output to self
  );

  const builder = new HoosatTxBuilder();

  // Add all UTXOs
  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  // Calculate total
  const total = builder.getTotalInputAmount();
  const fee = BigInt(feeEstimate.totalFee);
  const outputAmount = total - fee;

  // Single output back to self
  builder.addOutput(wallet.address, outputAmount.toString());
  builder.setFee(feeEstimate.totalFee);

  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('Consolidation complete!');
    console.log('TX ID:', result.result.transactionId);
    console.log('New UTXO amount:', HoosatUtils.sompiToAmount(outputAmount), 'HTN');
    return result.result.transactionId;
  } else {
    throw new Error(result.error!);
  }
}
```

### UTXO Splitting

Split one large UTXO into multiple smaller ones:

```typescript
async function splitUtxo(
  client: HoosatClient,
  wallet: KeyPair,
  splitCount: number = 5
): Promise<string> {
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  const utxos = utxosResult.result.utxos;

  // Find largest UTXO
  const largest = utxos.reduce((max, utxo) => {
    const amount = BigInt(utxo.utxoEntry.amount);
    const maxAmount = BigInt(max.utxoEntry.amount);
    return amount > maxAmount ? utxo : max;
  });

  console.log('Splitting UTXO:', HoosatUtils.sompiToAmount(largest.utxoEntry.amount), 'HTN');

  const builder = new HoosatTxBuilder();
  builder.addInput(largest, wallet.privateKey);

  // Estimate fee
  const feeEstimator = new HoosatFeeEstimator(client);
  const feeEstimate = await feeEstimator.estimateFee(
    FeePriority.Low,
    1,
    splitCount
  );

  const totalAmount = BigInt(largest.utxoEntry.amount);
  const fee = BigInt(feeEstimate.totalFee);
  const availableAmount = totalAmount - fee;
  const perOutput = availableAmount / BigInt(splitCount);

  console.log(`Splitting into ${splitCount} outputs of ${HoosatUtils.sompiToAmount(perOutput)} HTN each`);

  // Add split outputs
  for (let i = 0; i < splitCount; i++) {
    builder.addOutput(wallet.address, perOutput.toString());
  }

  builder.setFee(feeEstimate.totalFee);

  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('Split complete!');
    console.log('TX ID:', result.result.transactionId);
    return result.result.transactionId;
  } else {
    throw new Error(result.error!);
  }
}
```

## Best Practices

### 1. Always Validate Inputs

```typescript
// Validate address
if (!HoosatUtils.isValidAddress(recipientAddress)) {
  throw new Error('Invalid address');
}

// Validate amount
if (!HoosatUtils.isValidAmount(amount)) {
  throw new Error('Invalid amount');
}

// Check balance
const totalBalance = builder.getTotalInputAmount();
const needed = totalOutputs + fee;

if (totalBalance < needed) {
  throw new Error('Insufficient funds');
}
```

### 2. Use Dynamic Fee Estimation

```typescript
// Don't use fixed fees
builder.setFee('1000');  // Bad

// Use network-aware estimation
const feeEstimator = new HoosatFeeEstimator(client);
const feeEstimate = await feeEstimator.estimateFee(
  FeePriority.Normal,
  inputsCount,
  outputsCount
);
builder.setFee(feeEstimate.totalFee);  // Good
```

### 3. Handle Errors Gracefully

```typescript
const result = await client.submitTransaction(signedTx);

if (!result.ok) {
  // Don't just throw - provide context
  console.error('Transaction failed:', result.error);

  // Categorize and suggest solutions
  if (result.error?.includes('Insufficient')) {
    console.error('Insufficient funds - check balance');
  }

  throw new Error(result.error);
}
```

### 4. Wait for Confirmation

```typescript
// Don't assume immediate confirmation
const result = await client.submitTransaction(signedTx);
console.log('Transaction submitted - waiting for confirmation...');

// Check status
await waitForConfirmation(client, result.result.transactionId);
console.log('Transaction confirmed!');
```

### 5. Test on Testnet First

```typescript
// Always test on testnet before mainnet
const wallet = HoosatCrypto.generateKeyPair('testnet');

const client = new HoosatClient({
  host: 'testnet.hoosat.fi',  // Testnet node
  port: 42420
});
```

## Next Steps

- [Batch Payments Guide](./batch-payments.md) - Advanced multi-recipient payments
- [Real-time Monitoring](./real-time-monitoring.md) - Monitor transactions
