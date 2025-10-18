---
sidebar_position: 8
---

# HoosatSigner API Reference

Complete API reference for `HoosatSigner` - message signing and verification for the Hoosat blockchain.

## Overview

`HoosatSigner` provides cryptographic message signing capabilities:
- Sign messages with private keys
- Verify message signatures
- Prove address ownership
- Authentication mechanisms
- Secure messaging

All methods are static - no need to instantiate the class.

## Message Signing

### `signMessage(message: string, privateKey: Buffer)`

Sign a message with a private key.

**Parameters:**
- `message` - Message to sign (string)
- `privateKey` - Private key (32-byte Buffer)

**Returns:** `string` - Signature as hex string

**Example:**
```typescript
import { HoosatSigner, HoosatCrypto } from 'hoosat-sdk';

const wallet = HoosatCrypto.generateKeyPair();
const message = 'Hello, Hoosat!';

const signature = HoosatSigner.signMessage(message, wallet.privateKey);

console.log('Message:', message);
console.log('Signature:', signature);
// Signature is a hex string (128-130 characters)
```

**Use cases:**
- Prove ownership of an address
- Authenticate without revealing private key
- Sign login challenges
- Authorize actions

### `verifyMessage(message: string, signature: string, address: string)`

Verify a message signature.

**Parameters:**
- `message` - Original message
- `signature` - Signature hex string
- `address` - Expected signer's address

**Returns:** `boolean` - True if signature is valid

**Example:**
```typescript
const message = 'Hello, Hoosat!';
const signature = '...';  // From signMessage
const address = wallet.address;

const isValid = HoosatSigner.verifyMessage(message, signature, address);

if (isValid) {
  console.log('Signature is valid!');
  console.log('Message was signed by:', address);
} else {
  console.error('Invalid signature');
}
```

**Verification checks:**
- Signature format is valid
- Signature matches message
- Signature was created by private key for given address
- Message has not been tampered with

## Complete Examples

### Prove Address Ownership

```typescript
class AddressOwnershipProof {
  static async createProof(
    address: string,
    privateKey: Buffer,
    challenge?: string
  ): Promise<OwnershipProof> {
    // Create challenge if not provided
    if (!challenge) {
      challenge = `Prove ownership of ${address} at ${new Date().toISOString()}`;
    }

    // Sign challenge
    const signature = HoosatSigner.signMessage(challenge, privateKey);

    return {
      address,
      challenge,
      signature,
      timestamp: new Date().toISOString()
    };
  }

  static verifyProof(proof: OwnershipProof): VerificationResult {
    // Verify signature
    const isValid = HoosatSigner.verifyMessage(
      proof.challenge,
      proof.signature,
      proof.address
    );

    if (!isValid) {
      return {
        valid: false,
        reason: 'Invalid signature'
      };
    }

    // Check timestamp (proof should be recent)
    const proofTime = new Date(proof.timestamp).getTime();
    const now = Date.now();
    const maxAge = 5 * 60 * 1000;  // 5 minutes

    if (now - proofTime > maxAge) {
      return {
        valid: false,
        reason: 'Proof expired'
      };
    }

    return {
      valid: true,
      address: proof.address
    };
  }
}

interface OwnershipProof {
  address: string;
  challenge: string;
  signature: string;
  timestamp: string;
}

interface VerificationResult {
  valid: boolean;
  reason?: string;
  address?: string;
}

// Usage
// User proves they own an address
const proof = await AddressOwnershipProof.createProof(
  wallet.address,
  wallet.privateKey
);

console.log('Ownership proof:', proof);

// Server verifies proof
const result = AddressOwnershipProof.verifyProof(proof);

if (result.valid) {
  console.log('User owns address:', result.address);
} else {
  console.error('Verification failed:', result.reason);
}
```

### Login Authentication

