<template>
  <div class="home-page">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部轮播图和分类导航区域 -->
      <div class="banner-category-section">
        <div class="container">
          <div class="content-wrapper">
            <!-- 左侧分类导航 -->
            <div class="category-sidebar">
              <div class="category-title">
                <i class="el-icon-menu"></i>
                <span>全部商品分类</span>
              </div>
              <div class="category-list">
                <div
                  v-for="category in categoryList"
                  :key="category.id"
                  class="category-item"
                  @click="goToCategory(category.id)"
                  @mouseenter="showSubCategories(category)"
                >
                  <i :class="category.icon"></i>
                  <span>{{ category.name }}</span>
                  <i class="el-icon-arrow-right"></i>
                </div>
              </div>
            </div>
            
            <!-- 轮播图区域 -->
            <div class="banner-container">
              <div v-if="loading" class="banner-loading">
                <el-loading-text>加载中...</el-loading-text>
              </div>
              <div v-else-if="bannerList.length === 0" class="banner-empty">
                <div class="empty-placeholder">
                  <i class="el-icon-picture"></i>
                  <span>暂无轮播图</span>
                </div>
              </div>
              <el-carousel v-else height="400px" :interval="4000" arrow="hover" indicator-position="inside">
                <el-carousel-item v-for="banner in bannerList" :key="banner.id">
                  <div class="banner-item" @click="goToLink(banner.link)">
                    <img 
                      :src="banner.image" 
                      :alt="banner.title" 
                      :data-original-src="banner.originalUrl"
                      data-url-index="0"
                      @error="handleImageError" 
                    />
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
        </div>
      </div>

      <!-- 限时秒杀区域 -->
      <div class="seckill-section">
        <div class="container">
          <div class="seckill-header">
            <div class="seckill-title">
              <div class="title-icon">限时秒杀</div>
              <div class="countdown">
                <span class="time-label">{{ seckillData.timeLabel }}</span>
                <div class="time-group">
                  <span class="time-item">{{ timeLeft.hours }}</span>
                  <span class="time-separator">:</span>
                  <span class="time-item">{{ timeLeft.minutes }}</span>
                  <span class="time-separator">:</span>
                  <span class="time-item">{{ timeLeft.seconds }}</span>
                </div>
                <span class="time-unit">点场</span>
              </div>
              <div class="seckill-rule">
                <span>距离结束还有</span>
                <span>超值特惠</span>
              </div>
            </div>
          </div>
          <div class="seckill-products">
            <div
              v-for="product in seckillData.products"
              :key="product.id"
              class="seckill-item"
              @click="goToProduct(product.id)"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
              </div>
              <div class="product-info">
                <div class="price-group">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price">¥{{ product.originalPrice }}</span>
                </div>
                <h4 class="product-name">{{ product.name }}</h4>
                <div class="seckill-progress">
                  <div class="progress-bar">
                    <div class="progress" :style="{ width: product.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">已抢{{ product.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 按分类展示商品区域 -->
      <div v-for="categorySection in categoryProductSections" :key="categorySection.id" class="category-product-section">
        <div class="container">
          <div class="section-header">
            <h3 class="section-title">{{ categorySection.name }}</h3>
            <div class="section-subtitle">{{ categorySection.subtitle }}</div>
            <router-link :to="`/product/category/${categorySection.id}`" class="more-link">
              更多 <i class="el-icon-arrow-right"></i>
            </router-link>
          </div>
          <div class="product-grid">
            <div
              v-for="product in categorySection.products"
              :key="product.id"
              class="product-item"
              @click="goToProductDetail(product.id)"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
                <div class="product-labels" v-if="product.labels && product.labels.length">
                  <span
                    v-for="label in product.labels"
                    :key="label.text"
                    class="product-label"
                    :class="label.type"
                  >
                    {{ label.text }}
                  </span>
                </div>
                <div class="product-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click.stop="addToCart(product)"
                    :loading="product.adding"
                  >
                    加入购物车
                  </el-button>
                </div>
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ product.name }}</h4>
                <div class="price-group">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                </div>
                <div class="product-meta">
                  <span class="sales">{{ product.sales }}人付款</span>
                  <div class="rating" v-if="product.rating">
                    <el-rate 
                      v-model="product.rating" 
                      disabled 
                      show-score 
                      text-color="#ff9900" 
                      score-template="{value}"
                      class="product-rating"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部服务保障 -->
      <div class="service-section">
        <div class="container">
          <div class="service-grid">
            <div class="service-item">
              <i class="service-icon el-icon-goods"></i>
              <div class="service-info">
                <h4>品种齐全、购物轻松</h4>
              </div>
            </div>
            <div class="service-item">
              <i class="service-icon el-icon-truck"></i>
              <div class="service-info">
                <h4>多仓直发、极速配送</h4>
              </div>
            </div>
            <div class="service-item">
              <i class="service-icon el-icon-medal"></i>
              <div class="service-info">
                <h4>正品行货、精致服务</h4>
              </div>
            </div>
            <div class="service-item">
              <i class="service-icon el-icon-discount"></i>
              <div class="service-info">
                <h4>天天低价、畅选无忧</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addCartItem } from '@/api/cart'
