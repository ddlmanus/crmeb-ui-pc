import { getProductList, getProductDetail, addToCart, toggleCollect } from '@/api/product'

const state = {
  productList: [],
  productDetail: null,
  categoryList: [],
  searchKeyword: ''
}

const mutations = {
  SET_PRODUCT_LIST: (state, list) => {
    state.productList = list
  },
  SET_PRODUCT_DETAIL: (state, detail) => {
    state.productDetail = detail
  },
  SET_CATEGORY_LIST: (state, list) => {
    state.categoryList = list
  },
  SET_SEARCH_KEYWORD: (state, keyword) => {
    state.searchKeyword = keyword
  }
}

const actions = {
  // 获取商品列表
  async getProductList({ commit }, params) {
    try {
      const res = await getProductList(params)
      commit('SET_PRODUCT_LIST', res.data || [])
      return res
    } catch (error) {
      throw error
    }
  },

  // 获取商品详情
  async getProductDetail({ commit }, id) {
    try {
      const res = await getProductDetail(id)
      commit('SET_PRODUCT_DETAIL', res.data)
      return res
    } catch (error) {
      throw error
    }
  },

  // 添加到购物车
  async addToCart({ commit }, data) {
    try {
      const res = await addToCart(data)
      return res
    } catch (error) {
      throw error
    }
  },

  // 收藏/取消收藏
  async toggleCollect({ commit }, id) {
    try {
      const res = await toggleCollect(id)
      return res
    } catch (error) {
      throw error
    }
  },

  // 设置搜索关键词
  setSearchKeyword({ commit }, keyword) {
    commit('SET_SEARCH_KEYWORD', keyword)
  }
}

const getters = {
  productList: state => state.productList,
  productDetail: state => state.productDetail,
  categoryList: state => state.categoryList,
  searchKeyword: state => state.searchKeyword
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 