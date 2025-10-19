---
sidebar_position: 2
---

# Wallet Module

The `wallet.mo` module provides production-ready wallet functionality with complete transaction lifecycle management.

## Overview

The Wallet module is the highest-level module in Hoosat-mo, providing a complete wallet implementation with:

- Address generation using IC threshold ECDSA
- Balance checking via HTTP outcalls
- UTXO fetching and management
- Transaction building, signing, and broadcasting
- Automatic fee calculation and change handling
- Comprehensive error handling

## Factory Functions

### createMainnetWallet

Creates a wallet instance for Hoosat mainnet.

```motoko
public func createMainnetWallet(
  keyName: Text,
  prefix: ?Text
) : WalletInstance
```

**Parameters:**
- `keyName`: ECDSA key identifier (e.g., `"dfx_test_key"` for local, `"key_1"` for production)
- `prefix`: Optional address prefix (default: `"hoosat"`)

**Returns:** `WalletInstance` object with all wallet methods

**Example:**
```motoko
let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");
```

### createTestnetWallet

Creates a wallet instance for Hoosat testnet.

```motoko
public func createTestnetWallet(
  keyName: Text,
  prefix: ?Text
) : WalletInstance
```

**Parameters:** Same as `createMainnetWallet`

**Example:**
```motoko
let wallet = Wallet.createTestnetWallet("dfx_test_key", ?"hoosat");
```

## WalletInstance Methods

### generateAddress

Generates a new Hoosat address using IC threshold ECDSA.

```motoko
public func generateAddress(
  addressType: ?Nat,
  derivationPath: ?Text
) : async Result.Result<AddressInfo, HoosatError>
```

**Parameters:**
- `addressType`: Optional address type (`null` = ECDSA, `0` = Schnorr, `1` = ECDSA, `2` = P2SH)
- `derivationPath`: Optional BIP44 derivation path (e.g., `"44'/111111'/0'/0/0"`)

**Returns:** `#ok(AddressInfo)` or `#err(HoosatError)`

**AddressInfo Type:**
```motoko
{
  address: Text;          // Generated Hoosat address
  publicKey: Text;        // Hex-encoded public key
  addressType: Nat;       // Address type used
  scriptPublicKey: Text;  // Hex-encoded script pubkey
}
```

