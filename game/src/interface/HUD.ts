import Panel from './Panel';
import { Game } from '../index';
import { Subsystem, CaptainCardID, Color } from '../../../common/types';
import { baseStyle } from './Styles';
import manifest from '../../../common/manifest';
import { colorsToColorKey, colorPositionsToColors } from '../utils';
import HealthBar from '../entities/HealthBar';

class BigHealthBar extends HealthBar {
  public game: Game;

  constructor(game: Game, parent: Phaser.Group, width: number) {
    super(game, parent, width, 50, 0x30ee02, 'HEALTH 100%', 1);
    this.text.fontSize = 40;
    this.text.fontWeight = 800;
  }
}

class ColorChart extends Phaser.Sprite {
  public game: Game;
  private _colors: Color[];

  constructor(
    game: Game,
    x: number,
    y: number,
    colors: Color[] = [],
  ) {
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
    this.anchor.setTo(0.5, 1);
    this.loadTexture(`icon-${subsystem}`);
  }
}

class WeaponsPanel extends Panel {
  public game: Game;
  private colorChart: ColorChart;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'WEAPONS');

    this.colorChart = new ColorChart(game, this.centerX, this.centerY);
    this.add(this.colorChart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'weapons');
    this.add(icon);

    this.game.session.onSubsystemsChanged.add(() => {
      this.colorChart.colors = colorPositionsToColors(this.game.session.weaponColorPositions);
    });
  }
}

class ShieldsPanel extends Panel {
  public game: Game;
  private colorChart: ColorChart;

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

    this.game.session.onSubsystemsChanged.add(() => {
      this.colorChart.colors = this.game.session.shieldColors;
    });
  }
}

class ThrustersPanel extends Panel {
  public game: Game;
  public chart: ThrustersChart;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'THRUSTERS');

    this.chart = new ThrustersChart(game, this.centerX, this.centerY);
    this.add(this.chart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'thrusters');
    this.add(icon);

    this.game.session.onSubsystemsChanged.add(() => {
      this.chart.setLevel(this.game.session.thrusterLevel);
    });
  }
}

class RepairsPanel extends Panel {
  public game: Game;
  private chart: ThrustersChart;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, width, height, 'REPAIRS');

    this.chart = new RepairsChart(game, this.centerX, this.centerY);
    this.add(this.chart);
    const oldBottom = this.bottom;
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask');
    mask.anchor.setTo(0.5, 0.75);
    this.add(mask);

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'repairs');
    this.add(icon);

    this.game.session.onSubsystemsChanged.add(() => {
      this.chart.setLevel(this.game.session.repairLevel);
    });
  }
}

class CaptainEntry extends Phaser.Group {
  public game: Game;

  constructor(game: Game, cardID: CaptainCardID, index: number) {
    super(game, undefined, 'CaptainEntry');

    const nameTextSize = 30;
    this.game.add.text(
      0,
      0,
      `Captain ${manifest.find(m => m.cardID === cardID)!.name}`,
      {
        ...baseStyle,
        fontSize: nameTextSize,
        boundsAlignH: 'left',
      },
      this,
    );
  }
}

class CaptainsLog extends Phaser.Group {
  public game: Game;
  private entries: CaptainEntry[];
  private title: Phaser.Text;

  constructor(game: Game, parent: Phaser.Group, width: number, height: number) {
    super(game, parent, 'CaptainsLog');
    const box = game.add.graphics();
    box.lineStyle(2, 0xffffff, 1);
    box.beginFill(0, 1);
    box.drawRoundedRect(0, 0, width, height, 20);
    this.add(box);

    const titleTextMargin = 10;

    this.title = game.add.text(0, 0, '', { ...baseStyle, fontSize: 40 }, this);
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
  }

  private addCaptains() {
    const captains = this.game.session.captains;
    this.title.setText(`${captains.length} CAPTAINS ONBOARD`);
    captains.forEach((captain, i) => {
      const entry = new CaptainEntry(this.game, captain, i);
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

    const captainsLog = new CaptainsLog(this.game, this, 565, 360);
    captainsLog.x = lastPanel.right + innerPadding;
    captainsLog.y = innerPadding;

    this.healthBar = new BigHealthBar(this.game, this, 1260);
    this.healthBar.y = 340;
    this.healthBar.x = innerPadding * 2;
    this.bringToTop(this.healthBar);

    this.game.session.onHealthChanged.add(this.onHealthChanged, this);
  }

  private onHealthChanged() {
    const health = this.game.session.health;
    if (this.healthBar.value !== health) {
      this.healthBar.value = health / this.game.session.maxHealth;
      const label =
        health > 25 ? Math.ceil(health).toFixed(0) : health.toFixed(1);
      this.healthBar.label = `HEALTH ${label}%`;
    }
  }
}
