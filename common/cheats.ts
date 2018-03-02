import { GameState } from './types';

interface BaseCheat {
  readonly code: string;
}

interface ForceStateCheat extends BaseCheat {
  code: 'force_state';
  state: GameState;
}

interface KillPlayerCheat extends BaseCheat {
  code: 'kill_player';
}

interface FastEnemiesCheat extends BaseCheat {
  code: 'fast_enemies';
}

interface SpawnEnemyCheat extends BaseCheat {
  code: 'spawn_enemy';
}

export type Cheat =
  | ForceStateCheat
  | KillPlayerCheat
  | FastEnemiesCheat
  | SpawnEnemyCheat;