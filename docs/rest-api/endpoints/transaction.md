---
sidebar_position: 6
---

# Transaction Endpoints

Endpoints for submitting signed transactions and checking transaction status.

## Submit Transaction

Submit a signed transaction to the network for processing and inclusion in the blockchain.

**Endpoint:** `POST /transaction/submit`

**Request Body:**
```json
{
  "version": 0,
  "inputs": [
    {
      "previousOutpoint": {
        "transactionId": "abc123...",
        "index": 0
      },
      "signatureScript": "4830450221...",
      "sequence": "0",
      "sigOpCount": 1
    }
  ],
  "outputs": [
    {
      "amount": "100000000",
      "scriptPublicKey": {
        "version": 0,
        "scriptPublicKey": "206bd6ab37f28d83b57291055ffcc20178b9eacad709fd56a633bcf742cd4fcf41ac"
      }
    }
  ],
  "lockTime": "0",
  "subnetworkId": "0000000000000000000000000000000000000000",
  "gas": "0",
  "payload": "",
  "allowOrphan": false
}
```

**Request Fields:**
- `version` - Transaction version (0)
- `inputs` - Array of transaction inputs
  - `previousOutpoint` - Reference to UTXO being spent
    - `transactionId` - Transaction hash
    - `index` - Output index
  - `signatureScript` - Signature script (hex)
  - `sequence` - Input sequence (usually "0")
  - `sigOpCount` - Signature operation count
- `outputs` - Array of transaction outputs
  - `amount` - Amount in sompi
  - `scriptPublicKey` - Locking script
- `lockTime` - Transaction lock time ("0")
- `subnetworkId` - Subnetwork ID (all zeros for mainnet)
- `gas` - Gas amount ("0")
- `payload` - Optional payload data
- `allowOrphan` (optional) - Allow orphan transactions (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "abc123def456789012345678901234567890123456789012345678901234abcd"
  }
}
```

**Example:**
```bash
curl -X POST https://proxy.hoosat.net/api/v1/transaction/submit \
  -H "Content-Type: application/json" \
  -d '{
    "version": 0,
    "inputs": [{
      "previousOutpoint": {
        "transactionId": "abc123...",
        "index": 0
      },
      "signatureScript": "4830450221...",
      "sequence": "0",
      "sigOpCount": 1
    }],
    "outputs": [{
      "amount": "100000000",
      "scriptPublicKey": {
        "version": 0,
        "scriptPublicKey": "206bd6ab..."
      }
    }],
    "lockTime": "0",
    "subnetworkId": "0000000000000000000000000000000000000000",
    "gas": "0",
    "payload": ""
  }'
```

---

## Get Transaction Status

Check if a transaction is PENDING (in mempool), CONFIRMED (in blockchain), or NOT_FOUND.

**Endpoint:** `GET /transaction/:txId/status`

**Path Parameters:**
- `txId` - Transaction ID (hash)

**Query Parameters:**
- `senderAddress` (required) - Sender address
- `recipientAddress` (required) - Recipient address

**Important:** Node must be started with `--utxoindex` flag for CONFIRMED status detection.

**Response (PENDING):**
```json
{
  "success": true,
  "data": {
    "status": "PENDING",
    "details": {
      "txId": "abc123def456...",
      "inMempool": true,
      "isOrphan": false,
      "fee": "1000000",
      "mass": "250",
      "message": "Transaction is in mempool, waiting for confirmation"
    }
  },
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/transaction/abc123def456.../status"
}
```

**Response (CONFIRMED):**
```json
{
  "success": true,
  "data": {
    "status": "CONFIRMED",
    "details": {
      "txId": "abc123def456...",
      "inMempool": false,
      "blockDaaScore": "123456",
      "confirmedAmount": "50000000",
      "confirmedAddress": "hoosat:qzrecipient456...",
      "isCoinbase": false,
      "message": "Transaction confirmed in blockchain"
    }
  },
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/transaction/abc123def456.../status"
}
```

**Response (NOT_FOUND):**
```json
{
  "success": true,
  "data": {
    "status": "NOT_FOUND",
    "details": {
      "txId": "abc123def456...",
      "inMempool": false,
      "message": "Transaction not found in mempool or UTXOs. Possible reasons: transaction was rejected, UTXOs already spent, or node does not have UTXO index enabled (--utxoindex flag)"
    }
  },
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/transaction/abc123def456.../status"
}
```

**Status Meanings:**
- `PENDING` - Transaction is in mempool, waiting for confirmation
- `CONFIRMED` - Transaction has been included in a block
- `NOT_FOUND` - Transaction not found (may be rejected, invalid, or UTXOs spent)

**Example:**
```bash
curl "https://proxy.hoosat.net/api/v1/transaction/abc123def456.../status?senderAddress=hoosat:qzsender...&recipientAddress=hoosat:qzrecipient..."
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://proxy.hoosat.net/api/v1';

