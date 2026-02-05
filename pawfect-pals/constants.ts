import { Item, Personality, PetConfig, PetType } from './types';

export const INITIAL_COINS = 100;

export const AVAILABLE_PETS: PetConfig[] = [
  // --- DOGS ---
  {
    id: 'dog_golden',
    type: PetType.DOG,
    name: 'Golden Retriever',
    personality: Personality.PLAYFUL,
    description: 'The classic family dog. Loves everyone, especially if you have a tennis ball.',
    color: 'bg-yellow-200'
  },
  {
    id: 'dog_beagle',
    type: PetType.DOG,
    name: 'Beagle',
    personality: Personality.CURIOUS,
    description: 'Follows their nose everywhere. A bit loud, but very loving.',
    color: 'bg-orange-200'
  },
  {
    id: 'dog_boston',
    type: PetType.DOG,
    name: 'Boston Terrier',
    personality: Personality.MISCHIEVOUS,
    description: ' The "American Gentleman". Silly, energetic, and prone to zoomies.',
    color: 'bg-slate-800 text-white' // Dark coat simulation
  },
  {
    id: 'dog_pyrenees',
    type: PetType.DOG,
    name: 'Great Pyrenees',
    personality: Personality.LAZY,
    description: 'A gentle giant. Loves to sleep on cool floors and bark at leaves.',
    color: 'bg-stone-100'
  },
  {
    id: 'dog_corgi',
    type: PetType.DOG,
    name: 'Corgi',
    personality: Personality.PLAYFUL,
    description: 'Short legs, big attitude. Herds you towards the treat jar.',
    color: 'bg-orange-300'
  },
  {
    id: 'dog_pug',
    type: PetType.DOG,
    name: 'Pug',
    personality: Personality.LAZY,
    description: 'Snuffles, snorts, and snacks. A professional couch potato.',
    color: 'bg-amber-100'
  },
  {
    id: 'dog_husky',
    type: PetType.DOG,
    name: 'Husky',
    personality: Personality.MISCHIEVOUS,
    description: 'Very vocal and dramatic. Will howl if dinner is 1 minute late.',
    color: 'bg-slate-300'
  },
  {
    id: 'dog_shiba',
    type: PetType.DOG,
    name: 'Shiba Inu',
    personality: Personality.SHY,
    description: 'Independent and cat-like. Judges you silently but loves head scratches.',
    color: 'bg-red-200'
  },

  // --- CATS ---
  {
    id: 'cat_orange',
    type: PetType.CAT,
    name: 'Orange Tabby',
    personality: Personality.LAZY,
    description: 'Only shares one brain cell with all other orange cats. Loves lasagna.',
    color: 'bg-orange-400'
  },
  {
    id: 'cat_tuxedo',
    type: PetType.CAT,
    name: 'Tuxedo',
    personality: Personality.MISCHIEVOUS,
    description: 'Dressed for dinner, but ready to knock over your water glass.',
    color: 'bg-slate-900 text-white'
  },
  {
    id: 'cat_persian',
    type: PetType.CAT,
    name: 'Persian',
    personality: Personality.LAZY,
    description: 'Fluffy royalty. Expects to be carried and fed treats on a silver platter.',
    color: 'bg-gray-100'
  },
  {
    id: 'cat_siamese',
    type: PetType.CAT,
    name: 'Siamese',
    personality: Personality.CURIOUS,
    description: 'Very chatty. Will tell you exactly how their day went.',
    color: 'bg-stone-200'
  },
  {
    id: 'cat_calico',
    type: PetType.CAT,
    name: 'Calico',
    personality: Personality.SHY,
    description: 'Sweet but sassy. Chooses their favorite human carefully.',
    color: 'bg-amber-700 text-white'
  },
  {
    id: 'cat_void',
    type: PetType.CAT,
    name: 'Black Cat',
    personality: Personality.CURIOUS,
    description: 'A tiny void with eyes. brings good luck and chaos.',
    color: 'bg-neutral-900 text-white'
  },
  {
    id: 'cat_sphynx',
    type: PetType.CAT,
    name: 'Sphynx',
    personality: Personality.PLAYFUL,
    description: 'Warm, wrinkled, and energetic. Like a hot water bottle that jumps.',
    color: 'bg-rose-200'
  }
];

export const SHOP_ITEMS: Item[] = [
  {
    id: 'biscuit',
    name: 'Dog Biscuit',
    icon: '🍪',
    cost: 10,
    type: 'FOOD',
    effect: { hunger: -20, happiness: 5 }
  },
  {
    id: 'fish',
    name: 'Fresh Fish',
    icon: '🐟',
    cost: 15,
    type: 'FOOD',
    effect: { hunger: -25, happiness: 10 }
  },
  {
    id: 'chicken',
    name: 'Chicken Leg',
    icon: '🍗',
    cost: 20,
    type: 'FOOD',
    effect: { hunger: -40, energy: 5 }
  },
  {
    id: 'sushi',
    name: 'Fancy Sushi',
    icon: '🍣',
    cost: 45,
    type: 'FOOD',
    effect: { hunger: -30, happiness: 30 }
  },
  {
    id: 'ball',
    name: 'Tennis Ball',
    icon: '🎾',
    cost: 50,
    type: 'TOY',
    effect: { happiness: 15, energy: -10 }
  },
  {
    id: 'yarn',
    name: 'Yarn Ball',
    icon: '🧶',
    cost: 40,
    type: 'TOY',
    effect: { happiness: 20, energy: -15 }
  },
  {
    id: 'mouse',
    name: 'Toy Mouse',
    icon: '🐭',
    cost: 60,
    type: 'TOY',
    effect: { happiness: 30, energy: -20 }
  }
];
