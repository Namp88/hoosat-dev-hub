---
sidebar_position: 4
---

# Batch Payments Guide

Complete guide to sending payments to multiple recipients efficiently on the Hoosat blockchain.

## Understanding Spam Protection

Hoosat inherits spam protection from Kaspa, which limits transaction outputs:

**Hard Limits:**
- Maximum 2 recipient outputs per transaction
- Maximum 3 total outputs (2 recipients + 1 change)

**Why?**
- Prevents network spam and bloat
- Maintains fast block times
- Ensures efficient transaction processing

**Solution:** Batch multiple transactions to send to 3+ recipients.

## Basic Batch Payment

### Sending to 3 Recipients

```typescript
import {
  HoosatClient,
  HoosatCrypto,
  HoosatTxBuilder,
  HoosatFeeEstimator,
  HoosatUtils,
  FeePriority
} from 'hoosat-sdk';

interface Payment {
  address: string;
  amount: string;  // in sompi
}

async function sendToThreeRecipients() {
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420
  });

  const wallet = HoosatCrypto.importKeyPair(
    process.env.WALLET_PRIVATE_KEY!,
    'mainnet'
  );

  const payments: Payment[] = [
    {
      address: 'hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74',
      amount: HoosatUtils.amountToSompi('1.0')
    },
    {
      address: 'hoosat:qzk8h2q7wn9p3j5m6x4r8t5v3w9y2k4m7p8q6r9t3v5w8x2z4b7c9d',
      amount: HoosatUtils.amountToSompi('0.5')
    },
    {
      address: 'hoosat:qpm4n7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0',
      amount: HoosatUtils.amountToSompi('0.25')
    }
  ];

  // Get UTXOs
  const utxosResult = await client.getUtxosByAddresses([wallet.address]);
  let availableUtxos = utxosResult.result.utxos;

  const feeEstimator = new HoosatFeeEstimator(client);
  const txIds: string[] = [];

  // Transaction 1: Recipients 1 & 2
  {
    const batch = payments.slice(0, 2);
    console.log('Sending batch 1/2...');

    const builder = new HoosatTxBuilder();

    // Add UTXOs
    for (const utxo of availableUtxos) {
      builder.addInput(utxo, wallet.privateKey);
    }

    // Add recipients
    for (const payment of batch) {
      builder.addOutput(payment.address, payment.amount);
    }

    // Fee and change
    const fee = await feeEstimator.estimateFee(
      FeePriority.Normal,
      availableUtxos.length,
      3  // 2 recipients + 1 change
    );

    builder.setFee(fee.totalFee);
    builder.addChangeOutput(wallet.address);

    // Submit
    const signedTx = builder.sign();
    const result = await client.submitTransaction(signedTx);

    if (result.ok) {
      txIds.push(result.result.transactionId);
      console.log('Batch 1 sent:', result.result.transactionId);
    } else {
      throw new Error(`Batch 1 failed: ${result.error}`);
    }

    // Wait for confirmation and refresh UTXOs
    await new Promise(resolve => setTimeout(resolve, 5000));
    const newUtxos = await client.getUtxosByAddresses([wallet.address]);
    availableUtxos = newUtxos.result.utxos;
  }

  // Transaction 2: Recipient 3
  {
    const batch = payments.slice(2, 3);
    console.log('Sending batch 2/2...');

    const builder = new HoosatTxBuilder();

    // Add UTXOs
    for (const utxo of availableUtxos) {
      builder.addInput(utxo, wallet.privateKey);
    }

    // Add recipient
    for (const payment of batch) {
      builder.addOutput(payment.address, payment.amount);
    }

    // Fee and change
    const fee = await feeEstimator.estimateFee(
      FeePriority.Normal,
      availableUtxos.length,
      2  // 1 recipient + 1 change
    );

    builder.setFee(fee.totalFee);
    builder.addChangeOutput(wallet.address);

    // Submit
    const signedTx = builder.sign();
    const result = await client.submitTransaction(signedTx);

    if (result.ok) {
      txIds.push(result.result.transactionId);
      console.log('Batch 2 sent:', result.result.transactionId);
    } else {
      throw new Error(`Batch 2 failed: ${result.error}`);
    }
  }

  client.disconnect();

  console.log('\nAll payments sent!');
  console.log('Transaction IDs:', txIds);

  return txIds;
}
```

