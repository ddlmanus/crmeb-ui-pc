import request from '@/utils/request'

/**
 * 获取支付配置
 */
export function getPayConfig() {
  return request({
    url: '/pc/pay/get/config',
    method: 'get'
  })
}

/**
 * 订单支付
 * @param {Object} data 支付请求数据
 * @param {string} data.orderNo 订单号
 * @param {string} data.payType 支付方式 weixin|alipay|yue
 * @param {string} data.from 来源 pc|h5|wechat
 */
export function orderPayment(data) {
  return request({
    url: '/pc/pay/payment',
    method: 'post',
    data
  })
}

/**
 * 查询微信支付结果
 * @param {string} orderNo 订单号
 */
export function queryWechatPayResult(orderNo) {
  return request({
    url: `/pc/pay/query/wechat/pay/result/${orderNo}`,
    method: 'get'
  })
}

/**
 * 查询支付宝支付结果
 * @param {string} orderNo 订单号
 */
export function queryAliPayResult(orderNo) {
  return request({
    url: `/pc/pay/query/ali/pay/result/${orderNo}`,
    method: 'get'
  })
}

/**
 * 获取收银台信息
 * @param {string} orderNo 订单号
 */
export function getCashierInfo(orderNo) {
  return request({
    url: `/pc/pay/get/cashier/${orderNo}`,
    method: 'get'
  })
}

/**
 * 查询微信支付结果（通用）
 * @param {Object} params 查询参数
 */
export function queryWechatPaymentResult(params) {
  return request({
    url: '/pc/pay/query/wechat/payment/result',
    method: 'get',
    params
  })
} 