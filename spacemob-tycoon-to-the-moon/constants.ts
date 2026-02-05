import { BuildingDef, MarketHeadline, UpgradeDef } from './types';

export const BUILDINGS: BuildingDef[] = [
  { id: 0, name: "BlueWalker 3", baseProd: 1, baseCost: 15, flavor: "The Big Test Waffle. 693 sq ft of glory.", tier: 'prototype' },
  { id: 1, name: "BlueBird 1", baseProd: 2, baseCost: 100, flavor: "Proof that Earth can hear space yelling at it.", tier: 'prototype', reqBuildingId: 0 },
  { id: 2, name: "BlueBird 2", baseProd: 5, baseCost: 500, flavor: "Connectivity but make it fashion.", tier: 'prototype', reqBuildingId: 1 },
  { id: 3, name: "BlueBird 3", baseProd: 12, baseCost: 1200, flavor: "Roaming charges have left the chat.", tier: 'prototype', reqBuildingId: 2 },
  { id: 4, name: "BlueBird 4", baseProd: 25, baseCost: 3500, flavor: "This one thinks for itself.", tier: 'prototype', reqBuildingId: 3 },
  { id: 5, name: "BlueBird 5", baseProd: 50, baseCost: 10000, flavor: "Five birds, one sky.", tier: 'prototype', reqBuildingId: 4 },
  { id: 6, name: "BB6 Launch", baseProd: 100, baseCost: 25000, flavor: "Launched from India. Heard around the world.", tier: 'block1', reqBuildingId: 5 },
  { id: 7, name: "BB7 (Florida Man)", baseProd: 200, baseCost: 75000, flavor: "Florida Man launches satellite.", tier: 'block1', reqBuildingId: 6 },
  { id: 8, name: "BB8–10 Cluster", baseProd: 500, baseCost: 200000, flavor: "Now we’re printing satellites.", tier: 'block1', reqBuildingId: 7 },
  { id: 9, name: "BB11–13 Cluster", baseProd: 1000, baseCost: 600000, flavor: "The sky is starting to look crowded.", tier: 'block1', reqBuildingId: 8 },
  { id: 10, name: "Block-2 Trio", baseProd: 2500, baseCost: 1500000, flavor: "Smarter satellites. Less buffering.", tier: 'block2', reqBuildingId: 9, reqSubscribers: 1000 },
  { id: 11, name: "Block-2 Quad", baseProd: 5000, baseCost: 5000000, flavor: "Assembly line… in space.", tier: 'block2', reqBuildingId: 10, reqSubscribers: 50000 },
  { id: 12, name: "Block-2 Octo", baseProd: 10000, baseCost: 25000000, flavor: "The constellation awakens.", tier: 'block2', reqBuildingId: 11, reqSubscribers: 500000 },
  { id: 13, name: "Global Network", baseProd: 25000, baseCost: 100000000, flavor: "Who needs GPS when you have vibes?", tier: 'commercial', reqBuildingId: 12, reqSubscribers: 2000000 },
  { id: 14, name: "AI Data Center", baseProd: 50000, baseCost: 500000000, flavor: "Cloud computing… literally.", tier: 'commercial', reqBuildingId: 13 },
  { id: 15, name: "SpaceMob MegaNet", baseProd: 100000, baseCost: 1000000000, flavor: "You are now the internet.", tier: 'meme', reqBuildingId: 14 },
];

