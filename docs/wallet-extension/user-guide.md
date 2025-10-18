---
sidebar_position: 3
---

# User Guide

Complete guide for using Hoosat Wallet Extension.

## Installation

### Chrome / Edge / Brave

1. Visit [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
2. Click "Add to Chrome" / "Add to Edge" / "Add to Brave"
3. Click "Add extension" in the popup
4. The Hoosat Wallet icon will appear in your browser toolbar

### Manual Installation (Developer Mode)

1. Download the latest release from [GitHub](https://github.com/Namp88/hoosat-web-extension/releases)
2. Extract the ZIP file
3. Open `chrome://extensions/` in your browser
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the extracted `dist` folder
7. Pin the extension to your toolbar for easy access

## First Time Setup

### Create New Wallet

1. Click the Hoosat Wallet icon in your toolbar
2. Click "Create New Wallet"
3. Create a strong password:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
4. **IMPORTANT**: Write down your private key
   - Keep it in a secure, offline location
   - Never share it with anyone
   - You'll need it to recover your wallet
5. Click "Continue"
6. Your wallet is ready!

### Import Existing Wallet

1. Click the Hoosat Wallet icon
2. Click "Import Wallet"
3. Enter your private key (64 hex characters)
4. Create a password for this device
5. Click "Import"
6. Your wallet is imported!

## Basic Operations

### View Balance

Your balance is displayed on the main screen:

```
Balance: 10.5 HTN
```

The balance auto-updates every 10 seconds when the wallet is open.

### Send HTN

1. Click "Send" on the main screen
2. Enter recipient address
   - Format: `hoosat:qp4ad2eh72xc8...`
   - Or paste from clipboard
3. Enter amount in HTN
   - Example: `1.5` for 1.5 HTN
   - Your available balance is shown below
4. Review the fee
   - Default fee is calculated automatically
   - Click "Customize" to set a custom fee
5. Click "Send"
6. Confirm the transaction
7. Wait for confirmation (usually a few seconds)
8. You'll see "Transaction sent!" with the TX ID

**Tips:**
- Double-check the recipient address
- Start with small amounts for testing
- Higher fees = faster confirmation

### Receive HTN

1. Click "Receive" on the main screen
2. Your address is displayed
3. Share your address:
   - Click "Copy" to copy to clipboard
   - Show the QR code for scanning
   - Share via messaging apps

**Tips:**
- You can receive multiple times to the same address
- No need to generate new addresses
- QR code is perfect for in-person payments

### Fee Management

#### Auto Fee (Recommended)

The wallet automatically calculates a reasonable fee based on:
- Network congestion
- Transaction size
- Current fee rates

#### Custom Fee

For advanced users:

1. When sending, click "Customize Fee"
2. Enter fee in sompi
   - Minimum: Usually 1000-2000 sompi
   - Normal: 2500-5000 sompi
   - High: 10000+ sompi
3. Warnings:
   - Too low: Transaction may be delayed
   - Too high: You'll see a warning

**Fee Estimates:**
- Normal transaction: ~2500 sompi (0.000025 HTN)
- Large transaction: ~5000 sompi (0.00005 HTN)

## Security Features

### Password

Your password protects your wallet on this device:

- Required to unlock the wallet
- Required to send transactions
- Required to export private key
- Cannot be recovered if lost!

**Change Password:**
1. Go to Settings
2. Click "Change Password"
3. Enter current password
4. Enter new password (must meet requirements)
5. Confirm new password
6. Click "Change Password"

### Auto-Lock

Your wallet automatically locks after 30 minutes of inactivity.

**Grace Period:**
- After locking, you have 2 minutes to unlock without password
- After 2 minutes, password is required

**Manual Lock:**
1. Open the wallet
2. Go to Settings
3. Click "Lock Wallet"

### Private Key Export

**⚠️ DANGER ZONE - Handle with extreme care!**

1. Go to Settings
2. Scroll to "Private Key Export"
3. Click "Export Private Key"
4. Enter your password
5. Your private key is revealed
6. **Copy it and store securely!**
7. Click "Done"

**Security Tips:**
- Never share your private key
- Store it offline (paper, hardware wallet, etc.)
- Never type it on untrusted devices
- Consider multiple backup locations

## DApp Integration

### Connecting to DApps

When you visit a Hoosat dApp:

1. The dApp will request connection
2. Hoosat Wallet popup appears
3. Review the connection request:
   - Website URL
   - Permissions requested
4. Click "Connect" or "Reject"
5. If connected, you'll see a confirmation

**What dApps Can Do:**
- See your address
- Request balance information
- Ask you to sign transactions
- Ask you to sign messages

**What dApps CANNOT Do:**
- Access your private key
- Send transactions without your approval
- See your password

### Approving Transactions

When a dApp requests a transaction:

1. Hoosat Wallet popup appears
2. Review transaction details:
   - **Recipient** - Who receives the funds
   - **Amount** - How much HTN
   - **Fee** - Transaction fee
   - **Website** - Which dApp is requesting
3. Click "Approve" or "Reject"
4. If approved, transaction is sent
5. You'll see the TX ID

**Security Checks:**
- Verify the recipient address
- Confirm the amount is correct
- Check the website URL (phishing!)
- Be cautious of high fees

### Signing Messages

When a dApp requests message signing:

1. Hoosat Wallet popup appears
2. Review:
   - **Message** - What you're signing
   - **Website** - Which dApp is requesting
   - **Timestamp** - When request was made
3. Click "Sign" or "Reject"
4. If approved, signature is returned to dApp

**Use Cases:**
- "Sign in with Hoosat" authentication
- Proof of address ownership
- DAO voting
- NFT marketplace listings

**Security:**
- Read the message carefully
- Don't sign suspicious messages
- Check website URL
- Old requests (>5 min) show warnings

### Managing Connected Sites

View and disconnect from dApps:

1. Go to Settings
2. Scroll to "Connected Sites"
3. See list of connected dApps:
   - Website URL
   - Connection date
4. Click "Disconnect" to revoke access

**Best Practices:**
- Review connected sites regularly
- Disconnect from unused dApps
- Be selective about connections

## Settings

### View in Settings

- **Network** - Current network (mainnet/testnet)
- **Version** - Extension version number
- **Connected Sites** - Manage dApp connections
- **Change Password** - Update your password
- **Lock Wallet** - Lock immediately
- **Export Private Key** - Backup your key

## Troubleshooting

### Wallet Won't Unlock

**Problem:** Password not working

**Solutions:**
1. Check Caps Lock
2. Try typing password slowly
3. Make sure password meets requirements
4. If forgotten, you must restore from private key

### Transaction Pending

**Problem:** Transaction not confirming

**Solutions:**
1. Wait - normal confirmation is 2-10 seconds
2. Check blockchain explorer
3. Try sending with higher fee
4. Contact support if stuck

### Balance Not Updating

**Problem:** Balance shows old amount

**Solutions:**
1. Close and reopen the wallet
2. Wait 10 seconds for auto-refresh
3. Check if you're on correct network
4. Verify address is correct

### DApp Won't Connect

**Problem:** Connection request not appearing

**Solutions:**
1. Refresh the web page
2. Check if wallet is unlocked
3. Try clicking connect again
4. Check browser console for errors
5. Make sure extension is enabled

### Extension Not Appearing

**Problem:** Can't find wallet icon

**Solutions:**
1. Check if extension is enabled
2. Pin extension to toolbar:
   - Click puzzle icon in toolbar
   - Find "Hoosat Wallet"
   - Click pin icon
3. Restart browser

## Best Practices

### Security

✅ **DO:**
- Use a strong, unique password
- Backup your private key offline
- Verify all transaction details
- Check website URLs before connecting
- Review connected sites regularly
- Test with small amounts first
- Keep your password secret
- Update the extension regularly

❌ **DON'T:**
- Share your private key with anyone
- Use the same password as other accounts
- Click suspicious links
- Connect to untrusted websites
- Skip transaction confirmations
- Ignore security warnings
- Store private key digitally
- Use wallet on public computers

### Privacy

- Each wallet has one address
- All transactions are public on blockchain
- Consider using multiple wallets for privacy
- Don't reuse addresses across identities

### Backup

**Multiple Backups:**
1. Write private key on paper
2. Store in secure location
3. Consider fireproof/waterproof container
4. Make multiple copies
5. Store in different locations

**Test Recovery:**
- Periodically test importing your backup
- Verify you can read your handwriting
- Ensure backup is up-to-date

## FAQ

**Q: Can I use the same wallet on multiple devices?**

A: Yes! Export your private key and import it on another device.

**Q: What happens if I forget my password?**

A: You'll need to restore your wallet using your private key.

**Q: Can I have multiple wallets?**

A: Currently, only one wallet per extension. Multi-account support is planned.

**Q: Is my private key stored online?**

A: No! It's encrypted and stored locally on your device only.

**Q: Can the developers access my funds?**

A: No! This is a non-custodial wallet. Only you control your keys.

**Q: What's the difference between HTN and sompi?**

A: 1 HTN = 100,000,000 sompi (like Bitcoin and satoshis)

**Q: How do I update the extension?**

A: Chrome updates extensions automatically. You'll see a notification.

**Q: Can I cancel a transaction?**

A: No - blockchain transactions are irreversible once confirmed.

**Q: What if I send to wrong address?**

A: Transactions are irreversible. Always double-check addresses!

**Q: How long do transactions take?**

A: Usually 2-10 seconds, depending on network congestion.

## Support

Need help?

- **GitHub Issues**: [Report a bug](https://github.com/Namp88/hoosat-web-extension/issues)
- **Community Support**: [Discord](https://discord.gg/mFBfNpNA) | [Telegram](https://t.me/HoosatNetwork)
- **Documentation**: [Full Docs](https://docs.hoosat.fi)

## Next Steps

- [DApp Integration](./dapp-integration.md) - For developers
