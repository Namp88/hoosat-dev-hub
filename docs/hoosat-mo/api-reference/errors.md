---
sidebar_position: 5
---

# Error Handling

Comprehensive error types and handling.

## Error Types

```motoko
public type HoosatError = {
  #InvalidAddress: Text;
  #InvalidAmount: Text;
  #InsufficientFunds: {
    available: Nat64;
    required: Nat64;
  };
  #NetworkError: Text;
  #SigningError: Text;
  #ValidationError: Text;
  #InternalError: Text;
};
```

## Error Messages

Convert errors to human-readable text:

```motoko
import Errors "mo:hoosat-mo/errors";

let errorText = Errors.errorToText(error);
Debug.print("Error: " # errorText);
```

## Error Handling Patterns

### Pattern 1: Switch on Error Type

```motoko
let result = await wallet.sendTransaction(from, to, amount, null, null);

switch (result) {
  case (#ok(tx)) {
    Debug.print("Success: " # tx.transactionId);
  };
  case (#err(#InsufficientFunds(info))) {
    Debug.print("Need: " # debug_show(info.required));
    Debug.print("Have: " # debug_show(info.available));
  };
  case (#err(#InvalidAddress(msg))) {
    Debug.print("Bad address: " # msg);
  };
  case (#err(#NetworkError(msg))) {
    Debug.print("Network: " # msg);
  };
  case (#err(e)) {
    Debug.print("Other: " # Errors.errorToText(e));
  };
};
```

### Pattern 2: Early Return

```motoko
public func validateAndSend() : async Result.Result<Text, HoosatError> {
  let addrResult = Validation.validateAddress(to);
  switch (addrResult) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  let amountResult = Validation.validateAmount(amount);
  switch (amountResult) {
    case (#err(e)) { return #err(e); };
    case (#ok(_)) {};
  };

  await wallet.sendTransaction(from, to, amount, null, null)
};
```

## Related

- [Validation Module](./validation.md)
- [Wallet Module](./wallet.md)
