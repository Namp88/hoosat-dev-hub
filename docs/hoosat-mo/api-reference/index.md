---
sidebar_position: 1
---

# API Reference

Complete reference documentation for all Hoosat-mo modules.

## Core Modules

### Primary Modules (Production-Ready)

- **[wallet.mo](./wallet.md)** - Complete wallet functionality with transaction lifecycle
- **[address.mo](./address.md)** - Address generation, validation, and encoding
- **[validation.mo](./validation.md)** - Input validation and security checks
- **[errors.mo](./errors.md)** - Comprehensive error handling

### Transaction Modules

- **[transaction.mo](./transaction.md)** - Transaction building and serialization
- **[sighash.mo](./sighash.md)** - Signature hash calculation for Schnorr and ECDSA

### Supporting Modules

- **[types.mo](./types.md)** - Core data structures and type definitions
- **[personal_message.mo](./personal-message.md)** - Personal message signing

## Quick Reference

### Common Imports

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Address "mo:hoosat-mo/address";
import Validation "mo:hoosat-mo/validation";
import Errors "mo:hoosat-mo/errors";
import Types "mo:hoosat-mo/types";
import Transaction "mo:hoosat-mo/transaction";
import Sighash "mo:hoosat-mo/sighash";
```

### Type Overview

```motoko
// Core types from types.mo
public type UTXO = {
  transactionId: Text;
  index: Nat32;
  amount: Nat64;
  scriptVersion: Nat16;
  scriptPublicKey: Text;
  address: Text;
};

public type HoosatTransaction = {
  version: Nat16;
  inputs: [TransactionInput];
  outputs: [TransactionOutput];
  lockTime: Nat64;
  subnetworkId: Text;
  gas: Nat64;
  payload: Text;
};

// Result types from errors.mo
public type HoosatError = {
  #InvalidAddress: Text;
  #InvalidAmount: Text;
  #InsufficientFunds: { available: Nat64; required: Nat64 };
  #NetworkError: Text;
  #SigningError: Text;
  #ValidationError: Text;
  #InternalError: Text;
};
```

## Module Organization

### Production Architecture

The package follows a layered architecture:

```
Application Layer
    ↓
wallet.mo (High-level wallet operations)
    ↓
validation.mo (Input validation)
    ↓
transaction.mo + address.mo (Core operations)
    ↓
sighash.mo (Cryptographic operations)
    ↓
types.mo (Data structures)
```

### Usage Patterns

#### For Simple Applications
Use the high-level `wallet.mo` module:

```motoko
let wallet = Wallet.createMainnetWallet("key", ?"hoosat");
let result = await wallet.sendTransaction(from, to, amount, null, null);
```

#### For Advanced Control
Use lower-level modules directly:

```motoko
import Address "mo:hoosat-mo/address";
import Transaction "mo:hoosat-mo/transaction";
import Sighash "mo:hoosat-mo/sighash";

// Build custom transaction
let tx = Transaction.buildTransaction(utxo, recipientScript, amount, fee, changeScript);

// Calculate signature hash
let hash = Sighash.calculateSighashEcdsa(tx, 0, utxo, Sighash.SigHashAll, reusedValues);
```

## Error Handling

All modules use `Result<T, HoosatError>` for error handling:

```motoko
import Result "mo:base/Result";
import Errors "mo:hoosat-mo/errors";

