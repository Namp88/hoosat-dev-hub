---
sidebar_position: 1
---

# Examples Overview

The Hoosat SDK includes **35+ working examples** covering all aspects of blockchain interaction. Each example is standalone, well-documented, and ready to run.

## Running Examples

All examples are located in the `examples/` directory of the [SDK repository](https://github.com/Namp88/hoosat-sdk).

### Prerequisites

```bash
npm install -g tsx  # For running TypeScript directly
```

### Run an Example

```bash
# Clone the repository
git clone https://github.com/Namp88/hoosat-sdk.git
cd hoosat-sdk

# Install dependencies
npm install

# Run any example
tsx examples/crypto/01-generate-keypair.ts
```

## Examples by Category

### Address & Balance (3 examples)

Query addresses and check balances.

| Example | Description | File |
|---------|-------------|------|
| **Check Balance** | Get balance for a single address | `address/01-balance.ts` |
| **Multiple Balances** | Check multiple addresses at once | `address/02-balances-multiple.ts` |
| **Fetch UTXOs** | Get and analyze UTXOs for addresses | `address/03-utxos.ts` |

**Learn:**
- Querying blockchain data
- Balance checking
- UTXO management
- Address validation

### Cryptography (4 examples)

Key generation, wallet management, and cryptographic operations.

| Example | Description | File |
|---------|-------------|------|
| **Generate Key Pair** | Create new wallets (mainnet/testnet) | `crypto/01-generate-keypair.ts` |
| **Import Key Pair** | Import existing wallets from private keys | `crypto/02-import-keypair.ts` |
| **Address Types** | Explore ECDSA, Schnorr, P2SH addresses | `crypto/03-address-types.ts` |
| **Hashing** | BLAKE3 hashing and transaction IDs | `crypto/04-hashing.ts` |

**Learn:**
- Wallet creation and import
- Address generation
- Network differences (mainnet/testnet)
- Cryptographic hashing

### Node Operations (4 examples)

Connect to nodes and query blockchain data.

| Example | Description | File |
|---------|-------------|------|
| **Connect to Node** | Basic node connection and info | `node/01-connect.ts` |
| **Blockchain Info** | Get DAG info, network stats | `node/02-blockchain-info.ts` |
| **Query Blocks** | Fetch and analyze block data | `node/03-blocks.ts` |
| **Mempool Analysis** | Analyze pending transactions | `node/04-mempool.ts` |

**Learn:**
- Node connectivity
- Blockchain queries
- Network statistics
- Mempool monitoring

### Real-time Streaming (1 example)

Monitor blockchain changes in real-time.

| Example | Description | File |
|---------|-------------|------|
| **Subscribe to UTXOs** | Real-time UTXO change monitoring | `streaming/01-subscribe-utxos.ts` |

**Learn:**
- Event subscriptions
- Real-time monitoring
- Automatic reconnection
- Balance tracking

### QR Codes (3 examples)

Generate and parse payment QR codes.

| Example | Description | File |
|---------|-------------|------|
| **Generate Address QR** | Create address QR codes | `qr/01-generate-address.ts` |
| **Payment Request QR** | QR with amount and metadata | `qr/02-generate-payment.ts` |
| **Parse Payment URI** | Extract data from scanned QR | `qr/03-parse-payment-uri.ts` |

**Learn:**
- QR code generation
- Payment URIs
- Mobile integration
- Point-of-sale systems

### Transaction Management (11 examples)

Build, sign, and submit transactions.

| Example | Description | File |
|---------|-------------|------|
| **Simple Transaction** | Basic transaction building | `transaction/01-build-simple.ts` |
| **With Change** | Automatic change handling | `transaction/02-build-with-change.ts` |
| **Multiple Inputs** | Combine multiple UTXOs | `transaction/03-multiple-inputs.ts` |
| **Estimate Fee** | Dynamic fee calculation | `transaction/04-estimate-fee.ts` |
| **Send Real TX** | Submit real transaction ⚠️ | `transaction/05-send-real.ts` |
| **Dynamic Fees** | Network-aware fee selection | `transaction/06-dynamic-fees.ts` |
| **Batch Payment** | Send to 2 recipients ⚠️ | `transaction/07-send-real-batch.ts` |
| **Consolidate UTXOs** | Combine small UTXOs ⚠️ | `transaction/08-consolidate-utxos.ts` |
| **Split UTXO** | Split large UTXO ⚠️ | `transaction/09-split-utxo.ts` |
| **Check Status** | Transaction status tracking | `transaction/10-check-transaction-status.ts` |
| **Subnetwork Test** | Advanced subnetwork features | `transaction/11-subnetwork-payload-test.ts` |

⚠️ **Warning:** Examples marked with ⚠️ broadcast real transactions to the network!

**Learn:**
- Transaction building
- Fee estimation
- UTXO selection
- Batch payments
- Transaction status tracking

### Error Handling (3 examples)

Robust error handling patterns.

| Example | Description | File |
|---------|-------------|------|
| **Network Errors** | Handle connection issues | `error-handling/01-network-errors.ts` |
| **Transaction Errors** | Handle TX failures | `error-handling/02-transaction-errors.ts` |
| **Retry Strategies** | Implement retry logic | `error-handling/03-retry-strategies.ts` |

**Learn:**
- Error categorization
- Retry mechanisms
- Graceful degradation
- User feedback

### Monitoring (2 examples)

Track network and balance changes.

| Example | Description | File |
|---------|-------------|------|
| **Track Balance** | Real-time balance monitoring | `monitoring/01-track-balance-changes.ts` |
| **Network Stats** | Monitor network health | `monitoring/02-network-stats.ts` |

**Learn:**
- Real-time monitoring
- Network statistics
- Performance metrics
- Health checks

### Advanced (2 examples)

Advanced patterns and techniques.

| Example | Description | File |
|---------|-------------|------|
| **Multi-Recipient Batching** | Send to 3+ recipients | `advanced/01-multi-recipient-batching.ts` |
| **Multi-Node Failover** | High availability setup | `advanced/02-multi-node-failover.ts` |

**Learn:**
- Batch payment strategies
- High availability
- Node failover
- Production patterns

### Utilities (3 examples)

Helper functions and conversions.

| Example | Description | File |
|---------|-------------|------|
| **Amount Conversion** | HTN ↔ sompi conversion | `utils/01-amount-conversion.ts` |
| **Validation** | Validate addresses, keys, amounts | `utils/02-validation.ts` |
| **Formatting** | Format for display | `utils/03-formatting.ts` |

**Learn:**
- Unit conversion
- Input validation
- Data formatting
- Type checking

## Example Structure

Each example follows a consistent structure:

```typescript
/**
 * Example: [Title]
 *
 * Demonstrates:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 *
 * Prerequisites:
 * - List of requirements
 *
 * Use case:
 * - When to use this pattern
 */

import { ... } from 'hoosat-sdk';

async function main() {
  // Clear, commented code
  // Step-by-step explanation
  // Error handling
  // Output formatting
}

main().catch(console.error);
```

## Quick Start Examples

### Check Balance

```bash
tsx examples/address/01-balance.ts
```

**Output:**
```
Balance for address: hoosat:qz7ulu...
Balance: 1.5 HTN
Balance (sompi): 150000000
```

### Generate Wallet

```bash
tsx examples/crypto/01-generate-keypair.ts
```

**Output:**
```
Mainnet Wallet
Address: hoosat:qyp2uxq7rl0...
Private Key: 33a4a81ecd31615c...
Public Key: 02a1b2c3d4e5f6...
```

### Send Transaction

```bash
tsx examples/transaction/05-send-real.ts
```

**Output:**
```
Transaction submitted successfully!
TX ID: 5f6e7d8c9b0a1e2d3c4b5a6f7e8d9c0b
```

## Environment Variables

Many examples support configuration via environment variables:

```bash
# Set node connection
export HOOSAT_NODE_HOST=54.38.176.95
export HOOSAT_NODE_PORT=42420

# Run example
tsx examples/node/01-connect.ts
```

## Testnet vs Mainnet

Most examples can work with both networks:

```typescript
// Use testnet for safe testing
const wallet = HoosatCrypto.generateKeyPair('testnet');

// Use mainnet for production
const wallet = HoosatCrypto.generateKeyPair('mainnet');
```

**Testnet resources:**
- Faucet: Request test HTN tokens
- Safe environment: No real money at risk
- Full feature parity: All features work

## Common Patterns

### Pattern 1: Check Before Action

```typescript
// Validate input
if (!HoosatUtils.isValidAddress(address)) {
  throw new Error('Invalid address');
}

// Check result
const result = await client.getBalance(address);
if (result.ok) {
  console.log('Balance:', result.result.balance);
} else {
  console.error('Error:', result.error);
}
```

### Pattern 2: Resource Cleanup

```typescript
// Graceful shutdown
process.on('SIGINT', async () => {
  await client.events.unsubscribeFromAll();
  client.disconnect();
  process.exit(0);
});
```

### Pattern 3: Error Recovery

```typescript
async function withRetry(fn, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

## Learning Path

### Beginner

1. `crypto/01-generate-keypair.ts` - Create your first wallet
2. `address/01-balance.ts` - Check a balance
3. `node/01-connect.ts` - Connect to a node
4. `utils/01-amount-conversion.ts` - Understand units

### Intermediate

5. `transaction/01-build-simple.ts` - Build a transaction
6. `transaction/04-estimate-fee.ts` - Estimate fees
7. `streaming/01-subscribe-utxos.ts` - Real-time monitoring
8. `qr/02-generate-payment.ts` - Payment requests

### Advanced

9. `transaction/08-consolidate-utxos.ts` - UTXO management
10. `advanced/01-multi-recipient-batching.ts` - Batch payments
11. `advanced/02-multi-node-failover.ts` - High availability
12. `error-handling/03-retry-strategies.ts` - Production patterns

## Source Code

All examples are open source and available on GitHub:

**Repository:** [github.com/Namp88/hoosat-sdk](https://github.com/Namp88/hoosat-sdk)

**Examples directory:** `examples/`

## Contributing

Have an example idea? Contributions are welcome!

1. Fork the repository
2. Add your example to the appropriate category
3. Follow the existing example structure
4. Test thoroughly
5. Submit a pull request

## Next Steps

- [API Reference](../api-reference/client.md) - Detailed API documentation
- [Guides](../guides) - In-depth how-to guides
- [GitHub Repository](https://github.com/Namp88/hoosat-sdk) - Browse all examples