```typescript
class HoosatAuth {
  private challenges: Map<string, Challenge> = new Map();

  // Step 1: Generate login challenge
  generateChallenge(address: string): string {
    const nonce = crypto.randomBytes(32).toString('hex');
    const challenge = `Login to MyApp\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

    this.challenges.set(address, {
      challenge,
      nonce,
      createdAt: Date.now()
    });

    return challenge;
  }

  // Step 2: Verify signed challenge
  verifyLogin(address: string, signature: string): AuthResult {
    const stored = this.challenges.get(address);

    if (!stored) {
      return {
        success: false,
        error: 'No challenge found for address'
      };
    }

    // Check challenge age
    const age = Date.now() - stored.createdAt;
    const MAX_AGE = 5 * 60 * 1000;  // 5 minutes

    if (age > MAX_AGE) {
      this.challenges.delete(address);
      return {
        success: false,
        error: 'Challenge expired'
      };
    }

    // Verify signature
    const isValid = HoosatSigner.verifyMessage(
      stored.challenge,
      signature,
      address
    );

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid signature'
      };
    }

    // Clear used challenge
    this.challenges.delete(address);

    // Generate session token
    const sessionToken = this.createSessionToken(address);

    return {
      success: true,
      address,
      sessionToken
    };
  }

  private createSessionToken(address: string): string {
    // Implement your session token logic
    // Could use JWT, random tokens, etc.
    return crypto.randomBytes(32).toString('hex');
  }
}

interface Challenge {
  challenge: string;
  nonce: string;
  createdAt: number;
}

interface AuthResult {
  success: boolean;
  error?: string;
  address?: string;
  sessionToken?: string;
}

// Usage
// Server-side
const auth = new HoosatAuth();

// Step 1: User requests login
app.post('/auth/challenge', (req, res) => {
  const { address } = req.body;

  if (!HoosatUtils.isValidAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const challenge = auth.generateChallenge(address);

  res.json({ challenge });
});

// Step 2: User signs challenge and sends signature
app.post('/auth/login', (req, res) => {
  const { address, signature } = req.body;

  const result = auth.verifyLogin(address, signature);

  if (result.success) {
    res.json({
      success: true,
      sessionToken: result.sessionToken
    });
  } else {
    res.status(401).json({
      success: false,
      error: result.error
    });
  }
});

// Client-side
async function loginWithHoosat(wallet: KeyPair) {
  // Step 1: Get challenge
  const challengeResponse = await fetch('/auth/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: wallet.address })
  });

  const { challenge } = await challengeResponse.json();

  // Step 2: Sign challenge
  const signature = HoosatSigner.signMessage(challenge, wallet.privateKey);

  // Step 3: Send signature
  const loginResponse = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: wallet.address,
      signature
    })
  });

  const result = await loginResponse.json();

  if (result.success) {
    console.log('Logged in! Session token:', result.sessionToken);
    localStorage.setItem('sessionToken', result.sessionToken);
  } else {
    console.error('Login failed:', result.error);
  }
}
```

### Signed Messages System

```typescript
class SignedMessageSystem {
  // Create signed message
  static createSignedMessage(
    content: string,
    sender: KeyPair,
    recipient?: string
  ): SignedMessage {
    const message: SignedMessage = {
      from: sender.address,
      to: recipient,
      content,
      timestamp: new Date().toISOString(),
      signature: ''
    };

    // Create signature payload
    const payload = JSON.stringify({
      from: message.from,
      to: message.to,
      content: message.content,
      timestamp: message.timestamp
    });

    // Sign payload
    message.signature = HoosatSigner.signMessage(payload, sender.privateKey);

    return message;
  }

  // Verify signed message
  static verifySignedMessage(message: SignedMessage): boolean {
    // Reconstruct payload
    const payload = JSON.stringify({
      from: message.from,
      to: message.to,
      content: message.content,
      timestamp: message.timestamp
    });

    // Verify signature
    return HoosatSigner.verifyMessage(
      payload,
      message.signature,
      message.from
    );
  }

  // Verify and validate message
  static validateMessage(message: SignedMessage): ValidationResult {
    // Verify signature
    if (!this.verifySignedMessage(message)) {
      return {
        valid: false,
        reason: 'Invalid signature'
      };
    }

    // Check timestamp (message should be recent)
    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;  // 24 hours

    if (now - messageTime > maxAge) {
      return {
        valid: false,
        reason: 'Message too old'
      };
    }

    // Check if message is from future
    if (messageTime > now + 60000) {  // Allow 1 minute clock skew
      return {
        valid: false,
        reason: 'Message timestamp in future'
      };
    }

    return {
      valid: true,
      from: message.from,
      to: message.to
    };
  }
}

