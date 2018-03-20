import Player from './Player';
import { Enemy } from '../entities/Enemy';
import Asteroid from './Asteroid';
import { Game } from '../index';
import { EnemyBullet, EnemyBulletPool } from './EnemyWeapon';
import { randomColor, colorNameToLetter } from '../utils';
import { PlayerBullet } from './PlayerWeapon';
import { ColorPalette, baseStyle } from '../interface/Styles';
import { random, times, sample } from 'lodash';
import { Color } from '../../../common/types';

interface Wave {
  number: number;
  seconds: number;
  enemies: number;
  modifiers: {
    enemyMoveSpeed: number;
    enemyFireInterval: number;
    asteroidSpawnInterval: number;
    asteroidMoveSpeed: number;
  };
}

export default class Board extends Phaser.Group {
  public game: Game;

  private enemyBulletPool: EnemyBulletPool;
  private player: Player;
  private enemies: Phaser.Group;
  private asteroids: Phaser.Group;
  private collideFx: Phaser.Sound;
  private damagedFx: Phaser.Sound;
  private enemyShieldFx: Phaser.Sound;
  private waveTimer: Phaser.Timer;
  private wave: Wave;
  private asteroidTimer: Phaser.Timer;
  private asteroidBaseSpawnInterval = 20;

  private spritesToDestroy: Set<Phaser.Sprite> = new Set();

  constructor(game: Game, width: number, height: number) {
    super(game);
    this.player = new Player(this.game, 150, height / 2);

    // Keep game sprites (which respect bounds) within the bounds of the board
    // this.game.world.setBounds(0, 0, width, height);
    this.game.physics.arcade.setBounds(0, 90, width, height - 130);

    // Mask (overflow)
    const mask = this.game.add.graphics(0, 0, this);
    mask.beginFill(ColorPalette.Black);
    mask.drawRect(0, 0, width, height);
    this.mask = mask;

    // Sounds
    this.enemyShieldFx = this.game.add.audio('shield');
    this.enemyShieldFx.volume = 0.5;
    this.damagedFx = this.game.add.audio('damaged');
    this.collideFx = this.game.add.audio('collide');

    // Create recycled bullet pool for enemy bullets
    this.enemyBulletPool = new EnemyBulletPool(this.game, this.player);

    this.enemies = new Phaser.Group(this.game, undefined, 'enemies');
    this.add(this.enemies);

    // Player ship
    this.add(this.player);

    this.reset();
  }

  public reset() {
    // Waves
    if (this.waveTimer) {
      this.waveTimer.destroy();
    }
    this.waveTimer = this.game.time.create();
    this.wave = {
      number: 0,
      seconds: 2,
      enemies: 2,
      modifiers: {
        enemyFireInterval: 1.0,
        enemyMoveSpeed: 1.0,
        asteroidMoveSpeed: 1.0,
        asteroidSpawnInterval: 1.0,
      },
    };
    this.onWaveTimer();

    // Asteroids
    if (this.asteroidTimer) {
      this.asteroidTimer.destroy();
    }
    this.asteroidTimer = this.game.time.create();
    this.asteroids = new Phaser.Group(this.game, undefined, 'asteroids');
    this.add(this.asteroids);
    this.onAsteroidTimer();
  }

