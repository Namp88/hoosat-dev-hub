---
sidebar_position: 1
---

# HoosatClient API Reference

Complete API reference for the `HoosatClient` class - the main interface for interacting with Hoosat blockchain nodes.

## Constructor

### `new HoosatClient(config?: HoosatClientConfig)`

Creates a new Hoosat client instance.

**Parameters:**

```typescript
interface HoosatClientConfig {
  // Single-node configuration (legacy mode)
  host?: string;              // Node hostname/IP (default: '127.0.0.1')
  port?: number;              // Node port (default: 42420)
  timeout?: number;           // Request timeout in ms (default: 10000)

  // Multi-node configuration (high availability)
  nodes?: NodeConfig[];       // Array of nodes for failover
  healthCheckInterval?: number;    // Health check interval in ms (default: 30000)
  retryAttempts?: number;         // Retry attempts per request (default: 3)
  retryDelay?: number;            // Delay between retries in ms (default: 1000)
  requireUtxoIndex?: boolean;     // Only use nodes with UTXO index (default: true)
  requireSynced?: boolean;        // Only use synced nodes (default: true)

  // Event manager configuration
  events?: EventManagerConfig;
  debug?: boolean;            // Enable debug logging (default: false)
}

interface NodeConfig {
  host: string;               // Node hostname or IP
  port: number;               // Node port
  timeout?: number;           // Per-node timeout override
  primary?: boolean;          // Designate as primary node
  name?: string;              // Optional name for logging
}
```

**Examples:**

```typescript
// Single node
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

// Multi-node with failover
const client = new HoosatClient({
  nodes: [
    { host: '54.38.176.95', port: 42420, primary: true, name: 'Primary' },
    { host: 'backup.example.com', port: 42420, name: 'Backup' }
  ],
  healthCheckInterval: 30000,
  requireUtxoIndex: true,
  requireSynced: true
});
```

## Node Information

### `getInfo()`

Get node information and status.

**Returns:** `Promise<BaseResult<GetInfo>>`

```typescript
interface GetInfo {
  p2pId: string;
  mempoolSize: string;
  serverVersion: string;
  isUtxoIndexed: boolean;
  isSynced: boolean;
}
```

**Example:**
```typescript
const info = await client.getInfo();

if (info.ok) {
  console.log('Version:', info.result.serverVersion);
  console.log('Synced:', info.result.isSynced);
  console.log('UTXO Index:', info.result.isUtxoIndexed);
  console.log('Mempool size:', info.result.mempoolSize);
}
```

### `getCurrentNetwork()`

Get current network type (mainnet/testnet).

**Returns:** `Promise<BaseResult<GetCurrentNetwork>>`

```typescript
interface GetCurrentNetwork {
  currentNetwork: string; // 'hoosat-mainnet' or 'hoosat-testnet-10'
}
```

### `getConnectedPeerInfo()`

Get information about connected peers.

**Returns:** `Promise<BaseResult<GetConnectedPeerInfo>>`

## Blockchain Queries

### `getSelectedTipHash()`

Get the hash of the current selected tip block.

**Returns:** `Promise<BaseResult<GetSelectedTipHash>>`

```typescript
interface GetSelectedTipHash {
  selectedTipHash: string;
}
```

### `getBlock(blockHash: string, includeTransactions?: boolean)`

Get block data by hash.

**Parameters:**
- `blockHash` - Block hash (64-character hex string)
- `includeTransactions` - Include full transaction data (default: false)

**Returns:** `Promise<BaseResult<GetBlock>>`

**Example:**
```typescript
const block = await client.getBlock(blockHash, true);

if (block.ok) {
  console.log('Block height:', block.result.header.blueScore);
  console.log('Transactions:', block.result.transactions.length);
}
```

### `getBlocks(lowHash: string, includeTransactions?: boolean)`

Get multiple blocks starting from a hash.

**Returns:** `Promise<BaseResult<GetBlocks>>`

### `getBlockCount()`

Get current blockchain height.

