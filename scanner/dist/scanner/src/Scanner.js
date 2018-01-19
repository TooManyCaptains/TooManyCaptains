"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usb_1 = require("usb");
const VENDOR_ID = 65535;
const portToSubsystem = {
    2: 'weapons',
    1: 'shields',
    4: 'repairs',
};
const sequenceToCaptain = {
    17728914: 1,
    1031061722: 2,
};
function deviceIsCardScanner(device) {
    return device.deviceDescriptor.idVendor === VENDOR_ID;
}
function subsystemForDevice(device) {
    const port = device.portNumbers[device.portNumbers.length - 1];
    return portToSubsystem[port];
}
function watchDevice(device, sendPacket) {
    if (!deviceIsCardScanner(device))
        return;
    const subsystem = subsystemForDevice(device);
    console.log(`${subsystem} scanner connected`);
    device.open();
    const iface = device.interfaces[0];
    // this line is because the RFID reader is recognized as a keyboard when plugged
    if (iface.isKernelDriverActive()) {
        iface.detachKernelDriver();
    }
    iface.claim();
    const endpoint = iface.endpoints[0];
    if (endpoint.direction !== 'in') {
        throw "invalid endpoint for interface";
    }
    endpoint.startPoll(1, 8);
    let scanCodes = [];
    endpoint.on('data', (data) => {
        const scanCode = Number.parseInt(data.toString('hex', 2, 3), 16);
        // Every other scan code is blank padding
        if (scanCode === 0) {
            return;
        }
        else if (scanCode >= 0x1E && scanCode <= 0x27) {
            scanCodes.push(scanCode - 0x1D);
        }
        else if (scanCode === 0x28) {
            const sequence = Number(scanCodes.join(''));
            const captain = sequenceToCaptain[sequence];
            console.log(`Captain ${captain} => ${subsystem}`);
            sendPacket({
                kind: 'scan',
                subsystem,
                captain,
            });
            scanCodes = [];
        }
    });
    endpoint.on('error', error => {
        console.log(`${subsystem} scanner disconnected`);
    });
}
class Scanner {
    constructor(sendPacket) {
        usb_1.getDeviceList()
            .filter(deviceIsCardScanner)
            .forEach(device => watchDevice(device, sendPacket.bind(this)));
        usb_1.on('attach', device => watchDevice(device, sendPacket.bind(this)));
    }
}
exports.default = Scanner;
//# sourceMappingURL=Scanner.js.map