  public update() {
    // Player <-> enemy bullet collision
    this.game.physics.arcade.overlap(
      this.enemyBulletPool,
      this.player.ship,
      (playerShip: Phaser.Sprite, bullet: EnemyBullet) => {
        const playerHasMatchingShield = this.game.session.shieldColors.some(
          color => color === bullet.color,
        );
        // Bullet hits
        if (
          this.game.session.shieldColors.length === 0 ||
          !playerHasMatchingShield
        ) {
          this.game.session.health -= bullet.strength;
          this.damagedFx.play();
          this.game.camera.shake(0.005, 400);
          this.createExplosion(bullet.position, 0.5);
        } else {
          this.game.session.health -= bullet.strength * 0.05;
          this.player.shieldTint();
          this.game.add
            .audio(`shield_hit_${colorNameToLetter(bullet.color)}`)
            .play();
        }
        bullet.kill();
      },
    );

    // Enemy <-> enemy collision
    this.game.physics.arcade.collide(this.enemies, this.enemies);

    // Enemy <-> player bullet collision
    this.game.physics.arcade.overlap(
      this.enemies,
      this.player.weapon,
      (enemy: Enemy, playerBullet: PlayerBullet) => {
        if (playerBullet.color === enemy.shipColor) {
          // Bullet hurts enemy
          this.spritesToDestroy.add(enemy);
          this.game.session.score += 150;
          const position = new Phaser.Point(
            enemy.position.x - 40,
            enemy.position.y,
          );
          this.createPointsBubble(position, 150);
        } else {
          // Enemy is not hurt
          enemy.flashShield(playerBullet.color);
          this.enemyShieldFx.play();
        }
        playerBullet.kill();
      },
    );

    // Player <-> asteroid collision
    this.game.physics.arcade.overlap(
      this.asteroids,
      this.player.ship,
      (playerShip: Phaser.Sprite, asteroid: Asteroid) => {
        this.createExplosion(asteroid.position, 1.0);
        this.spritesToDestroy.add(asteroid);
        this.game.camera.shake(0.02, 800);
        this.game.session.health -= asteroid.collisionDamage;
      },
    );

    // Player bullet <-> asteroid collision
    this.game.physics.arcade.overlap(
      this.asteroids,
      this.player.weapon,

      (asteroid: Asteroid, playerBullet: PlayerBullet) => {
        this.createMovingExplosion(
          playerBullet.position,
          (asteroid.body as Phaser.Physics.Arcade.Body).velocity,
          0.4,
        );
        playerBullet.kill();
      },
    );

    // Destroying a sprite sets all of its properties to null,
    // causing any subsequent operations on the sprite to fail.
    // This can happen if a sprite is destroyed "twice", such as if
    // multiple bullets hit a target causing it to be destroyed.
    // Therefore, rather than destroying the target immediately,
    // we mark it for destruction by adding it to a set.
    // Then, afterwords, we destroy the targets exactly once.
    this.spritesToDestroy.forEach(sprite => sprite.destroy());
    this.spritesToDestroy.clear();

    super.update();
  }

  public spawnAsteroid(moveSpeedModifier = 1.0) {
    const isPlayerCamping =
      this.game.session.shieldColors.length === 3 ||
      this.game.session.repairLevel === 3;
    // Punish players who are camping
    const y = isPlayerCamping
      ? this.player.y
      : this.game.physics.arcade.bounds.height * Math.random() + 60;
    const asteroid = new Asteroid(
      this.game,
      this.game.width,
      y,
      moveSpeedModifier,
    );
    this.asteroids.add(asteroid);
    asteroid.events.onOutOfBounds.add(this.onAsteroidOutOfBounds, this);
  }

  public asteroidStorm() {
    const haystack = 12;
    const needle = random(3, 8);
    times(haystack, i => {
      if (i < 3) {
        return;
      }
      if (i >= needle - 2 && i <= needle + 2) {
        return;
      }
      const asteroid = new Asteroid(
        this.game,
        this.game.width - 100 * Math.random(),
        i * 50,
        this.wave.modifiers.asteroidMoveSpeed,
      );
      this.asteroids.add(asteroid);
      // asteroid.events.onOutOfBounds.add(this.onAsteroidOutOfBounds, this);
    });
  }

  public manuallySpawnEnemy() {
    this.enemies.add(
      new Enemy(
        this.game,
        random(this.game.width - 250, this.game.width - 100),
        this.game.physics.arcade.bounds.top +
          this.game.physics.arcade.bounds.height * Math.random(),
        randomColor(),
        randomColor(),
        this.enemyBulletPool,
      ),
    );
  }

