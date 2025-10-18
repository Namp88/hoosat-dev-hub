---
sidebar_position: 2
---

# Quick Start

Get started with Hoosat development in minutes! This guide will help you choose the right tool and make your first blockchain interaction.

## Choose Your Tool

Hoosat provides multiple ways to interact with the blockchain. Choose based on your use case:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="nodejs" label="Node.js (Server)" default>

### For Server-Side Applications

Perfect for backend services, APIs, and automation.

**Install:**

```bash
npm install hoosat-sdk
```

**Basic Example:**

```typescript
import { HoosatClient } from 'hoosat-sdk';

// Connect to node via gRPC
const client = new HoosatClient({
  host: 'localhost',
  port: 42420
});

// Get node info
const info = await client.getNodeInfo();
console.log('Node version:', info.serverVersion);

// Get address balance
const balance = await client.getBalance('hoosat:qp...');
console.log('Balance:', balance);

// Send transaction
const txId = await client.sendTransaction({
  to: 'hoosat:qp...',
  amount: 100000000 // 1 HTN in sompi
});
console.log('TX ID:', txId);
```

**Features:**
- ✅ Full gRPC connection to Hoosat node
- ✅ Real-time event streaming
- ✅ Transaction building and signing
- ✅ Wallet management
- ✅ Fee estimation

[Full Node.js SDK Documentation →](./sdk-js/intro)

</TabItem>

<TabItem value="browser" label="Browser (Web Apps)">

### For Web Applications

Lightweight SDK for frontend applications. No gRPC, REST API only.

**Install:**

```bash
npm install hoosat-sdk-web
```

**Basic Example:**

```typescript
import { HoosatClient, HoosatSigner } from 'hoosat-sdk-web';

// Connect to REST API
const client = new HoosatClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

// Create wallet
const signer = HoosatSigner.random();
const address = signer.toAddress('hoosat');
console.log('Address:', address);

// Get balance
const balance = await client.getBalance(address);
console.log('Balance:', balance);

// Build and sign transaction
const tx = await client.buildTransaction({
  from: address,
  to: 'hoosat:qp...',
  amount: 100000000, // 1 HTN
  privateKey: signer.privateKey
});

const txId = await client.submitTransaction(tx);
console.log('TX ID:', txId);
```

**Features:**
- ✅ Lightweight (~150KB gzipped)
- ✅ REST API client
- ✅ Transaction signing
- ✅ QR code generation
- ✅ No dependencies on Node.js

[Full Browser SDK Documentation →](./sdk-web/intro)

</TabItem>

<TabItem value="rest" label="REST API (Any Language)">

### For Any Programming Language

HTTP API for languages without an SDK.

**Base URL:** `https://proxy.hoosat.net/api/v1`

**Example (cURL):**

```bash
# Get node info
curl https://proxy.hoosat.net/api/v1/node/info

# Get address balance
curl https://proxy.hoosat.net/api/v1/address/hoosat:qp.../balance

# Get block by hash
curl https://proxy.hoosat.net/api/v1/blockchain/block/{blockHash}
```

**Example (Python):**

```python
import requests

BASE_URL = 'https://proxy.hoosat.net/api/v1'

# Get node info
response = requests.get(f'{BASE_URL}/node/info')
data = response.json()
print('Node version:', data['data']['serverVersion'])

# Get balance
address = 'hoosat:qp...'
response = requests.get(f'{BASE_URL}/address/{address}/balance')
balance = response.json()
print('Balance:', balance['data']['balance'])
```

**Available Endpoints:**
- 📊 Node status and info
- 💰 Address balances and UTXOs
- 🔗 Blockchain queries
- 📡 Network information
- 💸 Transaction submission
- ⛏️ Mempool queries

[Full REST API Documentation →](./rest-api/intro)

</TabItem>

<TabItem value="extension" label="Wallet Extension (DApps)">

### For DApp Integration

Browser extension wallet for end users. Integrate with web3-like API.

**Installation for Users:**

