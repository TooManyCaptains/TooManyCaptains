import _ from 'lodash';

import PlayerShip from './PlayerShip';
import { Enemy } from '../entities/Enemy';
import Asteroid from './Asteroid';
import { Game } from '../index';
import { PlayerWeaponBullet } from './PlayerWeapon';
import { EnemyBullet } from './EnemyWeapon';
import { randomColor } from '../utils';

export default class Board extends Phaser.Group {
  public minX: number;
  public minY: number;
  public maxX: number;
  public maxY: number;
  public game: Game;
  public player: PlayerShip;
  public enemies: Phaser.Group;
  private asteroids: Phaser.Group;
  private collideFx: Phaser.Sound;
  private damagedFx: Phaser.Sound;
  private shieldFx: Phaser.Sound;
  // private scoreText: Phaser.Text;

  constructor(game: Game, width: number, height: number) {
    super(game);

    // Sound FX
    this.shieldFx = this.game.add.audio('shield');
    this.damagedFx = this.game.add.audio('damaged');
    this.collideFx = this.game.add.audio('collide');

    // Asteroids
    this.asteroids = new Phaser.Group(this.game, undefined, 'asteroids');
    this.add(this.asteroids);

    // Mask (overflow)
    const mask = this.game.add.graphics(0, 0, this);
    mask.beginFill(0xff0000);
    mask.drawRect(0, 0, width, height);
    this.mask = mask;

    // // Score text
    // const rectWidth = 260;
    // const rectHeight = 69;
    // const rectOffsetFromEdge = 15;
    // const offsetLeft = 21;
    // const offsetTop = 14;
    // const graphics = this.game.add.graphics(
    //   width - rectWidth - rectOffsetFromEdge,
    //   height / 2 - rectHeight / 2,
    //   this,
    // );
    // graphics.lineStyle(2, 0x000000, 1);
    // graphics.beginFill(0xffffff);
    // graphics.drawRoundedRect(0, 0, rectWidth, rectHeight, 37.5);
    // this.scoreText = this.game.add.text(
    //   width - rectWidth - rectOffsetFromEdge + offsetLeft,
    //   height / 2 - rectHeight / 2 + offsetTop,
    //   '',
    //   {
    //     font: `${32}px Exo 2`,
    //     fill: 'black',
    //     fontWeight: 900,
    //   },
    //   this,
    // );

    // Boundaries for the playable game area
    this.minX = 0;
    this.minY = 50;
    this.maxX = width - 100;
    this.maxY = height - 50;
    this.game.physics.arcade.setBounds(this.minX, this.minY, this.maxX, this.maxY);
    console.log(this.minY, this.maxX, this.maxY);

    // Score timer
    const scoreTimer = this.game.time.create();
    scoreTimer.loop(250, this.onScoreTimer, this);
    scoreTimer.start();

    // Player ship
    this.player = new PlayerShip(this, 125, height / 2);
    this.game.player = this.player;
    this.add(this.player);

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
      y = (this.maxY - 200) * Math.random() + 100;
    }
    this.enemies.add(
      new Enemy(this.game, x, y, randomColor(), randomColor()),
    );
  }

  public spawnAsteroid() {
    const x = this.maxX;
    // XXX: Shouldn't use hard-coded consants for asteroid size.
    // Should be based on the asteroid's intrinsic size.
    let y = (this.maxY - 200) * Math.random() + 100;
    // Punish players who are camping
    if (this.player.shieldColors.length === 3 || this.player.repairLevel === 3) {
      y = this.player.y;
    }

    this.asteroids.add(new Asteroid(this.game, x, y));
  }

  public update() {
    super.update();

    // Player <-> enemy bullet collision
    this.game.physics.arcade.overlap(
      this.game.enemyBullets,
      this.player,
      (player: PlayerShip, bullet: EnemyBullet) => {
        const playerHasMatchingShield = player.shieldColors.some(
          color => color === bullet.color,
        );
        // Bullet hits
        if (
          player.shieldColors.length === 0 ||
          !playerHasMatchingShield ||
          !player.shield.visible
        ) {
          player.damage(this.game.enemyBullets.damage);
          this.damagedFx.play();
          this.game.camera.shake(0.005, 400);
          this.expolosion(bullet.x, bullet.y, 0.5);
        } else {
          player.damage(this.game.enemyBullets.damage * 0.05);
          player.shieldTint();
          this.shieldFx.play();
        }
        bullet.kill();
      },
    );

    // Enemy <-> player bullet collision
    [
      this.player.redBullets,
      this.player.blueBullets,
      this.player.yellowBullets,
    ].map(bulletGroup => {
      this.game.physics.arcade.overlap(
        this.enemies,
        bulletGroup,
        (enemy: Enemy, bullet: PlayerWeaponBullet) => {
          const playerBulletCanHurtEnemy = bullet.color.includes(enemy.color);
          // Bullet hits
          if (playerBulletCanHurtEnemy) {
            enemy.destroy();
            this.game.score += 150;
          } else {
            this.shieldFx.play();
          }
          bullet.kill();
        },
      );
    });

    // Enemy <-> player ship (no shield) collision
    this.game.physics.arcade.overlap(
      this.enemies,
      this.player,
      (player: PlayerShip, enemy: Enemy) => {
        enemy.destroy();
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
        this.expolosion(asteroid.x, asteroid.y, 1.0);
        asteroid.destroy();
        this.game.camera.shake(0.02, 800);
        player.damage(asteroid.collisionDamage);
        this.collideFx.play();
      },
    );
  }

  private expolosion(x: number, y: number, scale: number) {
    const explosion = this.game.add.sprite(x, y, 'explosion-yellow');
    explosion.scale.setTo(scale, scale);
    explosion.anchor.setTo(0.75, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
  }

  private onScoreTimer() {
    this.game.score += 1;
    // this.scoreText.text = `SCORE: ${this.game.score}`;
  }
}
