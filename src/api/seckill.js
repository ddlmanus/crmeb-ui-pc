import request from '@/utils/request'

/**
 * 获取首页秒杀商品信息
 */
export function getSeckillInfo() {
  return request({
    url: '/pc/index/seckill/info',
    method: 'get'
  })
}

/**
 * 获取秒杀时段信息
 */
export function getSeckillTimeInfo() {
  return request({
    url: '/pc/seckill/activity/time/info',
    method: 'get'
  })
}

/**
 * 获取秒杀商品列表
 * @param {Object} params 查询参数
 */
export function getSeckillProductList(params) {
  return request({
    url: '/pc/seckill/product/list',
    method: 'get',
    params
  })
}

/**
 * 获取秒杀商品详情
 * @param {number} id 秒杀商品ID
 */
export function getSeckillProductDetail(id) {
  return request({
    url: `/pc/seckill/product/detail/${id}`,
    method: 'get'
  })
}

/**
 * 秒杀预下单
 * @param {Object} data 预下单数据
 */
export function seckillPreOrder(data) {
  return request({
    url: '/pc/seckill/pre/order',
    method: 'post',
    data
  })
}

/**
 * 秒杀下单
 * @param {Object} data 下单数据
 */
export function seckillOrder(data) {
  return request({
    url: '/pc/seckill/order',
    method: 'post',
    data
  })
} 