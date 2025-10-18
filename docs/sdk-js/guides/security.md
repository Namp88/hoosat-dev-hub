---
sidebar_position: 5
---

# Security Best Practices

Comprehensive guide to securing your Hoosat applications and protecting user funds.

## Private Key Security

### Never Hardcode Private Keys

**Bad:**
```typescript
// NEVER DO THIS
const privateKey = '33a4a81ecd31615c51385299969121707897fb1e167634196f31bd311de5fe43';
const wallet = HoosatCrypto.importKeyPair(privateKey);
```

**Good:**
```typescript
// Use environment variables
import 'dotenv/config';

const privateKey = process.env.WALLET_PRIVATE_KEY;
if (!privateKey) {
  throw new Error('WALLET_PRIVATE_KEY not set');
}

const wallet = HoosatCrypto.importKeyPair(privateKey);
```

**.env file:**
```env
WALLET_PRIVATE_KEY=33a4a81ecd31615c51385299969121707897fb1e167634196f31bd311de5fe43
WALLET_NETWORK=mainnet
```

**.gitignore:**
```
.env
.env.*
!.env.example
```

### Encrypted Storage

Store private keys encrypted at rest:

```typescript
import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

class SecureKeyStore {
  private storePath: string;

  constructor(storePath: string = './.keys') {
    this.storePath = storePath;

    // Create directory if it doesn't exist
    try {
      mkdirSync(storePath, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  // Encrypt and save private key
  saveKey(name: string, privateKey: string, password: string): void {
    // Generate salt and IV
    const salt = randomBytes(32);
    const iv = randomBytes(16);

    // Derive encryption key from password
    const key = scryptSync(password, salt, 32);

    // Encrypt private key
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(privateKey, 'utf8'),
      cipher.final()
    ]);

    // Create encrypted data structure
    const encryptedData = {
      version: 1,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      createdAt: new Date().toISOString()
    };

    // Save to file
    const filePath = `${this.storePath}/${name}.enc`;
    writeFileSync(filePath, JSON.stringify(encryptedData, null, 2));

    console.log(`Key saved to: ${filePath}`);
  }

  // Load and decrypt private key
  loadKey(name: string, password: string): string {
    const filePath = `${this.storePath}/${name}.enc`;

    try {
      // Read encrypted data
      const encryptedData = JSON.parse(readFileSync(filePath, 'utf8'));

      // Extract components
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const encrypted = Buffer.from(encryptedData.encrypted, 'hex');

      // Derive decryption key
      const key = scryptSync(password, salt, 32);

      // Decrypt
      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return decrypted.toString('utf8');

    } catch (error) {
      if (error.message.includes('bad decrypt')) {
        throw new Error('Incorrect password');
      }
      throw error;
    }
  }

  // Check if key exists
  keyExists(name: string): boolean {
    const filePath = `${this.storePath}/${name}.enc`;
    try {
      readFileSync(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Usage
const keyStore = new SecureKeyStore();

// Save key
const privateKey = wallet.privateKey.toString('hex');
keyStore.saveKey('main-wallet', privateKey, 'strong-password-here');

// Load key
const loadedKey = keyStore.loadKey('main-wallet', 'strong-password-here');
const wallet = HoosatCrypto.importKeyPair(loadedKey);
```

### Memory Security

Clear sensitive data from memory after use:

```typescript
function processTransaction(privateKeyHex: string) {
  // Convert to Buffer
  let privateKey = Buffer.from(privateKeyHex, 'hex');

  try {
    // Use the key
    const wallet = HoosatCrypto.importKeyPair(privateKey.toString('hex'));
    const signedTx = builder.sign(privateKey);

    // ... submit transaction

  } finally {
    // Clear private key from memory
    if (privateKey) {
      privateKey.fill(0);
      privateKey = null as any;
    }
  }
}

// Clear string variables
let password = getUserPassword();
try {
  // Use password
  const key = keyStore.loadKey('wallet', password);
} finally {
  // Overwrite password string
  password = '0'.repeat(password.length);
  password = null as any;
}
```

### Hardware Security Modules (HSM)

For production/enterprise use, store keys in HSM:

```typescript
// Example with AWS KMS
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

class HSMKeyManager {
  private kmsClient: KMSClient;

  constructor() {
    this.kmsClient = new KMSClient({ region: 'us-east-1' });
  }

  async getPrivateKey(encryptedKeyBlob: string): Promise<string> {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKeyBlob, 'base64')
    });

    const response = await this.kmsClient.send(command);
    const privateKey = Buffer.from(response.Plaintext!).toString('utf8');

    return privateKey;
  }
}

// Usage
const hsmManager = new HSMKeyManager();
const privateKey = await hsmManager.getPrivateKey(process.env.ENCRYPTED_KEY_BLOB!);
const wallet = HoosatCrypto.importKeyPair(privateKey);
```

