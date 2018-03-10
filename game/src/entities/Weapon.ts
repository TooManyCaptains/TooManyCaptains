import { Color } from './../../../common/types';
import { Game } from '../index';
import PlayerShip from './PlayerShip';
import { Enemy } from './Enemy';
import { colorNameToLetter } from '../utils';

const toDegrees = (radians: number) => radians * 180 / Math.PI;

export class EnemyWeapon extends Phaser.Group {
  public color: Color;
  public game: Game;
  public bulletColor: string;
  public bulletDamage = 10;
  public ship: Enemy;

  private bulletVelocity = -200;

  constructor(game: Game) {
    super(
      game,
      game.world,
      'Enemy Bullet',
      false,
      true,
      Phaser.Physics.ARCADE,
    );

    for (let i = 0; i < 256; i++) {
      const beam = new Beam(game, 'beam_R');
      beam.color = 'red';
      this.add(beam, true);
    }
  }

  public fire(game: Game, ship: Enemy): boolean {
    if (ship.game.time.time < ship.nextFire) {
      return false;
    }

    const x = ship.x - (ship.width/2);
    const y = ship.y;

    const angleToPlayer = toDegrees(
      game.physics.arcade.angleToXY(game.player, x, y),
    );
    const beam = this.getFirstExists(false);
    beam.color = ship.weaponColor;
    beam.loadTexture(`beam_${ship.weaponType}`);
    beam.fire(
      x,
      y,
      angleToPlayer,
      this.bulletVelocity,
      0,
      600,
    );
    ship.nextFire = this.game.time.time + ship.fireRate;
    return true;
  }
}

export class Beam extends Phaser.Sprite {
  public color: string;

  constructor(game: Game, key: string) {
    super(game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.scale.set(1.5, 1.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(28, 3.5, 15.5, 15.5);
  }

  public fire(x: number, y: number, angle: number, speed: number) {
    this.reset(x, y);
    this.angle = angle;
    this.game.physics.arcade.velocityFromAngle(
      angle,
      speed,
      this.body.velocity,
    );
  }
}


// export class Weapon extends Phaser.Group {
//   public game: Game;
//   public bulletColor: string;
//   public bulletDamage: number;
//   public ship: Enemy;

//   private bulletVelocity = 200;
//   private fireRate: 250;
//   private yOffset: number;
//   private nextFire = 0;

//   constructor(
//     ship: Enemy,
//     bulletDamage = 10,
//     bulletColor = 'R',
//     yOffset = 0,
//     angle = 0,
//   ) {
//     super(
//       ship.game,
//       ship.game.world,
//       'Single Bullet',
//       false,
//       true,
//       Phaser.Physics.ARCADE,
//     );
//     this.ship = ship;

//     this.bulletColor = bulletColor;

//     this.nextFire = 0;
//     this.bulletDamage = bulletDamage;
//     this.bulletVelocity = -this.bulletVelocity;
//     this.yOffset = yOffset;

//     for (let i = 0; i < 64; i++) {
//       const bullet = new Beam(ship.game, `beam_${bulletColor}`);
//       bullet.angle = angle;
//       bullet.color = bulletColor;
//       this.add(bullet, true);
//     }
//   }

//   public fire(): boolean {
//     if (this.game.time.time < this.nextFire) {
//       return false;
//     }

//     const x = this.ship.x;
//     const y = this.ship.y + this.yOffset;

//     const angleToPlayer = toDegrees(
//       this.game.physics.arcade.angleToXY(this.game.player, x, y),
//     );
//     this.getFirstExists(false).fire(
//       x,
//       y,
//       angleToPlayer,
//       this.bulletVelocity,
//       0,
//       600,
//     );
//     this.nextFire = this.game.time.time + this.fireRate;
//     return true;
//   }
// }

export class Bullet extends Phaser.Sprite {
  public color: string;
  public strength = 0;

  constructor(game: Game, key: string) {
    super(game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(15, 15, 40, 5);
  }

  public fire(x: number, y: number, speed: number, strength: number) {
    this.reset(x, y);
    this.angle = 0;
    // this.strength = 50 * strength;
    // console.log(`bullet damage: ${this.strength}`);
    this.game.physics.arcade.velocityFromAngle(
      this.angle,
      speed,
      this.body.velocity,
    );
  }
}

export class PlayerWeapon extends Phaser.Group {
  public game: Game;
  public ship: PlayerShip;
  public nextFire = 0;
  public bulletVelocity = 400;
  public fireRate = 500;
  public color: Color;
  public colorType: string;

  constructor(ship: PlayerShip, color: Color) {
    super(
      ship.game,
      ship.game.world,
      'Player Bullet',
      false,
      true,
      Phaser.Physics.ARCADE,
    );
    this.ship = ship;
    this.colorType = colorNameToLetter(color);
    this.bulletVelocity = this.bulletVelocity;
    for (let i = 0; i < 64; i++) {
      const bullet = new Bullet(this.game, 'bullet_new_' + this.colorType);
      bullet.color = color;
      this.add(bullet, true);
    }
  }

  public fire(strength: number, canon: number) {
    console.info(`firing with strength: ${strength}`);
    const x = [
      this.ship.x + this.ship.width / 2 - 48,
      this.ship.x + this.ship.width / 2,
      this.ship.x + this.ship.width / 2 - 48,
    ];
    const y = [this.ship.y - 33.5, this.ship.y, this.ship.y + 33.5];
    this.getFirstExists(false).fire(
      x[canon],
      y[canon],
      this.bulletVelocity,
      strength,
    );
  }
}
