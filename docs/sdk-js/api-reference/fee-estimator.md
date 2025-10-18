---
sidebar_position: 4
---

# HoosatFeeEstimator API Reference

Dynamic fee estimation based on real-time network conditions.

## Overview

`HoosatFeeEstimator` analyzes the mempool to provide optimal fee recommendations:
- Network-aware fee calculation
- Four priority levels (Low, Normal, High, Urgent)
- Intelligent caching
- Outlier filtering
- Mass-based fee calculation

## Constructor

### `new HoosatFeeEstimator(client: HoosatClient, config?: FeeEstimatorConfig)`

Create a new fee estimator.

**Parameters:**
```typescript
interface FeeEstimatorConfig {
  cacheDuration?: number;  // Cache duration in ms (default: 60000 - 1 minute)
  debug?: boolean;         // Enable debug logging (default: false)
}
```

**Example:**
```typescript
const estimator = new HoosatFeeEstimator(client, {
  cacheDuration: 30000,  // 30 seconds
  debug: true
});
```

## Fee Estimation

### `estimateFee(priority: FeePriority, inputsCount: number, outputsCount: number)`

Estimate fee for a specific transaction.

**Parameters:**
- `priority` - Fee priority level
- `inputsCount` - Number of transaction inputs
- `outputsCount` - Number of transaction outputs

**Returns:** `Promise<FeeEstimate>`

```typescript
interface FeeEstimate {
  feeRate: number;      // Sompi per byte
  totalFee: string;     // Total fee in sompi
  priority: FeePriority;
}

enum FeePriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Urgent = 'urgent'
}
```

**Example:**
```typescript
const feeEstimate = await estimator.estimateFee(
  FeePriority.Normal,
  2,  // inputs
  2   // outputs (1 recipient + 1 change)
);

console.log('Fee rate:', feeEstimate.feeRate, 'sompi/byte');
console.log('Total fee:', feeEstimate.totalFee, 'sompi');
console.log('HTN:', HoosatUtils.sompiToAmount(feeEstimate.totalFee));

// Use with transaction builder
builder.setFee(feeEstimate.totalFee);
```

### `getRecommendations(forceRefresh?: boolean)`

Get fee recommendations for all priority levels.

**Parameters:**
- `forceRefresh` - Bypass cache and fetch fresh data (default: false)

**Returns:** `Promise<FeeRecommendations>`

```typescript
interface FeeRecommendations {
  low: FeeEstimate;
  normal: FeeEstimate;
  high: FeeEstimate;
  urgent: FeeEstimate;
  mempoolSize: number;
  timestamp: number;
  medianFeeRate: number;
  averageFeeRate: number;
}
```

**Example:**
```typescript
const recs = await estimator.getRecommendations();

console.log('Mempool size:', recs.mempoolSize, 'transactions');
console.log('Median fee rate:', recs.medianFeeRate, 'sompi/byte');
console.log('Average fee rate:', recs.averageFeeRate, 'sompi/byte');
console.log();

console.log('Fee Recommendations:');
console.log('Low:', recs.low.feeRate, 'sompi/byte');
console.log('Normal:', recs.normal.feeRate, 'sompi/byte');
console.log('High:', recs.high.feeRate, 'sompi/byte');
console.log('Urgent:', recs.urgent.feeRate, 'sompi/byte');

// Let user choose priority
const selectedPriority = userChoice; // 'low', 'normal', 'high', 'urgent'
const fee = recs[selectedPriority];
```

## Priority Levels

### Low Priority (0.5x multiplier)

**Use for:**
- Non-urgent transactions
- UTXO consolidation
- Transactions with no time constraints
- Cost optimization

**Characteristics:**
- Lowest fee
- Slower confirmation (may take several blocks)
- Good for maintenance operations

**Example:**
```typescript
const fee = await estimator.estimateFee(FeePriority.Low, inputs, outputs);
```

### Normal Priority (1.0x multiplier)

**Use for:**
- Standard transactions
- Most common use case
- Regular payments
- Default choice

**Characteristics:**
- Balanced fee/speed
- Usually confirms within 1-2 blocks
- Recommended for most transactions

**Example:**
```typescript
const fee = await estimator.estimateFee(FeePriority.Normal, inputs, outputs);
```

### High Priority (2.0x multiplier)

**Use for:**
- Time-sensitive payments
- Exchange withdrawals
- Important transactions

**Characteristics:**
- Higher fee
- Faster confirmation
- Priority in mempool

**Example:**
```typescript
const fee = await estimator.estimateFee(FeePriority.High, inputs, outputs);
```

### Urgent Priority (5.0x multiplier)

**Use for:**
- Critical transactions
- Emergency payments
- Network congestion

**Characteristics:**
- Highest fee
- Fastest confirmation
- Top priority

**Example:**
```typescript
const fee = await estimator.estimateFee(FeePriority.Urgent, inputs, outputs);
```

## Cache Management

### `clearCache()`

Clear the fee recommendations cache.

**Returns:** `void`

**Example:**
```typescript
estimator.clearCache();

// Next call will fetch fresh data
const recs = await estimator.getRecommendations();
```

### `setCacheDuration(duration: number)`

Update cache duration.

**Parameters:**
- `duration` - Cache duration in milliseconds

**Returns:** `void`

**Example:**
```typescript
// Cache for 2 minutes
estimator.setCacheDuration(120000);
```

## Fee Calculation

### How It Works

