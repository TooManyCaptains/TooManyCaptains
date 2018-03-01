import * as _ from 'lodash';
import { Panel, ColorPosition, LightColor } from './types';
import * as rpio from 'rpio';
import { GameState } from '../../common/types';

class WeaponsPanel extends Panel {
  public readonly name = 'weapons';
  public readonly pins = [40, 38, 36];
  public readonly lightIndicies = _.range(6);
  public readonly buttonLightPins = [];

  public update(colorPositions: ColorPosition[], gameState: GameState): void {
    const isButtonLit = true;
    _.forEach(this.buttonLightPins, pin => {
      rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
    });

    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    colorPositions
      .filter(({ position }) => position !== null)
      .forEach(({ color, position }) => {
        _.range(pixelsPerPosition).forEach(i => {
          this.lights.push({
            index: this.lightIndicies[i + position! * pixelsPerPosition],
            color: LightColor[color],
          });
        });
      });
  }
}

class ThrustersPanel extends Panel {
  public readonly name = 'thrusters';
  public readonly pins = [18, 16];
  public readonly lightIndicies = _.range(9, 13);
  public readonly buttonLightPins = [];

  public update(colorPositions: ColorPosition[], gameState: GameState) {
    const isButtonLit = colorPositions.length > 0 && gameState === 'in_game';
    _.forEach(this.buttonLightPins, pin => {
      rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
    });

    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    colorPositions
      .filter(({ position }) => position !== null)
      .forEach(({ color, position }) => {
        _.range(pixelsPerPosition).forEach(i => {
          this.lights.push({
            index: this.lightIndicies[i + position! * pixelsPerPosition],
            color: LightColor.purple,
          });
        });
      });
  }
}

class RepairsPanel extends Panel {
  public readonly name = 'repairs';
  public readonly pins = [26, 24, 22];
  public readonly lightIndicies = _.range(16, 22);

  public update(colorPositions: ColorPosition[]): void {
    // this.lights = _.times(colorPositions.length, i => ({
    //   index: this.lightIndicies[i],
    //   color: LightColor.green,
    // }));
    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    colorPositions
      .filter(({ position }) => position !== null)
      .forEach(({ color, position }) => {
        _.range(pixelsPerPosition).forEach(i => {
          this.lights.push({
            index: this.lightIndicies[i + position! * pixelsPerPosition],
            color: LightColor.green,
          });
        });
      });
  }
}

class ShieldsPanel extends Panel {
  public readonly name = 'shields';
  public readonly pins = [8, 12, 10];
  public readonly lightIndicies = _.range(25, 32);

  public update(colorPositions: ColorPosition[]): void {
    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    colorPositions
      .filter(({ position }) => position !== null)
      .forEach(({ color, position }) => {
        _.range(pixelsPerPosition).forEach(i => {
          this.lights.push({
            index: this.lightIndicies[i + position! * pixelsPerPosition],
            color: LightColor[color],
          });
        });
      });
  }
}

const panels: Panel[] = [
  new WeaponsPanel(),
  new ThrustersPanel(),
  new RepairsPanel(),
  new ShieldsPanel(),
];

export { panels };
