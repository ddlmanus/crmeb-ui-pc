<template>
  <div class="my-coupon">
    <div class="container">
      <div class="page-header">
        <h2>我的优惠券</h2>
        <p>{{ couponCount.total }}张优惠券，{{ couponCount.available }}张可用</p>
      </div>

      <!-- 状态标签页 -->
      <div class="status-tabs">
        <div 
          v-for="status in statusList" 
          :key="status.value"
          class="status-tab"
          :class="{ active: currentStatus === status.value }"
          @click="handleStatusChange(status.value)"
        >
          {{ status.label }}
          <el-badge 
            v-if="couponCount[status.key] > 0" 
            :value="couponCount[status.key]" 
            class="status-badge"
          />
        </div>
      </div>

      <!-- 优惠券列表 -->
      <div v-if="!loading && couponList.length > 0" class="coupon-grid">
        <div 
          v-for="coupon in couponList" 
          :key="coupon.id"
          class="my-coupon-card"
          :class="{ expired: coupon.status === 2, used: coupon.status === 1 }"
        >
          <div class="coupon-left">
            <div class="coupon-amount">
              <span class="currency">¥</span>
              <span class="money">{{ (coupon.money || 0) / 100 }}</span>
            </div>
            <div class="coupon-condition">
              满{{ (coupon.minPrice || 0) / 100 }}元可用
            </div>
          </div>
          
          <div class="coupon-right">
            <div class="coupon-info">
              <h3 class="coupon-name">{{ coupon.name || '优惠券' }}</h3>
              <div class="coupon-scope">{{ getCouponScopeText(coupon) }}</div>
              <div class="coupon-time">
                有效期：{{ formatTime(coupon.startTime) }} - {{ formatTime(coupon.endTime) }}
              </div>
              <div class="coupon-merchant" v-if="coupon.merName">
                适用商户：{{ coupon.merName }}
              </div>
            </div>
            
            <div class="coupon-action">
              <el-button 
                v-if="coupon.status === 0"
                type="primary" 
                size="small"
                @click="handleUseCoupon(coupon)"
              >
                立即使用
              </el-button>
              <el-button 
                v-else-if="coupon.status === 1" 
                disabled 
                size="small"
              >
                已使用
              </el-button>
              <el-button 
                v-else 
                disabled 
                size="small"
              >
                已过期
              </el-button>
              
              <el-button 
                type="text" 
                size="small"
                @click="handleViewProducts(coupon)"
                v-if="coupon.category !== 'universal'"
              >
                查看商品
              </el-button>
            </div>
          </div>
          
          <!-- 状态标签 -->
          <div class="coupon-status-tag">
            <el-tag 
              v-if="coupon.status === 1" 
              type="info" 
              size="mini"
            >
              已使用
            </el-tag>
            <el-tag 
              v-else-if="coupon.status === 2" 
              type="danger" 
              size="mini"
            >
              已过期
            </el-tag>
            <el-tag 
              v-else-if="isExpiringSoon(coupon)" 
              type="warning" 
              size="mini"
            >
              即将过期
            </el-tag>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state">
        <div class="empty-icon">
          <i class="el-icon-tickets"></i>
        </div>
        <div class="empty-text">{{ getEmptyText() }}</div>
        <div class="empty-desc">{{ getEmptyDesc() }}</div>
        <el-button 
          v-if="currentStatus === '0'" 
          type="primary" 
          @click="goToCouponCenter"
        >
          去领取优惠券
        </el-button>
      </div>
      
      <!-- 加载状态 -->
      <div v-else class="loading-state">
        <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="pagination.page"
          :page-size="pagination.limit"
          :total="total"
          layout="prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>

    <!-- 适用商品弹窗 -->
    <el-dialog
      title="适用商品"
      :visible.sync="productDialogVisible"
      width="800px"
    >
      <div v-loading="productLoading" class="product-list">
        <div 
          v-for="product in productList" 
          :key="product.id"
          class="product-item"
          @click="goToProduct(product)"
        >
          <img :src="product.image" :alt="product.storeName" />
          <div class="product-info">
            <h4>{{ product.storeName }}</h4>
            <div class="product-price">¥{{ product.price }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="productList.length === 0 && !productLoading" class="no-products">
        暂无适用商品
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMyCoupons, getCouponProducts } from '@/api/coupon'

