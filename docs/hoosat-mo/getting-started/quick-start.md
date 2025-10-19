---
sidebar_position: 2
---

# Quick Start

Build your first Hoosat canister in minutes. This guide walks you through creating a simple wallet canister that can generate addresses, check balances, and send transactions.

## Prerequisites

Before you begin, make sure you have:

- Completed the [Installation](./installation.md) guide
- DFX and Mops installed
- Basic understanding of Motoko

## Project Setup

### 1. Create a New Project

```bash
# Create project directory
mkdir my-hoosat-wallet
cd my-hoosat-wallet

# Initialize DFX project
dfx new hoosat_wallet --type motoko
cd hoosat_wallet

# Initialize Mops
mops init
```

### 2. Install Hoosat-mo

```bash
mops add hoosat-mo
```

### 3. Configure dfx.json

Update your `dfx.json`:

```json
{
  "canisters": {
    "hoosat_wallet": {
      "main": "src/hoosat_wallet/main.mo",
      "type": "motoko"
    }
  },
  "defaults": {
    "build": {
      "packtool": "mops sources"
    }
  },
  "version": 1
}
```

## Your First Hoosat Canister

### Create the Wallet Canister

Replace the contents of `src/hoosat_wallet/main.mo`:

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Result "mo:base/Result";
import Errors "mo:hoosat-mo/errors";
import Debug "mo:base/Debug";