## Advanced Batch Payment System

### Smart Batching Strategy

```typescript
class BatchPaymentProcessor {
  private client: HoosatClient;
  private wallet: KeyPair;
  private feeEstimator: HoosatFeeEstimator;
  private batchSize: number = 2;  // Max recipients per tx

  constructor(client: HoosatClient, wallet: KeyPair) {
    this.client = client;
    this.wallet = wallet;
    this.feeEstimator = new HoosatFeeEstimator(client);
  }

  async sendBatch(payments: Payment[]): Promise<BatchResult> {
    console.log(`Processing ${payments.length} payments...`);

    const result: BatchResult = {
      successful: [],
      failed: [],
      totalFees: 0n
    };

    // Get initial UTXOs
    let utxos = await this.getUtxos();

    // Process in batches of 2
    for (let i = 0; i < payments.length; i += this.batchSize) {
      const batch = payments.slice(i, i + this.batchSize);
      const batchNum = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(payments.length / this.batchSize);

      console.log(`\nBatch ${batchNum}/${totalBatches} (${batch.length} recipients)`);

      try {
        // Select UTXOs for this batch
        const selectedUtxos = await this.selectUtxos(utxos, batch);

        if (selectedUtxos.length === 0) {
          throw new Error('Insufficient UTXOs for batch');
        }

        // Build transaction
        const txId = await this.sendBatchTransaction(selectedUtxos, batch);

        // Record success
        for (const payment of batch) {
          result.successful.push({
            ...payment,
            txId,
            timestamp: new Date()
          });
        }

        console.log(`✓ Batch ${batchNum} sent: ${txId}`);

        // Wait for confirmation before next batch
        if (i + this.batchSize < payments.length) {
          console.log('Waiting for confirmation...');
          await this.waitForConfirmation(txId);

          // Refresh UTXOs
          utxos = await this.getUtxos();
        }

      } catch (error) {
        console.error(`✗ Batch ${batchNum} failed:`, error.message);

        // Record failures
        for (const payment of batch) {
          result.failed.push({
            ...payment,
            error: error.message,
            timestamp: new Date()
          });
        }
      }
    }

    console.log('\n=== Batch Payment Summary ===');
    console.log(`Successful: ${result.successful.length}`);
    console.log(`Failed: ${result.failed.length}`);
    console.log(`Total fees: ${HoosatUtils.sompiToAmount(result.totalFees)} HTN`);
    console.log('============================\n');

    return result;
  }

  private async getUtxos(): Promise<UtxoForSigning[]> {
    const result = await this.client.getUtxosByAddresses([this.wallet.address]);

    if (!result.ok) {
      throw new Error('Failed to get UTXOs');
    }

    return result.result.utxos;
  }

  private async selectUtxos(
    availableUtxos: UtxoForSigning[],
    batch: Payment[]
  ): Promise<UtxoForSigning[]> {
    // Calculate total needed
    const totalAmount = batch.reduce(
      (sum, p) => sum + BigInt(p.amount),
      0n
    );

    // Estimate fee
    const estimatedFee = 100000n;  // Rough estimate
    const needed = totalAmount + estimatedFee;

    // Select UTXOs (largest first)
    const sorted = [...availableUtxos].sort((a, b) => {
      const amountA = BigInt(a.utxoEntry.amount);
      const amountB = BigInt(b.utxoEntry.amount);
      return amountA > amountB ? -1 : 1;
    });

    const selected: UtxoForSigning[] = [];
    let total = 0n;

    for (const utxo of sorted) {
      selected.push(utxo);
      total += BigInt(utxo.utxoEntry.amount);

      if (total >= needed) {
        break;
      }
    }

    if (total < needed) {
      throw new Error(
        `Insufficient funds. Need ${HoosatUtils.sompiToAmount(needed)} HTN, ` +
        `have ${HoosatUtils.sompiToAmount(total)} HTN`
      );
    }

    return selected;
  }

  private async sendBatchTransaction(
    utxos: UtxoForSigning[],
    payments: Payment[]
  ): Promise<string> {
    const builder = new HoosatTxBuilder();

    // Add inputs
    for (const utxo of utxos) {
      builder.addInput(utxo, this.wallet.privateKey);
    }

    // Add outputs
    for (const payment of payments) {
      builder.addOutput(payment.address, payment.amount);
    }

    // Estimate fee
    const feeEstimate = await this.feeEstimator.estimateFee(
      FeePriority.Normal,
      utxos.length,
      payments.length + 1  // recipients + change
    );

    builder.setFee(feeEstimate.totalFee);
    builder.addChangeOutput(this.wallet.address);

    // Submit
    const signedTx = builder.sign();
    const result = await this.client.submitTransaction(signedTx);

    if (!result.ok) {
      throw new Error(result.error || 'Transaction failed');
    }

    return result.result.transactionId;
  }

  private async waitForConfirmation(txId: string): Promise<void> {
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await this.client.getTransactionStatus(txId);

      if (result.ok && result.result.isAccepted) {
        console.log('Confirmed!');
        return;
      }
    }

    throw new Error('Confirmation timeout');
  }
}

interface Payment {
  address: string;
  amount: string;
  metadata?: any;
}

interface BatchResult {
  successful: Array<Payment & { txId: string; timestamp: Date }>;
  failed: Array<Payment & { error: string; timestamp: Date }>;
  totalFees: bigint;
}

// Usage
const processor = new BatchPaymentProcessor(client, wallet);

const payments: Payment[] = [
  { address: 'hoosat:qz95mwas...', amount: HoosatUtils.amountToSompi('1.0') },
  { address: 'hoosat:qzk8h2q7...', amount: HoosatUtils.amountToSompi('0.5') },
  { address: 'hoosat:qpm4n7r8...', amount: HoosatUtils.amountToSompi('0.25') },
  { address: 'hoosat:qab3cd4e...', amount: HoosatUtils.amountToSompi('0.1') },
  { address: 'hoosat:qef5gh6i...', amount: HoosatUtils.amountToSompi('2.0') }
];

const result = await processor.sendBatch(payments);

// Check results
for (const payment of result.successful) {
  console.log(`✓ Sent ${HoosatUtils.sompiToAmount(payment.amount)} HTN to ${payment.address}`);
  console.log(`  TX: ${payment.txId}`);
}

for (const payment of result.failed) {
  console.error(`✗ Failed to send to ${payment.address}: ${payment.error}`);
}
```

