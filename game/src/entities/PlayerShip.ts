import { Subsystem, Color, ColorPosition } from './../../../common/types';
import { mapValues } from 'lodash';
import { PlayerWeapon } from './Weapon';
import HealthBar from './PlayerHealthBar';
import { Game } from '../index';

import { range } from 'lodash';
import Board from './Board';

const LOW_HEALTH = 20;
const VERY_LOW_HEALTH = 10;

export function colorNameToLetter(color: Color): string {
  return color[0].toUpperCase();
}

export default class PlayerShip extends Phaser.Sprite {
  public game: Game;
  public weaponDamage: any;
  public repairIntervalMsec: number;
  public repairPercentagePerSecond: number;
  public repairLevel: number;
  public chargingFx: Phaser.Sound;
  public moveFastFx: Phaser.Sound;
  public moveSlowFx: Phaser.Sound;
  public shootFx: Phaser.Sound;
  public growingBullet: Phaser.Sprite;
  public timeChargingStarted: number;
  public weapon: PlayerWeapon | null;
  public weaponColors: Color[];
  public healthBar: HealthBar;
  public thrustersLevel: number;
  public batteryDrainTimerFreq: number;

  public movementSpeed: number;

  public batteryDrainPerSecond: number;
  public batteries: { [subsystem in Subsystem]: number };

  public sprites: Phaser.Group;
  public explodsions: Phaser.Group;
  public shield: Phaser.Sprite;
  public shieldColors: Color[] = [];

  public weapons: Phaser.Group;
  public weaponColorPositions: ColorPosition[];

  public weaponLightTop: Phaser.Sprite;
  public weaponLightMiddle: Phaser.Sprite;
  public weaponLightBottom: Phaser.Sprite;

  public redBullets: PlayerWeapon;
  public blueBullets: PlayerWeapon;
  public yellowBullets: PlayerWeapon;

  public repair: Phaser.Sprite;
  public ship: Phaser.Sprite;
  public thurster: Phaser.Sprite;

  private nextFire = 0;
  private fireRate = 750;
  private healthLowFx: Phaser.Sound;
  private healthVeryLowFx: Phaser.Sound;

  constructor(board: Board, x: number, y: number) {
    super(board.game, x, y, 'player-ship');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);

    // Set hitbox size
    this.body.setSize(177.88, 76.13, 25.8, 11.93); // Set hitbox size

    // Batteries
    const baseSecs = this.game.params.noCards ? Infinity : 0;
    this.batteries = {
      weapons: baseSecs,
      thrusters: baseSecs,
      repairs: baseSecs,
      shields: baseSecs,
    };
    this.batteryDrainPerSecond = 0.5;
    this.batteryDrainTimerFreq = 60;
    this.game.time
      .create()
      .loop(this.batteryDrainTimerFreq, this.onDrainSubsystemBatteries, this)
      .timer.start();

    // Movement
    this.movementSpeed = 0;
    this.body.collideWorldBounds = true;
    this.thrustersLevel = 0;

    // Health
    this.maxHealth = 100;
    this.health = 100;

    // HP bar
    this.healthBar = new HealthBar(this);

    // Weapons
    this.weaponColors = [];
    this.weapon = null;

    this.weaponColorPositions = [];

    // this.timeChargingStarted = 0;
    // this.growingBullet = this.game.add.sprite(this.x + this.width / 2, this.y);
    // this.growingBullet.anchor.setTo(0.5, 0.5);
    // this.growingBullet.update = () => {
    //   const scale = 0.25 * (1 + this.weaponCharge * 1.5);
    //   this.growingBullet.scale.setTo(scale, scale);
    //   this.growingBullet.y = this.y;
    // };

    // Sound effects
    this.shootFx = this.game.add.audio('shoot');
    this.moveSlowFx = this.game.add.audio('move_slow');
    this.moveFastFx = this.game.add.audio('move_fast');
    this.chargingFx = this.game.add.audio('charging');
    this.healthLowFx = this.game.add.audio('health_low');
    this.healthVeryLowFx = this.game.add.audio('health_very_low');

    // Repairs
    this.repairLevel = 0;
    this.repairPercentagePerSecond = 0;
    this.repairIntervalMsec = 250;
    this.game.time
      .create()
      .loop(this.repairIntervalMsec, this.onRepair, this)
      .timer.start();

