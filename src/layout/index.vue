<template>
  <div class="app-wrapper">
    <!-- 顶部导航 -->
    <div class="navbar-container">
      <navbar />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <div class="content-wrapper">
        <!-- 面包屑导航 -->
        <breadcrumb v-if="showBreadcrumb" class="breadcrumb-container" />

        <!-- 页面内容 -->
        <div class="app-main">
          <transition name="fade-transform" mode="out-in">
            <router-view :key="key" />
          </transition>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer-container">
      <app-footer />
    </div>

    <!-- 返回顶部 -->
    <el-backtop target=".app-wrapper" />

    <!-- 购物车悬浮球 -->
    <cart-float />
  </div>
</template>

<script>
import { Navbar, AppFooter, Breadcrumb, CartFloat } from './components'
import { mapGetters } from 'vuex'

export default {
  name: 'Layout',
  components: {
    Navbar,
    AppFooter,
    Breadcrumb,
    CartFloat
  },
  computed: {
    ...mapGetters(['sidebar']),
    key() {
      return this.$route.path
    },
    showBreadcrumb() {
      // 首页不显示面包屑
      return this.$route.path !== '/home'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.navbar-container {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-container {
  flex: 1;
  background-color: #f5f5f5;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-container {
  padding: 15px 0;
}

.app-main {
  min-height: calc(100vh - 180px);
  padding-bottom: 20px;
}

.footer-container {
  background-color: #2c3e50;
  color: white;
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
