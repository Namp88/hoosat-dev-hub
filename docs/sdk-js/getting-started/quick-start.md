---
sidebar_position: 2
---

# Quick Start

Get up and running with the Hoosat SDK in 5 minutes! This guide will walk you through the most common operations.

## Prerequisites

Make sure you have completed the [Installation](./installation.md) guide.

## Your First Hoosat Application

Let's build a simple application that connects to a Hoosat node, generates a wallet, checks balance, and prepares a transaction.

### Step 1: Connect to a Hoosat Node

```typescript
import { HoosatClient } from 'hoosat-sdk';

// Connect to public Hoosat node
const client = new HoosatClient({
  host: '54.38.176.95',  // Public node
  port: 42420,            // Default port
  timeout: 15000          // 15 second timeout
});

// Verify connection
const info = await client.getInfo();

if (info.ok) {
  console.log('Connected to Hoosat node!');
  console.log('Server version:', info.result.serverVersion);
  console.log('Is synced:', info.result.isSynced);
} else {
  console.error('Connection failed:', info.error);
}
```

**What's happening here:**
- We import `HoosatClient` from the SDK
- Create a client instance with node connection details
- Call `getInfo()` to verify the connection
- Check the response using `.ok` boolean
- Access the result data via `.result`

### Step 2: Generate a Wallet

```typescript
import { HoosatCrypto } from 'hoosat-sdk';

// Generate a new wallet
const wallet = HoosatCrypto.generateKeyPair('mainnet');

console.log('Wallet created!');
console.log('Address:', wallet.address);
console.log('Private key:', wallet.privateKey.toString('hex'));
console.log('Public key:', wallet.publicKey.toString('hex'));

// IMPORTANT: Store private key securely!
// Anyone with the private key can spend your funds
```

**For testnet development:**
```typescript
const testnetWallet = HoosatCrypto.generateKeyPair('testnet');
console.log('Testnet address:', testnetWallet.address);
// Address starts with "hoosattest:"
```

**Import existing wallet:**
```typescript
const privateKeyHex = 'your_private_key_here';
const importedWallet = HoosatCrypto.importKeyPair(privateKeyHex, 'mainnet');
```

### Step 3: Check Balance

```typescript
import { HoosatUtils } from 'hoosat-sdk';

const address = wallet.address;

// Get balance
const balanceResult = await client.getBalance(address);

if (balanceResult.ok) {
  const balanceSompi = balanceResult.result.balance;
  const balanceHTN = HoosatUtils.sompiToAmount(balanceSompi);

  console.log(`Balance: ${balanceHTN} HTN`);
  console.log(`Balance (sompi): ${balanceSompi}`);
} else {
  console.error('Failed to get balance:', balanceResult.error);
}
```

**Understanding amounts:**
- HTN is the main unit (like BTC for Bitcoin)
- Sompi is the smallest unit (like satoshi for Bitcoin)
- 1 HTN = 100,000,000 sompi
- SDK always returns amounts in sompi
- Use `HoosatUtils` to convert between units

### Step 4: Get UTXOs

```typescript
// Fetch UTXOs for the address
const utxosResult = await client.getUtxosByAddresses([wallet.address]);

if (utxosResult.ok) {
  const utxos = utxosResult.result.utxos;

  console.log(`Found ${utxos.length} UTXOs`);

  utxos.forEach((utxo, index) => {
    const amount = HoosatUtils.sompiToAmount(utxo.utxoEntry.amount);
    console.log(`UTXO ${index + 1}: ${amount} HTN`);
  });
} else {
  console.error('Failed to get UTXOs:', utxosResult.error);
}
```

**What are UTXOs?**
- Unspent Transaction Outputs
- Think of them as "coins" in your wallet
- You need UTXOs to send transactions
- Each UTXO has an amount and transaction reference

### Step 5: Estimate Fees

```typescript
import { HoosatFeeEstimator, FeePriority } from 'hoosat-sdk';

// Create fee estimator
const feeEstimator = new HoosatFeeEstimator(client);

// Get fee recommendations
const recommendations = await feeEstimator.getRecommendations();

console.log('Fee recommendations:');
console.log('Low:', recommendations.low.feeRate, 'sompi/byte');
console.log('Normal:', recommendations.normal.feeRate, 'sompi/byte');
console.log('High:', recommendations.high.feeRate, 'sompi/byte');
console.log('Urgent:', recommendations.urgent.feeRate, 'sompi/byte');

// Estimate fee for specific transaction
const feeEstimate = await feeEstimator.estimateFee(
  FeePriority.Normal,  // Priority level
  2,                   // Number of inputs
  2                    // Number of outputs
);

console.log('Estimated fee:', HoosatUtils.sompiToAmount(feeEstimate.totalFee), 'HTN');
```

### Step 6: Build a Transaction

```typescript
import { HoosatTxBuilder } from 'hoosat-sdk';

// Recipient address
const recipientAddress = 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74';

// Amount to send (in sompi)
const sendAmount = HoosatUtils.amountToSompi('0.1'); // 0.1 HTN

// Create transaction builder
const builder = new HoosatTxBuilder();

// Add inputs (UTXOs)
for (const utxo of utxos) {
  builder.addInput(utxo, wallet.privateKey);
}

// Add recipient output
builder.addOutput(recipientAddress, sendAmount);

// Set fee
builder.setFee(feeEstimate.totalFee);

// Add change output (remaining funds back to your wallet)
builder.addChangeOutput(wallet.address);

// Sign transaction
const signedTransaction = builder.sign();

console.log('Transaction built and signed!');
console.log('Transaction ID:', HoosatCrypto.getTransactionId(signedTransaction));
```

