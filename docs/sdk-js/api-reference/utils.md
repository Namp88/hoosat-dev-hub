---
sidebar_position: 5
---

# HoosatUtils API Reference

Complete API reference for `HoosatUtils` - utility functions for validation, conversion, and formatting.

## Overview

`HoosatUtils` provides essential utility functions for:
- Unit conversion (HTN ↔ sompi)
- Address validation and parsing
- Amount validation
- Network detection
- Address type detection

All methods are static - no need to instantiate the class.

## Amount Conversion

### `amountToSompi(amount: string)`

Convert HTN amount to sompi (smallest unit).

**Parameters:**
- `amount` - Amount in HTN as string (supports decimals)

**Returns:** `string` - Amount in sompi

**Examples:**
```typescript
// Convert HTN to sompi
const sompi1 = HoosatUtils.amountToSompi('1');
console.log(sompi1); // "100000000" (1 HTN = 100,000,000 sompi)

const sompi2 = HoosatUtils.amountToSompi('0.5');
console.log(sompi2); // "50000000"

const sompi3 = HoosatUtils.amountToSompi('1.23456789');
console.log(sompi3); // "123456789"

// Very small amounts
const sompi4 = HoosatUtils.amountToSompi('0.00000001');
console.log(sompi4); // "1" (1 sompi)

// Use with transaction builder
builder.addOutput(
  recipientAddress,
  HoosatUtils.amountToSompi('1.5')  // Send 1.5 HTN
);
```

**Unit Reference:**
```
1 HTN = 100,000,000 sompi
1 sompi = 0.00000001 HTN
```

### `sompiToAmount(sompi: string | bigint)`

Convert sompi to HTN amount.

**Parameters:**
- `sompi` - Amount in sompi (string or bigint)

**Returns:** `string` - Amount in HTN (formatted with decimals)

**Examples:**
```typescript
// Convert sompi to HTN
const htn1 = HoosatUtils.sompiToAmount('100000000');
console.log(htn1); // "1.00000000"

const htn2 = HoosatUtils.sompiToAmount('50000000');
console.log(htn2); // "0.50000000"

const htn3 = HoosatUtils.sompiToAmount('123456789');
console.log(htn3); // "1.23456789"

// Use with bigint
const balance = 150000000n;
const htn4 = HoosatUtils.sompiToAmount(balance);
console.log(htn4); // "1.50000000"

// Display balance
const balanceResult = await client.getBalance(address);
if (balanceResult.ok) {
  const htn = HoosatUtils.sompiToAmount(balanceResult.result.balance);
  console.log(`Balance: ${htn} HTN`);
}
```

**Formatting:**
- Always returns 8 decimal places
- Trailing zeros are included
- No thousands separators

### `formatAmount(sompi: string | bigint, decimals?: number)`

Format sompi with custom decimal places.

**Parameters:**
- `sompi` - Amount in sompi
- `decimals` - Number of decimal places (default: 8)

**Returns:** `string` - Formatted amount

**Examples:**
```typescript
const amount = '123456789';

// Default formatting (8 decimals)
console.log(HoosatUtils.formatAmount(amount));
// "1.23456789"

// Custom decimals
console.log(HoosatUtils.formatAmount(amount, 2));
// "1.23"

console.log(HoosatUtils.formatAmount(amount, 4));
// "1.2346"

// No decimals
console.log(HoosatUtils.formatAmount(amount, 0));
// "1"

// For display purposes
const balance = '150000000';
console.log(`Balance: ${HoosatUtils.formatAmount(balance, 2)} HTN`);
// "Balance: 1.50 HTN"
```

## Address Validation

### `isValidAddress(address: string)`

Validate Hoosat address format.

**Parameters:**
- `address` - Address to validate

**Returns:** `boolean` - True if valid, false otherwise

