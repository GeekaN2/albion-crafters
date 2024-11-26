import { PRODUCTION_BONUS_BY_CITY, MARKET_ORDER_FEE, MARKET_SELL_ORDER_FEE } from './constants';
import { ResponseModel, Item } from './profit-tree/typeDefs'

/**
 * Define type of item: journal, item, artifact, resource etc.
 *
 * @param itemName resource or artifact name: T4_PLANK, T7_ARTEFACT_MAIN_SPEAR_KEEPER etc.
 * @returns array with all tiers and subtiers for this item
 */
export function createArrayOfAllIngredients(itemName: string): string[] {
  let allItems = [];
  let resources = ['PLANKS', 'CLOTH', 'METALBAR', 'LEATHER', 'STONEBLOCK'];

  if (isArtifact(itemName)) {
    allItems = createArrayOfAllArtifactsFromArtifact(itemName);
  } else if (resources.some(res => itemName.includes(res))) {
    allItems = createStringOfAllResources(itemName.slice(3)).split(',');
  } else if (itemName.includes('JOURNAL')) {
    const match = itemName.match(/HUNTER|MAGE|WARRIOR|TOOLMAKER/) || [''];

    allItems = createStringOfAllJournals(`ROOT_${match[0]}`).split(',');
  } else if (itemName.includes('T1_FACTION_')) {
    allItems = [itemName];
  } else {
    allItems = createStringOfAllItems(itemName).split(',');
  }

  return allItems;
}

/**
 * Creates a string to request for items of all tiers and subtiers
 *
 * @param itemName - item name: T4_2H_NATURESTAFF_KEEPER etc.
 * @returns string with all tiers and subtiers for item
 */
export function createStringOfAllItems(itemName: string): string {
  let allNames = '';

  for (let subtier = 0; subtier <= 4; subtier++) {
    for (let tier = 4; tier <= 8; tier++) {
      allNames = allNames + `T${tier}` + itemName.slice(2) + (subtier != 0 ? `@${subtier}` : '') + ',';
    }
  }

  return allNames.slice(0, -1);
}

/**
 * Creates a string to request for materials of all tiers and subtiers
 *
 * @param resource - basic resource: PLANKS, CLOTH etc.
 * @returns string with all tiers and subtiers for materials
 */
export function createStringOfAllResources(resource: string, startTier = 4): string {
  let allNames = '';

  for (let subtier = 0; subtier <= 4; subtier++) {
    for (let tier = startTier; tier <= 8; tier++) {
      if (tier < 4 && subtier > 0) {
        continue;
      }

      allNames = allNames + `T${tier}_` + resource + (subtier != 0 ? `_LEVEL${subtier}@${subtier}` : '') + ',';
    }
  }

  return allNames.slice(0, -1);
}

/**
 * Creates a string to request for artefacts of all tiers
 *
 * @param itemName - artefact item name: T4_2H_NATURESTAFF_KEEPER etc.
 * @returns string with all tiers for artefacts
 */
export function createStringOfAllArtifacts(itemName: string) {
  let allNames = '';

  if (itemName.includes('ROYAL')) {
    for (let tier = 4; tier <= 8; tier++) {
      allNames = allNames + `QUESTITEM_TOKEN_ROYAL_T${tier},`;
    }

    return allNames.slice(0, -1);
  }

  if (itemName.includes('INSIGHT')) {
    allNames = allNames + `T4_SKILLBOOK_STANDARD,`;

    return allNames.slice(0, -1);
  }

  if (itemName.includes('CAPEITEM')) {
    for (let tier = 4; tier <= 8; tier++) {
      allNames = allNames + `T${tier}_${itemName.slice(3)}_BP,`;
    }

    return allNames;
  }

  for (let tier = 4; tier <= 8; tier++) {
    allNames = allNames + `T${tier}_ARTEFACT${itemName.slice(2)},`;
  }

  return allNames.slice(0, -1);
}


/**
 * Creates an array to request for artefacts of all tiers
 *
 * @param itemName - artefact item name: T4_ARTEFACT_2H_NATURESTAFF_KEEPER etc.
 * @returns array with all tiers for artefacts
 */
