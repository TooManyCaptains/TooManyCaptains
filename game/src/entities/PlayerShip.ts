import { Subsystem, Color } from './../../../common/types';
import { clamp, mapValues } from 'lodash';
import { PlayerWeapon } from './Weapon';
import HealthBar from './HealthBar';
import { Game } from 'phaser-ce';

function colorNameToLetter(color: Color): string {
  return color[0].toUpperCase();
}

export default class PlayerShip extends Phaser.Sprite {
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
  public shield: Phaser.Sprite;
  public shieldColors: Color[] = [];
  public movementSpeed: number;

  public batteryDrainPerSecond: number;
  public batteries: { [subsystem in Subsystem]: number };

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 'player-ship');
    this.animations.add('move');
    this.animations.play('move', 20, true);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);

    // Set hitbox size
    this.body.setSize(165.4, 63.2, 25.8, 28.4);

    // Batteries
    this.batteries = {
      weapons: 15,
      shields: 0,
      thrusters: 0,
      repairs: 0,
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

    // Shields
    this.shield = game.add.sprite(this.x, this.y, 'shield_R');
    this.setShields(this.shieldColors);
    this.shield.anchor.setTo(0.5, 0.5);
    game.physics.enable(this.shield, Phaser.Physics.ARCADE);

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
  }

  get weaponCharge() {
    const maxCharge = 4000;
    return (
      clamp(Date.now() - this.timeChargingStarted, 100, maxCharge) / maxCharge
    );
  }

  public update() {
    this.shield.x = this.x;
    this.shield.y = this.y;
  }

  public setShields(colors: Color[]) {
    colors.sort();
    this.shieldColors = colors;
    if (colors.length === 0) {
      this.shield.exists = false;
      return;
    }
    this.shield.visible = this.batteries.shields > 0;
    const shieldKey = `shield_${colors.map(colorNameToLetter).join('')}`;
    this.shield.loadTexture(shieldKey);
  }

  public setWeapons(colors: Color[]) {
    colors.sort();
    this.weaponColors = colors;
    if (colors.length === 0) {
      this.weapon = null;
      this.stopChargingWeaponAndFireIfPossible();
    } else {
      this.weapon = new PlayerWeapon(
        this,
        colors.map(colorNameToLetter).join(''),
      );
    }
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

  public startMovingDown() {
    // Can't move up with 0 thrusters
    if (this.thrustersLevel === 0) {
      return;
    }
    this.body.velocity.y = this.movementSpeed;
    if (this.thrustersLevel === 1) {
      this.moveFastFx.play();
    } else if (this.thrustersLevel === 2) {
      this.moveSlowFx.play();
    }
  }

  public startMovingUp() {
    // Can't move with 0 thrusters
    if (this.thrustersLevel === 0) {
      return;
    }
    this.body.velocity.y = -this.movementSpeed;
    if (this.thrustersLevel === 1) {
      this.moveFastFx.play();
    } else if (this.thrustersLevel === 2) {
      this.moveSlowFx.play();
    }
  }

  public stopMoving() {
    this.body.velocity.y = 0;
    this.moveFastFx.stop();
    this.moveSlowFx.stop();
  }

  public getHurtTint() {
    this.tint = 0xff0000;
    setTimeout(() => (this.tint = 0xffffff), 150);
    const h = setInterval(() => (this.tint = 0xffffff), 100);
    setTimeout(() => clearInterval(h), 500);
  }

  public setthrustersLevel(level: number) {
    this.thrustersLevel = level;
    const levelSpeedMap = [0, 25, 100];
    this.movementSpeed = levelSpeedMap[level];
    if (this.movementSpeed === 0) {
      this.stopMoving();
    }
  }

  public setRepairLevel(level: number) {
    this.repairLevel = level;
    const repairSpeedMap = [0, 0.015, 0.025, 0.065];
    this.repairPercentagePerSecond = repairSpeedMap[level];
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