    this.sprites = new Phaser.Group(board.game);
    // 1: Thurster(BOTTOM)
    this.thurster = board.game.add.sprite(this.x, this.y, 'ship-thurster');
    this.thurster.animations.add('up', [4, 5, 6, 7], 10, true);
    this.thurster.animations.add('down', [0, 1, 2, 3], 10, true);
    this.thurster.visible = false;
    this.thurster.anchor.setTo(0.5, 0.5);
    // 2: Ship
    // this.loadTexture('player-ship');
    // this.anchor.setTo(0.5, 0.5);
    this.animations.add('move');
    this.animations.play('move', 20, true);
    // 3: Repair
    this.repair = board.game.add.sprite(this.x, this.y, 'ship-repair');
    this.repair.animations.add('repairing', range(6), 10, true);
    this.repair.animations.play('repairing');
    this.repair.visible = false;
    this.repair.anchor.setTo(0.5, 0.5);
    // 4. Weapon
    this.weapons = new Phaser.Group(board.game);
    this.weaponLightTop = board.game.add.sprite(
      this.x,
      this.y,
      'ship-weapon-light-top',
    );
    this.weaponLightMiddle = board.game.add.sprite(
      this.x,
      this.y,
      'ship-weapon-light-middle',
    );
    this.weaponLightBottom = board.game.add.sprite(
      this.x,
      this.y,
      'ship-weapon-light-bottom',
    );
    this.weaponLightTop.animations.add('red', [0], 60, false);
    this.weaponLightTop.animations.add('yellow', [1], 60, false);
    this.weaponLightTop.animations.add('blue', [2], 60, false);
    this.weaponLightMiddle.animations.add('red', [0], 60, false);
    this.weaponLightMiddle.animations.add('yellow', [1], 60, false);
    this.weaponLightMiddle.animations.add('blue', [2], 60, false);
    this.weaponLightBottom.animations.add('red', [0], 60, false);
    this.weaponLightBottom.animations.add('yellow', [1], 60, false);
    this.weaponLightBottom.animations.add('blue', [2], 60, false);
    this.weaponLightTop.visible = false;
    this.weaponLightMiddle.visible = false;
    this.weaponLightBottom.visible = false;
    this.weaponLightTop.anchor.setTo(0.5, 0.5);
    this.weaponLightMiddle.anchor.setTo(0.5, 0.5);
    this.weaponLightBottom.anchor.setTo(0.5, 0.5);

    this.redBullets = new PlayerWeapon(this, 'red');
    this.blueBullets = new PlayerWeapon(this, 'blue');
    this.yellowBullets = new PlayerWeapon(this, 'yellow');

    this.redBullets.forEach(this.game.debug.body, this.game.debug, true);
    this.yellowBullets.forEach(this.game.debug.body, this.game.debug, true);
    this.blueBullets.forEach(this.game.debug.body, this.game.debug, true);

    // 5. Shield
    this.shield = board.game.add.sprite(this.x, this.y, 'ship-shield');
    this.shield.animations.add('R', [0], 60, false);
    this.shield.animations.add('Y', [1], 60, false);
    this.shield.animations.add('B', [2], 60, false);
    this.shield.animations.add('BY', [3], 60, false);
    this.shield.animations.add('BR', [4], 60, false);
    this.shield.animations.add('RY', [5], 60, false);
    this.shield.animations.add('BRY', [6], 60, false);
    this.shield.visible = false;
    this.shield.anchor.setTo(0.5, 0.5);
    board.game.physics.enable(this.shield, Phaser.Physics.ARCADE);
    this.setShields(this.shieldColors);

    // 6: Explosion(TOP)
    this.explodsions = new Phaser.Group(board.game);

