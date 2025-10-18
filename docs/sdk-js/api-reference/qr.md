---
sidebar_position: 7
---

# HoosatQR API Reference

Complete API reference for `HoosatQR` - QR code generation and payment URI handling for the Hoosat blockchain.

## Overview

`HoosatQR` provides QR code functionality for:
- Generating payment request QR codes
- Creating address QR codes
- Encoding payment metadata
- Parsing payment URIs
- Mobile wallet integration

All methods are static - no need to instantiate the class.

## QR Code Generation

### `generateAddressQR(address: string, options?: QROptions)`

Generate QR code for a Hoosat address.

**Parameters:**
- `address` - Hoosat address
- `options` - QR code options (optional)

**Returns:** `Promise<string>` - QR code as data URL

**Example:**
```typescript
import { HoosatQR } from 'hoosat-sdk';

// Generate QR for address
const qrDataURL = await HoosatQR.generateAddressQR(
  'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02'
);

// Display in HTML
document.getElementById('qr-code').src = qrDataURL;

// Or save to file
import { writeFileSync } from 'fs';
const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
writeFileSync('address-qr.png', base64Data, 'base64');
```

**QR Options:**
```typescript
interface QROptions {
  width?: number;          // QR code width in pixels (default: 256)
  margin?: number;         // Margin around QR code (default: 4)
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';  // Error correction (default: 'M')
  color?: {
    dark?: string;         // Dark module color (default: '#000000')
    light?: string;        // Light module color (default: '#ffffff')
  };
}
```

**Custom options example:**
```typescript
const qr = await HoosatQR.generateAddressQR(address, {
  width: 512,
  margin: 8,
  errorCorrectionLevel: 'H',
  color: {
    dark: '#1a1a1a',
    light: '#f0f0f0'
  }
});
```

### `generatePaymentQR(paymentRequest: PaymentRequest, options?: QROptions)`

Generate QR code for payment request with amount and metadata.

**Parameters:**
- `paymentRequest` - Payment request details
- `options` - QR code options (optional)

**Returns:** `Promise<string>` - QR code as data URL

**Payment Request Interface:**
```typescript
interface PaymentRequest {
  address: string;         // Recipient address (required)
  amount?: string;         // Amount in sompi (optional)
  label?: string;          // Display label (optional)
  message?: string;        // Payment message (optional)
  metadata?: Record<string, any>;  // Custom metadata (optional)
}
```

**Examples:**
```typescript
// Simple payment request
const qr1 = await HoosatQR.generatePaymentQR({
  address: 'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02',
  amount: HoosatUtils.amountToSompi('1.5'),
  label: 'Coffee Shop',
  message: 'Payment for Order #12345'
});

// With custom metadata
const qr2 = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: HoosatUtils.amountToSompi('10.0'),
  label: 'Online Store',
  message: 'Order #9876',
  metadata: {
    orderId: '9876',
    customerId: 'user123',
    items: ['item1', 'item2']
  }
});

// Request without amount (let user specify)
const qr3 = await HoosatQR.generatePaymentQR({
  address: donationAddress,
  label: 'Donations',
  message: 'Support our project'
});
```

## URI Encoding/Decoding

### `createPaymentURI(paymentRequest: PaymentRequest)`

Create payment URI from payment request.

**Parameters:**
- `paymentRequest` - Payment request details

**Returns:** `string` - Payment URI

**URI Format:**
```
hoosat:<address>?amount=<sompi>&label=<label>&message=<message>
```

**Examples:**
```typescript
// Create URI
const uri = HoosatQR.createPaymentURI({
  address: 'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02',
  amount: HoosatUtils.amountToSompi('1.5'),
  label: 'Coffee Shop',
  message: 'Payment for Order #12345'
});

console.log(uri);
// hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02?amount=150000000&label=Coffee%20Shop&message=Payment%20for%20Order%20%2312345

// Share URI
// - Via link: <a href="{uri}">Pay with Hoosat</a>
// - Via deep link: window.location.href = uri;
// - Via clipboard: navigator.clipboard.writeText(uri);
```

### `parsePaymentURI(uri: string)`

Parse payment URI into payment request object.

**Parameters:**
- `uri` - Payment URI string

**Returns:** `PaymentRequest` - Parsed payment request

**Example:**
```typescript
const uri = 'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02?amount=150000000&label=Coffee%20Shop&message=Payment';

const request = HoosatQR.parsePaymentURI(uri);

console.log(request);
// {
//   address: 'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02',
//   amount: '150000000',
//   label: 'Coffee Shop',
//   message: 'Payment'
// }

// Use parsed data
console.log('Pay to:', request.label);
console.log('Amount:', HoosatUtils.sompiToAmount(request.amount!), 'HTN');
console.log('Message:', request.message);
```

