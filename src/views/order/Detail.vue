<template>
  <div class="order-detail-page">
    <div class="container">
      <div class="page-header">
        <div class="header-left">
          <el-button @click="$router.go(-1)" icon="el-icon-arrow-left">返回</el-button>
          <h2>订单详情</h2>
        </div>
        <div class="order-status">
          <el-tag :type="getStatusType(orderInfo.status)" size="large">
            {{ getStatusText(orderInfo.status) }}
          </el-tag>
        </div>
      </div>

      <div v-if="orderInfo.orderSn" class="order-content">
        <!-- 订单状态步骤条 -->
        <div class="status-steps">
          <el-steps :active="getStepActive(orderInfo.status)" align-center>
            <el-step title="提交订单" :description="formatTime(orderInfo.createTime)"></el-step>
            <el-step title="付款成功" :description="orderInfo.payTime ? formatTime(orderInfo.payTime) : ''"></el-step>
            <el-step title="商品出库" :description="orderInfo.deliveryTime ? formatTime(orderInfo.deliveryTime) : ''"></el-step>
            <el-step title="确认收货" :description="orderInfo.receiveTime ? formatTime(orderInfo.receiveTime) : ''"></el-step>
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
                <span class="value">{{ orderInfo.orderSn }}</span>
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
                <span class="label">配送方式：</span>
                <span class="value">{{ orderInfo.deliveryType === 1 ? '快递配送' : '到店自提' }}</span>
              </div>
              <div class="info-item" v-if="orderInfo.remark">
                <span class="label">订单备注：</span>
                <span class="value">{{ orderInfo.remark }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 收货地址信息 -->
        <div class="section address-section">
          <div class="section-title">
            <i class="el-icon-location"></i>
            收货地址
          </div>
          <div class="address-content">
            <div class="address-card">
              <div class="address-info">
                <div class="user-info">
                  <span class="name">{{ orderInfo.realName }}</span>
                  <span class="phone">{{ orderInfo.userPhone }}</span>
                </div>
                <div class="address-detail">
                  {{ orderInfo.userAddress }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="section goods-section">
          <div class="section-title">
            <i class="el-icon-goods"></i>
            商品信息
          </div>
          <div class="goods-list">
            <div class="goods-header">
              <div class="col-product">商品信息</div>
              <div class="col-price">单价</div>
              <div class="col-quantity">数量</div>
              <div class="col-total">小计</div>
            </div>
            <div 
              v-for="item in orderInfo.orderDetailList" 
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
                  </div>
                </div>
              </div>
              <div class="col-price">¥{{ item.price }}</div>
              <div class="col-quantity">{{ item.payNum }}</div>
              <div class="col-total">¥{{ (item.price * item.payNum).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 费用明细 -->
        <div class="section cost-section">
          <div class="section-title">
            <i class="el-icon-wallet"></i>
            费用明细
          </div>
          <div class="cost-content">
            <div class="cost-list">
              <div class="cost-item">
                <span class="label">商品金额：</span>
                <span class="value">¥{{ orderInfo.totalPrice }}</span>
              </div>
              <div class="cost-item">
                <span class="label">运费：</span>
                <span class="value">¥{{ orderInfo.shippingFee || '0.00' }}</span>
              </div>
              <div class="cost-item" v-if="orderInfo.couponPrice > 0">
                <span class="label">优惠券：</span>
                <span class="value discount">-¥{{ orderInfo.couponPrice }}</span>
              </div>
              <div class="cost-item total">
                <span class="label">实付金额：</span>
                <span class="value">¥{{ orderInfo.payPrice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div v-if="orderInfo.status >= 2" class="section logistics-section">
          <div class="section-title">
            <i class="el-icon-truck"></i>
            物流信息
          </div>
          <div class="logistics-content">
            <div v-if="logisticsInfo && logisticsInfo.length" class="logistics-list">
              <div 
                v-for="(item, index) in logisticsInfo" 
                :key="index" 
                class="logistics-item"
                :class="{ first: index === 0 }"
              >
                <div class="logistics-time">{{ item.time }}</div>
                <div class="logistics-status">{{ item.status }}</div>
              </div>
            </div>
            <div v-else class="no-logistics">
              <span>暂无物流信息</span>
              <el-button type="text" @click="fetchLogistics">刷新物流</el-button>
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
            
            <!-- 待收货 -->
            <template v-if="orderInfo.status === 2">
              <el-button @click="handleViewLogistics">查看物流</el-button>
              <el-button type="primary" @click="handleConfirm">确认收货</el-button>
            </template>
            
            <!-- 待评价 -->
            <template v-if="orderInfo.status === 3">
              <el-button @click="handleRefund">申请售后</el-button>
              <el-button type="primary" @click="handleReview">去评价</el-button>
            </template>
            
            <!-- 已完成 -->
            <template v-if="orderInfo.status === 4">
              <el-button @click="handleRefund">申请售后</el-button>
              <el-button @click="handleDelete">删除订单</el-button>
            </template>
            
            <!-- 已取消 -->
            <template v-if="orderInfo.status === -1">
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
      logisticsInfo: [],
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
        const response = await getOrderDetail(orderSn)
        
        if (response.code === 200) {
          this.orderInfo = response.data
          // 如果订单已发货，获取物流信息
          if (this.orderInfo.status >= 2) {
            this.fetchLogistics()
          }
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      } finally {
        this.loading = false
      }
    },

    async fetchLogistics() {
      try {
        // 这里调用物流查询接口
        // const response = await getLogisticsInfo(this.orderInfo.orderSn)
        // this.logisticsInfo = response.data || []
        
        // 模拟物流数据
        this.logisticsInfo = [
          { time: '2024-01-15 10:30:00', status: '商品已送达，感谢您的信任！' },
          { time: '2024-01-15 08:20:00', status: '快递员正在配送中，请保持手机畅通' },
          { time: '2024-01-14 16:45:00', status: '商品已到达本市分拣中心' },
          { time: '2024-01-14 09:15:00', status: '商品已发出，正在运输途中' },
          { time: '2024-01-13 14:30:00', status: '商品已打包，准备发货' }
        ]
      } catch (error) {
        console.error('获取物流信息失败:', error)
      }
    },

    async handleCancel() {
      try {
        await this.$confirm('确定要取消这个订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await cancelOrder(this.orderInfo.orderSn)
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
      this.$router.push(`/order/pay/${this.orderInfo.orderSn}`)
    },

    async handleConfirm() {
      try {
        await this.$confirm('确定已收到商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await confirmOrder(this.orderInfo.orderSn)
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
      this.$router.push(`/order/logistics/${this.orderInfo.orderSn}`)
    },

    handleReview() {
      this.$router.push(`/order/review/${this.orderInfo.orderSn}`)
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

        await deleteOrder(this.orderInfo.orderSn)
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
        0: 'warning',
        1: 'primary',
        2: 'primary',
        3: 'success',
        4: 'success',
        '-1': 'info'
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        0: '待支付',
        1: '待发货',
        2: '待收货',
        3: '待评价',
        4: '已完成',
        '-1': '已取消'
      }
      return textMap[status] || '未知状态'
    },

    getStepActive(status) {
      if (status === -1) return 0
      if (status === 0) return 1
      if (status === 1) return 2
      if (status === 2) return 3
      if (status >= 3) return 4
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
  margin-bottom: 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    
    h2 {
      margin: 0;
      color: #333;
    }
  }
}

.status-steps {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  
  ::v-deep .el-steps {
    .el-step__title {
      font-size: 14px;
      font-weight: bold;
    }
    
    .el-step__description {
      font-size: 12px;
      color: #999;
    }
  }
}

.section {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    font-weight: bold;
    color: #333;
    
    i {
      color: #409eff;
    }
  }
}

.order-info-content {
  padding: 20px;
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
    
    .info-item {
      display: flex;
      
      .label {
        color: #666;
        min-width: 100px;
      }
      
      .value {
        color: #333;
        flex: 1;
      }
    }
  }
}

.address-content {
  padding: 20px;
  
  .address-card {
    border: 2px solid #f0f0f0;
    border-radius: 8px;
    padding: 20px;
    
    .user-info {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      
      .name {
        font-weight: bold;
        color: #333;
      }
      
      .phone {
        color: #666;
      }
    }
    
    .address-detail {
      color: #666;
      line-height: 1.6;
    }
  }
}

.goods-list {
  .goods-header {
    display: grid;
    grid-template-columns: 1fr 120px 120px 120px;
    padding: 15px 20px;
    background: #fafafa;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .goods-item {
    display: grid;
    grid-template-columns: 1fr 120px 120px 120px;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .col-product {
    .product-info {
      display: flex;
      gap: 15px;
      
      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .product-details {
        flex: 1;
        
        h4 {
          margin: 0 0 8px;
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }
        
        .product-specs {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
  
  .col-price, .col-quantity, .col-total {
    text-align: center;
    color: #333;
  }
  
  .col-total {
    color: #ff4757;
    font-weight: bold;
  }
}

.cost-content {
  padding: 20px;
  
  .cost-list {
    max-width: 400px;
    margin-left: auto;
    
    .cost-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      
      .label {
        color: #666;
      }
      
      .value {
        color: #333;
        
        &.discount {
          color: #67c23a;
        }
      }
      
      &.total {
        border-top: 1px solid #f0f0f0;
        margin-top: 10px;
        padding-top: 15px;
        font-size: 16px;
        font-weight: bold;
        
        .value {
          color: #ff4757;
        }
      }
    }
  }
}

.logistics-content {
  padding: 20px;
  
  .logistics-list {
    .logistics-item {
      display: flex;
      gap: 20px;
      padding: 15px 0;
      border-bottom: 1px solid #f5f5f5;
      position: relative;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.first {
        .logistics-time {
          color: #409eff;
          font-weight: bold;
        }
        
        .logistics-status {
          color: #409eff;
        }
      }
      
      .logistics-time {
        min-width: 150px;
        color: #666;
        font-size: 14px;
      }
      
      .logistics-status {
        flex: 1;
        color: #333;
        line-height: 1.6;
      }
    }
  }
  
  .no-logistics {
    text-align: center;
    padding: 40px;
    color: #666;
  }
}

.action-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  
  .action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
  }
}

.loading-state, .error-state {
  background: #fff;
  border-radius: 8px;
  padding: 80px 20px;
  text-align: center;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    color: #409eff;
    
    i {
      font-size: 40px;
    }
  }
  
  .error-icon {
    font-size: 80px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  .error-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 30px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .status-steps {
    padding: 20px 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr !important;
  }
  
  .goods-header, .goods-item {
    grid-template-columns: 1fr 80px 80px 80px;
    padding: 15px;
    font-size: 12px;
  }
  
  .col-product .product-info {
    gap: 10px;
    
    img {
      width: 60px;
      height: 60px;
    }
    
    .product-details h4 {
      font-size: 13px;
    }
  }
  
  .action-buttons {
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style> 