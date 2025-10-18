---
sidebar_position: 1
---

# Wallet Management Guide

Complete guide to creating, importing, and managing Hoosat wallets using the SDK.

## Creating Wallets

### Generate New Wallet

```typescript
import { HoosatCrypto } from 'hoosat-sdk';

// Mainnet wallet
const wallet = HoosatCrypto.generateKeyPair('mainnet');

console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey.toString('hex'));
console.log('Public Key:', wallet.publicKey.toString('hex'));
```

**Important:** Always store the private key securely. Anyone with the private key can spend your funds.

### Testnet Wallet

For development and testing:

```typescript
const testnetWallet = HoosatCrypto.generateKeyPair('testnet');

// Address prefix is different
console.log(testnetWallet.address); // "hoosattest:..."
```

## Importing Wallets

### From Private Key

```typescript
const privateKeyHex = '33a4a81ecd31615c51385299969121707897fb1e167634196f31bd311de5fe43';

const wallet = HoosatCrypto.importKeyPair(privateKeyHex, 'mainnet');
```

### Validate Before Import

```typescript
import { HoosatUtils } from 'hoosat-sdk';

const privateKeyHex = '...';

// Validate format
if (!HoosatUtils.isValidPrivateKey(privateKeyHex)) {
  throw new Error('Invalid private key format');
}

// Import
const wallet = HoosatCrypto.importKeyPair(privateKeyHex);
```

## Wallet Storage

### Environment Variables

**.env:**
```env
WALLET_PRIVATE_KEY=33a4a81ecd31615c51385299969121707897fb1e167634196f31bd311de5fe43
WALLET_NETWORK=mainnet
```

**Usage:**
```typescript
import 'dotenv/config';

const wallet = HoosatCrypto.importKeyPair(
  process.env.WALLET_PRIVATE_KEY!,
  process.env.WALLET_NETWORK as 'mainnet' | 'testnet'
);
```

### Encrypted File Storage

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// Encrypt private key
function encryptPrivateKey(privateKey: string, password: string): string {
  const salt = randomBytes(32);
  const key = scryptSync(password, salt, 32);
  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, 'utf8'),
    cipher.final()
  ]);

  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex')
  });
}

// Decrypt private key
function decryptPrivateKey(encryptedData: string, password: string): string {
  const data = JSON.parse(encryptedData);
  const salt = Buffer.from(data.salt, 'hex');
  const iv = Buffer.from(data.iv, 'hex');
  const encrypted = Buffer.from(data.encrypted, 'hex');

  const key = scryptSync(password, salt, 32);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');
}

// Save wallet
const encrypted = encryptPrivateKey(wallet.privateKey.toString('hex'), 'strong-password');
writeFileSync('.keys/wallet.enc', encrypted);

// Load wallet
const encryptedData = readFileSync('.keys/wallet.enc', 'utf8');
const privateKey = decryptPrivateKey(encryptedData, 'strong-password');
const wallet = HoosatCrypto.importKeyPair(privateKey);
```

### JSON Wallet Format

```typescript
interface WalletFile {
  version: number;
  network: 'mainnet' | 'testnet';
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  createdAt: string;
}

// Save wallet to JSON
function saveWallet(wallet: KeyPair, password: string, filename: string) {
  const walletFile: WalletFile = {
    version: 1,
    network: wallet.address.startsWith('hoosat:') ? 'mainnet' : 'testnet',
    address: wallet.address,
    publicKey: wallet.publicKey.toString('hex'),
    encryptedPrivateKey: encryptPrivateKey(
      wallet.privateKey.toString('hex'),
      password
    ),
    createdAt: new Date().toISOString()
  };

  writeFileSync(filename, JSON.stringify(walletFile, null, 2));
}

