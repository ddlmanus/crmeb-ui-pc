import request from '@/utils/request'

// 测试后端连接 - 获取首页配置
export function testConnection() {
  return request({
    url: '/pc/index/config',
    method: 'get'
  })
}

// 获取首页数据测试
export function getHomeData() {
  return request({
    url: '/pc/index/config',
    method: 'get'
  })
}

// 获取商品分类测试
export function getCategoryTest() {
  return request({
    url: '/pc/index/category',
    method: 'get'
  })
}

// 获取推荐商品测试
export function getRecommendTest() {
  return request({
    url: '/pc/index/recommend',
    method: 'get'
  })
}

// 用户登录测试
export function testLogin(data) {
  return request({
    url: '/pc/user/login',
    method: 'post',
    data
  })
}

// 获取商品列表测试
export function getProductList(params) {
  return request({
    url: '/pc/product/list',
    method: 'get',
    params
  })
} 