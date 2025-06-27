import request from '@/utils/request'

/**
 * 获取用户地址列表
 */
export function getAddressList() {
  return request({
    url: '/pc/user/address/list',
    method: 'get'
  })
}

/**
 * 添加用户地址
 * @param {object} data 地址数据
 */
export function addAddress(data) {
  return request({
    url: '/pc/user/address/add',
    method: 'post',
    data
  })
}

/**
 * 编辑用户地址
 * @param {object} data 地址数据
 */
export function editAddress(data) {
  return request({
    url: '/pc/user/address/edit',
    method: 'post',
    data
  })
}

/**
 * 删除用户地址
 * @param {number} id 地址ID
 */
export function deleteAddress(id) {
  return request({
    url: `/pc/user/address/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取地址详情
 * @param {number} id 地址ID
 */
export function getAddressDetail(id) {
  return request({
    url: `/pc/address/detail/${id}`,
    method: 'get'
  })
}

/**
 * 获取默认地址
 */
export function getDefaultAddress() {
  return request({
    url: '/pc/address/get/default',
    method: 'get'
  })
}

/**
 * 设置默认地址
 * @param {number} id 地址ID
 */
export function setDefaultAddress(id) {
  return request({
    url: `/pc/address/set/default/${id}`,
    method: 'post'
  })
}
