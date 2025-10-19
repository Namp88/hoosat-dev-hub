---
sidebar_position: 9
---

# Personal Message Module

Sign and verify personal messages for authentication.

## Overview

The `personal_message.mo` module provides utilities for signing arbitrary messages, useful for authentication and proof of ownership.

## Functions

### signPersonalMessage

Sign a personal message with a private key.

```motoko
public func signPersonalMessage(
  message: Text,
  privateKey: [Nat8]
) : [Nat8]
```

**Example:**
```motoko
import PersonalMessage "mo:hoosat-mo/personal_message";

let message = "I own this Hoosat address";
let signature = PersonalMessage.signPersonalMessage(message, privateKey);
```

## Use Cases

### Authentication

Prove ownership of a Hoosat address:

```motoko
public func proveOwnership(address: Text) : async Text {
  let message = "Login to MyApp: " # Principal.toText(Principal.fromActor(this));
  // Sign with address's private key
  let signature = PersonalMessage.signPersonalMessage(message, privateKey);
  return PersonalMessage.hexFromArray(signature);
};
```

### Message Verification

Verify a signed message:

```motoko
public func verifyMessage(
  message: Text,
  signature: Text,
  publicKey: Text
) : Bool {
  // Verification logic
  true
};
```

## Related

- [Address Module](./address.md)
- [Wallet Module](./wallet.md)
