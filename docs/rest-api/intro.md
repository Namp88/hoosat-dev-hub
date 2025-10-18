---
sidebar_position: 1
---

# REST API Overview

Public REST API for Hoosat blockchain. Provides HTTP endpoints for accessing node information, blockchain data, addresses, mempool, and transaction operations.

## Base URL

**Production**: `https://proxy.hoosat.net/api/v1`

**Local Development**: `http://localhost:3000/api/v1`

## Key Features

- **RESTful Design** - Standard HTTP methods (GET, POST)
- **Standardized Responses** - Consistent success/error format
- **Swagger Documentation** - Interactive API docs at `/docs`
- **Type Safety** - Built with TypeScript and NestJS
- **Production Ready** - Error handling, validation, health checks

## API Categories

### Node Information
Query node status, network hashrate, coin supply, and health.

**Endpoints:**
- `GET /node/info` - Node information
- `GET /node/blue-score` - Current blockchain height
- `GET /node/estimate-hashrate` - Network hashrate estimation
- `GET /node/coin-supply` - Circulating and max supply
- `GET /node/health` - Health check

### Blockchain
Access block data and DAG information.

**Endpoints:**
- `GET /blockchain/tip-hash` - Latest block hash
- `GET /blockchain/block/:hash` - Block by hash
- `GET /blockchain/blocks/:lowHash` - Multiple blocks
- `GET /blockchain/count` - Block count
- `GET /blockchain/dag-info` - DAG information

### Address
Check balances and UTXOs for addresses.

**Endpoints:**
- `GET /address/:address/balance` - Single address balance
- `POST /address/balances` - Multiple address balances
- `POST /address/utxos` - UTXOs for addresses

### Network
Get network and peer information.

**Endpoints:**
- `GET /network/info` - Current network
- `GET /network/peers` - Peer addresses
- `GET /network/connected-peers` - Connected peer details

### Mempool
Query pending transactions and fee estimates.

**Endpoints:**
- `GET /mempool/entry/:txId` - Single mempool entry
- `GET /mempool/entries` - All mempool entries
- `POST /mempool/entries-by-addresses` - Entries by addresses
- `GET /mempool/fee-estimate` - Fee estimation

### Transaction
Submit and track transactions.

**Endpoints:**
- `POST /transaction/submit` - Submit signed transaction
- `GET /transaction/:txId/status` - Transaction status

## Response Format

All endpoints return responses in this standardized format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/node/info"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/node/info"
}
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Rate Limiting

No rate limiting is currently enforced, but this may change in production deployments.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## Error Handling

The API uses standard HTTP status codes:

- **200** - Success
- **400** - Bad Request (invalid parameters)
- **404** - Not Found
- **500** - Internal Server Error

Error responses include descriptive messages to help debug issues.

## Interactive Documentation

Full interactive API documentation with request/response examples is available at:

**https://proxy.hoosat.net/docs** (Swagger UI)

## Quick Start

### Get Node Information

```bash
curl https://proxy.hoosat.net/api/v1/node/info
```

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

### Get Address Balance

```bash
curl https://proxy.hoosat.net/api/v1/address/hoosat:qz7ulu8mmmul6hdcnssmjnt28h2xfer8dz9nfqamvvh86ngef4q8dvzxcjdqe/balance
```

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

### Submit Transaction

```bash
curl -X POST https://proxy.hoosat.net/api/v1/transaction/submit \
  -H "Content-Type: application/json" \
  -d '{
    "version": 0,
    "inputs": [...],
    "outputs": [...],
    "lockTime": "0",
    "subnetworkId": "0000000000000000000000000000000000000000",
    "gas": "0",
    "payload": ""
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "abc123def456789012345678901234567890123456789012345678901234abcd"
  }
}
```

## SDK Integration

The REST API is used by the [Browser SDK](../sdk-web/intro.md) (`hoosat-sdk-web`) for all blockchain operations.

For Node.js applications, consider using the [Node.js SDK](../sdk-js/intro.md) (`hoosat-sdk`) which provides direct gRPC connection for better performance and event streaming.

## Next Steps

- [Node Endpoints](./endpoints/node.md) - Node information endpoints
- [Blockchain Endpoints](./endpoints/blockchain.md) - Block and DAG queries
- [Address Endpoints](./endpoints/address.md) - Balance and UTXO queries
- [Mempool Endpoints](./endpoints/mempool.md) - Mempool and fee estimation
- [Transaction Endpoints](./endpoints/transaction.md) - Transaction submission and status

## Links

- **Live API**: https://proxy.hoosat.net/api/v1
- **Swagger Docs**: https://proxy.hoosat.net/docs
- **GitHub**: https://github.com/Namp88/hoosat-proxy
- **NPM Package**: https://www.npmjs.com/package/hoosat-proxy