**Example:**
```motoko
let result = await wallet.generateAddress(null, null);
switch (result) {
  case (#ok(info)) {
    Debug.print("Address: " # info.address);
    Debug.print("PubKey: " # info.publicKey);
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

### getBalance

Fetches the balance for a Hoosat address.

```motoko
public func getBalance(
  address: Text
) : async Result.Result<Nat64, HoosatError>
```

**Parameters:**
- `address`: Hoosat address to check

**Returns:** Balance in sompi (1 HTN = 100,000,000 sompi)

**Example:**
```motoko
let result = await wallet.getBalance("hoosat:qp...");
switch (result) {
  case (#ok(balance)) {
    let htn = Float.fromInt64(Int64.fromNat64(balance)) / 100000000.0;
    Debug.print("Balance: " # Float.toText(htn) # " HTN");
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

### sendTransaction

Complete transaction lifecycle: build, sign, and broadcast.

```motoko
public func sendTransaction(
  fromAddress: Text,
  toAddress: Text,
  amount: Nat64,
  fee: ?Nat64,
  derivationPath: ?Text
) : async Result.Result<TransactionResult, HoosatError>
```

**Parameters:**
- `fromAddress`: Sender's Hoosat address
- `toAddress`: Recipient's Hoosat address
- `amount`: Amount to send in sompi
- `fee`: Optional fee in sompi (auto-calculated if `null`)
- `derivationPath`: Optional derivation path for signing

**Returns:** `#ok(TransactionResult)` or `#err(HoosatError)`

**TransactionResult Type:**
```motoko
{
  transactionId: Text;     // Network transaction ID
  serializedTx: Text;      // Hex-encoded signed transaction
  fee: Nat64;              // Actual fee used
  changeAmount: Nat64;     // Change returned to sender
}
```

**Example:**
```motoko
let result = await wallet.sendTransaction(
  "hoosat:qp...sender",
  "hoosat:qp...recipient",
  100000000, // 1 HTN
  null,      // Auto-calculate fee
  null       // Default derivation
);

switch (result) {
  case (#ok(tx)) {
    Debug.print("TX ID: " # tx.transactionId);
    Debug.print("Fee: " # debug_show(tx.fee) # " sompi");
  };
  case (#err(#InsufficientFunds(info))) {
    Debug.print("Need " # debug_show(info.required) # " sompi");
    Debug.print("Have " # debug_show(info.available) # " sompi");
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

### buildTransaction

Builds and signs a transaction without broadcasting.

```motoko
public func buildTransaction(
  fromAddress: Text,
  toAddress: Text,
  amount: Nat64,
  fee: ?Nat64,
  derivationPath: ?Text
) : async Result.Result<BuildResult, HoosatError>
```

**Parameters:** Same as `sendTransaction`

**Returns:** `#ok(BuildResult)` or `#err(HoosatError)`

**BuildResult Type:**
```motoko
{
  serializedTx: Text;   // Hex-encoded signed transaction
  fee: Nat64;           // Fee amount
  changeAmount: Nat64;  // Change amount
}
```

**Example:**
```motoko
let result = await wallet.buildTransaction(from, to, amount, null, null);
switch (result) {
  case (#ok(built)) {
    // Inspect or modify before broadcasting
    Debug.print("Signed TX: " # built.serializedTx);

    // Broadcast later
    let txId = await wallet.broadcastSerializedTransaction(built.serializedTx);
  };
  case (#err(e)) {
    Debug.print("Build failed: " # Errors.errorToText(e));
  };
};
```

### getUTXOs

Fetches all UTXOs for an address.

```motoko
public func getUTXOs(
  address: Text
) : async Result.Result<[UTXO], HoosatError>
```

**Parameters:**
- `address`: Hoosat address

**Returns:** Array of UTXOs

**Example:**
```motoko
let result = await wallet.getUTXOs("hoosat:qp...");
switch (result) {
  case (#ok(utxos)) {
    Debug.print("UTXOs: " # debug_show(utxos.size()));
    for (utxo in utxos.vals()) {
      Debug.print("Amount: " # debug_show(utxo.amount));
    };
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

### broadcastSerializedTransaction

Broadcasts a pre-built transaction to the network.

```motoko
public func broadcastSerializedTransaction(
  serializedTx: Text
) : async Result.Result<Text, HoosatError>
```

**Parameters:**
- `serializedTx`: Hex-encoded signed transaction

**Returns:** Transaction ID

**Example:**
```motoko
let txId = await wallet.broadcastSerializedTransaction(signedTxHex);
switch (txId) {
  case (#ok(id)) {
    Debug.print("Broadcasted: " # id);
  };
  case (#err(e)) {
    Debug.print("Broadcast failed: " # Errors.errorToText(e));
  };
};
```

### getTransactionStatus

Checks transaction confirmation status.

```motoko
public func getTransactionStatus(
  txId: Text
) : async Result.Result<TxStatus, HoosatError>
```

**Parameters:**
- `txId`: Transaction ID to check

**Returns:** Transaction status

**TxStatus Type:**
```motoko
{
  status: Text;           // "confirmed", "pending", or "not_found"
  confirmations: Nat;     // Number of confirmations
}
```

**Example:**
```motoko
let result = await wallet.getTransactionStatus(txId);
switch (result) {
  case (#ok(status)) {
    Debug.print("Status: " # status.status);
    Debug.print("Confirmations: " # debug_show(status.confirmations));
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

## Complete Example

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Result "mo:base/Result";
import Errors "mo:hoosat-mo/errors";
import Debug "mo:base/Debug";

actor CompleteWallet {
  let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");

  public func createAndFundWallet() : async ?Text {
    // 1. Generate address
    let addrResult = await wallet.generateAddress(null, null);
    let address = switch (addrResult) {
      case (#ok(info)) { info.address };
      case (#err(e)) {
        Debug.print("Failed to generate address: " # Errors.errorToText(e));
        return null;
      };
    };

    Debug.print("Generated address: " # address);

    // 2. Check balance
    let balResult = await wallet.getBalance(address);
    let balance = switch (balResult) {
      case (#ok(bal)) { bal };
      case (#err(e)) {
        Debug.print("Failed to get balance: " # Errors.errorToText(e));
        return null;
      };
    };

    Debug.print("Balance: " # debug_show(balance) # " sompi");

    if (balance < 200000000) {
      Debug.print("Insufficient balance. Please fund: " # address);
      return null;
    };

    // 3. Send transaction
    let txResult = await wallet.sendTransaction(
      address,
      "hoosat:qp..recipient..",
      100000000, // 1 HTN
      null,
      null
    );

    switch (txResult) {
      case (#ok(tx)) {
        Debug.print("Transaction sent!");
        Debug.print("TX ID: " # tx.transactionId);
        Debug.print("Fee: " # debug_show(tx.fee));
        Debug.print("Change: " # debug_show(tx.changeAmount));
        return ?tx.transactionId;
      };
      case (#err(e)) {
        Debug.print("Transaction failed: " # Errors.errorToText(e));
        return null;
      };
    };
  };
};
```

## Best Practices

See the [Production Guide](../guides/production-deployment.md) for deployment best practices.

## Related

- [Address Module](./address.md)
- [Transaction Module](./transaction.md)
- [Error Handling](./errors.md)
- [Examples](../examples/wallet-example.md)