let result = await someOperation();
switch (result) {
  case (#ok(value)) {
    // Handle success
  };
  case (#err(error)) {
    // Handle error
    let errorMsg = Errors.errorToText(error);
    Debug.print("Error: " # errorMsg);
  };
};
```

## Address Types

The package supports three address types:

```motoko
import Address "mo:hoosat-mo/address";

// Schnorr (32-byte pubkey)
Address.SCHNORR // = 0

// ECDSA (33-byte pubkey)
Address.ECDSA // = 1

// Pay-to-Script-Hash (32-byte hash)
Address.P2SH // = 2
```

## Signature Hash Types

Standard Hoosat sighash types:

```motoko
import Sighash "mo:hoosat-mo/sighash";

Sighash.SigHashAll                 // 0x01 - Signs all inputs and outputs
Sighash.SigHashNone                // 0x02 - Signs inputs only
Sighash.SigHashSingle              // 0x04 - Signs inputs and one output
Sighash.SigHashAnyOneCanPay        // 0x80 - Signs only current input
Sighash.SigHashAll_AnyOneCanPay    // 0x81 - Combination
Sighash.SigHashNone_AnyOneCanPay   // 0x82 - Combination
Sighash.SigHashSingle_AnyOneCanPay // 0x84 - Combination
```

## Constants

Key constants used throughout the package:

```motoko
// Address payload lengths
Address.SCHNORR_PAYLOAD_LEN // 32 bytes
Address.ECDSA_PAYLOAD_LEN   // 33 bytes

// Transaction defaults
Transaction.DUST_THRESHOLD  // 1,000 sompi
Transaction.DEFAULT_VERSION // 0
Transaction.DEFAULT_SEQUENCE // 0

// Network
Wallet.MAINNET_API // "https://api.network.hoosat.fi"
Wallet.TESTNET_API // "https://api.testnet.hoosat.fi" (if available)
```

## Best Practices

### 1. Always Validate Inputs

```motoko
import Validation "mo:hoosat-mo/validation";

let validation = Validation.validateAddress(address);
switch (validation) {
  case (#ok(_)) { /* proceed */ };
  case (#err(e)) { /* handle error */ };
};
```

### 2. Use Structured Error Handling

```motoko
import Errors "mo:hoosat-mo/errors";

switch (result) {
  case (#err(#InsufficientFunds(info))) {
    Debug.print("Need: " # debug_show(info.required));
    Debug.print("Have: " # debug_show(info.available));
  };
  case (#err(#NetworkError(msg))) {
    Debug.print("Network issue: " # msg);
  };
  case (#err(error)) {
    Debug.print(Errors.errorToText(error));
  };
  case (#ok(value)) { /* success */ };
};
```

### 3. Reuse Sighash Values

```motoko
import Sighash "mo:hoosat-mo/sighash";

let reusedValues : Sighash.SighashReusedValues = {
  var previousOutputsHash = null;
  var sequencesHash = null;
  var sigOpCountsHash = null;
  var outputsHash = null;
  var payloadHash = null;
};

// Calculate multiple sighashes efficiently
for (i in inputs.keys()) {
  let hash = Sighash.calculateSighashEcdsa(
    tx, i, utxos[i], Sighash.SigHashAll, reusedValues
  );
};
```

### 4. Handle Dust Threshold

```motoko
import Transaction "mo:hoosat-mo/transaction";

let DUST = 1000; // 1,000 sompi minimum

if (changeAmount < DUST) {
  // Add to fee instead of creating change output
  fee += changeAmount;
} else {
  // Create change output
  builder.addChangeOutput(changeAddress);
};
```

## Performance Tips

### Minimize HTTP Outcalls

HTTP outcalls are expensive (cycles). Cache results when possible:

```motoko
private var balanceCache : [(Text, (Nat64, Nat64))] = [];

public func getCachedBalance(addr: Text, ttl: Nat64) : async Nat64 {
  let now = Time.now();
  switch (Array.find(balanceCache, func((a, _)) : Bool { a == addr })) {
    case (?(_, (balance, timestamp))) {
      if (now - timestamp < ttl) {
        return balance;
      };
    };
    case (null) {};
  };

  // Fetch fresh balance
  let result = await wallet.getBalance(addr);
  switch (result) {
    case (#ok(balance)) {
      balanceCache := Array.append(balanceCache, [(addr, (balance, now))]);
      return balance;
    };
    case (#err(_)) { return 0; };
  };
};
```

### Batch Operations

Process multiple operations together:

```motoko
public func checkMultipleBalances(
  addresses: [Text]
) : async [Nat64] {
  let results = Array.init<Nat64>(addresses.size(), 0);

  for (i in addresses.keys()) {
    let result = await wallet.getBalance(addresses[i]);
    switch (result) {
      case (#ok(balance)) { results[i] := balance; };
      case (#err(_)) { results[i] := 0; };
    };
  };

  Array.freeze(results)
};
```

## Next Steps

Explore detailed documentation for each module:

1. **[Wallet Module](./wallet.md)** - High-level wallet operations
2. **[Address Module](./address.md)** - Address generation and validation
3. **[Transaction Module](./transaction.md)** - Transaction building
4. **[Validation Module](./validation.md)** - Input validation
5. **[Error Handling](./errors.md)** - Error types and handling

## Additional Resources

- [GitHub Repository](https://github.com/Hoosat-Oy/Hoosat-mo)
- [Test Suite](https://github.com/Hoosat-Oy/Hoosat-mo/tree/main/test)
- [Examples](../examples/wallet-example.md)
- [Production Guide](../guides/production-deployment.md)
