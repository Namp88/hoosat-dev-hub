---
sidebar_position: 1
---

# Wallet Example

Complete working example of a Hoosat wallet canister.

## Basic Wallet

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Result "mo:base/Result";
import Errors "mo:hoosat-mo/errors";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

actor HoosatWallet {
  // Initialize wallet
  let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");

  // Store user addresses
  private var userAddresses = HashMap.HashMap<Principal, Text>(
    10,
    Principal.equal,
    Principal.hash
  );

  // Generate address for caller
  public shared(msg) func getMyAddress() : async Text {
    let caller = msg.caller;

    // Check if address already exists
    switch (userAddresses.get(caller)) {
      case (?addr) { return addr; };
      case (null) {
        // Generate new address
        let result = await wallet.generateAddress(null, null);
        switch (result) {
          case (#ok(info)) {
            userAddresses.put(caller, info.address);
            return info.address;
          };
          case (#err(e)) {
            Debug.print("Error: " # Errors.errorToText(e));
            return "";
          };
        };
      };
    };
  };

  // Check balance
  public shared(msg) func getMyBalance() : async Nat64 {
    let addr = await getMyAddress();
    if (addr == "") { return 0; };

    let result = await wallet.getBalance(addr);
    switch (result) {
      case (#ok(balance)) { return balance; };
      case (#err(e)) {
        Debug.print("Error: " # Errors.errorToText(e));
        return 0;
      };
    };
  };

  // Send transaction
  public shared(msg) func send(to: Text, amount: Nat64) : async ?Text {
    let from = await getMyAddress();
    if (from == "") { return null; };

    let result = await wallet.sendTransaction(from, to, amount, null, null);
    switch (result) {
      case (#ok(tx)) {
        Debug.print("TX: " # tx.transactionId);
        return ?tx.transactionId;
      };
      case (#err(e)) {
        Debug.print("Error: " # Errors.errorToText(e));
        return null;
      };
    };
  };
};
```

## Advanced Wallet with Features

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Validation "mo:hoosat-mo/validation";
import Errors "mo:hoosat-mo/errors";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

actor AdvancedWallet {
  let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");

  // Transaction history
  type TxRecord = {
    timestamp: Int;
    from: Text;
    to: Text;
    amount: Nat64;
    txId: Text;
    status: Text;
  };

  private stable var txHistory : [TxRecord] = [];
  private var balanceCache = HashMap.HashMap<Text, (Nat64, Int)>(
    10,
    Text.equal,
    Text.hash
  );

  // Send with validation and logging
  public func safeSend(
    from: Text,
    to: Text,
    amount: Nat64
  ) : async Result.Result<Text, Errors.HoosatError> {
    // Validate recipient
    let addrVal = Validation.validateAddress(to);
    switch (addrVal) {
      case (#err(e)) { return #err(e); };
      case (#ok(_)) {};
    };

    // Validate amount
    if (amount < 1000) {
      return #err(#InvalidAmount("Below dust threshold"));
    };

    // Send transaction
    let result = await wallet.sendTransaction(from, to, amount, null, null);

    switch (result) {
      case (#ok(tx)) {
        // Log transaction
        let record : TxRecord = {
          timestamp = Time.now();
          from = from;
          to = to;
          amount = amount;
          txId = tx.transactionId;
          status = "pending";
        };
        txHistory := Array.append(txHistory, [record]);

        return #ok(tx.transactionId);
      };
      case (#err(e)) {
        return #err(e);
      };
    };
  };

  // Get cached balance
  public func getCachedBalance(addr: Text) : async Nat64 {
    let now = Time.now();
    let ttl = 60_000_000_000; // 60 seconds

    // Check cache
    switch (balanceCache.get(addr)) {
      case (?(balance, timestamp)) {
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
        balanceCache.put(addr, (balance, now));
        return balance;
      };
      case (#err(_)) { return 0; };
    };
  };

  // Get transaction history
  public query func getTxHistory() : async [TxRecord] {
    return txHistory;
  };
};
```

## Testing the Wallet

```bash
# Deploy
dfx deploy

# Generate address
dfx canister call hoosat_wallet getMyAddress

# Check balance
dfx canister call hoosat_wallet getMyBalance

# Send HTN (requires funded address)
dfx canister call hoosat_wallet send '("hoosat:qp...", 100000000)'
```

## Related Examples

- [Internet Identity Integration](https://github.com/Hoosat-Oy/Hoosat-mo/tree/main/examples)
- [Production Guide](../guides/production-deployment.md)
- [API Reference](../api-reference/wallet.md)