export default {
  name: 'MyCoupon',
  data() {
    return {
      loading: false,
      productLoading: false,
      couponList: [],
      productList: [],
      total: 0,
      currentStatus: '0', // 默认显示可用优惠券
      pagination: {
        page: 1,
        limit: 10
      },
      couponCount: {
        total: 0,
        available: 0,
        used: 0,
        expired: 0
      },
      statusList: [
        { label: '可用', value: '0', key: 'available' },
        { label: '已使用', value: '1', key: 'used' },
        { label: '已过期', value: '2', key: 'expired' }
      ],
      productDialogVisible: false,
      selectedCoupon: null
    }
  },
  created() {
    this.fetchCouponList()
  },
  methods: {
    async fetchCouponList() {
      try {
        this.loading = true
        
        // 映射前端状态到后端type参数
        const typeMap = {
          '0': 'usable',    // 可用
          '1': 'unusable',  // 已使用和已过期都属于不可用
          '2': 'unusable'   // 已过期
        }
        
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          type: typeMap[this.currentStatus] || 'all'  // 添加必需的type参数
        }
        
        const response = await getMyCoupons(params)
        console.log('我的优惠券数据:', response)
        
        if (response.code === 200) {
          // 处理不同的响应数据结构
          let data = response.data
          if (Array.isArray(data)) {
            this.couponList = data
            this.total = data.length
          } else if (data && data.list) {
            this.couponList = data.list || []
            this.total = data.total || 0
          } else if (data && data.records) {
            this.couponList = data.records || []
            this.total = data.total || 0
          } else {
            this.couponList = []
            this.total = 0
          }
          
          // 统计各状态数量
          this.updateCouponCount()
        }
      } catch (error) {
        console.error('获取优惠券失败:', error)
        this.$message.error('获取优惠券失败')
        this.couponList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async fetchCouponProducts(couponId) {
      try {
        this.productLoading = true
        const params = {
          couponId: couponId,
          page: 1,
          limit: 20
        }
        
        const response = await getCouponProducts(params)
        console.log('优惠券商品数据:', response)
        
        if (response.code === 200) {
          this.productList = response.data.list || []
        }
      } catch (error) {
        console.error('获取优惠券商品失败:', error)
        this.$message.error('获取商品信息失败')
      } finally {
        this.productLoading = false
      }
    },

    updateCouponCount() {
      // 这里应该从API获取准确的统计数据
      // 目前先用本地计算
      const all = this.couponList
      this.couponCount = {
        total: all.length,
        available: all.filter(c => c.status === 0).length,
        used: all.filter(c => c.status === 1).length,
        expired: all.filter(c => c.status === 2).length
      }
    },

    handleStatusChange(status) {
      this.currentStatus = status
      this.pagination.page = 1
      this.fetchCouponList()
    },

    handlePageChange(page) {
      this.pagination.page = page
      this.fetchCouponList()
    },

    handleUseCoupon(coupon) {
      // 根据优惠券类型跳转到相应页面
      if (coupon.category === 'universal') {
        // 通用券跳转到首页
        this.$router.push('/')
      } else if (coupon.category === 'merchant') {
        // 商户券跳转到商户页面
        this.$router.push(`/merchant/${coupon.merId}`)
      } else {
        // 其他类型查看适用商品
        this.handleViewProducts(coupon)
      }
    },

    async handleViewProducts(coupon) {
      this.selectedCoupon = coupon
      this.productDialogVisible = true
      await this.fetchCouponProducts(coupon.id)
    },

    goToProduct(product) {
      this.$router.push(`/product/detail/${product.id}`)
      this.productDialogVisible = false
    },

    goToCouponCenter() {
      this.$router.push('/coupon')
    },

    getCouponScopeText(coupon) {
      const scopeMap = {
        'universal': '全场通用',
        'product': '指定商品',
        'category': '指定分类',
        'merchant': '指定商户',
        'brand': '指定品牌'
      }
      return scopeMap[coupon.category] || '限定范围'
    },

    isExpiringSoon(coupon) {
      if (coupon.status !== 0) return false
      const now = new Date()
      const endTime = new Date(coupon.endTime)
      const diffDays = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24))
      return diffDays <= 3 && diffDays > 0
    },

    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleDateString()
    },

    getEmptyText() {
      const textMap = {
        '0': '暂无可用优惠券',
        '1': '暂无已使用优惠券',
        '2': '暂无过期优惠券'
      }
      return textMap[this.currentStatus] || '暂无优惠券'
    },

    getEmptyDesc() {
      const descMap = {
        '0': '快去领取优惠券，享受更多优惠',
        '1': '使用优惠券购买商品后会显示在这里',
        '2': '过期的优惠券会显示在这里'
      }
      return descMap[this.currentStatus] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.my-coupon {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    margin: 0 0 10px;
    color: #333;
    font-size: 24px;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.status-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
  display: flex;
  
  .status-tab {
    position: relative;
    padding: 20px 30px;
    cursor: pointer;
    color: #666;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    
    &:hover {
      color: #409eff;
    }
    
    &.active {
      color: #409eff;
      border-bottom-color: #409eff;
    }
    
    .status-badge {
      margin-left: 8px;
    }
  }
}

.coupon-list {
  min-height: 400px;
}

.coupon-grid {
  display: grid;
  gap: 15px;
}

.my-coupon-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  &.expired,
  &.used {
    opacity: 0.6;
    
    .coupon-left {
      background: #ccc !important;
    }
  }
}

.coupon-left {
  width: 120px;
  background: linear-gradient(135deg, #409eff, #3a8ee6);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #f5f5f5;
    border-radius: 50%;
  }
  
  .coupon-amount {
    text-align: center;
    margin-bottom: 5px;
    
    .currency {
      font-size: 14px;
      vertical-align: top;
    }
    
    .money {
      font-size: 28px;
      font-weight: bold;
    }
  }
  
  .coupon-condition {
    font-size: 11px;
    opacity: 0.9;
  }
}

.coupon-right {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-info {
  flex: 1;
  
  .coupon-name {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
  
  .coupon-scope {
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
  }
  
  .coupon-time {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
  }
  
  .coupon-merchant {
    font-size: 12px;
    color: #409eff;
  }
}

.coupon-action {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coupon-status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-icon {
    font-size: 80px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  .empty-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 10px;
  }
  
  .empty-desc {
    color: #666;
    margin-bottom: 30px;
  }
}

.pagination-wrapper {
  margin-top: 30px;
  text-align: center;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.product-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }
  
  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  .product-info {
    h4 {
      margin: 0 0 5px;
      font-size: 14px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .product-price {
      color: #ff4757;
      font-weight: bold;
      font-size: 16px;
    }
  }
}

.no-products {
  text-align: center;
  padding: 40px;
  color: #999;
}

@media (max-width: 768px) {
  .status-tabs {
    .status-tab {
      padding: 15px 20px;
    }
  }
  
  .my-coupon-card {
    .coupon-left {
      width: 100px;
    }
    
    .coupon-right {
      padding: 15px;
    }
    
    .coupon-action {
      flex-direction: row;
      gap: 5px;
    }
  }
  
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 