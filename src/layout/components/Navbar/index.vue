<template>
  <div class="navbar">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="container">
        <div class="top-left">
          <span class="star-icon">⭐</span>
          <span>收藏本站</span>
        </div>
        <div class="top-right">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="link">登录/注册</router-link>
          </template>
          <template v-else>
            <el-dropdown trigger="hover" @command="handleCommand" class="user-dropdown">
              <span class="user-info">
                <i class="el-icon-user"></i>
                {{ displayName }}
                <i class="el-icon-arrow-down"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="center">用户中心</el-dropdown-item>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="order">我的订单</el-dropdown-item>
                <el-dropdown-item command="refund">售后管理</el-dropdown-item>
                <el-dropdown-item command="collect">我的收藏</el-dropdown-item>
                <el-dropdown-item command="address">收货地址</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <span class="divider">|</span>
          <router-link to="/order/list" class="link">我的订单</router-link>
          <span class="divider">|</span>
          <router-link to="/cart" class="link cart-link">
            <i class="el-icon-shopping-cart-2"></i>
            购物车(<span class="cart-count">{{ cartCount }}</span>)
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 主导航栏 -->
    <div class="main-navbar">
      <div class="container">
        <div class="navbar-content">
          <!-- LOGO -->
          <div class="logo">
            <router-link to="/">
              <span class="logo-text">CRMEB</span>
            </router-link>
          </div>
          
          <!-- 主菜单 -->
          <div class="main-menu">
            <div class="menu-item category-menu">
              <i class="el-icon-menu"></i>
              <span>产品分类</span>
              <i class="el-icon-arrow-down"></i>
              <!-- 分类下拉菜单 -->
              <div class="category-dropdown">
                <div class="category-list">
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    class="category-item"
                    @click="goToCategory(category.id)"
                  >
                    <i :class="category.icon"></i>
                    <span>{{ category.name }}</span>
                    <i class="el-icon-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
            <router-link to="/seckill" class="menu-item">限时秒杀</router-link>
            <router-link to="/presale" class="menu-item">限时预售</router-link>
            <router-link to="/news" class="menu-item">新闻列表</router-link>
            <router-link to="/about" class="menu-item">关于我们</router-link>
          </div>
          
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品"
              class="search-input"
              @keyup.enter.native="handleSearch"
            >
              <el-button slot="append" icon="el-icon-search" class="search-btn" @click="handleSearch">搜索</el-button>
            </el-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getCategoryList } from '@/api/home'

export default {
  name: 'Navbar',
  data() {
    return {
      searchKeyword: '',
      categories: []
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'token', 'cartCount', 'nickname', 'phone']),
    isLoggedIn() {
      return !!this.token
    },
    displayName() {
      // 优先显示昵称，如果没有则显示手机号，最后显示默认值
      return this.nickname || this.userInfo.nikeName || this.userInfo.nickname || this.phone || '用户'
    }
  },
  mounted() {
    this.getCartCount()
    this.loadCategories()
    
    // 如果有token但没有用户信息，则获取用户信息
    if (this.token && !this.userInfo.id) {
      this.$store.dispatch('user/getUserInfo')
    }
  },
  methods: {
    async loadCategories() {
      try {
        const res = await getCategoryList()
        if (res.code === 200 && res.data) {
          // 只显示前10个一级分类
          this.categories = res.data.slice(0, 10).map(category => ({
            id: category.id,
            name: category.name,
            icon: 'el-icon-goods' // 使用默认图标，或根据分类名称设置不同图标
          }))
        }
      } catch (error) {
        console.error('加载分类数据失败:', error)
        // 如果API失败，使用默认分类
        this.categories = [
          { id: 1, name: '生活家居', icon: 'el-icon-house' },
          { id: 2, name: '运动专区', icon: 'el-icon-football' },
          { id: 3, name: '电子产品', icon: 'el-icon-mobile-phone' }
        ]
      }
    },
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$router.push({
          path: '/product/search',
          query: { keyword: this.searchKeyword }
        })
      }
    },
    handleCommand(command) {
      switch (command) {
        case 'center':
          this.$router.push('/user/center')
          break
        case 'profile':
          this.$router.push('/user/profile')
          break
        case 'order':
          this.$router.push('/order/list')
          break
        case 'refund':
          this.$router.push('/refund/list')
          break
        case 'collect':
          this.$router.push('/user/collect')
          break
        case 'address':
          this.$router.push('/user/address')
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    async handleLogout() {
      try {
        await this.$store.dispatch('user/logout')
        this.$message.success('退出登录成功')
        this.$router.push('/')
      } catch (error) {
        console.error('退出登录失败:', error)
        this.$message.error('退出登录失败')
      }
    },
    goToCategory(categoryId) {
      this.$router.push(`/product/category/${categoryId}`)
    },
    async getCartCount() {
      try {
        if (this.token) {
          await this.$store.dispatch('cart/getCartCount')
        }
      } catch (error) {
        console.error('获取购物车数量失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  background: white;
  
  .top-bar {
    background: #333;
    color: white;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    
    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .top-left {
      .star-icon {
        color: #ffd700;
        margin-right: 4px;
      }
    }
    
    .top-right {
      display: flex;
      align-items: center;
      
      .link {
        color: white;
        text-decoration: none;
        
        &:hover {
          color: #409EFF;
        }
      }
      
      .divider {
        margin: 0 8px;
        color: #666;
      }
      
      .user-dropdown {
        .user-info {
          color: white;
          cursor: pointer;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
      
      .cart-link {
        .cart-count {
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }
  }
  
  .main-navbar {
    border-bottom: 1px solid #e6e6e6;
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .navbar-content {
      display: flex;
      align-items: center;
      height: 80px;
    }
    
    .logo {
      margin-right: 30px;
      
      a {
        display: flex;
        align-items: center;
        text-decoration: none;
        
        img {
          height: 40px;
          margin-right: 8px;
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
      }
    }
    
    .main-menu {
      display: flex;
      align-items: center;
      margin-right: 30px;
      
      .menu-item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 20px;
        margin-right: 20px;
        color: #333;
        text-decoration: none;
        font-size: 14px;
        position: relative;
        
        &:hover {
          color: #409EFF;
        }
        
        &.category-menu {
          background: #f5f5f5;
          border-radius: 4px;
          
          &:hover .category-dropdown {
            display: block;
          }
        }
        
        i {
          margin-right: 4px;
        }
      }
      
      .category-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        width: 200px;
        background: white;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        
        .category-list {
          .category-item {
            display: flex;
            align-items: center;
            height: 40px;
            padding: 0 15px;
            border-bottom: 1px solid #f5f5f5;
            cursor: pointer;
            
            &:hover {
              background: #f5f5f5;
              color: #409EFF;
            }
            
            &:last-child {
              border-bottom: none;
            }
            
            i {
              margin-right: 8px;
              
              &.el-icon-arrow-right {
                margin-left: auto;
                margin-right: 0;
              }
            }
          }
        }
      }
    }
    
    .search-box {
      flex: 1;
      max-width: 400px;
      
      .search-input {
        ::v-deep .el-input__inner {
          border-radius: 20px 0 0 20px;
          border-right: none;
        }
        
        ::v-deep .el-input-group__append {
          border-radius: 0 20px 20px 0;
          background: #f56c6c;
          border-color: #f56c6c;
          
          .search-btn {
            background: transparent;
            border: none;
            color: white;
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }
    }
  }
}
</style> 