actor HoosatWallet {
  // Initialize mainnet wallet with dfx_test_key
  let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");

  // Store our address
  private var myAddress : Text = "";

  // Generate and store Hoosat address
  public func initWallet() : async Text {
    let result = await wallet.generateAddress(null, null);
    switch (result) {
      case (#ok(addr)) {
        myAddress := addr.address;
        Debug.print("Address generated: " # addr.address);
        return addr.address;
      };
      case (#err(e)) {
        let errorMsg = Errors.errorToText(e);
        Debug.print("Error: " # errorMsg);
        return "Error: " # errorMsg;
      };
    };
  };

  // Get current wallet address
  public query func getAddress() : async Text {
    return myAddress;
  };

  // Check balance for our address
  public func getBalance() : async Nat64 {
    if (myAddress == "") {
      return 0;
    };

    let result = await wallet.getBalance(myAddress);
    switch (result) {
      case (#ok(balance)) {
        Debug.print("Balance: " # debug_show(balance) # " sompi");
        return balance;
      };
      case (#err(e)) {
        Debug.print("Error getting balance: " # Errors.errorToText(e));
        return 0;
      };
    };
  };

  // Send transaction
  public func sendHoosat(to: Text, amount: Nat64) : async ?Text {
    if (myAddress == "") {
      Debug.print("Error: Wallet not initialized");
      return null;
    };

    let result = await wallet.sendTransaction(
      myAddress,
      to,
      amount,
      null, // Use default fee
      null  // Use default derivation path
    );

    switch (result) {
      case (#ok(tx)) {
        Debug.print("Transaction sent: " # tx.transactionId);
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

## Deploy and Test

### 1. Start Local Replica

```bash
dfx start --background
```

### 2. Deploy the Canister

```bash
dfx deploy
```

You should see output like:
```
Deploying: hoosat_wallet
...
Deployed canisters.
URLs:
  hoosat_wallet: http://127.0.0.1:4943/?canisterId=xxxxx-xxxxx-xxxxx-xxxxx-xxx
```

### 3. Test the Canister

#### Generate an Address

```bash
dfx canister call hoosat_wallet initWallet
```

Expected output:
```
("hoosat:qpxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
```

#### Get the Address

```bash
dfx canister call hoosat_wallet getAddress
```

Expected output:
```
("hoosat:qpxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
```

#### Check Balance

```bash
dfx canister call hoosat_wallet getBalance
```

Expected output (for new address):
```
(0 : nat64)
```

#### Send a Transaction (requires funded address)

```bash
dfx canister call hoosat_wallet sendHoosat '("hoosat:qprecipient_address_here", 100000000)'
```

## Understanding the Code

### Wallet Initialization

```motoko
let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");
```

- Creates a wallet instance for Hoosat mainnet
- Uses `dfx_test_key` for ECDSA operations (local development)
- Optional prefix `"hoosat"` for address generation

### Address Generation

```motoko
let result = await wallet.generateAddress(null, null);
```

- Generates ECDSA address using IC's threshold ECDSA
- First `null`: use default address type (ECDSA)
- Second `null`: use default derivation path

### Balance Checking

```motoko
let result = await wallet.getBalance(myAddress);
```

- Fetches balance via HTTP outcall to Hoosat API
- Returns balance in sompi (smallest unit)
- 1 HTN = 100,000,000 sompi

### Sending Transactions

```motoko
let result = await wallet.sendTransaction(
  myAddress,  // From address
  to,         // Recipient address
  amount,     // Amount in sompi
  null,       // Optional fee (auto-calculated if null)
  null        // Optional derivation path
);
```

- Builds, signs, and broadcasts transaction
- Returns transaction ID on success
- Handles errors gracefully

## Next: Advanced Features

### Add Balance Formatting

```motoko
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";

public query func getBalanceFormatted() : async Text {
  if (myAddress == "") {
    return "0 HTN";
  };

  let result = await wallet.getBalance(myAddress);
  switch (result) {
    case (#ok(balance)) {
      // Convert sompi to HTN (1 HTN = 100,000,000 sompi)
      let htn = Float.fromInt64(Int64.fromNat64(balance)) / 100000000.0;
      return Float.toText(htn) # " HTN";
    };
    case (#err(_)) {
      return "Error fetching balance";
    };
  };
};
```

### Add Transaction History Storage

```motoko
import Array "mo:base/Array";

private stable var transactions : [(Text, Nat64, Text)] = [];

public func sendHoosatWithHistory(to: Text, amount: Nat64) : async ?Text {
  let result = await sendHoosat(to, amount);
  switch (result) {
    case (?txId) {
      // Store transaction history
      transactions := Array.append(
        transactions,
        [(to, amount, txId)]
      );
      return ?txId;
    };
    case (null) {
      return null;
    };
  };
};

public query func getTransactionHistory() : async [(Text, Nat64, Text)] {
  return transactions;
};
```

### Add Multiple Address Support

```motoko
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Hash "mo:base/Hash";

private var addresses = HashMap.HashMap<Principal, Text>(
  10,
  Principal.equal,
  Principal.hash
);

public shared(msg) func getMyAddress() : async Text {
  let caller = msg.caller;

  switch (addresses.get(caller)) {
    case (?addr) {
      return addr;
    };
    case (null) {
      // Generate new address for this caller
      let result = await wallet.generateAddress(null, null);
      switch (result) {
        case (#ok(addr)) {
          addresses.put(caller, addr.address);
          return addr.address;
        };
        case (#err(_)) {
          return "";
        };
      };
    };
  };
};
```

## Testing with Candid UI

After deployment, you can test via the Candid web interface:

1. **Open Candid UI:**
   ```bash
   # Get the canister URL
   dfx canister call hoosat_wallet --query http_request
   ```
   Or visit: `http://127.0.0.1:4943/?canisterId=YOUR_CANISTER_ID`

2. **Test Functions:**
   - Click `initWallet` to generate address
   - Click `getAddress` to view address
   - Click `getBalance` to check balance
   - Use `sendHoosat` with parameters to send transactions

## Common Patterns

### Error Handling

```motoko
public func safeOperation() : async Result.Result<Text, Errors.HoosatError> {
  let result = await wallet.generateAddress(null, null);
  switch (result) {
    case (#ok(addr)) {
      return #ok(addr.address);
    };
    case (#err(e)) {
      // Log error and return
      Debug.print("Error: " # Errors.errorToText(e));
      return #err(e);
    };
  };
};
```

### Validation Before Sending

```motoko
import Validation "mo:hoosat-mo/validation";

public func safeSend(to: Text, amount: Nat64) : async ?Text {
  // Validate recipient address
  let addrValidation = Validation.validateAddress(to);
  switch (addrValidation) {
    case (#err(e)) {
      Debug.print("Invalid address: " # Errors.errorToText(e));
      return null;
    };
    case (#ok(_)) {
      // Validate amount
      if (amount < 1000) {
        Debug.print("Amount too small (dust threshold)");
        return null;
      };

      // Send transaction
      return await sendHoosat(to, amount);
    };
  };
};
```

## Next Steps

Now that you have a basic wallet, explore:

1. **[Address Module](../api-reference/address.md)** - Learn about different address types
2. **[Wallet Module](../api-reference/wallet.md)** - Explore all wallet features
3. **[Production Guide](../guides/production-deployment.md)** - Deploy to IC mainnet
4. **[Examples](../examples/wallet-example.md)** - See more complex implementations

## Troubleshooting

### Address Generation Fails

**Issue:** `ecdsa_public_key failed`

**Solution:**
- Ensure you're using `dfx_test_key` for local development
- For IC mainnet, you need production key access
- Check that your canister has sufficient cycles

### Balance Always Returns 0

**Issue:** Balance is 0 for new addresses

**Solution:**
- New addresses have no balance until funded
- Send HTN to the address using a wallet or faucet
- Verify address format is correct

### Transaction Fails

**Issue:** `sendHoosat` returns null

**Solution:**
- Ensure address has sufficient balance
- Check recipient address format
- Verify amount is above dust threshold (1000 sompi)
- Ensure wallet is initialized

## Resources

- [Full API Reference](../api-reference/address.md)
- [GitHub Repository](https://github.com/Hoosat-Oy/Hoosat-mo)
- [Discord Community](https://discord.gg/mFBfNpNA)
- [Hoosat Network](https://network.hoosat.fi)
