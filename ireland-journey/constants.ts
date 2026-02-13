import { Landmark, LandmarkCategory } from './types';

export const IRELAND_CENTER: [number, number] = [53.4, -7.9];
export const DEFAULT_ZOOM = 7;
export const LOCAL_STORAGE_KEY = 'ireland_travel_map_data';

// Helper to create reliable optimized image URLs using Weserv proxy + Wikimedia Special:FilePath
const getWikiImage = (filename: string) => 
  `https://images.weserv.nl/?url=commons.wikimedia.org/wiki/Special:FilePath/${filename}&w=800&h=400&fit=cover&output=jpg&q=80`;

export const LANDMARKS: Landmark[] = [
  // Dublin Area
  {
    id: 'st_stephens_green',
    name: "St. Stephen's Green",
    lat: 53.3382,
    lng: -6.2591,
    category: LandmarkCategory.NATURE,
    description: "A historical park and garden, located in the center of Dublin city.",
    imageUrl: getWikiImage("St._Stephen's_Green_Dublin_2005.jpg")
  },
  {
    id: 'trinity_college',
    name: "Trinity College & Book of Kells",
    lat: 53.3438,
    lng: -6.2546,
    category: LandmarkCategory.HISTORY,
    description: "Ireland's oldest university, housing the famous Book of Kells.",
    imageUrl: getWikiImage("Trinity_College_Dublin_Front_Square.jpg")
  },
  {
    id: 'dublin_castle',
    name: "Dublin Castle",
    lat: 53.3429,
    lng: -6.2674,
    category: LandmarkCategory.CASTLE,
    description: "A major Irish government complex and former seat of British rule.",
    imageUrl: getWikiImage("Dublin_Castle_Record_Tower_and_Chapel_Royal_2017.jpg")
  },
  {
    id: 'st_patricks_cathedral',
    name: "St. Patrick's Cathedral",
    lat: 53.3396,
    lng: -6.2715,
    category: LandmarkCategory.HISTORY,
    description: "The National Cathedral of the Church of Ireland.",
    imageUrl: getWikiImage("St_Patricks_Cathedral_Dublin_20060810.jpg")
  },
  {
    id: 'guinness_storehouse',
    name: "Guinness Storehouse",
    lat: 53.3419,
    lng: -6.2867,
    category: LandmarkCategory.CULTURE,
    description: "A brewery experience telling the tale of Ireland's famous beer.",
    imageUrl: getWikiImage("Guinness_Storehouse_St_James_Gate_Dublin_Ireland.jpg")
  },
  {
    id: 'jameson_distillery',
    name: "Jameson Distillery Bow St.",
    lat: 53.3484,
    lng: -6.2773,
    category: LandmarkCategory.CULTURE,
    description: "The original site where Jameson Irish Whiskey was distilled until 1971.",
    imageUrl: getWikiImage("Old_Jameson_Distillery_Dublin.jpg")
  },
  {
    id: 'national_museum_archaeology',
    name: "National Museum of Ireland",
    lat: 53.3400,
    lng: -6.2550,
    category: LandmarkCategory.HISTORY,
    description: "The Archaeology branch houses Irish antiquities including the Ardagh Chalice and Tara Brooch.",
    imageUrl: getWikiImage("National_Museum_of_Ireland_-_Kildare_Street.jpg")
  },
  {
    id: 'georges_st_arcade',
    name: "George's Street Arcade",
    lat: 53.3421,
    lng: -6.2644,
    category: LandmarkCategory.CULTURE,
    description: "Ireland’s first purpose-built shopping centre, a Victorian red-brick indoor market.",
    imageUrl: getWikiImage("George's_Street_Arcade_Dublin_2006.jpg")
  },
  {
    id: 'phoenix_park',
    name: "Phoenix Park",
    lat: 53.3559,
    lng: -6.3298,
    category: LandmarkCategory.NATURE,
    description: "One of the largest enclosed public parks in any capital city in Europe.",
    imageUrl: getWikiImage("Deer_in_Phoenix_Park,_Dublin_-_geograph.org.uk_-_1211029.jpg")
  },
  {
    id: 'kilmainham_gaol',
    name: "Kilmainham Gaol",
    lat: 53.3416,
    lng: -6.3092,
    category: LandmarkCategory.HISTORY,
    description: "A former prison turned museum, key to Irish history.",
    imageUrl: getWikiImage("Kilmainham_Gaol_Main_Hall_Dublin_2006.jpg")
  },
  
  // East Coast / Wicklow
  {
    id: 'glendalough_green_road',
    name: "The Glendalough Green Road",
    lat: 53.0108,
    lng: -6.3298,
    category: LandmarkCategory.NATURE,
    description: "A scenic walk through the Monastic City and Lower Lake in the Wicklow Mountains.",
    imageUrl: getWikiImage("Glendalough_Upper_Lake_and_Valley.jpg")
  },

  // Southern Ireland
  {
    id: 'rock_of_cashel',
    name: "Rock of Cashel",
    lat: 52.5201,
    lng: -7.8906,
    category: LandmarkCategory.CASTLE,
    description: "A spectacular group of medieval buildings set on an outcrop of limestone.",
    imageUrl: getWikiImage("Rock_of_Cashel_from_the_south.jpg")
  },
  {
    id: 'blarney_castle',
    name: "Blarney Castle",
    lat: 51.9291,
    lng: -8.5709,
    category: LandmarkCategory.CASTLE,
    description: "Home of the Blarney Stone, legendary for bestowing the gift of eloquence.",
    imageUrl: getWikiImage("Blarney_Castle_01.jpg")
  },
  {
    id: 'blarney_woolen_mills',
    name: "Blarney Woolen Mills",
    lat: 51.9304,
    lng: -8.5632,
    category: LandmarkCategory.CULTURE,
    description: "Built in 1823, this historic mill is now a major Irish heritage shop.",
    imageUrl: getWikiImage("Blarney_Woollen_Mills.jpg")
  },
  {
    id: 'english_market',
    name: "English Market",
    lat: 51.8972,
    lng: -8.4739,
    category: LandmarkCategory.CULTURE,
    description: "A celebrated food market in the center of Cork city.",
    imageUrl: getWikiImage("The_English_Market,_Cork.jpg")
  },
  {
    id: 'st_annes_shandon',
    name: "St. Anne's Church (Shandon Bells)",
    lat: 51.9037,
    lng: -8.4754,
    category: LandmarkCategory.HISTORY,
    description: "Famous for its bells which visitors can ring, offering views over Cork city.",
    imageUrl: getWikiImage("St._Anne's_Church,_Shandon,_Cork.jpg")
  },
  {
    id: 'fitzgerald_park',
    name: "Fitzgerald Park",
    lat: 51.8950,
    lng: -8.4900,
    category: LandmarkCategory.NATURE,
    description: "A tranquil riverside park in Cork City, home to the Cork Public Museum.",
    imageUrl: getWikiImage("Fitzgerald_Park_Cork.jpg")
  },
  {
    id: 'bunratty_castle',
    name: "Bunratty Castle",
    lat: 52.6961,
    lng: -8.8115,
    category: LandmarkCategory.CASTLE,
    description: "A large 15th-century tower house in County Clare.",
    imageUrl: getWikiImage("Bunratty_Castle,_Co._Clare_-_geograph.org.uk_-_645781.jpg")
  },

  // West Coast
  {
    id: 'cliffs_of_moher',
    name: "Cliffs of Moher",
    lat: 52.9715,
    lng: -9.4265,
    category: LandmarkCategory.NATURE,
    description: "Sea cliffs running for about 14 kilometres along the Burren region.",
    imageUrl: getWikiImage("Cliffs_of_Moher_viewed_from_south.jpg")
  },
  {
    id: 'galway_city',
    name: "Galway City",
    lat: 53.2707,
    lng: -9.0568,
    category: LandmarkCategory.CITY,
    description: "A harbor city on Ireland's west coast, famous for its culture and music.",
    imageUrl: getWikiImage("Galway_Hookers_at_Kinvara_-_geograph.org.uk_-_1466023.jpg")
  },
  {
    id: 'burren_national_park',
    name: "Burren National Park",
    lat: 53.0076,
    lng: -9.0064,
    category: LandmarkCategory.NATURE,
    description: "Famous for its unique glaciated karst landscape.",
    imageUrl: getWikiImage("Burren_National_Park_-_Mullaghmore.jpg")
  },
  {
    id: 'aran_islands',
    name: "Aran Islands",
    lat: 53.1167,
    lng: -9.6833,
    category: LandmarkCategory.NATURE,
    description: "Three rocky isles guarding the mouth of Galway Bay.",
    imageUrl: getWikiImage("Inishmore_cliffs.jpg")
  }
];