  private spawnWave(wave: Wave) {
    console.log(`spawned wave ${wave.number}`);
    console.log(wave);

    const firstWaveColors = sample([
      {
        weapons: ['blue', 'yellow'],
        ships: ['red', 'blue'],
      },
      {
        weapons: ['yellow', 'red'],
        ships: ['blue', 'yellow'],
      },
      {
        weapons: ['red', 'yellow'],
        ships: ['yellow', 'blue'],
      },
    ] as Array<{ weapons: Color[]; ships: Color[] }>)!;

    times(wave.enemies, i => {
      this.enemies.add(
        new Enemy(
          this.game,
          random(this.game.width - 250, this.game.width - 100),
          this.game.physics.arcade.bounds.top +
            this.game.physics.arcade.bounds.height / wave.enemies * (i + 1) -
            this.game.physics.arcade.bounds.height / wave.enemies / 2,
          wave.number === 0 ? firstWaveColors.ships[i]! : randomColor(),
          wave.number === 0 ? firstWaveColors.weapons[i]! : randomColor(),
          this.enemyBulletPool,
          wave.modifiers.enemyMoveSpeed,
          wave.modifiers.enemyFireInterval,
        ),
      );
    });

    if (wave.number > 0 && wave.number % 2 === 0) {
      this.asteroidStorm();
    }
  }

  private onAsteroidTimer() {
    this.asteroidTimer.add(
      this.asteroidBaseSpawnInterval *
        this.wave.modifiers.asteroidSpawnInterval *
        1000,
      () => {
        this.spawnAsteroid(this.wave.modifiers.asteroidMoveSpeed);
        this.onAsteroidTimer();
      },
      this,
    );
    this.asteroidTimer.start();
  }

  private onAsteroidOutOfBounds(asteroid: Asteroid) {
    const position = new Phaser.Point(
      this.player.ship.position.x - 90,
      this.player.ship.position.y - 120,
    );
    this.createPointsBubble(position, 250, 28, 'MISS ');
    this.game.session.score += 250;
  }

  private onWaveTimer() {
    this.waveTimer.add(
      this.wave.seconds * 1000,
      () => {
        this.spawnWave(this.wave);
        this.wave = this.getNextWave();
        this.onWaveTimer();
      },
      this,
    );
    this.waveTimer.start();
  }

  private getNextWave(): Wave {
    const currentWave = this.wave;
    return {
      number: currentWave.number + 1,
      seconds: 30,
      enemies: Math.min(15, currentWave.enemies * 1.35),
      modifiers: {
        enemyFireInterval: currentWave.modifiers.enemyFireInterval * 0.95,
        enemyMoveSpeed: currentWave.modifiers.enemyMoveSpeed * 1.05,
        asteroidMoveSpeed: currentWave.modifiers.asteroidMoveSpeed * 1.05,
        asteroidSpawnInterval:
          currentWave.modifiers.asteroidSpawnInterval * 0.8,
      },
    };
  }

  private createPointsBubble(
    position: Phaser.Point,
    points: number,
    fontSize = 32,
    label = '',
  ) {
    const text = this.game.add.text(
      position.x,
      position.y,
      `${label}+${points}`,
      {
        ...baseStyle,
        fill: 'white',
        fontSize,
        stroke: 'black',
        strokeThickness: 6,
      },
      this,
    );
    this.game.add
      .tween(text)
      .to({ y: -100, alpha: 0 }, 2500, Phaser.Easing.Cubic.InOut, true);
  }

  private createExplosion(position: Phaser.Point, scale: number) {
    const explosion = this.game.add.sprite(
      position.x,
      position.y,
      'explosion-yellow',
    );
    explosion.scale.setTo(scale, scale);
    explosion.anchor.setTo(0.75, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.collideFx.play();
  }

  private createMovingExplosion(
    position: Phaser.Point,
    velocity: Phaser.Point,
    scale: number,
  ) {
    const explosion = this.game.add.sprite(
      position.x,
      position.y,
      'explosion-yellow',
    );
    this.game.physics.enable(explosion, Phaser.Physics.ARCADE);
    (explosion.body as Phaser.Physics.Arcade.Body).velocity = velocity;
    explosion.scale.setTo(scale, scale);
    explosion.anchor.setTo(0, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.collideFx.play();
  }
}