## Input Validation

### Validate All User Inputs

```typescript
import { HoosatUtils } from 'hoosat-sdk';

function validateTransactionInputs(
  recipientAddress: string,
  amount: string
): void {
  // Validate address
  if (!recipientAddress || recipientAddress.trim() === '') {
    throw new Error('Recipient address is required');
  }

  if (!HoosatUtils.isValidAddress(recipientAddress)) {
    throw new Error('Invalid recipient address format');
  }

  // Check network prefix
  const network = HoosatUtils.getAddressNetwork(recipientAddress);
  const expectedNetwork = process.env.WALLET_NETWORK || 'mainnet';

  if (network !== expectedNetwork) {
    throw new Error(
      `Address is for ${network} but wallet is on ${expectedNetwork}`
    );
  }

  // Validate amount
  if (!amount || amount.trim() === '') {
    throw new Error('Amount is required');
  }

  if (!HoosatUtils.isValidAmount(amount)) {
    throw new Error('Invalid amount format');
  }

  // Check for negative or zero
  const amountBigInt = BigInt(amount);
  if (amountBigInt <= 0n) {
    throw new Error('Amount must be greater than zero');
  }

  // Check for dust
  const DUST_THRESHOLD = 1000n;
  if (amountBigInt < DUST_THRESHOLD) {
    throw new Error(`Amount below dust threshold (${DUST_THRESHOLD} sompi)`);
  }

  // Check for unreasonable amounts
  const MAX_AMOUNT = HoosatUtils.amountToSompi('1000000');  // 1M HTN
  if (amountBigInt > BigInt(MAX_AMOUNT)) {
    throw new Error('Amount exceeds maximum allowed');
  }
}

// Usage
try {
  validateTransactionInputs(userAddress, userAmount);
  // Proceed with transaction
} catch (error) {
  console.error('Validation failed:', error.message);
  // Show error to user
}
```

### Sanitize Inputs

```typescript
function sanitizeAddress(address: string): string {
  // Trim whitespace
  address = address.trim();

  // Remove common mistakes
  address = address.replace(/\s+/g, '');  // Remove all spaces
  address = address.toLowerCase();         // Normalize case

  return address;
}

function sanitizeAmount(amount: string): string {
  // Remove commas, spaces
  amount = amount.replace(/[,\s]/g, '');

  // Handle scientific notation
  if (amount.includes('e') || amount.includes('E')) {
    amount = Number(amount).toFixed(8);
  }

  return amount;
}

// Usage
const cleanAddress = sanitizeAddress(userInputAddress);
const cleanAmount = sanitizeAmount(userInputAmount);

validateTransactionInputs(cleanAddress, cleanAmount);
```

## Transaction Security

### Double-Check Before Signing

```typescript
async function confirmAndSend(
  client: HoosatClient,
  wallet: KeyPair,
  recipientAddress: string,
  amount: string
): Promise<string> {
  // Build transaction
  const builder = new HoosatTxBuilder();

  const utxos = await getUtxos(client, wallet.address);
  for (const utxo of utxos) {
    builder.addInput(utxo, wallet.privateKey);
  }

  builder.addOutput(recipientAddress, amount);

  const feeEstimator = new HoosatFeeEstimator(client);
  const fee = await feeEstimator.estimateFee(FeePriority.Normal, utxos.length, 2);

  builder.setFee(fee.totalFee);
  builder.addChangeOutput(wallet.address);

  // Calculate actual amounts
  const totalIn = builder.getTotalInputAmount();
  const totalOut = builder.getTotalOutputAmount();
  const change = totalIn - totalOut - BigInt(fee.totalFee);

  // Display confirmation
  console.log('\n=== Transaction Confirmation ===');
  console.log('Sending to:', recipientAddress);
  console.log('Amount:', HoosatUtils.sompiToAmount(amount), 'HTN');
  console.log('Fee:', HoosatUtils.sompiToAmount(fee.totalFee), 'HTN');
  console.log('Change:', HoosatUtils.sompiToAmount(change), 'HTN');
  console.log('Total cost:', HoosatUtils.sompiToAmount(BigInt(amount) + BigInt(fee.totalFee)), 'HTN');
  console.log('================================\n');

  // Require explicit confirmation
  const confirmed = await getUserConfirmation('Send this transaction?');

  if (!confirmed) {
    throw new Error('Transaction cancelled by user');
  }

  // Sign and submit
  const signedTx = builder.sign();
  const result = await client.submitTransaction(signedTx);

  if (!result.ok) {
    throw new Error(`Transaction failed: ${result.error}`);
  }

  return result.result.transactionId;
}

async function getUserConfirmation(prompt: string): Promise<boolean> {
  // Implement your confirmation UI
  // For CLI: use readline
  // For web: show modal
  // For mobile: show alert
  return true;  // Placeholder
}
```

