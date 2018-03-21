import { Game } from '..';
import { baseStyle } from './Styles';

export default class Marquee extends Phaser.Group {
  private text: Phaser.Text;
  constructor(public game: Game, x: number, y: number, iconKey?: string) {
    super(game);
    this.x = x;
    this.y = y;

    // Background
    const background = this.game.add.image(0, 0, 'marquee', null, this);
    background.anchor.setTo(0.5, 0);
    // Text
    this.text = this.game.add.text(
      iconKey ? 25 : 0,
      27.5,
      '',
      { ...baseStyle, fill: '#43e745', fontWeight: 600 },
      this,
    );
    this.text.anchor.setTo(0.5, 0);

    // Icon (optional)
    if (iconKey) {
      const icon = this.game.add.image(-210, 27.5, iconKey, null, this);
      // icon.anchor.setTo(0.5, 0.5);
      icon.scale.setTo(0.5, 0.5);
    }
  }

  set message(message: string) {
    this.text.text = message;
  }

  get message() {
    return this.text.text;
  }
}
