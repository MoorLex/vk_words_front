import { combineReducers, createStore } from 'redux';

export const PLAYERS_UPDATE = 'players/update'
export const USER_UPDATE = 'user/update'
export const STORAGE_UPDATE = 'storage/update'
export const STORAGE_ADD_WORD = 'storage/add_word'

function players(state = [], action){
  switch (action.type) {
    case PLAYERS_UPDATE:
      return [...action.payload.data]
    default:
      return state
  }
}

const INITIAL_STORAGE = {
  words: 0,
  stop: false,
  promo: undefined,
  opponent: undefined,
  connected: false,
  refreshing: false,
  activeModal: null,
  hasWords: false,
  theme: 'light',
  slideIndex: 0,
  extraWords: []
}
function storage(state = INITIAL_STORAGE, action){
  switch (action.type) {
    case STORAGE_UPDATE:
      return {
        ...state,
        ...action.payload.data
      }
    case STORAGE_ADD_WORD:
      return {
        ...state,
        extraWords: [...state.extraWords, action.payload.data]
      }
    default:
      return state
  }
}

const INITIAL_USER = {
  id: 0,
  first_name: '',
  last_name: '',
  photo_100: '',
  country: undefined,
  socket: undefined
}
function user(state = INITIAL_USER, action){
  switch (action.type) {
    case USER_UPDATE:
      return { ...state, ...action.payload.data }
    default:
      return state
  }
}

const stores = combineReducers({
  players,
  storage,
  user
});

export default createStore(stores)

export const actions = {
  playersUpdate(data) {
    return {
      type: PLAYERS_UPDATE,
      payload: { data }
    }
  },
  userUpdate(data) {
    return {
      type: USER_UPDATE,
      payload: { data }
    }
  },
  storageUpdate(data) {
    return {
      type: STORAGE_UPDATE,
      payload: { data }
    }
  },
  storageAddWord(data) {
    return {
      type: STORAGE_ADD_WORD,
      payload: { data }
    }
  }
}