    this.sprites.add(this.thurster);
    this.sprites.add(this.repair);
    this.sprites.add(this.weapons);
    this.sprites.add(this.shield);
    this.sprites.add(this.explodsions);
  }

  public setWeapons(colorPositions: ColorPosition[]) {
    this.weaponColorPositions = colorPositions;
    // this.stopChargingWeaponAndFireIfPossible();
    if (colorPositions.length === 0) {
      this.weapon = null;
    }
    this.weaponLightTop.visible = false;
    this.weaponLightMiddle.visible = false;
    this.weaponLightBottom.visible = false;
    colorPositions.forEach(({ color, position }) => {
      if (position === 0) {
        this.weaponLightTop.animations.play(color);
        this.weaponLightTop.visible = true;
      } else if (position === 1) {
        this.weaponLightMiddle.animations.play(color);
        this.weaponLightMiddle.visible = true;
      } else if (position === 2) {
        this.weaponLightBottom.animations.play(color);
        this.weaponLightBottom.visible = true;
      }
    });
    // this.weapon = new PlayerWeapon(
    //   this,
    //   colors.map(colorNameToLetter).join(''),
    // );
  }

  public startMovingDown() {
    // Can't move up with 0 thrusters
    if (this.thrustersLevel === 0) {
      this.thurster.visible = false;
      return;
    }
    this.body.velocity.y = this.movementSpeed;
    this.thurster.visible = true;
    this.thurster.animations.play('down');
    if (this.thrustersLevel === 1) {
      this.thurster.animations.getAnimation('down').speed = 10;
      this.moveFastFx.play();
    } else if (this.thrustersLevel === 2) {
      this.thurster.animations.getAnimation('down').speed = 30;
      this.moveSlowFx.play();
    }
  }

  public startMovingUp() {
    // Can't move with 0 thrusters
    if (this.thrustersLevel === 0) {
      this.thurster.visible = false;
      return;
    }
    this.body.velocity.y = -this.movementSpeed;
    this.thurster.visible = true;
    this.thurster.animations.play('up');
    if (this.thrustersLevel === 1) {
      this.thurster.animations.getAnimation('up').speed = 10;
      this.moveFastFx.play();
    } else if (this.thrustersLevel === 2) {
      this.thurster.animations.getAnimation('up').speed = 30;
      this.moveSlowFx.play();
    }
  }

  public setRepairLevel(level: number) {
    this.repairLevel = level;
    const repairSpeedMap = [0, 0.02, 0.04, 0.06];
    const repairAnimationSpeedMap = [0, 10, 30, 90];
    this.repairPercentagePerSecond = repairSpeedMap[level];
    if (level > 0) {
      this.repair.visible = true;
      this.repair.animations.getAnimation('repairing').speed =
        repairAnimationSpeedMap[level];
    } else {
      this.repair.visible = false;
    }
  }

  // get weaponCharge() {
  //   const maxCharge = 4000;
  //   return (
  //     clamp(Date.now() - this.timeChargingStarted, 100, maxCharge) / maxCharge
  //   );
  // }

  public update() {
    this.weaponLightTop.x = this.x;
    this.weaponLightTop.y = this.y;
    this.weaponLightMiddle.x = this.x;
    this.weaponLightMiddle.y = this.y;
    this.weaponLightBottom.x = this.x;
    this.weaponLightBottom.y = this.y;
    this.shield.x = this.x;
    this.shield.y = this.y;
    this.thurster.x = this.x;
    this.thurster.y = this.y;
    this.repair.x = this.x;
    this.repair.y = this.y;
  }

  public setShields(colors: Color[]) {
    this.shieldColors = colors;
    if (colors.length === 0) {
      this.shield.exists = false;
      return;
    }
    this.shield.visible = this.batteries.shields > 0;
    this.shield.animations.play(colors.map(colorNameToLetter).join(''));
  }

  public shieldTint() {
    this.shield.tint = 0x000000;
    // const h = setInterval(() => (this.shield.tint = 0xffffff), 50);
    setTimeout(() => (this.shield.tint = 0xffffff), 50);
  }

  public damage(amount: number): Phaser.Sprite {
    super.damage(amount);
    if (this.health <= LOW_HEALTH && !this.healthLowFx.isPlaying) {
      this.healthVeryLowFx.stop();
      this.healthLowFx.play();
    } else if (this.health <= VERY_LOW_HEALTH && !this.healthVeryLowFx.isPlaying) {
      this.healthLowFx.stop();
      this.healthVeryLowFx.play();
    }
    return this;
  }

  public fireWeapon() {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    this.weaponColorPositions.map(({ color, position }) => {
      if (color === 'blue') {
        this.blueBullets.fire(20, position);
      } else if (color === 'red') {
        this.redBullets.fire(20, position);
      } else if (color === 'yellow') {
        this.yellowBullets.fire(20, position);
      }
    });
    if (this.weaponColorPositions.length > 0) {
      this.shootFx.play();
    }
    this.nextFire = this.game.time.time + this.fireRate;
  }

  // public startChargingWeapon() {
  //   if (!this.weapon) {
  //     return;
  //   }
  //   this.timeChargingStarted = Date.now();
  //   this.growingBullet.loadTexture(`bullet_${this.weapon.color}`);
  //   this.growingBullet.visible = true;
  //   this.chargingFx.play();
  // }

  // public stopChargingWeaponAndFireIfPossible() {
  //   this.chargingFx.stop();
  //   this.growingBullet.visible = false;
  //   if (this.weapon && this.batteries.weapons > 0) {
  //     this.fireWeapon();
  //   }
  // }

  public stopMoving() {
    this.body.velocity.y = 0;
    this.thurster.visible = false;
    this.moveFastFx.stop();
    this.moveSlowFx.stop();
  }

  public getHurtTint() {
    this.tint = 0xff0000;
    setTimeout(() => (this.tint = 0xffffff), 150);
    const h = setInterval(() => (this.tint = 0xffffff), 50);
    setTimeout(() => clearInterval(h), 500);
  }

  public setThrustersLevel(level: number) {
    this.thrustersLevel = level;
    const levelSpeedMap = [0, 25, 100];
    this.movementSpeed = levelSpeedMap[level];
    if (this.movementSpeed === 0) {
      this.stopMoving();
    }
  }

  private onDrainSubsystemBatteries() {
    const delta =
      this.batteryDrainPerSecond * (this.batteryDrainTimerFreq / 1000);
    this.batteries = mapValues(this.batteries, charge =>
      Math.max(0, charge - delta),
    );
    this.setShields(this.shieldColors);
    if (this.batteries.weapons === 0) {
      // this.stopChargingWeaponAndFireIfPossible();
    }
  }

  private onRepair() {
    if (this.batteries.repairs === 0) {
      return;
    }
    this.heal(
      this.repairPercentagePerSecond *
        this.maxHealth *
        (this.repairIntervalMsec / 1000),
    );
  }
}