**Examples:**
```typescript
// Valid addresses
const valid1 = HoosatUtils.isValidAddress(
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);
console.log(valid1); // true

const valid2 = HoosatUtils.isValidAddress(
  'hoosattest:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);
console.log(valid2); // true

// Invalid addresses
console.log(HoosatUtils.isValidAddress(''));                    // false
console.log(HoosatUtils.isValidAddress('invalid'));            // false
console.log(HoosatUtils.isValidAddress('bitcoin:qz7ulu...'));  // false
console.log(HoosatUtils.isValidAddress('qz7ulu...'));         // false (missing prefix)

// Use before processing
if (HoosatUtils.isValidAddress(userAddress)) {
  await sendTransaction(userAddress, amount);
} else {
  console.error('Invalid address format');
}
```

**Validation checks:**
- Correct prefix (`hoosat:` or `hoosattest:`)
- Valid bech32 encoding
- Correct length
- Valid checksum

### `getAddressNetwork(address: string)`

Detect network from address prefix.

**Parameters:**
- `address` - Hoosat address

**Returns:** `'mainnet' | 'testnet'` - Network type

**Examples:**
```typescript
// Mainnet address
const network1 = HoosatUtils.getAddressNetwork(
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);
console.log(network1); // "mainnet"

// Testnet address
const network2 = HoosatUtils.getAddressNetwork(
  'hoosattest:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);
console.log(network2); // "testnet"

// Verify network matches wallet
const walletNetwork = process.env.WALLET_NETWORK || 'mainnet';
const addressNetwork = HoosatUtils.getAddressNetwork(recipientAddress);

if (addressNetwork !== walletNetwork) {
  throw new Error(
    `Network mismatch: wallet is on ${walletNetwork}, ` +
    `address is on ${addressNetwork}`
  );
}
```

**Network Prefixes:**
- `hoosat:` - Mainnet
- `hoosattest:` - Testnet

### `getAddressType(address: string)`

Get address type from version byte.

**Parameters:**
- `address` - Hoosat address

**Returns:** `'ecdsa' | 'schnorr' | 'p2sh'` - Address type

**Examples:**
```typescript
const type1 = HoosatUtils.getAddressType(
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);
console.log(type1); // "ecdsa"

// Check if address type is supported
const supportedTypes = ['ecdsa'];
const type = HoosatUtils.getAddressType(address);

if (!supportedTypes.includes(type)) {
  throw new Error(`Unsupported address type: ${type}`);
}
```

**Address Types:**
- `ecdsa` (0x01) - ECDSA secp256k1 (most common)
- `schnorr` (0x00) - Schnorr signatures
- `p2sh` (0x08) - Pay-to-Script-Hash (multi-sig)

### `getAddressVersion(address: string)`

Get raw version byte from address.

**Parameters:**
- `address` - Hoosat address

**Returns:** `number` - Version byte (0-255)

**Examples:**
```typescript
const version = HoosatUtils.getAddressVersion(address);
console.log(version); // 1 (for ECDSA)
console.log(`0x${version.toString(16)}`); // "0x01"

// Map version to type
const typeMap: Record<number, string> = {
  0x00: 'Schnorr',
  0x01: 'ECDSA',
  0x08: 'P2SH'
};

console.log('Address type:', typeMap[version]);
```

## Amount Validation

### `isValidAmount(amount: string)`

Validate amount format.

**Parameters:**
- `amount` - Amount to validate (in sompi)

**Returns:** `boolean` - True if valid, false otherwise

**Examples:**
```typescript
// Valid amounts
console.log(HoosatUtils.isValidAmount('100000000'));   // true
console.log(HoosatUtils.isValidAmount('1'));           // true
console.log(HoosatUtils.isValidAmount('12345'));       // true

// Invalid amounts
console.log(HoosatUtils.isValidAmount(''));            // false
console.log(HoosatUtils.isValidAmount('-100'));        // false
console.log(HoosatUtils.isValidAmount('abc'));         // false
console.log(HoosatUtils.isValidAmount('1.5'));         // false (must be integer)
console.log(HoosatUtils.isValidAmount('0'));           // false (zero not allowed)

// Use before transaction
if (!HoosatUtils.isValidAmount(amount)) {
  throw new Error('Invalid amount');
}

builder.addOutput(address, amount);
```

