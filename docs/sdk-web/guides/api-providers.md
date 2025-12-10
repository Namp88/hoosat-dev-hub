---
sidebar_position: 2
---

# API Provider Architecture

**Extensible, resilient API provider system for connecting to Hoosat blockchain nodes with automatic failover, load balancing, and performance optimization.**

## Overview

The API Provider Architecture introduces a flexible, pluggable system for connecting to Hoosat nodes. Instead of being tied to a single API endpoint, you can:

- **Use multiple providers** with automatic failover
- **Optimize performance** with fastest-response routing
- **Distribute load** across multiple endpoints
- **Build custom providers** for specialized use cases
- **Maintain 100% backward compatibility** with existing code

This architecture was contributed by [@codecustard](https://github.com/codecustard) in [commit f922e47](https://github.com/Namp88/hoosat-sdk-web/commit/f922e47).

## Core Concepts

### ApiProvider Interface

All providers implement the `ApiProvider` interface, defining the contract for blockchain data access:

```typescript
interface ApiProvider {
  // Balance queries
  getBalance(address: string): Promise<number>;

  // UTXO fetching
  getUtxos(addresses: string[]): Promise<UtxoForSigning[]>;

  // Transaction submission
  submitTransaction(transaction: Transaction): Promise<string>;

  // Network information
  getNetworkInfo(): Promise<NetworkInfo>;

  // Fee recommendations
  getFeeEstimate(): Promise<FeeEstimate>;

  // Health check
  ping(): Promise<boolean>;
}
```

This abstraction allows seamless provider swapping without changing application code.

### Provider Types

#### 1. HoosatProxyProvider

Connects to Hoosat proxy API (proxy.hoosat.net).

**Features:**
- Official Hoosat proxy endpoint
- Mainnet and testnet support
- Full UTXO index support
- Rate limiting protection

**Example:**
```typescript
import { createHoosatProxyProvider } from 'hoosat-sdk-web';

const provider = createHoosatProxyProvider({
  baseUrl: 'https://proxy.hoosat.net/api/v1',
  timeout: 10000,
  debug: false
});

// Use provider
const balance = await provider.getBalance('hoosat:qz7ulu...');
console.log('Balance:', balance, 'sompi');
```

#### 2. HoosatNetworkProvider

Connects to community network API (network.hoosat.fi).

**Features:**
- Community-operated endpoint
- Geographic distribution
- Alternative to official proxy
- Same API surface

**Example:**
```typescript
import { createHoosatNetworkProvider } from 'hoosat-sdk-web';

const provider = createHoosatNetworkProvider({
  baseUrl: 'https://network.hoosat.fi/api/v1',
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'value'
  }
});

const utxos = await provider.getUtxos(['hoosat:qz7ulu...']);
console.log('Found', utxos.length, 'UTXOs');
```

#### 3. MultiProvider

Composite provider that uses multiple backends with configurable strategies.

**Strategies:**

##### Failover Strategy

Primary provider with automatic fallback to backups on failure.

```typescript
import {
  createMultiProvider,
  createHoosatProxyProvider,
  createHoosatNetworkProvider
} from 'hoosat-sdk-web';

const provider = createMultiProvider(
  [
    createHoosatProxyProvider(), // Primary
    createHoosatNetworkProvider() // Backup
  ],
  'failover'
);

// Always tries proxy.hoosat.net first
// Falls back to network.hoosat.fi on error
const balance = await provider.getBalance(address);
```

**Use cases:**
- Production wallets requiring maximum uptime
- Critical payment systems
- Services that need guaranteed availability

##### Fastest Strategy

Race all providers, use the fastest response.

```typescript
const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider(),
    customProvider
  ],
  'fastest'
);

// Queries all three providers simultaneously
// Returns result from whichever responds first
const utxos = await provider.getUtxos([address]);
```

**Use cases:**
- Latency-sensitive applications
- Real-time payment verification
- Global services with distributed users

**Performance characteristics:**
```
Single provider:     Response time = T1
Fastest strategy:    Response time = min(T1, T2, T3)
Improvement:         ~30-50% faster on average
Trade-off:           More network requests
```

##### Round-Robin Strategy

Distribute requests evenly across providers.

```typescript
const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider()
  ],
  'round-robin'
);

// Request 1 → proxy.hoosat.net
// Request 2 → network.hoosat.fi
// Request 3 → proxy.hoosat.net
// Request 4 → network.hoosat.fi
// ...
```

**Use cases:**
- Load distribution across multiple nodes
- Avoiding rate limits on single endpoint
- Fair usage of community resources

**Benefits:**
- No single point of failure
- Balanced load across infrastructure
- Reduced risk of rate limiting

## Practical Examples

### Web Wallet with High Availability

```typescript
import {
  HoosatWebClient,
  HoosatBrowserClient,
  createMultiProvider,
  createHoosatProxyProvider,
  createHoosatNetworkProvider
} from 'hoosat-sdk-web';

// Create resilient multi-provider
const provider = createMultiProvider(
  [
    createHoosatProxyProvider({
      baseUrl: 'https://proxy.hoosat.net/api/v1',
      timeout: 5000
    }),
    createHoosatNetworkProvider({
      baseUrl: 'https://network.hoosat.fi/api/v1',
      timeout: 5000
    })
  ],
  'failover'
);

// Create client with failover provider
const client = new HoosatBrowserClient(provider);

// Now all operations have automatic failover
const balance = await client.getBalance(wallet.address);
const utxos = await client.getUtxos([wallet.address]);
const txId = await client.submitTransaction(signedTx);
```

### Performance-Optimized Payment Gateway

```typescript
import { createMultiProvider, HoosatBrowserClient } from 'hoosat-sdk-web';

class PaymentGateway {
  private client: HoosatBrowserClient;

  constructor() {
    // Use fastest strategy for minimum latency
    const provider = createMultiProvider(
      [
        createHoosatProxyProvider(),
        createHoosatNetworkProvider(),
        this.createCustomProvider('https://my-node.example.com/api/v1')
      ],
      'fastest'
    );

    this.client = new HoosatBrowserClient(provider);
  }

  async verifyPayment(
    merchantAddress: string,
    expectedAmount: string,
    txId: string
  ): Promise<boolean> {
    // Fastest provider responds
    // Critical for user experience
    const utxos = await this.client.getUtxos([merchantAddress]);

    // Verify payment in UTXOs
    const payment = utxos.find(utxo =>
      utxo.outpoint.transactionId === txId &&
      utxo.utxoEntry.amount === expectedAmount
    );

    return !!payment;
  }

  private createCustomProvider(baseUrl: string) {
    return createHoosatProxyProvider({ baseUrl });
  }
}
```

### Load-Balanced Service

```typescript
import { createMultiProvider, HoosatWebClient } from 'hoosat-sdk-web';

// Distribute load across multiple public endpoints
const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider(),
    createHoosatProxyProvider({
      baseUrl: 'https://backup.hoosat.net/api/v1'
    })
  ],
  'round-robin'
);

const client = new HoosatWebClient(provider);

// Load distributed evenly
// No single endpoint overwhelmed
for (let i = 0; i < 100; i++) {
  const balance = await client.getBalance(addresses[i]);
  // Requests spread: 33 → proxy, 33 → network, 34 → backup
}
```

## Creating Custom Providers

Implement `ApiProvider` interface for specialized use cases:

```typescript
import { ApiProvider, ProviderConfig } from 'hoosat-sdk-web';

class MyCustomProvider implements ApiProvider {
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async getBalance(address: string): Promise<number> {
    const response = await fetch(
      `${this.config.baseUrl}/addresses/${address}/balance`,
      {
        headers: this.config.headers,
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      }
    );

    const data = await response.json();
    return parseInt(data.balance);
  }

  async getUtxos(addresses: string[]): Promise<UtxoForSigning[]> {
    const response = await fetch(
      `${this.config.baseUrl}/addresses/utxos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers
        },
        body: JSON.stringify({ addresses }),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      }
    );

    const data = await response.json();
    return data.utxos;
  }

  async submitTransaction(transaction: Transaction): Promise<string> {
    // Implement transaction submission
    // ...
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    // Implement network info
    // ...
  }

  async getFeeEstimate(): Promise<FeeEstimate> {
    // Implement fee estimation
    // ...
  }

  async ping(): Promise<boolean> {
    try {
      await fetch(`${this.config.baseUrl}/health`, {
        signal: AbortSignal.timeout(2000)
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Use custom provider
const customProvider = new MyCustomProvider({
  baseUrl: 'https://my-api.example.com',
  timeout: 10000,
  debug: true
});

const client = new HoosatBrowserClient(customProvider);
```

## Backward Compatibility

All existing code continues to work without changes:

```typescript
// Old way (still works)
const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

// New way (with providers)
const provider = createHoosatProxyProvider({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});
const client = new HoosatBrowserClient(provider);

// Both produce identical behavior
const balance1 = await client.getBalance(address);
const balance2 = await client.getBalance(address);
```

## Configuration Options

### ProviderConfig

```typescript
interface ProviderConfig {
  // API endpoint
  baseUrl: string;

  // Request timeout (milliseconds)
  timeout?: number; // Default: 10000

  // Custom HTTP headers
  headers?: Record<string, string>;

  // Enable debug logging
  debug?: boolean; // Default: false
}
```

### EndpointConfig

```typescript
interface EndpointConfig {
  // Endpoint paths (optional overrides)
  balanceEndpoint?: string;     // Default: '/addresses/{address}/balance'
  utxosEndpoint?: string;        // Default: '/addresses/utxos'
  submitEndpoint?: string;       // Default: '/transactions'
  networkInfoEndpoint?: string;  // Default: '/info'
  feeEstimateEndpoint?: string;  // Default: '/fee/estimate'
}
```

## Provider Health Monitoring

```typescript
import { createMultiProvider, HoosatBrowserClient } from 'hoosat-sdk-web';

const providers = [
  createHoosatProxyProvider(),
  createHoosatNetworkProvider()
];

const multiProvider = createMultiProvider(providers, 'failover');

// Health check
async function checkProviderHealth() {
  for (const provider of providers) {
    const isHealthy = await provider.ping();
    console.log(
      `Provider ${provider.constructor.name}: ${isHealthy ? '✓' : '✗'}`
    );
  }
}

// Run periodic health checks
setInterval(checkProviderHealth, 30000); // Every 30 seconds
```

## Error Handling

```typescript
import { createMultiProvider, HoosatBrowserClient } from 'hoosat-sdk-web';

const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider()
  ],
  'failover'
);

const client = new HoosatBrowserClient(provider);

try {
  const balance = await client.getBalance(address);
  console.log('Balance:', balance);
} catch (error) {
  // All providers failed
  console.error('All API providers unavailable:', error);

  // Handle gracefully
  showOfflineMessage();
}
```

## Best Practices

### 1. Use Failover for Production

```typescript
// Production wallet configuration
const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),     // Primary: official proxy
    createHoosatNetworkProvider(),   // Backup: community
    customEnterpriseProvider         // Last resort: your own node
  ],
  'failover'
);
```

### 2. Use Fastest for Latency-Sensitive Apps

```typescript
// Real-time payment verification
const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider()
  ],
  'fastest'
);
```

### 3. Use Round-Robin for Load Distribution

```typescript
// High-volume service
const provider = createMultiProvider(
  [
    createHoosatProxyProvider(),
    createHoosatNetworkProvider(),
    customProvider1,
    customProvider2
  ],
  'round-robin'
);
```

### 4. Configure Timeouts Appropriately

```typescript
// Balance checks: fast timeout
const balanceProvider = createHoosatProxyProvider({
  baseUrl: 'https://proxy.hoosat.net/api/v1',
  timeout: 3000 // 3 seconds
});

