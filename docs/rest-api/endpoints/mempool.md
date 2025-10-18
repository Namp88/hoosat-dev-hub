---
sidebar_position: 5
---

# Mempool Endpoints

Endpoints for querying pending transactions and estimating fees.

## Get Mempool Entry by Transaction ID

Retrieve a specific pending transaction from the mempool.

**Endpoint:** `GET /mempool/entry/:txId`

**Path Parameters:**
- `txId` - Transaction ID (64 hex characters)

**Query Parameters:**
- `includeOrphanPool` (optional) - Include orphan pool (default: `true`)
- `filterTransactionPool` (optional) - Filter transaction pool (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "transactionId": "abc123...",
      "inputs": [...],
      "outputs": [...],
      "version": 0,
      "lockTime": "0",
      "subnetworkId": "0000000000000000000000000000000000000000"
    },
    "fee": "1000",
    "mass": "1500",
    "isOrphan": false
  }
}
```

**Fields:**
- `transaction` - Full transaction data
- `fee` - Transaction fee in sompi
- `mass` - Transaction mass (size metric)
- `isOrphan` - Whether transaction is in orphan pool

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/mempool/entry/abc123def456789012345678901234567890123456789012345678901234abcd
```

---

## Get All Mempool Entries

Retrieve all pending transactions currently in the mempool.

**Endpoint:** `GET /mempool/entries`

**Query Parameters:**
- `includeOrphanPool` (optional) - Include orphan pool (default: `true`)
- `filterTransactionPool` (optional) - Filter transaction pool (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "transaction": {
          "transactionId": "abc123...",
          "inputs": [...],
          "outputs": [...],
          "version": 0,
          "lockTime": "0",
          "subnetworkId": "0000000000000000000000000000000000000000"
        },
        "fee": "1000",
        "mass": "1500",
        "isOrphan": false
      }
    ]
  }
}
```

**Example:**
```bash
curl "https://proxy.hoosat.net/api/v1/mempool/entries?includeOrphanPool=true&filterTransactionPool=false"
```

**Use Cases:**
- Monitor pending transactions
- Analyze network activity
- Fee market analysis
- Transaction broadcasting monitoring

---

## Get Mempool Entries by Addresses

Get pending transactions related to specific addresses.

**Endpoint:** `POST /mempool/entries-by-addresses`

**Request Body:**
```json
{
  "addresses": [
    "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe"
  ],
  "includeOrphanPool": false,
  "filterTransactionPool": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "address": "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe",
        "sending": [
          {
            "transaction": {...},
            "fee": "1000",
            "mass": "1500",
            "isOrphan": false
          }
        ],
        "receiving": [
          {
            "transaction": {...},
            "fee": "500",
            "mass": "1200",
            "isOrphan": false
          }
        ]
      }
    ]
  }
}
```

**Fields:**
- `entries` - Array of address-specific entries
  - `address` - The queried address
  - `sending` - Transactions where address is sending funds
  - `receiving` - Transactions where address is receiving funds

**Example:**
```bash
curl -X POST https://proxy.hoosat.net/api/v1/mempool/entries-by-addresses \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe"
    ]
  }'
```

---

## Get Fee Estimate

Estimate transaction fee based on mass and priority.

**Endpoint:** `GET /mempool/fee-estimate`

**Query Parameters:**
- `priority` (required) - Fee priority: `low`, `normal`, `high`, or `urgent`
- `inputs` (optional) - Number of inputs (default: 1)
- `outputs` (optional) - Number of outputs (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "feeRate": 1,
    "totalFee": "2500",
    "priority": "normal",
    "percentile": 0,
    "basedOnSamples": 0
  },
  "timestamp": 1760039577876,
  "path": "/api/v1/mempool/fee-estimate?priority=normal&inputs=1&outputs=1"
}
```

**Fields:**
- `feeRate` - Fee rate in sompi per mass unit
- `totalFee` - Total estimated fee in sompi
- `priority` - Requested priority level
- `percentile` - Fee percentile (for mempool-based estimation)
- `basedOnSamples` - Number of mempool samples used

**Examples:**

Normal priority, single input/output:
```bash
curl "https://proxy.hoosat.net/api/v1/mempool/fee-estimate?priority=normal&inputs=1&outputs=1"
```

High priority, multiple inputs:
```bash
curl "https://proxy.hoosat.net/api/v1/mempool/fee-estimate?priority=high&inputs=5&outputs=2"
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://proxy.hoosat.net/api/v1';

// Get all mempool entries
async function getMempoolEntries() {
  const response = await fetch(`${BASE_URL}/mempool/entries`);
  const result = await response.json();

  if (result.success) {
    const entries = result.data.entries;

    console.log(`Pending transactions: ${entries.length}`);

    // Calculate total fees
    const totalFees = entries.reduce((sum, entry) => {
      return sum + BigInt(entry.fee);
    }, 0n);

    console.log(`Total fees: ${Number(totalFees) / 1e8} HTN`);

    // Average fee
    const avgFee = totalFees / BigInt(entries.length);
    console.log(`Average fee: ${Number(avgFee) / 1e8} HTN`);

    return entries;
  }
}

// Get pending transactions for address
async function getPendingForAddress(address: string) {
  const response = await fetch(`${BASE_URL}/mempool/entries-by-addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses: [address] })
  });

  const result = await response.json();

  if (result.success && result.data.entries.length > 0) {
    const entry = result.data.entries[0];

    console.log(`Sending: ${entry.sending.length} transactions`);
    console.log(`Receiving: ${entry.receiving.length} transactions`);

    return entry;
  }
}

