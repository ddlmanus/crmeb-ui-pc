import request from '@/utils/request'

/**
 * 获取可申请售后的订单列表
 * @param {Object} params 查询参数
 */
export function getAfterSaleApplyList(params) {
  return request({
    url: '/pc/refund/after/sale/apply/list',
    method: 'get',
    params
  })
}

/**
 * 申请订单退款
 * @param {Object} data 退款申请数据
 * @param {string} data.orderNo 订单号
 * @param {number} data.orderDetailId 订单详情ID
 * @param {string} data.refundType 退款类型 1=仅退款,2=退货退款
 * @param {string} data.refundReason 退款原因
 * @param {string} data.refundReasonDetail 退款原因详细说明
 * @param {number} data.refundPrice 退款金额
 * @param {Array} data.refundImages 退款凭证图片
 */
export function applyRefund(data) {
  return request({
    url: '/pc/refund/apply',
    method: 'post',
    data
  })
}

/**
 * 获取退款理由列表
 */
export function getRefundReasons() {
  return request({
    url: '/pc/refund/reason',
    method: 'get'
  })
}

/**
 * 获取退款订单详情
 * @param {string} refundOrderNo 退款订单号
 */
export function getRefundOrderDetail(refundOrderNo) {
  return request({
    url: `/pc/refund/detail/${refundOrderNo}`,
    method: 'get'
  })
}

/**
 * 获取退款订单列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.limit 每页数量
 * @param {string} params.status 状态
 */
export function getRefundOrderList(params) {
  return request({
    url: '/pc/refund/list',
    method: 'get',
    params
  })
}

/**
 * 退回商品
 * @param {Object} data 退回商品数据
 * @param {string} data.refundOrderNo 退款订单号
 * @param {string} data.expressCompany 快递公司
 * @param {string} data.expressCode 快递单号
 * @param {string} data.remark 备注
 */
export function returningGoods(data) {
  return request({
    url: '/pc/refund/returning/goods',
    method: 'post',
    data
  })
}

/**
 * 撤销退款申请
 * @param {string} refundOrderNo 退款订单号
 */
export function revokeRefund(refundOrderNo) {
  return request({
    url: `/pc/refund/revoke/${refundOrderNo}`,
    method: 'post'
  })
}
