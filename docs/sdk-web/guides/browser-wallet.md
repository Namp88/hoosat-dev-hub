---
sidebar_position: 1
---

# Building a Browser Wallet

Complete guide to building a full-featured Hoosat wallet that runs entirely in the browser.

## Architecture

```
┌─────────────────────────┐
│   Browser Wallet UI     │
│  (HTML/React/Vue/etc)   │
└───────────┬─────────────┘
            │
    ┌───────▼────────┐
    │  Wallet Core   │
    │  - Key Mgmt    │
    │  - Tx Builder  │
    │  - API Client  │
    └───────┬────────┘
            │
    ┌───────▼────────┐
    │ hoosat-sdk-web │
    └───────┬────────┘
            │
    ┌───────▼────────┐
    │  REST API      │
    │  Proxy         │
    └───────┬────────┘
            │
    ┌───────▼────────┐
    │  Hoosat Node   │
    └────────────────┘
```

## Core Wallet Class

```typescript
import {
  HoosatCrypto,
  HoosatWebClient,
  HoosatTxBuilder,
  HoosatUtils,
  type KeyPair
} from 'hoosat-sdk-web';

class HoosatBrowserWallet {
  private wallet: KeyPair | null = null;
  private client: HoosatWebClient;
  private updateInterval: number | null = null;

  constructor(apiUrl: string = 'https://proxy.hoosat.net/api/v1') {
    this.client = new HoosatWebClient({ baseUrl: apiUrl });
  }

  // Generate new wallet
  createWallet(network: 'mainnet' | 'testnet' = 'mainnet'): void {
    this.wallet = HoosatCrypto.generateKeyPair(network);
    this.saveToStorage();
  }

  // Import existing wallet
  importWallet(privateKeyHex: string, network: 'mainnet' | 'testnet' = 'mainnet'): void {
    if (!HoosatUtils.isValidPrivateKey(privateKeyHex)) {
      throw new Error('Invalid private key');
    }

    this.wallet = HoosatCrypto.importKeyPair(privateKeyHex, network);
    this.saveToStorage();
  }

  // Load wallet from storage
  loadWallet(): boolean {
    const stored = localStorage.getItem('hoosat_wallet');
    if (!stored) return false;

    try {
      const { privateKey, network } = JSON.parse(stored);
      this.wallet = HoosatCrypto.importKeyPair(privateKey, network);
      return true;
    } catch {
      return false;
    }
  }

  // Save wallet to storage
  private saveToStorage(): void {
    if (!this.wallet) return;

    const network = HoosatUtils.getAddressNetwork(this.wallet.address);
    localStorage.setItem('hoosat_wallet', JSON.stringify({
      privateKey: this.wallet.privateKey.toString('hex'),
      network
    }));
  }

  // Get wallet address
  getAddress(): string {
    if (!this.wallet) throw new Error('No wallet loaded');
    return this.wallet.address;
  }

  // Get balance
  async getBalance(): Promise<string> {
    if (!this.wallet) throw new Error('No wallet loaded');

    const result = await this.client.getBalance(this.wallet.address);
    return HoosatUtils.sompiToAmount(result.balance);
  }

  // Get UTXOs
  async getUtxos() {
    if (!this.wallet) throw new Error('No wallet loaded');

    const result = await this.client.getUtxos([this.wallet.address]);
    return result.utxos;
  }

  // Send transaction
  async send(toAddress: string, amount: string): Promise<string> {
    if (!this.wallet) throw new Error('No wallet loaded');

    // Validate inputs
    if (!HoosatUtils.isValidAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Get UTXOs
    const utxos = await this.getUtxos();
    if (utxos.length === 0) {
      throw new Error('No UTXOs available');
    }

    // Get fee recommendation
    const feeRec = await this.client.getFeeEstimate();

    // Build transaction
    const builder = new HoosatTxBuilder();

    utxos.forEach(utxo => {
      builder.addInput(utxo, this.wallet!.privateKey);
    });

    builder
      .addOutput(toAddress, HoosatUtils.amountToSompi(amount))
      .setFee(feeRec.normalPriority.toString())
      .addChangeOutput(this.wallet.address);

    // Sign and submit
    const signedTx = builder.sign();
    const result = await this.client.submitTransaction(signedTx);

    return result.transactionId;
  }

  // Export private key
  exportPrivateKey(): string {
    if (!this.wallet) throw new Error('No wallet loaded');
    return this.wallet.privateKey.toString('hex');
  }

  // Delete wallet
  deleteWallet(): void {
    this.wallet = null;
    localStorage.removeItem('hoosat_wallet');
  }

  // Start balance monitoring
  startMonitoring(callback: (balance: string) => void, interval: number = 10000): void {
    if (this.updateInterval) return;

    const update = async () => {
      try {
        const balance = await this.getBalance();
        callback(balance);
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    };

    update(); // Initial update
    this.updateInterval = window.setInterval(update, interval);
  }

  // Stop balance monitoring
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
```