export function createArrayOfAllArtifactsFromArtifact(artifactName: string) {
  let allNames = [];

  if (artifactName.includes('ROYAL')) {
    for (let tier = 4; tier <= 8; tier++) {
      allNames.push(`QUESTITEM_TOKEN_ROYAL_T${tier}`);
    }

    return allNames;
  }

  if (artifactName.includes('SKILLBOOK')) {
    allNames.push(`T4_SKILLBOOK_STANDARD`);

    return allNames;
  }

  if (artifactName.includes('_BP')) {
    for (let tier = 4; tier <= 8; tier++) {
      allNames.push(`T${tier}_${artifactName.slice(3)}`);
    }

    return allNames;
  }

  for (let tier = 4; tier <= 8; tier++) {
    allNames.push(`T${tier}${artifactName.slice(2)}`);
  }

  return allNames;
}

/**
 * Creates a string to request for empty and full journals of all tiers and subtiers
 *
 * @param root - journals branch: ROOT_WARRIOR etc.
 * @returns string with all tiers and subtiers for empty and full journals
 */
export function createStringOfAllJournals(root: string): string {
  let allNames = '';

  for (let tier = 4; tier <= 8; tier++) {
    allNames = allNames + `T${tier}_JOURNAL_${root.slice(5)}_EMPTY,`;
    allNames = allNames + `T${tier}_JOURNAL_${root.slice(5)}_FULL,`;
  }

  return allNames.slice(0, -1);
}

/**
 * Creates array with hearts name of needed city
 */
export function createArrayOfAllHearts(): string[] {
  const allCities = ['Caerleon', 'Martlock', 'Fort Sterling', 'Bridgewatch', 'Lymhurst', 'Thetford'];

  return allCities.map(city => getHeartNameByCity(city));
}

export function getHeartNameByCity(city: string): string {
  const hearts: { [key: string]: string } = {
    'Caerleon': 'T1_FACTION_CAERLEON_TOKEN_1',
    'Martlock': 'T1_FACTION_HIGHLAND_TOKEN_1',
    'Fort Sterling': 'T1_FACTION_MOUNTAIN_TOKEN_1',
    'Bridgewatch': 'T1_FACTION_STEPPE_TOKEN_1',
    'Lymhurst': 'T1_FACTION_FOREST_TOKEN_1',
    'Thetford': 'T1_FACTION_SWAMP_TOKEN_1',
  }

  return hearts[city];
}

export function getHeartNameByItemName(itemName: string): string {
  let heartName = '';

  const itemSubstrings: { [key: string]: string[] } = {
    'Caerleon': ['CAPEITEM_FW_CAERLEON'],
    'Martlock': ['CAPEITEM_FW_MARTLOCK', 'CAPEITEM_KEEPER'],
    'Fort Sterling': ['CAPEITEM_FW_FORTSTERLING', 'CAPEITEM_UNDEAD'],
    'Bridgewatch': ['CAPEITEM_FW_BRIDGEWATCH', 'CAPEITEM_DEMON'],
    'Lymhurst': ['CAPEITEM_FW_LYMHURST', 'CAPEITEM_HERETIC'],
    'Thetford': ['CAPEITEM_FW_THETFORD', 'CAPEITEM_MORGANA'],
  };

  for (let heartCity in itemSubstrings) {
    if (itemSubstrings[heartCity].some(substring => itemName.includes(substring))) {
      heartName = getHeartNameByCity(heartCity);
    }
  }

  return heartName;
}

/**
 * Minimum price from sales orders or maximum price from purchase orders
 *
 * @param {ResponseModel} item
 */
