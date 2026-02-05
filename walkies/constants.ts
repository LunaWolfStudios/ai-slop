
import { Location, Snack } from './types';

export const LOCATIONS: Location[] = [
  {
    id: 'home-streets',
    name: 'Home Streets',
    description: 'The familiar pavement and the neighbors\' hydrangea bushes.',
    type: 'neighborhood',
    baseDistance: 500,
    unlocked: true,
    discoveredSpots: []
  },
  {
    id: 'oak-grove',
    name: 'Old Oak Grove',
    description: 'A quiet patch of woods where the light hits the moss just right.',
    type: 'nature',
    baseDistance: 800,
    unlocked: true,
    discoveredSpots: []
  },
  {
    id: 'riverside-path',
    name: 'Riverside Path',
    description: 'Follow the water. Clank likes the ducks here.',
    type: 'nature',
    baseDistance: 1200,
    unlocked: false,
    discoveredSpots: []
  },
  {
    id: 'downtown-square',
    name: 'Downtown Square',
    description: 'Brick paths and the smell of the bakery around the corner.',
    type: 'neighborhood',
    baseDistance: 600,
    unlocked: false,
    discoveredSpots: []
  }
];

export const SNACKS: Snack[] = [
  { id: '1', name: 'Peanut Butter Bone', description: 'A classic reward for a good boy.', type: 'treat', foundAt: 'home-streets' },
  { id: '2', name: 'Half a Croissant', description: 'Found near the bakery. Jeremy said no, but Clank said yes.', type: 'unauthorized', foundAt: 'downtown-square' },
  { id: '3', name: 'Dried Sweet Potato', description: 'Chewy and nutritious.', type: 'treat', foundAt: 'oak-grove' }
];

export const CLANK_MOODS = ['excited', 'chill', 'sniffing', 'tired', 'barking'];