**Returns:** `Promise<BaseResult<GetBlockCount>>`

```typescript
const count = await client.getBlockCount();
if (count.ok) {
  console.log('Height:', count.result.blockCount);
}
```

### `getBlockDagInfo()`

Get DAG structure information.

**Returns:** `Promise<BaseResult<GetBlockDagInfo>>`

### `getBlockByTransactionId(txId: string)`

Find the block containing a specific transaction.

**Parameters:**
- `txId` - Transaction ID (64-character hex string)

**Returns:** `Promise<BaseResult<GetBlock | null>>`

**Description:**
Searches for the block that contains the specified transaction. This is useful for:
- Confirming transaction inclusion in a block
- Getting block metadata for a transaction (DAA score, timestamp, etc.)
- Verifying transaction confirmations
- Building block explorers and analytics tools

**Requirements:**
- Node must have `--utxoindex` enabled
- Transaction must be confirmed (not in mempool)
- Returns `null` if transaction not found

**Examples:**
```typescript
// Find block for confirmed transaction
const result = await client.getBlockByTransactionId(txId);

if (result.ok && result.result) {
  const block = result.result;
  console.log('Transaction confirmed in block:');
  console.log('  Block hash:', block.header.hash);
  console.log('  DAA score:', block.header.blueScore);
  console.log('  Timestamp:', new Date(parseInt(block.header.timestamp)));
  console.log('  Transactions:', block.transactions.length);
} else if (result.ok && result.result === null) {
  console.log('Transaction not found in blockchain');
} else {
  console.error('Error:', result.error);
}

// Check transaction confirmations
async function getConfirmations(txId: string): Promise<number> {
  const blockResult = await client.getBlockByTransactionId(txId);

  if (!blockResult.ok || !blockResult.result) {
    return 0; // Not confirmed
  }

  const txBlock = blockResult.result;
  const dagInfo = await client.getBlockDagInfo();

  if (!dagInfo.ok) {
    throw new Error('Failed to get DAG info');
  }

  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);
  const txDaa = parseInt(txBlock.header.blueScore);

  return currentDaa - txDaa;
}

const confirmations = await getConfirmations(txId);
console.log(`Transaction has ${confirmations} confirmations`);

// Wait for transaction confirmation
async function waitForConfirmation(
  txId: string,
  minConfirmations: number = 10,
  pollInterval: number = 5000
): Promise<void> {
  console.log(`Waiting for ${minConfirmations} confirmations...`);

  while (true) {
    const confirmations = await getConfirmations(txId);

    if (confirmations >= minConfirmations) {
      console.log(`Transaction confirmed with ${confirmations} confirmations`);
      return;
    }

    console.log(`Current confirmations: ${confirmations}/${minConfirmations}`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}

await waitForConfirmation(txId, 10);

// Explorer: get transaction with block metadata
async function getTransactionDetails(txId: string) {
  const blockResult = await client.getBlockByTransactionId(txId);

  if (!blockResult.ok || !blockResult.result) {
    return null;
  }

  const block = blockResult.result;
  const tx = block.transactions.find(t => t.verboseData?.transactionId === txId);

  if (!tx) {
    throw new Error('Transaction not found in block');
  }

  return {
    transaction: tx,
    block: {
      hash: block.header.hash,
      daaScore: block.header.blueScore,
      timestamp: parseInt(block.header.timestamp),
      size: block.header.version
    },
    confirmations: await getConfirmations(txId)
  };
}

const details = await getTransactionDetails(txId);
if (details) {
  console.log('TX Details:', details);
}
```

**Response format:**
```typescript
interface GetBlock {
  header: {
    hash: string;
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
    parentsByLevel: string[][];
  };
  transactions: Transaction[];
  verboseData: {
    hash: string;
    difficulty: number;
    selectedParentHash: string;
    transactionIds: string[];
    isChainBlock: boolean;
  };
}
```

