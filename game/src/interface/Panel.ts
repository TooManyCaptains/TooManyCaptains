import { Game } from '../index';
import { baseStyle } from './Styles';

import { range } from 'lodash';

class Battery extends Phaser.Group {
  // private maxSeconds = 15;
  private preSecond = 0;
  private icon: Phaser.Sprite;
  private text: Phaser.Text;
  // private bar: Phaser.Graphics;

  constructor(game: Game) {
    super(game);

    this.icon = this.game.add.sprite(0, 0, 'lock');
    this.icon.animations.add('unlocking', range(19), 30, false);
    this.icon.animations.add('locking', range(20, 39), 30, false);
    // this.icon.frame = 0;
    // this.icon.animations.play('locking');

    this.add(this.icon);

    this.text = this.game.add.text(
      0,
      0,
      '',
      {
        ...baseStyle,
        boundsAlignH: 'left',
        fontSize: 52,
      },
      this,
    );
    this.text.setTextBounds(16, 45, this.icon.width - 15, this.icon.height);

    // this.maxSeconds = 15;
    this.seconds = 0;
  }

  set seconds(seconds: number) {
    // Giada Removed the Bar
    //
    // const fraction = Math.min(seconds / this.maxSeconds, 1);
    // if (this.bar) {
    //   this.remove(this.bar);
    // }
    // this.bar = this.game.add.graphics();
    // this.bar.beginFill(0x999999, 1);
    // const margin = 7;
    // this.bar.drawRect(
    //   margin,
    //   margin,
    //   141 * this.icon.scale.y * fraction,
    //   this.icon.height - 2 * margin,
    // );
    // this.add(this.bar);

    const rounded = Math.ceil(seconds);
    if (rounded === Infinity) {
      this.text.setText('   ∞');
    } else if (rounded >= 10) {
      this.text.setText(`0:${rounded}`);
    } else {
      this.text.setText(`0:0${rounded}`);
    }

    this.bringToTop(this.text);
    this.text.addColor('black', 0);

    if (rounded === 0 && this.preSecond > 0) {
      this.icon.animations.play('locking');
    } else if (rounded > 0 && this.preSecond === 0) {
      this.icon.animations.play('unlocking');
    }

    this.preSecond = rounded;
  }

  // public blink(isLow: boolean) {
  //   if (this.seconds === 0) {
  //     this.alpha = 1;
  //   } else {
  //     this.alpha = Number(isLow);
  //   }
  // }
}

export default class Panel extends Phaser.Group {
  public battery: Battery;
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

    this.battery = new Battery(game);
    this.add(this.battery);
    this.battery.x = 77.5;
    this.battery.y = 56.75;
    this.battery.seconds = 10;

    const text = game.add.text(
      0,
      0,
      nameText,
      { ...baseStyle, fontSize: 22.5, fontWeight: 800 },
      this,
    );
    text.setTextBounds(0, 125, width, 40);
    text.addColor('black', 0);
  }

  public blink(isLow: boolean) {
    // console.log('blink');
  }
}
