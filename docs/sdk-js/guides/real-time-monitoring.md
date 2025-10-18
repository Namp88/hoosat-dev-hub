---
sidebar_position: 3
---

# Real-time Monitoring Guide

Complete guide to monitoring blockchain events and changes in real-time using the Hoosat SDK.

## Overview

The Hoosat SDK provides powerful real-time event streaming capabilities:
- **UTXO changes**: Monitor balance changes for addresses
- **Block notifications**: Track new blocks as they're created
- **Virtual DAG changes**: Monitor DAG consensus events
- **Automatic reconnection**: Handles network interruptions
- **Multi-address support**: Monitor multiple addresses simultaneously

## Event System Architecture

```
┌─────────────┐       WebSocket        ┌─────────────┐
│             │◄─────────────────────►│             │
│  Your App   │      gRPC Stream       │  Hoosat     │
│             │                        │  Node       │
└─────────────┘                        └─────────────┘
       │
       │ Event Handlers
       ▼
┌─────────────────────────┐
│  HoosatEventManager     │
│  - Connection           │
│  - Subscriptions        │
│  - Auto-reconnect       │
└─────────────────────────┘
```

## Quick Start

### Basic UTXO Monitoring

```typescript
import { HoosatClient, EventType } from 'hoosat-sdk';

const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

// Subscribe to address
await client.events.subscribeToUtxoChanges([
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
]);

// Listen for changes
client.events.on(EventType.UtxoChange, async (notification) => {
  console.log('Balance changed!');
  console.log('Added UTXOs:', notification.added.length);
  console.log('Removed UTXOs:', notification.removed.length);

  // Fetch new balance
  const balance = await client.getBalance(notification.address);
  if (balance.ok) {
    console.log('New balance:', HoosatUtils.sompiToAmount(balance.result.balance), 'HTN');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.events.unsubscribeFromAll();
  client.disconnect();
  process.exit(0);
});
```

## Event Types

### UtxoChange Event

Triggered when UTXOs are added or removed for subscribed addresses.

```typescript
interface UtxoChangeNotification {
  address: string;
  added: UtxoEntry[];
  removed: UtxoEntry[];
}

interface UtxoEntry {
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

// Usage
client.events.on(EventType.UtxoChange, (notification) => {
  console.log('Address:', notification.address);

  // Process added UTXOs (incoming transactions)
  for (const utxo of notification.added) {
    const amount = HoosatUtils.sompiToAmount(utxo.utxoEntry.amount);
    console.log(`+ Received ${amount} HTN`);
    console.log(`  TX: ${utxo.outpoint.transactionId}`);
    console.log(`  Coinbase: ${utxo.utxoEntry.isCoinbase}`);
  }

  // Process removed UTXOs (outgoing transactions)
  for (const utxo of notification.removed) {
    const amount = HoosatUtils.sompiToAmount(utxo.utxoEntry.amount);
    console.log(`- Spent ${amount} HTN`);
    console.log(`  TX: ${utxo.outpoint.transactionId}`);
  }
});
```

### BlockAdded Event

Triggered when a new block is added to the DAG.

```typescript
interface BlockAddedNotification {
  blockHash: string;
  blockHeader: {
    version: number;
    hashMerkleRoot: string;
    acceptedIdMerkleRoot: string;
    utxoCommitment: string;
    timestamp: string;
    bits: number;
    nonce: string;
    daaScore: string;
    blueScore: string;
    blueWork: string;
    pruningPoint: string;
  };
}

// Subscribe to block notifications
await client.events.subscribeToBlockAdded();

// Listen for new blocks
client.events.on(EventType.BlockAdded, (notification) => {
  console.log('New block added!');
  console.log('Hash:', notification.blockHash);
  console.log('Timestamp:', new Date(Number(notification.blockHeader.timestamp)).toISOString());
  console.log('DAA Score:', notification.blockHeader.daaScore);
  console.log('Blue Score:', notification.blockHeader.blueScore);
});
```

