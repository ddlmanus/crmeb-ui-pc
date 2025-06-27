import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {string} data.phone 手机号
 * @param {string} data.password 密码
 */
export function login(data) {
  return request({
    url: '/pc/user/login',
    method: 'post',
    data
  })
}

/**
 * 用户退出登录
 */
export function logout() {
  return request({
    url: '/pc/user/logout',
    method: 'post'
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/pc/user/info',
    method: 'get'
  })
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data) {
  return request({
    url: '/pc/user/update',
    method: 'post',
    data
  })
}

/**
 * 获取用户地址列表
 */
export function getAddressList() {
  return request({
    url: '/pc/user/address',
    method: 'get'
  })
}

/**
 * 添加用户地址
 */
export function addAddress(data) {
  return request({
    url: '/pc/user/address',
    method: 'post',
    data
  })
}

/**
 * 更新用户地址
 */
export function updateAddress(id, data) {
  return request({
    url: `/pc/user/address/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户地址
 */
export function deleteAddress(id) {
  return request({
    url: `/pc/user/address/${id}`,
    method: 'delete'
  })
}

/**
 * 获取收藏列表
 */
export function getCollectList(params) {
  return request({
    url: '/pc/user/collect',
    method: 'get',
    params
  })
}

/**
 * 获取浏览记录
 */
export function getBrowseHistory(params) {
  return request({
    url: '/pc/user/browse',
    method: 'get',
    params
  })
}

// 获取关于我们信息
export function getAboutUsInfo() {
  return request({
    url: '/pc/user/aboutus/info',
    method: 'get'
  })
} 