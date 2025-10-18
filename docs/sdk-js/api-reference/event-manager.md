---
sidebar_position: 6
---

# HoosatEventManager API Reference

Complete API reference for `HoosatEventManager` - real-time event streaming and WebSocket management.

## Overview

`HoosatEventManager` provides real-time blockchain event streaming via gRPC:
- **UTXO changes**: Monitor address balance changes
- **Block notifications**: Track new blocks
- **Virtual DAG changes**: Monitor consensus updates
- **Automatic reconnection**: Handle network interruptions
- **Multi-subscription**: Subscribe to multiple event types

## Accessing the Event Manager

The event manager is accessed through `HoosatClient`:

```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

// Access event manager
const events = client.events;
```

## Configuration

### Event Manager Config

```typescript
interface EventManagerConfig {
  autoReconnect?: boolean;       // Auto-reconnect on disconnect (default: true)
  reconnectDelay?: number;       // Delay between reconnect attempts in ms (default: 5000)
  maxReconnectAttempts?: number; // Max reconnection attempts (default: Infinity)
  debug?: boolean;               // Enable debug logging (default: false)
}

const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420,
  eventManagerConfig: {
    autoReconnect: true,
    reconnectDelay: 5000,
    maxReconnectAttempts: 10,
    debug: false
  }
});
```

## Subscriptions

### `subscribeToUtxoChanges(addresses: string[])`

Subscribe to UTXO changes for specific addresses.

**Parameters:**
- `addresses` - Array of Hoosat addresses to monitor

**Returns:** `Promise<void>`

**Example:**
```typescript
// Subscribe to single address
await client.events.subscribeToUtxoChanges([
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
]);

// Subscribe to multiple addresses
await client.events.subscribeToUtxoChanges([
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02',
  'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
  'hoosat:qzk8h2q7wn9p3j5m6x4r8t5v3w9y2k4m7p8q6r9t3v5w8x2z4b7c9d'
]);

// Listen for changes
client.events.on(EventType.UtxoChange, (notification) => {
  console.log('UTXO changed for:', notification.address);
  console.log('Added:', notification.added.length);
  console.log('Removed:', notification.removed.length);
});
```

**Event payload:**
```typescript
interface UtxoChangeNotification {
  address: string;
  added: UtxoEntry[];
  removed: UtxoEntry[];
}
```

### `unsubscribeFromUtxoChanges(addresses: string[])`

Unsubscribe from UTXO changes.

**Parameters:**
- `addresses` - Array of addresses to stop monitoring

**Returns:** `Promise<void>`

**Example:**
```typescript
await client.events.unsubscribeFromUtxoChanges([
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
]);

console.log('Unsubscribed from address');
```

### `subscribeToBlockAdded()`

Subscribe to new block notifications.

**Returns:** `Promise<void>`

**Example:**
```typescript
await client.events.subscribeToBlockAdded();

client.events.on(EventType.BlockAdded, (notification) => {
  console.log('New block added!');
  console.log('Hash:', notification.blockHash);
  console.log('Timestamp:', notification.blockHeader.timestamp);
  console.log('DAA Score:', notification.blockHeader.daaScore);
});
```

**Event payload:**
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
```

### `unsubscribeFromBlockAdded()`

Unsubscribe from block notifications.

**Returns:** `Promise<void>`

**Example:**
```typescript
await client.events.unsubscribeFromBlockAdded();
```

### `subscribeToVirtualDagChanged()`

Subscribe to virtual DAG changes.

**Returns:** `Promise<void>`

**Example:**
```typescript
await client.events.subscribeToVirtualDagChanged();

client.events.on(EventType.VirtualDagChanged, (notification) => {
  console.log('Virtual DAG changed');
  // Trigger balance refresh or other actions
});
```

### `unsubscribeFromVirtualDagChanged()`

Unsubscribe from virtual DAG changes.

**Returns:** `Promise<void>`

### `unsubscribeFromAll()`

Unsubscribe from all events and close connection.

**Returns:** `Promise<void>`

**Example:**
```typescript
// Cleanup on shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.events.unsubscribeFromAll();
  client.disconnect();
  process.exit(0);
});
```

## Event Listeners

### `on(eventType: EventType, callback: Function)`

Register event listener.

**Parameters:**
- `eventType` - Type of event to listen for
- `callback` - Function to call when event occurs

**Returns:** `void`

**Event Types:**
```typescript
enum EventType {
  UtxoChange = 'utxo_change',
  BlockAdded = 'block_added',
  VirtualDagChanged = 'virtual_dag_changed',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Reconnecting = 'reconnecting',
  Error = 'error'
}
```

**Examples:**
```typescript
// UTXO changes
client.events.on(EventType.UtxoChange, (notification) => {
  console.log('UTXO change:', notification);
});