// Submit transaction
async function submitTransaction(signedTx: any) {
  const response = await fetch(`${BASE_URL}/transaction/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signedTx)
  });

  const result = await response.json();

  if (result.success) {
    console.log('Transaction submitted!');
    console.log('TX ID:', result.data.transactionId);
    return result.data.transactionId;
  } else {
    throw new Error(`Failed to submit: ${result.error}`);
  }
}

// Check transaction status
async function getTransactionStatus(
  txId: string,
  senderAddress: string,
  recipientAddress: string
) {
  const params = new URLSearchParams({
    senderAddress,
    recipientAddress
  });

  const response = await fetch(
    `${BASE_URL}/transaction/${txId}/status?${params}`
  );

  const result = await response.json();

  if (result.success) {
    const { status, details } = result.data;

    console.log(`Status: ${status}`);
    console.log(`Message: ${details.message}`);

    switch (status) {
      case 'PENDING':
        console.log(`Fee: ${Number(details.fee) / 1e8} HTN`);
        console.log(`Mass: ${details.mass}`);
        console.log(`Is orphan: ${details.isOrphan}`);
        break;

      case 'CONFIRMED':
        console.log(`Block DAA Score: ${details.blockDaaScore}`);
        console.log(`Amount: ${Number(details.confirmedAmount) / 1e8} HTN`);
        console.log(`Address: ${details.confirmedAddress}`);
        break;

      case 'NOT_FOUND':
        console.log('Transaction not found in network');
        break;
    }

    return status;
  }
}

// Wait for confirmation
async function waitForConfirmation(
  txId: string,
  senderAddress: string,
  recipientAddress: string,
  maxAttempts = 60
): Promise<boolean> {
  console.log('Waiting for confirmation...');

  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTransactionStatus(txId, senderAddress, recipientAddress);

    if (status === 'CONFIRMED') {
      console.log('Transaction confirmed!');
      return true;
    }

    if (status === 'NOT_FOUND') {
      console.log('Transaction not found (may be rejected)');
      return false;
    }

    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Checking... (${i + 1}/${maxAttempts})`);
  }

  console.log('Timeout waiting for confirmation');
  return false;
}

