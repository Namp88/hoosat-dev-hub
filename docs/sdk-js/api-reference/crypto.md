---
sidebar_position: 2
---

# HoosatCrypto API Reference

Complete API reference for the `HoosatCrypto` class - cryptographic operations for the Hoosat blockchain.

## Overview

`HoosatCrypto` provides all cryptographic functionality needed for Hoosat blockchain interactions:
- Key pair generation (ECDSA secp256k1)
- Address creation (ECDSA, Schnorr, P2SH)
- Transaction signing (BLAKE3 + ECDSA)
- Hash generation (BLAKE3)
- Fee calculation (mass-based)

All methods are static - no need to instantiate the class.

## Key Management

### `generateKeyPair(network?: HoosatNetwork)`

Generate a new ECDSA key pair.

**Parameters:**
- `network` - Network type: `'mainnet'` or `'testnet'` (default: `'mainnet'`)

**Returns:** `KeyPair`

```typescript
interface KeyPair {
  address: string;      // Hoosat address with prefix
  publicKey: Buffer;    // 33-byte compressed public key
  privateKey: Buffer;   // 32-byte private key
}
```

**Examples:**
```typescript
// Mainnet wallet
const mainnetWallet = HoosatCrypto.generateKeyPair('mainnet');
console.log(mainnetWallet.address); // "hoosat:qz7ulu..."

// Testnet wallet
const testnetWallet = HoosatCrypto.generateKeyPair('testnet');
console.log(testnetWallet.address); // "hoosattest:qz7ulu..."

// Access keys
console.log(mainnetWallet.privateKey.toString('hex')); // 64-char hex
console.log(mainnetWallet.publicKey.toString('hex'));  // 66-char hex
```

### `importKeyPair(privateKeyHex: string, network?: HoosatNetwork)`

Import a wallet from existing private key.

**Parameters:**
- `privateKeyHex` - Private key as hex string (64 characters)
- `network` - Network type (default: `'mainnet'`)

**Returns:** `KeyPair`

**Examples:**
```typescript
const privateKey = '33a4a81ecd31615c51385299969121707897fb1e167634196f31bd311de5fe43';

// Import mainnet wallet
const wallet = HoosatCrypto.importKeyPair(privateKey, 'mainnet');

// Import testnet wallet
const testnetWallet = HoosatCrypto.importKeyPair(privateKey, 'testnet');
```

**Validation:**
```typescript
// Validate before import
if (HoosatUtils.isValidPrivateKey(privateKeyHex)) {
  const wallet = HoosatCrypto.importKeyPair(privateKeyHex);
}
```

## Address Operations

### `publicKeyToAddressECDSA(publicKey: Buffer, network?: HoosatNetwork)`

Convert public key to ECDSA address.

**Parameters:**
- `publicKey` - 33-byte compressed public key
- `network` - Network type (default: `'mainnet'`)

**Returns:** `string` - Hoosat address

**Example:**
```typescript
const address = HoosatCrypto.publicKeyToAddressECDSA(
  wallet.publicKey,
  'mainnet'
);
console.log(address); // "hoosat:qz7ulu..."
```

### `addressToScriptPublicKey(address: string)`

Convert Hoosat address to script public key.

**Parameters:**
- `address` - Hoosat address

**Returns:** `Buffer` - Script public key

**Example:**
```typescript
const scriptPubKey = HoosatCrypto.addressToScriptPublicKey(
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);
```

**Use case:** Creating transaction outputs

## Transaction Operations

### `signTransaction(transaction: Transaction, privateKey: Buffer, sighashType?: number)`

Sign a transaction.

**Parameters:**
- `transaction` - Transaction object to sign
- `privateKey` - 32-byte private key
- `sighashType` - Signature hash type (default: `0x01` - SIGHASH_ALL)

**Returns:** `Transaction` - Signed transaction

**Example:**
```typescript
const signedTx = HoosatCrypto.signTransaction(
  transaction,
  wallet.privateKey
);

// Submit signed transaction
const result = await client.submitTransaction(signedTx);
```

**Note:** Usually you'll use `HoosatTxBuilder` which handles signing automatically.

### `getTransactionId(transaction: Transaction)`

Calculate transaction ID (hash).

**Parameters:**
- `transaction` - Transaction object

**Returns:** `string` - Transaction ID (64-character hex)

**Example:**
```typescript
const txId = HoosatCrypto.getTransactionId(signedTransaction);
console.log('Transaction ID:', txId);
```

### `calculateFee(inputsCount: number, outputsCount: number, feeRate?: number)`

Calculate transaction fee based on mass.

**Parameters:**
- `inputsCount` - Number of inputs
- `outputsCount` - Number of outputs
- `feeRate` - Fee rate in sompi per byte (default: 1)

**Returns:** `string` - Fee amount in sompi

