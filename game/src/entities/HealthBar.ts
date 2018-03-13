import { Game } from '..';
import { baseStyle } from '../interface/Styles';

export default class HealthBar {
  public game: Game;
  public text: Phaser.Text;
  private width: number;
  private height: number;
  private bar: Phaser.Graphics;
  private barMask: Phaser.Graphics;
  private background: Phaser.Graphics;

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

    this.background = game.add.graphics();
    this.background.beginFill(0x999999, 1);
    this.background.drawRoundedRect(0, 0, this.width, this.height, 25);

    this.bar = game.add.graphics();
    this.bar.beginFill(color, 1);

    this.barMask = game.add.graphics();

    this.color = color;

    parent.add(this.background);
    parent.add(this.bar);
    parent.add(this.barMask);

    this.text = game.add.text(0, 0, label, {
      ...baseStyle,
      fontSize: 28,
      boundsAlignH: 'center',
      fontWeight: 600,
      fill: 'black',
    });
    this.text.setTextBounds(0, 0, this.width, this.height + 2);
    parent.add(this.text);

    this.bar.mask = this.barMask;
    this.value = value;
  }

  set x(x: number) {
    this.barMask.x = x;
    this.bar.x = x;
    this.text.x = x;
    this.background.x = x;
  }

  set y(y: number) {
    this.barMask.y = y;
    this.bar.y = y;
    this.text.y = y;
    this.background.y = y;
  }

  set color(color: number) {
    this.bar.clear();
    this.bar.beginFill(color, 1);
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 25);
    this.barMask.clear();
    this.barMask.beginFill(color, 1);
    this.barMask.drawRect(0, 0, this.width, this.height);
  }

  set label(label: string) {
    this.text.setText(label);
  }

  set value(value: number) {
    this.barMask.scale.x = value;
  }
}
