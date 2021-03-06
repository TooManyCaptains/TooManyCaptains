import Panel from './Panel';
import { Game } from '../index';
import { Subsystem, CaptainCardID, Color } from '../../../common/types';
import { baseStyle, ColorPalette } from './Styles';
import manifest from '../../../common/manifest';
import { colorsToColorKey, colorPositionsToColors } from '../utils';
import HealthBar from '../entities/HealthBar';
import { LOW_HEALTH, VERY_LOW_HEALTH } from '../Session';

class ColorChart extends Phaser.Sprite {
  public game: Game;
  private _colors: Color[];

  constructor(game: Game, x: number, y: number, colors: Color[] = []) {
    super(game, x, y);
    this.anchor.setTo(0.5, 0.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.colors = colors;
  }

  get colors() {
    return this._colors;
  }

  set colors(colors: Color[]) {
    this._colors = colors;
    const colorKey = colorsToColorKey(colors);
    if (colors.length > 0) {
      this.body.angularVelocity = 75;
    } else {
      this.body.angularVelocity = 0;
    }
    this.loadTexture(`ring-${colorKey}`);
  }
}

class ThrustersChart extends Phaser.Sprite {
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
    this.loadTexture('ring-thrusters');
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
    this.loadTexture(`icon-big-${subsystem}`);
    this.anchor.setTo(0.5, 0.5);
  }
}

class SubsystemMask extends Phaser.Sprite {
  constructor(game: Game, x: number, y: number, subsystem: Subsystem) {
    super(game, x, y);
    this.loadTexture(`icon-mask-${subsystem}`);
    this.anchor.setTo(0.5, 0);
  }
}

class WeaponsPanel extends Panel {
  public game: Game;
  private colorChart: ColorChart;
  private icon: Phaser.Sprite;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'WEAPONS');

    this.colorChart = new ColorChart(game, this.centerX, this.centerY);
    this.add(this.colorChart);

    const mask = new SubsystemMask(game, this.centerX, 150, 'weapons');
    this.add(mask);

    this.icon = new SubsystemIcon(game, this.centerX, 150, 'weapons');
    this.add(this.icon);
    this.game.session.signals.subsystems.add(this.onSubsystemsChanged, this);
    this.onSubsystemsChanged();
  }

  private onSubsystemsChanged() {
    this.colorChart.colors = colorPositionsToColors(
      this.game.session.weaponColorPositions,
    );
    const isEnabled = this.game.session.weaponColorPositions.length > 0;
    this.icon.alpha = isEnabled ? 1 : 0.2;
  }
}

class ShieldsPanel extends Panel {
  public game: Game;
  private colorChart: ColorChart;
  private icon: Phaser.Sprite;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'SHIELDS');

    this.colorChart = new ColorChart(game, this.centerX, this.centerY);
    this.add(this.colorChart);

    const mask = new SubsystemMask(game, this.centerX, 150, 'shields');
    this.add(mask);

    this.icon = new SubsystemIcon(game, this.centerX, 150, 'shields');
    this.add(this.icon);

    this.game.session.signals.subsystems.add(this.onSubsystemsChanged, this);

    this.onSubsystemsChanged();
  }

  private onSubsystemsChanged() {
    this.colorChart.colors = this.game.session.shieldColors;
    const isEnabled = this.game.session.shieldColors.length > 0;
    this.icon.alpha = isEnabled ? 1 : 0.2;
  }
}

class ThrustersPanel extends Panel {
  public game: Game;
  private chart: ThrustersChart;
  private icon: Phaser.Sprite;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'THRUSTERS');

    this.chart = new ThrustersChart(game, this.centerX, this.centerY);
    this.add(this.chart);
    const mask = new SubsystemMask(game, this.centerX, 150, 'thrusters');
    this.add(mask);
    this.icon = new SubsystemIcon(game, this.centerX, 150, 'thrusters');
    this.add(this.icon);
    this.game.session.signals.subsystems.add(this.onSubsystemsChanged, this);

    this.onSubsystemsChanged();
  }

  private onSubsystemsChanged() {
    this.chart.setLevel(this.game.session.thrusterLevel);
    const isEnabled = this.game.session.thrusterLevel > 0;
    this.icon.alpha = isEnabled ? 1 : 0.2;
  }
}