**Example:**
```typescript
// Calculate fee for 2 inputs, 2 outputs at 10 sompi/byte
const fee = HoosatCrypto.calculateFee(2, 2, 10);
console.log('Fee:', fee, 'sompi');

// Use with dynamic fee estimation
const feeEstimator = new HoosatFeeEstimator(client);
const estimate = await feeEstimator.estimateFee(
  FeePriority.Normal,
  2,  // inputs
  2   // outputs
);

const fee = HoosatCrypto.calculateFee(
  2,
  2,
  estimate.feeRate
);
```

**Formula:**
```
Mass = (inputs × 1700) + (outputs × 1700) + 10
Fee = Mass × feeRate
```

## Hashing

### `blake3Hash(data: Buffer | string)`

Compute BLAKE3 hash.

**Parameters:**
- `data` - Data to hash (Buffer or string)

**Returns:** `Buffer` - 32-byte hash

**Example:**
```typescript
// Hash a string
const hash = HoosatCrypto.blake3Hash('Hello Hoosat');

// Hash binary data
const buffer = Buffer.from([0x01, 0x02, 0x03]);
const hash2 = HoosatCrypto.blake3Hash(buffer);

// Convert to hex
console.log(hash.toString('hex'));
```

**Use cases:**
- Transaction ID calculation
- Signature hashing
- Data integrity verification

## Address Types

Hoosat supports three address types:

### ECDSA (0x01) - Default
```typescript
const wallet = HoosatCrypto.generateKeyPair(); // ECDSA by default
```

**Characteristics:**
- Most common type
- secp256k1 ECDSA signatures
- 33-byte compressed public key
- Used by wallets and exchanges

### Schnorr (0x00)
```typescript
// Schnorr addresses start with different version byte
```

**Characteristics:**
- Schnorr signatures
- Better privacy properties
- Smaller signatures

### P2SH (0x08) - Pay-to-Script-Hash
```typescript
// For multi-signature and script-based addresses
```

**Characteristics:**
- Used for multi-sig wallets
- Smart contract addresses
- More complex spending conditions

**Detect address type:**
```typescript
const type = HoosatUtils.getAddressType(address);
const version = HoosatUtils.getAddressVersion(address);

console.log('Type:', type);     // 'ecdsa', 'schnorr', or 'p2sh'
console.log('Version:', version); // 0x00, 0x01, or 0x08
```

## Network Prefixes

Addresses have different prefixes based on network:

| Network | Prefix | Example |
|---------|--------|---------|
| Mainnet | `hoosat:` | `hoosat:qz7ulu...` |
| Testnet | `hoosattest:` | `hoosattest:qz7ulu...` |

**Detect network:**
```typescript
const network = HoosatUtils.getAddressNetwork(address);
console.log(network); // 'mainnet' or 'testnet'
```

## Security Best Practices

### Private Key Storage

**Never hardcode private keys:**
```typescript
// Bad
const privateKey = '33a4a81ecd31615c51385299969121707897fb1e...';

// Good - use environment variables
const privateKey = process.env.WALLET_PRIVATE_KEY!;

// Good - encrypted file
const fs = require('fs');
const privateKey = decrypt(fs.readFileSync('.keys/wallet.enc'));
```

### Key Generation

**Use cryptographically secure randomness:**
```typescript
// Good - SDK uses crypto.randomBytes internally
const wallet = HoosatCrypto.generateKeyPair();

// Bad - never use Math.random for keys
```

### Memory Security

**Clear sensitive data after use:**
```typescript
let privateKey = Buffer.from(privateKeyHex, 'hex');

// Use the key
const signedTx = HoosatCrypto.signTransaction(tx, privateKey);

// Clear from memory
privateKey.fill(0);
privateKey = null;
```

## Complete Example

```typescript
import { HoosatCrypto, HoosatUtils } from 'hoosat-sdk';

// Generate new wallet
const wallet = HoosatCrypto.generateKeyPair('mainnet');

console.log('Wallet created!');
console.log('Address:', wallet.address);
console.log('Private key:', wallet.privateKey.toString('hex'));

// Validate address
const isValid = HoosatUtils.isValidAddress(wallet.address);
console.log('Valid address:', isValid); // true

// Get address info
const network = HoosatUtils.getAddressNetwork(wallet.address);
const type = HoosatUtils.getAddressType(wallet.address);
const version = HoosatUtils.getAddressVersion(wallet.address);

console.log('Network:', network);   // 'mainnet'
console.log('Type:', type);         // 'ecdsa'
console.log('Version:', `0x${version.toString(16)}`); // '0x01'

// Import existing wallet
const imported = HoosatCrypto.importKeyPair(
  wallet.privateKey.toString('hex'),
  'mainnet'
);

console.log('Imported:', imported.address === wallet.address); // true
```

## Type Definitions

```typescript
interface KeyPair {
  address: string;
  publicKey: Buffer;
  privateKey: Buffer;
}

type HoosatNetwork = 'mainnet' | 'testnet';

interface Transaction {
  version: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  lockTime: string;
  subnetworkId: string;
  gas: string;
  payload: string;
}
```

## Next Steps

- [HoosatSigner](./signer.md) - Message signing and verification
- [HoosatTxBuilder](./tx-builder.md) - Transaction building
- [HoosatUtils](./utils.md) - Validation and conversion utilities
