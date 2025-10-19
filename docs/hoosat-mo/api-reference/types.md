---
sidebar_position: 7
---

# Types Module

Core data structures for Hoosat transactions.

## Transaction Types

### HoosatTransaction

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

### TransactionInput

```motoko
public type TransactionInput = {
  previousOutpoint: Outpoint;
  signatureScript: Text;
  sequence: Nat64;
  sigOpCount: Nat8;
};
```

### TransactionOutput

```motoko
public type TransactionOutput = {
  amount: Nat64;
  scriptPublicKey: ScriptPublicKey;
};
```

### Outpoint

```motoko
public type Outpoint = {
  transactionId: Text;  // 64-char hex
  index: Nat32;
};
```

### ScriptPublicKey

```motoko
public type ScriptPublicKey = {
  version: Nat16;
  scriptPublicKey: Text;  // Hex-encoded
};
```

## UTXO Type

### UTXO

```motoko
public type UTXO = {
  transactionId: Text;     // 64-char hex
  index: Nat32;
  amount: Nat64;
  scriptVersion: Nat16;
  scriptPublicKey: Text;   // Hex-encoded
  address: Text;           // Hoosat address
};
```

**Example:**
```motoko
let utxo : Types.UTXO = {
  transactionId = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6";
  index = 0;
  amount = 2000000;
  scriptVersion = 0;
  scriptPublicKey = "20a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3ac";
  address = "hoosat:qypq...";
};
```

## Usage Example

```motoko
import Types "mo:hoosat-mo/types";

let tx : Types.HoosatTransaction = {
  version = 0;
  inputs = [{
    previousOutpoint = {
      transactionId = "a1b2c3...";
      index = 0;
    };
    signatureScript = "";
    sequence = 0;
    sigOpCount = 1;
  }];
  outputs = [{
    amount = 1000000;
    scriptPublicKey = {
      version = 0;
      scriptPublicKey = "20d4e5f6...ac";
    };
  }];
  lockTime = 0;
  subnetworkId = "0000000000000000000000000000000000000000";
  gas = 0;
  payload = "";
};
```

## Related

- [Transaction Module](./transaction.md)
- [Wallet Module](./wallet.md)
