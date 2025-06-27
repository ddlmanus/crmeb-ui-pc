import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

export function setUserInfo(userInfo) {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

export function removeUserInfo() {
  localStorage.removeItem('userInfo')
} 