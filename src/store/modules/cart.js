import { getCartList, updateCartNum, deleteCart, getCartCount } from '@/api/cart'

const state = {
  cartMerchantList: [],
  cartCount: 0
}

const mutations = {
  SET_CART_LIST: (state, merchantList) => {
    state.cartMerchantList = merchantList
    // 计算总数量
    state.cartCount = 0
    merchantList.forEach(merchant => {
      merchant.cartInfoList.forEach(item => {
        state.cartCount += item.cartNum
      })
    })
  },

  SET_CART_COUNT: (state, count) => {
    state.cartCount = count
  },

  UPDATE_CART_ITEM: (state, { id, cartNum }) => {
    let found = false
    state.cartMerchantList.forEach(merchant => {
      const item = merchant.cartInfoList.find(item => item.id === id)
      if (item) {
        item.cartNum = cartNum
        found = true
      }
    })
    if (found) {
      // 重新计算总数量
      state.cartCount = 0
      state.cartMerchantList.forEach(merchant => {
        merchant.cartInfoList.forEach(item => {
          state.cartCount += item.cartNum
        })
      })
    }
  },

  REMOVE_CART_ITEM: (state, id) => {
    state.cartMerchantList.forEach(merchant => {
      merchant.cartInfoList = merchant.cartInfoList.filter(item => item.id !== id)
    })
    // 移除空的商户
    state.cartMerchantList = state.cartMerchantList.filter(merchant => merchant.cartInfoList.length > 0)
    // 重新计算总数量
    state.cartCount = 0
    state.cartMerchantList.forEach(merchant => {
      merchant.cartInfoList.forEach(item => {
        state.cartCount += item.cartNum
      })
    })
  }
}

const actions = {
  // 获取购物车数量
  async getCartCount({ commit }) {
    try {
      const res = await getCartCount('sum', true)
      if (res.code === 200 && res.data) {
        commit('SET_CART_COUNT', res.data.count || 0)
      }
      return res
    } catch (error) {
      commit('SET_CART_COUNT', 0)
      throw error
    }
  },

  // 获取购物车列表
  async getCartList({ commit }) {
    try {
      const res = await getCartList()
      if (res.code === 200 && res.data) {
        commit('SET_CART_LIST', res.data)
      } else {
        commit('SET_CART_LIST', [])
      }
      return res
    } catch (error) {
      commit('SET_CART_LIST', [])
      throw error
    }
  },

  // 更新购物车商品数量
  async updateCartNum({ commit }, { id, cartNum }) {
    try {
      await updateCartNum(id, cartNum)
      commit('UPDATE_CART_ITEM', { id, cartNum })
    } catch (error) {
      throw error
    }
  },

  // 删除购物车商品
  async removeCartItem({ commit }, id) {
    try {
      await deleteCart([id])
      commit('REMOVE_CART_ITEM', id)
    } catch (error) {
      throw error
    }
  }
}

const getters = {
  cartMerchantList: state => state.cartMerchantList,
  cartCount: state => state.cartCount,

  // 获取扁平的购物车列表
  allCartItems: state => {
    const items = []
    state.cartMerchantList.forEach(merchant => {
      merchant.cartInfoList.forEach(item => {
        items.push({
          ...item,
          merId: merchant.merId,
          merName: merchant.merName
        })
      })
    })
    return items
  },

  // 计算购物车总价
  cartTotal: (state, getters) => {
    return getters.allCartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.cartNum)
    }, 0)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
