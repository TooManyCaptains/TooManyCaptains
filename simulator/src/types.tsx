export enum Color {
  red = 0,
  blue = 1,
  yellow = 2,
}

export interface Port {
  id: number;
  isDisabled: boolean;
  wire: Wire | null;
}

export interface Wire {
  color: Color;
  inUse: boolean;
}

export function wireName(wire: Wire | null) {
  if (wire === null) {
    return 'none';
  }
  switch (wire.color) {
    case Color.red:
      return 'red';
    case Color.blue:
      return 'blue';
    case Color.yellow:
      return 'yellow';
  }
}
