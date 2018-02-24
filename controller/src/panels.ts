import * as _ from 'lodash';
import { Panel, ColorPosition, LightColor } from './types';
import * as rpio from 'rpio';
import { GameState } from '../../common/types';

class WeaponsPanel extends Panel {
  public readonly name = 'weapons';
  public readonly pins = [36, 38, 40];
  public readonly lightIndicies = _.range(6);
  public readonly buttonLightPins = [];

  public update(colorPositions: ColorPosition[], gameState: GameState): void {
    const isButtonLit = true;
    _.forEach(this.buttonLightPins, pin => {
      rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
    });
    // Set LED lights for later batch-update
    this.lights = colorPositions
      .filter(({ position }) => position !== null)
      .map(({ color, position }) => ({
        index: this.lightIndicies[position!],
        color: LightColor[color],
      }));
  }
}

class ThrustersPanel extends Panel {
  public readonly name = 'thrusters';
  public readonly pins = [16, 18];
  public readonly lightIndicies = _.range(10, 14);
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
  public readonly pins = [21, 23, 19]; //
  public readonly lightIndicies = _.range(16, 22); // LEDs were installed backwards

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
  public readonly pins = [36, 38, 40];
  public readonly lightIndicies = _.range(24, 30); // LEDs were installed backwards

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