// Estimate fee for transaction
async function estimateFee(
  priority: 'low' | 'normal' | 'high' | 'urgent',
  inputs: number,
  outputs: number
) {
  const response = await fetch(
    `${BASE_URL}/mempool/fee-estimate?priority=${priority}&inputs=${inputs}&outputs=${outputs}`
  );

  const result = await response.json();

  if (result.success) {
    const { totalFee, feeRate } = result.data;

    console.log(`Fee rate: ${feeRate} sompi/mass`);
    console.log(`Total fee: ${Number(totalFee) / 1e8} HTN`);

    return totalFee;
  }
}

// Get recommended fee for all priorities
async function getAllFeeRecommendations(inputs = 1, outputs = 1) {
  const priorities = ['low', 'normal', 'high', 'urgent'] as const;

  const results = await Promise.all(
    priorities.map(async priority => {
      const response = await fetch(
        `${BASE_URL}/mempool/fee-estimate?priority=${priority}&inputs=${inputs}&outputs=${outputs}`
      );
      const result = await response.json();

      if (result.success) {
        return {
          priority,
          fee: result.data.totalFee,
          feeRate: result.data.feeRate
        };
      }
    })
  );

  return results.filter(Boolean);
}
```

### Python

```python
import requests

BASE_URL = 'https://proxy.hoosat.net/api/v1'

def get_mempool_entries():
    response = requests.get(f'{BASE_URL}/mempool/entries')
    result = response.json()

    if result['success']:
        entries = result['data']['entries']

        print(f"Pending transactions: {len(entries)}")

        # Calculate total fees
        total_fees = sum(int(entry['fee']) for entry in entries)
        print(f"Total fees: {total_fees / 1e8} HTN")

        # Average fee
        if entries:
            avg_fee = total_fees / len(entries)
            print(f"Average fee: {avg_fee / 1e8} HTN")

        return entries

def get_pending_for_address(address):
    response = requests.post(
        f'{BASE_URL}/mempool/entries-by-addresses',
        json={'addresses': [address]}
    )
    result = response.json()

    if result['success'] and result['data']['entries']:
        entry = result['data']['entries'][0]

        print(f"Sending: {len(entry['sending'])} transactions")
        print(f"Receiving: {len(entry['receiving'])} transactions")

        return entry

def estimate_fee(priority='normal', inputs=1, outputs=1):
    response = requests.get(
        f'{BASE_URL}/mempool/fee-estimate',
        params={
            'priority': priority,
            'inputs': inputs,
            'outputs': outputs
        }
    )
    result = response.json()

    if result['success']:
        total_fee = result['data']['totalFee']
        fee_rate = result['data']['feeRate']

        print(f"Fee rate: {fee_rate} sompi/mass")
        print(f"Total fee: {int(total_fee) / 1e8} HTN")

        return total_fee
```

### Wallet Integration

```typescript
// Build transaction with automatic fee estimation
async function buildTransactionWithFee(
  utxos: any[],
  recipientAddress: string,
  amountHtn: number,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
) {
  // Estimate fee based on UTXO count
  const feeEstimate = await estimateFee(priority, utxos.length, 2); // 2 outputs (recipient + change)
  const feeSompi = BigInt(feeEstimate);
  const amountSompi = BigInt(Math.floor(amountHtn * 1e8));

  // Calculate total needed
  const totalNeeded = amountSompi + feeSompi;

  // Select UTXOs
  let totalInput = 0n;
  const selectedUtxos = [];

  for (const utxo of utxos) {
    selectedUtxos.push(utxo);
    totalInput += BigInt(utxo.utxoEntry.amount);

    if (totalInput >= totalNeeded) break;
  }

  if (totalInput < totalNeeded) {
    throw new Error('Insufficient funds (including fee)');
  }

  const changeSompi = totalInput - amountSompi - feeSompi;

  return {
    inputs: selectedUtxos,
    outputs: [
      { address: recipientAddress, amount: amountSompi.toString() },
      { address: 'your-address', amount: changeSompi.toString() }
    ],
    fee: feeSompi.toString()
  };
}
```

## Use Cases

### Transaction Status Monitor

Monitor when your transaction enters/leaves mempool:

```typescript
async function monitorTransaction(txId: string) {
  const checkInterval = 5000; // 5 seconds

  const check = async () => {
    try {
      const response = await fetch(`${BASE_URL}/mempool/entry/${txId}`);
      const result = await response.json();

      if (result.success) {
        console.log('Transaction in mempool');
        console.log(`Fee: ${Number(result.data.fee) / 1e8} HTN`);
        console.log(`Mass: ${result.data.mass}`);
        return true;
      } else {
        console.log('Transaction not in mempool (may be confirmed)');
        return false;
      }
    } catch (error) {
      console.log('Transaction not found');
      return false;
    }
  };

  return setInterval(check, checkInterval);
}
```

## Next Steps

- [Transaction Endpoints](./transaction.md) - Submit and track transactions
- [Address Endpoints](./address.md) - Get UTXOs for transaction building
- [Browser SDK](../../sdk-web/intro.md) - Use with HoosatTxBuilder