// Complete transaction flow
async function sendTransaction(
  signedTx: any,
  senderAddress: string,
  recipientAddress: string
) {
  try {
    // Submit transaction
    const txId = await submitTransaction(signedTx);

    // Wait for confirmation
    const confirmed = await waitForConfirmation(
      txId,
      senderAddress,
      recipientAddress
    );

    if (confirmed) {
      console.log('Transaction successful!');
      return { success: true, txId };
    } else {
      console.log('Transaction failed or timed out');
      return { success: false, txId };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}
```

### Python

```python
import requests
import time

BASE_URL = 'https://proxy.hoosat.net/api/v1'

def submit_transaction(signed_tx):
    response = requests.post(
        f'{BASE_URL}/transaction/submit',
        json=signed_tx
    )
    result = response.json()

    if result['success']:
        tx_id = result['data']['transactionId']
        print(f'Transaction submitted! TX ID: {tx_id}')
        return tx_id
    else:
        raise Exception(f"Failed to submit: {result['error']}")

def get_transaction_status(tx_id, sender_address, recipient_address):
    response = requests.get(
        f'{BASE_URL}/transaction/{tx_id}/status',
        params={
            'senderAddress': sender_address,
            'recipientAddress': recipient_address
        }
    )
    result = response.json()

    if result['success']:
        status = result['data']['status']
        details = result['data']['details']

        print(f"Status: {status}")
        print(f"Message: {details['message']}")

        if status == 'PENDING':
            print(f"Fee: {int(details['fee']) / 1e8} HTN")
            print(f"Mass: {details['mass']}")

        elif status == 'CONFIRMED':
            print(f"Block DAA Score: {details['blockDaaScore']}")
            print(f"Amount: {int(details['confirmedAmount']) / 1e8} HTN")

        return status

def wait_for_confirmation(tx_id, sender_address, recipient_address, max_attempts=60):
    print('Waiting for confirmation...')

    for i in range(max_attempts):
        status = get_transaction_status(tx_id, sender_address, recipient_address)

        if status == 'CONFIRMED':
            print('Transaction confirmed!')
            return True

        if status == 'NOT_FOUND':
            print('Transaction not found')
            return False

        time.sleep(2)
        print(f'Checking... ({i + 1}/{max_attempts})')

    print('Timeout waiting for confirmation')
    return False
```

### Using with Browser SDK

```typescript
import { HoosatTxBuilder, HoosatWebClient, HoosatUtils } from 'hoosat-sdk-web';

const client = new HoosatWebClient({
  baseUrl: 'https://proxy.hoosat.net/api/v1'
});

async function sendHoosat(
  privateKey: Buffer,
  senderAddress: string,
  recipientAddress: string,
  amountHtn: number
) {
  // Get UTXOs
  const utxosResult = await client.getUtxos([senderAddress]);
  const utxos = utxosResult.utxos;

  if (utxos.length === 0) {
    throw new Error('No UTXOs available');
  }

  // Get fee estimate
  const feeEstimate = await client.getFeeEstimate();

  // Build transaction
  const builder = new HoosatTxBuilder();

  utxos.forEach(utxo => {
    builder.addInput(utxo, privateKey);
  });

  builder
    .addOutput(recipientAddress, HoosatUtils.amountToSompi(amountHtn.toString()))
    .setFee(feeEstimate.normalPriority.toString())
    .addChangeOutput(senderAddress);

  // Sign transaction
  const signedTx = builder.sign();

  // Submit transaction
  const submitResult = await client.submitTransaction(signedTx);
  const txId = submitResult.transactionId;

  console.log('Transaction submitted:', txId);

  // Wait for confirmation
  const confirmed = await waitForConfirmation(
    txId,
    senderAddress,
    recipientAddress
  );

  return { txId, confirmed };
}
```

### Error Handling

```typescript
async function submitWithRetry(signedTx: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const txId = await submitTransaction(signedTx);
      return txId;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Transaction Lifecycle

```
1. Build Transaction
   ↓
2. Sign Transaction
   ↓
3. Submit to Network (POST /transaction/submit)
   ↓
4. Transaction in Mempool (Status: PENDING)
   ↓
5. Miner includes in block
   ↓
6. Transaction Confirmed (Status: CONFIRMED)
```

## Common Errors

### Insufficient Funds

```json
{
  "success": false,
  "error": "Insufficient funds",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/transaction/submit"
}
```

**Solution:** Ensure UTXOs cover amount + fee

### Invalid Signature

```json
{
  "success": false,
  "error": "Invalid signature",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/transaction/submit"
}
```

**Solution:** Verify transaction was signed with correct private key

### Duplicate Transaction

```json
{
  "success": false,
  "error": "Transaction already exists",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "path": "/api/v1/transaction/submit"
}
```

**Solution:** Transaction already submitted, check status instead

## Best Practices

1. **Always estimate fees** before submitting
2. **Monitor transaction status** after submission
3. **Implement retry logic** with exponential backoff
4. **Validate addresses** before building transaction
5. **Check UTXO availability** before spending
6. **Handle errors gracefully** with user-friendly messages
7. **Use appropriate priority** for fee estimation

## Next Steps

- [Mempool Endpoints](./mempool.md) - Fee estimation and mempool monitoring
- [Address Endpoints](./address.md) - Get UTXOs for transaction building
- [Browser SDK](../../sdk-web/intro.md) - Complete transaction building examples
- [Node.js SDK](../../sdk-js/intro.md) - Advanced transaction operations