## Complete Examples

### Point of Sale Terminal

```typescript
import { HoosatQR, HoosatUtils } from 'hoosat-sdk';
import express from 'express';

const app = express();
const merchantAddress = 'hoosat:qz7ulu8z6sj9m7pdwm0g4tyjd3j2pycnf2q9nly9zmvnr6uqxdv4jqqruch02';

// Generate payment QR for order
app.get('/payment/:orderId/:amount', async (req, res) => {
  const { orderId, amount } = req.params;

  try {
    // Convert HTN to sompi
    const sompi = HoosatUtils.amountToSompi(amount);

    // Generate QR code
    const qr = await HoosatQR.generatePaymentQR({
      address: merchantAddress,
      amount: sompi,
      label: 'My Store',
      message: `Order #${orderId}`,
      metadata: {
        orderId,
        timestamp: new Date().toISOString()
      }
    });

    // Return HTML page with QR
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Request</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
            }
            .qr-code {
              max-width: 400px;
              margin: 20px auto;
            }
          </style>
        </head>
        <body>
          <h1>Payment Request</h1>
          <p>Order: #${orderId}</p>
          <p>Amount: ${amount} HTN</p>
          <img src="${qr}" alt="Payment QR Code" class="qr-code">
          <p>Scan with Hoosat wallet to pay</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error generating QR code');
  }
});

app.listen(3000);
```

### Donation Widget

```typescript
class DonationWidget {
  private address: string;
  private label: string;

  constructor(address: string, label: string = 'Donation') {
    this.address = address;
    this.label = label;
  }

  async generateQR(amount?: string): Promise<string> {
    const request: PaymentRequest = {
      address: this.address,
      label: this.label,
      message: amount
        ? `Donate ${HoosatUtils.sompiToAmount(amount)} HTN`
        : 'Support our project'
    };

    if (amount) {
      request.amount = amount;
    }

    return await HoosatQR.generatePaymentQR(request, {
      width: 300,
      errorCorrectionLevel: 'H'
    });
  }

  async renderWidget(containerId: string): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) return;

    const amounts = ['1', '5', '10', '25'];

    container.innerHTML = `
      <div class="donation-widget">
        <h3>${this.label}</h3>
        <div class="amount-buttons">
          ${amounts.map(amt => `
            <button onclick="widget.showQR('${HoosatUtils.amountToSompi(amt)}')">
              ${amt} HTN
            </button>
          `).join('')}
          <button onclick="widget.showQR()">Custom</button>
        </div>
        <div id="qr-container"></div>
      </div>
    `;
  }

  async showQR(amount?: string): Promise<void> {
    const qr = await this.generateQR(amount);
    const container = document.getElementById('qr-container');

    if (container) {
      container.innerHTML = `
        <img src="${qr}" alt="Donation QR" style="max-width: 300px;">
        ${amount ? `<p>Amount: ${HoosatUtils.sompiToAmount(amount)} HTN</p>` : '<p>Scan to donate</p>'}
      `;
    }
  }
}

// Usage
const widget = new DonationWidget(donationAddress, 'Support Us');
await widget.renderWidget('donation-container');
```

### Invoice Generator

```typescript
interface Invoice {
  number: string;
  customer: string;
  items: Array<{ description: string; amount: string }>;
  total: string;
}

class InvoiceGenerator {
  private merchantAddress: string;
  private merchantName: string;

  constructor(merchantAddress: string, merchantName: string) {
    this.merchantAddress = merchantAddress;
    this.merchantName = merchantName;
  }

