import { GameEntity } from './types';

// Parsing the CSV data structure into a usable format
export const RAW_DATA = [
  { squirrel: "African tree Squirrel", nut: "Acorns", berry: "Bilberries", fruit: "Apples", seed: "Alfalfa seeds", insect: "Ants", veg: "Bamboo shoots", fungi: "Chanterelles", bush: "Bilberry Bush", plant: "Alfalfa Plant", tree: "Almond tree", toxic: "Autumn Crocus", farm: "AntFarm", predator: "Badgers" },
  { squirrel: "Alexander's Bush Squirrel", nut: "Almonds", berry: "Blackberries", fruit: "Cherries", seed: "Amaranth seeds", insect: "Aphids", veg: "Bark", fungi: "Morels", bush: "Blackberry Bush", plant: "Amaranth Plant", tree: "Apple tree", toxic: "Azalea", farm: "AphidArboretum", predator: "Bobcats" },
  { squirrel: "Allen's Squirrel", nut: "Beech nuts", berry: "Blueberries", fruit: "Crabapples", seed: "Barley seeds", insect: "Bees", veg: "Buds", fungi: "Oyster mushrooms", bush: "Blueberry Bush", plant: "Barley Plant", tree: "Beech tree", toxic: "Castor Bean Plant", farm: "BeeHive", predator: "Buzzard" },
  { squirrel: "Alpine Marmot", nut: "Brazil nuts", berry: "Boysenberries", fruit: "Dates", seed: "Buckwheat seeds", insect: "Beetles", veg: "Flowers", fungi: "Porcini mushrooms", bush: "Boysenberry Bush", plant: "Buckwheat Plant", tree: "Brazil nut tree", toxic: "Daffodils", farm: "BeetleBarn", predator: "Cats" },
  { squirrel: "American Red Squirrel", nut: "Cashews", berry: "Cranberries", fruit: "Figs", seed: "Caraway seeds", insect: "Butterflies", veg: "Forbs", fungi: "Shiitake mushrooms", bush: "Cranberry Bush", plant: "Caraway Plant", tree: "Cashew tree", toxic: "Foxglove", farm: "ButterflyGarden", predator: "Coyotes" },
  { squirrel: "Arctic Ground Squirrel", nut: "Chestnuts", berry: "Currants", fruit: "Mangoes", seed: "Chia seeds", insect: "Caterpillars", veg: "Grasses", fungi: "Truffles", bush: "Currant Bush", plant: "Chia Plant", tree: "Cherry tree", toxic: "Hemlock", farm: "CaterpillarCove", predator: "Creodonts" },
  { squirrel: "Arizona Black-tailed Prairie Dog", nut: "Coconuts", berry: "Elderberries", fruit: "Oranges", seed: "Clover seeds", insect: "Cockroaches", veg: "Herbs", fungi: "Tricholoma", bush: "Elderberry Bush", plant: "Flax Plant", tree: "Chestnut tree", toxic: "Hyacinth", farm: "CockroachColony", predator: "Eagles" },
  { squirrel: "Arizona Gray Squirrel", nut: "Ginkgo Nuts", berry: "Goji berries", fruit: "Peaches", seed: "Flax seeds", insect: "Crickets", veg: "Leaves", fungi: "Tricholoma", bush: "Gooseberry Bush", plant: "Goji Berry Vine", tree: "Coconut palm tree", toxic: "Ivy", farm: "CricketCottage", predator: "Falcons" },
  { squirrel: "Asiatic striped squirrel", nut: "Hazelnuts", berry: "Gooseberries", fruit: "Pears", seed: "Hemp seeds", insect: "Dragonflies", veg: "Lichens", fungi: "Tricholoma", bush: "Huckleberry Bush", plant: "Hemp Plant", tree: "Crabapple tree", toxic: "Lilies", farm: "DragonflyDen", predator: "Foxes" },
  { squirrel: "Bornean Black-Banded Squirrel", nut: "Hickory nuts", berry: "Huckleberries", fruit: "Persimmons", seed: "Millet seeds", insect: "Earwigs", veg: "Moss", fungi: "Tricholoma", bush: "Juniper Bush", plant: "Millet Plant", tree: "Date Palm tree", toxic: "Nightshade", farm: "EarwigEnclave", predator: "Golden Eagles" },
];

// --- Entity Generators ---

export const SQUIRREL_DATA: GameEntity[] = RAW_DATA.map((row, index) => ({
  name: row.squirrel,
  type: 'Squirrel',
  tier: index + 1,
  description: `Gathers ${row.nut}, ${row.berry}, and ${row.veg}.`,
  cost: { [row.nut]: 10 * Math.pow(1.8, index) }, // Exponential cost curve
  production: { 
    [row.nut]: 0.5 * (index + 1), 
    [row.berry]: 0.3 * (index + 1),
    [row.veg]: 0.1 * (index + 1)
  }
}));

export const BUSH_DATA: GameEntity[] = RAW_DATA.map((row, index) => ({
  name: row.bush,
  type: 'Bush',
  tier: index + 1,
  description: `Grown from ${row.berry}. Produces ${row.seed}.`,
  cost: { [row.berry]: 20 * Math.pow(1.5, index) },
  production: {
    [row.seed]: 0.2 * (index + 1),
    [row.berry]: 0.05 * (index + 1) // Small chance to return berries too
  }
}));