### VirtualDagChanged Event

Triggered when the virtual DAG changes (consensus updates).

```typescript
// Subscribe to virtual DAG changes
await client.events.subscribeToVirtualDagChanged();

// Listen for DAG changes
client.events.on(EventType.VirtualDagChanged, (notification) => {
  console.log('Virtual DAG changed');
  // Use this to trigger balance refreshes or transaction confirmations
});
```

## Monitoring Patterns

### Pattern 1: Wallet Balance Tracker

Monitor balance changes and maintain local state:

```typescript
class BalanceTracker {
  private client: HoosatClient;
  private address: string;
  private currentBalance: bigint = 0n;
  private utxos: Map<string, UtxoEntry> = new Map();

  constructor(client: HoosatClient, address: string) {
    this.client = client;
    this.address = address;
  }

  async start() {
    // Get initial state
    await this.refreshBalance();

    // Subscribe to changes
    await this.client.events.subscribeToUtxoChanges([this.address]);

    // Handle changes
    this.client.events.on(EventType.UtxoChange, (notification) => {
      if (notification.address === this.address) {
        this.handleUtxoChange(notification);
      }
    });

    console.log('Balance tracker started');
    console.log('Initial balance:', HoosatUtils.sompiToAmount(this.currentBalance), 'HTN');
  }

  private async refreshBalance() {
    const result = await this.client.getBalance(this.address);

    if (result.ok) {
      this.currentBalance = BigInt(result.result.balance);
    }

    const utxosResult = await this.client.getUtxosByAddresses([this.address]);

    if (utxosResult.ok) {
      this.utxos.clear();
      for (const utxo of utxosResult.result.utxos) {
        const key = `${utxo.outpoint.transactionId}:${utxo.outpoint.index}`;
        this.utxos.set(key, utxo);
      }
    }
  }

  private handleUtxoChange(notification: UtxoChangeNotification) {
    // Add new UTXOs
    for (const utxo of notification.added) {
      const key = `${utxo.outpoint.transactionId}:${utxo.outpoint.index}`;
      this.utxos.set(key, utxo);

      const amount = BigInt(utxo.utxoEntry.amount);
      this.currentBalance += amount;

      console.log(`[${new Date().toISOString()}] +${HoosatUtils.sompiToAmount(amount)} HTN`);
    }

    // Remove spent UTXOs
    for (const utxo of notification.removed) {
      const key = `${utxo.outpoint.transactionId}:${utxo.outpoint.index}`;
      this.utxos.delete(key);

      const amount = BigInt(utxo.utxoEntry.amount);
      this.currentBalance -= amount;

      console.log(`[${new Date().toISOString()}] -${HoosatUtils.sompiToAmount(amount)} HTN`);
    }

    console.log('Current balance:', HoosatUtils.sompiToAmount(this.currentBalance), 'HTN');
    console.log('UTXOs:', this.utxos.size);
  }

  getBalance(): string {
    return this.currentBalance.toString();
  }

  getUtxos(): UtxoEntry[] {
    return Array.from(this.utxos.values());
  }

  async stop() {
    await this.client.events.unsubscribeFromAll();
    console.log('Balance tracker stopped');
  }
}

// Usage
const tracker = new BalanceTracker(client, wallet.address);
await tracker.start();

// Let it run...
// Tracker will automatically update as transactions occur
```

### Pattern 2: Payment Detector

Detect incoming payments and trigger actions:

```typescript
interface PaymentCallback {
  (txId: string, amount: string, from?: string): void;
}

class PaymentDetector {
  private client: HoosatClient;
  private address: string;
  private callbacks: PaymentCallback[] = [];

  constructor(client: HoosatClient, address: string) {
    this.client = client;
    this.address = address;
  }

  onPayment(callback: PaymentCallback) {
    this.callbacks.push(callback);
  }

  async start() {
    await this.client.events.subscribeToUtxoChanges([this.address]);

    this.client.events.on(EventType.UtxoChange, async (notification) => {
      if (notification.address === this.address) {
        await this.detectPayments(notification);
      }
    });

    console.log('Payment detector started for:', this.address);
  }

  private async detectPayments(notification: UtxoChangeNotification) {
    for (const utxo of notification.added) {
      const amount = utxo.utxoEntry.amount;
      const txId = utxo.outpoint.transactionId;

      console.log('Payment detected!');
      console.log('Amount:', HoosatUtils.sompiToAmount(amount), 'HTN');
      console.log('TX ID:', txId);

      // Trigger callbacks
      for (const callback of this.callbacks) {
        try {
          callback(txId, amount);
        } catch (error) {
          console.error('Callback error:', error);
        }
      }
    }
  }

  async stop() {
    await this.client.events.unsubscribeFromAll();
  }
}

// Usage
const detector = new PaymentDetector(client, merchantAddress);

detector.onPayment((txId, amount) => {
  console.log(`Processing payment: ${HoosatUtils.sompiToAmount(amount)} HTN`);

  // Update order status
  // Send confirmation email
  // Trigger fulfillment
  // etc.
});

await detector.start();
```

### Pattern 3: Multi-Wallet Monitor

Monitor multiple wallets simultaneously:

```typescript
class MultiWalletMonitor {
  private client: HoosatClient;
  private wallets: Map<string, WalletInfo> = new Map();

  constructor(client: HoosatClient) {
    this.client = client;
  }

  addWallet(name: string, address: string) {
    this.wallets.set(address, {
      name,
      address,
      balance: 0n,
      lastUpdate: new Date()
    });
  }

  async start() {
    // Subscribe to all addresses
    const addresses = Array.from(this.wallets.keys());
    await this.client.events.subscribeToUtxoChanges(addresses);

    // Handle changes
    this.client.events.on(EventType.UtxoChange, async (notification) => {
      await this.handleChange(notification);
    });

    // Initial balance fetch
    for (const address of addresses) {
      await this.refreshBalance(address);
    }

    console.log(`Monitoring ${this.wallets.size} wallets`);
    this.printStatus();
  }

  private async handleChange(notification: UtxoChangeNotification) {
    const wallet = this.wallets.get(notification.address);
    if (!wallet) return;

    // Calculate balance change
    let change = 0n;

    for (const utxo of notification.added) {
      change += BigInt(utxo.utxoEntry.amount);
    }

    for (const utxo of notification.removed) {
      change -= BigInt(utxo.utxoEntry.amount);
    }

    wallet.balance += change;
    wallet.lastUpdate = new Date();

    console.log(`\n[${wallet.name}] Balance changed: ${change > 0n ? '+' : ''}${HoosatUtils.sompiToAmount(change)} HTN`);
    this.printStatus();
  }

  private async refreshBalance(address: string) {
    const result = await this.client.getBalance(address);

    if (result.ok) {
      const wallet = this.wallets.get(address)!;
      wallet.balance = BigInt(result.result.balance);
      wallet.lastUpdate = new Date();
    }
  }

  private printStatus() {
    console.log('\n=== Wallet Status ===');

    let totalBalance = 0n;

    for (const wallet of this.wallets.values()) {
      console.log(`${wallet.name}:`);
      console.log(`  Balance: ${HoosatUtils.sompiToAmount(wallet.balance)} HTN`);
      console.log(`  Last update: ${wallet.lastUpdate.toISOString()}`);

      totalBalance += wallet.balance;
    }

    console.log(`\nTotal: ${HoosatUtils.sompiToAmount(totalBalance)} HTN`);
    console.log('=====================\n');
  }

  async stop() {
    await this.client.events.unsubscribeFromAll();
  }
}

interface WalletInfo {
  name: string;
  address: string;
  balance: bigint;
  lastUpdate: Date;
}

// Usage
const monitor = new MultiWalletMonitor(client);

monitor.addWallet('Main Wallet', 'hoosat:qz7ulu...');
monitor.addWallet('Savings', 'hoosat:qpm4n7...');
monitor.addWallet('Trading', 'hoosat:qzk8h2...');

await monitor.start();
```