  async generateInvoice(invoice: Invoice): Promise<string> {
    // Calculate total
    const total = invoice.items.reduce(
      (sum, item) => sum + BigInt(item.amount),
      0n
    );

    // Generate payment QR
    const qr = await HoosatQR.generatePaymentQR({
      address: this.merchantAddress,
      amount: total.toString(),
      label: this.merchantName,
      message: `Invoice ${invoice.number}`,
      metadata: {
        invoiceNumber: invoice.number,
        customer: invoice.customer,
        items: invoice.items
      }
    }, {
      width: 400,
      errorCorrectionLevel: 'H'
    });

    // Generate HTML invoice
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.number}</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd; }
            .total { font-size: 1.5em; font-weight: bold; text-align: right; margin: 20px 0; }
            .qr { text-align: center; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.merchantName}</h1>
            <p>Invoice #${invoice.number}</p>
            <p>Customer: ${invoice.customer}</p>
          </div>

          <div class="items">
            <h3>Items</h3>
            ${invoice.items.map(item => `
              <div class="item">
                <span>${item.description}</span>
                <span>${HoosatUtils.sompiToAmount(item.amount)} HTN</span>
              </div>
            `).join('')}
          </div>

          <div class="total">
            Total: ${HoosatUtils.sompiToAmount(total)} HTN
          </div>

          <div class="qr">
            <h3>Pay with Hoosat</h3>
            <img src="${qr}" alt="Payment QR">
            <p>Scan to pay invoice</p>
          </div>
        </body>
      </html>
    `;
  }
}

// Usage
const generator = new InvoiceGenerator(merchantAddress, 'ACME Inc');

const invoice: Invoice = {
  number: 'INV-2024-001',
  customer: 'John Doe',
  items: [
    { description: 'Product A', amount: HoosatUtils.amountToSompi('10.0') },
    { description: 'Product B', amount: HoosatUtils.amountToSompi('5.5') },
    { description: 'Shipping', amount: HoosatUtils.amountToSompi('2.0') }
  ],
  total: HoosatUtils.amountToSompi('17.5')
};

const html = await generator.generateInvoice(invoice);
writeFileSync('invoice.html', html);
```

### Mobile Wallet Deep Link

```typescript
class MobilePaymentLink {
  static createDeepLink(paymentRequest: PaymentRequest): string {
    const uri = HoosatQR.createPaymentURI(paymentRequest);

    // For mobile apps with custom URI scheme
    // e.g., hoosatwallet://pay?...
    return uri.replace('hoosat:', 'hoosatwallet://pay/');
  }

  static openWallet(paymentRequest: PaymentRequest): void {
    const deepLink = this.createDeepLink(paymentRequest);

    // Try to open wallet app
    window.location.href = deepLink;

    // Fallback to app store after timeout
    setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const storeLink = isIOS
        ? 'https://apps.apple.com/app/hoosat-wallet'
        : 'https://play.google.com/store/apps/details?id=com.hoosat.wallet';

      window.location.href = storeLink;
    }, 2500);
  }
}

// Usage in web app
document.getElementById('pay-button')?.addEventListener('click', () => {
  MobilePaymentLink.openWallet({
    address: merchantAddress,
    amount: HoosatUtils.amountToSompi('5.0'),
    label: 'My Store',
    message: 'Order #12345'
  });
});
```

## Best Practices

### 1. Validate Before Generating

```typescript
if (!HoosatUtils.isValidAddress(address)) {
  throw new Error('Invalid address');
}

if (amount && !HoosatUtils.isValidAmount(amount)) {
  throw new Error('Invalid amount');
}

const qr = await HoosatQR.generatePaymentQR({ address, amount });
```

### 2. Use Appropriate Error Correction

```typescript
// High error correction for printed QR codes
const printQR = await HoosatQR.generateAddressQR(address, {
  errorCorrectionLevel: 'H',  // 30% error correction
  width: 512
});

// Medium for digital displays
const screenQR = await HoosatQR.generateAddressQR(address, {
  errorCorrectionLevel: 'M',  // 15% error correction
  width: 256
});
```

### 3. Include Helpful Labels

```typescript
// Good - informative labels
const qr = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: sompi,
  label: 'Coffee Shop - Main Street',
  message: 'Order #12345 - 2x Latte'
});

// Bad - vague labels
const qr = await HoosatQR.generatePaymentQR({
  address: merchantAddress,
  amount: sompi,
  label: 'Payment',
  message: 'Pay'
});
```

### 4. Handle QR Generation Errors

```typescript
try {
  const qr = await HoosatQR.generatePaymentQR(paymentRequest);
  displayQR(qr);
} catch (error) {
  console.error('QR generation failed:', error);
  showFallbackPaymentMethod();
}
```

### 5. Optimize for Target Platform

```typescript
// Mobile - smaller QR
const mobileQR = await HoosatQR.generatePaymentQR(request, {
  width: 300,
  margin: 2
});

// Desktop - larger QR
const desktopQR = await HoosatQR.generatePaymentQR(request, {
  width: 500,
  margin: 4
});

// Print - high resolution
const printQR = await HoosatQR.generatePaymentQR(request, {
  width: 1024,
  margin: 8,
  errorCorrectionLevel: 'H'
});
```

## Next Steps

- [Payment Integration Guide](../guides/payment-integration.md) - Integrate payments
- [HoosatUtils](./utils.md) - Validation utilities
- [Transaction Guide](../guides/transactions.md) - Transaction handling
