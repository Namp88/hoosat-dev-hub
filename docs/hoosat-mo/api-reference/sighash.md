---
sidebar_position: 8
---

# Sighash Module

Calculate signature hashes for transaction signing.

## Overview

The `sighash.mo` module calculates signature hashes for both Schnorr and ECDSA signatures.

## Sighash Types

```motoko
import Sighash "mo:hoosat-mo/sighash";

Sighash.SigHashAll                 // 0x01
Sighash.SigHashNone                // 0x02
Sighash.SigHashSingle              // 0x04
Sighash.SigHashAnyOneCanPay        // 0x80
Sighash.SigHashAll_AnyOneCanPay    // 0x81
Sighash.SigHashNone_AnyOneCanPay   // 0x82
Sighash.SigHashSingle_AnyOneCanPay // 0x84
```

## Key Functions

### calculateSighashSchnorr

Calculate Schnorr sighash for a transaction input.

```motoko
public func calculateSighashSchnorr(
  tx: HoosatTransaction,
  inputIndex: Nat,
  utxo: UTXO,
  hashType: SigHashType,
  reusedValues: SighashReusedValues
) : ?[Nat8]
```

### calculateSighashEcdsa

Calculate ECDSA sighash for a transaction input.

```motoko
public func calculateSighashEcdsa(
  tx: HoosatTransaction,
  inputIndex: Nat,
  utxo: UTXO,
  hashType: SigHashType,
  reusedValues: SighashReusedValues
) : ?[Nat8]
```

## Reused Values

For efficiency when signing multiple inputs:

```motoko
let reusedValues : Sighash.SighashReusedValues = {
  var previousOutputsHash = null;
  var sequencesHash = null;
  var sigOpCountsHash = null;
  var outputsHash = null;
  var payloadHash = null;
};

for (i in inputs.keys()) {
  let hash = Sighash.calculateSighashEcdsa(
    tx, i, utxos[i],
    Sighash.SigHashAll,
    reusedValues
  );
};
```

## Related

- [Transaction Module](./transaction.md)
- [Wallet Module](./wallet.md)
