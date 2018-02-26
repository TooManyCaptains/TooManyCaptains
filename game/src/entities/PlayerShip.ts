import { Subsystem, Color } from './../../../common/types';
import { clamp, mapValues } from 'lodash';
import { PlayerWeapon } from './Weapon';
import HealthBar from './HealthBar';
import { Game } from '../index';

import { range } from 'lodash';

function colorNameToLetter(color: Color): string {
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

  public weaponLightTop: Phaser.Sprite;
  public weaponLightMiddle: Phaser.Sprite;
  public weaponLightBottom: Phaser.Sprite;

  public repair: Phaser.Sprite;
  public ship: Phaser.Sprite;
  public thurster: Phaser.Sprite;

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 'player-ship');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);

    // Set hitbox size
    this.body.setSize(177.88, 76.13, 25.8, 11.93); // Set hitbox size

    // Batteries
    const baseSecs = this.game.params.noCards ? Infinity : 0;
    this.batteries = {
      weapons: baseSecs + 15,
      thrusters: baseSecs,
      repairs: baseSecs,
      shields: baseSecs,
    };
    this.batteryDrainPerSecond = 1;
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
    this.timeChargingStarted = 0;
    this.growingBullet = this.game.add.sprite(this.x + this.width / 2, this.y);
    this.growingBullet.anchor.setTo(0.5, 0.5);
    this.growingBullet.update = () => {
      const scale = 0.25 * (1 + this.weaponCharge * 1.5);
      this.growingBullet.scale.setTo(scale, scale);
      this.growingBullet.y = this.y;
    };

    // Sound effects
    this.shootFx = this.game.add.audio('shoot');
    this.moveSlowFx = this.game.add.audio('move_slow');
    this.moveFastFx = this.game.add.audio('move_fast');
    this.chargingFx = this.game.add.audio('charging');

    // Repairs
    this.repairLevel = 0;
    this.repairPercentagePerSecond = 0;
    this.repairIntervalMsec = 250;
    this.game.time
      .create()
      .loop(this.repairIntervalMsec, this.onRepair, this)
      .timer.start();

    this.sprites = new Phaser.Group(game);
    // 1: Thurster(BOTTOM)
    this.thurster = game.add.sprite(this.x, this.y, 'ship-thurster');
    this.thurster.animations.add('up',   [4,5,6,7], 10, true);
    this.thurster.animations.add('down', [0,1,2,3], 10, true);
    this.thurster.visible = false;
    this.thurster.anchor.setTo(0.5, 0.5);
    // 2: Ship    
    // this.loadTexture('player-ship');
    // this.anchor.setTo(0.5, 0.5);
    this.animations.add('move');
    this.animations.play('move', 20, true);
    // 3: Repair
    this.repair = game.add.sprite(this.x, this.y, 'ship-repair');
    this.repair.animations.add('repairing', range(6), 10, true);
    this.repair.animations.play('repairing');
    this.repair.visible = false;
    this.repair.anchor.setTo(0.5, 0.5);
    // 4. Weapon
    this.weapons = new Phaser.Group(game);
    this.weaponLightTop = game.add.sprite(this.x, this.y, 'ship-weapon-light-top');
    this.weaponLightMiddle = game.add.sprite(this.x, this.y, 'ship-weapon-light-middle');
    this.weaponLightBottom = game.add.sprite(this.x, this.y, 'ship-weapon-light-bottom');
    this.weaponLightTop.animations.add('R', [0], 60, false);
    this.weaponLightTop.animations.add('Y', [1], 60, false);
    this.weaponLightTop.animations.add('B', [2], 60, false);
    this.weaponLightMiddle.animations.add('R', [0], 60, false);
    this.weaponLightMiddle.animations.add('Y', [1], 60, false);
    this.weaponLightMiddle.animations.add('B', [2], 60, false);
    this.weaponLightBottom.animations.add('R', [0], 60, false);
    this.weaponLightBottom.animations.add('Y', [1], 60, false);
    this.weaponLightBottom.animations.add('B', [2], 60, false);
    this.weaponLightTop.visible    = false;
    this.weaponLightMiddle.visible = false;
    this.weaponLightBottom.visible = false;
    this.weaponLightTop.anchor.setTo(0.5, 0.5);
    this.weaponLightMiddle.anchor.setTo(0.5, 0.5);
    this.weaponLightBottom.anchor.setTo(0.5, 0.5);
    // 5. Shield
    this.shield = game.add.sprite(this.x, this.y, 'ship-shield');
    this.shield.animations.add('R'  , [0], 60, false);
    this.shield.animations.add('Y'  , [1], 60, false);
    this.shield.animations.add('B'  , [2], 60, false);
    this.shield.animations.add('BY' , [3], 60, false);
    this.shield.animations.add('BR' , [4], 60, false);
    this.shield.animations.add('RY' , [5], 60, false);
    this.shield.animations.add('BRY', [6], 60, false);
    this.shield.visible = false;
    this.shield.anchor.setTo(0.5, 0.5);
    game.physics.enable(this.shield, Phaser.Physics.ARCADE); // why not this.game.physics ??
    this.setShields(this.shieldColors);

    // 6: Explosion(TOP)
    this.explodsions = new Phaser.Group(game);

    this.sprites.add(this.thurster);
    this.sprites.add(this.repair);
    this.sprites.add(this.weapons);
    this.sprites.add(this.shield);
    this.sprites.add(this.explodsions);

  }

  public setWeapons(colors: Color[]) {
    colors.sort();
    this.weaponColors = colors;
    if (colors.length === 0) {
      this.weapon = null;
      this.stopChargingWeaponAndFireIfPossible();
      this.weaponLightTop.visible    = false;
      this.weaponLightMiddle.visible = false;
      this.weaponLightBottom.visible = false;
      return;
    } else if (colors.length === 1) {
      this.weaponLightTop.animations.play(colorNameToLetter(colors[0]));
      this.weaponLightTop.visible    = true;
      this.weaponLightMiddle.visible = false;
      this.weaponLightBottom.visible = false;
    } else if (colors.length === 2) {
      this.weaponLightTop.animations.play(colorNameToLetter(colors[0]));
      this.weaponLightMiddle.animations.play(colorNameToLetter(colors[1]));
      this.weaponLightTop.visible    = true;
      this.weaponLightMiddle.visible = true;
      this.weaponLightBottom.visible = false;
    } else if (colors.length === 3) {
      this.weaponLightTop.animations.play(colorNameToLetter(colors[0]));
      this.weaponLightMiddle.animations.play(colorNameToLetter(colors[1]));
      this.weaponLightBottom.animations.play(colorNameToLetter(colors[2]));
      this.weaponLightTop.visible    = true;
      this.weaponLightMiddle.visible = true;
      this.weaponLightBottom.visible = true;
    }
    this.weapon = new PlayerWeapon(
      this,
      colors.map(colorNameToLetter).join(''),
    );
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
    const repairSpeedMap = [0, 0.015, 0.025, 0.065];
    const repairAnimationSpeedMap = [0, 10, 30, 90];
    this.repairPercentagePerSecond = repairSpeedMap[level];
    if (level > 0) {
      this.repair.visible = true;
      this.repair.animations.getAnimation('repairing').speed = repairAnimationSpeedMap[level];
    } else {
      this.repair.visible = false;
    }
  }

  get weaponCharge() {
    const maxCharge = 4000;
    return (
      clamp(Date.now() - this.timeChargingStarted, 100, maxCharge) / maxCharge
    );
  }

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
    colors.sort();
    this.shieldColors = colors;
    if (colors.length === 0) {
      this.shield.exists = false;
      return;
    }
    this.shield.visible = this.batteries.shields > 0;
    this.shield.animations.play(colors.map(colorNameToLetter).join(''));
  }

  public fireWeapon() {
    if (!this.weapon) {
      return;
    }
    this.weapon.fire(this.weaponCharge);
    this.shootFx.play();
  }

  public startChargingWeapon() {
    if (!this.weapon) {
      return;
    }
    this.timeChargingStarted = Date.now();
    this.growingBullet.loadTexture(`bullet_${this.weapon.color}`);
    this.growingBullet.visible = true;
    this.chargingFx.play();
  }

  public stopChargingWeaponAndFireIfPossible() {
    this.chargingFx.stop();
    this.growingBullet.visible = false;
    if (this.weapon && this.batteries.weapons > 0) {
      this.fireWeapon();
    }
  }



  public stopMoving() {
    this.body.velocity.y = 0;
    this.thurster.visible = false;
    this.moveFastFx.stop();
    this.moveSlowFx.stop();
  }

  public getHurtTint() {
    this.tint = 0xff0000;
    setTimeout(() => (this.tint = 0xffffff), 150);
    const h = setInterval(() => (this.tint = 0xffffff), 100);
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
      this.stopChargingWeaponAndFireIfPossible();
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
