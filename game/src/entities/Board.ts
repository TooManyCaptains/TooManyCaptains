import _ from 'lodash';

import PlayerShip from './PlayerShip';
import { Enemy } from '../entities/Enemy';
import Asteroid from './Asteroid';
import { Game } from '../index';
import { PlayerWeapon, Weapon } from './Weapon';

export default class Board extends Phaser.Group {
  public maxX: number;
  public maxY: number;
  public game: Game;
  public player: PlayerShip;
  public enemies: Phaser.Group;
  private asteroids: Phaser.Group;
  private collideFx: Phaser.Sound;
  private damagedFx: Phaser.Sound;
  private shieldFx: Phaser.Sound;
  private scoreText: Phaser.Text;
  private planet: Phaser.Sprite;

  constructor(game: Game, width: number, height: number) {
    super(game);

    // Sound FX
    this.shieldFx = this.game.add.audio('shield');
    this.damagedFx = this.game.add.audio('damaged');
    this.collideFx = this.game.add.audio('collide');

    // Asteroids
    this.asteroids = new Phaser.Group(this.game, undefined, 'asteroids');
    this.add(this.asteroids);

    // Planet
    this.planet = this.game.add.sprite(
      width,
      height / 2,
      'planet',
      undefined,
      this,
    );
    this.planet.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.planet, Phaser.Physics.ARCADE);
    this.planet.body.angularVelocity = 2;

    // Mask (overflow)
    const mask = this.game.add.graphics(0, 0, this);
    mask.beginFill(0xff0000);
    mask.drawRect(0, 0, width, height);
    this.mask = mask;

    // Score text
    const rectWidth = 260;
    const rectHeight = 69;
    const rectOffsetFromEdge = 15;
    const offsetLeft = 21;
    const offsetTop = 14;
    const graphics = this.game.add.graphics(
      width - rectWidth - rectOffsetFromEdge,
      height / 2 - rectHeight / 2,
      this,
    );
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xffffff);
    graphics.drawRoundedRect(0, 0, rectWidth, rectHeight, 37.5);
    this.scoreText = this.game.add.text(
      width - rectWidth - rectOffsetFromEdge + offsetLeft,
      height / 2 - rectHeight / 2 + offsetTop,
      '',
      {
        font: `${32}px Exo 2`,
        fill: 'black',
        fontWeight: 900,
      },
      this,
    );

    // Boundaries for the playable game area
    this.maxX = width - this.planet.width / 2 - rectOffsetFromEdge;
    this.maxY = height;

    // Score timer
    this.game.score = 0;
    const scoreTimer = this.game.time.create();
    scoreTimer.loop(250, this.onScoreTimer, this);
    scoreTimer.start();

    // Player ship
    this.player = new PlayerShip(this.game, 125, height / 2);
    this.add(this.player);
    this.game.player = this.player;

    // Add starting enemies
    this.enemies = new Phaser.Group(this.game, undefined, 'enemies');
    const numStartingEnemies = 3;
    _.times(numStartingEnemies, i => {
      this.spawnEnemy(
        height / numStartingEnemies * (i + 1) - height / numStartingEnemies / 2,
      );
    });
    this.add(this.enemies);
  }

  public spawnEnemy(y?: number) {
    const x = this.maxX;
    if (y === undefined) {
      y = this.maxY * Math.random();
    }
    const colors = 'RYB'.split('');
    const allEnemyTypes = _.flatten(colors.map(a => colors.map(b => a + b)));
    const randomEnemyType: string = _.sample(allEnemyTypes)!;
    this.enemies.add(new Enemy(this.game, x, y, ...randomEnemyType));
  }

  public spawnAsteroid() {
    const x = this.maxX;
    // XXX: Shouldn't use hard-coded consants for asteroid size.
    // Should be based on the asteroid's intrinsic size.
    const y = (this.maxY - 100) * Math.random() + 50;
    this.asteroids.add(new Asteroid(this.game, x, y));
  }

  public update() {
    super.update();

    // Player <-> enemy bullet collision
    this.enemies.forEach(
      (enemy: Enemy) =>
        this.game.physics.arcade.overlap(
          enemy.weapon,
          this.player,
          (player: PlayerShip, bullet: Weapon) => {
            const playerHasMatchingShield = player.shieldColors.some(
              color => color[0].toUpperCase() === enemy.weaponType,
            );
            // Bullet hits
            if (
              player.shieldColors.length === 0 ||
              !playerHasMatchingShield ||
              !player.shield.visible
            ) {
              player.damage(enemy.weapon.bulletDamage);
              this.damagedFx.play();
              player.getHurtTint();
            } else {
              player.damage(enemy.weapon.bulletDamage * 0.05);
              this.shieldFx.play();
            }
            bullet.kill();
          },
        ),
      undefined,
    );

    // Planet <-> enemy bullet collision
    if (this.player.weapon) {
      this.game.physics.arcade.overlap(
        this.planet,
        this.player.weapon,
        (planet: Phaser.Sprite, bullet: PlayerWeapon) => {
          bullet.kill();
        },
      );
    }

    // Enemy <-> player bullet collision
    if (this.player.weapon) {
      this.game.physics.arcade.overlap(
        this.enemies,
        this.player.weapon,
        (enemy: Enemy, weapon: Weapon) => {
          const playerBulletCanHurtEnemy = weapon.bulletColor.includes(
            enemy.shipType,
          );
          // Bullet hits
          if (playerBulletCanHurtEnemy) {
            enemy.getHurtTint();
            enemy.damage(weapon.bulletDamage);
            if (!enemy.alive) {
              enemy.explode();
              this.game.score += 150;
            }
          } else {
            this.shieldFx.play();
          }
          weapon.kill();
        },
      );
    }

    // Enemy <-> player ship (no shield) collision
    this.game.physics.arcade.overlap(
      this.enemies,
      this.player,
      (player: PlayerShip, enemy: Enemy) => {
        enemy.destroy();
        player.getHurtTint();
        player.damage(enemy.collisionDamage);
      },
    );

    // Enemy <-> enemy collision
    this.game.physics.arcade.collide(this.enemies, this.enemies);

    // Player <-> asteroid collision
    this.game.physics.arcade.overlap(
      this.asteroids,
      this.player,
      (player: PlayerShip, asteroid: Asteroid) => {
        asteroid.destroy();
        player.getHurtTint();
        player.damage(asteroid.collisionDamage);
        this.collideFx.play();
      },
    );
  }

  private onScoreTimer() {
    this.game.score += 1;
    this.scoreText.text = `SCORE: ${this.game.score}`;
  }
}