## Payment Queue System

### Persistent Queue with Retry

```typescript
interface QueuedPayment extends Payment {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  txId?: string;
  error?: string;
}

class PaymentQueue {
  private queue: QueuedPayment[] = [];
  private processor: BatchPaymentProcessor;
  private maxAttempts: number = 3;
  private processing: boolean = false;

  constructor(processor: BatchPaymentProcessor) {
    this.processor = processor;
  }

  addPayment(address: string, amount: string, metadata?: any): string {
    const id = this.generateId();

    const payment: QueuedPayment = {
      id,
      address,
      amount,
      metadata,
      status: 'pending',
      attempts: 0
    };

    this.queue.push(payment);
    console.log(`Payment queued: ${id}`);

    return id;
  }

  addPayments(payments: Payment[]): string[] {
    return payments.map(p => this.addPayment(p.address, p.amount, p.metadata));
  }

  async processQueue(): Promise<void> {
    if (this.processing) {
      console.log('Queue is already being processed');
      return;
    }

    this.processing = true;
    console.log(`Processing queue (${this.getPendingCount()} pending)...`);

    while (this.getPendingCount() > 0) {
      // Get pending payments
      const pending = this.queue.filter(p => p.status === 'pending');
      const batch = pending.slice(0, 10);  // Process up to 10 payments

      if (batch.length === 0) break;

      // Mark as processing
      for (const payment of batch) {
        payment.status = 'processing';
        payment.attempts++;
        payment.lastAttempt = new Date();
      }

      // Process batch
      try {
        const result = await this.processor.sendBatch(
          batch.map(p => ({ address: p.address, amount: p.amount, metadata: p.metadata }))
        );

        // Update successful payments
        for (const success of result.successful) {
          const payment = batch.find(p => p.address === success.address);
          if (payment) {
            payment.status = 'completed';
            payment.txId = success.txId;
          }
        }

        // Update failed payments
        for (const failure of result.failed) {
          const payment = batch.find(p => p.address === failure.address);
          if (payment) {
            if (payment.attempts >= this.maxAttempts) {
              payment.status = 'failed';
              payment.error = failure.error;
            } else {
              payment.status = 'pending';  // Retry
            }
          }
        }

      } catch (error) {
        console.error('Batch processing error:', error);

        // Mark all as pending for retry
        for (const payment of batch) {
          if (payment.attempts >= this.maxAttempts) {
            payment.status = 'failed';
            payment.error = error.message;
          } else {
            payment.status = 'pending';
          }
        }
      }

      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    this.processing = false;
    console.log('Queue processing complete');
  }

  getStatus(id: string): QueuedPayment | undefined {
    return this.queue.find(p => p.id === id);
  }

  getPendingCount(): number {
    return this.queue.filter(p => p.status === 'pending').length;
  }

  getCompletedCount(): number {
    return this.queue.filter(p => p.status === 'completed').length;
  }

  getFailedCount(): number {
    return this.queue.filter(p => p.status === 'failed').length;
  }

  printSummary(): void {
    console.log('\n=== Queue Summary ===');
    console.log(`Total: ${this.queue.length}`);
    console.log(`Pending: ${this.getPendingCount()}`);
    console.log(`Completed: ${this.getCompletedCount()}`);
    console.log(`Failed: ${this.getFailedCount()}`);
    console.log('====================\n');
  }

  private generateId(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  exportResults(): QueuedPayment[] {
    return [...this.queue];
  }
}

// Usage
const queue = new PaymentQueue(processor);

// Add individual payments
queue.addPayment('hoosat:qz95mwas...', HoosatUtils.amountToSompi('1.0'));
queue.addPayment('hoosat:qzk8h2q7...', HoosatUtils.amountToSompi('0.5'));
queue.addPayment('hoosat:qpm4n7r8...', HoosatUtils.amountToSompi('0.25'));

// Or add multiple
const payments: Payment[] = [
  { address: 'hoosat:qab3cd4e...', amount: HoosatUtils.amountToSompi('0.1') },
  { address: 'hoosat:qef5gh6i...', amount: HoosatUtils.amountToSompi('2.0') }
];
queue.addPayments(payments);

// Process
await queue.processQueue();

// Check results
queue.printSummary();

// Export for logging/reporting
const results = queue.exportResults();
console.log(JSON.stringify(results, null, 2));
```