// Transaction submission: longer timeout
const txProvider = createHoosatProxyProvider({
  baseUrl: 'https://proxy.hoosat.net/api/v1',
  timeout: 30000 // 30 seconds
});
```

### 5. Monitor Provider Performance

```typescript
class MonitoredProvider implements ApiProvider {
  private provider: ApiProvider;
  private metrics: Map<string, number[]> = new Map();

  constructor(provider: ApiProvider) {
    this.provider = provider;
  }

  async getBalance(address: string): Promise<number> {
    const start = Date.now();
    try {
      const result = await this.provider.getBalance(address);
      this.recordMetric('getBalance', Date.now() - start);
      return result;
    } catch (error) {
      this.recordMetric('getBalance', -1); // Error
      throw error;
    }
  }

  private recordMetric(method: string, duration: number) {
    if (!this.metrics.has(method)) {
      this.metrics.set(method, []);
    }
    this.metrics.get(method)!.push(duration);
  }

  getAverageLatency(method: string): number {
    const durations = this.metrics.get(method) || [];
    const successful = durations.filter(d => d >= 0);
    return successful.reduce((a, b) => a + b, 0) / successful.length;
  }
}
```

## Migration Guide

### From HoosatWebClient to Provider-Based

Before:
```typescript
const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});
```

After:
```typescript
const provider = createHoosatProxyProvider({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});
const client = new HoosatBrowserClient(provider);
```

### Adding Failover to Existing Code

Before:
```typescript
const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});
```

After:
```typescript
const provider = createMultiProvider(
  [
    createHoosatProxyProvider({
      baseUrl: 'https://proxy.hoosat.net/api/v1'
    }),
    createHoosatNetworkProvider()
  ],
  'failover'
);
const client = new HoosatBrowserClient(provider);
```

No other code changes required - all method calls remain the same.

## Next Steps

- [Payload Transactions](./payload-transactions.md) - Add data to transactions
- [Browser Wallet](./browser-wallet.md) - Build a complete wallet
- [API Reference](../api-reference) - Complete API documentation
