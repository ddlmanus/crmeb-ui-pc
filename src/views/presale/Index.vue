<template>
  <div class="presale-page">
    <div class="container">
      <!-- 预售头部 -->
      <div class="presale-header">
        <div class="header-bg">
          <div class="header-content">
            <div class="presale-title">
              <h2>限时预售</h2>
            </div>
            <div class="status-timeline">
              <div class="status-item" :class="{ active: currentStatus === 'not-started' }">
                <div class="status-circle"></div>
                <span>未开始</span>
              </div>
              <div class="status-line"></div>
              <div class="status-item" :class="{ active: currentStatus === 'ongoing' }">
                <div class="status-circle"></div>
                <span>正在进行</span>
              </div>
              <div class="status-line"></div>
              <div class="status-item" :class="{ active: currentStatus === 'ended' }">
                <div class="status-circle"></div>
                <span>已结束</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预售商品列表 -->
      <div class="presale-products">
        <div 
          v-for="product in presaleProducts" 
          :key="product.id"
          class="presale-item"
          @click="goToProductDetail(product.id)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="presale-badge">预售</div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="price-group">
              <span class="presale-price">¥{{ product.presalePrice }}</span>
              <span class="original-price">¥{{ product.originalPrice }}</span>
            </div>
            <div class="presale-progress">
              <div class="progress-info">
                <span class="progress-text">已预订{{ product.bookedPercentage }}%</span>
                <span class="time-text">{{ product.timeRemaining }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: product.bookedPercentage + '%' }"></div>
              </div>
            </div>
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small"
                @click.stop="presaleBooking(product)"
                :disabled="product.bookedPercentage >= 100 || currentStatus !== 'ongoing'"
                :loading="product.booking"
              >
                {{ product.bookedPercentage >= 100 ? '已售罄' : '立即预定' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPresaleProducts } from '@/api/home'

export default {
  name: 'PresaleIndex',
  data() {
    return {
      currentStatus: 'ongoing', // not-started, ongoing, ended
      presaleProducts: [
        {
          id: 1,
          name: 'HEFANG何方珠宝细钢链组织小方糖项链轻奢简约饰品生日礼物',
          image: 'https://dummyimage.com/300x300/4285f4/ffffff&text=HEFANG',
          presalePrice: 990.00,
          originalPrice: 1200.00,
          bookedPercentage: 80,
          timeRemaining: '7天后发货',
          booking: false
        },
        {
          id: 2,
          name: '松典数码相机5K微单复古女学生入门级高清旅游专用vlog摄影照相机',
          image: 'https://dummyimage.com/300x300/ff9800/ffffff&text=相机',
          presalePrice: 959.00,
          originalPrice: 1200.00,
          bookedPercentage: 45,
          timeRemaining: '10天后发货',
          booking: false
        },
        {
          id: 3,
          name: '广儿不能穿的鞋子',
          image: 'https://dummyimage.com/300x300/e91e63/ffffff&text=鞋子',
          presalePrice: 0.00,
          originalPrice: 2899.00,
          bookedPercentage: 92,
          timeRemaining: '15天后发货',
          booking: false
        }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        // 加载预售商品数据
        // const res = await getPresaleProducts()
        // this.presaleProducts = res.data || []
      } catch (error) {
        console.error('加载预售商品失败:', error)
      }
    },
    goToProductDetail(productId) {
      this.$router.push(`/presale/detail/${productId}`)
    },
    async presaleBooking(product) {
      if (product.bookedPercentage >= 100 || this.currentStatus !== 'ongoing') {
        return
      }
      
      try {
        product.booking = true
        
        // 调用预售预定API
        // await bookPresaleProduct({
        //   productId: product.id,
        //   quantity: 1
        // })
        
        this.$message.success('预定成功！')
        
        // 更新预定进度
        product.bookedPercentage = Math.min(100, product.bookedPercentage + 5)
        
      } catch (error) {
        console.error('预定失败:', error)
        this.$message.error('预定失败，请稍后重试')
      } finally {
        product.booking = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.presale-page {
  background: #f5f5f5;
  min-height: calc(100vh - 160px);
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  // 预售头部
  .presale-header {
    margin-bottom: 30px;
    
    .header-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 40px;
      color: white;
      position: relative;
      overflow: hidden;
      
      .header-content {
        position: relative;
        z-index: 1;
        text-align: center;
        
        .presale-title {
          margin-bottom: 30px;
          
          h2 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }
        }
        
        .status-timeline {
          display: flex;
          justify-content: center;
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
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.5);
              margin-bottom: 10px;
              transition: all 0.3s;
            }
            
            span {
              font-size: 16px;
              white-space: nowrap;
            }
          }
          
          .status-line {
            width: 100px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            margin: 0 30px;
            margin-bottom: 26px;
          }
        }
      }
    }
  }
  
  // 预售商品列表
  .presale-products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .presale-item {
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
        position: relative;
        
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .presale-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
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
          
          .presale-price {
            color: #667eea;
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
        
        .presale-progress {
          margin-bottom: 20px;
          
          .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            
            .progress-text {
              color: #667eea;
              font-weight: bold;
            }
            
            .time-text {
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
              background: linear-gradient(to right, #667eea, #764ba2);
              transition: width 0.3s;
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
            
            &.el-button--primary {
              background: linear-gradient(135deg, #667eea, #764ba2);
              border: none;
              
              &:hover:not(:disabled) {
                background: linear-gradient(135deg, #5a6fd8, #6a419a);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

// 响应式设计
@media (max-width: 768px) {
  .presale-page {
    .presale-header {
      .header-bg {
        padding: 25px 20px;
        
        .status-timeline {
          .status-line {
            width: 60px;
            margin: 0 15px;
          }
        }
      }
    }
    
    .presale-products {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
}
</style> 