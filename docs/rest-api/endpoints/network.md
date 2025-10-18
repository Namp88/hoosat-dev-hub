---
sidebar_position: 4
---

# Network Endpoints

Endpoints for querying network information and peer connectivity.

## Get Current Network

Get the network name that the node is currently running on.

**Endpoint:** `GET /network/info`

**Response:**
```json
{
  "success": true,
  "data": {
    "currentNetwork": "mainnet"
  }
}
```

**Fields:**
- `currentNetwork` - Network identifier (`mainnet` or `testnet`)

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/network/info
```

**Use Cases:**
- Verify correct network connection
- Display network badge in applications
- Network-specific logic (address prefixes, etc.)

---

## Get Peer Addresses

Get list of known peer addresses in the current network.

**Endpoint:** `GET /network/peers`

**Response:**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "address": "192.168.1.100:42420",
        "isIPv6": false,
        "host": "192.168.1.100",
        "port": 42420
      },
      {
        "address": "[2001:db8::1]:42420",
        "isIPv6": true,
        "host": "2001:db8::1",
        "port": 42420
      }
    ],
    "bannedAddresses": [
      {
        "address": "10.0.0.50:42420",
        "isIPv6": false,
        "host": "10.0.0.50",
        "port": 42420
      }
    ]
  }
}
```

**Fields:**
- `addresses` - List of known peer addresses
  - `address` - Full address with port
  - `isIPv6` - Whether address is IPv6
  - `host` - IP address
  - `port` - Port number
- `bannedAddresses` - List of banned peer addresses (same structure)

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/network/peers
```

---

## Get Connected Peer Information

Get detailed information about all currently connected peers.

**Endpoint:** `GET /network/connected-peers`

**Response:**
```json
{
  "success": true,
  "data": {
    "peers": [
      {
        "id": "abc123",
        "address": "192.168.1.100:42420",
        "lastPingDuration": 45,
        "isOutbound": true,
        "timeOffset": 0,
        "userAgent": "/hoosat:0.1.0/",
        "advertisedProtocolVersion": 5,
        "timeConnected": "1704902400000",
        "isIbdPeer": false
      },
      {
        "id": "def456",
        "address": "10.20.30.40:42420",
        "lastPingDuration": 120,
        "isOutbound": false,
        "timeOffset": -2,
        "userAgent": "/hoosat:0.1.0/",
        "advertisedProtocolVersion": 5,
        "timeConnected": "1704900000000",
        "isIbdPeer": true
      }
    ]
  }
}
```

**Fields:**
- `id` - Unique peer identifier
- `address` - Peer's network address
- `lastPingDuration` - Last ping time in milliseconds
- `isOutbound` - Whether connection is outbound
- `timeOffset` - Time difference with peer
- `userAgent` - Peer's client software version
- `advertisedProtocolVersion` - Protocol version supported
- `timeConnected` - When connection was established (timestamp)
- `isIbdPeer` - Whether peer is in Initial Block Download mode

**Example:**
```bash
curl https://proxy.hoosat.net/api/v1/network/connected-peers
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://proxy.hoosat.net/api/v1';

// Get current network
async function getCurrentNetwork() {
  const response = await fetch(`${BASE_URL}/network/info`);
  const result = await response.json();

  if (result.success) {
    console.log('Network:', result.data.currentNetwork);
    return result.data.currentNetwork;
  }
}

// Get peer addresses
async function getPeerAddresses() {
  const response = await fetch(`${BASE_URL}/network/peers`);
  const result = await response.json();

  if (result.success) {
    const { addresses, bannedAddresses } = result.data;

    console.log(`Known peers: ${addresses.length}`);
    console.log(`Banned peers: ${bannedAddresses.length}`);

    // Separate IPv4 and IPv6
    const ipv4 = addresses.filter(a => !a.isIPv6);
    const ipv6 = addresses.filter(a => a.isIPv6);

    console.log(`IPv4 peers: ${ipv4.length}`);
    console.log(`IPv6 peers: ${ipv6.length}`);

    return { addresses, bannedAddresses };
  }
}

// Get connected peers
async function getConnectedPeers() {
  const response = await fetch(`${BASE_URL}/network/connected-peers`);
  const result = await response.json();

  if (result.success) {
    const peers = result.data.peers;

    console.log(`Connected peers: ${peers.length}`);

    // Analyze connections
    const outbound = peers.filter(p => p.isOutbound);
    const inbound = peers.filter(p => !p.isOutbound);
    const ibdPeers = peers.filter(p => p.isIbdPeer);

    console.log(`Outbound: ${outbound.length}`);
    console.log(`Inbound: ${inbound.length}`);
    console.log(`IBD peers: ${ibdPeers.length}`);

    // Calculate average ping
    const avgPing = peers.reduce((sum, p) => sum + p.lastPingDuration, 0) / peers.length;
    console.log(`Average ping: ${avgPing.toFixed(2)}ms`);

    return peers;
  }
}

