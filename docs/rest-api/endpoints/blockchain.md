---
sidebar_position: 2
---

# Blockchain Endpoints

Endpoints for querying block data, DAG information, and blockchain statistics.

## Get Selected Tip Hash

Get the hash of the current virtual selected parent block (tip of the chain).

**Endpoint:** `GET /blockchain/tip-hash`

**Response:**
```json
{
  "success": true,
  "data": {
    "selectedTipHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd"
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/blockchain/tip-hash"
}
```

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/blockchain/tip-hash
```

---

## Get Block by Hash

Retrieve detailed block information including header, transactions, and metadata.

**Endpoint:** `GET /blockchain/block/:hash`

**Path Parameters:**
- `hash` - Block hash (64 hex characters)

**Query Parameters:**
- `includeTransactions` (optional) - Include full transaction data (default: `true`)

**Response:**
```json
{
  "success": true,
  "data": {
    "header": {
      "version": 5,
      "hashMerkleRoot": "37bb6ab1408c2a8c64b71d2c4176ffa1cb76f962bbcd6bbd061092096d3a5292",
      "acceptedIdMerkleRoot": "4e0f640c34a50423d314a5bb1ea7d78f05a29c6abe1be335a96ffd0a76362d4d",
      "utxoCommitment": "747de6177e2a30aa79ffd16e5167383084ee56dfe5a2403a75e957dd17f13b45",
      "timestamp": "1760029024561",
      "bits": 490169269,
      "nonce": "11676241686759156909",
      "daaScore": "78888773",
      "blueWork": "3128f9618679c69827",
      "blueScore": "76327178",
      "pruningPoint": "9b35e4979c5f3e5cc0a1d583ad00810f6e63e98fafa629f3914d85300bf227de",
      "parents": [...]
    },
    "transactions": [...],
    "verboseData": {
      "hash": "be2a28c935f24dd2f7d0638b2893c961a1d78a567d2541a9229e3b9e4095cf93",
      "difficulty": 38770604.55,
      "selectedParentHash": "ef3c43bc60a3ea1958316a052a49d8b60f28f5d5ea04ef30d0c8768dbd560264",
      "isHeaderOnly": false,
      "blueScore": "76327178",
      "isChainBlock": true,
      "transactionIds": ["bed378cdea445ef2b92ac897c7ae41902026b0116ff9b80139d84b3d3a4036ff"],
      "childrenHashes": [...],
      "mergeSetBluesHashes": [...],
      "mergeSetRedsHashes": []
    }
  }
}
```

**Examples:**

With transactions:
```bash
curl "https://proxy.hoosat.net/api/v1/blockchain/block/be2a28c935f24dd2f7d0638b2893c961a1d78a567d2541a9229e3b9e4095cf93?includeTransactions=true"
```

Without transactions (header only):
```bash
curl "https://proxy.hoosat.net/api/v1/blockchain/block/be2a28c935f24dd2f7d0638b2893c961a1d78a567d2541a9229e3b9e4095cf93?includeTransactions=false"
```

---

## Get Multiple Blocks

Retrieve multiple blocks starting from a specified hash up to the current virtual.

**Endpoint:** `GET /blockchain/blocks/:lowHash`

**Path Parameters:**
- `lowHash` - Starting block hash

**Query Parameters:**
- `includeTransactions` (optional) - Include full transaction data (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "blockHashes": [
      "54c77db8bbe710ddbb1338395d0685072f97c2806f5334731e099288abf080da"
    ],
    "blocks": [
      {
        "header": {...},
        "transactions": [...],
        "verboseData": {...}
      }
    ]
  }
}
```

**Example:**
```bash
curl "https://proxy.hoosat.net/api/v1/blockchain/blocks/54c77db8bbe710ddbb1338395d0685072f97c2806f5334731e099288abf080da?includeTransactions=true"
```

---

## Get Block Count

Get the current number of blocks and headers in the blockchain.

**Endpoint:** `GET /blockchain/count`

**Response:**
```json
{
  "success": true,
  "data": {
    "blockCount": "253743",
    "headerCount": "10133270"
  },
  "timestamp": 1760037252112,
  "path": "/api/v1/blockchain/count"
}
```