interface SignedMessage {
  from: string;
  to?: string;
  content: string;
  timestamp: string;
  signature: string;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  from?: string;
  to?: string;
}

// Usage
// Sender creates signed message
const message = SignedMessageSystem.createSignedMessage(
  'Hello! This is a signed message.',
  senderWallet,
  recipientAddress
);

console.log('Signed message:', message);

// Send message (via any channel: HTTP, WebSocket, IPFS, etc.)
await sendMessage(message);

// Recipient validates message
const validation = SignedMessageSystem.validateMessage(receivedMessage);

if (validation.valid) {
  console.log('Valid message from:', validation.from);
  console.log('Content:', receivedMessage.content);
} else {
  console.error('Invalid message:', validation.reason);
}
```

### Authorization Tokens

```typescript
class AuthorizationToken {
  // Create authorization token
  static createToken(
    wallet: KeyPair,
    permissions: string[],
    expiresIn: number = 3600000  // 1 hour
  ): AuthToken {
    const expiresAt = Date.now() + expiresIn;

    const token: AuthToken = {
      address: wallet.address,
      permissions,
      issuedAt: Date.now(),
      expiresAt,
      signature: ''
    };

    // Sign token
    const payload = JSON.stringify({
      address: token.address,
      permissions: token.permissions,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt
    });

    token.signature = HoosatSigner.signMessage(payload, wallet.privateKey);

    return token;
  }

  // Verify authorization token
  static verifyToken(token: AuthToken): TokenVerification {
    // Check expiration
    if (Date.now() > token.expiresAt) {
      return {
        valid: false,
        reason: 'Token expired'
      };
    }

    // Verify signature
    const payload = JSON.stringify({
      address: token.address,
      permissions: token.permissions,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt
    });

    const isValid = HoosatSigner.verifyMessage(
      payload,
      token.signature,
      token.address
    );

    if (!isValid) {
      return {
        valid: false,
        reason: 'Invalid signature'
      };
    }

    return {
      valid: true,
      address: token.address,
      permissions: token.permissions
    };
  }

  // Check if token has permission
  static hasPermission(token: AuthToken, permission: string): boolean {
    const verification = this.verifyToken(token);

    if (!verification.valid) {
      return false;
    }

    return token.permissions.includes(permission);
  }
}

interface AuthToken {
  address: string;
  permissions: string[];
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

interface TokenVerification {
  valid: boolean;
  reason?: string;
  address?: string;
  permissions?: string[];
}

// Usage
// Create token with specific permissions
const token = AuthorizationToken.createToken(
  wallet,
  ['read', 'write', 'delete'],
  3600000  // 1 hour
);

console.log('Authorization token:', token);

// Later, verify token and check permissions
const verification = AuthorizationToken.verifyToken(token);

if (verification.valid) {
  console.log('Token valid for:', verification.address);
  console.log('Permissions:', verification.permissions);

  // Check specific permission
  if (AuthorizationToken.hasPermission(token, 'write')) {
    console.log('User can write');
    // Allow write operation
  }
} else {
  console.error('Token invalid:', verification.reason);
}
```

### Multisig Approval System

```typescript
class MultisigApproval {
  // Create approval signature
  static createApproval(
    wallet: KeyPair,
    actionId: string,
    action: any
  ): Approval {
    const payload = JSON.stringify({
      actionId,
      action,
      timestamp: Date.now()
    });

    return {
      signer: wallet.address,
      actionId,
      signature: HoosatSigner.signMessage(payload, wallet.privateKey),
      timestamp: Date.now()
    };
  }

  // Verify approval
  static verifyApproval(
    approval: Approval,
    actionId: string,
    action: any
  ): boolean {
    const payload = JSON.stringify({
      actionId,
      action,
      timestamp: approval.timestamp
    });

    return HoosatSigner.verifyMessage(
      payload,
      approval.signature,
      approval.signer
    );
  }

