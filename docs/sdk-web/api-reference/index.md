---
sidebar_position: 1
---

# API Reference Overview

Complete API reference for the Hoosat Browser SDK.

## Core Modules

### [HoosatCrypto](./crypto.md)

Browser-native cryptographic operations.

**Key Methods:**
- `generateKeyPair(network?)` - Generate ECDSA key pair
- `importKeyPair(privateKey, network?)` - Import wallet
- `signTransactionInput(tx, index, privateKey, utxo)` - Sign transaction
- `getTransactionId(tx)` - Calculate TX ID
- `blake3Hash(data)` - BLAKE3 hashing

### [HoosatWebClient](./client.md)

REST API client for Hoosat nodes.

**Key Methods:**
- `getBalance(address)` - Get address balance
- `getUtxos(addresses)` - Get UTXOs
- `submitTransaction(tx)` - Submit signed transaction
- `getFeeEstimate()` - Get fee recommendations
- `getNetworkInfo()` - Get network information

### [HoosatTxBuilder](./tx-builder.md)

Transaction builder with fluent API.

**Key Methods:**
- `addInput(utxo, privateKey?)` - Add input
- `addOutput(address, amount)` - Add output
- `addChangeOutput(address)` - Add change
- `setFee(fee)` - Set fee
- `sign(privateKey?)` - Sign transaction

### [HoosatSigner](./signer.md)

Message signing for authentication.

**Key Methods:**
- `signMessage(privateKey, message)` - Sign message
- `verifyMessage(signature, message, publicKey)` - Verify signature
- `createSignedMessage(privateKey, message, address)` - Create signed message object
- `verifySignedMessage(signedMessage, publicKey)` - Verify signed message

### [HoosatQR](./qr.md)

QR code generation for payments.

**Key Methods:**
- `generateAddressQR(address, options?)` - Generate address QR
- `generatePaymentQR(params, options?)` - Generate payment QR
- `buildPaymentURI(params)` - Build payment URI
- `parsePaymentURI(uri)` - Parse payment URI

### [HoosatUtils](./utils.md)

Utility functions.

**Key Methods:**
- `amountToSompi(htn)` - Convert HTN to sompi
- `sompiToAmount(sompi)` - Convert sompi to HTN
- `isValidAddress(address)` - Validate address
- `getAddressNetwork(address)` - Get address network
- `truncateAddress(address)` - Truncate for display

## Quick Reference

### Generate Wallet

```typescript
import { HoosatCrypto } from 'hoosat-sdk-web';

const wallet = HoosatCrypto.generateKeyPair('mainnet');
```

### Check Balance

```typescript
import { HoosatWebClient } from 'hoosat-sdk-web';

const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

const balance = await client.getBalance(address);
```

### Send Transaction

```typescript
import { HoosatTxBuilder, HoosatUtils } from 'hoosat-sdk-web';

const builder = new HoosatTxBuilder();

utxos.forEach(utxo => builder.addInput(utxo, wallet.privateKey));

builder
  .addOutput(recipient, HoosatUtils.amountToSompi('1.0'))
  .setFee('2500')
  .addChangeOutput(wallet.address);

const signed = builder.sign();
const result = await client.submitTransaction(signed);
```

### Sign Message

```typescript
import { HoosatSigner } from 'hoosat-sdk-web';

const signature = HoosatSigner.signMessage(
  wallet.privateKey.toString('hex'),
  message
);

const isValid = HoosatSigner.verifyMessage(
  signature,
  message,
  wallet.publicKey.toString('hex')
);
```

### Generate QR

```typescript
import { HoosatQR } from 'hoosat-sdk-web';

const qr = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: 100,
  label: 'Coffee Shop'
});
```

## Type Definitions

### KeyPair

```typescript
interface KeyPair {
  address: string;
  publicKey: Buffer;
  privateKey: Buffer;
}
```

### Transaction

```typescript
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

### UTXO

```typescript
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

## Constants

```typescript
// Unit conversion
const SOMPI_PER_HTN = 100000000n;

// Network prefixes
const MAINNET_PREFIX = 'hoosat:';
const TESTNET_PREFIX = 'hoosattest:';

// Spam protection
const MAX_RECIPIENT_OUTPUTS = 2;
const MAX_TOTAL_OUTPUTS = 3;

// Dust threshold
const DUST_THRESHOLD = 1000n;
```

## Next Steps

- [HoosatCrypto](./crypto.md) - Cryptographic operations
- [HoosatWebClient](./client.md) - REST API client
- [HoosatTxBuilder](./tx-builder.md) - Transaction builder
- [Examples](../examples) - Working examples