## CSV Batch Payments

### Process Payments from CSV

```typescript
import * as fs from 'fs';
import * as csv from 'csv-parser';

interface CSVPayment {
  address: string;
  amount_htn: string;
  description?: string;
}

async function processCSVPayments(csvFilePath: string): Promise<void> {
  const payments: Payment[] = [];

  // Read CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row: CSVPayment) => {
        // Validate address
        if (!HoosatUtils.isValidAddress(row.address)) {
          console.warn(`Skipping invalid address: ${row.address}`);
          return;
        }

        // Validate amount
        if (!HoosatUtils.isValidAmount(row.amount_htn)) {
          console.warn(`Skipping invalid amount for ${row.address}: ${row.amount_htn}`);
          return;
        }

        // Convert HTN to sompi
        const amount = HoosatUtils.amountToSompi(row.amount_htn);

        payments.push({
          address: row.address,
          amount,
          metadata: { description: row.description }
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Loaded ${payments.length} payments from CSV`);

  // Calculate total
  const total = payments.reduce((sum, p) => sum + BigInt(p.amount), 0n);
  console.log(`Total amount: ${HoosatUtils.sompiToAmount(total)} HTN`);

  // Confirm with user
  console.log('\nPayments to be sent:');
  for (let i = 0; i < Math.min(5, payments.length); i++) {
    console.log(`  ${payments[i].address}: ${HoosatUtils.sompiToAmount(payments[i].amount)} HTN`);
  }
  if (payments.length > 5) {
    console.log(`  ... and ${payments.length - 5} more`);
  }

  // Process
  const processor = new BatchPaymentProcessor(client, wallet);
  const result = await processor.sendBatch(payments);

  // Generate report
  const reportPath = `${csvFilePath}.report.json`;
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`Report saved to: ${reportPath}`);
}

