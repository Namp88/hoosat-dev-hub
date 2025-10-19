---
sidebar_position: 1
slug: /hoosat-mo
---

# Hoosat Motoko Package

**Motoko SDK for Hoosat blockchain on Internet Computer.** Build canister-based wallets, bridges, and DeFi applications with threshold ECDSA signing and secure key management.

## Overview

The Hoosat Motoko Package (`hoosat-mo`) provides a complete, production-ready toolkit for integrating Hoosat blockchain functionality into Internet Computer canisters. Leveraging IC's threshold ECDSA for secure key management, you can build wallets, payment systems, and cross-chain bridges entirely on-chain.

### Package Information

- **Package Name:** `hoosat-mo`
- **Mops Registry:** [mops.one/hoosat-mo](https://mops.one/hoosat-mo)
- **License:** MIT
- **Language:** Motoko
- **Platform:** Internet Computer (DFINITY)

## Key Features

### Core Functionality

- **Address Generation** - Create Schnorr, ECDSA, and P2SH addresses with CashAddr encoding
- **Transaction Building** - Build complete Hoosat transactions with automatic change handling
- **Signature Hash Calculation** - Support for both Schnorr and ECDSA sighash types
- **Transaction Signing** - Integrate with IC's threshold ECDSA for secure signing
- **UTXO Management** - Fetch and manage UTXOs from Hoosat network
- **Transaction Broadcasting** - Submit signed transactions to Hoosat mainnet/testnet

### Advanced Features

- **Wallet Module** - Production-ready wallet with complete transaction lifecycle
- **Personal Message Signing** - Sign arbitrary messages for authentication
- **Validation Module** - Comprehensive input validation and security checks
- **Error Handling** - Structured error types with detailed error messages
- **HTTP Outcalls** - Direct integration with Hoosat API endpoints
- **Derivation Paths** - Support for HD wallet derivation paths

### Production-Ready

- **Threshold ECDSA** - Keys managed by IC consensus, never stored in canisters
- **Network Support** - Mainnet and testnet configurations
- **Type Safety** - Full Motoko type system with no `Any` types
- **Dust Threshold Handling** - Automatic handling of minimum output amounts
- **Fee Estimation** - Configurable fee rates and validation
- **Battle-Tested** - Based on proven Kaspa implementation patterns

## Quick Links

- [Installation](./getting-started/installation.md) - Add to your Motoko project
- [Quick Start](./getting-started/quick-start.md) - Your first Hoosat canister
- [API Reference](./api-reference/address.md) - Complete module documentation
- [Examples](./examples/wallet-example.md) - Working code samples
- [Production Guide](./guides/production-deployment.md) - Deploy to mainnet
- [GitHub Repository](https://github.com/Hoosat-Oy/Hoosat-mo)

## What Can You Build?

### Canister Wallets
Create on-chain wallets with:
- Threshold ECDSA key management
- Automated transaction building
- Balance tracking via HTTP outcalls
- Transaction broadcasting
- Multi-user support

### Cross-Chain Bridges
Build ICP ↔ Hoosat bridges:
- Trustless asset transfers
- Automated transaction verification
- Multi-signature support
- Liquidity management

### DeFi Applications
Develop decentralized finance on IC:
- Payment processing canisters
- Atomic swaps
- Escrow services
- Automated market makers

### Payment Systems
Create payment solutions:
- Merchant payment processing
- Subscription billing
- Invoice generation
- Automated refunds

## Architecture Overview

The package is organized into focused modules:

```
hoosat-mo/
├── address.mo           # Address generation and validation
├── wallet.mo            # Complete wallet functionality
├── transaction.mo       # Transaction building and serialization
├── sighash.mo          # Signature hash calculation
├── validation.mo       # Input validation
├── errors.mo           # Error handling
├── types.mo            # Core data structures
├── personal_message.mo # Message signing
└── utils/              # Utility functions
```

## Example: Build and Send a Transaction

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Result "mo:base/Result";

actor HoosatWallet {
  // Initialize mainnet wallet
  let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");

  // Generate address
  public func getAddress() : async Text {
    let result = await wallet.generateAddress(null, null);
    switch (result) {
      case (#ok(addr)) { addr.address };
      case (#err(e)) { "" };
    };
  };

  // Send transaction
  public func send(to: Text, amount: Nat64) : async ?Text {
    let from = await getAddress();
    let result = await wallet.sendTransaction(from, to, amount, null, null);
    switch (result) {
      case (#ok(tx)) { ?tx.transactionId };
      case (#err(e)) { null };
    };
  };
};
```

## Comparison with Other SDKs

| Feature | Hoosat-mo (Motoko) | hoosat-sdk (Node.js) | hoosat-sdk-web (Browser) |
|---------|-------------------|----------------------|--------------------------|
| **Platform** | Internet Computer | Server-side Node.js | Browser/Web Apps |
| **Key Management** | Threshold ECDSA (IC) | Local private keys | Browser wallet integration |
| **Transaction Signing** | On-chain (IC consensus) | Local signing | MetaMask-style signing |
| **Network Access** | HTTP outcalls | Direct gRPC | REST API |
| **Deployment** | Canister (on-chain) | Server deployment | Client-side |
| **Use Cases** | DeFi, bridges, custody | Wallets, services | dApps, web wallets |
| **Security Model** | Distributed consensus | Single-point key storage | User-controlled keys |

## Why Use Hoosat-mo?

### Security First
- **No Private Key Storage** - Keys managed by IC threshold ECDSA
- **Consensus-Based Signing** - Requires majority of IC subnet nodes
- **Tamper-Proof** - Code immutable once deployed
- **Auditable** - All transactions on-chain and verifiable

### Developer Experience
- **Type Safety** - Motoko's strong type system catches errors at compile-time
- **Integrated Tooling** - Works seamlessly with dfx and IC SDK
- **Comprehensive Documentation** - Detailed guides and examples
- **Production-Ready** - Used in real-world applications

### Cost Effective
- **No Server Costs** - Runs entirely on Internet Computer
- **Pay-Per-Compute** - Cycle-based pricing for actual usage
- **Scalable** - Automatic scaling with IC infrastructure
- **Efficient** - Optimized for minimal cycle consumption

## Internet Computer Integration

Hoosat-mo leverages IC's unique capabilities:

### Threshold ECDSA
```motoko
// Keys are generated by IC consensus
let pubkey = await IC.ecdsa_public_key({
  canister_id = null;
  derivation_path = [myPath];
  key_id = { curve = #secp256k1; name = "dfx_test_key" };
});
```

### HTTP Outcalls
```motoko
// Direct calls to Hoosat API
let response = await IC.http_request({
  url = "https://api.network.hoosat.fi/addresses/hoosat:qp.../utxos";
  method = #get;
  headers = [];
  body = null;
  transform = null;
  max_response_bytes = ?10000;
});
```

### Canister Timers
```motoko
// Scheduled operations
import Timer "mo:base/Timer";

let timerId = Timer.recurringTimer(
  #seconds(3600),
  func() : async () {
    await processScheduledPayments();
  }
);
```

## Next Steps

Ready to build on Internet Computer? Follow these guides:

1. **[Installation](./getting-started/installation.md)** - Set up your development environment
2. **[Quick Start](./getting-started/quick-start.md)** - Deploy your first Hoosat canister
3. **[API Reference](./api-reference/address.md)** - Learn the complete API
4. **[Examples](./examples/wallet-example.md)** - Explore working implementations
5. **[Production Guide](./guides/production-deployment.md)** - Deploy to IC mainnet

## Community & Support

- **GitHub:** [Hoosat-Oy/Hoosat-mo](https://github.com/Hoosat-Oy/Hoosat-mo)
- **Discord:** [discord.gg/mFBfNpNA](https://discord.gg/mFBfNpNA)
- **Telegram:** [t.me/HoosatNetwork](https://t.me/HoosatNetwork)
- **Developer:** [@codecustard](https://github.com/codecustard)

## License

MIT License - see [LICENSE](https://github.com/Hoosat-Oy/Hoosat-mo/blob/main/LICENSE) for details.

Copyright © 2025 Hoosat Oy