**Fields:**
- `blockCount` - Number of blocks with full data
- `headerCount` - Total number of block headers (including pruned blocks)

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/blockchain/count
```

---

## Get DAG Information

Get comprehensive information about the current state of the block DAG.

**Endpoint:** `GET /blockchain/dag-info`

**Response:**
```json
{
  "success": true,
  "data": {
    "networkName": "hoosat-mainnet",
    "blockCount": "253999",
    "headerCount": "10133526",
    "tipHashes": [
      "5bb88c97331a05348cef164edd872923c182640eedc81e1084a4343e84d24cd2",
      "fe1fe2bd9134d7aa031e193127fe08fc06fb72ccf0d42c5c602db0f895047eaf"
    ],
    "virtualParentHashes": [...],
    "difficulty": 36901597.14,
    "pastMedianTime": "1760037277736",
    "virtualDaaScore": "78930476",
    "pruningPointHash": "0ec12c311cb8c3025e773ed778427b3c58ea0dc7695344a6fbd50d09bc37df10"
  },
  "timestamp": 1760037301013,
  "path": "/api/v1/blockchain/dag-info"
}
```

**Fields:**
- `networkName` - Network identifier (mainnet/testnet)
- `blockCount` - Total blocks
- `headerCount` - Total headers
- `tipHashes` - Current DAG tips
- `virtualParentHashes` - Virtual block parent hashes
- `difficulty` - Current mining difficulty
- `pastMedianTime` - Median time of recent blocks
- `virtualDaaScore` - Current DAA (Difficulty Adjustment Algorithm) score
- `pruningPointHash` - Pruning point for block storage

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/blockchain/dag-info
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://proxy.hoosat.net/api/v1';

// Get latest block hash
async function getLatestBlockHash() {
  const response = await fetch(`${BASE_URL}/blockchain/tip-hash`);
  const result = await response.json();

  if (result.success) {
    return result.data.selectedTipHash;
  }
}

// Get block with transactions
async function getBlock(blockHash: string, includeTransactions = true) {
  const response = await fetch(
    `${BASE_URL}/blockchain/block/${blockHash}?includeTransactions=${includeTransactions}`
  );
  const result = await response.json();

  if (result.success) {
    const block = result.data;
    console.log('Block hash:', block.verboseData.hash);
    console.log('Blue score:', block.verboseData.blueScore);
    console.log('Difficulty:', block.verboseData.difficulty);
    console.log('Transactions:', block.transactions?.length || 0);

    return block;
  }
}

// Get blockchain statistics
async function getBlockchainStats() {
  const [countRes, dagRes] = await Promise.all([
    fetch(`${BASE_URL}/blockchain/count`),
    fetch(`${BASE_URL}/blockchain/dag-info`)
  ]);

  const count = await countRes.json();
  const dag = await dagRes.json();

  if (count.success && dag.success) {
    console.log('Blocks:', count.data.blockCount);
    console.log('Headers:', count.data.headerCount);
    console.log('Network:', dag.data.networkName);
    console.log('Difficulty:', dag.data.difficulty);
    console.log('DAA Score:', dag.data.virtualDaaScore);
  }
}

// Get latest block with details
async function getLatestBlock() {
  const tipHash = await getLatestBlockHash();
  if (tipHash) {
    return await getBlock(tipHash);
  }
}
```

### Python

```python
import requests

BASE_URL = 'https://proxy.hoosat.net/api/v1'

def get_latest_block_hash():
    response = requests.get(f'{BASE_URL}/blockchain/tip-hash')
    result = response.json()

    if result['success']:
        return result['data']['selectedTipHash']

def get_block(block_hash, include_transactions=True):
    response = requests.get(
        f'{BASE_URL}/blockchain/block/{block_hash}',
        params={'includeTransactions': str(include_transactions).lower()}
    )
    result = response.json()

    if result['success']:
        block = result['data']
        print(f"Block hash: {block['verboseData']['hash']}")
        print(f"Blue score: {block['verboseData']['blueScore']}")
        print(f"Difficulty: {block['verboseData']['difficulty']}")

        if 'transactions' in block:
            print(f"Transactions: {len(block['transactions'])}")

        return block

def get_blockchain_stats():
    count_response = requests.get(f'{BASE_URL}/blockchain/count')
    dag_response = requests.get(f'{BASE_URL}/blockchain/dag-info')

    count = count_response.json()
    dag = dag_response.json()

    if count['success'] and dag['success']:
        print(f"Blocks: {count['data']['blockCount']}")
        print(f"Headers: {count['data']['headerCount']}")
        print(f"Network: {dag['data']['networkName']}")
        print(f"Difficulty: {dag['data']['difficulty']}")
        print(f"DAA Score: {dag['data']['virtualDaaScore']}")
```

### Block Explorer Use Case

```typescript
// Block explorer: Display recent blocks
async function getRecentBlocks(count = 10) {
  const tipHash = await getLatestBlockHash();
  if (!tipHash) return [];

  const blocks = [];
  let currentHash = tipHash;

  for (let i = 0; i < count; i++) {
    const block = await getBlock(currentHash, false);
    if (!block) break;

    blocks.push({
      hash: block.verboseData.hash,
      blueScore: block.verboseData.blueScore,
      timestamp: new Date(parseInt(block.header.timestamp)),
      difficulty: block.verboseData.difficulty,
      transactionCount: block.verboseData.transactionIds.length
    });

    // Get parent block for next iteration
    currentHash = block.verboseData.selectedParentHash;
  }

  return blocks;
}
```

## Next Steps

- [Address Endpoints](./address.md) - Query balances and UTXOs
- [Transaction Endpoints](./transaction.md) - Submit and track transactions
- [Mempool Endpoints](./mempool.md) - Pending transactions