### Rate Limiting

Prevent abuse and accidental rapid transactions:

```typescript
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  checkLimit(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;  // Rate limit exceeded
    }

    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Usage
const rateLimiter = new RateLimiter(5, 60000);  // 5 transactions per minute

async function sendTransactionWithRateLimit(
  wallet: KeyPair,
  recipientAddress: string,
  amount: string
): Promise<string> {
  const key = wallet.address;

  if (!rateLimiter.checkLimit(key)) {
    throw new Error('Rate limit exceeded. Please wait before sending another transaction.');
  }

  try {
    return await sendTransaction(wallet, recipientAddress, amount);
  } catch (error) {
    // Don't count failed transactions
    rateLimiter.reset(key);
    throw error;
  }
}
```

### Amount Limits

Set transaction limits for safety:

```typescript
interface TransactionLimits {
  minAmount: string;        // Minimum transaction
  maxAmount: string;        // Maximum single transaction
  dailyLimit: string;       // Maximum per 24 hours
  requireApproval: string;  // Require manual approval above this
}

class TransactionLimitChecker {
  private limits: TransactionLimits;
  private dailyTotal: Map<string, { amount: bigint; date: string }> = new Map();

  constructor(limits: TransactionLimits) {
    this.limits = limits;
  }

  checkLimits(address: string, amount: string): LimitCheckResult {
    const amountBigInt = BigInt(amount);
    const today = new Date().toISOString().split('T')[0];

    // Check minimum
    if (amountBigInt < BigInt(this.limits.minAmount)) {
      return {
        allowed: false,
        reason: `Amount below minimum (${HoosatUtils.sompiToAmount(this.limits.minAmount)} HTN)`
      };
    }

    // Check maximum
    if (amountBigInt > BigInt(this.limits.maxAmount)) {
      return {
        allowed: false,
        reason: `Amount exceeds maximum (${HoosatUtils.sompiToAmount(this.limits.maxAmount)} HTN)`
      };
    }

    // Check daily limit
    const dailyData = this.dailyTotal.get(address);
    let dailyAmount = 0n;

    if (dailyData && dailyData.date === today) {
      dailyAmount = dailyData.amount;
    }

    const newDailyTotal = dailyAmount + amountBigInt;

    if (newDailyTotal > BigInt(this.limits.dailyLimit)) {
      return {
        allowed: false,
        reason: `Would exceed daily limit (${HoosatUtils.sompiToAmount(this.limits.dailyLimit)} HTN)`
      };
    }

    // Check if approval required
    const requiresApproval = amountBigInt >= BigInt(this.limits.requireApproval);

    // Update daily total
    this.dailyTotal.set(address, {
      amount: newDailyTotal,
      date: today
    });

    return {
      allowed: true,
      requiresApproval
    };
  }
}

interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
}

// Usage
const limits: TransactionLimits = {
  minAmount: HoosatUtils.amountToSompi('0.001'),    // 0.001 HTN
  maxAmount: HoosatUtils.amountToSompi('100'),      // 100 HTN
  dailyLimit: HoosatUtils.amountToSompi('1000'),    // 1000 HTN
  requireApproval: HoosatUtils.amountToSompi('50')  // 50 HTN
};

const limitChecker = new TransactionLimitChecker(limits);

const check = limitChecker.checkLimits(wallet.address, amount);

if (!check.allowed) {
  throw new Error(check.reason);
}

if (check.requiresApproval) {
  console.log('Large transaction - manual approval required');
  await requestManualApproval(wallet.address, amount);
}

// Proceed with transaction
```

## Network Security

### Use HTTPS/TLS

```typescript
// Always use secure connections in production
const client = new HoosatClient({
  host: 'node.hoosat.fi',
  port: 42420,
  // TLS is handled by gRPC automatically for standard ports
});

// For self-hosted nodes, ensure TLS is configured
```

### Node Authentication

Authenticate with private nodes:

