import { GetterTree } from 'vuex'
import { TreeState, Item, Recipe } from './typeDefs'
import {
  isArtifactItem,
  normalizeItemsByMaxPriceFromMinPrices,
  normalizeItemBySellPriceMin,
  getHeartNameByItemName,
  getDoesItemHaveProductionBonusForCity,
} from '../utils'
import cloneDeep from 'lodash.clonedeep';

export const getters: GetterTree<TreeState, {}> = {
  /**
   * Get t4-t8 item prices
   *
   * @param state - vuex state
   */
  getItems: (state: TreeState) => {
    const itemName = state.currentItemInfo.name;
    const city = state.settings.cities.sellItems;
    const qualities = state.settings.expert.qualities;
    let prices = state.prices[city][itemName] || [];

    prices = prices.filter(item => qualities.includes(item.quality));

    let normalized: { [key: string]: Item } = {};

    if (state.settings.expert.useMinPricesNormalization) {
      normalized = normalizeItemBySellPriceMin(prices);
    } else {
      normalized = normalizeItemsByMaxPriceFromMinPrices(prices);
    }

    return normalized;
  },

  /**
   * Get artefact
   *
   * @param state - vuex state
   */
  getArtefacts: (state: TreeState) => {
    const itemName = state.currentItemInfo.name;
    const city = state.settings.cities.artefacts;
    const artefacts = state.artefacts[city][itemName] || {};

    return artefacts;
  },

  /**
   * Get item craft recipe
   *
   * @param state - vuex state
   */
  getRecipe: (state: TreeState) => {
    const itemName = state.currentItemInfo.name;
    const recipe = state.recipes[itemName] || {};

    return recipe;
  },

  /**
   * Get resource prices for current city
   *
   * @param state - vuex state
   */
  getFirstResources: (state: TreeState) => {
    const city = state.settings.cities.resourcesFirstLocation;
    const resources = state.resources[city] || {};

    return resources;
  },

  /**
   * Get resource prices for current city
   *
   * @param state - vuex state
   */
  getSecondResources: (state: TreeState) => {
    const city = state.settings.cities.resourcesSecondLocation;
    const resources = state.resources[city] || {};

    return resources;
  },

  /**
   * Get empty journal prices for current city and root
   *
   * @param state - vuex state
   */
  getEmptyJournals: (state: TreeState) => {
    const city = state.settings.cities.journals;
    const root = state.currentItemInfo.root;
    let journals = state.journals[city][root] || {};

    journals = Object.fromEntries(Object.entries(journals).filter(([name, value]) => name.includes('EMPTY')));

    return journals;
  },

  /**
   * Get full journal prices for current city and root
   *
   * @param state - vuex state
   */
  getFullJournals: (state: TreeState) => {
    const city = state.settings.cities.journals;
    const root = state.currentItemInfo.root;
    let journals = state.journals[city][root] || {};

    journals = Object.fromEntries(Object.entries(journals).filter(([name, value]) => name.includes('FULL')));

    return journals;
  },

  /**
   * Get average data: average price and average number of items sold per day
   *
   * @param state - vuex state
   */
  getAverageData: (state: TreeState) => {
    const city = state.settings.cities.sellItems;
    const itemName = state.currentItemInfo.name;
    const averageData = state.averageData[city][itemName] || {};

    return averageData;
  },

  /**
   * Heart prices
   *
   * @param state - vuex state
   */
  getHearts: (state: TreeState, getters: GetterTree<TreeState, {}>) => {
    const city = state.settings.cities.hearts;
    const itemName = state.currentItemInfo.name;
    const heartName = getHeartNameByItemName(itemName);

    const hearts = state.hearts[city] || {};

    return hearts;
  },

  /**
   * Hearts of cities for some special items such as capes
   *
   * @param state - vuex state
   */
  areHeartsNeeded: (state: TreeState): boolean => {
    return state.currentItemInfo.name.includes('CAPEITEM');
  },

  getHeartName: (state: TreeState): string => {
    const itemName = state.currentItemInfo.name;

    return getHeartNameByItemName(itemName);
  },

  /**
   * Get text of loading
   *
   * @param state - vuex state
   */
  loadingText: (state: TreeState) => {
    return state.features.loadingText;
  },

  /**
   * Is all neccessary data loaded
   *
   * @param state - vuex state
   */
  isLoaded: (state: TreeState) => {
    return state.features.loadingText == 'calculated'
  },

  /**
   * Returns the percentage of materials returned
   * for profile cities
   */
  returnMaterialPercentage: (state: TreeState): number => {
    if (state.settings.expert.useOwnPercentage) {
      return state.settings.returnPercentage;
    }

    const parentItem = state.currentItemInfo.parent;
    const itemName = state.currentItemInfo.name;
    const city = state.settings.cities.craftItems;
    const useFocus = state.settings.useFocus;

    const hasProductionBonus = getDoesItemHaveProductionBonusForCity(city === 'Caerleon' ? itemName : parentItem, city);

    if (hasProductionBonus) {
      return useFocus ? 47.9 : 24.8
    } else {
      return useFocus ? 43.5 : 15.2;
    }
  },

  /**
   * Is the current item an artifact?
   *
   * @param state - vuex state
   */
  isArtifactItem: (state: TreeState): boolean => {
    return isArtifactItem(state.currentItemInfo.name);
  },


  /**
   * Get an artifact name
   *
   * @param state - vuex state
   * @param getters - vuex getters
   * @param tier - tier of artifact to return
   * @return artifact name
   */
  getArtifactName: (state: TreeState, getters: GetterTree<TreeState, {}>) => (tier: number): string => {
    if (!getters.isArtifactItem) {
      return '';
    }

    const itemName = state.currentItemInfo.name;
    let artifactName = `T${tier}_ARTEFACT${itemName.slice(2)}`;

    if (itemName.includes('ROYAL')) {
      artifactName = `QUESTITEM_TOKEN_ROYAL_T${tier}`
    } else if (itemName.includes('INSIGHT')) {
      artifactName = `T4_SKILLBOOK_STANDARD`;
    } else if (itemName.includes('CAPEITEM')) {
      artifactName = `T${tier}_${itemName.slice(3)}_BP`;
    }

    return artifactName;
  },

  /**
   * Get journal name of current item neede tier
   * @param state
   */
  getJournalName: (state: TreeState) => (tier: number): string => {
    return `T${tier}_JOURNAL${state.currentItemInfo.root.slice(4)}`
  },

  getRecipeForItemsNeededToCraft: (state: TreeState, getters): Recipe => {
    // TODO: get from settings
    const itemsMultiplier = state.settings.itemsMultiplier;
    const recipe = cloneDeep(getters.getRecipe as Recipe);
    const returnMaterialPercentage = getters.returnMaterialPercentage as number;
    // const numberOfItemsRequiredWithReturnPercentage = (100 - returnMaterialPercentage) / 100 * itemsMultiplier;

    const getMaxCraftedItems = (initialNumberOfItems: number) => {
      if (returnMaterialPercentage >= 100) return Infinity;

      // get the number of items crafted in the "index" round
      const getSeriesValue = (index: number) => Math.floor(initialNumberOfItems * ((returnMaterialPercentage / 100) ** index));

      let index = 0;
      let maxCraftedItems = 0;

      while (getSeriesValue(index) > 0 && isFinite(getSeriesValue(index))) {
        maxCraftedItems += getSeriesValue(index);

        index++;

        // In case of infinite recursion
        if (index > 100) break;
      }

      return maxCraftedItems;
    }

    // binary search by answer
    // https://en.wikipedia.org/wiki/Binary_search_algorithm
    const findInitialNumberOfItems = () => {
      let leftBoundary = 0;
      let rightBoundary = itemsMultiplier + 1;
      let suggestedInitialItems = Math.floor((leftBoundary + rightBoundary) / 2);

      let maxCraftedItemsSuggestion = getMaxCraftedItems(suggestedInitialItems);
      let maxCraftedItemsPrev = getMaxCraftedItems(suggestedInitialItems - 1);

      do {
        suggestedInitialItems = Math.floor((leftBoundary + rightBoundary) / 2);
        maxCraftedItemsSuggestion = getMaxCraftedItems(suggestedInitialItems);
        maxCraftedItemsPrev = getMaxCraftedItems(suggestedInitialItems - 1);

        if (!isFinite(maxCraftedItemsSuggestion)) {
          suggestedInitialItems = 1;
          break;
        }

        if (maxCraftedItemsSuggestion <= itemsMultiplier) {
          leftBoundary = suggestedInitialItems;
        } else {
          rightBoundary = suggestedInitialItems;
        }
      } while (!(maxCraftedItemsSuggestion >= itemsMultiplier && maxCraftedItemsPrev < itemsMultiplier) && maxCraftedItemsSuggestion !== maxCraftedItemsPrev);

      return suggestedInitialItems;
    }

    const numberOfRequiredItems = findInitialNumberOfItems();

    for (let key in recipe) {
      const numberOfMaterials = recipe[key as keyof Recipe];

      if (!numberOfMaterials) {
        continue;
      }

      recipe[key as keyof Recipe] = numberOfMaterials * numberOfRequiredItems;
    }

    return recipe || {};
  }
}