### Pattern 4: Transaction Confirmation Waiter

Wait for specific transaction confirmation:

```typescript
async function waitForTransactionConfirmation(
  client: HoosatClient,
  txId: string,
  changeAddress: string,
  timeout: number = 60000
): Promise<boolean> {
  return new Promise(async (resolve) => {
    let confirmed = false;
    const startTime = Date.now();

    // Subscribe to address
    await client.events.subscribeToUtxoChanges([changeAddress]);

    // Handle UTXO changes
    const handler = async (notification: UtxoChangeNotification) => {
      // Check if any added UTXO is from our transaction
      for (const utxo of notification.added) {
        if (utxo.outpoint.transactionId === txId) {
          console.log('Transaction confirmed via event!');
          confirmed = true;
          await cleanup();
          resolve(true);
          return;
        }
      }
    };

    client.events.on(EventType.UtxoChange, handler);

    // Timeout
    const timeoutId = setTimeout(async () => {
      if (!confirmed) {
        console.log('Timeout waiting for confirmation');
        await cleanup();
        resolve(false);
      }
    }, timeout);

    // Cleanup function
    const cleanup = async () => {
      clearTimeout(timeoutId);
      client.events.off(EventType.UtxoChange, handler);
      await client.events.unsubscribeFromAll();
    };
  });
}

// Usage
const result = await client.submitTransaction(signedTx);

if (result.ok) {
  const txId = result.result.transactionId;
  console.log('Transaction submitted:', txId);
  console.log('Waiting for confirmation...');

  const confirmed = await waitForTransactionConfirmation(
    client,
    txId,
    wallet.address,
    60000  // 60 second timeout
  );

  if (confirmed) {
    console.log('Payment confirmed!');
  } else {
    console.log('Confirmation timeout - check manually');
  }
}
```

## Connection Management

### Automatic Reconnection

The SDK handles reconnection automatically:

```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420,
  eventManagerConfig: {
    autoReconnect: true,           // Enable auto-reconnect (default: true)
    reconnectDelay: 5000,          // Wait 5s before reconnecting (default: 5000)
    maxReconnectAttempts: 10       // Try 10 times (default: Infinity)
  }
});

// Monitor connection status
client.events.on('connected', () => {
  console.log('Connected to node');
});

client.events.on('disconnected', () => {
  console.log('Disconnected from node');
});

client.events.on('reconnecting', (attempt: number) => {
  console.log(`Reconnecting... attempt ${attempt}`);
});
```

### Manual Reconnection

```typescript
try {
  await client.events.connect();
  console.log('Connected');
} catch (error) {
  console.error('Connection failed:', error);

  // Retry manually
  for (let i = 0; i < 5; i++) {
    console.log(`Retry ${i + 1}/5...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      await client.events.connect();
      console.log('Connected!');
      break;
    } catch (error) {
      console.error('Retry failed');
    }
  }
}
```

### Health Checks

```typescript
async function healthCheck(client: HoosatClient): Promise<boolean> {
  try {
    const result = await client.getInfo();
    return result.ok;
  } catch (error) {
    return false;
  }
}

