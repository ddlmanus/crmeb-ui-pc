<template>
  <div class="pay-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span @click="$router.push('/')">首页</span>
      <span> > </span>
      <span>确认订单</span>
    </div>

    <!-- 成功提示横幅 -->
    <div class="success-banner">
      <div class="banner-content">
        <div class="banner-left">
          <div class="success-title">订单提交成功! 去付款略~</div>
          <div class="countdown">
            剩余时间：<span class="time">{{ countdownText }}</span>
          </div>
        </div>
        <div class="banner-right">
          <div class="banner-icon">付款</div>
        </div>
      </div>
    </div>

    <!-- 订单信息 -->
    <div class="order-info">
      <div class="info-row">
        <span class="label">订单编号：</span>
        <span class="value">{{ orderInfo.orderSn || orderNo }}</span>
      </div>
      <div class="info-row">
        <span class="label">订单价格：</span>
        <span class="value price">{{ orderInfo.payPrice || totalPrice }}元</span>
      </div>
      <div class="info-row">
        <span class="label">收货信息：</span>
        <span class="value">{{ addressInfo }}</span>
      </div>
      <div class="info-row">
        <span class="label">商品名称：</span>
        <span class="value">{{ productNames }}</span>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-section">
      <div class="section-title">选择以下支付方式</div>
      <div class="payment-methods">
        <!-- 余额支付 -->
        <div
          class="payment-item"
          :class="{ selected: selectedPayMethod === 'yue', disabled: isBalanceInsufficient }"
          @click="!isBalanceInsufficient && selectPayMethod('yue')"
        >
          <div class="payment-icon">
            <div class="icon-circle">
              ¥
            </div>
          </div>
          <div class="payment-info">
            <div class="payment-name">余额支付</div>
            <div class="payment-balance">
              余额：{{ userBalance.toFixed(2) }}
              <span v-if="isBalanceInsufficient" class="insufficient">余额不足</span>
            </div>
          </div>
        </div>

        <!-- 微信支付 -->
        <div
          class="payment-item"
          :class="{ selected: selectedPayMethod === 'weixin' }"
          @click="selectPayMethod('weixin')"
        >
          <div class="payment-icon">
            <div class="icon-circle weixin">
              <i class="el-icon-chat-line-square"></i>
            </div>
          </div>
          <div class="payment-info">
            <div class="payment-name">微信支付</div>
          </div>
        </div>

        <!-- 支付宝支付 -->
        <div
          class="payment-item"
          :class="{ selected: selectedPayMethod === 'alipay' }"
          @click="selectPayMethod('alipay')"
        >
          <div class="payment-icon">
            <div class="icon-circle alipay">
              <i class="el-icon-wallet"></i>
            </div>
          </div>
          <div class="payment-info">
            <div class="payment-name">支付宝支付</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 去支付按钮 -->
    <div class="pay-button-section">
      <el-button
        type="primary"
        class="pay-button"
        :loading="paying"
        :disabled="!selectedPayMethod"
        @click="handlePay"
      >
        去支付
      </el-button>
    </div>

    <!-- 支付结果弹窗 -->
    <el-dialog
      title="支付处理中"
      :visible.sync="showPayDialog"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="pay-dialog-content">
        <div v-if="payStatus === 'processing'" class="pay-processing">
          <i class="el-icon-loading"></i>
          <p>正在处理支付，请稍候...</p>
        </div>
        <div v-else-if="payStatus === 'success'" class="pay-success">
          <i class="el-icon-circle-check"></i>
          <p>支付成功</p>
        </div>
        <div v-else-if="payStatus === 'failed'" class="pay-failed">
          <i class="el-icon-circle-close"></i>
          <p>支付失败</p>
          <p class="error-msg">{{ payErrorMsg }}</p>
        </div>
      </div>
      <div v-if="payStatus !== 'processing'" slot="footer" class="dialog-footer">
        <el-button v-if="payStatus === 'failed'" @click="showPayDialog = false">重新支付</el-button>
        <el-button v-if="payStatus === 'success'" type="primary" @click="goToOrderDetail">查看订单</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCashierInfo, orderPayment, queryWechatPayResult, queryAliPayResult, getPayConfig } from '@/api/payment'
