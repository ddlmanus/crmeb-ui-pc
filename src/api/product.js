import request from '@/api/request'

/**
 * 获取商品详情
 * @param {number} productId 商品ID
 */
export function getProductDetail(productId) {
  return request({
    url: `/pc/product/detail/${productId}`,
    method: 'get'
  })
}

/**
 * 获取商品列表
 * @param {object} params 查询参数
 */
export function getProductList(params) {
  return request({
    url: '/pc/product/list',
    method: 'get',
    params
  })
}

/**
 * 搜索商品
 * @param {object} params 搜索参数
 */
export function searchProducts(params) {
  return request({
    url: '/pc/product/search',
    method: 'get',
    params
  })
}

/**
 * 获取商品分类列表
 * @param {object} params 查询参数
 */
export function getProductCategories(params) {
  return request({
    url: '/pc/product/categories',
    method: 'get',
    params
  })
}

/**
 * 获取商品分类缓存树
 */
export function getCategoryTree() {
  return request({
    url: '/pc/product/category/get/tree',
    method: 'get'
  })
}

/**
 * 获取第三级商品分类
 * @param {number} id 分类ID
 */
export function getThirdCategory(id) {
  return request({
    url: `/pc/product/category/get/third/${id}`,
    method: 'get'
  })
}

/**
 * 根据分类ID获取商品
 * @param {number} categoryId 分类ID
 * @param {Object} params 其他查询参数
 */
export function getProductsByCategoryId(categoryId, params = {}) {
  return request({
    url: `/pc/product/category/${categoryId}`,
    method: 'get',
    params
  })
}

/**
 * 获取推荐商品
 * @param {number} limit 商品数量
 */
export function getRecommendProducts(limit = 10) {
  return request({
    url: '/pc/product/recommend',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取热销商品
 * @param {number} limit 商品数量
 */
export function getHotProducts(limit = 10) {
  return request({
    url: '/pc/product/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取新品商品
 * @param {number} limit 商品数量
 */
export function getNewProducts(limit = 10) {
  return request({
    url: '/pc/product/new',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取商品评论列表
 * @param {number} proId 商品ID
 * @param {number} type 评论类型
 * @param {Object} pageParams 分页参数
 */
export function getProductReplyList(proId, type = 0, pageParams = {}) {
  return request({
    url: `/pc/product/reply/${proId}`,
    method: 'get',
    params: { type, ...pageParams }
  })
}

/**
 * 获取商品评论数量
 * @param {number} id 商品ID
 */
export function getProductReplyCount(id) {
  return request({
    url: `/pc/product/reply/count/${id}`,
    method: 'get'
  })
}

/**
 * 获取商品详情评论
 * @param {number} id 商品ID
 */
export function getProductDetailReply(id) {
  return request({
    url: `/pc/product/reply/detail/${id}`,
    method: 'get'
  })
}
