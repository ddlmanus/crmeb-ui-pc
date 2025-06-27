<template>
  <div class="coupon-center-page">
    <div class="container">
      <div class="page-header">
        <h2>领券中心</h2>
        <p>更多优惠券，更多实惠</p>
        <el-button type="text" @click="$router.push('/user/coupon')">
          <i class="el-icon-tickets"></i>
          我的优惠券
        </el-button>
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
            <span class="money">{{ formatMoney(coupon.money) }}</span>
          </div>

          <!-- 优惠券标题 -->
          <div class="coupon-title">{{ coupon.name || '优惠券' }}</div>

          <!-- 使用条件 -->
          <div class="coupon-condition">
            满{{ formatMoney(coupon.minPrice) }}可用
          </div>

          <!-- 有效期 -->
          <div class="coupon-validity">
            {{ getValidityText(coupon) }}
          </div>

          <!-- 剩余数量 -->
          <div class="coupon-stock">
            剩余：{{ coupon.stock || 0 }}张
          </div>

          <!-- 领取按钮 -->
          <div class="coupon-action">
            <el-button
              v-if="!coupon.isReceived && coupon.stock > 0"
              type="danger"
              size="small"
              :loading="receiving === coupon.id"
              @click="handleReceive(coupon)"
              class="receive-btn"
            >
              立即领取
            </el-button>
            <el-button
              v-else-if="coupon.isReceived"
              disabled
              size="small"
              class="received-btn"
            >
              已领取
            </el-button>
            <el-button
              v-else
              disabled
              size="small"
              class="sold-out-btn"
            >
              已抢完
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && couponList.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="el-icon-present"></i>
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
        console.log('领券中心数据:', response)

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
        const response = await receiveCoupon(coupon.id)
        
        if (response.code === 200) {
          this.$message.success('领取成功')
          
          // 更新券状态
          coupon.isReceived = true
          coupon.stock = Math.max(0, coupon.stock - 1)
        } else {
          this.$message.error(response.message || '领取失败')
        }
      } catch (error) {
        console.error('领取优惠券失败:', error)
        this.$message.error(error.message || '领取失败')
      } finally {
        this.receiving = null
      }
    },

    handleFilterChange() {
      this.pagination.page = 1
      this.fetchCouponList()
    },

    handlePageChange(page) {
      this.pagination.page = page
      this.fetchCouponList()
    },

    getCouponTypeClass(coupon) {
      const typeClassMap = {
        'universal': 'coupon-universal',
        'product': 'coupon-product',
        'category': 'coupon-category',
        'merchant': 'coupon-merchant'
      }
      return typeClassMap[coupon.category] || 'coupon-default'
    },

    getCouponTypeText(coupon) {
      const typeTextMap = {
        'universal': '通用券',
        'product': '商品券',
        'category': '分类券',
        'merchant': '商户券'
      }
      return typeTextMap[coupon.category] || '优惠券'
    },

    formatMoney(money) {
      return ((money || 0) / 100).toFixed(2)
    },

    getValidityText(coupon) {
      if (coupon.endTime) {
        const endTime = new Date(coupon.endTime)
        return `有效期至 ${this.formatDate(endTime)}`
      }
      return '永久有效'
    },

    formatDate(date) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-center-page {
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
  padding: 40px 20px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  color: #fff;
  border-radius: 8px;
  position: relative;

  h2 {
    margin: 0 0 10px;
    font-size: 28px;
    font-weight: 600;
  }

  p {
    margin: 0 0 20px;
    font-size: 16px;
    opacity: 0.9;
  }

  .el-button {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #fff;
    border-color: rgba(255, 255, 255, 0.5);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #fff;
    }
  }
}

.filter-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 15px;

    .filter-label {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .el-radio-group {
      :deep(.el-radio-button) {
        .el-radio-button__inner {
          border-color: #e4e4e4;
          
          &:hover {
            color: #ff6600;
            border-color: #ff6600;
          }
        }
        
        &.is-active .el-radio-button__inner {
          background-color: #ff6600;
          border-color: #ff6600;
        }
      }
    }
  }
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  .coupon-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    &.coupon-universal {
      border-left: 4px solid #ff6600;
    }

    &.coupon-product {
      border-left: 4px solid #67c23a;
    }

    &.coupon-category {
      border-left: 4px solid #409eff;
    }

    &.coupon-merchant {
      border-left: 4px solid #e6a23c;
    }

    .coupon-type-tag {
      position: absolute;
      top: 0;
      right: 0;
      background: #ff6600;
      color: #fff;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 0 12px 0 12px;
    }

    .coupon-amount {
      display: flex;
      align-items: baseline;
      margin-bottom: 15px;
      color: #ff6600;

      .currency {
        font-size: 16px;
        margin-right: 2px;
      }

      .money {
        font-size: 32px;
        font-weight: 600;
      }
    }

    .coupon-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .coupon-condition {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .coupon-validity {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }

    .coupon-stock {
      font-size: 12px;
      color: #e6a23c;
      margin-bottom: 15px;
    }

    .coupon-action {
      .receive-btn {
        width: 100%;
        background: #ff6600;
        border-color: #ff6600;
        color: #fff;

        &:hover {
          background: #e55a00;
          border-color: #e55a00;
        }
      }

      .received-btn {
        width: 100%;
        background: #67c23a;
        border-color: #67c23a;
        color: #fff;
      }

      .sold-out-btn {
        width: 100%;
        background: #ccc;
        border-color: #ccc;
        color: #fff;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;

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
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pager li.active {
      background-color: #ff6600;
      border-color: #ff6600;
    }

    .btn-next,
    .btn-prev {
      &:hover {
        color: #ff6600;
      }
    }
  }
}

@media (max-width: 768px) {
  .coupon-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .page-header {
    .el-button {
      position: static;
      margin-top: 10px;
    }
  }

  .filter-bar {
    .filter-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}
</style> 