// Usage
await processCSVPayments('./payments.csv');
```

**Example CSV format:**
```csv
address,amount_htn,description
hoosat:qz95mwas8ja7ucsernv9z335rdxxqswff7wvzenl29qukn5qs3lsqfsa4pd74,1.0,Alice payment
hoosat:qzk8h2q7wn9p3j5m6x4r8t5v3w9y2k4m7p8q6r9t3v5w8x2z4b7c9d,0.5,Bob payment
hoosat:qpm4n7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0,0.25,Charlie payment
```

## Exchange Withdrawal System

### Multi-user Withdrawal Batching

```typescript
class WithdrawalProcessor {
  private client: HoosatClient;
  private hotWallet: KeyPair;
  private pendingWithdrawals: Map<string, Withdrawal[]> = new Map();
  private batchInterval: number = 60000;  // 1 minute
  private minBatchSize: number = 2;

  constructor(client: HoosatClient, hotWallet: KeyPair) {
    this.client = client;
    this.hotWallet = hotWallet;
  }

  async requestWithdrawal(
    userId: string,
    address: string,
    amount: string
  ): Promise<string> {
    // Validate
    if (!HoosatUtils.isValidAddress(address)) {
      throw new Error('Invalid address');
    }

    if (!HoosatUtils.isValidAmount(amount)) {
      throw new Error('Invalid amount');
    }

    // Create withdrawal
    const withdrawal: Withdrawal = {
      id: this.generateWithdrawalId(),
      userId,
      address,
      amount,
      status: 'pending',
      requestedAt: new Date()
    };

    // Add to queue
    if (!this.pendingWithdrawals.has(userId)) {
      this.pendingWithdrawals.set(userId, []);
    }
    this.pendingWithdrawals.get(userId)!.push(withdrawal);

    console.log(`Withdrawal requested: ${withdrawal.id}`);
    console.log(`Amount: ${HoosatUtils.sompiToAmount(amount)} HTN`);
    console.log(`Address: ${address}`);

    return withdrawal.id;
  }

  async processPendingWithdrawals(): Promise<void> {
    const allWithdrawals = Array.from(this.pendingWithdrawals.values()).flat();
    const pending = allWithdrawals.filter(w => w.status === 'pending');

    if (pending.length < this.minBatchSize) {
      console.log(`Only ${pending.length} pending withdrawals - waiting for more`);
      return;
    }

    console.log(`Processing ${pending.length} withdrawals...`);

    // Group by 2 (max recipients per tx)
    const processor = new BatchPaymentProcessor(this.client, this.hotWallet);

    const payments: Payment[] = pending.map(w => ({
      address: w.address,
      amount: w.amount,
      metadata: { withdrawalId: w.id, userId: w.userId }
    }));

    try {
      const result = await processor.sendBatch(payments);

      // Update successful withdrawals
      for (const success of result.successful) {
        const withdrawal = pending.find(
          w => w.id === success.metadata.withdrawalId
        );

        if (withdrawal) {
          withdrawal.status = 'completed';
          withdrawal.txId = success.txId;
          withdrawal.completedAt = new Date();

          // Notify user
          await this.notifyUser(withdrawal.userId, {
            type: 'withdrawal_complete',
            withdrawalId: withdrawal.id,
            txId: success.txId
          });
        }
      }

      // Update failed withdrawals
      for (const failure of result.failed) {
        const withdrawal = pending.find(
          w => w.id === failure.metadata.withdrawalId
        );

        if (withdrawal) {
          withdrawal.status = 'failed';
          withdrawal.error = failure.error;

          // Notify user
          await this.notifyUser(withdrawal.userId, {
            type: 'withdrawal_failed',
            withdrawalId: withdrawal.id,
            error: failure.error
          });
        }
      }

    } catch (error) {
      console.error('Batch processing failed:', error);

      // Mark all as failed
      for (const withdrawal of pending) {
        withdrawal.status = 'failed';
        withdrawal.error = error.message;
      }
    }
  }

