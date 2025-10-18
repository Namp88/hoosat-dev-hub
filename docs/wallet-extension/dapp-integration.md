---
sidebar_position: 2
---

# DApp Integration Guide

Complete guide for integrating your decentralized application with Hoosat Wallet Extension.

## Quick Start

### Detection

First, check if Hoosat Wallet is installed and available:

```javascript
// Check if Hoosat Wallet is installed
if (window.hoosat) {
  console.log('✅ Hoosat Wallet detected!');
} else {
  console.log('❌ Hoosat Wallet not found');
  // Show installation prompt to user
}
```

### Wait for Provider Initialization

The provider emits an event when it's ready:

```javascript
// Wait for provider initialization
window.addEventListener('hoosat#initialized', () => {
  console.log('🚀 Hoosat provider ready');
  // Safe to use window.hoosat now
});
```

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Hoosat DApp</title>
</head>
<body>
  <h1>Hoosat DApp Example</h1>

  <div id="status">Checking for wallet...</div>
  <button id="connect" style="display:none">Connect Wallet</button>
  <div id="account" style="display:none"></div>

  <script>
    async function init() {
      // Check if wallet exists
      if (!window.hoosat) {
        document.getElementById('status').textContent =
          'Please install Hoosat Wallet Extension';
        return;
      }

      document.getElementById('status').textContent = 'Wallet found!';
      document.getElementById('connect').style.display = 'block';

      // Setup connect button
      document.getElementById('connect').onclick = async () => {
        try {
          const accounts = await window.hoosat.requestAccounts();
          document.getElementById('connect').style.display = 'none';
          document.getElementById('account').style.display = 'block';
          document.getElementById('account').textContent =
            `Connected: ${accounts[0]}`;
        } catch (error) {
          console.error('Connection rejected:', error);
        }
      };
    }

    // Wait for provider
    window.addEventListener('hoosat#initialized', init);

    // Or if provider is already loaded
    if (window.hoosat) init();
  </script>
</body>
</html>
```

## API Reference

### Provider Object

The `window.hoosat` object provides the following interface:

```typescript
interface HoosatProvider {
  // Properties
  isHoosat: boolean;          // Always true
  isConnected: boolean;       // Connection status

  // Connection
  requestAccounts(): Promise<string[]>;
  connect(): Promise<string[]>;  // Alias for requestAccounts
  getAccounts(): Promise<string[]>;

  // Blockchain Queries
  getBalance(address: string): Promise<string>;
  getNetwork(): Promise<string>;

  // Transactions & Signing
  sendTransaction(params: TransactionParams): Promise<string>;
  signMessage(message: string): Promise<string>;

  // Events (future)
  on(event: string, callback: Function): void;
  removeListener(event: string, callback: Function): void;
}
```

## Connection Management

### Request Connection

Request user permission to connect to your dApp:

```javascript
// Request connection (shows approval popup)
try {
  const accounts = await window.hoosat.requestAccounts();
  console.log('Connected address:', accounts[0]);
  // Returns: ["hoosat:qp4ad2eh72xc8..."]
} catch (error) {
  console.error('Connection rejected:', error);
  // error.code === 4001 (USER_REJECTED)
}
```

**Alternative Method:**

```javascript
// Using connect() alias
const accounts = await window.hoosat.connect();
```

### Check Connection Status

Get connected accounts without showing a popup:

```javascript
// Get connected accounts (no popup)
const accounts = await window.hoosat.getAccounts();

if (accounts.length > 0) {
  console.log('Already connected:', accounts[0]);
} else {
  console.log('Not connected');
  // Show "Connect Wallet" button
}
```

### Connection Flow

```javascript
async function connectWallet() {
  try {
    // Check if already connected
    let accounts = await window.hoosat.getAccounts();

    if (accounts.length === 0) {
      // Not connected - request connection
      accounts = await window.hoosat.requestAccounts();
    }

    // Connected successfully
    const address = accounts[0];
    console.log('Connected:', address);

    // Update UI
    updateUI(address);

    // Fetch user data
    const balance = await window.hoosat.getBalance(address);
    console.log('Balance:', balance, 'sompi');

    return address;
  } catch (error) {
    if (error.code === 4001) {
      console.log('User rejected connection');
    } else {
      console.error('Connection error:', error);
    }
  }
}
```

## Querying Blockchain

### Get Balance

```javascript
// Get balance for address (returns sompi)
const balance = await window.hoosat.getBalance(address);
console.log('Balance:', balance, 'sompi');

// Convert sompi to HTN
const balanceHTN = parseInt(balance) / 100000000;
console.log('Balance:', balanceHTN, 'HTN');
```

### Get Network

```javascript
// Get current network
const network = await window.hoosat.getNetwork();
console.log('Network:', network);
// Returns: "mainnet" or "testnet"