export function normalizedPriceAndDate(item: ResponseModel): Item {
  const previousDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const sellPriceRespone = {
    price: item.sellPriceMin,
    date: item.sellPriceMinDate,
    marketFee: MARKET_SELL_ORDER_FEE,
    quality: item.quality
  }

  const buyPriceResponse = {
    price: item.buyPriceMax,
    date: item.buyPriceMaxDate,
    marketFee: MARKET_ORDER_FEE,
    quality: item.quality
  }

  if (item.sellPriceMin != 0 && item.buyPriceMax == 0) {
    return sellPriceRespone
  }

  if (item.sellPriceMin == 0 && item.buyPriceMax != 0) {
    return buyPriceResponse;
  }

  if (item.sellPriceMin == 0 && item.buyPriceMax == 0) {
    return buyPriceResponse;
  }

  if (new Date(item.sellPriceMinDate) >= previousDay && new Date(item.buyPriceMaxDate) <= previousDay) {
    return sellPriceRespone;
  }

  if (new Date(item.sellPriceMinDate) <= previousDay && new Date(item.buyPriceMaxDate) >= previousDay) {
    return buyPriceResponse;
  }

  // Compare prices with fee,
  if (item.buyPriceMax * 0.97 > item.sellPriceMin * 0.955) {
    return buyPriceResponse;
  }

  return sellPriceRespone;
}

/**
 * Normalize previous item and new item by date and price
 * Trying to choose the most expensive item
 *
 * @param oldItem - previous item
 * @param newItem - new item
 */
export function normalizeItemByDate(oldItem: Item, newItem: Item) {
  const previousDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (new Date(oldItem.date) >= previousDay && new Date(newItem.date) <= previousDay) {
    return oldItem;
  } else if (new Date(oldItem.date) <= previousDay && new Date(newItem.date) >= previousDay) {
    return newItem;
  }

  return oldItem.price > newItem.price ? oldItem : newItem;
}

/**
 * Normalize previous item and new item by date and price
 * Trying to choose the most cheap item
 *
 * @param oldItem - previous item
 * @param newItem - new item
 */
export function normalizeByMinPriceAndDate(oldItem: Item, newItem: Item) {
  const previousDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (new Date(oldItem.date) >= previousDay && new Date(newItem.date) <= previousDay) {
    return oldItem;
  } else if (new Date(oldItem.date) <= previousDay && new Date(newItem.date) >= previousDay) {
    return newItem;
  }

  return oldItem.price < newItem.price && oldItem.price > 0 ? oldItem : newItem;
}

/**
 * Normalize items by comparing sellPriceMin and buyPriceMax
 */
export function normalizeItemsByMaxPriceFromMinPrices(prices: ResponseModel[]) {
  let normalized: { [key: string]: Item } = {};

  prices.forEach((item: ResponseModel) => {
    if (!normalized[item.itemId]) {
      normalized[item.itemId] = {
        price: 0,
        date: '',
        marketFee: 3,
        quality: 1
      };
    }

    const currentPrice = normalized[item.itemId];

    let newPrice: Item = normalizedPriceAndDate(item);

    newPrice = normalizeItemByDate(currentPrice, newPrice);
    normalized[item.itemId] = newPrice;
  });

  return normalized;
}

/**
 * Normalize prices use only sellPriceMin
 *
 * @param prices - array of items
 */
export function normalizeItemBySellPriceMin(prices: ResponseModel[]) {
  let normalized: { [key: string]: Item } = {};

  prices.forEach((item: ResponseModel) => {
    if (!normalized[item.itemId]) {
      normalized[item.itemId] = {
        price: 0,
        date: '',
        marketFee: 3,
        quality: 1
      };
    }

    const currentPrice = normalized[item.itemId];

    let newPrice: Item = {
      price: item.sellPriceMin,
      date: item.sellPriceMinDate,
      marketFee: MARKET_SELL_ORDER_FEE,
      quality: item.quality
    };

    newPrice = normalizeByMinPriceAndDate(currentPrice, newPrice);
    normalized[item.itemId] = newPrice;
  });

  return normalized;
}

/**
 * Checking an object for emptiness
 *
 * @param obj - any object
 */
export function isObjectEmpty(obj: object): boolean {
  return JSON.stringify(obj) == "{}";
}

/**
 * Looking for an artifact substring in an item name
 *
 * @param itemName - item name: T4_HEAD_CLOTH_HELL etc.
 */
export function isArtifactItem(itemName: string, excludeRoyal?: boolean): boolean {
  const artifacts = ['UNDEAD', 'KEEPER', 'HELL', 'MORGANA', 'AVALON', 'FEY', "INSIGHT", "CAPEITEM"];

  if (!excludeRoyal) {
    artifacts.push('ROYAL');
  }

  if (!itemName) {
    return false;
  }

  return artifacts.some(artifact => itemName.includes(artifact));
}