  startAutomaticProcessing(): void {
    console.log(`Starting automatic withdrawal processing (every ${this.batchInterval}ms)`);

    setInterval(async () => {
      try {
        await this.processPendingWithdrawals();
      } catch (error) {
        console.error('Auto-processing error:', error);
      }
    }, this.batchInterval);
  }

  private generateWithdrawalId(): string {
    return `WD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private async notifyUser(userId: string, notification: any): Promise<void> {
    // Implement your notification system
    console.log(`[Notify ${userId}]`, notification);
  }
}

interface Withdrawal {
  id: string;
  userId: string;
  address: string;
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  txId?: string;
  error?: string;
}

// Usage
const withdrawalProcessor = new WithdrawalProcessor(client, hotWallet);

// Start automatic processing
withdrawalProcessor.startAutomaticProcessing();

// Users request withdrawals
await withdrawalProcessor.requestWithdrawal(
  'user123',
  'hoosat:qz95mwas...',
  HoosatUtils.amountToSompi('1.0')
);

await withdrawalProcessor.requestWithdrawal(
  'user456',
  'hoosat:qzk8h2q7...',
  HoosatUtils.amountToSompi('0.5')
);

// Processor will automatically batch and send every minute
```

## Best Practices

### 1. Validate Before Batching

```typescript
function validatePayments(payments: Payment[]): Payment[] {
  return payments.filter(p => {
    if (!HoosatUtils.isValidAddress(p.address)) {
      console.warn(`Invalid address: ${p.address}`);
      return false;
    }

    if (!HoosatUtils.isValidAmount(p.amount)) {
      console.warn(`Invalid amount: ${p.amount}`);
      return false;
    }

    return true;
  });
}

const validPayments = validatePayments(payments);
console.log(`${validPayments.length}/${payments.length} payments are valid`);
```

### 2. Check Balance Before Starting

```typescript
const totalNeeded = payments.reduce(
  (sum, p) => sum + BigInt(p.amount),
  0n
);

const estimatedTotalFees = BigInt(payments.length / 2) * 100000n;  // Rough estimate
const balanceResult = await client.getBalance(wallet.address);

if (balanceResult.ok) {
  const balance = BigInt(balanceResult.result.balance);

  if (balance < totalNeeded + estimatedTotalFees) {
    throw new Error(
      `Insufficient balance. Need ${HoosatUtils.sompiToAmount(totalNeeded + estimatedTotalFees)} HTN, ` +
      `have ${HoosatUtils.sompiToAmount(balance)} HTN`
    );
  }
}
```

### 3. Implement Retry Logic

```typescript
async function sendBatchWithRetry(
  payments: Payment[],
  maxRetries: number = 3
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processor.sendBatch(payments);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      console.log('Retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 4. Log Everything

```typescript
const logFile = `batch-${Date.now()}.log`;

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;

  console.log(message);
  fs.appendFileSync(logFile, line);
}

log('Starting batch payment process');
log(`Processing ${payments.length} payments`);
log(`Total amount: ${HoosatUtils.sompiToAmount(total)} HTN`);
```

### 5. Monitor and Alert

```typescript
async function sendBatchWithMonitoring(payments: Payment[]): Promise<void> {
  const startTime = Date.now();

  try {
    const result = await processor.sendBatch(payments);

    const duration = (Date.now() - startTime) / 1000;

    // Success metrics
    console.log(`Batch completed in ${duration}s`);
    console.log(`Success rate: ${result.successful.length}/${payments.length}`);

    // Alert if low success rate
    if (result.failed.length > payments.length * 0.1) {
      await sendAlert(`High failure rate: ${result.failed.length}/${payments.length} failed`);
    }

  } catch (error) {
    await sendAlert(`Batch processing failed: ${error.message}`);
    throw error;
  }
}

async function sendAlert(message: string): Promise<void> {
  // Implement your alerting system (email, SMS, Slack, etc.)
  console.error('[ALERT]', message);
}
```

## Next Steps

- [Transaction Guide](./transactions.md) - Detailed transaction building
- [Real-time Monitoring](./real-time-monitoring.md) - Monitor payments
- [Security Best Practices](./security.md) - Secure your applications
