import { CardID } from './types';

interface ManifestEntry {
  cardID: CardID
  name: string;
}

const manifest: ManifestEntry[] = [
  {
    name: 'Engineer',
    cardID: 0,
  },
  {
    name: 'A',
    cardID: 1,
  },
  {
    name: 'B',
    cardID: 2,
  },
  {
    name: 'C',
    cardID: 3,
  },
  {
    name: 'D',
    cardID: 4,
  },
  {
    name: 'E',
    cardID: 5,
  },
  {
    name: 'F',
    cardID: 6,
  },
];

export default manifest;