import { getOrderDetail } from '@/api/order'

export default {
  name: 'OrderPay',
  data() {
    return {
      orderInfo: {},
      orderNo: '',
      totalPrice: '',
      addressInfo: '',
      productNames: '',
      userBalance: 0,
      loading: false,
      paying: false,
      selectedPayMethod: '',
      showPayDialog: false,
      payStatus: 'processing', // processing, success, failed
      payErrorMsg: '',
      payTimer: null,
      countdownTimer: null,
      countdown: 30 * 60, // 30分钟倒计时（秒）
      countdownText: '30分00秒'
    }
  },
  computed: {
    isBalanceInsufficient() {
      const payAmount = parseFloat(this.orderInfo.payPrice || this.totalPrice || 0)
      return this.userBalance < payAmount
    }
  },
  created() {
    this.initPayPage()
    this.startCountdown()
  },
  beforeDestroy() {
    if (this.payTimer) {
      clearInterval(this.payTimer)
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  methods: {
    async initPayPage() {
      // 从路由参数或query中获取订单信息
      this.orderNo = this.$route.params.orderSn || this.$route.query.orderNo
      this.totalPrice = this.$route.query.totalPrice || ''
      this.addressInfo = this.$route.query.addressInfo || ''
      this.productNames = this.$route.query.productNames || ''

      // 如果有订单号，尝试获取详细信息
      if (this.orderNo) {
        await this.fetchOrderInfo()
      }

      // 获取用户余额
      await this.fetchUserBalance()
    },

    async fetchOrderInfo() {
      try {
        this.loading = true
        const response = await getCashierInfo(this.orderNo)

        if (response.code === 200) {
          this.orderInfo = response.data

          // 处理收货地址信息
          if (response.data.address) {
            const addr = response.data.address
            this.addressInfo = `${addr.realName} ${addr.phone} ${addr.province}${addr.city}${addr.district} ${addr.detail}`
          }

          // 处理商品名称
          if (response.data.orderDetailList && response.data.orderDetailList.length > 0) {
            this.productNames = response.data.orderDetailList.map(item => item.productName).join('、')
          }
        }
      } catch (error) {
        console.error('获取订单信息失败:', error)
        // 如果获取订单详情失败，使用路由传来的基本信息
      } finally {
        this.loading = false
      }
    },

    async fetchUserBalance() {
      try {
        console.log('正在获取支付配置和用户余额...')
        const response = await getPayConfig()
        console.log('支付配置响应:', response)

        if (response.code === 200 && response.data) {
          // 从支付配置中获取用户余额
          this.userBalance = parseFloat(response.data.userBalance || 0)
          
          // 如果余额支付被禁用，则将余额设为0
          // 修正：yuePayStatus 可能是布尔值 true/false 或数字 1/0
          if (!response.data.yuePayStatus || response.data.yuePayStatus === 0) {
            this.userBalance = 0
          }
          
          console.log('余额支付状态:', response.data.yuePayStatus)
          console.log('用户余额:', this.userBalance)
        } else {
          this.userBalance = 0
        }
      } catch (error) {
        console.error('获取用户余额失败:', error)
        this.userBalance = 0
      }
    },

    startCountdown() {
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
          const minutes = Math.floor(this.countdown / 60)
          const seconds = this.countdown % 60
          this.countdownText = `${minutes.toString().padStart(2, '0')}分${seconds.toString().padStart(2, '0')}秒`
        } else {
          clearInterval(this.countdownTimer)
          this.countdownText = '00分00秒'
          this.$message.warning('订单已超时，请重新下单')
        }
      }, 1000)
    },

    selectPayMethod(code) {
      this.selectedPayMethod = code
    },

    getPayChannel(payType) {
      // 根据支付方式返回对应的支付渠道
      const channelMap = {
        'yue': 'yue',        // 余额支付
        'weixin': 'native',   // 微信支付 - PC端使用native扫码支付
        'alipay': 'alipayPc'  // 支付宝 - PC端支付
      }
      return channelMap[payType] || 'h5'
    },

    async handlePay() {
      if (!this.selectedPayMethod) {
        this.$message.warning('请选择支付方式')
        return
      }

      try {
        this.paying = true

        // 根据后端OrderPayRequest要求构建支付参数
        const payData = {
          orderNo: this.orderInfo.orderSn || this.orderNo,
          payType: this.selectedPayMethod,
          payChannel: this.getPayChannel(this.selectedPayMethod),
          from: 'pc'
        }

        console.log('支付请求参数:', payData)

        const response = await orderPayment(payData)

        if (response.code === 200) {
          // 保存支付返回的订单号
          if (response.data && response.data.orderNo) {
            this.orderNo = response.data.orderNo
          }

          // 显示支付处理弹窗
          this.showPayDialog = true
          this.payStatus = 'processing'

          // 如果是第三方支付，需要处理支付跳转或显示二维码
          if (this.selectedPayMethod === 'weixin') {
            this.handleWechatPay(response.data)
          } else if (this.selectedPayMethod === 'alipay') {
            this.handleAlipay(response.data)
          } else if (this.selectedPayMethod === 'yue') {
            // 余额支付直接查询结果
            this.checkPayResult(response.data.orderNo)
          }
        } else {
          this.$message.error(response.msg || '支付发起失败')
        }
      } catch (error) {
        console.error('支付失败:', error)
        this.$message.error('支付失败')
      } finally {
        this.paying = false
      }
    },

    handleWechatPay(payResult) {
      // 微信支付处理
      if (payResult.payUrl) {
        // 显示二维码或跳转
        window.open(payResult.payUrl)
      }
      // 开始轮询支付结果
      this.startPayResultQuery('wechat')
    },

    handleAlipay(payResult) {
      // 支付宝支付处理
      if (payResult.payUrl) {
        window.open(payResult.payUrl)
      }
      // 开始轮询支付结果
      this.startPayResultQuery('alipay')
    },

    startPayResultQuery(payType) {
      let queryCount = 0
      const maxQueries = 60 // 最多查询60次（5分钟）

      this.payTimer = setInterval(async() => {
        queryCount++

        try {
          // 获取正确的订单号
          const queryOrderNo = this.orderNo || (this.orderInfo && this.orderInfo.orderSn)
          
          if (!queryOrderNo) {
            this.payStatus = 'failed'
            this.payErrorMsg = '订单号不存在'
            clearInterval(this.payTimer)
            this.payTimer = null
            return
          }

          let response
          if (payType === 'wechat') {
            response = await queryWechatPayResult(queryOrderNo)
          } else if (payType === 'alipay') {
            response = await queryAliPayResult(queryOrderNo)
          }

          if (response.code === 200 && response.data) {
            // 支付成功
            this.payStatus = 'success'
            clearInterval(this.payTimer)
            this.payTimer = null
          } else if (queryCount >= maxQueries) {
            // 查询超时
            this.payStatus = 'failed'
            this.payErrorMsg = '支付超时，请重新支付'
            clearInterval(this.payTimer)
            this.payTimer = null
          }
        } catch (error) {
          console.error('查询支付结果失败:', error)
          if (queryCount >= maxQueries) {
            this.payStatus = 'failed'
            this.payErrorMsg = '查询支付结果失败'
            clearInterval(this.payTimer)
            this.payTimer = null
          }
        }
      }, 5000) // 每5秒查询一次
    },

    checkPayResult(orderNo = null) {
      // 余额支付直接查询结果
      setTimeout(async() => {
        try {
          // 使用传入的orderNo或者从组件数据中获取
          const queryOrderNo = orderNo || this.orderNo || (this.orderInfo && this.orderInfo.orderSn)
          
          console.log('查询支付结果的订单号:', queryOrderNo)
          
          if (!queryOrderNo) {
            this.payStatus = 'failed'
            this.payErrorMsg = '订单号不存在'
            return
          }

          const response = await queryWechatPayResult(queryOrderNo)
          if (response.code === 200 && response.data) {
            this.payStatus = 'success'
          } else {
            this.payStatus = 'failed'
            this.payErrorMsg = '余额支付失败'
          }
        } catch (error) {
          console.error('查询支付结果失败:', error)
          this.payStatus = 'failed'
          this.payErrorMsg = '支付查询失败'
        }
      }, 2000)
    },

    goToOrderDetail() {
      this.$router.push(`/order/detail/${this.orderInfo.orderSn}`)
    },

    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.pay-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0;
}