// Use network for validation
if (network !== 'mainnet') {
  alert('Please switch to mainnet');
}
```

## Sending Transactions

### Basic Transaction

```javascript
// Send transaction (shows approval popup)
try {
  const txId = await window.hoosat.sendTransaction({
    to: 'hoosat:qp4ad2eh72xc8...',  // Recipient address
    amount: 150000000,               // Amount in sompi (1.5 HTN)
  });

  console.log('✅ Transaction sent!');
  console.log('TX ID:', txId);
  // Returns: "2a3b4c5d6e7f8..."

  // Show success message
  alert(`Transaction sent! TX ID: ${txId}`);
} catch (error) {
  if (error.code === 4001) {
    console.log('User rejected transaction');
  } else if (error.code === 4100) {
    console.log('Not connected - need to connect first');
  } else {
    console.error('Transaction failed:', error.message);
  }
}
```

### Transaction with Custom Fee

```javascript
// Send with custom fee
const txId = await window.hoosat.sendTransaction({
  to: 'hoosat:qp...',
  amount: 100000000,  // 1 HTN
  fee: '5000'         // 5000 sompi fee (optional)
});
```

### Transaction Parameters

```typescript
interface TransactionParams {
  to: string;              // Recipient address (required)
  amount: number | string; // Amount in sompi (required)
  fee?: string;           // Custom fee in sompi (optional)
}
```

**Amount Conversion:**

```javascript
// HTN to sompi
function htnToSompi(htn) {
  return Math.floor(htn * 100000000);
}

// Send 1.5 HTN
await window.hoosat.sendTransaction({
  to: recipientAddress,
  amount: htnToSompi(1.5)  // 150000000 sompi
});
```

### Complete Payment Flow

```javascript
async function sendPayment(recipient, amountHTN) {
  try {
    // 1. Check connection
    const accounts = await window.hoosat.getAccounts();
    if (accounts.length === 0) {
      throw new Error('Not connected');
    }

    // 2. Validate address
    if (!recipient.startsWith('hoosat:')) {
      throw new Error('Invalid recipient address');
    }

    // 3. Check balance
    const balance = await window.hoosat.getBalance(accounts[0]);
    const balanceHTN = parseInt(balance) / 100000000;
    const amountSompi = Math.floor(amountHTN * 100000000);

    if (balanceHTN < amountHTN) {
      throw new Error('Insufficient balance');
    }

    // 4. Send transaction
    const txId = await window.hoosat.sendTransaction({
      to: recipient,
      amount: amountSompi
    });

    // 5. Success
    console.log('Payment successful!', txId);
    return txId;

  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

## Message Signing

### Sign Message

```javascript
// Sign a message
try {
  const message = 'Hello World';
  const signature = await window.hoosat.signMessage(message);

  console.log('✅ Message signed!');
  console.log('Signature:', signature);
  // Returns: "3045022100ab12cd34ef..." (128 hex chars)
} catch (error) {
  if (error.code === 4001) {
    console.log('User rejected signing');
  }
}
```

### Verify Signature (Backend)

```javascript
// Backend verification using hoosat-sdk
import { HoosatSigner } from 'hoosat-sdk';

function verifySignature(signature, message, address) {
  // Get public key from address (or from user profile)
  const publicKey = getPublicKeyForAddress(address);

  // Verify signature
  const isValid = HoosatSigner.verifyMessage(
    signature,
    message,
    publicKey
  );

  return isValid;
}
```

## Authentication Patterns

### "Sign In with Hoosat"

Complete authentication flow:

```javascript
// Frontend
async function signInWithHoosat() {
  try {
    // 1. Connect wallet
    const accounts = await window.hoosat.requestAccounts();
    const address = accounts[0];

    // 2. Request challenge from server
    const challengeRes = await fetch('/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    const { challenge, nonce } = await challengeRes.json();

    // 3. Sign challenge
    const signature = await window.hoosat.signMessage(challenge);

    // 4. Verify with server
    const verifyRes = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        signature,
        nonce
      })
    });

    const { token, user } = await verifyRes.json();

    // 5. Store token
    localStorage.setItem('authToken', token);

    console.log('✅ Signed in:', user);
    return user;

  } catch (error) {
    console.error('Sign in failed:', error);
  }
}
```

### Backend Implementation

```javascript
// Express.js backend
import { HoosatSigner } from 'hoosat-sdk';

app.post('/api/auth/challenge', (req, res) => {
  const { address } = req.body;

  // Generate challenge
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const challenge = `Sign in to MyDApp\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

  // Store nonce in session/redis
  sessions.set(address, { nonce, challenge, timestamp });

  res.json({ challenge, nonce });
});

