import {
  GameState,
  Color,
  ColorPosition,
  Subsystem,
  ButtonState,
} from '../../common/types';

export type Pin = number;

export interface Wire {
  color: Color;
  pin: Pin;
}

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
  public readonly subsystem: Subsystem;
  public lights: Light[] = [];
  public connections: Connection[] = [];
  public readonly pins: Pin[] = [];
  public readonly lightIndicies: LightIndex[] = [];
  public readonly buttonLightPin: Pin;

  // Update button, lights, wiring configuration (for serialization)
  public abstract update(gameState: GameState): void;
}

export interface Connection extends ColorPosition {
  panel: Panel;
}

export interface Button {
  name: 'up' | 'down' | 'fire';
  pin: Pin;
}

export interface Press {
  button: Button;
  state: ButtonState;
}