[Install Hoosat Wallet Extension](https://github.com/Namp88/hoosat-web-extension/releases)

**Integration in Your DApp:**

```typescript
// Check if wallet is installed
if (window.hoosat) {
  console.log('Hoosat Wallet detected!');

  // Request account access
  const accounts = await window.hoosat.requestAccounts();
  console.log('Connected:', accounts[0]);

  // Get balance
  const balance = await window.hoosat.getBalance();
  console.log('Balance:', balance);

  // Request transaction
  const txId = await window.hoosat.sendTransaction({
    to: 'hoosat:qp...',
    amount: 100000000 // 1 HTN
  });
  console.log('TX ID:', txId);

  // Sign message (for authentication)
  const signature = await window.hoosat.signMessage('Login to MyApp');
  console.log('Signature:', signature);

} else {
  console.log('Please install Hoosat Wallet Extension');
}
```

**Use Cases:**
- 🎮 DeFi applications
- 🖼️ NFT marketplaces
- 🗳️ DAO voting
- 🔐 "Sign In with Hoosat"

[Full DApp Integration Guide →](./wallet-extension/dapp-integration)

</TabItem>
</Tabs>

## Network Configuration

### Mainnet

- **Node gRPC:** `localhost:42420` (default)
- **REST API:** `https://proxy.hoosat.net/api/v1`
- **Network ID:** `mainnet`
- **Currency:** HTN
- **Explorer:** (coming soon)

### Testnet

- **Node gRPC:** `localhost:52420`
- **REST API:** (not available yet)
- **Network ID:** `testnet`
- **Get test coins:** (faucet coming soon)

## Common Operations

### Check Balance

<Tabs groupId="sdk">
<TabItem value="nodejs" label="Node.js SDK">

```typescript
const balance = await client.getBalance('hoosat:qp...');
console.log('Balance:', balance);
```

</TabItem>
<TabItem value="browser" label="Browser SDK">

```typescript
const balance = await client.getBalance('hoosat:qp...');
console.log('Balance:', balance);
```

</TabItem>
<TabItem value="rest" label="REST API">

```bash
curl https://proxy.hoosat.net/api/v1/address/hoosat:qp.../balance
```

</TabItem>
</Tabs>

### Send Transaction

<Tabs groupId="sdk">
<TabItem value="nodejs" label="Node.js SDK">

```typescript
const txId = await client.sendTransaction({
  to: 'hoosat:qp...',
  amount: 100000000 // 1 HTN = 100,000,000 sompi
});
```

</TabItem>
<TabItem value="browser" label="Browser SDK">

```typescript
const tx = await client.buildTransaction({
  from: myAddress,
  to: 'hoosat:qp...',
  amount: 100000000,
  privateKey: myPrivateKey
});
const txId = await client.submitTransaction(tx);
```

</TabItem>
<TabItem value="rest" label="REST API">

```bash
curl -X POST https://proxy.hoosat.net/api/v1/transaction/submit \
  -H "Content-Type: application/json" \
  -d '{"transaction": "..."}'
```

</TabItem>
</Tabs>

### Get Transaction Status

<Tabs groupId="sdk">
<TabItem value="nodejs" label="Node.js SDK">

```typescript
const tx = await client.getTransaction(txId);
console.log('Status:', tx.isAccepted ? 'Confirmed' : 'Pending');
```

</TabItem>
<TabItem value="browser" label="Browser SDK">

```typescript
const status = await client.getTransactionStatus(txId);
console.log('Status:', status);
```

</TabItem>
<TabItem value="rest" label="REST API">

```bash
curl https://proxy.hoosat.net/api/v1/transaction/{txId}/status
```

</TabItem>
</Tabs>

## Key Concepts

### HTN and Sompi

- **1 HTN** = 100,000,000 sompi
- Sompi is the smallest unit (like satoshi in Bitcoin)
- All amounts in APIs are in sompi

```typescript
// 1 HTN
const amount = 100000000; // sompi

// 0.5 HTN
const halfHTN = 50000000; // sompi

// 1.25 HTN
const oneAndQuarter = 125000000; // sompi
```

### Addresses

Hoosat addresses use Bech32m encoding:

```
hoosat:qp4ad2eh72xc8k9vyqm5...
```

- Prefix: `hoosat:`
- Public key hash encoded in Bech32m

### Transactions

UTXO-based model (like Bitcoin):

- Inputs: Previous outputs being spent
- Outputs: New outputs being created
- Fee: Difference between inputs and outputs

### Fees

- Measured in sompi
- Typical fee: 1000-5000 sompi (0.00001-0.00005 HTN)
- Higher fee = faster confirmation

## Next Steps

### For Developers

1. **Building a backend service?**
   - → [Node.js SDK Documentation](./sdk-js/intro)

2. **Building a web app?**
   - → [Browser SDK Documentation](./sdk-web/intro)

3. **Using another language?**
   - → [REST API Documentation](./rest-api/intro)

4. **Building a DApp?**
   - → [Wallet Extension Integration](./wallet-extension/dapp-integration)

### For Users

- **Want to use Hoosat?**
  - → [Wallet Extension User Guide](./wallet-extension/user-guide)

## Getting Help

Need assistance?

- 💬 **Discord**: [Join community](https://discord.gg/mFBfNpNA)
- 💬 **Telegram**: [Quick support](https://t.me/HoosatNetwork)
- 🐛 **GitHub**: [Report issues](https://github.com/Namp88)
- 📚 **Docs**: You're already here!

## Example Projects

Coming soon:

- Simple wallet application
- Payment gateway integration
- DApp with wallet extension
- Block explorer
- Transaction monitor