**Validation rules:**
- Must be numeric string
- Must be positive integer
- Must be greater than zero
- No decimals (sompi is smallest unit)

### `isValidPrivateKey(privateKeyHex: string)`

Validate private key format.

**Parameters:**
- `privateKeyHex` - Private key as hex string

**Returns:** `boolean` - True if valid, false otherwise

**Examples:**
```typescript
// Valid private key (64 hex characters)
const validKey = '33a4a81ecd31615c51385299969121707897fb1e167634196f31bd311de5fe43';
console.log(HoosatUtils.isValidPrivateKey(validKey)); // true

// Invalid private keys
console.log(HoosatUtils.isValidPrivateKey(''));                    // false
console.log(HoosatUtils.isValidPrivateKey('invalid'));            // false
console.log(HoosatUtils.isValidPrivateKey('33a4'));               // false (too short)
console.log(HoosatUtils.isValidPrivateKey('zzz4a81ecd...'));     // false (invalid hex)

// Validate before import
const privateKeyHex = process.env.WALLET_PRIVATE_KEY;

if (!HoosatUtils.isValidPrivateKey(privateKeyHex!)) {
  throw new Error('Invalid private key format');
}

const wallet = HoosatCrypto.importKeyPair(privateKeyHex!);
```

**Validation rules:**
- Must be 64 hexadecimal characters
- Must contain only 0-9, a-f, A-F
- No prefix (no '0x')

## Formatting Helpers

### `formatBalance(balance: string, includeUnit?: boolean)`

Format balance for display.

**Parameters:**
- `balance` - Balance in sompi
- `includeUnit` - Include 'HTN' suffix (default: true)

**Returns:** `string` - Formatted balance

**Examples:**
```typescript
// With unit
console.log(HoosatUtils.formatBalance('100000000'));
// "1.00000000 HTN"

console.log(HoosatUtils.formatBalance('123456789'));
// "1.23456789 HTN"

// Without unit
console.log(HoosatUtils.formatBalance('100000000', false));
// "1.00000000"

// Use in UI
const result = await client.getBalance(address);
if (result.ok) {
  const formatted = HoosatUtils.formatBalance(result.result.balance);
  console.log(`Your balance: ${formatted}`);
}
```

### `formatAddress(address: string, format?: 'full' | 'short')`

Format address for display.

**Parameters:**
- `address` - Hoosat address
- `format` - Format type (default: 'short')

**Returns:** `string` - Formatted address

**Examples:**
```typescript
const address = 'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02';

// Short format (for UI)
console.log(HoosatUtils.formatAddress(address, 'short'));
// "hoosat:qz7ulu...ruch02"

// Full format
console.log(HoosatUtils.formatAddress(address, 'full'));
// "hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02"

// Use in logs/UI
console.log(`Sending to: ${HoosatUtils.formatAddress(address, 'short')}`);
```

## Complete Validation Example