1. **Fetch mempool data** - Get all pending transactions
2. **Extract fee rates** - Calculate fee/mass for each transaction
3. **Remove outliers** - Filter using IQR (Interquartile Range) method
4. **Calculate median** - Base fee rate from cleaned data
5. **Apply multipliers** - Generate priority-based rates
6. **Calculate total** - Multiply by transaction mass

### Transaction Mass Formula

```
Mass = (inputs × 1700) + (outputs × 1700) + 10
```

**Example calculation:**
```
Inputs: 2
Outputs: 2
Mass = (2 × 1700) + (2 × 1700) + 10 = 6810

Fee rate: 10 sompi/byte
Total fee = 6810 × 10 = 68,100 sompi
```

### Fallback Strategy

When mempool is empty or data is insufficient:

```typescript
// Default fee rates (sompi/byte)
const FALLBACK_FEE_RATES = {
  low: 1,
  normal: 10,
  high: 20,
  urgent: 50
};
```

## Network Conditions

### Detecting Congestion

```typescript
const recs = await estimator.getRecommendations();

if (recs.mempoolSize > 100) {
  console.log('Network is congested');
  console.log('Consider using higher priority');

  // Automatically adjust
  const priority = recs.mempoolSize > 200
    ? FeePriority.High
    : FeePriority.Normal;

  const fee = await estimator.estimateFee(priority, inputs, outputs);
}
```

### Optimal Fee Selection

```typescript
async function selectOptimalFee(inputsCount: number, outputsCount: number) {
  const recs = await estimator.getRecommendations();

  // Choose based on mempool size
  let priority: FeePriority;

  if (recs.mempoolSize < 50) {
    priority = FeePriority.Low;  // Network is quiet
  } else if (recs.mempoolSize < 150) {
    priority = FeePriority.Normal;  // Normal activity
  } else {
    priority = FeePriority.High;  // Congested
  }

  return estimator.estimateFee(priority, inputsCount, outputsCount);
}
```

## Complete Example

```typescript
import {
  HoosatClient,
  HoosatFeeEstimator,
  FeePriority,
  HoosatUtils
} from 'hoosat-sdk';

async function demonstrateFeeEstimation() {
  const client = new HoosatClient({
    host: '54.38.176.95',
    port: 42420
  });

  // Create estimator with 30-second cache
  const estimator = new HoosatFeeEstimator(client, {
    cacheDuration: 30000
  });

  // Get all recommendations
  console.log('Fetching fee recommendations...\n');
  const recs = await estimator.getRecommendations();

  console.log('Network Status:');
  console.log(`Mempool: ${recs.mempoolSize} transactions`);
  console.log(`Median fee: ${recs.medianFeeRate} sompi/byte`);
  console.log(`Average fee: ${recs.averageFeeRate} sompi/byte`);
  console.log();

  console.log('Recommended Fee Rates:');
  console.log(`Low:    ${recs.low.feeRate} sompi/byte`);
  console.log(`Normal: ${recs.normal.feeRate} sompi/byte`);
  console.log(`High:   ${recs.high.feeRate} sompi/byte`);
  console.log(`Urgent: ${recs.urgent.feeRate} sompi/byte`);
  console.log();

  // Estimate for specific transaction
  const inputsCount = 2;
  const outputsCount = 2;

  console.log(`Transaction: ${inputsCount} inputs, ${outputsCount} outputs\n`);

  for (const priority of ['low', 'normal', 'high', 'urgent'] as FeePriority[]) {
    const estimate = await estimator.estimateFee(
      priority,
      inputsCount,
      outputsCount
    );

    const htn = HoosatUtils.sompiToAmount(estimate.totalFee);

    console.log(`${priority.toUpperCase()}:`);
    console.log(`  Fee: ${estimate.totalFee} sompi (${htn} HTN)`);
    console.log(`  Rate: ${estimate.feeRate} sompi/byte`);
  }

  client.disconnect();
}

demonstrateFeeEstimation();
```

## Best Practices

### 1. Cache Appropriately

```typescript
// Production: longer cache for cost savings
const estimator = new HoosatFeeEstimator(client, {
  cacheDuration: 60000  // 1 minute
});

// Real-time apps: shorter cache
const estimator = new HoosatFeeEstimator(client, {
  cacheDuration: 10000  // 10 seconds
});
```

### 2. Handle Network Conditions

```typescript
const recs = await estimator.getRecommendations();

if (recs.mempoolSize === 0) {
  console.log('Mempool is empty - use minimum fee');
  return FeePriority.Low;
}

if (recs.mempoolSize > 200) {
  console.log('High congestion - recommend high priority');
  return FeePriority.High;
}

return FeePriority.Normal;
```

### 3. Let Users Choose

```typescript
// Show options to users
const recs = await estimator.getRecommendations();

console.log('Fee options:');
console.log(`Slow (${HoosatUtils.sompiToAmount(recs.low.totalFee)} HTN)`);
console.log(`Normal (${HoosatUtils.sompiToAmount(recs.normal.totalFee)} HTN)`);
console.log(`Fast (${HoosatUtils.sompiToAmount(recs.high.totalFee)} HTN)`);

const choice = await getUserChoice();
```

### 4. Monitor Mempool

```typescript
// Periodically check network conditions
setInterval(async () => {
  const recs = await estimator.getRecommendations(true); // Force refresh

  if (recs.mempoolSize > threshold) {
    notifyUser('Network congestion detected');
  }
}, 60000);  // Check every minute
```

## Next Steps

- [HoosatTxBuilder](./tx-builder.md) - Use fees with transaction builder
- [Fee Guide](../guides/fee-management.md) - Detailed fee management guide
- [Examples](../examples/transaction) - Fee estimation examples
