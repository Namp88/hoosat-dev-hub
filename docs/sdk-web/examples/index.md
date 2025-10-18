---
sidebar_position: 1
---

# Examples Overview

The Hoosat Browser SDK includes working HTML examples demonstrating all features.

## Available Examples

### 1. Complete Wallet Implementation

**File:** `example-wallet.html`

Full-featured browser wallet with:
- Wallet generation and import
- Balance checking
- Transaction sending
- QR code display
- LocalStorage integration

**[View Source](https://github.com/Namp88/hoosat-sdk-web/blob/main/examples/example-wallet.html)**

### 2. SDK Feature Tests

**File:** `test-browser.html`

Interactive test page covering:

#### Cryptography Tests
- Generate ECDSA key pairs
- Import wallets from private keys
- Address validation
- BLAKE3 and SHA256 hashing

#### Message Signing Tests
- Sign messages with ECDSA
- Verify signatures
- DApp authentication flow
- Public key recovery

#### Transaction Tests
- Build transactions
- Sign transactions
- UTXO management
- Fee calculation

#### QR Code Tests
- Generate address QR codes
- Generate payment QR codes
- Parse payment URIs

**[View Source](https://github.com/Namp88/hoosat-sdk-web/blob/main/examples/test-browser.html)**

## Running Examples

### Step 1: Clone Repository

```bash
git clone https://github.com/Namp88/hoosat-sdk-web.git
cd hoosat-sdk-web
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build SDK

```bash
npm run build
```

### Step 4: Start Local Server

```bash
npx serve .
```

### Step 5: Open in Browser

Navigate to:
- http://localhost:3000/examples/test-browser.html
- http://localhost:3000/examples/example-wallet.html

## Code Examples

### Generate Wallet

```javascript
import { HoosatCrypto } from 'hoosat-sdk-web';

const wallet = HoosatCrypto.generateKeyPair('mainnet');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey.toString('hex'));
```

### Check Balance

```javascript
import { HoosatWebClient, HoosatUtils } from 'hoosat-sdk-web';

const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

const result = await client.getBalance(address);
console.log(`Balance: ${HoosatUtils.sompiToAmount(result.balance)} HTN`);
```

### Send Transaction

```javascript
import { HoosatTxBuilder, HoosatUtils } from 'hoosat-sdk-web';

// Get UTXOs
const utxos = await client.getUtxos([wallet.address]);

// Build transaction
const builder = new HoosatTxBuilder();

utxos.utxos.forEach(utxo => {
  builder.addInput(utxo, wallet.privateKey);
});

builder
  .addOutput(recipientAddress, HoosatUtils.amountToSompi('1.0'))
  .setFee('2500')
  .addChangeOutput(wallet.address);

// Sign and submit
const signedTx = builder.sign();
const result = await client.submitTransaction(signedTx);

console.log('TX ID:', result.transactionId);
```

### Sign Message (Authentication)

```javascript
import { HoosatSigner } from 'hoosat-sdk-web';

// Create challenge
const challenge = `Login to MyDApp\nNonce: ${crypto.randomUUID()}\nTimestamp: ${Date.now()}`;

// Sign message
const signature = HoosatSigner.signMessage(
  wallet.privateKey.toString('hex'),
  challenge
);

// Verify signature
const isValid = HoosatSigner.verifyMessage(
  signature,
  challenge,
  wallet.publicKey.toString('hex')
);

if (isValid) {
  console.log('Authenticated!');
}
```

### Generate Payment QR

```javascript
import { HoosatQR } from 'hoosat-sdk-web';

const qr = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: 100, // HTN
  label: 'Coffee Shop',
  message: 'Order #12345'
});

// Display QR
document.getElementById('qr-code').src = qr;
```

## Framework Integration

### React Example

```tsx
import { useState, useEffect } from 'react';
import { HoosatCrypto, HoosatWebClient, HoosatUtils } from 'hoosat-sdk-web';

function WalletComponent() {
  const [wallet] = useState(() => HoosatCrypto.generateKeyPair('mainnet'));
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const client = new HoosatWebClient({
      baseUrl: 'https://proxy.hoosat.net/api/v1'
    });

    async function updateBalance() {
      const result = await client.getBalance(wallet.address);
      setBalance(HoosatUtils.sompiToAmount(result.balance));
    }

    updateBalance();
    const interval = setInterval(updateBalance, 10000);

    return () => clearInterval(interval);
  }, [wallet]);

  return (
    <div>
      <h2>Your Wallet</h2>
      <p>Address: {wallet.address}</p>
      <p>Balance: {balance} HTN</p>
    </div>
  );
}
```

### Vue Example

```vue
<template>
  <div>
    <h2>Your Wallet</h2>
    <p>Address: {{ address }}</p>
    <p>Balance: {{ balance }} HTN</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HoosatCrypto, HoosatWebClient, HoosatUtils } from 'hoosat-sdk-web';

const address = ref('');
const balance = ref('0');

onMounted(async () => {
  const wallet = HoosatCrypto.generateKeyPair('mainnet');
  address.value = wallet.address;

  const client = new HoosatWebClient({
    baseUrl: 'https://proxy.hoosat.net/api/v1'
  });

  const result = await client.getBalance(wallet.address);
  balance.value = HoosatUtils.sompiToAmount(result.balance);
});
</script>
```

## Common Patterns

### Wallet Persistence

```javascript
// Save wallet to localStorage
function saveWallet(wallet) {
  localStorage.setItem('wallet_key', wallet.privateKey.toString('hex'));
}

// Load wallet from localStorage
function loadWallet() {
  const key = localStorage.getItem('wallet_key');
  if (!key) return null;

  return HoosatCrypto.importKeyPair(key, 'mainnet');
}

// Usage
let wallet = loadWallet();
if (!wallet) {
  wallet = HoosatCrypto.generateKeyPair('mainnet');
  saveWallet(wallet);
}
```

### Error Handling

```javascript
async function safelyGetBalance(address) {
  try {
    const result = await client.getBalance(address);
    return HoosatUtils.sompiToAmount(result.balance);
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
}
```

### Transaction Status Polling

```javascript
async function waitForConfirmation(txId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if transaction is confirmed
    // (Implementation depends on your API)

    console.log(`Checking confirmation... ${i + 1}/${maxAttempts}`);
  }
}
```

## Next Steps

- [API Reference](../api-reference) - Complete API documentation
- [Guides](../guides) - Integration guides
- [GitHub Repository](https://github.com/Namp88/hoosat-sdk-web) - Source code
