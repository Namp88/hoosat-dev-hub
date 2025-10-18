---
sidebar_position: 2
---

# Quick Start

Build your first Hoosat browser application in 5 minutes.

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hoosat Web Wallet</title>
</head>
<body>
  <h1>Hoosat Web Wallet</h1>

  <div id="wallet">
    <h2>Your Wallet</h2>
    <p>Address: <span id="address"></span></p>
    <p>Balance: <span id="balance"></span> HTN</p>
  </div>

  <div id="send">
    <h2>Send Transaction</h2>
    <input type="text" id="recipient" placeholder="Recipient address">
    <input type="number" id="amount" placeholder="Amount (HTN)">
    <button onclick="sendTransaction()">Send</button>
  </div>

  <script type="module">
    import {
      HoosatCrypto,
      HoosatWebClient,
      HoosatTxBuilder,
      HoosatUtils
    } from 'https://unpkg.com/hoosat-sdk-web@latest/dist/hoosat-sdk.es.js';

    // Initialize client
    const client = new HoosatWebClient({
      baseUrl: 'https://proxy.hoosat.net/api/v1'
    });

    // Load or create wallet
    let wallet;
    const stored = localStorage.getItem('wallet_key');

    if (stored) {
      wallet = HoosatCrypto.importKeyPair(stored, 'mainnet');
    } else {
      wallet = HoosatCrypto.generateKeyPair('mainnet');
      localStorage.setItem('wallet_key', wallet.privateKey.toString('hex'));
    }

    // Display address
    document.getElementById('address').textContent = wallet.address;

    // Update balance
    async function updateBalance() {
      const result = await client.getBalance(wallet.address);
      const htn = HoosatUtils.sompiToAmount(result.balance);
      document.getElementById('balance').textContent = htn;
    }

    // Send transaction
    window.sendTransaction = async function() {
      const recipient = document.getElementById('recipient').value;
      const amount = document.getElementById('amount').value;

      if (!HoosatUtils.isValidAddress(recipient)) {
        alert('Invalid address');
        return;
      }

      try {
        // Get UTXOs
        const utxos = await client.getUtxos([wallet.address]);

        // Get fee recommendation
        const feeRec = await client.getFeeEstimate();

        // Build transaction
        const builder = new HoosatTxBuilder();

        utxos.utxos.forEach(utxo => {
          builder.addInput(utxo, wallet.privateKey);
        });

        builder
          .addOutput(recipient, HoosatUtils.amountToSompi(amount))
          .setFee(feeRec.normalPriority.toString())
          .addChangeOutput(wallet.address);

        // Sign and submit
        const signedTx = builder.sign();
        const result = await client.submitTransaction(signedTx);

        alert('Transaction sent! TX ID: ' + result.transactionId);
        updateBalance();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    };

    // Initial balance update
    updateBalance();
    setInterval(updateBalance, 10000); // Update every 10s
  </script>
</body>
</html>
```

## Step-by-Step Breakdown

### 1. Import SDK

```typescript
import {
  HoosatCrypto,
  HoosatWebClient,
  HoosatTxBuilder,
  HoosatUtils
} from 'hoosat-sdk-web';
```

### 2. Initialize Client

```typescript
const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1',
  timeout: 30000
});
```

### 3. Create/Load Wallet

```typescript
// Generate new wallet
const wallet = HoosatCrypto.generateKeyPair('mainnet');

// Or import existing
const wallet = HoosatCrypto.importKeyPair(privateKeyHex, 'mainnet');

// Store in localStorage (encrypted in production!)
localStorage.setItem('wallet', JSON.stringify({
  privateKey: wallet.privateKey.toString('hex')
}));
```

### 4. Check Balance

```typescript
const result = await client.getBalance(wallet.address);
const htn = HoosatUtils.sompiToAmount(result.balance);
console.log(`Balance: ${htn} HTN`);
```

### 5. Send Transaction

```typescript
// Get UTXOs
const utxos = await client.getUtxos([wallet.address]);

// Get fee recommendation
const feeRec = await client.getFeeEstimate();

// Build transaction
const builder = new HoosatTxBuilder();

utxos.utxos.forEach(utxo => {
  builder.addInput(utxo, wallet.privateKey);
});

builder
  .addOutput(recipientAddress, HoosatUtils.amountToSompi('1.0'))
  .setFee(feeRec.normalPriority.toString())
  .addChangeOutput(wallet.address);

// Sign and submit
const signedTx = builder.sign();
const result = await client.submitTransaction(signedTx);

console.log('TX ID:', result.transactionId);
```

## React Example

```tsx
import { useState, useEffect } from 'react';
import {
  HoosatCrypto,
  HoosatWebClient,
  HoosatUtils
} from 'hoosat-sdk-web';

const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

function Wallet() {
  const [wallet] = useState(() => {
    const stored = localStorage.getItem('wallet_key');
    return stored
      ? HoosatCrypto.importKeyPair(stored, 'mainnet')
      : HoosatCrypto.generateKeyPair('mainnet');
  });

  const [balance, setBalance] = useState('0');

  useEffect(() => {
    // Save wallet
    localStorage.setItem('wallet_key', wallet.privateKey.toString('hex'));

    // Update balance
    const updateBalance = async () => {
      const result = await client.getBalance(wallet.address);
      setBalance(HoosatUtils.sompiToAmount(result.balance));
    };

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

## Vue Example

```vue
<template>
  <div>
    <h2>Your Wallet</h2>
    <p>Address: {{ address }}</p>
    <p>Balance: {{ balance }} HTN</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import {
  HoosatCrypto,
  HoosatWebClient,
  HoosatUtils
} from 'hoosat-sdk-web';

const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

const address = ref('');
const balance = ref('0');

let wallet;
let interval;

onMounted(async () => {
  // Load or create wallet
  const stored = localStorage.getItem('wallet_key');
  wallet = stored
    ? HoosatCrypto.importKeyPair(stored, 'mainnet')
    : HoosatCrypto.generateKeyPair('mainnet');

  localStorage.setItem('wallet_key', wallet.privateKey.toString('hex'));

  address.value = wallet.address;

  // Update balance
  const updateBalance = async () => {
    const result = await client.getBalance(wallet.address);
    balance.value = HoosatUtils.sompiToAmount(result.balance);
  };

  await updateBalance();
  interval = setInterval(updateBalance, 10000);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>
```

## Next Steps

- [API Reference](../api-reference) - Complete API documentation
- [Wallet Guide](../guides/browser-wallet.md) - Build a full-featured wallet
- [Examples](../examples) - More examples