```typescript
import { credentials, Metadata } from '@grpc/grpc-js';

const client = new HoosatClient({
  host: 'private-node.example.com',
  port: 42420,
  credentials: credentials.createSsl(),
  metadata: new Metadata({
    'authorization': `Bearer ${process.env.NODE_API_KEY}`
  })
});
```

### Verify Node Identity

```typescript
async function verifyNodeConnection(client: HoosatClient): Promise<void> {
  try {
    const infoResult = await client.getInfo();

    if (!infoResult.ok) {
      throw new Error('Failed to get node info');
    }

    const info = infoResult.result;

    // Check expected network
    if (info.serverVersion && !info.serverVersion.includes('hoosat')) {
      console.warn('Warning: Connected to non-Hoosat node');
    }

    // Verify network matches expectations
    const networkResult = await client.getCurrentNetwork();
    if (networkResult.ok) {
      const network = networkResult.result.currentNetwork;
      const expectedNetwork = process.env.EXPECTED_NETWORK || 'hoosat-mainnet';

      if (network !== expectedNetwork) {
        throw new Error(
          `Network mismatch: expected ${expectedNetwork}, got ${network}`
        );
      }
    }

    console.log('Node verification successful');

  } catch (error) {
    throw new Error(`Node verification failed: ${error.message}`);
  }
}

// Usage
await verifyNodeConnection(client);
```

### Multi-Node Redundancy

Use multiple nodes for high availability:

```typescript
const client = new HoosatClient({
  nodes: [
    { host: 'node1.hoosat.fi', port: 42420 },
    { host: 'node2.hoosat.fi', port: 42420 },
    { host: 'node3.hoosat.fi', port: 42420 }
  ],
  nodeSelectionStrategy: 'round-robin'
});

// Client automatically fails over to healthy nodes
```

## Application Security

### Separate Hot and Cold Wallets

```typescript
class WalletManager {
  private hotWallet: KeyPair;    // Small balance, always online
  private coldWallet: string;    // Large balance, offline storage

  constructor() {
    // Hot wallet: encrypted in environment
    this.hotWallet = HoosatCrypto.importKeyPair(
      process.env.HOT_WALLET_KEY!
    );

    // Cold wallet: address only, keys stored offline
    this.coldWallet = process.env.COLD_WALLET_ADDRESS!;
  }

  // Use hot wallet for regular transactions
  async processPayment(recipientAddress: string, amount: string): Promise<string> {
    // Check hot wallet balance
    const balance = await this.getHotWalletBalance();

    if (balance < BigInt(amount)) {
      throw new Error('Insufficient hot wallet balance - needs refill from cold storage');
    }

    return await this.sendFromHotWallet(recipientAddress, amount);
  }

  // Periodically move excess funds to cold storage
  async rebalanceToColed(): Promise<void> {
    const balance = await this.getHotWalletBalance();
    const threshold = BigInt(HoosatUtils.amountToSompi('100'));  // Keep 100 HTN hot

    if (balance > threshold) {
      const excess = balance - threshold;
      console.log(`Moving ${HoosatUtils.sompiToAmount(excess)} HTN to cold storage`);

      await this.sendFromHotWallet(this.coldWallet, excess.toString());
    }
  }

  private async getHotWalletBalance(): Promise<bigint> {
    const result = await client.getBalance(this.hotWallet.address);
    return result.ok ? BigInt(result.result.balance) : 0n;
  }

  private async sendFromHotWallet(to: string, amount: string): Promise<string> {
    // Use hot wallet to send
    // ...
    return txId;
  }
}
```

### Implement Audit Logging

```typescript
import { appendFileSync } from 'fs';

interface AuditLog {
  timestamp: Date;
  event: string;
  user?: string;
  details: any;
  ip?: string;
}

class AuditLogger {
  private logFile: string;

  constructor(logFile: string = './audit.log') {
    this.logFile = logFile;
  }

  log(event: string, details: any, user?: string, ip?: string): void {
    const entry: AuditLog = {
      timestamp: new Date(),
      event,
      user,
      details,
      ip
    };

    const line = JSON.stringify(entry) + '\n';
    appendFileSync(this.logFile, line);

    // Also log sensitive events to console
    if (this.isSensitiveEvent(event)) {
      console.log('[AUDIT]', event, user || 'system');
    }
  }

  private isSensitiveEvent(event: string): boolean {
    return [
      'transaction_sent',
      'wallet_created',
      'wallet_imported',
      'large_withdrawal',
      'rate_limit_exceeded',
      'failed_authentication'
    ].includes(event);
  }
}

// Usage
const auditLogger = new AuditLogger();

// Log transaction
auditLogger.log('transaction_sent', {
  from: wallet.address,
  to: recipientAddress,
  amount: HoosatUtils.sompiToAmount(amount),
  txId: result.transactionId
}, userId, userIP);

// Log security events
auditLogger.log('failed_authentication', {
  reason: 'incorrect_password',
  attempts: 3
}, userId, userIP);
```

