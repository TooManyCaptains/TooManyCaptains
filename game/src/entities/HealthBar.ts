import { Game } from '..';
import { baseStyle } from '../interface/Styles';

export default class HealthBar extends Phaser.Group {
  public game: Game;
  public text: Phaser.Text;

  private bar: Phaser.Graphics;
  private barMask: Phaser.Graphics;
  private background: Phaser.Graphics;

  private _width: number;
  private _height: number;

  constructor(
    game: Game,
    width = 100,
    height = 20,
    color = 0x30ee02,
    label = '',
    value = 50,
  ) {
    super(game);
    this._width = width;
    this._height = height;

    this.background = game.add.graphics();
    this.background.beginFill(0x999999, 1);
    this.background.drawRoundedRect(0, 0, width, height, 25);

    this.bar = game.add.graphics();
    this.barMask = game.add.graphics();

    this.color = color;

    this.text = new Phaser.Text(game, 0, 0, label, {
      ...baseStyle,
      fontSize: 40,
      boundsAlignH: 'center',
      fontWeight: 800,
      fill: 'black',
    });
    this.text.setTextBounds(0, 0, width, height + 2);

    this.bar.mask = this.barMask;
    this.value = value;

    this.add(this.background);
    this.add(this.bar);
    this.add(this.barMask);
    this.add(this.text);
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
    this.bar.drawRoundedRect(0, 0, this._width, this._height, 0);
    this.barMask.clear();
    this.barMask.beginFill(color, 1);
    this.barMask.drawRect(0, 0, this._width, this._height);
  }

  set label(label: string) {
    this.text.setText(label);
  }

  set value(value: number) {
    // scale.x = 0 appears the same as scale.x = 1
    this.barMask.visible = value > 0;

    this.barMask.scale.x = value;
  }
}
