---
sidebar_position: 3
---

# Address Module

Generate, validate, and encode Hoosat addresses.

## Overview

The `address.mo` module handles Hoosat address operations using CashAddr encoding format.

## Address Types

```motoko
import Address "mo:hoosat-mo/address";

Address.SCHNORR  // 0 - 32-byte Schnorr pubkeys
Address.ECDSA    // 1 - 33-byte ECDSA pubkeys
Address.P2SH     // 2 - 32-byte script hashes
```

## Key Functions

### generateAddress

Generate a Hoosat address from a public key.

```motoko
public func generateAddress(
  pubkey: Blob,
  addrType: Nat
) : Result.Result<AddressInfo, HoosatError>
```

**Example:**
```motoko
let pubkeyBlob = Blob.fromArray([0x02, 0xa1, ...]);
let result = Address.generateAddress(pubkeyBlob, Address.ECDSA);

switch (result) {
  case (#ok(info)) {
    Debug.print("Address: " # info.address);
    // "hoosat:qp..."
  };
  case (#err(e)) {
    Debug.print("Error: " # Errors.errorToText(e));
  };
};
```

### decodeAddress

Decode a Hoosat address into type and payload.

```motoko
public func decodeAddress(
  address: Text
) : ?(Nat, [Nat8])
```

**Example:**
```motoko
switch (Address.decodeAddress("hoosat:qp...")) {
  case (?(addrType, payload)) {
    Debug.print("Type: " # debug_show(addrType));
    Debug.print("Payload length: " # debug_show(payload.size()));
  };
  case (null) {
    Debug.print("Invalid address");
  };
};
```

### pubkeyToScript

Convert public key to script public key.

```motoko
public func pubkeyToScript(
  pubkey: [Nat8],
  addrType: Nat
) : Text
```

**Example:**
```motoko
let pubkey = Address.arrayFromHex("02a1b2c3...");
let script = Address.pubkeyToScript(pubkey, Address.ECDSA);
// Returns: "2102a1b2c3...ac"
```

## Utility Functions

### hexFromArray / arrayFromHex

```motoko
// Bytes to hex
let hex = Address.hexFromArray([0xa1, 0xb2, 0xc3]);
// "a1b2c3"

// Hex to bytes
let bytes = Address.arrayFromHex("a1b2c3");
// [0xa1, 0xb2, 0xc3]
```

## Related

- [Wallet Module](./wallet.md)
- [Validation Module](./validation.md)