**Use cases:**
- Transaction confirmation tracking
- Block explorer transaction pages
- Analytics and reporting
- Payment verification systems
- Wallet transaction history with block data

**Note:** This method is more efficient than iterating through blocks manually. It uses the UTXO index to quickly locate the block.

## Balance & UTXOs

### `getBalance(address: string)`

Get balance for a single address.

**Parameters:**
- `address` - Hoosat address (with `hoosat:` prefix)

**Returns:** `Promise<BaseResult<GetBalanceByAddress>>`

```typescript
interface GetBalanceByAddress {
  address: string;
  balance: string;  // Balance in sompi
}
```

**Example:**
```typescript
const result = await client.getBalance('hoosat:qz7ulu...');

if (result.ok) {
  const htn = HoosatUtils.sompiToAmount(result.result.balance);
  console.log(`Balance: ${htn} HTN`);
}
```

### `getBalancesByAddresses(addresses: string[])`

Get balances for multiple addresses.

**Parameters:**
- `addresses` - Array of Hoosat addresses

**Returns:** `Promise<BaseResult<GetBalancesByAddresses>>`

```typescript
interface GetBalancesByAddresses {
  entries: Array<{
    address: string;
    balance: string;
  }>;
}
```

**Example:**
```typescript
const result = await client.getBalancesByAddresses([
  'hoosat:qz7ulu...',
  'hoosat:qq8xdv...'
]);

if (result.ok) {
  result.result.entries.forEach(entry => {
    console.log(`${entry.address}: ${entry.balance} sompi`);
  });
}
```

### `getUtxosByAddresses(addresses: string[])`

Get UTXOs for addresses.

**Parameters:**
- `addresses` - Array of Hoosat addresses

**Returns:** `Promise<BaseResult<GetUtxosByAddresses>>`

```typescript
interface GetUtxosByAddresses {
  utxos: UtxoForSigning[];
}

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

**Example:**
```typescript
const result = await client.getUtxosByAddresses([wallet.address]);

if (result.ok) {
  const utxos = result.result.utxos;
  console.log(`Found ${utxos.length} UTXOs`);

  utxos.forEach(utxo => {
    console.log(`Amount: ${utxo.utxoEntry.amount} sompi`);
    console.log(`TX: ${utxo.outpoint.transactionId}`);
  });
}
```

## Transactions

### `submitTransaction(transaction: Transaction, allowOrphan?: boolean)`

Submit a signed transaction to the network.

**Parameters:**
- `transaction` - Signed transaction object
- `allowOrphan` - Allow orphan transactions (default: false)

**Returns:** `Promise<BaseResult<SubmitTransaction>>`

```typescript
interface SubmitTransaction {
  transactionId: string;
}
```

**Example:**
```typescript
const result = await client.submitTransaction(signedTx);

if (result.ok) {
  console.log('TX ID:', result.result.transactionId);
} else {
  console.error('Submit failed:', result.error);
}
```

### `getTransactionStatus(txId: string, senderAddress: string, recipientAddress: string)`

Check transaction status (PENDING/CONFIRMED/NOT_FOUND).

**Parameters:**
- `txId` - Transaction ID
- `senderAddress` - Sender address
- `recipientAddress` - Recipient address

**Returns:** `Promise<BaseResult<GetTransactionStatus>>`

```typescript
interface GetTransactionStatus {
  status: 'PENDING' | 'CONFIRMED' | 'NOT_FOUND';
  details: {
    message?: string;
    fee?: string;
    blockDaaScore?: string;
  };
}
```

**Example:**
```typescript
const status = await client.getTransactionStatus(
  txId,
  senderAddr,
  recipientAddr
);

