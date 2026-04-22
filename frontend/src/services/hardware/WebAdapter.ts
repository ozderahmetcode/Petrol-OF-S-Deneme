import { IHardwareService, ReceiptData } from './HardwareInterface';

export class WebAdapter implements IHardwareService {
  async printReceipt(data: ReceiptData): Promise<void> {
    console.log('Web Mode: Opening Print Dialog / PDF Preview', data);
    // In a real app, this would generate a PDF or trigger window.print()
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt Preview</title></head>
          <body style="font-family: monospace; padding: 20px;">
            <h2>ozder ERP - Receipt</h2>
            <hr/>
            ${data.items.map(item => `<div>${item.name} x ${item.quantity} - ${item.price} TL</div>`).join('')}
            <hr/>
            <div>Total: ${data.total} TL</div>
            <div>Discount: ${data.discount} TL</div>
            <hr/>
            <div>Date: ${data.date}</div>
            <button onclick="window.print()">Print</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  async scanBarcode(): Promise<string> {
    console.log('Web Mode: Using Camera / Manual Input Fallback');
    return prompt('Scan/Enter Barcode:') || '';
  }

  async openCashDrawer(): Promise<void> {
    alert('Web Mode: Cash drawer opening is not supported in browser. Please open manually.');
  }
}
