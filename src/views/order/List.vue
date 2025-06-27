<template>
  <div class="order-list-page">
    <div class="container">
      <div class="page-header">
        <h2>我的订单</h2>
      </div>

      <!-- 订单状态筛选 -->
      <div class="order-status-tabs">
        <div class="status-tab-list">
          <div
            v-for="tab in statusTabs"
            :key="tab.value"
            class="status-tab"
            :class="{ active: currentStatus === tab.value }"
            @click="handleStatusChange(tab.value)"
          >
            {{ tab.label }}
            <el-badge v-if="tab.count > 0" :value="tab.count" />
          </div>
        </div>
      </div>

      <!-- 调试信息 -->
      <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px;" v-if="$route.query.debug">
        <p><strong>调试信息：</strong></p>
        <p>orderList.length: {{ orderList.length }}</p>
        <p>orderList类型: {{ typeof orderList }}</p>
        <p>loading: {{ loading }}</p>
        <p>currentStatus: {{ currentStatus }}</p>
        <p>total: {{ total }}</p>
        <pre>{{ JSON.stringify(orderList, null, 2) }}</pre>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <div v-if="orderList && orderList.length > 0" class="order-items">
          <div v-for="order in orderList" :key="order.orderSn" class="order-item">
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <span class="order-sn">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ formatTime(order.createTime) }}</span>
              </div>
              <div class="order-status">
                <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
              </div>
            </div>

            <!-- 商品列表 -->
            <div class="order-goods">
              <div
                v-for="goods in (order.orderInfoList || [])"
                :key="goods.id"
                class="goods-item"
                @click="goToDetail(order.orderNo)"
              >
                <img :src="getImageUrl(goods.image)" :alt="goods.productName" />
                <div class="goods-info">
                  <h4>{{ goods.productName }}</h4>
                  <div class="goods-specs" v-if="goods.sku">{{ goods.sku }}</div>
                  <div class="goods-price">
                    <span class="price">¥{{ goods.price }}</span>
                    <span class="quantity">×{{ goods.payNum }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单金额和操作 -->
            <div class="order-footer">
              <div class="order-amount">
                <div class="amount-info">
                  <span>共{{ getTotalQuantity(order.orderInfoList) }}件商品</span>
                  <span class="total">合计：¥{{ order.payPrice || order.totalPrice || '0.00' }}</span>
                </div>
              </div>
              <div class="order-actions">
                <el-button size="small" @click="goToDetail(order.orderNo)">查看详情</el-button>

                <!-- 待支付 -->
                <template v-if="order.status === 0">
                  <el-button size="small" @click="handleCancel(order.orderNo)">取消订单</el-button>
                  <el-button type="primary" size="small" @click="handlePay(order)">立即付款</el-button>
                </template>

                <!-- 待发货 -->
                <template v-if="order.status === 1">
                  <el-button size="small" @click="handleCancel(order.orderNo)">申请取消</el-button>
                </template>

                <!-- 部分发货 -->
                <template v-if="order.status === 2">
                  <el-button size="small" @click="handleViewLogistics(order.orderNo)">查看物流</el-button>
                </template>

                <!-- 待核销 -->
                <template v-if="order.status === 3">
                  <el-button size="small" @click="handleViewLogistics(order.orderNo)">查看详情</el-button>
                </template>

                <!-- 待收货 -->
                <template v-if="order.status === 4">
                  <el-button size="small" @click="handleViewLogistics(order.orderNo)">查看物流</el-button>
                  <el-button type="primary" size="small" @click="handleConfirm(order.orderNo)">确认收货</el-button>
                </template>

                <!-- 已收货 -->
                <template v-if="order.status === 5">
                  <el-button size="small" @click="handleRefund(order)">申请售后</el-button>
                  <el-button type="primary" size="small" @click="handleReview(order.orderNo)">去评价</el-button>
                </template>

                <!-- 已完成 -->
                <template v-if="order.status === 6">
                  <el-button size="small" @click="handleRefund(order)">申请售后</el-button>
                  <el-button size="small" @click="handleDelete(order.orderNo)">删除订单</el-button>
                </template>

                <!-- 已取消 -->
                <template v-if="order.status === 9">
                  <el-button size="small" @click="handleDelete(order.orderNo)">删除订单</el-button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-orders">
          <div class="empty-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="empty-text">暂无订单</div>
          <div class="empty-desc">快去选购心仪的商品吧</div>
          <el-button type="primary" @click="$router.push('/')">去购物</el-button>
        </div>

        <!-- 加载状态 -->
        <div v-else class="loading-orders">
          <div class="loading-content">
            <i class="el-icon-loading"></i>
            <span>加载中...</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50]"
          :page-size="pagination.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderList, cancelOrder, confirmOrder, deleteOrder } from '@/api/order'