// Periodic health checks
setInterval(async () => {
  const healthy = await healthCheck(client);

  if (!healthy) {
    console.warn('Node connection unhealthy');

    // Attempt reconnection
    try {
      await client.events.reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }
}, 60000);  // Check every minute
```

## Advanced Patterns

### Block Monitor with Stats

```typescript
class BlockMonitor {
  private client: HoosatClient;
  private blockCount: number = 0;
  private startTime: Date = new Date();
  private lastBlockTime: Date = new Date();

  constructor(client: HoosatClient) {
    this.client = client;
  }

  async start() {
    await this.client.events.subscribeToBlockAdded();

    this.client.events.on(EventType.BlockAdded, (notification) => {
      this.handleBlock(notification);
    });

    console.log('Block monitor started');
  }

  private handleBlock(notification: BlockAddedNotification) {
    this.blockCount++;
    const now = new Date();

    const timeSinceStart = (now.getTime() - this.startTime.getTime()) / 1000;
    const timeSinceLastBlock = (now.getTime() - this.lastBlockTime.getTime()) / 1000;

    this.lastBlockTime = now;

    console.log('\n=== New Block ===');
    console.log('Hash:', notification.blockHash.substring(0, 16) + '...');
    console.log('Time:', now.toISOString());
    console.log('DAA Score:', notification.blockHeader.daaScore);
    console.log('Blue Score:', notification.blockHeader.blueScore);
    console.log('Time since last:', timeSinceLastBlock.toFixed(2), 's');
    console.log('\nStatistics:');
    console.log('Total blocks:', this.blockCount);
    console.log('Average rate:', (this.blockCount / timeSinceStart).toFixed(2), 'blocks/s');
    console.log('================\n');
  }

  async stop() {
    await this.client.events.unsubscribeFromAll();
  }
}

// Usage
const monitor = new BlockMonitor(client);
await monitor.start();
```

### Event Aggregator

Aggregate multiple event types:

```typescript
class EventAggregator {
  private client: HoosatClient;
  private stats = {
    utxoChanges: 0,
    blocksAdded: 0,
    dagChanges: 0
  };

  constructor(client: HoosatClient) {
    this.client = client;
  }

  async start(addresses: string[]) {
    // Subscribe to everything
    await this.client.events.subscribeToUtxoChanges(addresses);
    await this.client.events.subscribeToBlockAdded();
    await this.client.events.subscribeToVirtualDagChanged();

    // Track all events
    this.client.events.on(EventType.UtxoChange, () => {
      this.stats.utxoChanges++;
      this.printStats();
    });

    this.client.events.on(EventType.BlockAdded, () => {
      this.stats.blocksAdded++;
      this.printStats();
    });

    this.client.events.on(EventType.VirtualDagChanged, () => {
      this.stats.dagChanges++;
      this.printStats();
    });

    console.log('Event aggregator started');
  }

  private printStats() {
    console.log('\n=== Event Statistics ===');
    console.log('UTXO changes:', this.stats.utxoChanges);
    console.log('Blocks added:', this.stats.blocksAdded);
    console.log('DAG changes:', this.stats.dagChanges);
    console.log('Total events:', Object.values(this.stats).reduce((a, b) => a + b, 0));
    console.log('========================\n');
  }

  async stop() {
    await this.client.events.unsubscribeFromAll();
  }
}
```

## Error Handling

### Robust Event Handler

```typescript
client.events.on(EventType.UtxoChange, async (notification) => {
  try {
    await handleUtxoChange(notification);
  } catch (error) {
    console.error('Error handling UTXO change:', error);

    // Don't let one error crash the listener
    // Log, alert, or retry as needed
  }
});

async function handleUtxoChange(notification: UtxoChangeNotification) {
  // Your handling logic
  // Errors will be caught by the wrapper
}
```

### Connection Error Recovery

```typescript
client.events.on('error', (error) => {
  console.error('Event stream error:', error);

  // Categorize errors
  if (error.message.includes('ECONNREFUSED')) {
    console.error('Node is not reachable - check network');
  } else if (error.message.includes('timeout')) {
    console.error('Connection timeout - node may be slow');
  } else {
    console.error('Unknown error:', error.message);
  }

  // Attempt recovery
  setTimeout(async () => {
    try {
      await client.events.reconnect();
      console.log('Reconnected successfully');
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }, 5000);
});
```

## Best Practices

### 1. Always Unsubscribe

```typescript
// Setup cleanup
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.events.unsubscribeFromAll();
  client.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.events.unsubscribeFromAll();
  client.disconnect();
  process.exit(0);
});
```

### 2. Limit Subscriptions

```typescript
// Don't subscribe to too many addresses at once
const MAX_ADDRESSES = 100;