// Block notifications
client.events.on(EventType.BlockAdded, (notification) => {
  console.log('New block:', notification.blockHash);
});

// Connection events
client.events.on('connected', () => {
  console.log('Connected to node');
});

client.events.on('disconnected', () => {
  console.log('Disconnected from node');
});

client.events.on('reconnecting', (attempt: number) => {
  console.log(`Reconnecting... attempt ${attempt}`);
});

client.events.on('error', (error) => {
  console.error('Event stream error:', error);
});
```

### `off(eventType: EventType, callback?: Function)`

Remove event listener.

**Parameters:**
- `eventType` - Type of event
- `callback` - Specific callback to remove (optional)

**Returns:** `void`

**Examples:**
```typescript
// Remove specific handler
const handler = (notification) => {
  console.log('UTXO changed');
};

client.events.on(EventType.UtxoChange, handler);

// Later...
client.events.off(EventType.UtxoChange, handler);

// Remove all handlers for event type
client.events.off(EventType.UtxoChange);
```

### `once(eventType: EventType, callback: Function)`

Register one-time event listener.

**Parameters:**
- `eventType` - Type of event
- `callback` - Function to call once

**Returns:** `void`

**Example:**
```typescript
// Wait for single block
client.events.once(EventType.BlockAdded, (notification) => {
  console.log('First block received:', notification.blockHash);
  // Handler is automatically removed after this
});
```

## Connection Management

### `connect()`

Manually connect to event stream.

**Returns:** `Promise<void>`

**Example:**
```typescript
try {
  await client.events.connect();
  console.log('Connected to event stream');
} catch (error) {
  console.error('Connection failed:', error);
}
```

**Note:** Connection is automatically established when subscribing to events.

### `disconnect()`

Disconnect from event stream.

**Returns:** `void`

**Example:**
```typescript
client.events.disconnect();
console.log('Disconnected');
```

### `reconnect()`

Manually trigger reconnection.

**Returns:** `Promise<void>`

**Example:**
```typescript
try {
  await client.events.reconnect();
  console.log('Reconnected');
} catch (error) {
  console.error('Reconnection failed:', error);
}
```

### `isConnected()`

Check connection status.

**Returns:** `boolean` - True if connected

**Example:**
```typescript
if (client.events.isConnected()) {
  console.log('Event stream is connected');
} else {
  console.log('Event stream is disconnected');
}
```

## Complete Examples

### Balance Monitor

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatUtils,
  EventType
} from 'hoosat-sdk';

async function monitorBalance() {
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420
  });

  const wallet = HoosatCrypto.importKeyPair(
    process.env.WALLET_PRIVATE_KEY!,
    'mainnet'
  );

  console.log('Monitoring:', wallet.address);

  // Get initial balance
  const balanceResult = await client.getBalance(wallet.address);
  let currentBalance = balanceResult.ok
    ? BigInt(balanceResult.result.balance)
    : 0n;

  console.log('Initial balance:', HoosatUtils.sompiToAmount(currentBalance), 'HTN\n');

  // Subscribe to changes
  await client.events.subscribeToUtxoChanges([wallet.address]);

  // Handle UTXO changes
  client.events.on(EventType.UtxoChange, (notification) => {
    console.log('[UTXO Change]', new Date().toISOString());

    let netChange = 0n;

    // Process added UTXOs
    for (const utxo of notification.added) {
      const amount = BigInt(utxo.utxoEntry.amount);
      netChange += amount;

      console.log(`  + ${HoosatUtils.sompiToAmount(amount)} HTN`);
      console.log(`    TX: ${utxo.outpoint.transactionId}`);
    }

    // Process removed UTXOs
    for (const utxo of notification.removed) {
      const amount = BigInt(utxo.utxoEntry.amount);
      netChange -= amount;

      console.log(`  - ${HoosatUtils.sompiToAmount(amount)} HTN`);
      console.log(`    TX: ${utxo.outpoint.transactionId}`);
    }

    // Update balance
    currentBalance += netChange;

    console.log(`  New balance: ${HoosatUtils.sompiToAmount(currentBalance)} HTN`);
    console.log();
  });

  // Handle connection events
  client.events.on('connected', () => {
    console.log('[Status] Connected');
  });

  client.events.on('disconnected', () => {
    console.log('[Status] Disconnected');
  });

  client.events.on('reconnecting', (attempt: number) => {
    console.log(`[Status] Reconnecting... attempt ${attempt}`);
  });

  client.events.on('error', (error) => {
    console.error('[Error]', error.message);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await client.events.unsubscribeFromAll();
    client.disconnect();
    process.exit(0);
  });

  console.log('Monitoring started. Press Ctrl+C to stop.\n');
}

monitorBalance();
```