import { mapActions } from 'vuex'
import { getHomeData } from '@/api/home'
import { formatImageUrl, getDefaultImage, getPossibleImageUrls } from '@/utils/image'

export default {
  name: 'HomePage',
  data() {
    return {
      bannerList: [],
      categoryList: [],
      seckillData: {
        timeLabel: '00:00点场',
        products: []
      },
      categoryProductSections: [],
      timeLeft: {
        hours: '06',
        minutes: '48',
        seconds: '46'
      },
      timer: null,
      loading: true
    }
  },
  mounted() {
    this.loadData()
    this.startCountdown()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    ...mapActions(['getCartCount']),
    async loadData() {
      try {
        console.log('开始加载首页数据...')
        this.loading = true
        
        // 只使用首页完整数据接口，避免重复调用
        const homeRes = await getHomeData()
        console.log('首页完整数据:', homeRes)
        
        if (homeRes.code === 200 && homeRes.data) {
          const data = homeRes.data
          
          // 更新轮播图
          if (data.banners && data.banners.length > 0) {
            this.bannerList = data.banners.map(banner => {
              const originalUrl = banner.imageUrl || banner.pic || banner.image
              return {
                id: banner.id || Math.random(),
                image: formatImageUrl(originalUrl),
                originalUrl: originalUrl, // 保存原始URL用于错误重试
                title: banner.name || banner.title || '',
                link: banner.linkUrl || banner.url || banner.link || ''
              }
            })
            console.log('轮播图数据处理完成:', this.bannerList)
          } else {
            console.warn('没有轮播图数据，使用默认轮播图')
            // 提供默认轮播图，防止页面空白
            this.bannerList = [
              {
                id: 'default-1',
                image: getDefaultImage('banner'),
                originalUrl: '',
                title: '默认轮播图',
                link: ''
              }
            ]
          }
          
          // 更新分类 - 统一数据格式
          if (data.categories && data.categories.length > 0) {
            this.categoryList = data.categories.map(category => ({
              id: category.id,
              name: category.name,
              icon: category.icon || 'el-icon-goods',
              image: category.icon // 保持原始图片地址
            }))
          }
          
          // 更新秒杀商品
          if (data.seckillProducts && data.seckillProducts.length > 0) {
            this.seckillData.products = data.seckillProducts.map(product => ({
              id: product.id,
              name: product.storeName || product.name,
              image: formatImageUrl(product.image),
              price: product.otPrice || product.price,
              originalPrice: product.price,
              progress: Math.floor(Math.random() * 100) // 随机进度，实际应该从后端获取
            }))
          }
          
          // 构建商品分类展示区域
          this.categoryProductSections = []
          
          // 推荐商品
          if (data.recommendProducts && data.recommendProducts.length > 0) {
            this.categoryProductSections.push({
              id: 'recommend',
              name: '精品推荐',
              subtitle: '诚意推荐 品质商品',
              products: data.recommendProducts.map(product => ({
                id: product.id,
                name: product.name || product.storeName,
                image: formatImageUrl(product.image),
                price: product.price,
                originalPrice: product.otPrice || product.price,
                sales: product.sales || 0,
                rating: 5.0, // 默认评分
                labels: [],
                adding: false
              }))
            })
          }
          
          // 热销商品
          if (data.hotProducts && data.hotProducts.length > 0) {
            this.categoryProductSections.push({
              id: 'hot',
              name: '热销商品',
              subtitle: '人气爆款 销量领先',
              products: data.hotProducts.map(product => ({
                id: product.id,
                name: product.name || product.storeName,
                image: formatImageUrl(product.image),
                price: product.price,
                originalPrice: product.otPrice || product.price,
                sales: product.sales || 0,
                rating: 4.8,
                labels: [{ text: '热销', type: 'hot' }],
                adding: false
              }))
            })
          }
          
          // 新品商品
          if (data.newProducts && data.newProducts.length > 0) {
            this.categoryProductSections.push({
              id: 'new',
              name: '首发新品',
              subtitle: '永远好奇 永远年轻',
              products: data.newProducts.map(product => ({
                id: product.id,
                name: product.name || product.storeName,
                image: formatImageUrl(product.image),
                price: product.price,
                originalPrice: product.otPrice || product.price,
                sales: product.sales || 0,
                rating: 4.5,
                labels: [{ text: '新品', type: 'new' }],
                adding: false
              }))
            })
          }
        }
        
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败，请稍后重试')
      } finally {
        this.loading = false
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
    goToCategory(categoryId) {
      this.$router.push(`/product/category/${categoryId}`)
    },
    goToProduct(productId) {
      this.$router.push(`/seckill/detail/${productId}`)
    },
    goToProductDetail(productId) {
      this.$router.push(`/product/detail/${productId}`)
    },
    goToLink(link) {
      if (link) {
        this.$router.push(link)
      }
    },
    showSubCategories(category) {
      console.log('显示子分类:', category)
    },
    async addToCart(product) {
      try {
        product.adding = true
        
        await addCartItem({
          productId: product.id,
          quantity: 1,
          skuId: null
        })
        
        await this.getCartCount()
        
        this.$message.success('添加购物车成功')
      } catch (error) {
        console.error('添加购物车失败:', error)
        this.$message.error('添加购物车失败')
      } finally {
        product.adding = false
      }
    },

    handleImageError(event) {
      console.error('图片加载失败:', event.target.src)
      
      // 尝试其他可能的URL
      const originalSrc = event.target.getAttribute('data-original-src')
      if (originalSrc) {
        const possibleUrls = getPossibleImageUrls(originalSrc)
        const currentIndex = event.target.getAttribute('data-url-index') || 0
        const nextIndex = parseInt(currentIndex) + 1
        
        if (nextIndex < possibleUrls.length) {
          console.log(`尝试第${nextIndex + 1}个图片URL:`, possibleUrls[nextIndex])
          event.target.setAttribute('data-url-index', nextIndex)
          event.target.src = possibleUrls[nextIndex]
          return
        }
      }
      
      // 所有URL都失败，设置默认图片
      console.log('所有图片URL都失败，使用默认图片')
      event.target.src = getDefaultImage('banner')
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  background: #f5f5f5;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .banner-category-section {
    background: white;
    
    .content-wrapper {
      display: flex;
      height: 400px;
    }
    
    .category-sidebar {
      width: 220px;
      background: #f8f8f8;
      
      .category-title {
        height: 40px;
        line-height: 40px;
        padding: 0 15px;
        background: #333;
        color: white;
        font-size: 14px;
        
        i {
          margin-right: 8px;
        }
      }
      
      .category-list {
        .category-item {
          display: flex;
          align-items: center;
          height: 36px;
          padding: 0 15px;
          border-bottom: 1px solid #e6e6e6;
          cursor: pointer;
          font-size: 13px;
          
          &:hover {
            background: #e6e6e6;
            color: #f56c6c;
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
    
    .banner-container {
      flex: 1;
      
      .banner-loading,
      .banner-empty {
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        
        .empty-placeholder {
          text-align: center;
          color: #999;
          
          i {
            font-size: 48px;
            display: block;
            margin-bottom: 10px;
          }
          
          span {
            font-size: 14px;
          }
        }
      }
      
      .banner-item {
        height: 400px;
        cursor: pointer;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
  
  .seckill-section {
    margin-top: 10px;
    background: white;
    
    .seckill-header {
      height: 80px;
      background: linear-gradient(to right, #ff6b6b, #ff8e8e);
      display: flex;
      align-items: center;
      padding: 0 20px;
      
      .seckill-title {
        display: flex;
        align-items: center;
        color: white;
        
        .title-icon {
          font-size: 24px;
          font-weight: bold;
          margin-right: 30px;
        }
        
        .countdown {
          display: flex;
          align-items: center;
          margin-right: 30px;
          
          .time-label {
            margin-right: 10px;
          }
          
          .time-group {
            display: flex;
            align-items: center;
            margin-right: 10px;
            
            .time-item {
              display: inline-block;
              width: 30px;
              height: 30px;
              line-height: 30px;
              text-align: center;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 4px;
              font-weight: bold;
            }
            
            .time-separator {
              margin: 0 5px;
              font-weight: bold;
            }
          }
          
          .time-unit {
            font-size: 14px;
          }
        }
        
        .seckill-rule {
          span {
            margin-right: 10px;
            font-size: 14px;
          }
        }
      }
    }
    
    .seckill-products {
      display: flex;
      padding: 20px;
      gap: 20px;
      
      .seckill-item {
        flex: 1;
        background: white;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .product-image {
          height: 150px;
          text-align: center;
          margin-bottom: 10px;
          
          img {
            height: 100%;
            object-fit: contain;
          }
        }
        
        .product-info {
          .price-group {
            margin-bottom: 8px;
            
            .current-price {
              color: #f56c6c;
              font-size: 18px;
              font-weight: bold;
            }
            
            .original-price {
              color: #999;
              text-decoration: line-through;
              margin-left: 8px;
              font-size: 14px;
            }
          }
          
          .product-name {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
            margin: 0 0 10px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .seckill-progress {
            .progress-bar {
              width: 100%;
              height: 6px;
              background: #f0f0f0;
              border-radius: 3px;
              overflow: hidden;
              margin-bottom: 5px;
              
              .progress {
                height: 100%;
                background: linear-gradient(to right, #ff6b6b, #ff8e8e);
                transition: width 0.3s;
              }
            }
            
            .progress-text {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }
  }
  
  .category-product-section {
    margin-top: 20px;
    background: white;
    padding: 30px 0;
    
    .section-header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
      
      .section-title {
        font-size: 24px;
        color: #333;
        margin: 0 0 5px 0;
      }
      
      .section-subtitle {
        color: #999;
        font-size: 14px;
      }
      
      .more-link {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
        text-decoration: none;
        
        &:hover {
          color: #f56c6c;
        }
      }
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      
      .product-item {
        background: white;
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          
          .product-actions {
            opacity: 1;
          }
        }
        
        .product-image {
          position: relative;
          height: 200px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .product-labels {
            position: absolute;
            top: 10px;
            left: 10px;
            
            .product-label {
              display: inline-block;
              padding: 2px 6px;
              font-size: 12px;
              color: white;
              border-radius: 2px;
              margin-right: 5px;
              
              &.hot {
                background: #f56c6c;
              }
              
              &.new {
                background: #67c23a;
              }
              
              &.sale {
                background: #e6a23c;
              }
            }
          }
          
          .product-actions {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: all 0.3s;
          }
        }
        
        .product-info {
          padding: 15px;
          
          .product-name {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
            margin: 0 0 10px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            height: 40px;
          }
          
          .price-group {
            margin-bottom: 8px;
            
            .current-price {
              color: #f56c6c;
              font-size: 18px;
              font-weight: bold;
            }
            
            .original-price {
              color: #999;
              text-decoration: line-through;
              margin-left: 8px;
              font-size: 14px;
            }
          }
          
          .product-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #999;
            
            .product-rating {
              ::v-deep .el-rate {
                height: 14px;
                line-height: 14px;
                
                .el-rate__item {
                  font-size: 12px;
                }
                
                .el-rate__text {
                  font-size: 12px;
                  margin-left: 4px;
                }
              }
            }
          }
        }
      }
    }
  }
  
  .service-section {
    margin-top: 10px;
    background: white;
    padding: 30px 0;
    
    .service-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      
      .service-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        
        .service-icon {
          font-size: 40px;
          color: #409eff;
          margin-right: 15px;
        }
        
        .service-info {
          h4 {
            margin: 0;
            font-size: 14px;
            color: #333;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    .banner-category-section {
      .content-wrapper {
        flex-direction: column;
        height: auto;
      }
      
      .category-sidebar {
        width: 100%;
        order: 2;
      }
      
      .banner-container {
        order: 1;
        height: 200px;
        
        .banner-item {
          height: 200px;
        }
      }
    }
    
    .seckill-section {
      .seckill-products {
        flex-direction: column;
      }
    }
    
    .category-product-section {
      .product-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
    }
    
    .service-section {
      .service-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style> 