// Load wallet from JSON
function loadWallet(filename: string, password: string): KeyPair {
  const walletFile: WalletFile = JSON.parse(readFileSync(filename, 'utf8'));
  const privateKey = decryptPrivateKey(walletFile.encryptedPrivateKey, password);

  return HoosatCrypto.importKeyPair(privateKey, walletFile.network);
}
```

## Checking Balance

```typescript
import { HoosatClient, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient({
  host: '54.38.176.95',
  port: 42420
});

const result = await client.getBalance(wallet.address);

if (result.ok) {
  const htn = HoosatUtils.sompiToAmount(result.result.balance);
  console.log(`Balance: ${htn} HTN`);
} else {
  console.error('Error:', result.error);
}
```

## Managing UTXOs

### Fetch UTXOs

```typescript
const utxosResult = await client.getUtxosByAddresses([wallet.address]);

if (utxosResult.ok) {
  const utxos = utxosResult.result.utxos;

  console.log(`Total UTXOs: ${utxos.length}`);

  utxos.forEach((utxo, i) => {
    const amount = HoosatUtils.sompiToAmount(utxo.utxoEntry.amount);
    console.log(`UTXO ${i + 1}: ${amount} HTN`);
    console.log(`  TX: ${utxo.outpoint.transactionId}`);
    console.log(`  Index: ${utxo.outpoint.index}`);
    console.log(`  Coinbase: ${utxo.utxoEntry.isCoinbase}`);
  });
}
```

### Calculate Total Balance

```typescript
let totalBalance = 0n;

for (const utxo of utxos) {
  totalBalance += BigInt(utxo.utxoEntry.amount);
}

const htn = HoosatUtils.sompiToAmount(totalBalance.toString());
console.log(`Total: ${htn} HTN`);
```

## Real-time Monitoring

### Subscribe to Changes

```typescript
import { EventType } from 'hoosat-sdk';

// Subscribe to wallet address
await client.events.subscribeToUtxoChanges([wallet.address]);

// Listen for UTXO changes
client.events.on(EventType.UtxoChange, async (notification) => {
  console.log('Wallet balance changed!');

  // Fetch new balance
  const balance = await client.getBalance(wallet.address);
  if (balance.ok) {
    const htn = HoosatUtils.sompiToAmount(balance.result.balance);
    console.log('New balance:', htn, 'HTN');
  }
});
```

## Multi-Wallet Management

```typescript
class WalletManager {
  private wallets: Map<string, KeyPair> = new Map();

  addWallet(name: string, wallet: KeyPair) {
    this.wallets.set(name, wallet);
  }

  getWallet(name: string): KeyPair | undefined {
    return this.wallets.get(name);
  }

  getAllWallets(): Map<string, KeyPair> {
    return this.wallets;
  }

  async getBalances(client: HoosatClient) {
    const addresses = Array.from(this.wallets.values()).map(w => w.address);
    return await client.getBalancesByAddresses(addresses);
  }
}

// Usage
const manager = new WalletManager();
manager.addWallet('main', mainWallet);
manager.addWallet('savings', savingsWallet);

const balances = await manager.getBalances(client);
```

## Security Best Practices

### Never Hardcode Private Keys

```typescript
// Bad
const privateKey = '33a4a81ecd31615c51385299969121707897fb1e...';

// Good
const privateKey = process.env.WALLET_PRIVATE_KEY!;
```

### Clear Sensitive Data

```typescript
let privateKey = Buffer.from(privateKeyHex, 'hex');

// Use the key
const wallet = HoosatCrypto.importKeyPair(privateKey.toString('hex'));

// Clear from memory
privateKey.fill(0);
privateKey = null;
```

### Use Strong Passwords

```typescript
// Minimum requirements
function validatePassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
```

### Backup Wallets

```typescript
// Create backup with timestamp
function backupWallet(wallet: KeyPair, password: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `.keys/backup-${timestamp}.json`;

  saveWallet(wallet, password, filename);
  console.log('Backup saved:', filename);
}
```

## Address Types

### ECDSA (Default)

```typescript
const wallet = HoosatCrypto.generateKeyPair();
const type = HoosatUtils.getAddressType(wallet.address);
console.log(type); // 'ecdsa'
```

### Detect Address Type

```typescript
function getWalletInfo(address: string) {
  return {
    type: HoosatUtils.getAddressType(address),
    version: HoosatUtils.getAddressVersion(address),
    network: HoosatUtils.getAddressNetwork(address),
    isValid: HoosatUtils.isValidAddress(address)
  };
}

const info = getWalletInfo(wallet.address);
console.log('Wallet Info:', info);
```

## Complete Wallet Class

```typescript
class HoosatWallet {
  private keyPair: KeyPair;
  private client: HoosatClient;

  constructor(client: HoosatClient, keyPair?: KeyPair) {
    this.client = client;
    this.keyPair = keyPair || HoosatCrypto.generateKeyPair();
  }

  static fromPrivateKey(client: HoosatClient, privateKey: string, network: 'mainnet' | 'testnet' = 'mainnet'): HoosatWallet {
    const keyPair = HoosatCrypto.importKeyPair(privateKey, network);
    return new HoosatWallet(client, keyPair);
  }

  get address(): string {
    return this.keyPair.address;
  }

  get privateKey(): Buffer {
    return this.keyPair.privateKey;
  }

  get publicKey(): Buffer {
    return this.keyPair.publicKey;
  }

  async getBalance() {
    const result = await this.client.getBalance(this.address);
    if (!result.ok) throw new Error(result.error!);
    return result.result.balance;
  }

  async getUTXOs() {
    const result = await this.client.getUtxosByAddresses([this.address]);
    if (!result.ok) throw new Error(result.error!);
    return result.result.utxos;
  }

  async sendTransaction(recipientAddress: string, amount: string) {
    // Implementation here
    // See transaction guide for details
  }

  toJSON() {
    return {
      address: this.address,
      publicKey: this.publicKey.toString('hex'),
      // Never include private key in JSON!
    };
  }
}
```

## Next Steps

- [Transaction Guide](./transactions.md) - Learn to send transactions
- [Real-time Monitoring](./real-time-monitoring.md) - Monitor wallet changes
- [Security Best Practices](./security.md) - Secure your wallets
