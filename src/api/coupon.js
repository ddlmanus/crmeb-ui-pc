import request from '@/utils/request'

// 获取优惠券分页列表（优惠券中心）
export function getCouponList(params) {
  return request({
    url: '/api/pc/coupon/page/list',
    method: 'get',
    params
  })
}

// 获取我的优惠券列表
export function getMyCoupons(params) {
  return request({
    url: '/api/pc/coupon/user/list',
    method: 'get',
    params
  })
}

// 领取优惠券
export function receiveCoupon(id) {
  return request({
    url: `/api/pc/coupon/receive/${id}`,
    method: 'post'
  })
}

// 获取优惠券领券中心
export function getCouponCenter(params) {
  return request({
    url: '/api/pc/coupon/voucher/collection/center',
    method: 'get',
    params
  })
}

// 获取当前订单可用优惠券
export function getOrderCoupons(params) {
  return request({
    url: '/api/pc/coupon/order/list',
    method: 'get',
    params
  })
}

// 获取优惠券适用的商品列表
export function getCouponProducts(params) {
  return request({
    url: '/api/pc/product/coupon/pro/list',
    method: 'get',
    params
  })
}

// 获取系统优惠券商品列表
export function getSystemCouponProducts(params) {
  return request({
    url: '/api/pc/product/system/coupon/pro/list',
    method: 'get',
    params
  })
} 