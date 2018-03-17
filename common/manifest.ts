import { CardID } from './types';

interface ManifestEntry {
  cardID: CardID;
  name: string;
}

const manifest: ManifestEntry[] = [
  {
    name: 'Spectra Prism',
    cardID: 0,
  },
  {
    name: 'Brick Punch',
    cardID: 1,
  },
  {
    name: 'Jade Moss',
    cardID: 2,
  },
  {
    name: 'Hickory Russet',
    cardID: 3,
  },
  {
    name: 'Amber Clay',
    cardID: 4,
  },
  {
    name: 'Iris Dodger',
    cardID: 5,
  },
  {
    name: 'Razzmic Phlox',
    cardID: 6,
  },
];

export default manifest;
