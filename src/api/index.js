import Api from './api'

const HttpMethodsEnum = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
}

const api = new Api()

export default api
export {
  api,
  HttpMethodsEnum
}
