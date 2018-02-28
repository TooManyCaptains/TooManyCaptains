import { Device, getDeviceList, on as onUsb, InEndpoint } from 'usb';
import { Subsystem, ScanPacket, CardID } from '../../common/types';

const VENDOR_ID = 65535;

const portToSubsystem: { [port: number]: Subsystem } = {
  3: 'weapons',
  2: 'shields',
  1: 'thrusters',
  4: 'repairs',
};

const sequenceToCardId: { [sequence: number]: CardID } = {
  17728914: 1,
  1031061722: 2,
  138262410: 3,
};

function deviceIsCardScanner(device: Device): boolean {
  return device.deviceDescriptor.idVendor === VENDOR_ID;
}

function subsystemForDevice(device: Device): Subsystem {
  const port = device.portNumbers[device.portNumbers.length - 1];
  return portToSubsystem[port];
}

function watchDevice(device: Device, sendPacket: (p: ScanPacket) => any): void {
  if (!deviceIsCardScanner(device)) {
    return;
  }
  const subsystem = subsystemForDevice(device);
  console.log(`[Scanner] ${subsystem} connected`);
  device.open();
  const iface = device.interfaces[0];

  // this line is because the RFID reader is recognized as a keyboard when plugged
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
      console.log(`card with sequence: ${sequence}`);
      const cardID = sequenceToCardId[sequence];
      console.log(`card ID: ${cardID}`);
      sendPacket({
        kind: 'scan',
        subsystem,
        cardID,
      });
      scanCodes = [];
    }
  });

  endpoint.on('error', error => {
    console.log(`[Scanner] ${subsystem} disconnected`);
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