```typescript
import { HoosatUtils, HoosatCrypto } from 'hoosat-sdk';

function validateTransactionInputs(
  recipientAddress: string,
  amount: string,
  privateKey: string
): void {
  // Validate private key
  if (!HoosatUtils.isValidPrivateKey(privateKey)) {
    throw new Error('Invalid private key format');
  }

  // Validate address
  if (!HoosatUtils.isValidAddress(recipientAddress)) {
    throw new Error('Invalid recipient address');
  }

  // Check network
  const wallet = HoosatCrypto.importKeyPair(privateKey);
  const walletNetwork = HoosatUtils.getAddressNetwork(wallet.address);
  const recipientNetwork = HoosatUtils.getAddressNetwork(recipientAddress);

  if (walletNetwork !== recipientNetwork) {
    throw new Error(
      `Network mismatch: wallet is ${walletNetwork}, recipient is ${recipientNetwork}`
    );
  }

  // Validate amount
  if (!HoosatUtils.isValidAmount(amount)) {
    throw new Error('Invalid amount format');
  }

  // Check for dust
  const DUST_THRESHOLD = 1000n;
  if (BigInt(amount) < DUST_THRESHOLD) {
    throw new Error(`Amount below dust threshold (${DUST_THRESHOLD} sompi)`);
  }

  console.log('All validations passed');
  console.log('Wallet:', HoosatUtils.formatAddress(wallet.address, 'short'));
  console.log('Recipient:', HoosatUtils.formatAddress(recipientAddress, 'short'));
  console.log('Amount:', HoosatUtils.formatBalance(amount));
}

// Usage
try {
  validateTransactionInputs(
    'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
    HoosatUtils.amountToSompi('1.0'),
    process.env.WALLET_PRIVATE_KEY!
  );
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## Conversion Reference

### HTN to Sompi Conversion Table

| HTN | Sompi |
|-----|-------|
| 0.00000001 | 1 |
| 0.0001 | 10,000 |
| 0.001 | 100,000 |
| 0.01 | 1,000,000 |
| 0.1 | 10,000,000 |
| 1 | 100,000,000 |
| 10 | 1,000,000,000 |
| 100 | 10,000,000,000 |
| 1,000 | 100,000,000,000 |

### Common Amounts

```typescript
// Dust threshold
const DUST = '1000';  // 0.00001 HTN

// Minimum transfer
const MIN_TRANSFER = HoosatUtils.amountToSompi('0.001');  // 0.001 HTN

// Standard fee
const STANDARD_FEE = HoosatUtils.amountToSompi('0.0001');  // 0.0001 HTN

// Large transaction threshold
const LARGE_TX = HoosatUtils.amountToSompi('100');  // 100 HTN
```

## Address Format Reference

### Mainnet Address Format

```
hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02
│      │                                                              │
│      └─ Bech32 encoded payload (address data)                      │
└─ Network prefix                                                    └─ Checksum
```

### Testnet Address Format

```
hoosattest:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02
│          │                                                              │
│          └─ Bech32 encoded payload (address data)                      │
└─ Network prefix                                                        └─ Checksum
```

### Address Components

1. **Prefix**: `hoosat:` (mainnet) or `hoosattest:` (testnet)
2. **Version byte**: Address type (ECDSA, Schnorr, P2SH)
3. **Payload**: Public key hash or script hash
4. **Checksum**: Error detection

## Best Practices

### 1. Always Validate User Input

```typescript
// Bad
builder.addOutput(userAddress, userAmount);

// Good
if (!HoosatUtils.isValidAddress(userAddress)) {
  throw new Error('Invalid address');
}

if (!HoosatUtils.isValidAmount(userAmount)) {
  throw new Error('Invalid amount');
}

builder.addOutput(userAddress, userAmount);
```

### 2. Use Type-Safe Conversions

```typescript
// Bad - prone to errors
const sompi = parseFloat(htn) * 100000000;

// Good - use utility function
const sompi = HoosatUtils.amountToSompi(htn);
```

### 3. Format for Display

```typescript
// Bad - hard to read
console.log('Balance:', balance, 'sompi');

// Good - user-friendly
console.log('Balance:', HoosatUtils.formatBalance(balance));
```

### 4. Verify Network Matches

```typescript
const walletNetwork = HoosatUtils.getAddressNetwork(wallet.address);
const recipientNetwork = HoosatUtils.getAddressNetwork(recipientAddress);

