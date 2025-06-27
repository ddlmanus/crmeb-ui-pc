import request from '@/api/request'

/**
 * 获取城市区域树形结构列表
 */
export function getCityTreeList() {
  return request({
    url: '/pc/city/list/tree',
    method: 'get'
  })
}

/**
 * 获取省份列表
 */
export function getProvinceList() {
  return request({
    url: '/api/pc/city/province/list',
    method: 'get'
  })
}

/**
 * 获取城市列表
 * @param {number} parentId 省份ID
 */
export function getCityList(parentId) {
  return request({
    url: `/api/pc/city/city/list/${parentId}`,
    method: 'get'
  })
}

/**
 * 获取区/县列表
 * @param {number} parentId 城市ID
 */
export function getDistrictList(parentId) {
  return request({
    url: `/api/pc/city/district/list/${parentId}`,
    method: 'get'
  })
}

/**
 * 获取街道列表
 * @param {number} parentId 区/县ID
 */
export function getStreetList(parentId) {
  return request({
    url: `/pc/city/street/list/${parentId}`,
    method: 'get'
  })
}
