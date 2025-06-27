import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? '/api'  // 开发环境使用代理
    : 'http://localhost:20002/api', // 生产环境直接指向后端
  timeout: 15000 // 增加超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token - 后端返回什么就直接使用什么，不添加任何前缀
    if (getToken()) {
      config.headers['Authori-zation'] = getToken()
    }
    
    // 添加常用请求头
    config.headers['Content-Type'] = 'application/json'
    
    console.log('发送请求:', config.method.toUpperCase(), config.url, config.data || config.params)
    
    return config
  },
  error => {
    console.log('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('收到响应:', response.config.url, response.data)
    
    const res = response.data
    
    // 兼容不同的响应格式
    if (res.code !== undefined) {
      // 标准格式：{ code: 200, data: {}, message: '' }
      if (res.code !== 200) {
        Message({
          message: res.message || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(res.message || 'Error'))
      } else {
        return res
      }
    } else {
      // 直接返回数据格式
      return { code: 200, data: res, message: 'success' }
    }
  },
  error => {
    console.log('响应错误:', error)
    
    let message = '网络错误'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 501:
          message = '服务未实现'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        case 505:
          message = 'HTTP版本不受支持'
          break
        default:
          message = error.response.data?.message || '网络错误'
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    }
    
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 