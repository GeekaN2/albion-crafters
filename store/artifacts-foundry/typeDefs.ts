import { ResponseModel } from "../typeDefs";

export interface ArtifactsFoundryState {
  tree: ArtifactsTree;
  fragments: Prices;
  artifacts: Prices;
  settings: Settings;
  features: Features;
  averageData: AverageData;
  currentItemInfo: ItemInfo;
}

export type FragmentType = 'RUNE' | 'SOUL' | 'RELIC' | 'SHARD_AVALONIAN';
export type ArtifactBranchType = 'WARRIOR_BRANCH' | 'HUNTER_BRANCH' | 'MAGE_BRANCH';

export type ArtifactBranch = {
  [key in FragmentType]: string[];
}

export type ArtifactsTreeForCurrentFragment = {
  [key in ArtifactBranchType]: string[];
}

export type ArtifactsTree = {
  [key in ArtifactBranchType]: ArtifactBranch;
}

export type AlbionCities = 'Caerleon' 
  | 'Bridgewatch' 
  | 'Fort Sterling' 
  | 'Lymhurst'
  | 'Martlock'
  | 'Thetford';

export enum LoadingStatus {
  CALCULATED = 'calculated',
  SOMETHING_CHANGED = 'something-changed',
  LOADING_FRAGMENTS = 'fragments',
  LOADING_ARTIFACTS = 'artifacts'
}

export interface Features {
  loadingStatus: LoadingStatus;
}

export interface ItemInfo {
  name: FragmentType;
}

/**
 * city -> array of items data
 */
 export interface Prices {
  [city: string]: ResponseModel[];
}

/**
 * Transmutation settings
 */
 export interface Settings {
  useMultipleCities: boolean;
  cities: {
    buyArtifacts: AlbionCities,
    sellArtifacts: AlbionCities,
    sellFragments: AlbionCities,
    buyFragments: AlbionCities,
  }
}

/**
 * city -> base item name -> item name
 */
 export interface AverageData {
  [city: string]:  AverageDataForItem[];
}

/**
 * Item average data
 */
 export interface AverageDataForItem {
  itemName: string;
  location: string;
  averageItems: number;
  averagePrice: number;
  firstCheckDate: string;
  lastCheckDate: string;
}


/**
 * Combined settings and info about item
 * For convenience in actions and mutations
 */
 export interface SettingsWithItem {
  currentItemInfo: ItemInfo;
  settings: Settings;
}