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
      
      <!-- 秒杀商品列表 -->
      <div class="seckill-products">
        <div 
          v-for="product in seckillProducts" 
          :key="product.id"
          class="seckill-item"
          @click="goToProductDetail(product.id)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="price-group">
              <span class="seckill-price">¥{{ product.seckillPrice }}</span>
              <span class="original-price">¥{{ product.originalPrice }}</span>
            </div>
            <div class="seckill-progress">
              <div class="progress-info">
                <span class="progress-text">已抢{{ product.soldPercentage }}%</span>
                <span class="stock-text">剩余{{ product.stock }}件</span>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: product.soldPercentage + '%' }"></div>
              </div>
            </div>
            <div class="action-buttons">
              <el-button 
                type="danger" 
                size="small"
                @click.stop="instantBuy(product)"
                :disabled="product.stock === 0 || timeStatus !== 'ongoing'"
                :loading="product.buying"
              >
                {{ product.stock === 0 ? '已抢完' : '立即预定' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSeckillProducts } from '@/api/home'

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
      seckillProducts: [
        {
          id: 1,
          name: '【超品预售】TOMFORD汤姆福特唇膏4色TF口红黑管套装礼盒16',
          image: 'https://dummyimage.com/300x300/34a853/ffffff&text=TOMFORD',
          seckillPrice: 0,
          originalPrice: 299,
          soldPercentage: 100,
          stock: 0,
          buying: false
        },
        {
          id: 2,
          name: 'bencross北欧简约化妆品收纳盒竹提分区储物盒防尘梳妆台卫生间整理收纳',
          image: 'https://dummyimage.com/300x300/fbbc05/ffffff&text=收纳盒',
          seckillPrice: 0,
          originalPrice: 99,
          soldPercentage: 32,
          stock: 68,
          buying: false
        },
        {
          id: 3,
          name: 'Lola Rose英玫瑰颗粒项链特原装女款',
          image: 'https://dummyimage.com/300x300/ea4335/ffffff&text=Lola+Rose',
          seckillPrice: 0,
          originalPrice: 2099,
          soldPercentage: 90,
          stock: 10,
          buying: false
        },
        {
          id: 4,
          name: 'HEFANG何方珠宝细钢链组织小方糖项链轻奢简约饰品生日礼物',
          image: 'https://dummyimage.com/300x300/4285f4/ffffff&text=HEFANG',
          seckillPrice: 0,
          originalPrice: 90,
          soldPercentage: 80,
          stock: 20,
          buying: false
        },
        {
          id: 5,
          name: '阿迪达斯官网 adidas BBALL CAP COT 男女训练运动帽子',
          image: 'https://dummyimage.com/300x300/2196f3/ffffff&text=adidas',
          seckillPrice: 0,
          originalPrice: 200,
          soldPercentage: 45,
          stock: 55,
          buying: false
        }
      ]
    }
  },
  mounted() {
    this.startCountdown()
    this.loadData()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    async loadData() {
      try {
        // 加载秒杀商品数据
        // const res = await getSeckillProducts()
        // this.seckillProducts = res.data || []
      } catch (error) {
        console.error('加载秒杀商品失败:', error)
      }
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
      if (product.stock === 0 || this.timeStatus !== 'ongoing') {
        return
      }
      
      try {
        product.buying = true
        
        // 调用秒杀购买API
        // await buySeckillProduct({
        //   productId: product.id,
        //   quantity: 1
        // })
        
        this.$message.success('预定成功！')
        
        // 更新库存
        product.stock--
        product.soldPercentage = Math.min(100, product.soldPercentage + 1)
        
      } catch (error) {
        console.error('预定失败:', error)
        this.$message.error('预定失败，请稍后重试')
      } finally {
        product.buying = false
      }
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
  
  // 秒杀商品列表
  .seckill-products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .seckill-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
      }
      
      .product-image {
        height: 200px;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }
      
      .product-info {
        padding: 20px;
        
        .product-name {
          font-size: 14px;
          color: #333;
          line-height: 1.5;
          margin: 0 0 15px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          height: 42px;
        }
        
        .price-group {
          margin-bottom: 15px;
          
          .seckill-price {
            color: #f56c6c;
            font-size: 24px;
            font-weight: bold;
          }
          
          .original-price {
            color: #999;
            text-decoration: line-through;
            margin-left: 10px;
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
          text-align: center;
          
          .el-button {
            width: 100%;
            height: 40px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 20px;
            
            &.el-button--danger {
              background: linear-gradient(135deg, #f56c6c, #ff8a80);
              border: none;
              
              &:hover:not(:disabled) {
                background: linear-gradient(135deg, #e85656, #ff7a70);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
              }
              
              &:disabled {
                background: #c0c4cc;
                color: white;
              }
            }
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

// 响应式设计
@media (max-width: 768px) {
  .seckill-page {
    .seckill-header {
      .header-bg {
        padding: 20px;
        
        .header-content {
          flex-direction: column;
          text-align: center;
          gap: 20px;
        }
        
        .countdown-section {
          align-items: center;
          
          .time-status {
            .status-line {
              width: 40px;
              margin: 0 10px;
            }
          }
        }
      }
    }
    
    .seckill-products {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
}
</style> 