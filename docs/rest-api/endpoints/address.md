---
sidebar_position: 3
---

# Address Endpoints

Endpoints for querying address balances and UTXOs (Unspent Transaction Outputs).

## Get Single Address Balance

Get the balance for a specific Hoosat address.

**Endpoint:** `GET /address/:address/balance`

**Path Parameters:**
- `address` - Hoosat address (with `hoosat:` or `hoosattest:` prefix)

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": "1000000000"
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/address/{{address}}/balance"
}
```

**Fields:**
- `balance` - Balance in sompi (1 HTN = 100,000,000 sompi)

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/address/hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe/balance
```

**Converting Sompi to HTN:**
```javascript
const htn = parseInt(balance) / 100000000;
```

---

## Get Multiple Address Balances

Get balances for multiple addresses in a single request (max 1000 addresses).

**Endpoint:** `POST /address/balances`

**Request Body:**
```json
{
  "addresses": [
    "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe",
    "hoosat:qyp4ka9p6mlc2gfrd08m5zau9q4jt4mj93k3gnq9f0x4zcwglmqkgxgjhqk7g"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balances": [
      {
        "address": "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe",
        "balance": "1000000000"
      },
      {
        "address": "hoosat:qyp4ka9p6mlc2gfrd08m5zau9q4jt4mj93k3gnq9f0x4zcwglmqkgxgjhqk7g",
        "balance": "500000000"
      }
    ]
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/address/balances"
}
```

**Example:**
```bash
curl -X POST https://proxy.hoosat.net/api/v1/address/balances \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe",
      "hoosat:qyp4ka9p6mlc2gfrd08m5zau9q4jt4mj93k3gnq9f0x4zcwglmqkgxgjhqk7g"
    ]
  }'
```

---

## Get UTXOs for Addresses

Get all unspent transaction outputs (UTXOs) for specified addresses (max 1000 addresses).

**Endpoint:** `POST /address/utxos`

**Request Body:**
```json
{
  "addresses": [
    "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "utxos": [
      {
        "address": "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe",
        "outpoint": {
          "transactionId": "abc123def456789012345678901234567890123456789012345678901234abcd",
          "index": 0
        },
        "utxoEntry": {
          "amount": "100000000",
          "scriptPublicKey": {
            "version": 0,
            "scriptPublicKey": "def456..."
          },
          "blockDaaScore": "50000",
          "isCoinbase": false
        }
      },
      {
        "address": "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe",
        "outpoint": {
          "transactionId": "ghi789...",
          "index": 1
        },
        "utxoEntry": {
          "amount": "900000000",
          "scriptPublicKey": {
            "version": 0,
            "scriptPublicKey": "jkl012..."
          },
          "blockDaaScore": "55000",
          "isCoinbase": true
        }
      }
    ]
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/address/utxos"
}
```

**UTXO Fields:**
- `address` - Address that owns this UTXO
- `outpoint` - Transaction output reference
  - `transactionId` - Transaction hash
  - `index` - Output index in transaction
- `utxoEntry` - UTXO details
  - `amount` - Amount in sompi
  - `scriptPublicKey` - Locking script
  - `blockDaaScore` - DAA score when created
  - `isCoinbase` - Whether this is a coinbase transaction (mining reward)

**Example:**
```bash
curl -X POST https://proxy.hoosat.net/api/v1/address/utxos \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe"
    ]
  }'
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://proxy.hoosat.net/api/v1';

// Get single address balance
async function getBalance(address: string) {
  const response = await fetch(`${BASE_URL}/address/${address}/balance`);
  const result = await response.json();

  if (result.success) {
    const sompi = BigInt(result.data.balance);
    const htn = Number(sompi) / 100000000;
    console.log(`Balance: ${htn} HTN`);
    return htn;
  }
}

// Get multiple balances
async function getMultipleBalances(addresses: string[]) {
  const response = await fetch(`${BASE_URL}/address/balances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses })
  });

  const result = await response.json();

  if (result.success) {
    return result.data.balances.map(item => ({
      address: item.address,
      htn: Number(BigInt(item.balance)) / 100000000
    }));
  }
}