if (walletNetwork !== recipientNetwork) {
  throw new Error('Network mismatch');
}
```

## UTXO Maturity Management

### Understanding UTXO Maturity

In Hoosat, **coinbase UTXOs** (mining rewards) require a minimum number of confirmations before they can be spent. This prevents issues if the blockchain reorganizes and invalidates mining rewards. Regular transaction outputs (non-coinbase UTXOs) are always immediately spendable.

**Key Concepts:**
- **DAA Score**: Difficulty Adjustment Algorithm score - similar to block height, but more precise
- **Coinbase Maturity**: Minimum confirmations required for coinbase UTXOs (default: 100 blocks)
- **Confirmations**: `currentDaaScore - blockDaaScore` of the UTXO

### `filterMatureUtxos(utxos, currentDaaScore, coinbaseMaturity?)`

Filters UTXOs to return only mature (spendable) ones. This is useful when building transactions to ensure you only use UTXOs that can be spent.

**Parameters:**
- `utxos` - Array of UTXOs to filter (must have `utxoEntry.isCoinbase` and `utxoEntry.blockDaaScore`)
- `currentDaaScore` - Current DAA score from the network (get from `getBlockDagInfo().virtualDaaScore`)
- `coinbaseMaturity` - Minimum confirmations for coinbase UTXOs (optional, default: 100)

**Returns:** `T[]` - Filtered array containing only mature (spendable) UTXOs

**Examples:**

```typescript
import { HoosatClient, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient('https://api.hoosat.net');

// Basic usage
async function getSpendableUtxos(address: string) {
  // Get current DAA score
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  // Get all UTXOs for address
  const utxosResponse = await client.getUtxosByAddresses([address]);
  const allUtxos = utxosResponse.result.utxos;

  // Filter to get only spendable UTXOs
  const spendableUtxos = HoosatUtils.filterMatureUtxos(allUtxos, currentDaa);

  console.log(`Total UTXOs: ${allUtxos.length}`);
  console.log(`Spendable UTXOs: ${spendableUtxos.length}`);

  return spendableUtxos;
}

// Use with transaction builder
async function sendTransaction(
  senderAddress: string,
  recipientAddress: string,
  amount: string
) {
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  const utxosResponse = await client.getUtxosByAddresses([senderAddress]);
  const allUtxos = utxosResponse.result.utxos;

  // Only use mature UTXOs
  const matureUtxos = HoosatUtils.filterMatureUtxos(allUtxos, currentDaa);

  if (matureUtxos.length === 0) {
    throw new Error('No spendable UTXOs available');
  }

  // Build transaction with mature UTXOs only
  const builder = new HoosatTxBuilder();
  matureUtxos.forEach(utxo => builder.addInput(utxo));
  builder.addOutput(recipientAddress, amount);

  // ... continue with transaction building
}

// Custom maturity requirement (extra safe - wait for 200 blocks)
async function getExtraSafeUtxos(address: string) {
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  const utxosResponse = await client.getUtxosByAddresses([address]);
  const allUtxos = utxosResponse.result.utxos;

  // Require 200 confirmations for coinbase UTXOs
  const extraSafeUtxos = HoosatUtils.filterMatureUtxos(
    allUtxos,
    currentDaa,
    200  // Custom maturity requirement
  );

  return extraSafeUtxos;
}
```

**How it works:**
1. Regular (non-coinbase) UTXOs are always included
2. Coinbase UTXOs are checked: `confirmations >= coinbaseMaturity`
3. Confirmations calculated as: `currentDaaScore - utxo.blockDaaScore`

**When to use:**
- Before building transactions to avoid using immature coinbase outputs
- When checking available balance for spending
- When selecting UTXOs for payments

### `separateMatureUtxos(utxos, currentDaaScore, coinbaseMaturity?)`

Separates UTXOs into mature and immature groups. This is useful for displaying balance breakdowns or understanding when funds will become available.

**Parameters:**
- `utxos` - Array of UTXOs to separate
- `currentDaaScore` - Current DAA score from the network
- `coinbaseMaturity` - Minimum confirmations for coinbase UTXOs (optional, default: 100)

**Returns:** `{ mature: T[], immature: T[] }` - Object with separated UTXO arrays

**Examples:**

```typescript
import { HoosatClient, HoosatUtils } from 'hoosat-sdk';

const client = new HoosatClient('https://api.hoosat.net');

// Display balance breakdown
async function displayBalanceDetails(address: string) {
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  const utxosResponse = await client.getUtxosByAddresses([address]);
  const allUtxos = utxosResponse.result.utxos;

  // Separate mature and immature UTXOs
  const { mature, immature } = HoosatUtils.separateMatureUtxos(allUtxos, currentDaa);

  // Calculate balances
  const matureBalance = mature.reduce(
    (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
    0n
  );

  const immatureBalance = immature.reduce(
    (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
    0n
  );

  const totalBalance = matureBalance + immatureBalance;

  console.log('Balance Details:');
  console.log(`  Spendable:  ${HoosatUtils.formatBalance(matureBalance.toString())}`);
  console.log(`  Pending:    ${HoosatUtils.formatBalance(immatureBalance.toString())}`);
  console.log(`  Total:      ${HoosatUtils.formatBalance(totalBalance.toString())}`);
  console.log(`\nUTXOs: ${mature.length} spendable, ${immature.length} pending`);
}

// Show when immature UTXOs will mature
async function showMaturityTimeline(address: string) {
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  const utxosResponse = await client.getUtxosByAddresses([address]);
  const { mature, immature } = HoosatUtils.separateMatureUtxos(
    utxosResponse.result.utxos,
    currentDaa
  );

  console.log(`\nSpendable now: ${mature.length} UTXOs`);

  if (immature.length > 0) {
    console.log(`\nPending maturity: ${immature.length} UTXOs`);

    immature.forEach((utxo, index) => {
      const confirmations = currentDaa - parseInt(utxo.utxoEntry.blockDaaScore);
      const remaining = 100 - confirmations;
      const amount = HoosatUtils.formatBalance(utxo.utxoEntry.amount);

      console.log(
        `  ${index + 1}. ${amount} - ${remaining} blocks remaining ` +
        `(${confirmations}/100 confirmations)`
      );
    });
  }
}

// Validate sufficient spendable balance
async function validateSpendableBalance(
  address: string,
  requiredAmount: string
): Promise<boolean> {
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  const utxosResponse = await client.getUtxosByAddresses([address]);
  const { mature, immature } = HoosatUtils.separateMatureUtxos(
    utxosResponse.result.utxos,
    currentDaa
  );

  const spendableBalance = mature.reduce(
    (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
    0n
  );

  const required = BigInt(requiredAmount);

  if (spendableBalance < required) {
    const totalBalance = immature.reduce(
      (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
      spendableBalance
    );

    if (totalBalance >= required) {
      console.log(
        'Insufficient spendable balance. ' +
        'You have enough total balance, but some UTXOs are still maturing.'
      );
    } else {
      console.log('Insufficient total balance.');
    }

    return false;
  }

  return true;
}

// Mining reward tracker for miners
async function trackMiningRewards(minerAddress: string) {
  const dagInfo = await client.getBlockDagInfo();
  const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

  const utxosResponse = await client.getUtxosByAddresses([minerAddress]);
  const { mature, immature } = HoosatUtils.separateMatureUtxos(
    utxosResponse.result.utxos,
    currentDaa
  );

  // Filter only coinbase UTXOs
  const matureCoinbase = mature.filter(u => u.utxoEntry.isCoinbase);
  const immatureCoinbase = immature.filter(u => u.utxoEntry.isCoinbase);

  const maturedRewards = matureCoinbase.reduce(
    (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
    0n
  );

  const pendingRewards = immatureCoinbase.reduce(
    (sum, utxo) => sum + BigInt(utxo.utxoEntry.amount),
    0n
  );

  console.log('Mining Rewards:');
  console.log(`  Matured:  ${HoosatUtils.formatBalance(maturedRewards.toString())}`);
  console.log(`  Pending:  ${HoosatUtils.formatBalance(pendingRewards.toString())}`);
  console.log(`\nBlocks: ${matureCoinbase.length} matured, ${immatureCoinbase.length} pending`);
}
```

**Comparison with filterMatureUtxos:**

| Method | Returns | Use Case |
|--------|---------|----------|
| `filterMatureUtxos()` | Only mature UTXOs | Transaction building, spending |
| `separateMatureUtxos()` | Both groups | Balance display, analytics |

**When to use:**
- Displaying balance breakdowns (spendable vs pending)
- Showing maturity timeline for mining rewards
- Wallet UI that needs to show both available and pending funds
- Analytics and reporting

### UTXO Maturity Best Practices

#### 1. Always Filter Before Spending

```typescript
// Bad - may include immature coinbase UTXOs
const utxos = await client.getUtxosByAddresses([address]);
builder.addInputs(utxos.result.utxos);

// Good - only use mature UTXOs
const dagInfo = await client.getBlockDagInfo();
const currentDaa = parseInt(dagInfo.result.virtualDaaScore);
const utxos = await client.getUtxosByAddresses([address]);
const matureUtxos = HoosatUtils.filterMatureUtxos(utxos.result.utxos, currentDaa);
builder.addInputs(matureUtxos);
```

#### 2. Show Users Why Funds Are Unavailable

```typescript
const { mature, immature } = HoosatUtils.separateMatureUtxos(utxos, currentDaa);

if (mature.length === 0 && immature.length > 0) {
  const nextMature = immature.reduce((earliest, utxo) => {
    const confirmations = currentDaa - parseInt(utxo.utxoEntry.blockDaaScore);
    const remaining = 100 - confirmations;
    return Math.min(earliest, remaining);
  }, Infinity);

  console.log(`Funds will be available in approximately ${nextMature} blocks`);
}
```

#### 3. Handle Mining Rewards Appropriately

```typescript
// For mining pools - may want stricter maturity
const POOL_MATURITY = 200;  // Extra safe

const safeUtxos = HoosatUtils.filterMatureUtxos(
  utxos,
  currentDaa,
  POOL_MATURITY
);
```

#### 4. Cache DAA Score Appropriately

```typescript
// Good - reuse DAA score for multiple operations
const dagInfo = await client.getBlockDagInfo();
const currentDaa = parseInt(dagInfo.result.virtualDaaScore);

const utxos1 = await client.getUtxosByAddresses([address1]);
const mature1 = HoosatUtils.filterMatureUtxos(utxos1.result.utxos, currentDaa);

const utxos2 = await client.getUtxosByAddresses([address2]);
const mature2 = HoosatUtils.filterMatureUtxos(utxos2.result.utxos, currentDaa);

// Bad - fetching DAA score multiple times unnecessarily
// (omitted for brevity)
```

### Common UTXO Maturity Scenarios

```typescript
// Scenario 1: Regular wallet (only receives regular transactions)
// All UTXOs are immediately spendable
const { mature, immature } = HoosatUtils.separateMatureUtxos(utxos, currentDaa);
// immature.length === 0

// Scenario 2: Mining wallet (receives coinbase rewards)
// Some UTXOs need to mature
const { mature, immature } = HoosatUtils.separateMatureUtxos(utxos, currentDaa);
// immature contains coinbase UTXOs with < 100 confirmations

// Scenario 3: Exchange wallet (receives both types)
// Filter to ensure only spendable funds are used
const spendable = HoosatUtils.filterMatureUtxos(utxos, currentDaa);
```

## Next Steps

- [HoosatCrypto](./crypto.md) - Cryptographic operations
- [HoosatTxBuilder](./tx-builder.md) - Transaction building