if (addresses.length > MAX_ADDRESSES) {
  console.warn(`Too many addresses (${addresses.length}), limiting to ${MAX_ADDRESSES}`);
  addresses = addresses.slice(0, MAX_ADDRESSES);
}

await client.events.subscribeToUtxoChanges(addresses);
```

### 3. Debounce High-Frequency Events

```typescript
let updateTimer: NodeJS.Timeout | null = null;

client.events.on(EventType.BlockAdded, () => {
  // Debounce updates to avoid overwhelming UI/DB
  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  updateTimer = setTimeout(() => {
    refreshData();
  }, 1000);  // Wait 1s after last event
});
```

### 4. Handle Missed Events

```typescript
client.events.on('reconnecting', async () => {
  console.log('Connection lost - refreshing state after reconnect');
});

client.events.on('connected', async () => {
  // Refresh state in case we missed events while disconnected
  await refreshAllBalances();
  console.log('State refreshed after reconnection');
});
```

## Complete Example

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatUtils,
  EventType
} from 'hoosat-sdk';

async function completeMonitoringExample() {
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420,
    eventManagerConfig: {
      autoReconnect: true,
      reconnectDelay: 5000
    }
  });

  const wallet = HoosatCrypto.importKeyPair(
    process.env.WALLET_PRIVATE_KEY!,
    'mainnet'
  );

  console.log('Monitoring address:', wallet.address);

  // Get initial balance
  const balanceResult = await client.getBalance(wallet.address);
  let currentBalance = balanceResult.ok
    ? BigInt(balanceResult.result.balance)
    : 0n;

  console.log('Initial balance:', HoosatUtils.sompiToAmount(currentBalance), 'HTN');
  console.log();

  // Subscribe to changes
  await client.events.subscribeToUtxoChanges([wallet.address]);
  await client.events.subscribeToBlockAdded();

  // Handle UTXO changes
  client.events.on(EventType.UtxoChange, (notification) => {
    console.log('[UTXO Change]', new Date().toISOString());

    let netChange = 0n;

    for (const utxo of notification.added) {
      const amount = BigInt(utxo.utxoEntry.amount);
      netChange += amount;
      console.log(`  + ${HoosatUtils.sompiToAmount(amount)} HTN`);
    }

    for (const utxo of notification.removed) {
      const amount = BigInt(utxo.utxoEntry.amount);
      netChange -= amount;
      console.log(`  - ${HoosatUtils.sompiToAmount(amount)} HTN`);
    }

    currentBalance += netChange;
    console.log('  New balance:', HoosatUtils.sompiToAmount(currentBalance), 'HTN');
    console.log();
  });

  // Handle new blocks
  client.events.on(EventType.BlockAdded, (notification) => {
    console.log('[New Block]', notification.blockHash.substring(0, 16) + '...');
  });

  // Handle connection events
  client.events.on('connected', () => {
    console.log('[Status] Connected to node');
  });

  client.events.on('disconnected', () => {
    console.log('[Status] Disconnected from node');
  });

  client.events.on('reconnecting', (attempt: number) => {
    console.log(`[Status] Reconnecting... attempt ${attempt}`);
  });

  client.events.on('error', (error) => {
    console.error('[Error]', error.message);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await client.events.unsubscribeFromAll();
    client.disconnect();
    process.exit(0);
  });

  console.log('Monitoring started. Press Ctrl+C to stop.');
}

completeMonitoringExample();
```

## Next Steps

- [Transaction Guide](./transactions.md) - Build and send transactions
- [Batch Payments](./batch-payments.md) - Multi-recipient payments
- [Security Best Practices](./security.md) - Secure your applications
