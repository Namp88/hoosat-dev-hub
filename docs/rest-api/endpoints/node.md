---
sidebar_position: 1
---

# Node Endpoints

Endpoints for querying node information, status, and metrics.

## Get Node Information

Get comprehensive information about the connected Hoosat node.

**Endpoint:** `GET /node/info`

**Response:**
```json
{
  "success": true,
  "data": {
    "p2pId": "a2bb90a5d6c686ebc5d933e157a28263",
    "mempoolSize": "45",
    "serverVersion": "0.1.0",
    "isUtxoIndexed": true,
    "isSynced": true
  },
  "timestamp": 1760025889814,
  "path": "/api/v1/node/info"
}
```

**Fields:**
- `p2pId` - Unique P2P identifier of the node
- `mempoolSize` - Number of transactions in mempool
- `serverVersion` - Node server version
- `isUtxoIndexed` - Whether node has UTXO index enabled (required for transaction status checks)
- `isSynced` - Whether node is fully synced with network

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/node/info
```

---

## Get Blue Score

Get the virtual selected parent blue score, representing the current blockchain height.

**Endpoint:** `GET /node/blue-score`

**Response:**
```json
{
  "success": true,
  "data": {
    "blueScore": "76311430"
  },
  "timestamp": 1760025889814,
  "path": "/api/v1/node/blue-score"
}
```

**Fields:**
- `blueScore` - Current blue score (similar to block height in traditional blockchains)

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/node/blue-score
```

**Use Cases:**
- Track blockchain progress
- Sync status monitoring
- Block explorer displays

---

## Estimate Network Hashrate

Estimate the network's total hashing power over a specified window of blocks.

**Endpoint:** `GET /node/estimate-hashrate`

**Query Parameters:**
- `windowSize` (optional) - Number of blocks to analyze (default: 1000)
- `startHash` (optional) - Starting block hash for analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "networkHashesPerSecond": "1500000000000"
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/node/estimate-hashrate?windowSize=1000"
}
```

**Fields:**
- `networkHashesPerSecond` - Estimated network hashrate in hashes/second

**Examples:**

Default window (1000 blocks):
```bash
curl https://proxy.hoosat.net/api/v1/node/estimate-hashrate
```

Custom window size:
```bash
curl "https://proxy.hoosat.net/api/v1/node/estimate-hashrate?windowSize=2000"
```

**Use Cases:**
- Mining profitability calculations
- Network security metrics
- Historical hashrate tracking

---

## Get Coin Supply

Get information about circulating and maximum coin supply.

**Endpoint:** `GET /node/coin-supply`

**Response:**
```json
{
  "success": true,
  "data": {
    "circulatingSupply": "478778043973829854",
    "maxSupply": "1710000000000000000"
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/node/coin-supply"
}
```

**Fields:**
- `circulatingSupply` - Current circulating supply in sompi (1 HTN = 100,000,000 sompi)
- `maxSupply` - Maximum supply in sompi

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/node/coin-supply
```

**Converting Sompi to HTN:**
```javascript
const circulatingHTN = parseInt(circulatingSupply) / 100000000;
const maxHTN = parseInt(maxSupply) / 100000000;
```

**Use Cases:**
- Market cap calculations
- Economic analysis
- Block explorer statistics

---

## Health Check

Check if the node connection is healthy and responding.

**Endpoint:** `GET /node/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "healthy": true
  },
  "timestamp": 1760026085383,
  "path": "/api/v1/node/health"
}
```

**Fields:**
- `healthy` - Boolean indicating if node is healthy

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/node/health
```

**Use Cases:**
- Service monitoring
- Load balancer health checks
- Uptime monitoring systems

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://proxy.hoosat.net/api/v1';

// Get node info
async function getNodeInfo() {
  const response = await fetch(`${BASE_URL}/node/info`);
  const result = await response.json();

  if (result.success) {
    console.log('Node version:', result.data.serverVersion);
    console.log('Is synced:', result.data.isSynced);
    console.log('UTXO indexed:', result.data.isUtxoIndexed);
  }
}

// Get current blue score
async function getBlueScore() {
  const response = await fetch(`${BASE_URL}/node/blue-score`);
  const result = await response.json();

  if (result.success) {
    console.log('Current blue score:', result.data.blueScore);
  }
}

// Estimate hashrate
async function getHashrate(windowSize = 1000) {
  const response = await fetch(
    `${BASE_URL}/node/estimate-hashrate?windowSize=${windowSize}`
  );
  const result = await response.json();

  if (result.success) {
    const hashrate = parseInt(result.data.networkHashesPerSecond);
    const terahashes = hashrate / 1e12;
    console.log(`Network hashrate: ${terahashes.toFixed(2)} TH/s`);
  }
}

// Get coin supply
async function getCoinSupply() {
  const response = await fetch(`${BASE_URL}/node/coin-supply`);
  const result = await response.json();

  if (result.success) {
    const circulating = parseInt(result.data.circulatingSupply) / 1e8;
    const max = parseInt(result.data.maxSupply) / 1e8;
    console.log(`Circulating: ${circulating.toLocaleString()} HTN`);
    console.log(`Max supply: ${max.toLocaleString()} HTN`);
  }
}
```

### Python

```python
import requests

BASE_URL = 'https://proxy.hoosat.net/api/v1'

def get_node_info():
    response = requests.get(f'{BASE_URL}/node/info')
    result = response.json()

    if result['success']:
        print(f"Node version: {result['data']['serverVersion']}")
        print(f"Is synced: {result['data']['isSynced']}")
        print(f"UTXO indexed: {result['data']['isUtxoIndexed']}")

def get_blue_score():
    response = requests.get(f'{BASE_URL}/node/blue-score')
    result = response.json()

    if result['success']:
        print(f"Current blue score: {result['data']['blueScore']}")

def get_hashrate(window_size=1000):
    response = requests.get(
        f'{BASE_URL}/node/estimate-hashrate',
        params={'windowSize': window_size}
    )
    result = response.json()

    if result['success']:
        hashrate = int(result['data']['networkHashesPerSecond'])
        terahashes = hashrate / 1e12
        print(f"Network hashrate: {terahashes:.2f} TH/s")
```

### cURL

```bash
# Get node info
curl https://proxy.hoosat.net/api/v1/node/info

# Get blue score
curl https://proxy.hoosat.net/api/v1/node/blue-score

# Estimate hashrate (custom window)
curl "https://proxy.hoosat.net/api/v1/node/estimate-hashrate?windowSize=2000"

# Get coin supply
curl https://proxy.hoosat.net/api/v1/node/coin-supply

# Health check
curl https://proxy.hoosat.net/api/v1/node/health
```

## Next Steps

- [Blockchain Endpoints](./blockchain.md) - Query blocks and DAG info
- [Address Endpoints](./address.md) - Check balances and UTXOs
- [Network Endpoints](./network.md) - Peer and network information