### Payment Detection System

```typescript
class PaymentDetector {
  private client: HoosatClient;
  private address: string;
  private onPayment: (txId: string, amount: string) => void;

  constructor(
    client: HoosatClient,
    address: string,
    onPayment: (txId: string, amount: string) => void
  ) {
    this.client = client;
    this.address = address;
    this.onPayment = onPayment;
  }

  async start(): Promise<void> {
    // Subscribe to address
    await this.client.events.subscribeToUtxoChanges([this.address]);

    // Handle UTXO changes
    this.client.events.on(EventType.UtxoChange, (notification) => {
      if (notification.address === this.address) {
        this.handleUtxoChange(notification);
      }
    });

    console.log('Payment detector started for:', this.address);
  }

  private handleUtxoChange(notification: UtxoChangeNotification): void {
    // Only process incoming payments (added UTXOs)
    for (const utxo of notification.added) {
      const amount = utxo.utxoEntry.amount;
      const txId = utxo.outpoint.transactionId;

      console.log('Payment detected!');
      console.log('Amount:', HoosatUtils.sompiToAmount(amount), 'HTN');
      console.log('TX ID:', txId);

      // Trigger callback
      try {
        this.onPayment(txId, amount);
      } catch (error) {
        console.error('Payment callback error:', error);
      }
    }
  }

  async stop(): Promise<void> {
    await this.client.events.unsubscribeFromAll();
    console.log('Payment detector stopped');
  }
}

// Usage
const detector = new PaymentDetector(
  client,
  merchantAddress,
  (txId, amount) => {
    console.log(`Processing payment of ${HoosatUtils.sompiToAmount(amount)} HTN`);

    // Update order status
    // Send confirmation email
    // Trigger fulfillment
  }
);

await detector.start();
```

### Multi-Address Monitor

```typescript
class MultiAddressMonitor {
  private client: HoosatClient;
  private addresses: Map<string, AddressInfo> = new Map();

  constructor(client: HoosatClient) {
    this.client = client;
  }

  addAddress(name: string, address: string): void {
    this.addresses.set(address, {
      name,
      balance: 0n,
      lastUpdate: new Date()
    });
  }

  async start(): Promise<void> {
    const addresses = Array.from(this.addresses.keys());

    // Subscribe to all addresses
    await this.client.events.subscribeToUtxoChanges(addresses);

    // Get initial balances
    for (const address of addresses) {
      await this.refreshBalance(address);
    }

    // Handle changes
    this.client.events.on(EventType.UtxoChange, (notification) => {
      this.handleChange(notification);
    });

    console.log(`Monitoring ${addresses.length} addresses`);
    this.printStatus();
  }

  private handleChange(notification: UtxoChangeNotification): void {
    const info = this.addresses.get(notification.address);
    if (!info) return;

    let netChange = 0n;

    for (const utxo of notification.added) {
      netChange += BigInt(utxo.utxoEntry.amount);
    }

    for (const utxo of notification.removed) {
      netChange -= BigInt(utxo.utxoEntry.amount);
    }

    info.balance += netChange;
    info.lastUpdate = new Date();

    console.log(`\n[${info.name}] Balance changed`);
    this.printStatus();
  }

  private async refreshBalance(address: string): Promise<void> {
    const result = await this.client.getBalance(address);

    if (result.ok) {
      const info = this.addresses.get(address)!;
      info.balance = BigInt(result.result.balance);
      info.lastUpdate = new Date();
    }
  }

  private printStatus(): void {
    console.log('\n=== Wallet Status ===');

    let total = 0n;

    for (const [address, info] of this.addresses) {
      console.log(`${info.name}:`);
      console.log(`  Balance: ${HoosatUtils.sompiToAmount(info.balance)} HTN`);
      console.log(`  Last update: ${info.lastUpdate.toISOString()}`);

      total += info.balance;
    }

    console.log(`\nTotal: ${HoosatUtils.sompiToAmount(total)} HTN`);
    console.log('====================\n');
  }

  async stop(): Promise<void> {
    await this.client.events.unsubscribeFromAll();
  }
}

interface AddressInfo {
  name: string;
  balance: bigint;
  lastUpdate: Date;
}

// Usage
const monitor = new MultiAddressMonitor(client);

monitor.addAddress('Main Wallet', 'hoosat:qz7ulu...');
monitor.addAddress('Savings', 'hoosat:qpm4n7...');
monitor.addAddress('Trading', 'hoosat:qzk8h2...');

await monitor.start();
```