app.post('/api/auth/verify', (req, res) => {
  const { address, signature, nonce } = req.body;

  // Get stored challenge
  const session = sessions.get(address);

  if (!session || session.nonce !== nonce) {
    return res.status(401).json({ error: 'Invalid nonce' });
  }

  // Check timestamp (max 5 minutes)
  if (Date.now() - session.timestamp > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'Challenge expired' });
  }

  // Get public key for address
  const publicKey = getPublicKeyForAddress(address);

  // Verify signature
  const isValid = HoosatSigner.verifyMessage(
    signature,
    session.challenge,
    publicKey
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Create session/JWT
  const token = jwt.sign({ address }, SECRET_KEY);

  // Get or create user
  const user = findOrCreateUser(address);

  res.json({ token, user });
});
```

### Proof of Ownership

```javascript
async function proveOwnership(address) {
  const message = `I own this address: ${address}`;
  const signature = await window.hoosat.signMessage(message);

  // Submit proof
  await fetch('/api/verify-ownership', {
    method: 'POST',
    body: JSON.stringify({ address, message, signature })
  });
}
```

## Error Handling

### Error Codes

```javascript
const ErrorCodes = {
  USER_REJECTED: 4001,      // User rejected request
  UNAUTHORIZED: 4100,        // Not connected
  UNSUPPORTED_METHOD: 4200,  // Method not supported
  DISCONNECTED: 4900,        // Wallet disconnected
  CHAIN_DISCONNECTED: 4901   // Blockchain disconnected
};
```

### Handling Errors

```javascript
try {
  const txId = await window.hoosat.sendTransaction({...});
} catch (error) {
  switch (error.code) {
    case 4001:
      console.log('User rejected the request');
      break;

    case 4100:
      console.log('Not connected - please connect wallet');
      // Show connect button
      break;

    case 4900:
      console.log('Wallet disconnected');
      // Reconnect
      break;

    default:
      console.error('Transaction failed:', error.message);
  }
}
```

### Best Practices

```javascript
async function safeRequest(fn) {
  try {
    return await fn();
  } catch (error) {
    // Log error
    console.error('Request failed:', error);

    // User-friendly message
    let userMessage;
    switch (error.code) {
      case 4001:
        userMessage = 'You rejected the request';
        break;
      case 4100:
        userMessage = 'Please connect your wallet first';
        break;
      default:
        userMessage = 'Something went wrong. Please try again.';
    }

    // Show to user
    alert(userMessage);

    // Re-throw for caller
    throw error;
  }
}

// Usage
await safeRequest(() => window.hoosat.sendTransaction({...}));
```

## Use Cases

### 1. NFT Marketplace

```javascript
async function purchaseNFT(nftId, priceHTN) {
  // Connect wallet
  const accounts = await window.hoosat.connect();

  // Get NFT details
  const nft = await fetchNFT(nftId);

  // Send payment
  const txId = await window.hoosat.sendTransaction({
    to: nft.sellerAddress,
    amount: Math.floor(priceHTN * 100000000)
  });

  // Transfer NFT to buyer
  await transferNFT(nftId, accounts[0], txId);
}
```

### 2. DAO Voting

```javascript
async function castVote(proposalId, vote) {
  // Connect wallet
  const accounts = await window.hoosat.connect();

  // Create vote message
  const message = JSON.stringify({
    proposalId,
    vote,
    voter: accounts[0],
    timestamp: Date.now()
  });

  // Sign vote
  const signature = await window.hoosat.signMessage(message);

  // Submit vote
  await fetch('/api/dao/vote', {
    method: 'POST',
    body: JSON.stringify({ message, signature })
  });
}
```

### 3. Payment Gateway

```javascript
async function checkout(cart, total) {
  // Connect wallet
  const accounts = await window.hoosat.connect();

  // Create invoice
  const invoice = await createInvoice(cart, accounts[0]);

  // Request payment
  const txId = await window.hoosat.sendTransaction({
    to: invoice.merchantAddress,
    amount: invoice.totalSompi
  });

  // Confirm order
  await confirmOrder(invoice.id, txId);

  return { invoice, txId };
}
```

## Testing

### Test DApp

The extension includes a comprehensive test DApp (`test-dapp.html`):

```bash
# After building extension
# Open test-dapp.html in your browser
# Tests all features:
# - Connection
# - Balance queries
# - Transactions
# - Message signing
# - Error handling
```

### Manual Testing

```javascript
// Test connection
await window.hoosat.requestAccounts();

// Test balance
await window.hoosat.getBalance('hoosat:qp...');

// Test transaction
await window.hoosat.sendTransaction({
  to: 'hoosat:qp...',
  amount: 100000000  // 1 HTN
});

// Test message signing
await window.hoosat.signMessage('Test message');

// Test network
await window.hoosat.getNetwork();
```

## Migration from Other Wallets

### From MetaMask

Hoosat Wallet uses a similar API to MetaMask:

```javascript
// MetaMask
await window.ethereum.request({ method: 'eth_requestAccounts' });

// Hoosat Wallet
await window.hoosat.requestAccounts();
```

**Key Differences:**
- Different provider object (`window.hoosat` vs `window.ethereum`)
- Different method names (simpler, more direct)
- Amount in sompi (not wei)
- BLAKE3 hashing (not keccak256)

## Next Steps

- [User Guide](./user-guide.md) - Guide for wallet users
- [Security Guide](./security.md) - Security best practices
- [Developer Reference](./developer-reference.md) - Complete API reference
- [Browser SDK](../sdk-web/intro.md) - Build your own wallet

## Support

- **GitHub Issues**: [Report a bug](https://github.com/Namp88/hoosat-web-extension/issues)
- **Examples**: [Test DApp](https://github.com/Namp88/hoosat-web-extension/blob/main/test-dapp.html)
- **Community**: [Discord](https://discord.gg/mFBfNpNA) | [Telegram](https://t.me/HoosatNetwork)
