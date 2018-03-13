import { PlayerWeapon } from './PlayerWeapon';
// import HealthBar from './PlayerHealthBar';
import { Game } from '../index';

import { range } from 'lodash';
import { ThrusterDirection, ThrusterLevel } from '../Session';
import { colorsToColorKey } from '../utils';

// const LOW_HEALTH = 25;
// const VERY_LOW_HEALTH = 10;

export default class PlayerShip extends Phaser.Group {
  public game: Game;

  public repairIntervalMsec: number;
  public repairPercentagePerSecond: number;

  public ship: Phaser.Sprite;
  public shield: Phaser.Sprite;
  public repair: Phaser.Sprite;
  public thruster: Phaser.Sprite;
  public weapons: Phaser.Group;

  public explosions: Phaser.Group;

  public redBullets: PlayerWeapon;
  public blueBullets: PlayerWeapon;
  public yellowBullets: PlayerWeapon;

  private nextFire = 0;
  private fireRate = 750;
  // private healthLowFx: Phaser.Sound;
  // private healthVeryLowFx: Phaser.Sound;
  // private healthBar: HealthBar;
  private weaponLightTop: Phaser.Sprite;
  private weaponLightMiddle: Phaser.Sprite;
  private weaponLightBottom: Phaser.Sprite;
  private moveFastFx: Phaser.Sound;
  private moveSlowFx: Phaser.Sound;
  private shootFx: Phaser.Sound;

  constructor(game: Game, x: number, y: number) {
    super(game);
    // Ship itself
    this.ship = this.game.add.sprite(x, y, 'player-ship');
    this.ship.anchor.setTo(0.5, 0.5);
    this.add(this.ship);

    this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);

    // Set hitbox size
    this.ship.body.setSize(177.88, 76.13, 25.8, 11.93);

    // Movement
    this.ship.body.collideWorldBounds = true;

    // Health
    // tslint:disable-next-line:no-unused-expression
    // new HealthBar(this.ship);

    // Sound effects
    this.shootFx = this.game.add.audio('shoot');
    this.moveSlowFx = this.game.add.audio('move_slow');
    this.moveFastFx = this.game.add.audio('move_fast');
    // this.healthLowFx = this.game.add.audio('health_low');
    // this.healthVeryLowFx = this.game.add.audio('health_very_low');

    // Repairs
    this.repairPercentagePerSecond = 0;
    this.repairIntervalMsec = 250;
    this.game.time
      .create()
      .loop(this.repairIntervalMsec, this.onRepair, this)
      .timer.start();

    // 1: Thruster (added first, so bottom of the z-stack)
    this.thruster = this.game.add.sprite(0, 0, 'ship-thruster');
    this.thruster.animations.add('up', [4, 5, 6, 7], 10, true);
    this.thruster.animations.add('down', [0, 1, 2, 3], 10, true);
    this.thruster.visible = false;
    this.thruster.anchor.setTo(0.5, 0.5);
    // 2: Ship
    this.ship.animations.add('move');
    this.ship.animations.play('move', 20, true);
    // 3: Repair
    this.repair = this.game.add.sprite(0, 0, 'ship-repair');
    this.repair.animations.add('repairing', range(6), 10, true);
    this.repair.animations.play('repairing');
    this.repair.visible = false;
    this.repair.anchor.setTo(0.5, 0.5);
    // 4. Weapon
    this.weapons = new Phaser.Group(this.game);
    this.weaponLightTop = this.game.add.sprite(0, 0, 'ship-weapon-light-top');
    this.weaponLightMiddle = this.game.add.sprite(
      0,
      0,
      'ship-weapon-light-middle',
    );
    this.weaponLightBottom = this.game.add.sprite(
      0,
      0,
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
    this.weapons.add(this.weaponLightTop);
    this.weapons.add(this.weaponLightMiddle);
    this.weapons.add(this.weaponLightBottom);

    this.redBullets = new PlayerWeapon(this, 'red');
    this.blueBullets = new PlayerWeapon(this, 'blue');
    this.yellowBullets = new PlayerWeapon(this, 'yellow');

    this.redBullets.forEach(this.game.debug.body, this.game.debug, true);
    this.yellowBullets.forEach(this.game.debug.body, this.game.debug, true);
    this.blueBullets.forEach(this.game.debug.body, this.game.debug, true);

    // 5. Shield
    this.shield = this.game.add.sprite(0, 0, 'ship-shield');
    this.shield.animations.add('R', [0], 60, false);
    this.shield.animations.add('Y', [1], 60, false);
    this.shield.animations.add('B', [2], 60, false);
    this.shield.animations.add('BY', [3], 60, false);
    this.shield.animations.add('BR', [4], 60, false);
    this.shield.animations.add('RY', [5], 60, false);
    this.shield.animations.add('BRY', [6], 60, false);
    this.shield.visible = false;
    this.shield.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.shield, Phaser.Physics.ARCADE);