/**
 * Looking for an artifact substring in an item name
 *
 * @param itemName - item name: T4_ARTEFACT_HEAD_CLOTH_HELL etc.
 */
export function isArtifact(itemName: string): boolean {
  const artifactSubstrings = ['ARTEFACT', 'SKILLBOOK', 'ROYAL', '_BP'];

  return artifactSubstrings.some(substring => itemName.includes(substring));
}

/**
 * Determine the raw material for creating the material
 *
 * @param material - material name
 */
export function getRawResourceNameByMaterial(material: string): string {
  const rawResourcesDictionary: { [key: string]: string } = {
    METALBAR: 'ORE',
    LEATHER: 'HIDE',
    CLOTH: 'FIBER',
    PLANKS: 'WOOD',
    STONEBLOCK: 'ROCK'
  }

  return rawResourcesDictionary[material] || '';
}

/**
 * Small function to help in subtier names generation
 *
 * @param baseName - item name without a subtier
 * @param highestSubtier - bound of subtiers
 */
export const generateSubtiersUpTo = (baseName: string, highestSubtier: number) => {
  let names = [];

  for (let subtier = 0; subtier <= highestSubtier; subtier++) {
    names.push(`${baseName}${subtier > 0 ? '@' + subtier : ''}`);
  }

  return names;
}

/**
 * Small function to help in tier names generation
 *
 * @param baseName - item name without a tier, e.g. RUNE
 */
export const generateTiers = (baseName: string): string[] => {
  let names = [];

  for (let tier = 4; tier <= 8; tier++) {
    names.push(`T${tier}_${baseName}`);
  }

  return names;
}

/**
 * O(log2n) search by objects
 * @param objects - array of sorted object by field
 * @param field - field name by which objects are sorted
 * @param value - field value to find
 * @returns
 */
export const lowerBoundForObjects = <ObjectType>(
  objects: ObjectType[],
  field: keyof ObjectType,
  value: ObjectType[keyof ObjectType],
) => {
  if (!objects.length) return null;

  let lowerBound = 0;
  let upperBound = objects.length;

  while (lowerBound < upperBound - 1) {
    const mid = Math.floor((lowerBound + upperBound) / 2);

    if (objects[mid][field] <= value) {
      lowerBound = mid;
    } else {
      upperBound = mid;
    }
  }

  if (objects[lowerBound][field] !== value) {
    return null;
  }

  return objects[lowerBound];
};

/**
 * O(log2n) search by objects
 *
 * @param objects - array of sorted object by field
 * @param field - field name by which objects are sorted
 * @param value - field value to find
 * @returns index
 */
 export const lowerBoundForObjectsIndex = <ObjectType>(
  objects: ObjectType[],
  field: keyof ObjectType,
  value: ObjectType[keyof ObjectType],
) => {
  if (!objects.length) return null;

  let lowerBound = 0;
  let upperBound = objects.length;

  while (lowerBound < upperBound - 1) {
    const mid = Math.floor((lowerBound + upperBound) / 2);

    if (objects[mid][field] <= value) {
      lowerBound = mid;
    } else {
      upperBound = mid;
    }
  }

  if (objects[lowerBound][field] !== value) {
    return null;
  }

  return lowerBound;
};

export const getItemTierByName = (itemName: string) => {
  const tier = itemName.match(/T\d/)?.[0];

  if (itemName.includes('QUESTITEM_TOKEN_AVALON')) {
    return 6;
  }

  return tier ? Number(tier.slice(1)) : 0;
}

export const getItemSubtierByName = (itemName: string) => {
  const subtier = itemName.match(/@\d/)?.[0];

  if (!subtier) {
    return 0;
  }

  return Number(subtier.slice(1)) || 0;
}

export const getProductionBonusCityByItem = (item: string) => {
  return Object.entries(PRODUCTION_BONUS_BY_CITY).find(([_, items]) => items.some(keyword => item.includes(keyword)))?.[0];
}

export const getDoesItemHaveProductionBonusForCity = (item: string, city: string) => {
  return getProductionBonusCityByItem(item) === city;
}
