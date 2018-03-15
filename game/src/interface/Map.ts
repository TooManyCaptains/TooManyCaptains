import { Game } from '../index';

const MIN_X = 50;
const MAX_X = 1870;

export default class Map extends Phaser.Group {
  public game: Game;
<<<<<<< HEAD
  public miniMap: Phaser.Sprite;
  public iconPlayer: Phaser.Sprite;
  public iconBoss: Phaser.Sprite;
  
=======

  private miniMap: Phaser.Sprite;
  private iconPlayer: Phaser.Sprite;
  // private time: number;
  // private iconBoss: Phaser.Sprite;
>>>>>>> 53c892fd1568d5581e8103df7bc97ab996095552

  constructor(game: Game) {
    super(game);

    // Sprites
    this.miniMap = new Phaser.Sprite(this.game, 0, 0, 'map');
    this.iconPlayer = new Phaser.Sprite(this.game, MIN_X, 0, 'map-icon-player');
    this.iconPlayer.anchor.setTo(0.5, 0);
    this.iconPlayer.scale.setTo(0.75, 0.75);

<<<<<<< HEAD
    console.log('hi', this.game.time.time);

  }

  public update() {
      this.iconPlayer.x += 0.05;
  }
  
  
=======
    this.add(this.miniMap);
    this.add(this.iconPlayer);
>>>>>>> 53c892fd1568d5581e8103df7bc97ab996095552

    const tween = this.game.add.tween(this.iconPlayer);
    tween.to(
      { x: MAX_X },
      this.game.session.totalTimeToBoss,
      Phaser.Easing.Linear.None,
      true,
    );
  }
}
