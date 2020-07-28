import axios from 'axios'
import { HttpMethodsEnum } from './index'
import Observer from './observer'

export default class Api {
  constructor () {
    this.observer = new Observer()
    this.baseUrl =  process.env.REACT_APP_SERVER_URL + '/vk_words'
    this.axios = axios.create({
      baseURL: this.baseUrl
    })
    this.axios.interceptors.request.use((config) => {
      config.requestStartTime = Date.now()
      return config
    })
    this.axios.interceptors.response.use((response) => {
      response.config.requestTime = Date.now() - response.config.requestStartTime
      return response
    })
  }

  async request (method, url, params, headers = {}) {
    this.observer.broadcast('request', { method, url, params, headers })
    const config = {
      method: (method === HttpMethodsEnum.PUT) ? HttpMethodsEnum.POST : method,
      headers: headers,
      url: url + window.location.search
    }
    if (method === HttpMethodsEnum.GET) {
      config.params = params
    } else if (method === HttpMethodsEnum.POST) {
      if (params instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data'
      }
      config.data = params
    } else if (method === HttpMethodsEnum.PUT) {
      config.data = { ...params, _method: 'put' }
    }
    return this.axios.request(config)
  }

  async getBestPlayers () {
    const { data } = await this.request(HttpMethodsEnum.GET, '/best')
    this.observer.broadcast('getBestPlayers', data.data)
    return data.data
  }

  async getUserData (id) {
    const { data } = await this.request(HttpMethodsEnum.GET, '/user/' + id)
    this.observer.broadcast('getUserData', data.data)
    return data.data
  }
}
