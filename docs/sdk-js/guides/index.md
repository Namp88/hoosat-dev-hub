---
sidebar_position: 1
---

# Guides Overview

In-depth guides for building applications with the Hoosat SDK.

## Core Guides

### [Wallet Management](./wallet-management.md)

Complete guide to creating, importing, and managing Hoosat wallets.

**Topics covered:**
- Generating new wallets (mainnet/testnet)
- Importing from private keys
- Secure wallet storage (encrypted files, environment variables)
- Checking balances
- Managing UTXOs
- Real-time balance monitoring
- Multi-wallet management
- Security best practices

**Who should read:**
- Developers building wallet applications
- Anyone managing private keys
- Exchange developers

### [Transactions](./transactions.md)

Comprehensive guide to building, signing, and submitting transactions.

**Topics covered:**
- Basic transaction flow
- UTXO selection strategies
- Fee management (fixed, dynamic, adaptive)
- Change output handling
- Sending to multiple recipients
- Transaction status tracking
- Error handling and retry logic
- Advanced patterns (consolidation, splitting)

**Who should read:**
- All developers sending transactions
- Payment processors
- Exchange developers

### [Real-time Monitoring](./real-time-monitoring.md)

Guide to monitoring blockchain events and changes in real-time.

**Topics covered:**
- Event system architecture
- UTXO change monitoring
- Block notifications
- Virtual DAG events
- Connection management
- Balance tracking
- Payment detection
- Multi-address monitoring
- Error handling and reconnection

**Who should read:**
- Wallet developers
- Payment processors
- Block explorers
- Monitoring services

### [Batch Payments](./batch-payments.md)

Guide to sending payments to multiple recipients efficiently.

**Topics covered:**
- Understanding spam protection
- Basic batch payment strategies
- Smart batching with UTXO selection
- Payment queue systems
- CSV batch processing
- Exchange withdrawal batching
- Error handling and retries
- Best practices

**Who should read:**
- Exchange developers
- Payment processors
- Payroll systems
- Anyone sending to 3+ recipients

### [Security Best Practices](./security.md)

Comprehensive security guide for protecting funds and user data.

**Topics covered:**
- Private key security (storage, encryption, HSM)
- Input validation and sanitization
- Transaction security (confirmations, rate limiting)
- Network security (TLS, authentication)
- Application security (hot/cold wallets, audit logging)
- Monitoring and alerts
- Development and production checklists

**Who should read:**
- All developers (mandatory reading)
- Security auditors
- Production deployments

## Quick Reference

### Installation

```bash
npm install hoosat-sdk
```

### Basic Transaction

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatTxBuilder,
  HoosatUtils
} from 'hoosat-sdk';

// Setup
const client = new HoosatClient({ host: '54.38.176.95', port: 42420 });
const wallet = HoosatCrypto.importKeyPair(process.env.WALLET_PRIVATE_KEY!);

// Get UTXOs
const utxosResult = await client.getUtxosByAddresses([wallet.address]);
const utxos = utxosResult.result.utxos;

// Calculate minimum fee
const minFee = await client.calculateMinFee(wallet.address);

// Build transaction
const builder = new HoosatTxBuilder();

for (const utxo of utxos) {
  builder.addInput(utxo, wallet.privateKey);
}

builder
  .addOutput(recipientAddress, HoosatUtils.amountToSompi('1.0'))
  .setFee(minFee)
  .addChangeOutput(wallet.address);

// Sign and submit
const signedTx = builder.sign();
const result = await client.submitTransaction(signedTx);

