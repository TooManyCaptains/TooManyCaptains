import Panel from './Panel';
import { Game } from '../index';
import { Subsystem, Color } from '../../../common/types';
import { Captain } from '../types';

const baseStyle = {
  font: 'Exo 2',
  fontSize: 40,
  fill: 'white',
  fontWeight: 800,
  boundsAlignH: 'center',
  boundsAlignV: 'middle',
};

function colorNamesToColorKey(names: string[]) {
  const nameToKey = (name: string) => name[0].toUpperCase();
  return names.map(nameToKey, names).join('') || 'none';
}

class HealthBar {
  public game: Game;
  public text: Phaser.Text;
  private width: number;
  private height: number;
  private outline: Phaser.Graphics;
  private bar: Phaser.Graphics;

  constructor(
    game: Game,
    parent: Phaser.Group,
    width = 100,
    height = 20,
    color = 0,
    label = '',
    value = 0,
  ) {
    this.game = game;
    this.width = width;
    this.height = height;

    this.outline = game.add.graphics();
    this.outline.beginFill(0x999999, 1);
    const border = 0;
    this.outline.drawRoundedRect(
      border,
      border,
      this.width + border,
      this.height + border,
      25,
    );
    parent.add(this.outline);

    this.bar = game.add.graphics();
    this.color = color;
    parent.add(this.bar);

    this.text = game.add.text(0, 0, label, {
      ...baseStyle,
      fontSize: 28,
      boundsAlignH: 'center',
      fontWeight: 600,
      fill: 'black',
    });
    this.text.setTextBounds(0, 0, this.width, this.height + 2);
    parent.add(this.text);

    this.value = value;
  }

  set x(x: number) {
    this.bar.x = x;
    this.outline.x = x;
    this.text.x = x;
  }

  set y(y: number) {
    this.bar.y = y;
    this.outline.y = y;
    this.text.y = y;
  }

  set color(color: number) {
    this.bar.clear();
    this.bar.beginFill(color, 1);
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 25);
  }

  set label(label: string) {
    this.text.setText(label);
  }

  set value(value: number) {
    this.bar.scale.x = value;
  }
}

class BigHealthBar extends HealthBar {
  public game: Game;

  constructor(game: Game, parent: Phaser.Group, width: number) {
    super(game, parent, width, 50, 0x00ff00, 'HEALTH 100%', 1);
    this.text.fontSize = 40;
    this.text.fontWeight = 800;
  }
}

class ColorChart extends Phaser.Sprite {
  public game: Game;

  constructor(game: Game, x: number, y: number, colorNames: Color[] = []) {
    super(game, x, y);
    this.anchor.setTo(0.5, 0.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.setColors(colorNames);
  }

  public setColors(colorNames: Color[]) {
    const colorKey = colorNamesToColorKey(colorNames);
    if (colorNames.length > 0) {
      this.body.angularVelocity = 75;
    } else {
      this.body.angularVelocity = 0;
    }
    this.loadTexture(`ring-${colorKey}`);
  }
}

class PropulsionChart extends Phaser.Sprite {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 'ring-none');
    this.anchor.setTo(0.5, 0.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
  }

  public setLevel(level = 0) {
    if (level === 0) {
      this.loadTexture('ring-none');
      this.body.angularVelocity = 0;
      return;
    }
    this.loadTexture('ring-propulsion');
    if (level === 1) {
      this.body.angularVelocity = 75;
    } else if (level === 2) {
      this.body.angularVelocity = 300;
    }
  }
}

class RepairsChart extends Phaser.Sprite {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 'ring-none');
    this.anchor.setTo(0.5, 0.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
  }

  public setLevel(level = 0) {
    if (level === 0) {
      this.loadTexture('ring-none');
      this.body.angularVelocity = 0;
      return;
    }
    this.loadTexture('ring-repairs');
    if (level === 1) {
      this.body.angularVelocity = 75;
    } else if (level === 2) {
      this.body.angularVelocity = 300;
    } else if (level === 3) {
      this.body.angularVelocity = 1000;
    }
  }
}

class SubsystemIcon extends Phaser.Sprite {
  constructor(game: Game, x: number, y: number, subsystem: Subsystem) {
    super(game, x, y);
    this.anchor.setTo(0.5, 1);
    this.loadTexture(`icon-${subsystem}`);
  }
}

class Battery extends Phaser.Group {
  private maxSeconds = 15;
  private icon: Phaser.Sprite;
  private text: Phaser.Text;
  private bar: Phaser.Graphics;

  constructor(game: Game) {
    super(game);

    this.icon = this.game.add.sprite(0, 0, 'battery-red');
    this.icon.scale.setTo(0.9, 0.9);
    this.add(this.icon);

    this.text = this.game.add.text(
      0,
      0,
      '',
      { ...baseStyle, boundsAlignH: 'left', fontSize: 52 },
      this,
    );
    this.text.setTextBounds(15, 0, this.icon.width - 14, this.icon.height);

    this.maxSeconds = 15;
    this.seconds = 0;
  }

