import { IHardwareService, ReceiptData } from './HardwareInterface';

export class ElectronAdapter implements IHardwareService {
  async printReceipt(data: ReceiptData): Promise<void> {
    console.log('Electron Mode: Sending data to main process for direct printing');
    if (window.electron) {
      await window.electron.invoke('hardware:print', data);
    } else {
      console.error('Electron bridge not found!');
    }
  }

  async scanBarcode(): Promise<string> {
    console.log('Electron Mode: Triggering serial/USB scanner listener');
    if (window.electron) {
      return await window.electron.invoke('hardware:scan', {});
    }
    return '';
  }

  async openCashDrawer(): Promise<void> {
    console.log('Electron Mode: Sending pulse to cash drawer port');
    if (window.electron) {
      await window.electron.send('hardware:openDrawer', {});
    }
  }
}
