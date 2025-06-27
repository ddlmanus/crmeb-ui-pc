import request from '@/api/request'

/**
 * 获取首页完整数据
 */
export function getHomeData() {
  return request({
    url: '/pc/index/data',
    method: 'get'
  })
}

/**
 * 获取轮播图
 */
export function getBannerList() {
  return request({
    url: '/pc/index/banner',
    method: 'get'
  })
}

/**
 * 获取商品分类
 */
export function getCategoryList() {
  return request({
    url: '/pc/index/categories',
    method: 'get'
  })
}

/**
 * 获取快捷导航
 */
export function getQuickNav() {
  return request({
    url: '/pc/index/quick-nav',
    method: 'get'
  })
}

/**
 * 获取热门搜索关键词
 */
export function getHotKeywords() {
  return request({
    url: '/pc/index/hot-keywords',
    method: 'get'
  })
}

/**
 * 获取推荐商品
 * @param {number} limit 商品数量
 */
export function getRecommendProducts(limit = 12) {
  return request({
    url: '/pc/index/recommend-products',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取热销商品
 * @param {number} limit 商品数量
 */
export function getHotProducts(limit = 12) {
  return request({
    url: '/pc/index/hot-products',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取新品商品
 * @param {number} limit 商品数量
 */
export function getNewProducts(limit = 12) {
  return request({
    url: '/pc/index/new-products',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取秒杀商品
 */
export function getSeckillProducts() {
  return request({
    url: '/pc/index/seckill/info',
    method: 'get'
  })
}

/**
 * 获取首页头条新闻
 */
export function getHeadline() {
  return request({
    url: '/pc/index/headline',
    method: 'get'
  })
}

/**
 * 搜索建议
 * @param {string} keyword 关键词
 */
export function getSearchSuggestions(keyword) {
  return request({
    url: '/pc/index/search-suggestions',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 获取底部导航信息
 */
export function getBottomNavigation() {
  return request({
    url: '/pc/index/get/bottom/navigation',
    method: 'get'
  })
}