  set seconds(seconds: number) {
    const fraction = seconds / this.maxSeconds;
    if (this.bar) {
      this.remove(this.bar);
    }
    this.bar = this.game.add.graphics();
    this.bar.beginFill(0x999999, 1);
    const margin = 7;
    this.bar.drawRect(
      margin,
      margin,
      141 * this.icon.scale.y * fraction,
      this.icon.height - 2 * margin,
    );
    this.add(this.bar);
    const rounded = Math.ceil(seconds);
    if (rounded >= 10) {
      this.text.setText(`0:${rounded}`);
    } else {
      this.text.setText(`0:0${rounded}`);
    }

    this.bringToTop(this.text);

    if (rounded === 0) {
      this.icon.loadTexture('battery-red');
      this.text.addColor('red', 0);
    } else {
      this.alpha = 1;
      this.icon.loadTexture('battery-white');
      this.text.addColor('white', 0);
    }
  }

  public blink(isLow: boolean) {
    if (this.seconds === 0) {
      this.alpha = 1;
    } else {
      this.alpha = Number(isLow);
    }
  }
}

class WeaponsPanel extends Panel {
  public game: Game;
  private colorChart: ColorChart;
  private battery: Battery;
  private colors: Color[] = [];

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'WEAPONS');

    this.colorChart = new ColorChart(game, this.centerX, this.centerY);
    this.add(this.colorChart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    // mask.scale.setTo(1.5, 1.5)
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'weapons');
    this.add(icon);

    this.battery = new Battery(game);
    this.add(this.battery);
    this.battery.x = 80;
    this.battery.y = 137;
    this.battery.seconds = 10;
  }

  public blink(isLow: boolean) {
    this.battery.blink(isLow);
  }

  public update() {
    // Set battery seconds
    this.battery.seconds = this.game.player.batteries.weapons;

    const newColors = this.game.player.weaponColors;
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors;
      this.colorChart.setColors(this.colors);
    }
    super.update();
  }
}

class ShieldsPanel extends Panel {
  public game: Game;
  private colorChart: ColorChart;
  private battery: Battery;
  private colors: Color[] = [];

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'SHIELDS');

    this.colorChart = new ColorChart(game, this.centerX, this.centerY);
    this.add(this.colorChart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'shields');
    this.add(icon);

    this.battery = new Battery(game);
    this.add(this.battery);
    this.battery.x = 80;
    this.battery.y = 137;
  }

  public update() {
    // Set battery seconds
    this.battery.seconds = this.game.player.batteries.shields;

    const newColors = this.game.player.shieldColors;
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors;
      this.colorChart.setColors(this.colors);
    }
    super.update();
  }

  public blink(isLow: boolean) {
    this.battery.blink(isLow);
  }
}

class PropulsionPanel extends Panel {
  public game: Game;
  private chart: PropulsionChart;
  private battery: Battery;
  private propulsionLevel = 0;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'THRUSTERS');

    this.chart = new PropulsionChart(game, this.centerX, this.centerY);
    this.add(this.chart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    // mask.scale.setTo(1.5, 1.5)
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'propulsion');
    this.add(icon);

    this.battery = new Battery(game);
    this.add(this.battery);
    this.battery.x = 80;
    this.battery.y = 137;
  }

  public blink(isLow: boolean) {
    this.battery.blink(isLow);
  }

  public update() {
    // Set battery seconds
    this.battery.seconds = this.game.player.batteries.propulsion;

    if (this.propulsionLevel !== this.game.player.propulsionLevel) {
      this.propulsionLevel = this.game.player.propulsionLevel;
      this.chart.setLevel(this.propulsionLevel);
    }
    super.update();
  }
}

class RepairsPanel extends Panel {
  public game: Game;
  private chart: PropulsionChart;
  private battery: Battery;
  private repairLevel = 0;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'REPAIRS');

    this.chart = new RepairsChart(game, this.centerX, this.centerY);
    this.add(this.chart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    // mask.scale.setTo(1.5, 1.5)
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'repairs');
    this.add(icon);

    this.battery = new Battery(game);
    this.add(this.battery);
    this.battery.x = 80;
    this.battery.y = 137;
  }

  public blink(isLow: boolean) {
    this.battery.blink(isLow);
  }

  public update() {
    // Set battery seconds
    this.battery.seconds = this.game.player.batteries.repairs;

    if (this.repairLevel !== this.game.player.repairLevel) {
      this.repairLevel = this.game.player.repairLevel;
      this.chart.setLevel(this.repairLevel);
    }
    super.update();
  }
}

class CaptainEntry extends Phaser.Group {
  public game: Game;
  private healthBar: HealthBar;
  private captain: Captain;
  private charge = 0;

