import { combineReducers, createStore } from 'redux';

export const PLAYERS_UPDATE = 'players/update'
export const USER_UPDATE = 'user/update'
export const STORAGE_UPDATE = 'storage/update'
export const STORAGE_ADD_WORD = 'storage/add_word'
export const MODALS_USER = 'modals/user'
export const MODALS_INVITE = 'modals/invite'
export const MODALS_WORDS = 'modals/words'
export const MODALS_CLOSE = 'modals/close'
export const POPUP_OPEN = 'popup/open'
export const POPUP_CLOSE = 'popups/close'

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
  promo: undefined,
  opponent: undefined,
  connected: false,
  refreshing: false,
  hasWords: false,
  isBlur: false,
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

const INITIAL_MODALS = {
  active: null,
  data: undefined,
}
function modals(state = INITIAL_MODALS, action){
  switch (action.type) {
    case MODALS_USER:
      return { active: 'modal-user', data: action.payload.data }
    case MODALS_INVITE:
      return { active: 'modal-invite', data: action.payload.data }
    case MODALS_WORDS:
      return { active: 'modal-words', data: action.payload.data }
    case MODALS_CLOSE:
      return { active: null, data: state.data }
    default:
      return state
  }
}

const INITIAL_POPUP = null
function popup(state = INITIAL_POPUP, action){
  switch (action.type) {
    case POPUP_OPEN:
      return action.payload.data
    case POPUP_CLOSE:
      return null
    default:
      return state
  }
}

const stores = combineReducers({
  players,
  storage,
  modals,
  popup,
  user
})
const cs = createStore(stores)

export default cs

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
  },
  showUserModal(data) {
    return {
      type: MODALS_USER,
      payload: { data }
    }
  },
  showInviteModal(data) {
    return {
      type: MODALS_INVITE,
      payload: { data }
    }
  },
  showWordsModal(data) {
    return {
      type: MODALS_WORDS,
      payload: { data }
    }
  },
  closeModal(data) {
    return {
      type: MODALS_CLOSE,
      payload: { data }
    }
  },
  openPopup(data) {
    return {
      type: POPUP_OPEN,
      payload: { data }
    }
  },
  closePopup(data) {
    return {
      type: POPUP_CLOSE,
      payload: { data }
    }
  }
}

export function onBlur () {
  cs.dispatch(actions.storageUpdate({ isBlur: true }))
  setTimeout(() => cs.dispatch(actions.storageUpdate({ isBlur: false })), 20)
}