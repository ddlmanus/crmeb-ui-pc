import request from '@/api/request'

/**
 * 用户登录 - 支持密码和验证码登录
 * @param {object} data 登录数据 {phone, password?, code?}
 */
export function login(data) {
  return request({
    url: '/pc/user/login',
    method: 'post',
    data
  })
}

/**
 * 用户登录 - 纯token版本（不加Bearer前缀）
 * @param {object} data 登录数据 {phone, password?, code?}
 */
export function loginPure(data) {
  return request({
    url: '/pc/user/login-pure',
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
 * 修改用户信息
 * @param {object} data 用户信息
 */
export function updateUserInfo(data) {
  return request({
    url: '/pc/user/update',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 * @param {Object} data 注册数据
 * @param {string} data.phone 手机号
 * @param {string} data.captcha 短信验证码
 * @param {string} data.password 密码
 */
export function register(data) {
  return request({
    url: '/pc/user/register',
    method: 'post',
    data
  })
}

/**
 * 发送短信验证码
 * @param {Object} data 
 * @param {string} data.phone 手机号
 * @param {string} data.type 类型：login-登录 register-注册 forget-忘记密码
 */
export function sendSmsCode(data) {
  return request({
    url: '/pc/user/send-sms',
    method: 'post',
    data
  })
}

/**
 * 刷新token
 */
export function refreshToken() {
  return request({
    url: '/pc/user/refresh-token',
    method: 'post'
  })
}

/**
 * 修改密码
 * @param {Object} data
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 */
export function changePassword(data) {
  return request({
    url: '/pc/user/change-password',
    method: 'post',
    data
  })
}

/**
 * 重置密码
 * @param {Object} data
 * @param {string} data.phone 手机号
 * @param {string} data.captcha 验证码
 * @param {string} data.newPassword 新密码
 */
export function resetPassword(data) {
  return request({
    url: '/pc/user/reset-password',
    method: 'post',
    data
  })
} 