  constructor(game: Game, captain: Captain) {
    super(game, undefined, 'CaptainEntry');

    this.captain = captain;

    const nameTextSize = 30;
    const circle = this.game.add.graphics();
    const circleSize = 33;
    circle.lineStyle(2, 0xffffff);
    circle.drawCircle(circleSize / 2, 25, circleSize);
    this.add(circle);
    const nameText = this.game.add.text(
      0,
      0,
      `CAPT. ${captain.name}`,
      {
        ...baseStyle,
        fontSize: nameTextSize,
        boundsAlignH: 'left',
        fontWeight: 600,
      },
      this,
    );
    nameText.setTextBounds(circle.width + 11, 0, 200, 50);

    let nudge = -9;
    if (captain.number === 1) {
      nudge += 3;
    } else if (captain.number === 3) {
      nudge += 2;
    } else if (captain.number === 5) {
      nudge += 1;
    }
    const numberText = this.game.add.text(
      0,
      0,
      `${captain.number}`,
      { ...baseStyle, fontSize: 25, boundsAlignH: 'left', fontWeight: 600 },
      this,
    );
    numberText.setTextBounds(circle.width / 2 + nudge, 2, 200, 50);

    this.healthBar = new HealthBar(
      this.game,
      this,
      315,
      30,
      0,
      '',
      this.captain.charge,
    );
    this.healthBar.y = 6;
    this.healthBar.x = 210;
    this.update();
  }

  public update() {
    const beta = this.game.captains.find(
      captain => captain.number === this.captain.number,
    );
    if (beta === undefined) {
      throw new Error('captain not found');
    }
    if (this.charge !== beta.charge) {
      this.charge = beta.charge;

      this.healthBar.value = this.captain.charge;
      const fullyCharged = this.captain.charge === 1;
      this.healthBar.color = fullyCharged ? 0x7ac943 : 0xfcee21;
      this.healthBar.label = fullyCharged ? 'FULLY CHARGED' : 'RECHARGING';
    }
  }
}

class CaptainsLog extends Phaser.Group {
  public game: Game;
  private entries: CaptainEntry[];
  private numCaptains: any;
  private title: Phaser.Text;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, 'CaptainsLog');
    const box = game.add.graphics();
    box.lineStyle(2, 0xffffff, 1);
    box.beginFill(0, 1);
    box.drawRoundedRect(0, 0, width, height, 20);
    this.add(box);

    const titleTextMargin = 10;

    this.title = game.add.text(0, 0, '', baseStyle, this);
    this.title.setTextBounds(0, titleTextMargin, width, 50);

    const line = game.add.graphics();
    line.lineStyle(2, 0xffffff, 1);
    line.drawRect(
      titleTextMargin * 2,
      this.title.bottom + titleTextMargin,
      width - titleTextMargin * 4,
      1,
    );
    this.add(line);

    this.entries = [];
    this.addCaptains();
    this.numCaptains = this.game.captains.length;
  }
  public update() {
    if (this.game.captains.length !== this.numCaptains) {
      this.numCaptains = this.game.captains.length;
      if (this.numCaptains > 6) {
        alert('ERROR: too many captains!');
      }
      this.entries.forEach(entry => {
        if (entry.name === 'CaptainEntry') {
          this.removeChild(entry);
        }
      });
      this.entries = [];
      this.addCaptains();
    }
    super.update();
  }

  private addCaptains() {
    const captains = this.game.captains;
    this.title.setText(`${captains.length} CAPTAINS ONBOARD`);
    captains.forEach((captain, i) => {
      const entry = new CaptainEntry(this.game, captain);
      entry.x = 22;
      entry.y = 80 + 43 * i;
      this.add(entry);
      this.entries.push(entry);
    });
  }
}

export default class HUD extends Phaser.Group {
  public game: Game;
  private healthBar: BigHealthBar;
  private panels: Panel[];
  private isBlinkLow = false;

  constructor(game: Game, x: number, y: number, width: number, height: number) {
    super(game, undefined, 'HUD');
    this.x = x;
    this.y = y;
    const innerPadding = 20;
    const sidePadding = 40;
    this.panels = [
      WeaponsPanel,
      ShieldsPanel,
      PropulsionPanel,
      RepairsPanel,
    ].map((Klass, i) => {
      const panel = new Klass(this.game, this, 300, 300);
      panel.x = sidePadding + (panel.width + innerPadding) * i;
      panel.y = innerPadding;
      return panel;
    });
    const lastPanel = this.panels[this.panels.length - 1];

    const captainsLog = new CaptainsLog(this.game, this, 565, 360);
    captainsLog.x = lastPanel.right + innerPadding;
    captainsLog.y = innerPadding;

    const blinkTimer = this.game.time.create();
    blinkTimer.loop(650, this.blink, this);
    blinkTimer.start();

    this.healthBar = new BigHealthBar(this.game, this, 1260);
    this.healthBar.y = 340;
    this.healthBar.x = innerPadding * 2;
    this.bringToTop(this.healthBar);
  }

  public update() {
    const playerHealth = this.game.player.health;
    if (this.healthBar.value !== playerHealth) {
      this.healthBar.value = playerHealth / this.game.player.maxHealth;
      const label =
        playerHealth > 25
          ? Math.ceil(playerHealth)
          : Math.round(playerHealth * 100) / 100;
      this.healthBar.label = `HEALTH ${label}%`;
    }
    super.update();
  }

  public blink() {
    this.panels.forEach(panel => {
      panel.blink(this.isBlinkLow);
    });
    this.isBlinkLow = !this.isBlinkLow;
  }
}