    // 6: Explosion(TOP)
    this.explosions = new Phaser.Group(this.game);

    this.add(this.thruster);
    this.add(this.repair);
    this.add(this.weapons);
    this.add(this.shield);
    this.add(this.explosions);

    this.game.session.onSubsystemsChanged.add(this.onSubsystemsChanged, this);
  }

  get x() {
    return this.ship.x;
  }

  get y() {
    return this.ship.y;
  }

  public thrustersChanged() {
    const level = this.game.session.thrusterLevel;
    const direction = ThrusterDirection.Stopped;
    const movementSpeed = [0, 25, 100][level];
    const animationSpeed = [0, 10, 30][level];
    console.log('level', level);
    console.log('direction', direction);

    if (
      level === ThrusterLevel.Off ||
      direction === ThrusterDirection.Stopped
    ) {
      this.ship.body.velocity.y = 0;
      this.thruster.visible = false;
      this.moveFastFx.stop();
      this.moveSlowFx.stop();
      return;
    }

    this.thruster.visible = true;
    this.thruster.animations.play(direction);
    this.thruster.animations.getAnimation(direction).speed = animationSpeed;

    if (direction === ThrusterDirection.Up) {
      this.ship.body.velocity.y = -movementSpeed;
    } else {
      this.ship.body.velocity.y = movementSpeed;
    }

    if (level === ThrusterLevel.Slow) {
      this.moveFastFx.play();
    } else if (level === ThrusterLevel.Fast) {
      this.moveSlowFx.play();
    }
  }

  public onSubsystemsChanged() {
    console.log('onsubysstems changed');

    // Weapons
    this.weaponLightTop.visible = false;
    this.weaponLightMiddle.visible = false;
    this.weaponLightBottom.visible = false;
    this.game.session.weaponColorPositions.forEach(({ color, position }) => {
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

    // Shields
    if (this.game.session.shieldColors.length === 0) {
      this.shield.exists = false;
    } else {
      this.shield.animations.play(
        colorsToColorKey(this.game.session.shieldColors),
      );
    }

    // Repairs
    const level = this.game.session.repairLevel;
    const repairSpeedMap = [0, 0.02, 0.035, 0.05];
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

  public update() {
    // Update the group's other children to use the ship's coordinates
    this.children.forEach(child => {
      if (child !== this.ship) {
        child.x = this.x;
        child.y = this.y;
      }
    });
  }

  public shieldTint() {
    this.shield.tint = 0x000000;
    setTimeout(() => (this.shield.tint = 0xffffff), 50);
  }

  public damage(amount: number) {
    // const health = this.game.session.health - amount;
    // this.ship.health = health;
    // if (health <= LOW_HEALTH && !this.healthLowFx.isPlaying) {
    //   this.healthVeryLowFx.stop();
    //   this.healthLowFx.play();
    // } else if (health <= VERY_LOW_HEALTH && !this.healthVeryLowFx.isPlaying) {
    //   this.healthLowFx.stop();
    //   this.healthVeryLowFx.play();
    // }
    // return this;
  }

  public fireWeapon() {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    this.game.session.weaponColorPositions.map(({ color, position }) => {
      if (color === 'blue') {
        this.blueBullets.fire(20, position);
      } else if (color === 'red') {
        this.redBullets.fire(20, position);
      } else if (color === 'yellow') {
        this.yellowBullets.fire(20, position);
      }
    });
    if (this.game.session.weaponColorPositions.length > 0) {
      this.shootFx.play();
    }
    this.nextFire = this.game.time.time + this.fireRate;
  }

  private onRepair() {
    this.game.session.health +=
      this.repairPercentagePerSecond *
      this.game.session.maxHealth *
      (this.repairIntervalMsec / 1000);
  }
}