if (result.ok) {
  console.log('Success! TX ID:', result.result.transactionId);
}
```

### Balance Monitoring

```typescript
import { HoosatClient, EventType, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient({ host: '54.38.176.95', port: 42420 });

// Subscribe to address
await client.events.subscribeToUtxoChanges([wallet.address]);

// Listen for changes
client.events.on(EventType.UtxoChange, async (notification) => {
  console.log('Balance changed!');

  const balance = await client.getBalance(wallet.address);
  if (balance.ok) {
    console.log('New balance:', HoosatUtils.sompiToAmount(balance.result.balance), 'HTN');
  }
});
```

## Common Patterns

### Pattern: Safe Transaction Send

```typescript
async function sendTransactionSafely(
  client: HoosatClient,
  wallet: KeyPair,
  recipientAddress: string,
  amount: string
): Promise<string> {
  // 1. Validate inputs
  if (!HoosatUtils.isValidAddress(recipientAddress)) {
    throw new Error('Invalid recipient address');
  }

  if (!HoosatUtils.isValidAmount(amount)) {
    throw new Error('Invalid amount');
  }

  // 2. Get UTXOs
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  if (!utxosResult.ok) {
    throw new Error('Failed to get UTXOs');
  }

  const utxos = utxosResult.result.utxos;

  if (utxos.length === 0) {
    throw new Error('No UTXOs available');
  }

  // 3. Check balance
  const totalBalance = utxos.reduce(
    (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
    0n
  );

  if (totalBalance < BigInt(amount) + 100000n) {  // Amount + estimated fee
    throw new Error('Insufficient balance');
  }

  // 4. Calculate minimum fee
  const minFee = await client.calculateMinFee(wallet.address);

  // 5. Build transaction
  const builder = new HoosatTxBuilder();

  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  builder
    .addOutput(recipientAddress, amount)
    .setFee(minFee)
    .addChangeOutput(wallet.address);

  // 6. Sign and submit
  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (!result.ok) {
    throw new Error(`Transaction failed: ${result.error}`);
  }

  return result.result.transactionId;
}
```

### Pattern: Wait for Confirmation

```typescript
async function waitForConfirmation(
  client: HoosatClient,
  txId: string,
  changeAddress: string,
  timeout: number = 60000
): Promise<boolean> {
  return new Promise(async (resolve) => {
    let confirmed = false;

    // Subscribe to address
    await client.events.subscribeToUtxoChanges([changeAddress]);

    // Handle UTXO changes
    const handler = (notification: UtxoChangeNotification) => {
      for (const utxo of notification.added) {
        if (utxo.outpoint.transactionId === txId) {
          confirmed = true;
          cleanup();
          resolve(true);
        }
      }
    };

    client.events.on(EventType.UtxoChange, handler);

    // Timeout
    const timeoutId = setTimeout(() => {
      if (!confirmed) {
        cleanup();
        resolve(false);
      }
    }, timeout);

    // Cleanup
    const cleanup = async () => {
      clearTimeout(timeoutId);
      client.events.off(EventType.UtxoChange, handler);
      await client.events.unsubscribeFromAll();
    };
  });
}
```

### Pattern: Batch Payment Processing

```typescript
async function sendBatchPayments(
  client: HoosatClient,
  wallet: KeyPair,
  payments: Array<{ address: string; amount: string }>
): Promise<string[]> {
  const txIds: string[] = [];

  // Process in batches of 2 (max recipients per tx)
  for (let i = 0; i < payments.length; i += 2) {
    const batch = payments.slice(i, i + 2);

    // Get UTXOs
    const utxosResult = await client.getUtxosByAddresses([wallet.address]);
    const utxos = utxosResult.result.utxos;

    // Build transaction
    const builder = new HoosatTxBuilder();

    for (const utxo of utxos) {
      builder.addInput(utxo, wallet.privateKey);
    }

    for (const payment of batch) {
      builder.addOutput(payment.address, payment.amount);
    }

    // Calculate minimum fee and add change
    const minFee = HoosatCrypto.calculateMinFee(
      utxos.length,
      batch.length + 1
    );

    builder.setFee(minFee).addChangeOutput(wallet.address);

    // Submit
    const signedTx = builder.sign();
    const result = await client.submitTransaction(signedTx);

    if (result.ok) {
      txIds.push(result.result.transactionId);
      console.log(`Batch ${Math.floor(i / 2) + 1} sent:`, result.result.transactionId);
    }

    // Wait before next batch
    if (i + 2 < payments.length) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return txIds;
}
```

## Learning Path

### Beginner

1. [Installation](../getting-started/installation.md) - Set up SDK
2. [Quick Start](../getting-started/quick-start.md) - First transaction
3. [Wallet Management](./wallet-management.md) - Create and manage wallets
4. [Transactions](./transactions.md) - Send transactions

### Intermediate

5. [Real-time Monitoring](./real-time-monitoring.md) - Monitor events
6. [Fee Management](./transactions.md#fee-management) - Optimize fees
7. [Error Handling](./transactions.md#error-handling) - Handle errors gracefully
8. [Batch Payments](./batch-payments.md) - Send to multiple recipients

### Advanced

9. [Security Best Practices](./security.md) - Secure your application
10. [Multi-Node Setup](../getting-started/configuration.md#multi-node-setup) - High availability
11. [UTXO Management](./transactions.md#utxo-selection) - Optimize UTXO selection
12. [Production Deployment](./security.md#production-checklist) - Deploy safely

## Troubleshooting

### Common Issues

#### "Insufficient funds" error

```typescript
// Check actual balance
const balanceResult = await client.getBalance(address);
const balance = BigInt(balanceResult.result.balance);

// Calculate needed amount
const needed = BigInt(amount) + BigInt(feeEstimate.totalFee);

console.log('Have:', HoosatUtils.sompiToAmount(balance), 'HTN');
console.log('Need:', HoosatUtils.sompiToAmount(needed), 'HTN');

if (balance < needed) {
  console.error('Insufficient funds');
}
```

#### "Too many recipients" error

Use batch payments:
```typescript
// Split into batches of 2 recipients
const batches = [];
for (let i = 0; i < payments.length; i += 2) {
  batches.push(payments.slice(i, i + 2));
}

// Send each batch
for (const batch of batches) {
  await sendBatch(batch);
}
```

#### Connection errors

```typescript
client.events.on('error', (error) => {
  console.error('Connection error:', error);

  // Retry connection
  setTimeout(async () => {
    try {
      await client.events.reconnect();
    } catch (error) {
      console.error('Reconnect failed');
    }
  }, 5000);
});
```

## Best Practices Summary

- Always validate user inputs before processing
- Use dynamic fee estimation based on network conditions
- Implement proper error handling and retries
- Store private keys securely (encrypted, never hardcoded)
- Test on testnet before mainnet
- Monitor transaction confirmations
- Implement rate limiting for security
- Use multi-node setup for production
- Log all important operations
- Implement graceful shutdown handlers

## Next Steps

- [API Reference](../api-reference) - Detailed API documentation
- [Examples](../examples) - Working code examples
- [Core Concepts](../core-concepts/architecture.md) - Understand architecture
- [GitHub Repository](https://github.com/Namp88/hoosat-sdk) - Source code and issues
