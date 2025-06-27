<template>
  <div class="cart-float">
    <div class="float-panel">
      <!-- 购物车 -->
      <div class="float-item cart-item" @click="goToCart">
        <i class="el-icon-shopping-cart-2"></i>
        <span class="float-text">购物车</span>
        <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
      </div>
      
      <!-- 关注微信 -->
      <div class="float-item wechat-item">
        <i class="el-icon-chat-dot-round"></i>
        <span class="float-text">关注微信</span>
      </div>
      
      <!-- 意见反馈 -->
      <div class="float-item feedback-item">
        <i class="el-icon-message"></i>
        <span class="float-text">意见反馈</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CartFloat',
  computed: {
    ...mapGetters(['cartCount'])
  },
  methods: {
    goToCart() {
      this.$router.push('/cart')
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-float {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  
  .float-panel {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .float-item {
      width: 50px;
      height: 50px;
      background: white;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: #f5f5f5;
        transform: translateX(-2px);
      }
      
      i {
        font-size: 18px;
        color: #666;
        margin-bottom: 2px;
      }
      
      .float-text {
        font-size: 10px;
        color: #666;
      }
      
      &.cart-item {
        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #f56c6c;
          color: white;
          border-radius: 50%;
          min-width: 16px;
          height: 16px;
          line-height: 16px;
          text-align: center;
          font-size: 10px;
          font-weight: bold;
        }
        
        &:hover {
          background: #f56c6c;
          
          i, .float-text {
            color: white;
          }
        }
      }
      
      &.wechat-item {
        i {
          color: #07c160;
        }
        
        &:hover {
          background: #07c160;
          
          i, .float-text {
            color: white;
          }
        }
      }
      
      &.feedback-item {
        i {
          color: #409eff;
        }
        
        &:hover {
          background: #409eff;
          
          i, .float-text {
            color: white;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .cart-float {
    display: none;
  }
}
</style> 