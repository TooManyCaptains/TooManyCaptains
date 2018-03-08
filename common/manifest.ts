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
    name: '1',
    cardID: 1,
  },
  {
    name: '2',
    cardID: 2,
  },
  {
    name: '3',
    cardID: 3,
  },
  {
    name: '4',
    cardID: 4,
  },
  {
    name: '5',
    cardID: 5,
  },
  {
    name: '6',
    cardID: 6,
  },
];

export default manifest;
