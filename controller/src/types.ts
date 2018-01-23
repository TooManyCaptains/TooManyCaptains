import {
  GameState,
  Color,
  Subsystem,
  ButtonState,
} from '../../common/types';

export type WireColor = Color;

export type WirePin = 3 | 5 | 7;

export type Wire = { [C in WireColor]: WirePin };

export type Pin = number;

export enum LightColor {
  red = 0xff0000,
  green = 0x00ff00,
  blue = 0x0000ff,
  yellow = 0xff9a00,
  orange = 0xffa500,
  purple = 0x800080,
}

export type LightIndex = number;

export interface Light {
  index: LightIndex;
  color: LightColor;
}

export abstract class Panel {
  public readonly name: Subsystem;
  public readonly pins: Pin[] = [];
  public lights: Light[] = [];
  public readonly lightIndicies: LightIndex[] = [];
  public readonly buttonLightPins: Pin[] = [];
  public abstract update(
    colorPositions: ColorPosition[],
    gameState: GameState,
  ): void;
}

export interface ColorPosition {
  position: number | null;
  color: WireColor;
}

export interface Connection extends ColorPosition {
  panel: Panel | null;
}

export interface Button {
  name: 'up' | 'down' | 'fire';
  pin: Pin;
}

export interface Press {
  button: Button;
  state: ButtonState;
}

// export abstract class PolledController<T, E> {
//   public readonly pollRateMsec: number
//   public readonly onEvent: (event: Event) => void
//   protected abstract poll(): void
//   protected abstract setup(): void
//
//   constructor(objects: T[], )
// }