export const TREE_DATA: GameEntity[] = RAW_DATA.map((row, index) => {
  // Logic: Tree[i] produces Fruit[i] and Nut[i+1] (to allow unlocking the next tier).
  // The last tree produces even more of the last nut.
  const nextNut = index < RAW_DATA.length - 1 ? RAW_DATA[index + 1].nut : row.nut;
  
  return {
    name: row.tree,
    type: 'Tree',
    tier: index + 1,
    description: `Grows ${row.fruit} and ${nextNut}.`,
    cost: { [row.seed]: 15 * Math.pow(1.6, index) },
    production: { 
      [row.fruit]: 0.2 * (index + 1),
      [nextNut]: 0.3 * (index + 1) // This is the key to progression!
    }
  };
});

export const FARM_DATA: GameEntity[] = RAW_DATA.map((row, index) => ({
  name: row.farm,
  type: 'Farm',
  tier: index + 1,
  description: `Breeds ${row.insect}. Boosts ecosystem.`,
  cost: { [row.nut]: 100 * Math.pow(1.5, index), [row.seed]: 50 * Math.pow(1.5, index) },
  production: { [row.insect]: 1 * (index + 1) }
}));

export const DEFENSE_DATA: GameEntity[] = RAW_DATA.map((row, index) => ({
  name: row.toxic,
  type: 'Defense',
  tier: index + 1,
  description: `Toxic ${row.toxic}. Deters predators.`,
  cost: { [row.nut]: 50 * Math.pow(1.5, index), [row.insect]: 20 * Math.pow(1.5, index) },
  defense: (index + 1) * 5 // Defines defense power
}));

// Manually defined Shelter progression since it wasn't in RAW_DATA
export const SHELTER_DATA: GameEntity[] = [
  { name: "Leafy Nest", type: "Shelter", tier: 1, description: "A simple nest. +5 Squirrel Cap.", cost: { "Acorns": 50, "Bamboo shoots": 20 }, capIncrease: 5 },
  { name: "Hollow Log", type: "Shelter", tier: 2, description: "Sturdy shelter. +10 Squirrel Cap.", cost: { "Almonds": 100, "Bark": 50, "Apples": 10 }, capIncrease: 10 },
  { name: "Burrow System", type: "Shelter", tier: 3, description: "Underground network. +15 Squirrel Cap.", cost: { "Beech nuts": 200, "Buds": 80, "Cherries": 20 }, capIncrease: 15 },
  { name: "Tree Cavity", type: "Shelter", tier: 4, description: "High rise living. +20 Squirrel Cap.", cost: { "Brazil nuts": 400, "Flowers": 100, "Crabapples": 30 }, capIncrease: 20 },
  { name: "Canopy Drey", type: "Shelter", tier: 5, description: "Penthouse views. +30 Squirrel Cap.", cost: { "Cashews": 800, "Forbs": 150, "Dates": 40 }, capIncrease: 30 },
  { name: "Fortified Mound", type: "Shelter", tier: 6, description: "Safe and sound. +40 Squirrel Cap.", cost: { "Chestnuts": 1500, "Grasses": 200, "Figs": 50 }, capIncrease: 40 },
  { name: "Elder Treehouse", type: "Shelter", tier: 7, description: "Ancient architecture. +50 Squirrel Cap.", cost: { "Coconuts": 3000, "Herbs": 300, "Mangoes": 60 }, capIncrease: 50 },
  { name: "Squirrel City", type: "Shelter", tier: 8, description: "A bustling metropolis. +75 Squirrel Cap.", cost: { "Ginkgo Nuts": 6000, "Leaves": 500, "Oranges": 80 }, capIncrease: 75 },
  { name: "Royal Palace", type: "Shelter", tier: 9, description: "Fit for a King. +100 Squirrel Cap.", cost: { "Hazelnuts": 12000, "Lichens": 800, "Peaches": 100 }, capIncrease: 100 },
  { name: "The World Tree", type: "Shelter", tier: 10, description: "Legendary home. +200 Squirrel Cap.", cost: { "Hickory nuts": 25000, "Moss": 1500, "Pears": 200 }, capIncrease: 200 },
];

// Resource Entity Definitions for UI
const createResourceEntity = (name: string, type: any, tier: number): GameEntity => ({ name, type, tier });

export const NUT_DATA: GameEntity[] = RAW_DATA.map((row, i) => createResourceEntity(row.nut, 'Nut', i + 1));
export const BERRY_DATA: GameEntity[] = RAW_DATA.map((row, i) => createResourceEntity(row.berry, 'Berry', i + 1));
export const FRUIT_DATA: GameEntity[] = RAW_DATA.map((row, i) => createResourceEntity(row.fruit, 'Fruit', i + 1));
export const SEED_DATA: GameEntity[] = RAW_DATA.map((row, i) => createResourceEntity(row.seed, 'Seed', i + 1));
export const VEG_DATA: GameEntity[] = RAW_DATA.map((row, i) => createResourceEntity(row.veg, 'Vegetation', i + 1));
export const INSECT_DATA: GameEntity[] = RAW_DATA.map((row, i) => createResourceEntity(row.insect, 'Insect', i + 1));

export const ALL_ENTITIES = [
  ...SQUIRREL_DATA,
  ...BUSH_DATA,
  ...TREE_DATA,
  ...FARM_DATA,
  ...SHELTER_DATA,
  ...DEFENSE_DATA
];

export const INITIAL_RESOURCES = {
  "Acorns": 0
};

export const INITIAL_CAP = 5;