// Network health check
async function checkNetworkHealth() {
  const peers = await getConnectedPeers();

  if (!peers || peers.length === 0) {
    console.warn('No connected peers!');
    return false;
  }

  const avgPing = peers.reduce((sum, p) => sum + p.lastPingDuration, 0) / peers.length;

  if (avgPing > 500) {
    console.warn('High average ping:', avgPing);
  }

  const outboundCount = peers.filter(p => p.isOutbound).length;
  if (outboundCount === 0) {
    console.warn('No outbound connections!');
  }

  console.log('Network health: OK');
  return true;
}
```

### Python

```python
import requests

BASE_URL = 'https://proxy.hoosat.net/api/v1'

def get_current_network():
    response = requests.get(f'{BASE_URL}/network/info')
    result = response.json()

    if result['success']:
        print(f"Network: {result['data']['currentNetwork']}")
        return result['data']['currentNetwork']

def get_peer_addresses():
    response = requests.get(f'{BASE_URL}/network/peers')
    result = response.json()

    if result['success']:
        addresses = result['data']['addresses']
        banned = result['data']['bannedAddresses']

        print(f"Known peers: {len(addresses)}")
        print(f"Banned peers: {len(banned)}")

        # Separate IPv4 and IPv6
        ipv4 = [a for a in addresses if not a['isIPv6']]
        ipv6 = [a for a in addresses if a['isIPv6']]

        print(f"IPv4 peers: {len(ipv4)}")
        print(f"IPv6 peers: {len(ipv6)}")

        return addresses, banned

def get_connected_peers():
    response = requests.get(f'{BASE_URL}/network/connected-peers')
    result = response.json()

    if result['success']:
        peers = result['data']['peers']

        print(f"Connected peers: {len(peers)}")

        # Analyze connections
        outbound = [p for p in peers if p['isOutbound']]
        inbound = [p for p in peers if not p['isOutbound']]
        ibd_peers = [p for p in peers if p['isIbdPeer']]

        print(f"Outbound: {len(outbound)}")
        print(f"Inbound: {len(inbound)}")
        print(f"IBD peers: {len(ibd_peers)}")

        # Calculate average ping
        if peers:
            avg_ping = sum(p['lastPingDuration'] for p in peers) / len(peers)
            print(f"Average ping: {avg_ping:.2f}ms")

        return peers
```

### Network Monitor Dashboard

```typescript
// Create a network monitoring dashboard
interface NetworkStats {
  network: string;
  peerCount: number;
  connectedPeers: number;
  outboundConnections: number;
  inboundConnections: number;
  averagePing: number;
  ibdPeers: number;
}

async function getNetworkStats(): Promise<NetworkStats> {
  const [networkRes, peersRes, connectedRes] = await Promise.all([
    fetch(`${BASE_URL}/network/info`),
    fetch(`${BASE_URL}/network/peers`),
    fetch(`${BASE_URL}/network/connected-peers`)
  ]);

  const network = await networkRes.json();
  const peers = await peersRes.json();
  const connected = await connectedRes.json();

  if (network.success && peers.success && connected.success) {
    const connectedPeers = connected.data.peers;

    return {
      network: network.data.currentNetwork,
      peerCount: peers.data.addresses.length,
      connectedPeers: connectedPeers.length,
      outboundConnections: connectedPeers.filter(p => p.isOutbound).length,
      inboundConnections: connectedPeers.filter(p => !p.isOutbound).length,
      averagePing: connectedPeers.reduce((sum, p) => sum + p.lastPingDuration, 0) / connectedPeers.length,
      ibdPeers: connectedPeers.filter(p => p.isIbdPeer).length
    };
  }

  throw new Error('Failed to fetch network stats');
}

// Display network stats
async function displayNetworkStats() {
  const stats = await getNetworkStats();

  console.log('=== Network Statistics ===');
  console.log(`Network: ${stats.network}`);
  console.log(`Known peers: ${stats.peerCount}`);
  console.log(`Connected: ${stats.connectedPeers}`);
  console.log(`  - Outbound: ${stats.outboundConnections}`);
  console.log(`  - Inbound: ${stats.inboundConnections}`);
  console.log(`Average ping: ${stats.averagePing.toFixed(2)}ms`);
  console.log(`IBD peers: ${stats.ibdPeers}`);
}
```

## Use Cases

### Network Validation

Ensure you're connected to the correct network before performing operations:

```typescript
async function validateNetwork(expectedNetwork: 'mainnet' | 'testnet') {
  const network = await getCurrentNetwork();

  if (network !== expectedNetwork) {
    throw new Error(`Wrong network! Expected ${expectedNetwork}, got ${network}`);
  }

  return true;
}
```

### Peer Discovery

List available peers for manual connection:

```typescript
async function discoverPeers() {
  const { addresses } = await getPeerAddresses();

  return addresses.map(peer => ({
    host: peer.host,
    port: peer.port,
    protocol: peer.isIPv6 ? 'IPv6' : 'IPv4'
  }));
}
```

## Next Steps

- [Node Endpoints](./node.md) - Node information and status
- [Blockchain Endpoints](./blockchain.md) - Block and DAG queries
- [Mempool Endpoints](./mempool.md) - Transaction pool information