// Get UTXOs for transaction building
async function getUtxos(addresses: string[]) {
  const response = await fetch(`${BASE_URL}/address/utxos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses })
  });

  const result = await response.json();

  if (result.success) {
    return result.data.utxos;
  }
}

// Calculate total balance from UTXOs
function calculateTotalBalance(utxos: any[]) {
  return utxos.reduce((total, utxo) => {
    return total + BigInt(utxo.utxoEntry.amount);
  }, 0n);
}

// Example: Get balance and UTXOs
async function getAddressInfo(address: string) {
  const [balanceRes, utxosRes] = await Promise.all([
    fetch(`${BASE_URL}/address/${address}/balance`),
    fetch(`${BASE_URL}/address/utxos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: [address] })
    })
  ]);

  const balance = await balanceRes.json();
  const utxos = await utxosRes.json();

  if (balance.success && utxos.success) {
    console.log('Balance:', Number(BigInt(balance.data.balance)) / 1e8, 'HTN');
    console.log('UTXO count:', utxos.data.utxos.length);

    // Separate mature and immature (coinbase) UTXOs
    const mature = utxos.data.utxos.filter(u => !u.utxoEntry.isCoinbase);
    const immature = utxos.data.utxos.filter(u => u.utxoEntry.isCoinbase);

    console.log('Mature UTXOs:', mature.length);
    console.log('Immature UTXOs (coinbase):', immature.length);

    return { balance: balance.data.balance, utxos: utxos.data.utxos };
  }
}
```

### Python

```python
import requests

BASE_URL = 'https://proxy.hoosat.net/api/v1'

def get_balance(address):
    response = requests.get(f'{BASE_URL}/address/{address}/balance')
    result = response.json()

    if result['success']:
        sompi = int(result['data']['balance'])
        htn = sompi / 100000000
        print(f'Balance: {htn} HTN')
        return htn

def get_multiple_balances(addresses):
    response = requests.post(
        f'{BASE_URL}/address/balances',
        json={'addresses': addresses}
    )
    result = response.json()

    if result['success']:
        return [
            {
                'address': item['address'],
                'htn': int(item['balance']) / 100000000
            }
            for item in result['data']['balances']
        ]

def get_utxos(addresses):
    response = requests.post(
        f'{BASE_URL}/address/utxos',
        json={'addresses': addresses}
    )
    result = response.json()

    if result['success']:
        return result['data']['utxos']

def calculate_total_balance(utxos):
    return sum(int(utxo['utxoEntry']['amount']) for utxo in utxos)
```

### Wallet Use Case

```typescript
// Build transaction from UTXOs
async function prepareTransaction(
  senderAddress: string,
  recipientAddress: string,
  amountHtn: number
) {
  // Get sender's UTXOs
  const utxos = await getUtxos([senderAddress]);

  if (!utxos || utxos.length === 0) {
    throw new Error('No UTXOs available');
  }

  const amountSompi = BigInt(Math.floor(amountHtn * 100000000));
  let selectedUtxos = [];
  let totalInput = 0n;

  // Select UTXOs to cover amount + fee
  for (const utxo of utxos) {
    // Skip immature coinbase UTXOs
    if (utxo.utxoEntry.isCoinbase) continue;

    selectedUtxos.push(utxo);
    totalInput += BigInt(utxo.utxoEntry.amount);

    // Break if we have enough (+ estimated fee)
    if (totalInput >= amountSompi + 5000n) break;
  }

  if (totalInput < amountSompi) {
    throw new Error('Insufficient balance');
  }

  return {
    inputs: selectedUtxos,
    totalInput,
    amount: amountSompi
  };
}
```

## Next Steps

- [Transaction Endpoints](./transaction.md) - Submit transactions using UTXOs
- [Mempool Endpoints](./mempool.md) - Check pending transactions
- [Browser SDK](../../sdk-web/intro.md) - Use with Browser SDK for wallet apps
