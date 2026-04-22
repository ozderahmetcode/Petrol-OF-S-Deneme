export class ReceiptData {
  items: Array<{ name: string; quantity: number; price: number }> = [];
  total: number = 0;
  discount: number = 0;
  tax: number = 0;
  paymentType: string = '';
  date: string = '';
}

export abstract class IHardwareService {
  abstract printReceipt(data: ReceiptData): Promise<void>;
  abstract scanBarcode(): Promise<string>;
  abstract openCashDrawer(): Promise<void>;
}

export const HARDWARE_CHANNELS = {
  PRINT: 'hardware:print',
  SCAN: 'hardware:scan',
  DRAWER: 'hardware:openDrawer'
};