export default {
  name: 'OrderList',
  data() {
    return {
      orderList: [],
      loading: false,
      currentStatus: '',
      pagination: {
        page: 1,
        limit: 10
      },
      total: 0,
      statusTabs: [
        { label: '全部', value: '-1', count: 0 },
        { label: '待支付', value: '0', count: 0 },
        { label: '待发货', value: '1', count: 0 },
        { label: '部分发货', value: '2', count: 0 },
        { label: '待核销', value: '3', count: 0 },
        { label: '待收货', value: '4', count: 0 },
        { label: '已收货', value: '5', count: 0 },
        { label: '已完成', value: '6', count: 0 },
        { label: '已取消', value: '9', count: 0 }
      ]
    }
  },
  created() {
    // 从路由参数获取状态，默认为全部(-1)
    this.currentStatus = this.$route.query.status || '-1'
    this.fetchOrderList()
  },
  methods: {
    async fetchOrderList() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          status: this.currentStatus
        }

        console.log('获取订单列表请求参数:', params)
        const response = await getOrderList(params)
        console.log('订单列表API响应:', response)

        if (response.code === 200) {
          // 处理不同的响应数据结构
          let orderData = response.data

          // 如果data是数组，直接使用
          if (Array.isArray(orderData)) {
            this.orderList = orderData
            this.total = orderData.length
          }
          // 如果data是对象，尝试从list字段获取
          else if (orderData && orderData.list) {
            this.orderList = orderData.list || []
            this.total = orderData.total || 0
            this.updateStatusCounts(orderData.statusCounts || {})
          }
          // 如果data是对象但没有list，尝试从其他可能的字段获取
          else if (orderData && orderData.records) {
            this.orderList = orderData.records || []
            this.total = orderData.total || 0
          }
          // 如果都没有，设置为空
          else {
            this.orderList = []
            this.total = 0
          }

          console.log('处理后的订单列表:', this.orderList)
          console.log('订单列表长度:', this.orderList.length)
        } else {
          console.error('订单列表API返回错误:', response)
          this.orderList = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        this.$message.error('获取订单列表失败')
        this.orderList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    updateStatusCounts(counts) {
      this.statusTabs.forEach(tab => {
        tab.count = counts[tab.value] || 0
      })
    },

    handleStatusChange(status) {
      this.currentStatus = status
      this.pagination.page = 1
      this.$router.push({ query: { status } })
      this.fetchOrderList()
    },

    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.fetchOrderList()
    },

    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchOrderList()
    },

    goToDetail(orderNo) {
      this.$router.push(`/order/detail/${orderNo}`)
    },

    async handleCancel(orderSn) {
      try {
        await this.$confirm('确定要取消这个订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await cancelOrder(orderSn)
        this.$message.success('订单取消成功')
        this.fetchOrderList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消订单失败:', error)
          this.$message.error('取消订单失败')
        }
      }
    },

    handlePay(order) {
      // 跳转到支付页面
      this.$router.push(`/order/pay/${order.orderNo}`)
    },

    async handleConfirm(orderSn) {
      try {
        await this.$confirm('确定已收到商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await confirmOrder(orderSn)
        this.$message.success('确认收货成功')
        this.fetchOrderList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认收货失败:', error)
          this.$message.error('确认收货失败')
        }
      }
    },

    handleViewLogistics(orderSn) {
      // 查看物流信息
      this.$router.push(`/order/logistics/${orderSn}`)
    },

    handleReview(orderSn) {
      // 跳转到评价页面
      this.$router.push(`/order/review/${orderSn}`)
    },

    handleRefund(order) {
      // 跳转到申请售后页面
      this.$router.push(`/refund/apply/${order.id}`)
    },

    async handleDelete(orderSn) {
      try {
        await this.$confirm('确定要删除这个订单吗？删除后无法恢复', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteOrder(orderSn)
        this.$message.success('订单删除成功')
        this.fetchOrderList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除订单失败:', error)
          this.$message.error('删除订单失败')
        }
      }
    },

    getStatusType(status) {
      const typeMap = {
        0: 'warning',  // 待支付
        1: 'primary',  // 待发货
        2: 'primary',  // 部分发货
        3: 'primary',  // 待核销
        4: 'primary',  // 待收货
        5: 'success',  // 已收货
        6: 'success',  // 已完成
        9: 'info'      // 已取消
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        0: '待支付',
        1: '待发货',
        2: '部分发货',
        3: '待核销',
        4: '待收货',
        5: '已收货',
        6: '已完成',
        9: '已取消'
      }
      return textMap[status] || '未知状态'
    },

    getTotalQuantity(orderInfoList) {
      if (!orderInfoList || !Array.isArray(orderInfoList)) {
        return 0
      }
      return orderInfoList.reduce((total, item) => total + (item.payNum || 0), 0)
    },

    formatTime(time) {
      return new Date(time).toLocaleString()
    },

    getImageUrl(imagePath) {
      if (!imagePath) return ''

      // 如果已经是完整的URL，直接返回
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // 如果是相对路径，需要拼接域名
      const baseUrl = process.env.VUE_APP_BASE_URL || window.location.origin
      return imagePath.startsWith('/') ? baseUrl + imagePath : baseUrl + '/' + imagePath
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
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
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #333;
  }
}