  // Check if action is approved
  static isActionApproved(
    approvals: Approval[],
    requiredSigners: string[],
    threshold: number,
    actionId: string,
    action: any
  ): ApprovalResult {
    // Verify all approvals
    const validApprovals = approvals.filter(approval =>
      this.verifyApproval(approval, actionId, action)
    );

    // Check if signers are in required list
    const validSigners = validApprovals.filter(approval =>
      requiredSigners.includes(approval.signer)
    );

    // Remove duplicates
    const uniqueSigners = new Set(validSigners.map(a => a.signer));

    if (uniqueSigners.size >= threshold) {
      return {
        approved: true,
        signers: Array.from(uniqueSigners),
        count: uniqueSigners.size
      };
    }

    return {
      approved: false,
      signers: Array.from(uniqueSigners),
      count: uniqueSigners.size,
      required: threshold
    };
  }
}

interface Approval {
  signer: string;
  actionId: string;
  signature: string;
  timestamp: number;
}

interface ApprovalResult {
  approved: boolean;
  signers: string[];
  count: number;
  required?: number;
}

// Usage
// Define required signers (e.g., company officers)
const requiredSigners = [
  ceoWallet.address,
  cfoWallet.address,
  ctoWallet.address
];

const threshold = 2;  // Require 2 of 3 signatures

// Create action (e.g., large withdrawal)
const action = {
  type: 'withdrawal',
  amount: HoosatUtils.amountToSompi('1000'),
  destination: recipientAddress
};

const actionId = 'ACTION-2024-001';

// Each signer creates approval
const approval1 = MultisigApproval.createApproval(ceoWallet, actionId, action);
const approval2 = MultisigApproval.createApproval(cfoWallet, actionId, action);

// Check if action is approved
const result = MultisigApproval.isActionApproved(
  [approval1, approval2],
  requiredSigners,
  threshold,
  actionId,
  action
);

if (result.approved) {
  console.log(`Action approved by ${result.count} signers:`, result.signers);
  // Execute action
} else {
  console.log(`Action needs ${result.required! - result.count} more approvals`);
}
```

## Security Considerations

### 1. Never Reuse Signatures

```typescript
// Bad - same signature for different messages
const signature = HoosatSigner.signMessage('message1', privateKey);
// Attacker could replay this signature

// Good - include timestamp/nonce
const message = `Action: transfer\nAmount: 100\nNonce: ${crypto.randomBytes(16).toString('hex')}\nTimestamp: ${Date.now()}`;
const signature = HoosatSigner.signMessage(message, privateKey);
```

### 2. Validate Message Format

```typescript
function validateSignedMessage(message: SignedMessage): boolean {
  // Check required fields
  if (!message.from || !message.content || !message.signature) {
    return false;
  }

  // Validate address
  if (!HoosatUtils.isValidAddress(message.from)) {
    return false;
  }

  // Check timestamp
  if (!message.timestamp || isNaN(new Date(message.timestamp).getTime())) {
    return false;
  }

  return true;
}
```

### 3. Set Expiration Times

```typescript
const challenge = {
  action: 'login',
  nonce: randomBytes(32).toString('hex'),
  timestamp: Date.now(),
  expiresAt: Date.now() + 300000  // 5 minutes
};

// Later, verify expiration
if (Date.now() > challenge.expiresAt) {
  throw new Error('Challenge expired');
}
```

### 4. Use Specific Message Formats

```typescript
// Good - specific, hard to misinterpret
const message = `
Hoosat Signed Message
Action: Transfer
Amount: ${amount} sompi
To: ${recipientAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}
`;

// Bad - vague, could be manipulated
const message = `Transfer ${amount} to ${recipientAddress}`;
```

## Best Practices

- Always include timestamps in signed messages
- Use nonces to prevent replay attacks
- Set reasonable expiration times
- Validate all inputs before signing
- Never sign user-provided data directly
- Use structured message formats
- Store used nonces to prevent reuse
- Implement rate limiting on signature verification
- Log all signature verifications
- Use constant-time comparison for signatures

## Next Steps

- [HoosatCrypto](./crypto.md) - Cryptographic operations
- [Security Guide](../guides/security.md) - Security best practices
