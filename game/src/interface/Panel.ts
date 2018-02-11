import { Game } from '../index';
import { baseStyle } from './Styles';

export default class Panel extends Phaser.Group {
  constructor(
    game: Game,
    parent: any,
    width: number,
    height: number,
    nameText = '',
  ) {
    super(game, parent, `panel-${nameText}`);
    const frame = game.add.graphics(0, 0, this);
    frame.lineStyle(2, 0xffffff);
    frame.beginFill(0, 1);
    frame.drawCircle(width / 2, height / 2, width);

    const text = game.add.text(
      0,
      0,
      nameText,
      { ...baseStyle, fontSize: 27, fontWeight: 900 },
      this,
    );
    text.setTextBounds(0, 85, width, 40);
  }

  public blink(isLow: boolean) {
    console.log('blink');
  }
}
