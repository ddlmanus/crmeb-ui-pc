<template>
  <div class="seckill-page">
    <div class="container">
      <!-- 秒杀头部 -->
      <div class="seckill-header">
        <div class="header-bg">
          <div class="header-content">
            <div class="seckill-title">
              <h2>限时秒杀</h2>
            </div>
            <div class="countdown-section">
              <div class="time-status">
                <div class="status-item" :class="{ active: timeStatus === 'not-started' }">
                  <div class="status-circle"></div>
                  <span>未开始</span>
                </div>
                <div class="status-line"></div>
                <div class="status-item" :class="{ active: timeStatus === 'ongoing' }">
                  <div class="status-circle"></div>
                  <span>正在进行</span>
                </div>
                <div class="status-line"></div>
                <div class="status-item" :class="{ active: timeStatus === 'ended' }">
                  <div class="status-circle"></div>
                  <span>已结束</span>
                </div>
              </div>
              <div class="time-display">
                <span class="time-label">距结束</span>
                <div class="time-group">
                  <span class="time-item">{{ timeLeft.hours }}</span>
                  <span class="time-separator">:</span>
                  <span class="time-item">{{ timeLeft.minutes }}</span>
                  <span class="time-separator">:</span>
                  <span class="time-item">{{ timeLeft.seconds }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <el-loading :spinning="true" tip="加载中...">
          <div style="height: 400px;"></div>
        </el-loading>
      </div>

      <!-- 无数据状态 -->
      <div v-else-if="!loading && seckillProducts.length === 0" class="empty-section">
        <div class="empty-content">
          <i class="el-icon-goods"></i>
          <h3>暂无秒杀商品</h3>
          <p>敬请期待更多精彩活动</p>
          <el-button type="primary" @click="goToHome">返回首页</el-button>
        </div>
      </div>

      <!-- 秒杀商品列表 -->
      <div v-else class="seckill-products">
        <div
          v-for="product in seckillProducts"
          :key="product.id"
          class="seckill-item"
          @click="goToProductDetail(product.id)"
        >
          <div class="product-image">
            <img :src="formatImageUrl(product.image)" :alt="product.name" />
            <div class="seckill-badge">秒杀</div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="price-group">
              <span class="seckill-price">¥{{ product.seckillPrice }}</span>
              <span class="original-price">¥{{ product.price }}</span>
            </div>
            <div class="seckill-progress">
              <div class="progress-info">
                <span class="progress-text">已抢{{ calculateProgress(product) }}%</span>
                <span class="stock-text">剩余{{ product.quota }}件</span>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: calculateProgress(product) + '%' }"></div>
              </div>
            </div>
            <div class="action-buttons">
              <el-button
                type="danger"
                size="small"
                @click.stop="instantBuy(product)"
                :disabled="product.quota === 0 || timeStatus !== 'ongoing'"
                :loading="product.buying"
              >
                {{ product.quota === 0 ? '已抢完' : '立即抢购' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSeckillInfo } from '@/api/seckill'

export default {
  name: 'SeckillIndex',
  data() {
    return {
      timeStatus: 'ongoing', // not-started, ongoing, ended
      timeLeft: {
        hours: '06',
        minutes: '29',
        seconds: '26'
      },
      timer: null,
      loading: false,
      seckillProducts: []
    }
  },
  mounted() {
    this.startCountdown()
    this.loadSeckillProducts()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    async loadSeckillProducts() {
      try {
        this.loading = true
        console.log('开始获取秒杀商品数据...')
        
        const response = await getSeckillInfo()
        console.log('秒杀商品API响应:', response)

        if (response.code === 200) {
          // 处理成功响应，包括空数据的情况
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            this.seckillProducts = response.data.map(product => ({
              ...product,
              buying: false // 添加购买状态
            }))
            console.log('秒杀商品数据:', this.seckillProducts)
          } else {
            // 数据为空或null的情况，不显示错误，只是设置为空数组
            this.seckillProducts = []
            console.log('暂无秒杀商品数据')
          }
        } else {
          // 只有在明确的错误响应时才显示错误信息
          console.error('获取秒杀商品失败:', response)
          this.seckillProducts = []
          // 可以选择性地显示错误信息，或者只在严重错误时显示
          // this.$message.error('获取秒杀商品失败')
        }
      } catch (error) {
        console.error('加载秒杀商品失败:', error)
        this.seckillProducts = []
        // 只在网络错误等严重情况下显示错误信息
        if (error.message && !error.message.includes('timeout')) {
          this.$message.error('网络错误，请稍后重试')
        }
      } finally {
        this.loading = false
      }
    },

    calculateProgress(product) {
      if (!product.quotaShow || product.quotaShow === 0) {
        return 0
      }
      const sold = product.quotaShow - product.quota
      return Math.min(100, Math.max(0, Math.round((sold / product.quotaShow) * 100)))
    },

    formatImageUrl(imageUrl) {
      if (!imageUrl) {
        return 'https://dummyimage.com/300x300/f0f0f0/999999&text=暂无图片'
      }
      
      // 如果是完整的URL，直接返回
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
      }
      
      // 如果是相对路径，拼接基础URL
      const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:20002' : ''
      return `${baseURL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    },

    startCountdown() {
      this.timer = setInterval(() => {
        let seconds = parseInt(this.timeLeft.seconds)
        let minutes = parseInt(this.timeLeft.minutes)
        let hours = parseInt(this.timeLeft.hours)

        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              // 时间结束
              this.timeStatus = 'ended'
              clearInterval(this.timer)
              return
            }
          }
        }

        this.timeLeft = {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        }
      }, 1000)
    },

    goToProductDetail(productId) {
      this.$router.push(`/seckill/detail/${productId}`)
    },

    async instantBuy(product) {
      if (product.quota === 0 || this.timeStatus !== 'ongoing') {
        return
      }

      // 检查登录状态
      if (!this.$store.getters.token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        product.buying = true

        // 直接跳转到秒杀商品详情页进行购买
        this.$router.push(`/seckill/detail/${product.id}`)

      } catch (error) {
        console.error('跳转失败:', error)
        this.$message.error('跳转失败，请稍后重试')
      } finally {
        product.buying = false
      }
    },

    goToHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.seckill-page {
  background: #f5f5f5;
  min-height: calc(100vh - 160px);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  // 秒杀头部
  .seckill-header {
    margin-bottom: 30px;

    .header-bg {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ff8a80 100%);
      border-radius: 12px;
      padding: 30px;
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="80" r="2.5" fill="rgba(255,255,255,0.1)"/></svg>');
        opacity: 0.3;
      }

      .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .seckill-title {
        h2 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
      }

      .countdown-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 20px;

        .time-status {
          display: flex;
          align-items: center;

          .status-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0.6;
            transition: all 0.3s;

            &.active {
              opacity: 1;

              .status-circle {
                background: white;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
              }
            }

            .status-circle {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.5);
              margin-bottom: 8px;
              transition: all 0.3s;
            }

            span {
              font-size: 14px;
              white-space: nowrap;
            }
          }

          .status-line {
            width: 60px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            margin: 0 20px;
            margin-bottom: 22px;
          }
        }

        .time-display {
          display: flex;
          align-items: center;
          gap: 15px;

          .time-label {
            font-size: 18px;
            font-weight: bold;
          }

          .time-group {
            display: flex;
            align-items: center;

            .time-item {
              display: inline-block;
              width: 40px;
              height: 40px;
              line-height: 40px;
              text-align: center;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 6px;
              font-weight: bold;
              font-size: 18px;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .time-separator {
              margin: 0 8px;
              font-weight: bold;
              font-size: 20px;
            }
          }
        }
      }
    }
  }

  // 加载状态
  .loading-section {
    background: white;
    border-radius: 12px;
    margin-bottom: 30px;
  }

  // 空状态
  .empty-section {
    background: white;
    border-radius: 12px;
    padding: 80px 20px;
    text-align: center;

    .empty-content {
      i {
        font-size: 64px;
        color: #ddd;
        margin-bottom: 20px;
      }

      h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 20px;
      }

      p {
        margin: 0 0 30px 0;
        color: #666;
        font-size: 14px;
      }
    }
  }

  // 秒杀商品列表
  .seckill-products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;

    .seckill-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }

      .product-image {
        height: 240px;
        position: relative;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        &:hover img {
          transform: scale(1.05);
        }

        .seckill-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(45deg, #f56c6c, #ff8a80);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
        }
      }

      .product-info {
        padding: 20px;

        .product-name {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          height: 48px;
        }

        .price-group {
          margin-bottom: 20px;

          .seckill-price {
            color: #f56c6c;
            font-size: 24px;
            font-weight: bold;
            margin-right: 12px;
          }

          .original-price {
            color: #999;
            text-decoration: line-through;
            font-size: 16px;
          }
        }

        .seckill-progress {
          margin-bottom: 20px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;

            .progress-text {
              color: #f56c6c;
              font-weight: bold;
            }

            .stock-text {
              color: #666;
            }
          }

          .progress-bar {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;

            .progress {
              height: 100%;
              background: linear-gradient(to right, #f56c6c, #ff8a80);
              transition: width 0.3s;
              position: relative;

              &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.3) 75%);
                background-size: 10px 10px;
                animation: progress-animation 1s linear infinite;
              }
            }
          }
        }

        .action-buttons {
          .el-button {
            width: 100%;
            height: 44px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 22px;
            border: none;
            
            &.el-button--danger {
              background: linear-gradient(45deg, #f56c6c, #ff8a80);
              
              &:hover:not(.is-disabled) {
                background: linear-gradient(45deg, #f45656, #ff7a7a);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
              }
            }

            &.is-disabled {
              background: #e8e8e8 !important;
              color: #999 !important;
            }
          }
        }
      }
    }
  }

  @keyframes progress-animation {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 20px 0;
    }
  }
}

@media (max-width: 768px) {
  .seckill-page {
    .container {
      padding: 15px;
    }

    .seckill-header {
      .header-bg {
        padding: 20px;

        .header-content {
          flex-direction: column;
          gap: 20px;
          text-align: center;
        }

        .countdown-section {
          align-items: center;
        }
      }
    }

    .seckill-products {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;

      .seckill-item {
        .product-image {
          height: 200px;
        }

        .product-info {
          padding: 15px;

          .product-name {
            font-size: 14px;
            height: 42px;
            -webkit-line-clamp: 2;
          }

          .price-group {
            .seckill-price {
              font-size: 20px;
            }

            .original-price {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
