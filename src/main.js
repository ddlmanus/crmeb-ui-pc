import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 引入全局样式
import 'normalize.css/normalize.css'

// 引入懒加载
import VueLazyload from 'vue-lazyload'

// 引入轮播图
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

// 引入meta
import VueMeta from 'vue-meta'

Vue.use(ElementUI)
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: '/default-image.png',
  loading: '/loading.gif',
  attempt: 1
})
Vue.use(VueAwesomeSwiper)
Vue.use(VueMeta)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
