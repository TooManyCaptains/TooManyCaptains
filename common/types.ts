import { Cheat } from './cheats';

export type Color = 'blue' | 'red' | 'yellow';

export interface ColorPosition {
  position: number; // relative position within a given panel (e.g. 0, 2, 3)
  color: Color;
}

export type Subsystem = 'weapons' | 'shields' | 'thrusters' | 'repairs';
export type GameState = 'wait_for_players' | 'in_game' | 'game_over';
export type ButtonState = 'pressed' | 'released';
export type EngineerCardID = 0;
export type CaptainCardID = 1 | 2 | 3 | 4 | 5 | 6;
export type CardID = EngineerCardID | CaptainCardID;

interface BasePacket {
  kind: string;
}

export interface GameStatePacket extends BasePacket {
  kind: 'gamestate';
  state: GameState;
}

export interface MovePacket extends BasePacket {
  kind: 'move';
  direction: 'up' | 'down';
  state: ButtonState;
}

export interface FirePacket extends BasePacket {
  kind: 'fire';
  state: ButtonState;
}

export interface WiringConfiguration {
  subsystem: Subsystem;
  colorPositions: ColorPosition[];
}

export interface WiringPacket extends BasePacket {
  kind: 'wiring';
  configurations: WiringConfiguration[];
}

export interface ScanPacket extends BasePacket {
  kind: 'scan';
  cardID: CardID;
}

export interface CheatPacket extends BasePacket {
  readonly kind: 'cheat';
  cheat: Cheat;
}

export interface ScorePacket extends BasePacket {
  readonly kind: 'score';
  points: number;
  confirmedHighScore: boolean;
}

export interface DebugFlags {
  perf: boolean;
  boss: boolean;
  invuln: boolean;
}

export type Packet =
  | MovePacket
  | FirePacket
  | WiringPacket
  | ScanPacket
  | CheatPacket
  | ScorePacket
  | GameStatePacket;
