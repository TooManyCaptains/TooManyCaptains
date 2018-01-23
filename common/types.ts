export type Color = 'blue' | 'red' | 'yellow'
export type Subsystem = 'weapons' | 'shields' | 'thrusters' | 'repairs'
export type GameState = 'wait_for_players' | 'in_game' | 'game_over'
export type ButtonState = 'pressed' | 'released'
export type Captain = 1 | 2 | 3 | 4 | 5 | 6

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
  captain: Captain
}

export type Packet = MovePacket | FirePacket | WiringPacket | ScanPacket | GameStatePacket
