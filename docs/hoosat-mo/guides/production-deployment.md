---
sidebar_position: 1
---

# Production Deployment Guide

Complete guide for deploying Hoosat-mo to Internet Computer mainnet.

## Overview

This guide covers security considerations, deployment steps, monitoring, and best practices for production Hoosat applications on IC.

## Security Checklist

### Critical Requirements

- [ ] **Never use `dfx_test_key` in production** - Use production threshold ECDSA keys
- [ ] Security audit completed
- [ ] Key management procedures documented
- [ ] Rate limiting implemented
- [ ] Error handling comprehensive
- [ ] Input validation enabled
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery plan created

### Key Management

```motoko
// ❌ DON'T: Use test key in production
let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");

// ✅ DO: Use production key
let wallet = Wallet.createMainnetWallet("production_key_1", ?"hoosat");
```

Production keys require IC mainnet permissions. Contact DFINITY for access.

## Pre-Production Setup

### 1. Environment Configuration

Create production configuration:

```motoko
module {
  public let PRODUCTION_CONFIG = {
    keyName = "production_hoosat_key";
    apiHost = "api.network.hoosat.fi";
    network = "mainnet";
    maxFee = 1_000_000; // 0.01 HTN max fee
    defaultFeeRate = 1000; // sompi/byte
    dustThreshold = 1000; // minimum output
  };
};
```

### 2. Canister Configuration

Update `dfx.json` for production:

```json
{
  "canisters": {
    "hoosat_wallet": {
      "main": "src/hoosat_wallet/main.mo",
      "type": "motoko",
      "declarations": {
        "output": "src/declarations/hoosat_wallet",
        "bindings": ["js", "ts", "did", "mo"]
      }
    }
  },
  "defaults": {
    "build": {
      "packtool": "mops sources"
    }
  },
  "networks": {
    "ic": {
      "providers": ["https://icp-api.io"],
      "type": "persistent"
    }
  }
}
```

## Deployment Steps

### 1. Prepare Canister

```bash
# Install dependencies
mops install

# Build canister
dfx build --network ic

# Check canister size
dfx canister --network ic info hoosat_wallet
```

### 2. Deploy to IC Mainnet

```bash
# Create production identity
dfx identity new production
dfx identity use production

# Deploy with sufficient cycles (10T for production)
dfx deploy --network ic --with-cycles 10000000000000
```

### 3. Verify Deployment

```bash
# Test address generation
dfx canister --network ic call hoosat_wallet generateAddress '(null, null)'

# Check canister status
dfx canister --network ic status hoosat_wallet
```

## Security Implementation

### Input Validation

Always validate all inputs:

```motoko
import Validation "mo:hoosat-mo/validation";
import Errors "mo:hoosat-mo/errors";

public func safeSend(to: Text, amount: Nat64) : async Result.Result<Text, Errors.HoosatError> {
  // Validate address
  let addrValidation = Validation.validateAddress(to);
  switch (addrValidation) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  // Validate amount
  let amountValidation = Validation.validateAmount(amount);
  switch (amountValidation) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  // Proceed with transaction
  // ...
};
```

### Rate Limiting

Implement per-caller rate limiting:

```motoko
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

private var rateLimits = HashMap.HashMap<Principal, [Int]>(
  10,
  Principal.equal,
  Principal.hash
);

private func checkRateLimit(caller: Principal) : Bool {
  let now = Time.now();
  let window = 60_000_000_000; // 60 seconds in nanoseconds
  let maxRequests = 10;

  let timestamps = switch (rateLimits.get(caller)) {
    case (?ts) { ts };
    case (null) { [] };
  };

  // Filter recent timestamps
  let recent = Array.filter(timestamps, func(t: Int) : Bool {
    now - t < window
  });

  if (recent.size() >= maxRequests) {
    return false; // Rate limit exceeded
  };

  // Add current timestamp
  rateLimits.put(caller, Array.append(recent, [now]));
  return true;
};

public shared(msg) func rateLimitedSend(
  to: Text,
  amount: Nat64
) : async Result.Result<Text, Errors.HoosatError> {
  if (not checkRateLimit(msg.caller)) {
    return #err(#ValidationError("Rate limit exceeded"));
  };

  // Proceed with transaction
  // ...
};
```

### Error Handling

Comprehensive error handling:

```motoko
public func robustSend(
  from: Text,
  to: Text,
  amount: Nat64
) : async Result.Result<TransactionResult, Errors.HoosatError> {
  // Validate inputs
  let _ = switch (Validation.validateAddress(to)) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  // Send with error handling
  let result = await wallet.sendTransaction(from, to, amount, null, null);

  switch (result) {
    case (#err(#NetworkError(msg))) {
      // Log network error for monitoring
      Debug.print("Network error: " # msg);
      // Retry logic here if needed
      return #err(#NetworkError(msg));
    };
    case (#err(#InsufficientFunds(info))) {
      Debug.print("Insufficient funds: need " # debug_show(info.required));
      return #err(#InsufficientFunds(info));
    };
    case (#err(e)) {
      Debug.print("Error: " # Errors.errorToText(e));
      return #err(e);
    };
    case (#ok(tx)) {
      return #ok(tx);
    };
  };
};
```

