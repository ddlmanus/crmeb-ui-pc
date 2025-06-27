<template>
  <div class="user-coupon-page">
    <div class="container">
      <div class="page-header">
        <h2>我的优惠券</h2>
        <el-button type="primary" @click="$router.push('/coupon/center')">
          <i class="el-icon-plus"></i>
          去领券中心
        </el-button>
      </div>

      <!-- 筛选标签 -->
      <div class="filter-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabChange">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="未使用" name="unused"></el-tab-pane>
          <el-tab-pane label="已使用" name="used"></el-tab-pane>
          <el-tab-pane label="已过期" name="expired"></el-tab-pane>
        </el-tabs>
      </div>

      <!-- 优惠券列表 -->
      <div v-loading="loading" class="coupon-list">
        <div
          v-for="coupon in couponList"
          :key="coupon.id"
          class="coupon-item"
          :class="getCouponStatusClass(coupon)"
        >
          <div class="coupon-left">
            <div class="coupon-amount">
              <span class="currency">¥</span>
              <span class="money">{{ formatMoney(coupon.money) }}</span>
            </div>
            <div class="coupon-condition">
              满{{ formatMoney(coupon.minPrice) }}可用
            </div>
          </div>
          
          <div class="coupon-content">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div class="coupon-desc">{{ coupon.title || '优惠券' }}</div>
            <div class="coupon-time">
              {{ getValidityText(coupon) }}
            </div>
          </div>

          <div class="coupon-actions">
            <el-button
              v-if="coupon.status === 'unused'"
              type="primary"
              size="small"
              @click="useCoupon(coupon)"
            >
              立即使用
            </el-button>
            <span v-else-if="coupon.status === 'used'" class="status-text used">
              已使用
            </span>
            <span v-else-if="coupon.status === 'expired'" class="status-text expired">
              已过期
            </span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && couponList.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="el-icon-tickets"></i>
        </div>
        <div class="empty-text">
          {{ getEmptyText() }}
        </div>
        <div class="empty-actions">
          <el-button type="primary" @click="$router.push('/coupon/center')">
            去领券中心
          </el-button>
        </div>
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
import { getUserCoupons } from '@/api/coupon'

export default {
  name: 'UserCoupon',
  data() {
    return {
      loading: false,
      activeTab: 'all',
      couponList: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 10
      }
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
          status: this.activeTab // getUserCoupons会自动处理status到type的映射
        }

        const response = await getUserCoupons(params)
        console.log('用户优惠券数据:', response)

        if (response.code === 200) {
          let data = response.data
          if (Array.isArray(data)) {
            this.couponList = data
            this.total = data.length
          } else if (data && data.list) {
            this.couponList = data.list || []
            this.total = data.total || 0
          } else {
            this.couponList = []
            this.total = 0
          }

          // 处理优惠券状态
          this.couponList = this.couponList.map(coupon => {
            return {
              ...coupon,
              status: this.getCouponStatus(coupon)
            }
          })
        }
      } catch (error) {
        console.error('获取用户优惠券失败:', error)
        this.$message.error('获取优惠券失败')
        this.couponList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    handleTabChange() {
      this.pagination.page = 1
      this.fetchCouponList()
    },

    handlePageChange(page) {
      this.pagination.page = page
      this.fetchCouponList()
    },

    getCouponStatus(coupon) {
      if (coupon.status === 1) {
        return 'used'
      }
      const now = new Date()
      const endTime = new Date(coupon.endTime)
      if (endTime < now) {
        return 'expired'
      }
      return 'unused'
    },

    getCouponStatusClass(coupon) {
      return {
        'coupon-used': coupon.status === 'used',
        'coupon-expired': coupon.status === 'expired'
      }
    },

    formatMoney(money) {
      return (money || 0).toFixed(2)
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
    },

    getEmptyText() {
      const textMap = {
        all: '暂无优惠券',
        unused: '暂无未使用的优惠券',
        used: '暂无已使用的优惠券',
        expired: '暂无已过期的优惠券'
      }
      return textMap[this.activeTab] || '暂无优惠券'
    },

    useCoupon(coupon) {
      // 跳转到商品页面使用优惠券
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.user-coupon-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 500;
  }

  .el-button {
    background: #ff6600;
    border-color: #ff6600;

    &:hover {
      background: #e55a00;
      border-color: #e55a00;
    }
  }
}

.filter-tabs {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;

  :deep(.el-tabs) {
    .el-tabs__header {
      margin: 0;
      padding: 0 20px;
    }

    .el-tabs__active-bar {
      background-color: #ff6600;
    }

    .el-tabs__item {
      &.is-active {
        color: #ff6600;
      }
    }
  }
}

.coupon-list {
  .coupon-item {
    display: flex;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;

    &.coupon-used,
    &.coupon-expired {
      opacity: 0.6;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.1);
        pointer-events: none;
      }
    }

    .coupon-left {
      background: linear-gradient(135deg, #ff6600, #ff8533);
      color: #fff;
      padding: 20px;
      min-width: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        background: #f5f5f5;
        border-radius: 50%;
      }

      .coupon-amount {
        display: flex;
        align-items: baseline;
        margin-bottom: 8px;

        .currency {
          font-size: 14px;
        }

        .money {
          font-size: 28px;
          font-weight: 600;
        }
      }

      .coupon-condition {
        font-size: 12px;
        opacity: 0.9;
      }
    }

    .coupon-content {
      flex: 1;
      padding: 20px;

      .coupon-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
      }

      .coupon-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .coupon-time {
        font-size: 12px;
        color: #999;
      }
    }

    .coupon-actions {
      padding: 20px;
      display: flex;
      align-items: center;

      .el-button {
        background: #ff6600;
        border-color: #ff6600;

        &:hover {
          background: #e55a00;
          border-color: #e55a00;
        }
      }

      .status-text {
        font-size: 14px;
        padding: 6px 12px;
        border-radius: 4px;

        &.used {
          color: #67c23a;
          background: #f0f9ff;
        }

        &.expired {
          color: #f56c6c;
          background: #fef0f0;
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;

  .empty-icon {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 20px;
  }

  .empty-text {
    font-size: 16px;
    color: #999;
    margin-bottom: 20px;
  }

  .empty-actions {
    .el-button {
      background: #ff6600;
      border-color: #ff6600;

      &:hover {
        background: #e55a00;
        border-color: #e55a00;
      }
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;

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
</style>