### Block Monitor with Statistics

```typescript
class BlockMonitor {
  private client: HoosatClient;
  private blockCount: number = 0;
  private startTime: Date = new Date();
  private lastBlockTime: Date = new Date();

  constructor(client: HoosatClient) {
    this.client = client;
  }

  async start(): Promise<void> {
    await this.client.events.subscribeToBlockAdded();

    this.client.events.on(EventType.BlockAdded, (notification) => {
      this.handleBlock(notification);
    });

    console.log('Block monitor started\n');
  }

  private handleBlock(notification: BlockAddedNotification): void {
    this.blockCount++;
    const now = new Date();

    const timeSinceStart = (now.getTime() - this.startTime.getTime()) / 1000;
    const timeSinceLastBlock = (now.getTime() - this.lastBlockTime.getTime()) / 1000;

    this.lastBlockTime = now;

    console.log('=== New Block ===');
    console.log('Hash:', notification.blockHash.substring(0, 16) + '...');
    console.log('Time:', now.toISOString());
    console.log('DAA Score:', notification.blockHeader.daaScore);
    console.log('Blue Score:', notification.blockHeader.blueScore);
    console.log('Time since last:', timeSinceLastBlock.toFixed(2), 's');
    console.log('\nStatistics:');
    console.log('Total blocks:', this.blockCount);
    console.log('Average rate:', (this.blockCount / timeSinceStart).toFixed(2), 'blocks/s');
    console.log('=================\n');
  }

  async stop(): Promise<void> {
    await this.client.events.unsubscribeFromAll();
  }
}

// Usage
const monitor = new BlockMonitor(client);
await monitor.start();
```

## Error Handling

### Connection Errors

```typescript
client.events.on('error', (error) => {
  console.error('Event stream error:', error);

  if (error.message.includes('ECONNREFUSED')) {
    console.error('Node is not reachable');
  } else if (error.message.includes('timeout')) {
    console.error('Connection timeout');
  }
});

// Handle reconnection failures
let reconnectAttempts = 0;

client.events.on('reconnecting', (attempt: number) => {
  reconnectAttempts = attempt;
  console.log(`Reconnect attempt ${attempt}`);

  if (attempt > 5) {
    console.error('Multiple reconnect failures - check node status');
  }
});
```

### Event Handler Errors

```typescript
// Wrap handlers in try-catch
client.events.on(EventType.UtxoChange, async (notification) => {
  try {
    await processUtxoChange(notification);
  } catch (error) {
    console.error('Error processing UTXO change:', error);
    // Log error but don't crash the event listener
  }
});
```

## Best Practices

### 1. Always Unsubscribe on Shutdown

```typescript
process.on('SIGINT', async () => {
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

### 2. Limit Subscription Count

```typescript
const MAX_ADDRESSES = 100;

if (addresses.length > MAX_ADDRESSES) {
  console.warn(`Too many addresses, limiting to ${MAX_ADDRESSES}`);
  addresses = addresses.slice(0, MAX_ADDRESSES);
}

await client.events.subscribeToUtxoChanges(addresses);
```

### 3. Handle Reconnection

```typescript
client.events.on('connected', async () => {
  // Refresh state after reconnection
  await refreshBalances();
  console.log('State refreshed');
});
```

### 4. Implement Health Checks

```typescript
setInterval(async () => {
  if (!client.events.isConnected()) {
    console.warn('Event stream disconnected');
    try {
      await client.events.reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }
}, 60000);  // Check every minute
```

## Next Steps

- [Real-time Monitoring Guide](../guides/real-time-monitoring.md) - Detailed monitoring patterns
- [HoosatClient](./client.md) - Client API reference
- [Transaction Guide](../guides/transactions.md) - Transaction handling