class RepairsPanel extends Panel {
  public game: Game;
  private chart: RepairsChart;
  private icon: Phaser.Sprite;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'REPAIRS');

    this.chart = new RepairsChart(game, this.centerX, this.centerY);
    this.add(this.chart);
    const mask = new SubsystemMask(game, this.centerX, 150, 'repairs');
    this.add(mask);
    this.icon = new SubsystemIcon(game, this.centerX, 150, 'repairs');
    this.add(this.icon);
    this.game.session.signals.subsystems.add(this.onSubsystemsChanged, this);

    this.onSubsystemsChanged();
  }

  private onSubsystemsChanged() {
    this.chart.setLevel(this.game.session.repairLevel);
    const isEnabled = this.game.session.repairLevel > 0;
    this.icon.alpha = isEnabled ? 1 : 0.2;
  }
}

class CaptainEntry extends Phaser.Group {
  public game: Game;

  constructor(game: Game, cardID: CaptainCardID, index: number) {
    super(game, undefined, 'CaptainEntry');

    const fullName = manifest
      .find(m => m.cardID === cardID)!
      .name.split(' ')
      .join('\n');
    const spriteKey = `captain-icon-${fullName.split('\n')[0].toLowerCase()}`;
    const image = this.game.add.sprite(0, 0, spriteKey);
    const label = this.game.add.text(image.width + 15, 2.5, fullName, {
      ...baseStyle,
      fontWeight: 600,
      fontSize: 28,
      boundsAlignH: 'left',
    });
    label.lineSpacing = -5;
    this.add(label);
    this.add(image);
  }
}

class CaptainsLog extends Phaser.Group {
  public game: Game;
  private entries: CaptainEntry[];
  private title: Phaser.Text;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, 'CaptainsLog');
    const box = game.add.graphics();
    box.lineStyle(2, ColorPalette.White, 1);
    box.beginFill(0, 1);
    box.drawRoundedRect(0, 0, width, height, 20);
    this.add(box);

    const titleTextMargin = 10;

    this.title = game.add.text(
      0,
      0,
      '',
      { ...baseStyle, fontSize: 40, fontWeight: 700 },
      this,
    );
    this.title.setTextBounds(0, titleTextMargin, width, 50);

    const line = game.add.graphics();
    line.lineStyle(2, ColorPalette.White, 1);
    line.drawRect(
      titleTextMargin * 2,
      this.title.bottom + titleTextMargin,
      width - titleTextMargin * 4,
      1,
    );
    this.add(line);

    this.entries = [];
    this.addCaptains();
  }

  private addCaptains() {
    const captains = this.game.session.captainsInRound;
    this.title.setText(`${captains.size} CAPTAINS ONBOARD`);
    Array.from(captains).forEach((cardID, i) => {
      const entry = new CaptainEntry(this.game, cardID as CaptainCardID, i);
      const rightSide = i % 2 === 1;
      entry.x = rightSide ? 310 : 40;
      entry.y = 95 + 90 * Math.floor(i / 2);
      this.add(entry);
      this.entries.push(entry);
    });
  }
}

export default class HUD extends Phaser.Group {
  public game: Game;
  private healthBar: HealthBar;
  private panels: Panel[];

  constructor(game: Game, x: number, y: number) {
    super(game, undefined, 'HUD');
    this.x = x;
    this.y = y;
    const innerPadding = 20;
    const sidePadding = 40;
    this.panels = [
      WeaponsPanel,
      ThrustersPanel,
      RepairsPanel,
      ShieldsPanel,
    ].map((klass, i) => {
      const panel = new klass(this.game, this, 300, 300);
      panel.x = sidePadding + (panel.width + innerPadding) * i;
      panel.y = innerPadding;
      return panel;
    });
    const lastPanel = this.panels[this.panels.length - 1];

    const captainsLog = new CaptainsLog(this.game, this, 565, 375);
    captainsLog.x = lastPanel.right + innerPadding;
    captainsLog.y = innerPadding;

    this.healthBar = new HealthBar(
      this.game,
      1260,
      45,
      ColorPalette.Green,
      'HEALTH 100%',
      200,
      true,
    );
    this.healthBar.y = 340;
    this.healthBar.x = innerPadding * 2;
    this.add(this.healthBar);
    this.bringToTop(this.healthBar);

    this.game.session.signals.health.add(this.onHealthChanged, this);
  }

  private onHealthChanged() {
    const health = Math.max(0, this.game.session.health);
    this.healthBar.value = health / this.game.session.maxHealth;
    const label =
      health > 25 ? Math.ceil(health).toFixed(0) : health.toFixed(1);
    this.healthBar.label = `HEALTH ${label}%`;
    if (health <= VERY_LOW_HEALTH) {
      this.healthBar.color = ColorPalette.Red;
    } else if (health <= LOW_HEALTH) {
      this.healthBar.color = ColorPalette.Orange;
    } else {
      this.healthBar.color = ColorPalette.Green;
    }
  }
}