.order-status-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;

  .status-tab-list {
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

      .el-badge {
        margin-left: 8px;
      }
    }
  }
}

.order-list {
  .order-items {
    display: grid;
    gap: 20px;
  }
}

.order-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;

    .order-info {
      display: flex;
      gap: 20px;

      .order-sn {
        font-weight: bold;
        color: #333;
      }

      .order-time {
        color: #999;
        font-size: 14px;
      }
    }
  }

  .order-goods {
    .goods-item {
      display: flex;
      padding: 20px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: #fafafa;
      }

      &:last-child {
        border-bottom: none;
      }

      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 15px;
      }

      .goods-info {
        flex: 1;

        h4 {
          margin: 0 0 8px;
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }

        .goods-specs {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
        }

        .goods-price {
          display: flex;
          align-items: center;
          gap: 10px;

          .price {
            color: #ff4757;
            font-weight: bold;
          }

          .quantity {
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #fafafa;

    .order-amount {
      .amount-info {
        text-align: right;

        span {
          color: #666;
          margin-right: 15px;
        }

        .total {
          font-size: 16px;
          color: #333;
          font-weight: bold;

          .amount {
            color: #ff4757;
            font-size: 18px;
          }
        }
      }
    }

    .order-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.empty-orders {
  background: #fff;
  border-radius: 8px;
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

.pagination {
  margin-top: 30px;
  text-align: center;
}

@media (max-width: 768px) {
  .order-status-tabs {
    padding: 0 10px;

    .status-tab-list {
      overflow-x: auto;
      white-space: nowrap;

      .status-tab {
        padding: 15px 20px;
        display: inline-block;
      }
    }
  }

  .order-item {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 15px;
    }

    .order-goods .goods-item {
      padding: 15px;

      img {
        width: 60px;
        height: 60px;
      }
    }

    .order-footer {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;
      padding: 15px;

      .order-actions {
        justify-content: center;
      }
    }
  }
}
</style>