### Step 7: Submit Transaction

```typescript
// Submit to network
const submitResult = await client.submitTransaction(signedTransaction);

if (submitResult.ok) {
  console.log('Transaction submitted successfully!');
  console.log('TX ID:', submitResult.result.transactionId);
} else {
  console.error('Failed to submit:', submitResult.error);
}
```

## Complete Example

Here's a complete working example that puts it all together:

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
  // 1. Connect to node
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420
  });

  // 2. Import or generate wallet
  const wallet = HoosatCrypto.generateKeyPair('mainnet');
  console.log('Wallet address:', wallet.address);

  // 3. Check balance
  const balanceResult = await client.getBalance(wallet.address);

  if (!balanceResult.ok) {
    console.error('Error getting balance:', balanceResult.error);
    return;
  }

  const balance = balanceResult.result.balance;
  console.log('Balance:', HoosatUtils.sompiToAmount(balance), 'HTN');

  // 4. Get UTXOs
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);

  if (!utxosResult.ok || utxosResult.result.utxos.length === 0) {
    console.error('No UTXOs available');
    return;
  }

  const utxos = utxosResult.result.utxos;

  // 5. Estimate fee
  const feeEstimator = new HoosatFeeEstimator(client);
  const feeEstimate = await feeEstimator.estimateFee(
    FeePriority.Normal,
    utxos.length,
    2  // 1 recipient + 1 change
  );

  console.log('Fee:', HoosatUtils.sompiToAmount(feeEstimate.totalFee), 'HTN');

  // 6. Build transaction
  const builder = new HoosatTxBuilder();

  // Add all UTXOs as inputs
  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  // Add output
  const recipientAddress = 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74';
  const sendAmount = HoosatUtils.amountToSompi('0.1');

  builder.addOutput(recipientAddress, sendAmount);
  builder.setFee(feeEstimate.totalFee);
  builder.addChangeOutput(wallet.address);

  // 7. Sign and submit
  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (result.ok) {
    console.log('Success! TX ID:', result.result.transactionId);
  } else {
    console.error('Failed:', result.error);
  }

  // 8. Cleanup
  client.disconnect();
}

sendTransaction().catch(console.error);
```

## Real-time UTXO Monitoring

Monitor address changes in real-time:

```typescript
import { EventType } from 'hoosat-sdk';

// Subscribe to UTXO changes
await client.events.subscribeToUtxoChanges([wallet.address]);

// Listen for changes
client.events.on(EventType.UtxoChange, (notification) => {
  console.log('UTXO changed for:', notification.address);
  console.log('Added:', notification.changes.added.length);
  console.log('Removed:', notification.changes.removed.length);

  // Update your UI, refresh balance, etc.
});

// Handle errors
client.events.on(EventType.Error, (error) => {
  console.error('Streaming error:', error);
});

// Connection events
client.events.on(EventType.Disconnect, () => {
  console.log('Disconnected from node');
});

client.events.on(EventType.Reconnected, () => {
  console.log('Reconnected successfully');
});

// Cleanup when done
process.on('SIGINT', async () => {
  await client.events.unsubscribeFromUtxoChanges();
  client.disconnect();
  process.exit(0);
});
```

## Common Patterns

### Error Handling

Always check the `.ok` property before accessing `.result`:

```typescript
const result = await client.getBalance(address);

if (result.ok) {
  // Success - use result.result
  const balance = result.result.balance;
} else {
  // Error - use result.error
  console.error('Error:', result.error);
}
```

### Input Validation

Validate user input before processing:

```typescript
// Validate address
if (!HoosatUtils.isValidAddress(address)) {
  throw new Error('Invalid Hoosat address');
}

// Validate amount
if (!HoosatUtils.isValidAmount(amount)) {
  throw new Error('Invalid amount');
}

// Validate private key
if (!HoosatUtils.isValidPrivateKey(privateKey)) {
  throw new Error('Invalid private key');
}
```

### Amount Conversion

Always convert between HTN and sompi:

```typescript
// HTN to sompi (for transactions)
const sompi = HoosatUtils.amountToSompi('1.5');  // "150000000"

// Sompi to HTN (for display)
const htn = HoosatUtils.sompiToAmount('150000000');  // "1.5"

// Format for display
const formatted = HoosatUtils.formatAmount('1.23456789', 4);  // "1.2346"
```

## Next Steps

Now that you understand the basics:

- [Core Concepts](../core-concepts/architecture.md) - Deep dive into SDK architecture
- [API Reference](../api-reference/client.md) - Complete API documentation
- [Guides](../guides/wallet-management.md) - Detailed how-to guides
- [Examples](../examples) - 40+ working code examples

## Need Help?

- Check the [troubleshooting guide](../guides/troubleshooting.md)
- Review [working examples](../examples) from the SDK repository
- Ask in [GitHub issues](https://github.com/Namp88/hoosat-sdk/issues)
