export type Color = 'blue' | 'red' | 'yellow'
export type Subsystem = 'weapons' | 'shields' | 'repairs' | 'propulsion'
export type GameState = 'wait_for_players' | 'in_game' | 'game_over'
export type ButtonState = 'pressed' | 'released'

interface BasePacket {
  kind: string
}

export interface GameStatePacket extends BasePacket {
  kind: 'gamestate'
  state: GameState
}

export interface MovePacket extends BasePacket {
  kind: 'move'
  direction: 'up' | 'down'
  state: ButtonState
}

export interface FirePacket extends BasePacket {
  kind: 'fire'
  state: ButtonState
}

export interface WiringPacket extends BasePacket {
  kind: 'wiring'
  subsystem: Subsystem
  wires: Color[]
}

export interface ScanPacket extends BasePacket {
  kind: 'scan'
  subsystem: Subsystem
  playerNumber: 1 | 2 | 3 | 4 | 5
}

export type Packet = MovePacket | FirePacket | WiringPacket | ScanPacket | GameStatePacket