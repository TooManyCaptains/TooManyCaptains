import { Device, getDeviceList, on as onUsb, InEndpoint } from 'usb';
import { ScanPacket } from '../../common/types';
import manifest from '../../common/manifest';

const VENDOR_ID = 65535; // 2^16 - 1. Lol. Very lazy of them.

function deviceIsCardScanner(device: Device): boolean {
  return device.deviceDescriptor.idVendor === VENDOR_ID;
}

function watchDevice(device: Device, sendPacket: (p: ScanPacket) => any): void {
  if (!deviceIsCardScanner(device)) {
    return;
  }
  console.log(`Scanner connected`);
  device.open();
  const iface = device.interfaces[0];

  // The RFID reader is recognized as a keyboard when plugged
  // in. So we want to tell the kernel to stop treating it as such, and
  // let us have full control.
  if (iface.isKernelDriverActive()) {
    iface.detachKernelDriver();
  }

  iface.claim();

  const endpoint = iface.endpoints[0];

  if (endpoint.direction !== 'in') {
    throw Error('invalid endpoint for interface');
  }

  (endpoint as InEndpoint).startPoll(1, 8);

  let scanCodes: number[] = [];

  endpoint.on('data', (data: Buffer) => {
    const scanCode = Number.parseInt(data.toString('hex', 2, 3), 16);
    // Every other scan code is blank padding
    if (scanCode === 0) {
      return;
    } else if (scanCode >= 0x1e && scanCode <= 0x27) {
      // Only push numbers 0-9
      // https://github.com/abcminiuser/lufa/blob/master/LUFA/Drivers/USB/Class/Common/HIDClassCommon.h#L113
      scanCodes.push(scanCode - 0x1d);
    } else if (scanCode === 0x28) {
      // If the enter key was pressed
      const sequence = Number(scanCodes.join(''));
      console.log(`Read card with sequence: ${sequence}`);
      const entry = manifest.find(m => m.sequence === sequence);
      if (entry) {
        console.log(`Identified ${entry.name} (id ${entry.cardID})`);
        sendPacket({
          kind: 'scan',
          cardID: entry.cardID,
        });
      }

      scanCodes = [];
    }
  });

  endpoint.on('error', error => {
    console.log(`Scanner disconnected`);
  });
}

export default class Scanner {
  constructor(sendPacket: (p: ScanPacket) => any) {
    getDeviceList()
      .filter(deviceIsCardScanner)
      .forEach(device => watchDevice(device, sendPacket.bind(this)));

    onUsb('attach', device => watchDevice(device, sendPacket.bind(this)));
  }
}
