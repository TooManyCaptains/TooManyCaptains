import { sortBy, sample } from 'lodash';
import { ColorPosition, Color } from '../../common/types';

const colors: Color[] = ['blue', 'red', 'yellow'];

export function colorNameToLetter(color: Color): string {
  return color[0].toUpperCase();
}

export function colorPositionsToColorKey(
  colorPositions: ColorPosition[],
): string {
  return (
    sortBy(colorPositions, 'color')
      .map(({ color }) => colorNameToLetter(color))
      .join('') || 'none'
  );
}

export function randomColor(): Color {
  return sample(colors)!;
}
