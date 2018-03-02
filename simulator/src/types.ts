import { Color } from '../../common/types';

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
  return wire.color;
}
