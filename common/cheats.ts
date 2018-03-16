interface BaseCheat {
  readonly code: string;
}

// interface ForceStateCheat extends BaseCheat {
//   code: 'force_state';
//   state: GameState;
// }

interface KillPlayerCheat extends BaseCheat {
  code: 'kill_player';
}

interface SpawnEnemyCheat extends BaseCheat {
  code: 'spawn_enemy';
}

interface SetVolumeCheat extends BaseCheat {
  code: 'set_volume';
  target: 'music' | 'effects';
  volume: number;
}

interface SpawnAsteroidCheat extends BaseCheat {
  code: 'spawn_asteroid';
}

export type Cheat =
  // | ForceStateCheat
  KillPlayerCheat | SpawnEnemyCheat | SetVolumeCheat | SpawnAsteroidCheat;