if (status.ok) {
  switch (status.result.status) {
    case 'PENDING':
      console.log('In mempool, fee:', status.result.details.fee);
      break;
    case 'CONFIRMED':
      console.log('Confirmed in block:', status.result.details.blockDaaScore);
      break;
    case 'NOT_FOUND':
      console.log('Not found:', status.result.details.message);
      break;
  }
}
```

**Note:** Node must be started with `--utxoindex` flag for CONFIRMED status detection.

## Mempool

### `getMempoolEntry(txId: string, includeOrphanPool?: boolean, filterTransactionPool?: boolean)`

Get single mempool entry.

**Parameters:**
- `txId` - Transaction ID
- `includeOrphanPool` - Search orphan pool (default: true)
- `filterTransactionPool` - Filter transaction pool (default: true)

**Returns:** `Promise<BaseResult<GetMempoolEntry>>`

### `getMempoolEntries(includeOrphanPool?: boolean, filterTransactionPool?: boolean)`

Get all mempool entries.

**Returns:** `Promise<BaseResult<GetMempoolEntries>>`

```typescript
const mempool = await client.getMempoolEntries();

if (mempool.ok) {
  console.log('Mempool size:', mempool.result.entries.length);
}
```

### `getMempoolEntriesByAddresses(addresses: string[], includeOrphanPool?: boolean, filterTransactionPool?: boolean)`

Get mempool entries for specific addresses.

**Returns:** `Promise<BaseResult<GetMempoolEntriesByAddresses>>`

## Events

The client includes an integrated event manager accessible via `client.events`.

See [HoosatEventManager](./event-manager.md) for complete documentation.

**Quick example:**
```typescript
// Subscribe to UTXO changes
await client.events.subscribeToUtxoChanges([address]);

// Listen for changes
client.events.on(EventType.UtxoChange, (notification) => {
  console.log('UTXOs changed!');
});
```

## Node Management (Multi-Node)

### `getNodesStatus()`

Get health status of all configured nodes.

**Returns:** `NodeStatus[] | null`

```typescript
interface NodeStatus {
  config: NodeConfig;
  health: NodeHealth;
}

interface NodeHealth {
  isHealthy: boolean;
  isSynced: boolean;
  hasUtxoIndex: boolean;
  lastCheckTime: number;
  error?: string;
}
```

**Example:**
```typescript
const status = client.getNodesStatus();

status?.forEach(node => {
  console.log(`${node.config.name}:`);
  console.log(`  Healthy: ${node.health.isHealthy}`);
  console.log(`  Synced: ${node.health.isSynced}`);
  console.log(`  UTXO Index: ${node.health.hasUtxoIndex}`);
});
```

## Client Info

### `getClientInfo()`

Get current client configuration.

**Returns:** Object with host, port, and timeout.

```typescript
const info = client.getClientInfo();
console.log(`Connected to ${info.host}:${info.port}`);
```

## Connection Management

### `disconnect()`

Close all connections and clean up resources.

**Returns:** `void`

```typescript
// Cleanup
await client.events.unsubscribeFromAll();
client.disconnect();
```

## Response Format

All methods return `BaseResult<T>`:

```typescript
interface BaseResult<T> {
  ok: boolean;         // true if successful
  result: T | null;    // Result data if successful
  error: string | null; // Error message if failed
}
```

**Always check `.ok` before accessing `.result`:**

```typescript
const result = await client.getBalance(address);

if (result.ok) {
  // Safe to use result.result
  console.log(result.result.balance);
} else {
  // Handle error
  console.error(result.error);
}
```

## Error Handling

Common errors:
- **Connection errors** - Node unreachable
- **Timeout errors** - Request took too long
- **Invalid parameters** - Bad address format, etc.
- **Node errors** - Node returned error

**Example:**
```typescript
try {
  const result = await client.getBalance(address);

  if (!result.ok) {
    // Expected error (bad address, etc.)
    console.error('Request failed:', result.error);
    return;
  }

  // Success
  console.log('Balance:', result.result.balance);
} catch (error) {
  // Unexpected error (network, etc.)
  console.error('Fatal error:', error);
}
```

## Next Steps

- [HoosatEventManager](./event-manager.md) - Real-time event streaming
- [HoosatCrypto](./crypto.md) - Cryptographic operations
- [HoosatTxBuilder](./tx-builder.md) - Transaction building
