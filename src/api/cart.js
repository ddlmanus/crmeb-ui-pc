import request from '@/utils/request'

/**
 * 获取购物车列表
 * @param {boolean} isValid 是否只获取有效商品
 */
export function getCartList(isValid = true) {
  return request({
    url: '/pc/cart/list',
    method: 'get',
    params: { isValid }
  })
}

/**
 * 添加商品到购物车
 * @param {object} data 购物车数据
 * @param {number} data.productId 商品ID
 * @param {number} data.productAttrUnique 商品规格ID
 * @param {number} data.cartNum 商品数量
 */
export function addCartItem(data) {
  return request({
    url: '/pc/cart/add',
    method: 'post',
    data: {
      productId: data.productId,
      productAttrUnique: data.productAttrUnique || data.skuId,
      cartNum: data.quantity || data.cartNum
    }
  })
}

/**
 * 更新购物车商品数量
 * @param {number} cartId 购物车ID
 * @param {number} quantity 数量
 */
export function updateCartItem(cartId, quantity) {
  return request({
    url: `/pc/cart/update/${cartId}`,
    method: 'post',
    params: { quantity }
  })
}

// 购物车页面需要的函数别名
export const updateCartNum = updateCartItem

/**
 * 删除购物车商品
 * @param {array} ids 购物车ID数组
 */
export function removeCartItems(ids) {
  return request({
    url: '/pc/cart/delete',
    method: 'post',
    data: { ids }
  })
}

// 购物车页面需要的函数别名
export const deleteCart = removeCartItems

/**
 * 获取购物车商品数量
 * @param {string} type 数量类型：total-商品数量，sum-购物数量
 * @param {boolean} numType 商品类型：true-有效商品，false-无效商品
 */
export function getCartCount(type = 'sum', numType = true) {
  return request({
    url: '/pc/cart/count',
    method: 'get',
    params: { type, numType }
  })
}

/**
 * 计算购物车价格
 * @param {array} ids 购物车ID数组
 */
export function calculateCartPrice(ids) {
  return request({
    url: '/pc/cart/calculate',
    method: 'post',
    data: { ids }
  })
}