### Environment-Specific Configuration

```typescript
interface EnvironmentConfig {
  nodeHost: string;
  nodePort: number;
  network: 'mainnet' | 'testnet';
  enableDebug: boolean;
  maxTransactionAmount: string;
  requireManualApproval: boolean;
}

function getConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';

  const configs: Record<string, EnvironmentConfig> = {
    development: {
      nodeHost: 'testnet.hoosat.fi',
      nodePort: 42420,
      network: 'testnet',
      enableDebug: true,
      maxTransactionAmount: HoosatUtils.amountToSompi('1'),
      requireManualApproval: false
    },
    production: {
      nodeHost: process.env.NODE_HOST || 'node.hoosat.fi',
      nodePort: parseInt(process.env.NODE_PORT || '42420'),
      network: 'mainnet',
      enableDebug: false,
      maxTransactionAmount: HoosatUtils.amountToSompi('100'),
      requireManualApproval: true
    }
  };

  return configs[env] || configs.development;
}

// Usage
const config = getConfig();

const client = new HoosatClient({
  host: config.nodeHost,
  port: config.nodePort
});
```

## Monitoring and Alerts

### Detect Suspicious Activity

```typescript
class SecurityMonitor {
  private alertThresholds = {
    rapidTransactions: 10,      // More than 10 tx in 1 minute
    largeTransaction: HoosatUtils.amountToSompi('1000'),
    failedAttempts: 5,          // 5 failed attempts in 10 minutes
    unusualTime: { start: 2, end: 6 }  // 2 AM - 6 AM
  };

  async monitorTransaction(
    wallet: string,
    amount: string,
    timestamp: Date
  ): Promise<void> {
    const alerts: string[] = [];

    // Check for large transaction
    if (BigInt(amount) >= BigInt(this.alertThresholds.largeTransaction)) {
      alerts.push('Large transaction detected');
    }

    // Check for unusual time
    const hour = timestamp.getHours();
    if (hour >= this.alertThresholds.unusualTime.start &&
        hour <= this.alertThresholds.unusualTime.end) {
      alerts.push('Transaction at unusual hour');
    }

    // Send alerts
    if (alerts.length > 0) {
      await this.sendAlert({
        type: 'suspicious_activity',
        wallet,
        amount: HoosatUtils.sompiToAmount(amount),
        timestamp,
        alerts
      });
    }
  }

  private async sendAlert(alert: any): Promise<void> {
    console.error('[SECURITY ALERT]', alert);
    // Send to monitoring system
  }
}
```

## Best Practices Summary

### Development Checklist

- [ ] Never hardcode private keys
- [ ] Use environment variables for secrets
- [ ] Store private keys encrypted
- [ ] Clear sensitive data from memory
- [ ] Validate all user inputs
- [ ] Sanitize inputs before processing
- [ ] Implement rate limiting
- [ ] Set transaction amount limits
- [ ] Use HTTPS/TLS for connections
- [ ] Verify node identity
- [ ] Implement audit logging
- [ ] Use separate hot/cold wallets
- [ ] Require confirmation for large transactions
- [ ] Monitor for suspicious activity
- [ ] Test on testnet first
- [ ] Keep dependencies updated
- [ ] Use TypeScript for type safety
- [ ] Handle errors gracefully
- [ ] Log security events
- [ ] Regular security audits

### Production Checklist

- [ ] All keys stored in HSM or encrypted storage
- [ ] Multi-signature for large amounts
- [ ] Automated backups of encrypted keys
- [ ] 24/7 monitoring and alerting
- [ ] Incident response plan
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Code reviews for all changes
- [ ] Least privilege access
- [ ] Multi-factor authentication
- [ ] Disaster recovery plan
- [ ] Insurance for large holdings
- [ ] Regular security training
- [ ] Bug bounty program
- [ ] Compliance with regulations

## Next Steps

- [Wallet Management](./wallet-management.md) - Secure wallet handling
- [Transaction Guide](./transactions.md) - Safe transaction processing
- [Batch Payments](./batch-payments.md) - Secure batch processing
