const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  userInfo: state => state.user.userInfo,
  nickname: state => state.user.nickname,
  phone: state => state.user.phone,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  cartCount: state => state.cart.cartCount,
  cartMerchantList: state => state.cart.cartMerchantList,
  allCartItems: state => state.cart.allCartItems,
  cartTotal: state => state.cart.cartTotal,
  categories: state => state.product.categories,
  hotKeywords: state => state.product.hotKeywords
}
export default getters 