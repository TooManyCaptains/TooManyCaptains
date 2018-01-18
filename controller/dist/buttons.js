"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttons = [
    {
        name: 'fire',
        pin: 36,
        toData: (state) => state === 'pressed' ? 'start' : 'stop',
    },
    {
        name: 'move-up',
        pin: 38,
        toData: (state) => state === 'pressed' ? 'start' : 'stop',
    },
    {
        name: 'move-down',
        pin: 40,
        toData: (state) => state === 'pressed' ? 'start' : 'stop',
    },
];
//# sourceMappingURL=buttons.js.map