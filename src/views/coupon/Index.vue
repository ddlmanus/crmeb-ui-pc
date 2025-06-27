<template>
  <div class="coupon-center">
    <div class="container">
      <div class="page-header">
        <h2>领取优惠券</h2>
        <p>更多优惠券，更多实惠</p>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">优惠券类型：</span>
          <el-radio-group v-model="filters.type" @change="handleFilterChange">
            <el-radio-button 
              v-for="type in couponTypes" 
              :key="type.value" 
              :label="type.value"
            >
              {{ type.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 优惠券网格 -->
      <div v-loading="loading" class="coupon-grid">
        <div 
          v-for="coupon in couponList" 
          :key="coupon.id"
          class="coupon-card"
          :class="getCouponTypeClass(coupon)"
        >
          <!-- 优惠券类型标签 -->
          <div class="coupon-type-tag">
            {{ getCouponTypeText(coupon) }}
          </div>
          
          <!-- 优惠券金额 -->
          <div class="coupon-amount">
            <span class="currency">¥</span>
            <span class="money">{{ (coupon.money || 0) / 100 }}</span>
          </div>
          
          <!-- 优惠券标题 -->
          <div class="coupon-title">{{ coupon.name || '优惠券' }}</div>
          
          <!-- 使用条件 -->
          <div class="coupon-condition">
            满{{ (coupon.minPrice || 0) / 100 }}可用
          </div>
          
          <!-- 有效期 -->
          <div class="coupon-validity">
            {{ getValidityText(coupon) }}
          </div>
          
          <!-- 领取按钮 -->
          <div class="coupon-action">
            <el-button 
              v-if="!coupon.isReceived"
              type="danger" 
              size="small"
              :loading="receiving === coupon.id"
              @click="handleReceive(coupon)"
              class="receive-btn"
            >
              立即领取
            </el-button>
            <el-button 
              v-else 
              disabled 
              size="small"
              class="received-btn"
            >
              已领取
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && couponList.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="el-icon-tickets"></i>
        </div>
        <div class="empty-text">暂无可领取的优惠券</div>
        <div class="empty-desc">请稍后再来看看</div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pagination.limit">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="pagination.page"
          :page-size="pagination.limit"
          :total="total"
          layout="prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getCouponCenter, receiveCoupon } from '@/api/coupon'

export default {
  name: 'CouponCenter',
  data() {
    return {
      loading: false,
      receiving: null,
      couponList: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 12
      },
      filters: {
        type: '', // 优惠券类型
        sort: 'createTime' // 排序方式
      },
      couponTypes: [
        { label: '全部', value: '' },
        { label: '通用券', value: 'universal' },
        { label: '商品券', value: 'product' },
        { label: '分类券', value: 'category' },
        { label: '商户券', value: 'merchant' }
      ]
    }
  },
  created() {
    this.fetchCouponList()
  },
  methods: {
    async fetchCouponList() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          category: 0, // 添加必需的category参数，0表示所有优惠券
          ...this.filters
        }
        
        const response = await getCouponCenter(params)
        console.log('优惠券中心数据:', response)
        
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

    async handleReceive(coupon) {
      try {
        this.receiving = coupon.id
        await receiveCoupon(coupon.id)
        this.$message.success('领取成功')
        
        // 更新券状态
        coupon.isReceive = true
        coupon.stock = Math.max(0, coupon.stock - 1)
      } catch (error) {
        console.error('领取优惠券失败:', error)
        this.$message.error(error.message || '领取失败')
      } finally {
        this.receiving = null
      }
    },

    handleTypeChange(type) {
      this.filters.type = type
      this.pagination.page = 1
      this.handleSearch()
    },

    handleSearch() {
      this.pagination.page = 1
      this.fetchCouponList()
    },

    handlePageChange(page) {
      this.pagination.page = page
      this.fetchCouponList()
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

    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleDateString()
    },

    getCouponTypeClass(coupon) {
      // 根据优惠券类型返回对应的样式类
      const typeMap = {
        0: 'universal-coupon',  // 通用券
        2: 'product-coupon',    // 商品券
        3: 'category-coupon',   // 分类券
        4: 'merchant-coupon'    // 商户券
      }
      return typeMap[coupon.category] || 'universal-coupon'
    },

    getCouponTypeText(coupon) {
      // 根据优惠券类型返回文字说明
      const typeMap = {
        0: '通用券',
        2: '商品券', 
        3: '品类券',
        4: '商户券'
      }
      return typeMap[coupon.category] || '通用券'
    },

    getValidityText(coupon) {
      // 根据优惠券有效期类型返回文字说明
      if (coupon.endTime) {
        const endDate = new Date(coupon.endTime)
        const now = new Date()
        const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 0) {
          return '已过期'
        } else if (diffDays <= 3) {
          return `${diffDays}天后过期`
        } else if (diffDays <= 30) {
          return `${diffDays}天内有效`
        } else {
          return '长期有效'
        }
      }
      return '不限时'
    },

    handleFilterChange() {
      this.pagination.page = 1
      this.fetchCouponList()
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-center {
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

.filter-bar {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .filter-label {
      font-weight: 500;
      color: #333;
    }
  }
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.coupon-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  // 不同类型优惠券的颜色主题
  &.universal-coupon {
    .coupon-type-tag {
      background: #ff6b6b;
      color: #fff;
    }
    .receive-btn {
      background: #ff6b6b;
      border-color: #ff6b6b;
      
      &:hover {
        background: #ff5252;
        border-color: #ff5252;
      }
    }
  }
  
  &.product-coupon {
    .coupon-type-tag {
      background: #4ecdc4;
      color: #fff;
    }
    .receive-btn {
      background: #4ecdc4;
      border-color: #4ecdc4;
      
      &:hover {
        background: #26d0ce;
        border-color: #26d0ce;
      }
    }
  }
  
  &.category-coupon {
    .coupon-type-tag {
      background: #45b7d1;
      color: #fff;
    }
    .receive-btn {
      background: #45b7d1;
      border-color: #45b7d1;
      
      &:hover {
        background: #3498db;
        border-color: #3498db;
      }
    }
  }
  
  &.merchant-coupon {
    .coupon-type-tag {
      background: #f39c12;
      color: #fff;
    }
    .receive-btn {
      background: #f39c12;
      border-color: #f39c12;
      
      &:hover {
        background: #e67e22;
        border-color: #e67e22;
      }
    }
  }
}

.coupon-type-tag {
  position: absolute;
  top: 0;
  left: 16px;
  padding: 4px 12px;
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  font-weight: 500;
}

.coupon-amount {
  text-align: center;
  margin: 20px 0 16px;
  
  .currency {
    font-size: 20px;
    font-weight: bold;
    vertical-align: top;
    margin-right: 2px;
  }
  
  .money {
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
  }
}

.coupon-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 12px;
  min-height: 22px;
}

.coupon-condition {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 12px;
}

.coupon-validity {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-bottom: 20px;
  min-height: 16px;
}

.coupon-action {
  text-align: center;
  
  .receive-btn,
  .received-btn {
    width: 100%;
    height: 36px;
    border-radius: 18px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .received-btn {
    background: #e8e8e8;
    border-color: #e8e8e8;
    color: #999;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-icon {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  .empty-text {
    font-size: 18px;
    color: #666;
    margin-bottom: 10px;
  }
  
  .empty-desc {
    font-size: 14px;
    color: #999;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

// 响应式设计
@media (max-width: 1024px) {
  .coupon-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .coupon-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 15px;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 15px;
    
    .filter-group {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }
}
</style> 