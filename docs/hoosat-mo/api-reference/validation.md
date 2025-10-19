---
sidebar_position: 4
---

# Validation Module

Comprehensive input validation for security.

## Overview

The `validation.mo` module provides security-focused validation for all Hoosat operations.

## Functions

### validateAddress

Validate Hoosat address format and checksum.

```motoko
public func validateAddress(
  address: Text
) : Result.Result<AddressInfo, HoosatError>
```

**Example:**
```motoko
import Validation "mo:hoosat-mo/validation";

let result = Validation.validateAddress("hoosat:qp...");
switch (result) {
  case (#ok(info)) {
    Debug.print("Valid address, type: " # debug_show(info.addressType));
  };
  case (#err(#InvalidAddress(msg))) {
    Debug.print("Invalid: " # msg);
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

### validateAmount

Validate transaction amounts.

```motoko
public func validateAmount(
  amount: Nat64
) : Result.Result<(), HoosatError>
```

**Checks:**
- Amount > 0
- Amount >= dust threshold (1000 sompi)
- Amount < max value

**Example:**
```motoko
switch (Validation.validateAmount(100000000)) {
  case (#ok(())) { /* Valid amount */ };
  case (#err(#InvalidAmount(msg))) {
    Debug.print("Invalid: " # msg);
  };
  case (#err(e)) { /* Other error */ };
};
```

### validateFee

Validate fee amounts.

```motoko
public func validateFee(
  fee: Nat64,
  maxFee: Nat64
) : Result.Result<(), HoosatError>
```

**Example:**
```motoko
let fee = 10000; // 0.0001 HTN
let maxFee = 1000000; // 0.01 HTN max

switch (Validation.validateFee(fee, maxFee)) {
  case (#ok(())) { /* Valid fee */ };
  case (#err(e)) { /* Error */ };
};
```

## Best Practices

Always validate before operations:

```motoko
public func safeSend(to: Text, amount: Nat64) : async Result.Result<Text, HoosatError> {
  // Validate address
  let _ = switch (Validation.validateAddress(to)) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  // Validate amount
  let _ = switch (Validation.validateAmount(amount)) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  // Proceed with transaction
  // ...
};
```

## Related

- [Error Handling](./errors.md)
- [Wallet Module](./wallet.md)
