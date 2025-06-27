import request from '@/utils/request'

// 获取优惠券分页列表（优惠券中心）
export function getCouponList(params) {
  return request({
    url: '/pc/coupon/page/list',
    method: 'get',
    params
  })
}

// 获取我的优惠券列表（使用正确的接口路径和参数）
export function getMyCoupons(params) {
  return request({
    url: '/pc/coupon/user/list',
    method: 'get',
    params
  })
}

// 获取用户优惠券列表（保持兼容性，实际调用getMyCoupons）
export function getUserCoupons(params) {
  // 将前端状态参数映射为后端要求的type参数
  let type = 'all'
  if (params.status) {
    switch (params.status) {
      case 'unused':
        type = 'usable'
        break
      case 'used':
      case 'expired':
        type = 'unusable'
        break
      default:
        type = 'all'
    }
  }
  
  const backendParams = {
    ...params,
    type: type
  }
  delete backendParams.status // 删除前端参数，使用后端要求的参数

  return request({
    url: '/pc/coupon/user/list',
    method: 'get',
    params: backendParams
  })
}

// 领取优惠券
export function receiveCoupon(id) {
  return request({
    url: `/pc/coupon/receive/${id}`,
    method: 'post'
  })
}

// 获取优惠券领券中心（确保传递必须的category参数）
export function getCouponCenter(params) {
  // 确保category参数存在，默认为0（所有优惠券）
  const requestParams = {
    category: 0,
    ...params
  }
  
  return request({
    url: '/pc/coupon/voucher/collection/center',
    method: 'get',
    params: requestParams
  })
}

// 获取当前订单可用优惠券
export function getOrderCoupons(params) {
  return request({
    url: '/pc/coupon/order/list',
    method: 'get',
    params
  })
}

// 获取优惠券适用的商品列表
export function getCouponProducts(params) {
  return request({
    url: '/pc/product/coupon/pro/list',
    method: 'get',
    params
  })
}

// 获取系统优惠券商品列表
export function getSystemCouponProducts(params) {
  return request({
    url: '/pc/product/system/coupon/pro/list',
    method: 'get',
    params
  })
}
