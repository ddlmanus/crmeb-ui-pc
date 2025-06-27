import { login, logout, getUserInfo } from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  userInfo: {},
  avatar: '',
  nickname: '',
  phone: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
    state.nickname = userInfo.nickname || ''
    state.phone = userInfo.phone || ''
    state.avatar = userInfo.avatar || ''
  },
  CLEAR_USER: (state) => {
    state.token = ''
    state.userInfo = {}
    state.avatar = ''
    state.nickname = ''
    state.phone = ''
  }
}

const actions = {
  // 用户登录
  login({ commit }, loginData) {
    return new Promise((resolve, reject) => {
      // 如果传入的是新的token格式（包含token和userInfo）
      if (loginData.token && loginData.userInfo) {
        commit('SET_TOKEN', loginData.token)
        commit('SET_USER_INFO', loginData.userInfo)
        setToken(loginData.token)
        resolve(loginData)
        return
      }

      // 兼容旧的登录方式
      login(loginData).then(response => {
        const { data } = response
        if (data && data.token) {
          commit('SET_TOKEN', data.token)
          commit('SET_USER_INFO', data)
          setToken(data.token)
          resolve(data)
        } else {
          reject(new Error('登录失败'))
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getUserInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(response => {
        const { data } = response
        if (data) {
          commit('SET_USER_INFO', data.userInfo || data)
          resolve(data)
        } else {
          reject(new Error('获取用户信息失败'))
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户登出
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit('CLEAR_USER')
        removeToken()
        resolve()
      }).catch(error => {
        // 即使登出接口失败，也要清除本地状态
        commit('CLEAR_USER')
        removeToken()
        resolve()
      })
    })
  },

  // 移除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('CLEAR_USER')
      removeToken()
      resolve()
    })
  },

  // 动态修改权限
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getUserInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

const getters = {
  token: state => state.token,
  userInfo: state => state.userInfo,
  nickname: state => state.nickname,
  phone: state => state.phone,
  avatar: state => state.avatar
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
