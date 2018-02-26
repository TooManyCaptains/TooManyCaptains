import * as _ from 'lodash';
import { Panel, ColorPosition, LightColor } from './types';
import * as rpio from 'rpio';
import { GameState } from '../../common/types';

class WeaponsPanel extends Panel {
  public readonly name = 'weapons';
  public readonly pins = [40, 38, 36];
  public readonly lightIndicies = _.range(7);
  public readonly buttonLightPins = [];

  public update(colorPositions: ColorPosition[], gameState: GameState): void {
    const isButtonLit = true;
    _.forEach(this.buttonLightPins, pin => {
      rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
    });
    // Set LED lights for later batch-update
    this.lights = [];
    colorPositions
      .filter(({ position }) => position !== null)
      .map(({ color, position }) => {
        this.lights.push({
          index: this.lightIndicies[position!],
          color: LightColor[color],
        });
        this.lights.push({
          index: this.lightIndicies[position! + 1],
          color: LightColor[color],
        });
      });
    // this.lights = colorPositions
    //   .filter(({ position }) => position !== null)
    //   .map(({ color, position }) => ({
    //     index: this.lightIndicies[position!],
    //     color: LightColor[color],
    //   }));
  }
}

class ThrustersPanel extends Panel {
  public readonly name = 'thrusters';
  public readonly pins = [16, 18];
  public readonly lightIndicies = _.range(11, 15);
  public readonly buttonLightPins = [];

  public update(colorPositions: ColorPosition[], gameState: GameState) {
    const isButtonLit = colorPositions.length > 0 && gameState === 'in_game';
    _.forEach(this.buttonLightPins, pin => {
      rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
    });

    this.lights = _.times(colorPositions.length, i => ({
      index: this.lightIndicies[i],
      color: LightColor.purple,
    }));
  }
}

class ShieldsPanel extends Panel {
  public readonly name = 'shields';
  public readonly pins = [22, 26, 24];
  public readonly lightIndicies = _.range(19, 26);

  public update(colorPositions: ColorPosition[]): void {
    this.lights = colorPositions
      .filter(({ position }) => position !== null)
      .map(({ color, position }) => ({
        index: this.lightIndicies[position!],
        color: LightColor[color],
      }));
  }
}

class RepairsPanel extends Panel {
  public readonly name = 'repairs';
  public readonly pins = [10, 12, 8];
  public readonly lightIndicies = _.range(30, 37);

  public update(colorPositions: ColorPosition[]): void {
    this.lights = _.times(colorPositions.length, i => ({
      index: this.lightIndicies[i],
      color: LightColor.green,
    }));
  }
}

const panels: Panel[] = [
  new WeaponsPanel(),
  new ThrustersPanel(),
  new ShieldsPanel(),
  new RepairsPanel(),
];

export { panels };
