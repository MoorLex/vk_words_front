import 'core-js/features/map'
import 'core-js/features/set'
import 'moment/locale/ru';
import registerServiceWorker from './sw'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import store from './store'
import './styles/mian.css'

registerServiceWorker()

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'))
