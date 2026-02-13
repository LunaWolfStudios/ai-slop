export enum LandmarkCategory {
  CITY = 'City',
  NATURE = 'Nature',
  CASTLE = 'Castle',
  HISTORY = 'History',
  CULTURE = 'Culture'
}

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: LandmarkCategory;
  description: string;
  imageUrl?: string;
}

export interface TravelStats {
  total: number;
  visited: number;
  percentage: number;
}