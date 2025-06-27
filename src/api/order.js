import request from '@/utils/request'

/**
 * 购物车计算价格
 * @param {Array} cartIds 购物车ID数组
 */
export function calculateCartPrice(cartIds) {
  return request({
    url: '/pc/cart/calculate/price',
    method: 'post',
    data: {
      ids: cartIds
    }
  })
}

/**
 * 获取订单预览信息
 * @param {Object} params 参数
 */
// 预下单
export function preOrder(data) {
  return request({
    url: '/pc/order/pre/order',
    method: 'post',
    data
  })
}

// 加载预下单信息
export function loadPreOrder(preOrderNo) {
  return request({
    url: `/pc/order/load/pre/${preOrderNo}`,
    method: 'get'
  })
}

// 计算订单价格
export function computedOrderPrice(data) {
  return request({
    url: '/pc/order/computed/price',
    method: 'post',
    data
  })
}

/**
 * 创建订单
 * @param {Object} data 订单数据
 */
export function createOrder(data) {
  return request({
    url: '/pc/order/create',
    method: 'post',
    data
  })
}

/**
 * 获取订单列表
 * @param {Object} params 查询参数
 */
export function getOrderList(params) {
  return request({
    url: '/pc/order/list',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {string} orderSn 订单号
 */
export function getOrderDetail(orderSn) {
  return request({
    url: `/pc/order/detail/${orderSn}`,
    method: 'get'
  })
}

/**
 * 取消订单
 * @param {string} orderSn 订单号
 */
export function cancelOrder(orderSn) {
  return request({
    url: `/pc/order/cancel/${orderSn}`,
    method: 'post'
  })
}

/**
 * 删除订单
 * @param {string} orderSn 订单号
 */
export function deleteOrder(orderSn) {
  return request({
    url: `/pc/order/delete/${orderSn}`,
    method: 'post'
  })
}

/**
 * 确认收货
 * @param {string} orderSn 订单号
 */
export function confirmOrder(orderSn) {
  return request({
    url: `/pc/order/take/delivery/${orderSn}`,
    method: 'post'
  })
}

/**
 * 订单支付
 * @param {Object} data 支付数据
 */
export function payOrder(data) {
  return request({
    url: '/pc/order/pay',
    method: 'post',
    data
  })
}

/**
 * 获取用户地址列表
 */
export function getUserAddressList() {
  return request({
    url: '/pc/user/address/list',
    method: 'get'
  })
}

/**
 * 获取可用优惠券
 * @param {Object} params 参数
 */
export function getAvailableCoupons(params) {
  return request({
    url: '/pc/user/coupon/available',
    method: 'get',
    params
  })
}
