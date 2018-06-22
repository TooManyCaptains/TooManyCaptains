import { CardID } from './types';

interface ManifestEntry {
  cardID: CardID;
  name: string;
  sequence: number;
}

const manifest: ManifestEntry[] = [
  {
    name: 'Spectra Prism',
    cardID: 0,
    sequence: 109161444,
  },
  {
    name: 'Brick Punch',
    cardID: 1,
    sequence: 143128104,
  },
  {
    name: 'Jade Moss',
    cardID: 2,
    sequence: 106919972,
  },
  {
    name: 'Hickory Russet',
    cardID: 3,
    sequence: 15415876,
  },
  {
    name: 'Amber Clay',
    cardID: 4,
    sequence: 161210484,
  },
  {
    name: 'Iris Dodger',
    cardID: 5,
    sequence: 1625531010,
  },
  {
    name: 'Razzmic Phlox',
    cardID: 6,
    sequence: 133271410,
  },
];

export default manifest;
