import { sortBy, sample } from 'lodash';
import { ColorPosition, Color } from '../../common/types';

export const COLORS: Color[] = ['blue', 'red', 'yellow'];

export function colorNameToLetter(color: Color): string {
  return color[0].toUpperCase();
}

export function colorPositionsToColors(colorPositions: ColorPosition[]) {
  return sortBy(colorPositions, 'color').map(cp => cp.color);
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

export function colorsToColorKey(colors: Color[]): string {
  return colors.map(color => colorNameToLetter(color)).join('') || 'none';
}

export function randomColor(): Color {
  return sample(COLORS)!;
}