## React Integration

```tsx
import { useState, useEffect } from 'react';
import { HoosatBrowserWallet } from './wallet';

function App() {
  const [wallet] = useState(() => new HoosatBrowserWallet());
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Load existing wallet or create new
    if (!wallet.loadWallet()) {
      wallet.createWallet('mainnet');
    }

    setAddress(wallet.getAddress());

    // Start monitoring
    wallet.startMonitoring(setBalance);

    return () => wallet.stopMonitoring();
  }, [wallet]);

  const handleSend = async () => {
    try {
      const txId = await wallet.send(recipient, amount);
      alert(`Transaction sent! TX ID: ${txId}`);
      setRecipient('');
      setAmount('');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="wallet-app">
      <h1>Hoosat Wallet</h1>

      <div className="wallet-info">
        <h2>Your Wallet</h2>
        <p><strong>Address:</strong> {address}</p>
        <p><strong>Balance:</strong> {balance} HTN</p>
      </div>

      <div className="send-form">
        <h2>Send Transaction</h2>
        <input
          type="text"
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (HTN)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

## Vue Integration

```vue
<template>
  <div class="wallet-app">
    <h1>Hoosat Wallet</h1>

    <div class="wallet-info">
      <h2>Your Wallet</h2>
      <p><strong>Address:</strong> {{ address }}</p>
      <p><strong>Balance:</strong> {{ balance }} HTN</p>
    </div>

    <div class="send-form">
      <h2>Send Transaction</h2>
      <input
        v-model="recipient"
        type="text"
        placeholder="Recipient address"
      />
      <input
        v-model="amount"
        type="number"
        placeholder="Amount (HTN)"
      />
      <button @click="handleSend">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { HoosatBrowserWallet } from './wallet';

const wallet = new HoosatBrowserWallet();
const address = ref('');
const balance = ref('0');
const recipient = ref('');
const amount = ref('');

onMounted(() => {
  // Load or create wallet
  if (!wallet.loadWallet()) {
    wallet.createWallet('mainnet');
  }

  address.value = wallet.getAddress();

  // Start monitoring
  wallet.startMonitoring((newBalance) => {
    balance.value = newBalance;
  });
});

onUnmounted(() => {
  wallet.stopMonitoring();
});

async function handleSend() {
  try {
    const txId = await wallet.send(recipient.value, amount.value);
    alert(`Transaction sent! TX ID: ${txId}`);
    recipient.value = '';
    amount.value = '';
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
</script>
```

## Secure Storage

### Encrypted Wallet Storage

```typescript
// Use Web Crypto API for encryption
async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('hoosat-wallet-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Encrypt private key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(privateKey)
  );

  // Combine IV and encrypted data
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...result));
}

async function decryptPrivateKey(
  encryptedData: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Decode base64
  const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

  // Extract IV and encrypted data
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  // Derive key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('hoosat-wallet-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return decoder.decode(decrypted);
}

// Usage
const encrypted = await encryptPrivateKey(privateKey, userPassword);
localStorage.setItem('encrypted_wallet', encrypted);

// Later
const decrypted = await decryptPrivateKey(encrypted, userPassword);
const wallet = HoosatCrypto.importKeyPair(decrypted, 'mainnet');
```

## Browser Extension

### Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Hoosat Wallet",
  "version": "1.0.0",
  "description": "Hoosat blockchain wallet",
  "permissions": ["storage"],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  }
}
```

### Background Script

```javascript
// background.js
import { HoosatCrypto, HoosatWebClient } from 'hoosat-sdk-web';

let wallet = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'create_wallet':
      wallet = HoosatCrypto.generateKeyPair('mainnet');
      chrome.storage.local.set({
        privateKey: wallet.privateKey.toString('hex')
      });
      sendResponse({ address: wallet.address });
      break;

    case 'sign_transaction':
      if (!wallet) {
        sendResponse({ error: 'No wallet' });
        return;
      }

      const signed = HoosatCrypto.signTransactionInput(
        request.tx,
        request.inputIndex,
        wallet.privateKey,
        request.utxo
      );

      sendResponse({ signedTx: signed });
      break;
  }

  return true; // Keep channel open for async response
});
```

## Security Best Practices

1. **Never log private keys**
2. **Use encryption for storage**
3. **Clear sensitive data from memory**
4. **Validate all user inputs**
5. **Use HTTPS for API calls**
6. **Implement session timeouts**
7. **Show transaction details before signing**

## Next Steps

- [API Reference](../api-reference) - Complete API documentation
- [Examples](../examples) - Working examples
- [Security Guide](./security.md) - Security best practices