.breadcrumb {
  background: #fff;
  padding: 12px 20px;
  font-size: 14px;
  color: #666;

  span {
    cursor: pointer;

    &:hover {
      color: #ff6600;
    }
  }
}

.success-banner {
  background: linear-gradient(135deg, #ff6b42 0%, #ff8a65 100%);
  color: white;
  position: relative;
  overflow: hidden;

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    position: relative;
    z-index: 2;

    .banner-left {
      .success-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .countdown {
        font-size: 16px;

        .time {
          font-weight: 600;
          margin-left: 8px;
        }
      }
    }

    .banner-right {
      .banner-icon {
        background: rgba(255, 255, 255, 0.2);
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: 600;
        transform: rotate(-10deg);
      }
    }
  }
}

.order-info {
  background: #fff;
  padding: 24px 40px;

  .info-row {
    display: flex;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      min-width: 80px;
      color: #666;
      font-size: 14px;
    }

    .value {
      color: #333;
      font-size: 14px;

      &.price {
        color: #ff6600;
        font-weight: 600;
      }
    }
  }
}

.payment-section {
  background: #fff;
  margin-top: 20px;
  padding: 24px 40px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .payment-methods {
    display: flex;
    gap: 20px;

    .payment-item {
      flex: 1;
      border: 2px solid #e8e8e8;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover:not(.disabled) {
        border-color: #ff6600;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 102, 0, 0.15);
      }

      &.selected {
        border-color: #ff6600;
        background: #fff7f0;

        &::after {
          content: "✓";
          position: absolute;
          top: -1px;
          right: -1px;
          width: 20px;
          height: 20px;
          background: #ff6600;
          color: white;
          border-radius: 0 6px 0 6px;
          font-size: 12px;
          line-height: 20px;
          text-align: center;
        }
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f9f9f9;
      }

      .payment-icon {
        margin-bottom: 12px;

        .icon-circle {
          width: 50px;
          height: 50px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          color: white;
          background: #ff6600;

          &.weixin {
            background: #1aad19;
          }

          &.alipay {
            background: #1677ff;
          }
        }
      }

      .payment-info {
        .payment-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .payment-balance {
          font-size: 14px;
          color: #666;

          .insufficient {
            color: #ff4757;
            margin-left: 8px;
          }
        }
      }
    }
  }
}

.pay-button-section {
  background: #fff;
  margin-top: 20px;
  padding: 30px 40px;
  text-align: right;

  .pay-button {
    background: #ff6600;
    border-color: #ff6600;
    font-size: 16px;
    padding: 12px 40px;
    border-radius: 4px;

    &:hover {
      background: #e55a00;
      border-color: #e55a00;
    }

    &:disabled {
      background: #ccc;
      border-color: #ccc;
    }
  }
}

.pay-dialog-content {
  text-align: center;
  padding: 20px;

  i {
    font-size: 48px;
    margin-bottom: 15px;
    display: block;
  }

  .pay-processing i {
    color: #409eff;
    animation: spin 1s linear infinite;
  }

  .pay-success i {
    color: #67c23a;
  }

  .pay-failed i {
    color: #f56c6c;
  }

  p {
    margin: 10px 0;
    font-size: 16px;
  }

  .error-msg {
    color: #f56c6c;
    font-size: 14px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  .order-summary-content {
    flex-direction: column;
    gap: 20px;
  }

  .payment-option {
    .payment-icon {
      width: 40px;
      height: 40px;
      margin-right: 15px;

      i {
        font-size: 20px;
      }
    }
  }

  .pay-actions .el-button {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
