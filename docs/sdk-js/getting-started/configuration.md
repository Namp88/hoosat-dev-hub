---
sidebar_position: 3
---

# Configuration

Learn how to configure the Hoosat SDK for different environments and use cases.

## Basic Configuration

### Single Node Setup

The simplest configuration connects to a single Hoosat node:

```typescript
import { HoosatClient } from 'hoosat-sdk';

const client = new HoosatClient({
  host: '54.38.176.95',  // Node hostname or IP
  port: 42420,            // Node port (default: 42420)
  timeout: 10000          // Request timeout in milliseconds (default: 10000)
});
```

### Multi-Node Setup (High Availability)

For production applications, configure multiple nodes with automatic failover:

```typescript
const client = new HoosatClient({
  nodes: [
    {
      host: '54.38.176.95',
      port: 42420,
      primary: true,        // Mark as primary node
      name: 'Primary Node'  // Optional name for logging
    },
    {
      host: 'backup1.example.com',
      port: 42420,
      name: 'Backup Node 1'
    },
    {
      host: 'backup2.example.com',
      port: 42420,
      timeout: 15000,       // Per-node timeout override
      name: 'Backup Node 2'
    }
  ],
  healthCheckInterval: 30000,  // Check health every 30 seconds
  requireUtxoIndex: true,      // Only use nodes with UTXO index
  requireSynced: true,         // Only use synced nodes
  retryAttempts: 3,            // Retry failed requests
  retryDelay: 1000,            // Wait between retries
  debug: true                  // Enable debug logging
});
```

**Benefits of multi-node setup:**
- Automatic failover when primary node fails
- Health checks validate node status
- Transparent request retry
- Real-time node status monitoring

Check node status:

```typescript
const nodesStatus = client.getNodesStatus();

nodesStatus?.forEach(node => {
  console.log(`${node.config.name}:`);
  console.log(`  Healthy: ${node.health.isHealthy}`);
  console.log(`  Synced: ${node.health.isSynced}`);
  console.log(`  UTXO Indexed: ${node.health.hasUtxoIndex}`);
  console.log(`  Last Check: ${new Date(node.health.lastCheckTime)}`);
});
```

## Event Manager Configuration

Configure real-time event streaming:

```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420,
  events: {
    maxReconnectAttempts: 10,     // Max reconnection tries (default: 5)
    reconnectDelay: 2000,          // Delay between reconnects in ms (default: 2000)
    maxSubscribedAddresses: 1000,  // Max addresses to monitor (default: 1000)
    debug: false                   // Enable event debug logs (default: false)
  }
});
```

### Event Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxReconnectAttempts` | number | 5 | Maximum reconnection attempts |
| `reconnectDelay` | number | 2000 | Delay between reconnection attempts (ms) |
| `maxSubscribedAddresses` | number | 1000 | Maximum addresses that can be monitored |
| `debug` | boolean | false | Enable debug logging for events |

## Environment-Specific Configurations

### Development

```typescript
const client = new HoosatClient({
  host: 'localhost',
  port: 42420,
  timeout: 30000,  // Longer timeout for debugging
  debug: true      // Enable detailed logging
});
```

### Testnet

```typescript
const client = new HoosatClient({
  host: 'testnet.hoosat.fi',  // Testnet node
  port: 42420,
  events: {
    debug: true  // Helpful for testing
  }
});

// Generate testnet wallet
const wallet = HoosatCrypto.generateKeyPair('testnet');
// Address starts with "hoosattest:"
```

### Production (Mainnet)

```typescript
const client = new HoosatClient({
  nodes: [
    { host: 'node1.hoosat.fi', port: 42420, primary: true, name: 'Primary' },
    { host: 'node2.hoosat.fi', port: 42420, name: 'Backup 1' },
    { host: 'node3.hoosat.fi', port: 42420, name: 'Backup 2' }
  ],
  healthCheckInterval: 30000,
  requireUtxoIndex: true,
  requireSynced: true,
  retryAttempts: 3,
  retryDelay: 1000,
  debug: false,
  events: {
    maxReconnectAttempts: 10,
    reconnectDelay: 2000
  }
});
```

## Using Environment Variables

Store configuration in environment variables for security and flexibility:

