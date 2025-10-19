---
sidebar_position: 6
---

# Transaction Module

Build and serialize Hoosat transactions.

## Overview

The `transaction.mo` module provides low-level transaction building and serialization.

## Core Functions

### buildTransaction

Build a Hoosat transaction with one input and 1-2 outputs.

```motoko
public func buildTransaction(
  utxo: UTXO,
  recipientScript: Text,
  outputAmount: Nat64,
  fee: Nat64,
  changeScript: Text
) : HoosatTransaction
```

**Parameters:**
- `utxo`: UTXO to spend
- `recipientScript`: Recipient's script public key (hex)
- `outputAmount`: Amount to send in sompi
- `fee`: Transaction fee in sompi
- `changeScript`: Change address script public key (hex)

**Example:**
```motoko
import Transaction "mo:hoosat-mo/transaction";
import Types "mo:hoosat-mo/types";

let utxo : Types.UTXO = {
  transactionId = "a1b2c3...";
  index = 0;
  amount = 2000000;
  scriptVersion = 0;
  scriptPublicKey = "20a1b2c3...ac";
  address = "hoosat:qp...";
};

let tx = Transaction.buildTransaction(
  utxo,
  "20d4e5f6...ac",    // Recipient script
  1000000,            // 0.01 HTN
  1000,               // 0.00001 HTN fee
  "20a1b2c3...ac"     // Change script
);
```

### serializeTransaction

Serialize transaction to JSON for broadcasting.

```motoko
public func serializeTransaction(
  tx: HoosatTransaction
) : Text
```

**Example:**
```motoko
let json = Transaction.serializeTransaction(tx);
// Returns: "{\"transaction\":{\"version\":0,\"inputs\":[...]}}"
```

## Utility Functions

### signatureToHex

Convert signature to hex string.

```motoko
public func signatureToHex(
  sig: [Nat8]
) : Text
```

### arrayFromHex

Convert hex string to byte array.

```motoko
public func arrayFromHex(
  hex: Text
) : [Nat8]
```

## Transaction Structure

```motoko
public type HoosatTransaction = {
  version: Nat16;
  inputs: [TransactionInput];
  outputs: [TransactionOutput];
  lockTime: Nat64;
  subnetworkId: Text;
  gas: Nat64;
  payload: Text;
};
```

## Constants

```motoko
Transaction.DUST_THRESHOLD  // 1,000 sompi
Transaction.DEFAULT_VERSION // 0
```

## Related

- [Sighash Module](./sighash.md)
- [Types Module](./types.md)
- [Wallet Module](./wallet.md)
