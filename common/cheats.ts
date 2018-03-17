interface BaseCheat {
  readonly code: string;
}

interface KillPlayerCheat extends BaseCheat {
  code: 'kill_player';
}

interface SetFlagsCheat extends BaseCheat {
  code: 'set_flags';
}

interface SpawnEnemyCheat extends BaseCheat {
  code: 'spawn_enemy';
}

export interface SetVolumeCheat extends BaseCheat {
  code: 'set_volume';
  target: 'music' | 'master';
  volume: number;
}

interface SpawnAsteroidCheat extends BaseCheat {
  code: 'spawn_asteroid';
}

export type Cheat =
  | KillPlayerCheat
  | SpawnEnemyCheat
  | SetVolumeCheat
  | SetFlagsCheat
  | SpawnAsteroidCheat;