export const UPGRADES: UpgradeDef[] = [
  // --- MARKET PATH ---
  {
    id: 'retail_energy',
    name: 'Retail Energy Drink',
    cost: 50,
    currency: 'HYPE',
    category: 'MARKET',
    description: 'Clicking gives +2 Hype.',
    effect: () => 2,
    type: 'hype_gen',
    flavor: 'Contains 200% daily value of hopium.'
  },
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    cost: 5000,
    currency: 'HYPE',
    category: 'MARKET',
    description: 'Bear Market penalty reduced (Production x0.75 instead of x0.5).',
    effect: () => 0.5, 
    type: 'market',
    flavor: 'HODL through the dips.'
  },
  {
    id: 'meme_warfare',
    name: 'Meme Warfare',
    cost: 1500,
    currency: 'HYPE',
    category: 'MARKET',
    description: 'Click Power x1.5.',
    effect: () => 1.5,
    type: 'click',
    flavor: 'Deploying rare Pepes.'
  },
  {
    id: 'short_squeeze',
    name: 'Short Squeeze',
    cost: 25000,
    currency: 'HYPE',
    category: 'MARKET',
    description: 'Bull Markets are 20% stronger.',
    effect: () => 1.2,
    type: 'market',
    flavor: 'Green candles only.'
  },
  {
    id: 'goldman_coverage',
    name: 'Goldman Sachs Coverage',
    cost: 50000,
    currency: 'HYPE',
    category: 'MARKET',
    description: 'Base production x1.5.',
    effect: () => 1.5,
    type: 'production',
    flavor: 'Institutional money incoming.'
  },

  // --- HARDWARE PATH ---
  {
    id: 'asic_chips',
    name: 'Custom ASIC Chips',
    cost: 150,
    currency: 'HYPE',
    category: 'HARDWARE',
    description: 'Click Power x3. The brain of the bird.',
    effect: () => 3,
    type: 'click',
    flavor: 'Silicon Valley logic.'
  },
  {
    id: 'carbon_fiber',
    name: 'Carbon Fiber Microns',
    cost: 800,
    currency: 'HYPE',
    category: 'HARDWARE',
    description: 'All satellites produce +10% CP.',
    effect: () => 1.1,
    type: 'production',
    flavor: 'Lighter, stronger, faster.'
  },
  {
    id: 'folding_hinge',
    name: 'Orbital Folding Hinge',
    cost: 2000,
    currency: 'HYPE',
    category: 'HARDWARE',
    description: 'Production x1.2 for all Prototype satellites.',
    effect: () => 1.2,
    type: 'production',
    flavor: 'Origami, but for space.'
  },
  {
    id: 'beamforming',
    name: 'Beamforming Tech',
    cost: 5000,
    currency: 'HYPE',
    category: 'HARDWARE',
    description: 'All satellites produce x2 CP.',
    effect: () => 2.0,
    type: 'production',
    flavor: 'Direct to device, no dish required.'
  },
  {
    id: 'mimo_tech',
    name: 'Massive MIMO',
    cost: 15000,
    currency: 'HYPE',
    category: 'HARDWARE',
    description: 'Click Power x5.',
    effect: () => 5,
    type: 'click',
    flavor: 'More antennas = more signals.'
  },
  {
    id: 'midland_factory',
    name: 'Midland Factory',
    cost: 25000,
    currency: 'HYPE',
    category: 'HARDWARE',
    description: 'All satellites produce +20% CP.',
    effect: () => 1.2,
    type: 'production',
    flavor: 'Texan efficiency.'
  },

  // --- SOFTWARE PATH ---
  {
    id: 'ai_traffic',
    name: 'AI Traffic Shaping',
    cost: 3000,
    currency: 'HYPE',
    category: 'SOFTWARE',
    description: 'Production x1.3.',
    effect: () => 1.3,
    type: 'production',
    flavor: 'Routing packets with big brains.'
  },
  {
    id: 'qv_band',
    name: 'Q/V Band Backhaul',
    cost: 10000,
    currency: 'HYPE',
    category: 'SOFTWARE',
    description: 'Base CP Production x1.5.',
    effect: () => 1.5,
    type: 'production',
    flavor: 'Wider pipes for more data.'
  },
  {
    id: '5g_integration',
    name: '5G Core Integration',
    cost: 75000,
    currency: 'HYPE',
    category: 'SOFTWARE',
    description: 'Subscriber growth x2.',
    effect: () => 2,
    type: 'production',
    flavor: 'Seamless switching.'
  }
];

export const HEADLINES: MarketHeadline[] = [
  { type: 'BULL', text: "Goldman Sachs upgrades rating to 'Buy'" },
  { type: 'BULL', text: "Retail Traders Discover Space" },
  { type: 'BULL', text: "Satellite causes meme rally" },
  { type: 'BULL', text: "SpaceMob memes trending on X" },
  { type: 'BULL', text: "Shorts squeeze engaged" },
  { type: 'BEAR', text: "Short Report: 'Space is fake'" },
  { type: 'BEAR', text: "FCC Application lost in mail" },
  { type: 'BEAR', text: "Elon tweets a confused emoji" },
  { type: 'BEAR', text: "Bandwidth shortage blamed on moon" },
  { type: 'BEAR', text: "Market maker algorithm glitch" },
  { type: 'NEUTRAL', text: "Just another day in low earth orbit" },
];