## Monitoring

### Cycle Management

Monitor canister cycles:

```motoko
import Cycles "mo:base/ExperimentalCycles";

public query func getCyclesBalance() : async Nat {
  return Cycles.balance();
};

public func checkCyclesAndAlert() : async () {
  let balance = Cycles.balance();
  let threshold = 1_000_000_000_000; // 1T cycles

  if (balance < threshold) {
    // Alert mechanism (log, notify, etc.)
    Debug.print("⚠️ Low cycles: " # debug_show(balance));
  };
};
```

### Transaction Logging

Log all transactions:

```motoko
import Array "mo:base/Array";

private stable var txLog : [(Int, Text, Text, Nat64, Bool)] = [];

private func logTransaction(
  from: Text,
  to: Text,
  amount: Nat64,
  success: Bool
) {
  let timestamp = Time.now();
  txLog := Array.append(
    txLog,
    [(timestamp, from, to, amount, success)]
  );

  // Trim old logs if needed
  if (txLog.size() > 10000) {
    txLog := Array.subArray(txLog, txLog.size() - 10000, 10000);
  };
};

public query func getTransactionLog() : async [(Int, Text, Text, Nat64, Bool)] {
  return txLog;
};
```

## Performance Optimization

### Cache Frequently Accessed Data

```motoko
private var addressCache : [(Text, (Text, Int))] = [];

public func getCachedAddress(
  derivation: Text,
  ttl: Int
) : async Text {
  let now = Time.now();

  // Check cache
  switch (Array.find(addressCache, func((d, _)) : Bool { d == derivation })) {
    case (?(_, (addr, timestamp))) {
      if (now - timestamp < ttl) {
        return addr;
      };
    };
    case (null) {};
  };

  // Generate new
  let result = await wallet.generateAddress(null, ?derivation);
  switch (result) {
    case (#ok(info)) {
      addressCache := Array.append(
        addressCache,
        [(derivation, (info.address, now))]
      );
      return info.address;
    };
    case (#err(_)) { return ""; };
  };
};
```

## Emergency Procedures

### Circuit Breaker

```motoko
private stable var emergencyMode = false;
private stable var emergencyReason = "";

public shared(msg) func enableEmergencyMode(reason: Text) : async () {
  // Only admin can enable
  assert(msg.caller == adminPrincipal);

  emergencyMode := true;
  emergencyReason := reason;
  Debug.print("🚨 Emergency mode enabled: " # reason);
};

public shared(msg) func disableEmergencyMode() : async () {
  assert(msg.caller == adminPrincipal);

  emergencyMode := false;
  emergencyReason := "";
  Debug.print("✅ Emergency mode disabled");
};

private func checkEmergencyMode() : Result.Result<(), Errors.HoosatError> {
  if (emergencyMode) {
    return #err(#InternalError("System in emergency mode: " # emergencyReason));
  };
  #ok(())
};
```

## Testing Before Production

### Test on Testnet

```motoko
// Use testnet wallet for testing
let testWallet = Wallet.createTestnetWallet("dfx_test_key", ?"hoosat");

// Test all operations
let addrResult = await testWallet.generateAddress(null, null);
let balResult = await testWallet.getBalance("hoosat:qp...");
let txResult = await testWallet.sendTransaction(from, to, 100000000, null, null);
```

### Load Testing

Test with concurrent requests:

```bash
# Simulate load
for i in {1..100}; do
  dfx canister --network ic call hoosat_wallet getBalance '("hoosat:qp...")' &
done
wait
```

## Deployment Checklist

- [ ] Security audit completed
- [ ] All tests passing
- [ ] Production keys configured
- [ ] Rate limiting implemented
- [ ] Error handling comprehensive
- [ ] Monitoring setup
- [ ] Emergency procedures documented
- [ ] Cycle management automated
- [ ] Backup strategy in place
- [ ] Documentation updated

## Resources

- [Security Best Practices](https://internetcomputer.org/docs/current/developer-docs/security/)
- [Cycle Management](https://internetcomputer.org/docs/current/developer-docs/gas-cost)
- [Threshold ECDSA](https://internetcomputer.org/docs/current/developer-docs/integrations/t-ecdsa/)
- [GitHub Repository](https://github.com/Hoosat-Oy/Hoosat-mo)

## Support

For production support:
- Discord: [discord.gg/mFBfNpNA](https://discord.gg/mFBfNpNA)
- Telegram: [t.me/HoosatNetwork](https://t.me/HoosatNetwork)
- GitHub Issues: [Hoosat-Oy/Hoosat-mo](https://github.com/Hoosat-Oy/Hoosat-mo/issues)
