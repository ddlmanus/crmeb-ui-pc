<template>
  <div class="order-detail-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <el-button @click="$router.go(-1)" icon="el-icon-arrow-left" size="medium">返回</el-button>
          <h2>订单详情</h2>
        </div>
        <div class="order-status" v-if="orderInfo.orderNo">
          <el-tag :type="getStatusType(orderInfo.status)" size="large">
            {{ getStatusText(orderInfo.status) }}
          </el-tag>
        </div>
      </div>

      <div v-if="orderInfo.orderNo" class="order-content">
        <!-- 订单状态步骤条 -->
        <div class="status-steps">
          <el-steps :active="getStepActive(orderInfo.status)" align-center>
            <el-step title="提交订单" :description="formatTime(orderInfo.createTime)"></el-step>
            <el-step title="付款成功" :description="orderInfo.payTime ? formatTime(orderInfo.payTime) : ''"></el-step>
            <el-step title="商品出库" description=""></el-step>
            <el-step title="确认收货" description=""></el-step>
          </el-steps>
        </div>

        <!-- 订单基本信息 -->
        <div class="section order-info-section">
          <div class="section-title">
            <i class="el-icon-document"></i>
            订单信息
          </div>
          <div class="order-info-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">订单编号：</span>
                <span class="value">{{ orderInfo.orderNo }}</span>
              </div>
              <div class="info-item">
                <span class="label">下单时间：</span>
                <span class="value">{{ formatTime(orderInfo.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">支付方式：</span>
                <span class="value">{{ getPayTypeText(orderInfo.payType) }}</span>
              </div>
              <div class="info-item">
                <span class="label">支付状态：</span>
                <span class="value">{{ orderInfo.paid ? '已支付' : '未支付' }}</span>
              </div>
              <div class="info-item" v-if="orderInfo.payTime">
                <span class="label">支付时间：</span>
                <span class="value">{{ formatTime(orderInfo.payTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">订单类型：</span>
                <span class="value">{{ getOrderTypeText(orderInfo.type) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 商户订单列表 -->
        <div v-for="(merchantOrder, index) in orderInfo.merchantOrderList" :key="index" class="section merchant-section">
          <div class="section-title">
            <i class="el-icon-shop"></i>
            {{ merchantOrder.merName || '商户订单' }}
            <span class="merchant-tag" v-if="merchantOrder.isSelf">自营</span>
          </div>

          <!-- 收货地址信息 -->
          <div class="address-content">
            <div class="address-card">
              <div class="address-info">
                <div class="user-info">
                  <span class="name">{{ merchantOrder.realName }}</span>
                  <span class="phone">{{ merchantOrder.userPhone }}</span>
                </div>
                <div class="address-detail">
                  {{ merchantOrder.userAddress }}
                </div>
                <div class="shipping-type">
                  配送方式：{{ getShippingTypeText(merchantOrder.shippingType) }}
                </div>
                <div v-if="merchantOrder.verifyCode" class="verify-code">
                  核销码：<span class="code">{{ merchantOrder.verifyCode }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品列表 -->
          <div class="goods-list">
            <div class="goods-header">
              <div class="col-product">商品信息</div>
              <div class="col-price">单价</div>
              <div class="col-quantity">数量</div>
              <div class="col-total">小计</div>
            </div>
            <div
              v-for="item in merchantOrder.orderInfoList"
              :key="item.id"
              class="goods-item"
            >
              <div class="col-product">
                <div class="product-info">
                  <img :src="item.image" :alt="item.productName" />
                  <div class="product-details">
                    <h4>{{ item.productName }}</h4>
                    <div class="product-specs" v-if="item.sku">
                      {{ item.sku }}
                    </div>
                    <div class="product-type">
                      {{ getProductTypeText(item.productType) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-price">¥{{ item.price }}</div>
              <div class="col-quantity">{{ item.payNum }}</div>
              <div class="col-total">¥{{ (item.price * item.payNum).toFixed(2) }}</div>
            </div>
          </div>

          <!-- 商户订单费用明细 -->
          <div class="cost-content">
            <div class="cost-list">
              <div class="cost-item">
                <span class="label">商品金额：</span>
                <span class="value">¥{{ merchantOrder.proTotalPrice }}</span>
              </div>
              <div class="cost-item">
                <span class="label">运费：</span>
                <span class="value">¥{{ merchantOrder.totalPostage || '0.00' }}</span>
              </div>
              <div class="cost-item" v-if="merchantOrder.couponPrice > 0">
                <span class="label">优惠券：</span>
                <span class="value discount">-¥{{ merchantOrder.couponPrice }}</span>
              </div>
              <div class="cost-item" v-if="merchantOrder.integralPrice > 0">
                <span class="label">积分抵扣：</span>
                <span class="value discount">-¥{{ merchantOrder.integralPrice }}</span>
              </div>
              <div class="cost-item" v-if="merchantOrder.svipDiscountPrice > 0">
                <span class="label">会员优惠：</span>
                <span class="value discount">-¥{{ merchantOrder.svipDiscountPrice }}</span>
              </div>
              <div class="cost-item total">
                <span class="label">小计：</span>
                <span class="value">¥{{ merchantOrder.payPrice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单总费用明细 -->
        <div class="section total-cost-section">
          <div class="section-title">
            <i class="el-icon-wallet"></i>
            订单总费用
          </div>
          <div class="cost-content">
            <div class="cost-list">
              <div class="cost-item">
                <span class="label">商品总金额：</span>
                <span class="value">¥{{ orderInfo.proTotalPrice }}</span>
              </div>
              <div class="cost-item">
                <span class="label">总运费：</span>
                <span class="value">¥{{ orderInfo.totalPostage || '0.00' }}</span>
              </div>
              <div class="cost-item" v-if="orderInfo.platCouponPrice > 0">
                <span class="label">平台优惠券：</span>
                <span class="value discount">-¥{{ orderInfo.platCouponPrice }}</span>
              </div>
              <div class="cost-item" v-if="orderInfo.merCouponPrice > 0">
                <span class="label">商户优惠券：</span>
                <span class="value discount">-¥{{ orderInfo.merCouponPrice }}</span>
              </div>
              <div class="cost-item" v-if="orderInfo.integralPrice > 0">
                <span class="label">积分抵扣：</span>
                <span class="value discount">-¥{{ orderInfo.integralPrice }} ({{ orderInfo.useIntegral }}积分)</span>
              </div>
              <div class="cost-item" v-if="orderInfo.svipDiscountPrice > 0">
                <span class="label">会员优惠：</span>
                <span class="value discount">-¥{{ orderInfo.svipDiscountPrice }}</span>
              </div>
              <div class="cost-item total-final">
                <span class="label">实付金额：</span>
                <span class="value">¥{{ orderInfo.payPrice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <div class="action-buttons">
            <!-- 待支付 -->
            <template v-if="orderInfo.status === 0">
              <el-button @click="handleCancel">取消订单</el-button>
              <el-button type="primary" @click="handlePay">立即付款</el-button>
            </template>

            <!-- 待发货 -->
            <template v-if="orderInfo.status === 1">
              <el-button @click="handleCancel">取消订单</el-button>
            </template>

            <!-- 待收货 -->
            <template v-if="orderInfo.status === 4">
              <el-button @click="handleViewLogistics">查看物流</el-button>
              <el-button type="primary" @click="handleConfirm">确认收货</el-button>
            </template>

            <!-- 已收货/待评价 -->
            <template v-if="orderInfo.status === 5">
              <el-button @click="handleRefund">申请售后</el-button>
              <el-button type="primary" @click="handleReview">去评价</el-button>
            </template>

            <!-- 已完成 -->
            <template v-if="orderInfo.status === 6">
              <el-button @click="handleRefund">申请售后</el-button>
              <el-button @click="handleDelete">删除订单</el-button>
            </template>

            <!-- 已取消 -->
            <template v-if="orderInfo.status === 9">
              <el-button @click="handleDelete">删除订单</el-button>
            </template>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-content">
          <i class="el-icon-loading"></i>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <div class="error-icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="error-text">订单不存在或已被删除</div>
        <el-button type="primary" @click="$router.push('/order/list')">返回订单列表</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderDetail, cancelOrder, confirmOrder, deleteOrder } from '@/api/order'

export default {
  name: 'OrderDetail',
  data() {
    return {
      orderInfo: {},
      loading: false
    }
  },
  created() {
    this.fetchOrderDetail()
  },
  methods: {
    async fetchOrderDetail() {
      try {
        this.loading = true
        const orderSn = this.$route.params.orderSn
        console.log('获取订单详情，订单号:', orderSn)
        
        const response = await getOrderDetail(orderSn)
        console.log('订单详情响应:', response)

        if (response.code === 200 && response.data) {
          this.orderInfo = response.data
          console.log('订单信息:', this.orderInfo)
        } else {
          console.error('订单详情接口返回错误:', response)
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      } finally {
        this.loading = false
      }
    },

    async handleCancel() {
      try {
        await this.$confirm('确定要取消这个订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await cancelOrder(this.orderInfo.orderNo)
        this.$message.success('订单取消成功')
        this.fetchOrderDetail()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消订单失败:', error)
          this.$message.error('取消订单失败')
        }
      }
    },

    handlePay() {
      this.$router.push(`/order/pay/${this.orderInfo.orderNo}?totalPrice=${this.orderInfo.payPrice}&orderNo=${this.orderInfo.orderNo}`)
    },

    async handleConfirm() {
      try {
        await this.$confirm('确定已收到商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await confirmOrder(this.orderInfo.orderNo)
        this.$message.success('确认收货成功')
        this.fetchOrderDetail()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认收货失败:', error)
          this.$message.error('确认收货失败')
        }
      }
    },

    handleViewLogistics() {
      this.$router.push(`/order/logistics/${this.orderInfo.orderNo}`)
    },

    handleReview() {
      this.$router.push(`/order/review/${this.orderInfo.orderNo}`)
    },

    handleRefund() {
      this.$router.push(`/refund/apply/${this.orderInfo.id}`)
    },

    async handleDelete() {
      try {
        await this.$confirm('确定要删除这个订单吗？删除后无法恢复', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteOrder(this.orderInfo.orderNo)
        this.$message.success('订单删除成功')
        this.$router.push('/order/list')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除订单失败:', error)
          this.$message.error('删除订单失败')
        }
      }
    },

    getStatusType(status) {
      const typeMap = {
        0: 'warning',   // 待支付
        1: 'primary',   // 待发货
        2: 'primary',   // 部分发货
        3: 'primary',   // 待核销
        4: 'primary',   // 待收货
        5: 'success',   // 已收货
        6: 'success',   // 已完成
        9: 'info'       // 已取消
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

    getStepActive(status) {
      if (status === 9) return 0  // 已取消
      if (status === 0) return 1  // 待支付
      if (status === 1) return 2  // 待发货
      if (status === 2 || status === 3 || status === 4) return 3  // 已发货
      if (status >= 5) return 4   // 已完成
      return 0
    },

    getPayTypeText(payType) {
      const typeMap = {
        'weixin': '微信支付',
        'alipay': '支付宝',
        'yue': '余额支付'
      }
      return typeMap[payType] || '未知支付方式'
    },

    getOrderTypeText(type) {
      const typeMap = {
        0: '普通订单',
        1: '秒杀订单',
        2: '拼团订单'
      }
      return typeMap[type] || '未知类型'
    },

    getShippingTypeText(shippingType) {
      const typeMap = {
        1: '快递配送',
        2: '门店自提',
        3: '虚拟发货'
      }
      return typeMap[shippingType] || '未知配送方式'
    },

    getProductTypeText(productType) {
      const typeMap = {
        0: '普通商品',
        1: '积分商品',
        2: '虚拟商品',
        4: '视频号商品',
        5: '云盘商品',
        6: '卡密商品'
      }
      return typeMap[productType] || ''
    },

    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-page {
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
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  .order-status {
    .el-tag {
      font-size: 14px;
      padding: 8px 16px;
    }
  }
}

.status-steps {
  background: #fff;
  padding: 30px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .section-title {
    background: #fafafa;
    padding: 16px 24px;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: #ff6600;
    }

    .merchant-tag {
      background: #ff6600;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 8px;
    }
  }
}

.order-info-content {
  padding: 24px;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;

    .info-item {
      display: flex;
      
      .label {
        min-width: 100px;
        color: #666;
        font-size: 14px;
      }

      .value {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.address-content {
  padding: 24px;

  .address-card {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 20px;
    
    .address-info {
      .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;

        .name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .phone {
          color: #666;
          font-size: 14px;
        }
      }

      .address-detail {
        color: #333;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .shipping-type {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .verify-code {
        color: #666;
        font-size: 14px;

        .code {
          color: #ff6600;
          font-weight: 600;
          font-family: monospace;
        }
      }
    }
  }
}

.goods-list {
  .goods-header {
    display: grid;
    grid-template-columns: 2fr 120px 80px 120px;
    gap: 16px;
    padding: 16px 24px;
    background: #fafafa;
    border-bottom: 1px solid #eee;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .goods-item {
    display: grid;
    grid-template-columns: 2fr 120px 80px 120px;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    .col-product {
      .product-info {
        display: flex;
        gap: 12px;

        img {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          object-fit: cover;
        }

        .product-details {
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            line-height: 1.4;
          }

          .product-specs {
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }

          .product-type {
            font-size: 12px;
            color: #ff6600;
            background: #fff7f0;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
          }
        }
      }
    }

    .col-price, .col-quantity, .col-total {
      text-align: center;
      font-size: 14px;
      color: #333;
    }

    .col-price, .col-total {
      font-weight: 600;
      color: #ff6600;
    }
  }
}

.cost-content {
  padding: 24px;

  .cost-list {
    max-width: 400px;
    margin-left: auto;

    .cost-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;

      .label {
        color: #666;
      }

      .value {
        color: #333;
        font-weight: 500;

        &.discount {
          color: #ff6600;
        }
      }

      &.total, &.total-final {
        border-top: 1px solid #eee;
        padding-top: 12px;
        margin-top: 8px;
        font-size: 16px;
        font-weight: 600;

        .value {
          color: #ff6600;
          font-size: 18px;
        }
      }

      &.total-final {
        .value {
          font-size: 20px;
        }
      }
    }
  }
}

.action-section {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .loading-content, .error-icon {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 16px;

    i {
      font-size: 48px;
    }
  }

  .error-text {
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .goods-header, .goods-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .col-price, .col-quantity, .col-total {
    text-align: left !important;
    
    &::before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 8px;
    }
  }

  .info-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
