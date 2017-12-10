import { Button, ButtonState } from './types'

export const buttons: Button[] = [
  {
    name: 'fire',
    pin: 36,
    toData: (state: ButtonState) => state === 'pressed' ? 'start' : 'stop',
  },
  {
    name: 'move-up',
    pin: 38,
    toData: (state: ButtonState) => state === 'pressed' ? 'start' : 'stop',
  },
  {
    name: 'move-down',
    pin: 40,
    toData: (state: ButtonState) => state === 'pressed' ? 'start' : 'stop',
  },
]