**.env:**
```env
# Node Configuration
HOOSAT_NODE_HOST=54.38.176.95
HOOSAT_NODE_PORT=42420
HOOSAT_TIMEOUT=15000

# Network
HOOSAT_NETWORK=mainnet

# Features
HOOSAT_DEBUG=false
HOOSAT_RETRY_ATTEMPTS=3
```

**config.ts:**
```typescript
import 'dotenv/config';

export const config = {
  node: {
    host: process.env.HOOSAT_NODE_HOST || '127.0.0.1',
    port: parseInt(process.env.HOOSAT_NODE_PORT || '42420'),
    timeout: parseInt(process.env.HOOSAT_TIMEOUT || '10000')
  },
  network: (process.env.HOOSAT_NETWORK as 'mainnet' | 'testnet') || 'mainnet',
  debug: process.env.HOOSAT_DEBUG === 'true',
  retry: {
    attempts: parseInt(process.env.HOOSAT_RETRY_ATTEMPTS || '3'),
    delay: 1000
  }
};
```

**Usage:**
```typescript
import { HoosatClient } from 'hoosat-sdk';
import { config } from './config';

const client = new HoosatClient({
  host: config.node.host,
  port: config.node.port,
  timeout: config.node.timeout,
  debug: config.debug
});
```

## Connection Timeout

Configure how long to wait for responses:

```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420,
  timeout: 15000  // 15 seconds
});
```

**Timeout recommendations:**
- **Fast network:** 5000-10000ms (5-10 seconds)
- **Slow network:** 15000-30000ms (15-30 seconds)
- **Public nodes:** 20000ms+ (20+ seconds)

## Retry Configuration

Configure automatic retry behavior for failed requests:

```typescript
const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420,
  retryAttempts: 3,   // Retry up to 3 times
  retryDelay: 1000    // Wait 1 second between retries
});
```

**Retry strategy:**
- Request fails → wait `retryDelay`ms
- Retry → if fails, wait `retryDelay`ms again
- Repeat up to `retryAttempts` times
- If all attempts fail, return error

## Type Safety

The SDK provides full TypeScript support with comprehensive types:

```typescript
import type {
  HoosatClientConfig,
  NodeConfig,
  EventManagerConfig
} from 'hoosat-sdk';

// Type-safe configuration
const nodeConfig: NodeConfig = {
  host: '54.38.176.95',
  port: 42420,
  primary: true,
  name: 'My Node'
};

const eventConfig: EventManagerConfig = {
  maxReconnectAttempts: 10,
  reconnectDelay: 2000,
  debug: false
};

const clientConfig: HoosatClientConfig = {
  nodes: [nodeConfig],
  events: eventConfig,
  debug: true
};

const client = new HoosatClient(clientConfig);
```

## Client Methods

Access client configuration at runtime:

```typescript
// Get client info
const info = client.getClientInfo();
console.log('Host:', info.host);
console.log('Port:', info.port);
console.log('Timeout:', info.timeout);

// Get node status (multi-node only)
const status = client.getNodesStatus();
```

## Best Practices

### 1. Use Environment Variables

Never hardcode sensitive configuration:

```typescript
// Bad
const client = new HoosatClient({
  host: '192.168.1.100',
  port: 42420
});

// Good
const client = new HoosatClient({
  host: process.env.HOOSAT_NODE_HOST,
  port: parseInt(process.env.HOOSAT_NODE_PORT || '42420')
});
```

### 2. Enable Debug in Development

Debug mode provides valuable insights during development:

```typescript
const isDev = process.env.NODE_ENV === 'development';

const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420,
  debug: isDev,
  events: {
    debug: isDev
  }
});
```

### 3. Use Multi-Node for Production

Always configure multiple nodes for production:

```typescript
const isProd = process.env.NODE_ENV === 'production';

const client = new HoosatClient(
  isProd
    ? {
        nodes: [
          { host: 'node1.example.com', port: 42420, primary: true },
          { host: 'node2.example.com', port: 42420 }
        ],
        healthCheckInterval: 30000,
        requireSynced: true
      }
    : {
        host: 'localhost',
        port: 42420,
        debug: true
      }
);
```

### 4. Cleanup Resources

Always disconnect when done:

```typescript
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.events.unsubscribeFromAll();
  client.disconnect();
  process.exit(0);
});
```

## Next Steps

- [Core Concepts](../core-concepts/architecture.md) - Understand SDK architecture
- [API Reference](../api-reference/client.md) - Complete API documentation
