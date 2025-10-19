---
sidebar_position: 1
---

# Installation

This guide will help you set up the Hoosat Motoko package in your Internet Computer project.

## Prerequisites

Before installing Hoosat-mo, ensure you have:

- **DFX SDK** (0.15.0 or higher) - Internet Computer development toolkit
- **Mops** - Motoko package manager
- **Node.js** (18.0 or higher) - For running DFX commands
- **Basic Motoko knowledge** - Familiarity with Motoko syntax

### Install DFX

If you haven't installed DFX yet:

```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

Verify installation:

```bash
dfx --version
# Output: dfx 0.15.0 or higher
```

### Install Mops

Install the Motoko package manager globally:

```bash
npm install -g ic-mops
```

Verify installation:

```bash
mops --version
```

## Installation Methods

### Method 1: Add to Existing Project (Recommended)

If you already have a Motoko project:

1. **Navigate to your project directory:**

```bash
cd your-project
```

2. **Add Hoosat-mo package:**

```bash
mops add hoosat-mo
```

3. **Configure dfx.json:**

Add the following to your `dfx.json` under `defaults.build.packtool`:

```json
{
  "defaults": {
    "build": {
      "packtool": "mops sources"
    }
  }
}
```

4. **Install dependencies:**

```bash
mops install
```

5. **Import in your Motoko code:**

```motoko
import Wallet "mo:hoosat-mo/wallet";
import Address "mo:hoosat-mo/address";
import Transaction "mo:hoosat-mo/transaction";
import Types "mo:hoosat-mo/types";
```

### Method 2: Clone Example Project

Start with a working example:

1. **Clone the repository:**

```bash
git clone https://github.com/Hoosat-Oy/Hoosat-mo.git
cd Hoosat-mo
```

2. **Install dependencies:**

```bash
mops install
```

3. **Start local replica:**

```bash
dfx start --background
```

4. **Deploy the example canister:**

```bash
dfx deploy
```

5. **Test the deployment:**

```bash
dfx canister call hoosat_ecdsa get_hoosat_address '(null)'
```

## Project Structure

After installation, your project should look like:

```
your-project/
├── dfx.json              # DFX configuration
├── mops.toml             # Mops dependencies
├── src/
│   └── your_canister/
│       └── main.mo       # Your canister code
├── .mops/                # Installed packages (auto-generated)
└── node_modules/         # Node dependencies
```

## Dependencies

Hoosat-mo automatically installs these dependencies:

- `base` - Motoko base library
- `blake2b` - Blake2b-256 hashing for Schnorr sighashes
- `sha2` - SHA-256 hashing for ECDSA sighashes
- `json` - JSON parsing for API responses
- `base64` - Base64 encoding utilities

These are managed automatically by Mops.

## Configuration

### Basic dfx.json Configuration

Minimal configuration for Hoosat-mo:

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

### Production Configuration

For production deployment with ECDSA:

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
    },
    "replica": {
      "subnet_type": "system"
    }
  },
  "networks": {
    "local": {
      "bind": "127.0.0.1:4943",
      "type": "ephemeral"
    },
    "ic": {
      "providers": [
        "https://icp-api.io"
      ],
      "type": "persistent"
    }
  },
  "version": 1
}
```

## ECDSA Key Configuration

### Local Development (dfx_test_key)

For local testing, use the test key:

```motoko
let wallet = Wallet.createMainnetWallet("dfx_test_key", ?"hoosat");
```

### Production (IC Mainnet)

For production, use production keys:

```motoko
let wallet = Wallet.createMainnetWallet("key_1", ?"hoosat");
```

**Important:** You need proper permissions for production keys. Contact DFINITY for access.

## Verification

After installation, verify everything works:

### Create a Test File

Create `src/test/main.mo`:

```motoko
import Address "mo:hoosat-mo/address";
import Debug "mo:base/Debug";

actor {
  public func test() : async Text {
    // Test hex conversion
    let hex = "0102030405";
    let bytes = Address.arrayFromHex(hex);
    let result = Address.hexFromArray(bytes);

    Debug.print("Test passed!");
    return result;
  };
};
```

### Deploy and Test

```bash
dfx deploy test
dfx canister call test test
```

Expected output:
```
("0102030405")
```

## Troubleshooting

### Common Issues

#### 1. Mops Not Found

**Error:** `mops: command not found`

**Solution:**
```bash
npm install -g ic-mops
# or
npm i -g ic-mops
```

#### 2. Package Not Found

**Error:** `package hoosat-mo not found`

**Solution:**
```bash
# Ensure mops.toml exists in project root
mops add hoosat-mo
mops install
```

#### 3. DFX Deployment Fails

**Error:** `Cannot find packtool`

**Solution:** Add to `dfx.json`:
```json
{
  "defaults": {
    "build": {
      "packtool": "mops sources"
    }
  }
}
```

#### 4. Import Errors

**Error:** `import error: package "hoosat-mo" not defined`

**Solution:**
```bash
# Reinstall dependencies
mops install
# Clean and rebuild
dfx build --clean
```

#### 5. ECDSA Key Not Available

**Error:** `ecdsa_public_key failed: key not available`

**Solution:**
```bash
# For local development, ensure you're using dfx_test_key
# The key is only available on IC mainnet or local replica with proper setup
```

## Next Steps

Now that you have Hoosat-mo installed, you can:

1. **[Quick Start Guide](./quick-start.md)** - Build your first Hoosat canister
2. **[Address Module](../api-reference/address.md)** - Learn address generation
3. **[Wallet Module](../api-reference/wallet.md)** - Explore wallet functionality
4. **[Examples](../examples/wallet-example.md)** - See working code samples

## Additional Resources

- [DFX Documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Mops Package Manager](https://mops.one/)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [Internet Computer SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install)

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/Hoosat-Oy/Hoosat-mo/issues)
2. Join our [Discord](https://discord.gg/mFBfNpNA)
3. Ask in [Telegram](https://t.me/HoosatNetwork)
4. Review the [test directory](https://github.com/Hoosat-Oy/Hoosat-mo/tree/main/test) for examples
