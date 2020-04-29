import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {createStringOfAllTiers, createStringOfAllResources, createStringOfAllArtefacts, createStringOfAllJournals} from './utils'
import {ResponseModel, RootState} from './typeDefs'

Vue.use(Vuex)

const cities = {
  'Caerleon': {},
  'Bridgewatch': {},
  'Fort Sterling': {},
  'Lymhurst': {},
  'Martlock': {},
  'Thetford': {},
}
const store = () => new Vuex.Store({
  state: {
    tree: [],
    prices: {},
    recipes: {},
    resources: JSON.parse(JSON.stringify(cities)),
    artefacts: JSON.parse(JSON.stringify(cities)),
    journals: JSON.parse(JSON.stringify(cities))
  } as RootState,
  actions: {
    async FETCH_STATE({commit}){
      const tree = await axios.get('/json/tree.json');
      const recipes = await axios.get('/json/recipes.json');
      commit('SET_STATE', {
        'tree': tree.data,
        'recipes': recipes.data
      });
    },

    /**
     * 
     * @param itemName - name of item's group
     * @param location - city or Black Market 
     */
    async FETCH_ITEM_PRICE({commit, state, dispatch}, {itemName, location}) {
      const allNames: string = createStringOfAllTiers(itemName);
      const artefacts = ['UNDEAD', 'KEEPER', 'HELL', 'MORGANA', 'AVALON'];

      await axios
        .get(`https://www.albion-online-data.com/api/v2/stats/prices/${allNames}?locations=${location}&qualities=1,2,3`)
        .then(response => {
          const data = response.data;
          
          commit('SET_ITEM_PRICE', {
            'baseItem': itemName,
            'location': location,
            'data': data
          });
        });

      if (artefacts.some(artefact => itemName.search(artefact) != -1)){
        await dispatch('FETCH_ARTEFACT_PRICES', {
          'itemName': itemName,
          'location': location
        })
      }
    },

    /**
     * Fetch price for current item with all tiers and subtiers
     * @param commit - vuex commit
     * @param location - city
     */
    async FETCH_RESOURCE_PRICES({commit}, location) {
      const resources = ['CLOTH', 'LEATHER', 'PLANKS', 'METALBAR'];
      let allNames = resources.reduce((acc, resource) => {
        acc = acc + createStringOfAllResources(resource) + ',';

        return acc;
      }, '').slice(0, -1);

      if (location == 'Black Market') {
        location = 'Caerleon';
      }

      await axios
        .get(`https://www.albion-online-data.com/api/v2/stats/prices/${allNames}?locations=${location}`)
        .then(response => {
          const data = response.data;

          commit('SET_RESOURCE_PRICES', data);
        });
    },

    /**
     * Fetch t4-t8 artifacts for current item 
     * @param commit - vuex commit 
     * @param itemName - current item
     * @param location - city 
     */
    async FETCH_ARTEFACT_PRICES({commit}, {itemName, location}) {
      let allNames = createStringOfAllArtefacts(itemName);

      if (location == 'Black Market') {
        location = 'Caerleon';
      }

      await axios
        .get(`https://www.albion-online-data.com/api/v2/stats/prices/${allNames}?locations=${location}`)
        .then(response => {
          const data = response.data;

          commit('SET_ARTEFACT_PRICES', {
            'data': data,
            'itemName': itemName
          });
        });
    },

    /**
     * Fetch t4-t8 empty and full journal prices
     * 
     * @param commit - vuex commit 
     * @param itemName - current item
     * @param root - journals branch: ROOT_WARRIOR etc. 
     */
    async FETCH_JOURNAL_PRICES({commit}, {location, root}) {
      let allNames = createStringOfAllJournals(root);

      if (location == 'Black Market') {
        location = 'Caerleon';
      }

      await axios
        .get(`https://www.albion-online-data.com/api/v2/stats/prices/${allNames}?locations=${location}`)
        .then(response => {
          const data = response.data;
          
          commit('SET_JOURNAL_PRICES', {
            'data': data,
            'root': root
          })
        });
    }
  },
  mutations: {
    SET_STATE(state, {tree, recipes}) {
      state.tree = tree;
      state.recipes = recipes;
    },

    /**
     * 
     * @param state - vuex state
     * @param baseItem - t4 item of the section: T4_SHOES_PLATE_SET1 etc.
     * @param location - selected city
     * @param data - api response
     */
    SET_ITEM_PRICE(state, {baseItem, location, data}) {

      if (!state.prices[baseItem]) {
        state.prices[baseItem] = {};
      }
      state.prices[baseItem][location] = {};

      data.forEach((item: ResponseModel) => {
          if (!state.prices[baseItem][location][item.item_id]) {
            state.prices[baseItem][location][item.item_id] = {
              price: 0,
              date: ''
            };
          }
          const currentPrice = state.prices[baseItem][location][item.item_id].price;
          // choose the minimun no zero price
          
          let minPrice = 0;
          let date = item.sell_price_min_date;
          if (currentPrice == 0) {
            minPrice = item.sell_price_min
          } else if (item.sell_price_min == 0) {
            minPrice = currentPrice;
          } else {
            minPrice = Math.min(currentPrice, item.sell_price_min)
          }

          if (location == 'Black Market') {
            minPrice = Math.max(minPrice, item.buy_price_max);
            date = item.buy_price_max_date;
          }

          state.prices[baseItem][location][item.item_id].price = minPrice;
          state.prices[baseItem][location][item.item_id].date = date;
      });
    },

    /**
     * Set resource prices to state
     * @param state - vuex state
     * @param data - api response
     */
    SET_RESOURCE_PRICES(state, data) {
      data.forEach((resource: ResponseModel) => {
        state.resources[resource.city][resource.item_id] = {
          price: resource.sell_price_min
        }
      })
    },
    /**
     * Set artefact prices for current location and item
     * @param state - vuex state
     * @param data - api response
     * @param itemName - t4 item name: T4_SHOES_PLATE_SET1 etc.
     */
    SET_ARTEFACT_PRICES(state, {data, itemName}) {
      data.forEach((artefact: ResponseModel) => {
        if (!state.artefacts[artefact.city][itemName]){
          state.artefacts[artefact.city][itemName] = {};
        }

        state.artefacts[artefact.city][itemName][artefact.item_id] = {
          price: artefact.sell_price_min
        }
      })
    },

    /**
     * 
     * @param state 
     * @param data - api response
     * @param root - journal branch: 'ROOT_WARRIOR' etc. 
     */
    SET_JOURNAL_PRICES(state, {data, root}) {
      data.forEach((journal: ResponseModel) => {
        const journalName = journal.item_id.slice(0, journal.item_id.lastIndexOf('_'));

        if (!state.journals[journal.city][root]) {
          state.journals[journal.city][root] = {};
        }

        if (!state.journals[journal.city][root][journalName]) {
          state.journals[journal.city][root][journalName] = {
            buyPrice: 0,
            sellPrice: 0
          }
        }

        if (journal.item_id.slice(-4) == 'FULL'){
          state.journals[journal.city][root][journalName].sellPrice = journal.sell_price_min;
        } else {
          state.journals[journal.city][root][journalName].buyPrice = journal.sell_price_min;
        }
      })
    }
  }
});

export default store;