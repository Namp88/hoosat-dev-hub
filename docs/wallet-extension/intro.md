---
sidebar_position: 1
---

# Hoosat Wallet Extension

A secure, non-custodial browser extension wallet for the Hoosat blockchain with full dApp integration support.

## Overview

Hoosat Wallet Extension is a powerful browser extension that allows you to securely manage your HTN (Hoosat) tokens directly from your browser. Built with TypeScript and powered by [hoosat-sdk-web](https://www.npmjs.com/package/hoosat-sdk-web), it provides a seamless interface for interacting with the Hoosat blockchain and decentralized applications.

## Key Features

### Security
- **AES-256 Encryption** - Military-grade private key encryption
- **Password Protection** - Strong password requirements enforced
- **Auto-lock** - Automatic wallet locking after 30 minutes of inactivity
- **Grace Period** - 2-minute grace period for quick re-access
- **Message Signing** - ECDSA signatures with BLAKE3 hashing
- **No Analytics** - Zero data collection or tracking

### Wallet Management
- **Create Wallet** - Generate new wallets with secure random keys
- **Import Wallet** - Import existing wallets via private key
- **Password Management** - Change password with validation
- **Private Key Export** - Secure key backup with password verification

### Transactions
- **Send HTN** - Easy transaction creation with fee customization
- **Receive HTN** - Generate QR codes for receiving payments
- **Fee Estimation** - Automatic and manual fee control
- **Balance Display** - Real-time balance updates
- **Custom Fees** - Adjust transaction fees (with warnings for high fees)

### DApp Integration
- **Connection Management** - Approve/reject dApp connections
- **Connected Sites** - View and manage connected dApps
- **Transaction Signing** - Approve transactions from dApps
- **Message Signing** - Sign messages for authentication and off-chain actions
- **Real-time Requests** - Instant notification when dApps make requests
- **Request Timestamps** - Track when requests were made (with warnings for old requests)

### User Experience
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Compact Design** - Optimized spacing and layout
- **Hover States** - Visual feedback on all interactive elements
- **Loading States** - Clear indication of ongoing operations
- **Error Handling** - User-friendly error messages
- **Responsive Design** - Works seamlessly in popup window

## Installation

### From Chrome Web Store

*Coming soon - Extension is currently under review*

### Manual Installation (Developer Mode)

1. Download the latest release from [GitHub Releases](https://github.com/Namp88/hoosat-web-extension/releases)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (top right corner)
5. Click "Load unpacked"
6. Select the extracted `dist` folder

## Quick Start

### First Time Setup

1. Click the Hoosat Wallet icon in your browser toolbar
2. Choose "Create New Wallet" or "Import Wallet"
3. Set a strong password (min 8 characters, uppercase, lowercase, number)
4. **IMPORTANT**: Save your private key in a secure location
5. Your wallet is ready to use!

### Sending HTN

1. Open the extension
2. Click "Send"
3. Enter recipient address
4. Enter amount in HTN
5. Review fee (or customize)
6. Click "Send" and confirm

### Receiving HTN

1. Open the extension
2. Click "Receive"
3. Share your address or QR code

### Connecting to dApps

1. Visit a Hoosat dApp
2. Click "Connect Wallet"
3. Extension popup will appear
4. Review connection request
5. Click "Connect" to approve

## Architecture

```
┌─────────────────────────┐
│   Browser Extension     │
│   ┌─────────────────┐   │
│   │     Popup       │   │  User Interface
│   │  (HTML/TS/CSS)  │   │
│   └────────┬────────┘   │
│            │             │
│   ┌────────▼────────┐   │
│   │   Background    │   │  Business Logic
│   │   Service       │   │  - Wallet Manager
│   │   Worker        │   │  - Session Manager
│   └────────┬────────┘   │  - RPC Handlers
│            │             │
└────────────┼─────────────┘
             │
    ┌────────▼────────┐
    │ Content Script  │      Injected into web pages
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ window.hoosat   │      Provider API for dApps
    └─────────────────┘
```

### Components

**Popup (UI Layer)**
- User interface for wallet operations
- Transaction approval screens
- Connection management
- Settings and configuration

**Background Service Worker**
- Wallet encryption/decryption
- Transaction signing
- Session management
- Auto-lock functionality
- RPC request handling

**Content Script**
- Bridge between web pages and extension
- Message passing
- Request/response routing

**Injected Provider**
- `window.hoosat` object injected into web pages
- Web3-like API for dApps
- Event system for notifications

## Security Model

### Encryption

Private keys are encrypted using AES-256-GCM with password-derived keys:

```typescript
// Key derivation
PBKDF2(password, salt, 100,000 iterations, SHA-256)

// Encryption
AES-256-GCM(privateKey, derivedKey, randomIV)
```

### Session Management

- **Auto-lock**: Wallet automatically locks after 30 minutes of inactivity
- **Grace Period**: 2-minute grace period for quick re-access without password
- **Activity Tracking**: Extension tracks user interactions to manage session state

### Message Signing

Messages are signed using ECDSA with secp256k1 curve:

1. **Message Prefixing**: Prevents transaction replay attacks
   ```
   "Hoosat Signed Message:\n" + message
   ```

2. **BLAKE3 Hashing**: Fast, secure cryptographic hashing
   ```
   hash = BLAKE3(prefixedMessage)
   ```

3. **ECDSA Signature**: secp256k1 curve (same as Bitcoin/Ethereum)
   ```
   signature = sign(hash, privateKey)
   ```

## Use Cases

### For Users

**Wallet Management**
- Store and manage HTN tokens securely
- Send and receive payments easily
- Monitor balance in real-time
- Export private keys for backup

**DApp Integration**
- Connect to Hoosat dApps seamlessly
- Approve transactions with one click
- Sign messages for authentication
- Manage connected sites

### For Developers

**dApp Authentication**
- Implement "Sign in with Hoosat"
- Verify user ownership of addresses
- Create signed session tokens
- Build passwordless authentication

**Transaction Integration**
- Request payments from users
- Build marketplace applications
- Create NFT platforms
- Implement token swaps

**Message Signing**
- DAO governance voting
- Off-chain signatures
- Proof of ownership
- Marketplace listings

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Edge | ✅ Full | Chromium-based |
| Brave | ✅ Full | Chromium-based |
| Opera | ✅ Full | Chromium-based |
| Firefox | ⏳ Planned | Manifest V3 port needed |
| Safari | ⏳ Planned | Extension API differences |

## Limitations

**Current Version (v0.3.0)**
- Single account support (multi-account planned)
- No transaction history viewer (planned)
- No address book (planned)
- Chrome/Chromium only (Firefox/Safari planned)

## Security Best Practices

⚠️ **IMPORTANT SECURITY NOTES:**

1. **NEVER share your private key** with anyone
2. **BACKUP your private key** in a secure, offline location
3. **Use a strong, unique password** to encrypt your wallet
4. **Keep your password safe** - it cannot be recovered if lost
5. **Verify all transactions** and messages before signing
6. **Check dApp origin** - Only connect to websites you trust
7. **Review connected sites** regularly in Settings
8. **Be cautious of old requests** - Look for timestamp warnings

## Password Requirements

The extension enforces strong password requirements:

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Example strong passwords:**
- ✅ `MyWallet123`
- ✅ `Hoosat2024!`
- ✅ `SecurePass99`

**Weak passwords (rejected):**
- ❌ `password` (no uppercase, no numbers)
- ❌ `12345678` (no letters)
- ❌ `MyWallet` (no numbers)

## Next Steps

- [DApp Integration Guide](./dapp-integration.md) - Integrate your dApp with Hoosat Wallet
- [User Guide](./user-guide.md) - Complete user manual

## Links

- **GitHub**: https://github.com/Namp88/hoosat-web-extension
- **Chrome Web Store**: Coming soon
- **NPM (SDK)**: https://www.npmjs.com/package/hoosat-sdk-web
- **Support**: [GitHub Issues](https://github.com/Namp88/hoosat-web-extension/issues)

## License

MIT License - see [LICENSE](https://github.com/Namp88/hoosat-web-extension/blob/main/LICENSE) for details.

## Disclaimer

⚠️ This wallet is provided "as is" without warranty of any kind. Always do your own research and use at your own risk. Never invest more than you can afford to lose.

**Security Notes:**
- This is beta software - use at your own risk
- Always backup your private keys
- Test with small amounts first
- Verify all transactions before confirming

---

Made with ❤️ for the Hoosat community

**Version 0.3.0**
