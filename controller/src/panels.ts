import * as rpio from 'rpio';
import { range } from 'lodash';
import { Panel, LightColor } from './types';
import { GameState } from '../../common/types';

enum ButtonLightState {
  Off,
  On,
  Blinking,
}

class WeaponsPanel extends Panel {
  public readonly subsystem = 'weapons';
  public readonly pins = [40, 36, 38]; // Physically wired in this order. Oops.
  public readonly lightIndicies = range(6);
  public readonly buttonLightPin = 32;

  private buttonLightState: ButtonLightState = ButtonLightState.Off;
  private blinkTimer: NodeJS.Timer | null = null;
  private isBlinkHigh: boolean = true;
  private readonly blinkRate = 750; // milliseconds

  public update(gameState: GameState): void {
    if (gameState === 'in_game') {
      // In game, light button if wires are plugged into the panel
      if (this.connections.length > 0) {
        this.buttonLightState = ButtonLightState.On;
      } else {
        this.buttonLightState = ButtonLightState.Off;
      }
    } else if (gameState === 'wait_for_start') {
      // Otherwise, blink the button light
      this.buttonLightState = ButtonLightState.Blinking;
    } else {
      this.buttonLightState = ButtonLightState.Off;
    }

    this.updateLightState();

    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    this.connections.forEach(({ color, position }) => {
      range(pixelsPerPosition).forEach(i => {
        this.lights.push({
          index: this.lightIndicies[i + position! * pixelsPerPosition],
          color: LightColor[color],
        });
      });
    });
  }

  private updateLightState() {
    if (this.buttonLightState === ButtonLightState.Blinking) {
      if (!this.blinkTimer) {
        this.blinkTimer = setInterval(
          this.onBlinkTimer.bind(this),
          this.blinkRate,
        );
      }
    } else {
      clearInterval(this.blinkTimer!);
      this.blinkTimer = null;
      rpio.write(
        this.buttonLightPin,
        this.buttonLightState === ButtonLightState.On ? rpio.HIGH : rpio.LOW,
      );
    }
  }

  private onBlinkTimer() {
    rpio.write(this.buttonLightPin, this.isBlinkHigh ? rpio.HIGH : rpio.LOW);
    this.isBlinkHigh = !this.isBlinkHigh;
  }
}

class ThrustersPanel extends Panel {
  public readonly subsystem = 'thrusters';
  public readonly pins = [18, 16];
  public readonly lightIndicies = range(9, 15);
  public readonly buttonLightPin = 28;

  public update(gameState: GameState) {
    const isButtonLit = this.connections.length > 0 && gameState === 'in_game';
    rpio.write(this.buttonLightPin, isButtonLit ? rpio.HIGH : rpio.LOW);

    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    this.connections.forEach(({ color, position }) => {
      range(pixelsPerPosition).forEach(i => {
        this.lights.push({
          index: this.lightIndicies[i + position! * pixelsPerPosition],
          color: LightColor.purple,
        });
      });
    });
  }
}

class RepairsPanel extends Panel {
  public readonly subsystem = 'repairs';
  public readonly pins = [26, 24, 22];
  public readonly lightIndicies = range(16, 22);

  public update(): void {
    // this.lights = _.times(colorPositions.length, i => ({
    //   index: this.lightIndicies[i],
    //   color: LightColor.green,
    // }));
    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    this.connections.forEach(({ color, position }) => {
      range(pixelsPerPosition).forEach(i => {
        this.lights.push({
          index: this.lightIndicies[i + position! * pixelsPerPosition],
          color: LightColor.green,
        });
      });
    });
  }
}

class ShieldsPanel extends Panel {
  public readonly subsystem = 'shields';
  public readonly pins = [15, 13, 11];
  public readonly lightIndicies = range(24, 34);

  public update(): void {
    // Set LED lights for later batch-update
    this.lights = [];
    const pixelsPerPosition = Math.floor(
      this.lightIndicies.length / this.pins.length,
    );
    this.connections.forEach(({ color, position }) => {
      range(pixelsPerPosition).forEach(i => {
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
