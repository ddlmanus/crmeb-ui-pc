<template>
  <div class="order-confirm-container">
    <div class="main-content">
      <!-- 收货地址 -->
      <div class="address-section">
        <h3>收货地址</h3>
        <div v-if="!selectedAddress" class="no-address">
          <p>请添加收货地址</p>
          <el-button type="primary" @click="showAddressDialog = true">添加地址</el-button>
        </div>
        <div v-else class="address-card selected">
          <div class="address-info">
            <span class="name">{{ selectedAddress.realName }}</span>
            <span class="phone">{{ selectedAddress.phone }}</span>
            <span class="default" v-if="selectedAddress.isDefault">默认</span>
          </div>
          <div class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</div>
          <el-button class="change-btn" size="small" @click="showAddressDialog = true">更换</el-button>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="goods-section">
        <h3>商品信息</h3>
        <div class="goods-list">
          <div v-for="merchant in preOrderData.merchantInfoList" :key="merchant.merId" class="merchant-group">
            <div class="merchant-header">
              <i class="store-icon">🏪</i>
              <span class="merchant-name">{{ merchant.merName }}</span>
            </div>
            <div v-for="item in merchant.orderInfoList" :key="item.productId" class="goods-item">
              <div class="goods-image">
                <img :src="item.image" :alt="item.productName" />
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ item.productName }}</div>
                <div class="goods-sku">{{ item.sku }}</div>
              </div>
              <div class="goods-price">¥{{ item.price }}</div>
              <div class="goods-num">×{{ item.payNum }}</div>
              <div class="goods-total">¥{{ item.payPrice }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 配送方式 -->
      <div class="shipping-section">
        <h3>配送方式</h3>
        <div v-for="merchant in preOrderData.merchantInfoList" :key="'shipping_' + merchant.merId" class="merchant-shipping">
          <div class="merchant-label">{{ merchant.merName }}</div>
          <div class="shipping-options">
            <el-radio-group v-model="merchant.shippingType" @change="updateShippingType(merchant.merId, merchant.shippingType)">
              <el-radio :label="1">快递配送</el-radio>
              <el-radio :label="2" v-if="merchant.takeTheirSwitch">到店自提</el-radio>
              <el-radio :label="3">虚拟发货</el-radio>
            </el-radio-group>
            <div class="shipping-desc">
              <span v-if="merchant.shippingType === 1">商家配送</span>
              <span v-else-if="merchant.shippingType === 2">到店自提</span>
              <span v-else>虚拟发货</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 店铺优惠券 -->
      <div class="coupon-section">
        <h3>店铺优惠</h3>
        <div v-for="merchant in preOrderData.merchantInfoList" :key="'coupon_' + merchant.merId" class="merchant-coupon">
          <div class="merchant-label">{{ merchant.merName }}</div>
          <div class="coupon-selector">
            <el-select 
              v-model="merchant.userCouponId" 
              placeholder="请选择优惠券" 
              @change="updateMerchantCoupon(merchant.merId, merchant.userCouponId)"
              clearable
            >
              <el-option label="不使用优惠券" :value="0">不使用优惠券</el-option>
              <el-option 
                v-for="coupon in merchant.merCouponUserList" 
                :key="coupon.id" 
                :label="`${coupon.name} - 减¥${(coupon.money / 100).toFixed(2)}`"
                :value="coupon.id"
              >
                <div class="coupon-option">
                  <div class="coupon-name">{{ coupon.name }}</div>
                  <div class="coupon-info">减¥{{ (coupon.money / 100).toFixed(2)} | 满¥{{ (coupon.minPrice / 100).toFixed(2) }}可用</div>
                </div>
              </el-option>
            </el-select>
            <div class="coupon-amount" v-if="merchant.merCouponFee && merchant.merCouponFee > 0">
              已优惠：¥{{ merchant.merCouponFee.toFixed(2) }}
            </div>
            <div class="no-coupon" v-else>暂无优惠券</div>
          </div>
        </div>
      </div>

      <!-- 平台优惠券 -->
      <div class="platform-coupon-section">
        <h3>平台优惠</h3>
        <div class="coupon-selector">
          <el-select 
            v-model="preOrderData.platUserCouponId" 
            placeholder="请选择平台优惠券" 
            @change="updatePlatformCoupon"
            clearable
          >
            <el-option label="不使用优惠券" :value="0">不使用优惠券</el-option>
            <el-option 
              v-for="coupon in preOrderData.platCouponUserList" 
              :key="coupon.id" 
              :label="`${coupon.name} - 减¥${(coupon.money / 100).toFixed(2)}`"
              :value="coupon.id"
            >
              <div class="coupon-option">
                <div class="coupon-name">{{ coupon.name }}</div>
                <div class="coupon-info">减¥{{ (coupon.money / 100).toFixed(2)} | 满¥{{ (coupon.minPrice / 100).toFixed(2) }}可用</div>
              </div>
            </el-option>
          </el-select>
          <div class="coupon-amount" v-if="preOrderData.platCouponFee && preOrderData.platCouponFee > 0">
            已优惠：¥{{ preOrderData.platCouponFee.toFixed(2) }}
          </div>
          <div class="no-coupon" v-else>暂无优惠券</div>
        </div>
      </div>

      <!-- 积分抵扣 -->
      <div class="integral-section" v-if="preOrderData.integralDeductionSwitch">
        <h3>积分抵扣</h3>
        <div class="integral-content">
          <div class="integral-info">
            <span>当前积分：{{ preOrderData.userIntegral || 0 }}</span>
          </div>
          <div class="integral-switch">
            <el-switch 
              v-model="preOrderData.isUseIntegral" 
              @change="updateIntegralUsage"
              active-text="使用积分抵扣"
              inactive-text="不使用积分抵扣"
            ></el-switch>
          </div>
          <div class="integral-amount" v-if="preOrderData.isUseIntegral && integralDeductionAmount > 0">
            积分抵扣：-¥{{ integralDeductionAmount.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 买家留言 -->
      <div class="remark-section">
        <h3>买家留言</h3>
        <div v-for="merchant in preOrderData.merchantInfoList" :key="'remark_' + merchant.merId" class="merchant-remark">
          <div class="merchant-label">{{ merchant.merName }}</div>
          <el-input
            v-model="merchantRemarks[merchant.merId]"
            type="textarea"
            placeholder="选填，对本次交易的说明（建议填写已与商家协商一致的内容）"
            :rows="3"
            maxlength="200"
            show-word-limit
          ></el-input>
        </div>
      </div>

      <!-- 费用明细 -->
      <div class="price-section">
        <h3>费用明细</h3>
        <div class="price-detail">
          <div class="price-item">
            <span>商品总价</span>
            <span>¥{{ preOrderData.proTotalFee ? preOrderData.proTotalFee.toFixed(2) : '0.00' }}</span>
          </div>
          <div class="price-item">
            <span>快递费用</span>
            <span v-if="preOrderData.freightFee && preOrderData.freightFee > 0">¥{{ preOrderData.freightFee.toFixed(2) }}</span>
            <span v-else>免运费</span>
          </div>
          <div class="price-item" v-if="preOrderData.merCouponFee && preOrderData.merCouponFee > 0">
            <span>店铺优惠</span>
            <span class="discount">-¥{{ preOrderData.merCouponFee.toFixed(2) }}</span>
          </div>
          <div class="price-item" v-if="preOrderData.platCouponFee && preOrderData.platCouponFee > 0">
            <span>平台优惠</span>
            <span class="discount">-¥{{ preOrderData.platCouponFee.toFixed(2) }}</span>
          </div>
          <div class="price-item" v-if="preOrderData.isUseIntegral && integralDeductionAmount > 0">
            <span>积分抵扣</span>
            <span class="discount">-¥{{ integralDeductionAmount.toFixed(2) }}</span>
          </div>
          <div class="price-item total">
            <span>实付金额</span>
            <span class="total-price">¥{{ preOrderData.payFee ? preOrderData.payFee.toFixed(2) : '0.00' }}</span>
          </div>
        </div>
      </div>

      <!-- 提交订单 -->
      <div class="submit-section">
        <el-button type="primary" size="large" @click="submitOrder" :loading="submitting">
          提交订单
        </el-button>
      </div>

      <!-- 调试信息 -->
      <div class="debug-section" v-if="showDebug">
        <h3>调试信息</h3>
        <el-button @click="logPreOrderData">输出预下单数据</el-button>
        <el-button @click="logRequestParams">输出请求参数</el-button>
      </div>
    </div>

    <!-- 地址选择弹窗 -->
    <el-dialog title="选择收货地址" :visible.sync="showAddressDialog" width="600px">
      <div class="address-list">
        <div 
          v-for="address in addressList" 
          :key="address.id" 
          class="address-item" 
          :class="{ active: selectedAddress && selectedAddress.id === address.id }"
          @click="selectAddress(address)"
        >
          <div class="address-info">
            <span class="name">{{ address.realName }}</span>
            <span class="phone">{{ address.phone }}</span>
            <span class="default" v-if="address.isDefault">默认</span>
          </div>
          <div class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddress">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAddressList } from '@/api/user'
import { createPreOrder, loadPreOrderDetail, computeOrderPrice, createOrder } from '@/api/order'

export default {
  name: 'OrderConfirm',
  data() {
    return {
      preOrderNo: '',
      preOrderData: {
        proTotalFee: 0,
        orderProNum: 0,
        freightFee: 0,
        couponFee: 0,
        merCouponFee: 0,
        platCouponFee: 0,
        payFee: 0,
        platUserCouponId: 0,
        addressId: 0,
        userIntegral: 0,
        userBalance: 0,
        merchantInfoList: [],
        integralDeductionSwitch: false,
        isUseIntegral: false,
        platCouponUserList: []
      },
      selectedAddress: null,
      addressList: [],
      showAddressDialog: false,
      submitting: false,
      loading: false,
      showDebug: process.env.NODE_ENV === 'development',
      merchantRemarks: {}, // 商户留言
      integralDeductionAmount: 0 // 积分抵扣金额
    }
  },
  created() {
    this.initOrderConfirm()
  },
  methods: {
    async initOrderConfirm() {
      try {
        this.loading = true
        
        // 1. 获取地址列表
        await this.getAddresses()
        
        // 2. 根据路由参数创建预下单
        await this.createPreOrderFromRoute()
        
        // 3. 加载预下单详情
        if (this.preOrderNo) {
          await this.loadPreOrderData()
          
          // 4. 初始计算订单价格
          await this.computePrice()
        }
        
      } catch (error) {
        console.error('订单确认页面初始化失败:', error)
        this.$message.error('页面初始化失败，请重试')
      } finally {
        this.loading = false
      }
    },

    async getAddresses() {
      try {
        const response = await getAddressList()
        if (response.code === 200 && response.data) {
          this.addressList = response.data
          
          // 选择默认地址
          const defaultAddress = this.addressList.find(addr => addr.isDefault)
          if (defaultAddress) {
            this.selectedAddress = defaultAddress
          } else if (this.addressList.length > 0) {
            this.selectedAddress = this.addressList[0]
          }
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
      }
    },

    async createPreOrderFromRoute() {
      const query = this.$route.query
      console.log('路由参数:', query)

      if (query.cartIds) {
        // 购物车下单
        await this.createPreOrderFromCart(query.cartIds.split(','))
      } else if (query.productId) {
        // 立即购买
        await this.createPreOrderFromProduct(query)
      } else {
        this.$message.error('订单参数不完整')
        this.$router.push('/cart')
      }
    },

    async createPreOrderFromCart(cartIds) {
      try {
        const params = {
          preOrderType: 'shoppingCart',
          orderDetails: cartIds.map(id => ({
            shoppingCartId: parseInt(id)
          }))
        }

        console.log('购物车预下单请求参数:', params)
        const response = await createPreOrder(params)
        console.log('购物车预下单响应:', response)

        if (response.code === 200) {
          this.preOrderNo = response.data
        } else {
          throw new Error(response.message || '预下单失败')
        }
      } catch (error) {
        console.error('购物车预下单失败:', error)
        throw error
      }
    },

    async createPreOrderFromProduct(query) {
      try {
        const params = {
          preOrderType: 'buyNow',
          orderDetails: [{
            productId: parseInt(query.productId),
            attrValueId: parseInt(query.attrValueId || 0),
            productNum: parseInt(query.num || 1)
          }]
        }

        console.log('立即购买预下单请求参数:', params)
        const response = await createPreOrder(params)
        console.log('立即购买预下单响应:', response)

        if (response.code === 200) {
          this.preOrderNo = response.data
        } else {
          throw new Error(response.message || '预下单失败')
        }
      } catch (error) {
        console.error('立即购买预下单失败:', error)
        throw error
      }
    },

    async loadPreOrderData() {
      try {
        const response = await loadPreOrderDetail(this.preOrderNo)
        console.log('预下单详情响应:', response)

        if (response.code === 200 && response.data) {
          this.preOrderData = response.data
          
          // 初始化商户留言
          this.preOrderData.merchantInfoList.forEach(merchant => {
            this.$set(this.merchantRemarks, merchant.merId, '')
          })
          
          console.log('预下单数据已加载:', this.preOrderData)
        } else {
          throw new Error(response.message || '获取预下单详情失败')
        }
      } catch (error) {
        console.error('加载预下单详情失败:', error)
        throw error
      }
    },

    async computePrice() {
      try {
        if (!this.selectedAddress || !this.preOrderNo) {
          return
        }

        const params = {
          preOrderNo: this.preOrderNo,
          addressId: this.selectedAddress.id,
          orderMerchantRequestList: this.preOrderData.merchantInfoList.map(merchant => ({
            merId: merchant.merId,
            userCouponId: merchant.userCouponId || 0,
            shippingType: merchant.shippingType || 1,
            remark: this.merchantRemarks[merchant.merId] || ''
          })),
          isUseIntegral: this.preOrderData.isUseIntegral || false,
          platUserCouponId: this.preOrderData.platUserCouponId || 0
        }

        console.log('计算价格请求参数:', params)
        const response = await computeOrderPrice(params)
        console.log('计算价格响应:', response)

        if (response.code === 200 && response.data) {
          // 更新价格信息
          Object.assign(this.preOrderData, response.data)
          
          // 计算积分抵扣金额
          this.calculateIntegralDeduction()
          
          console.log('价格计算完成:', this.preOrderData)
        }
      } catch (error) {
        console.error('计算价格失败:', error)
      }
    },

    // 新增：更新配送方式
    async updateShippingType(merId, shippingType) {
      console.log(`更新商户${merId}配送方式为:`, shippingType)
      await this.computePrice()
    },

    // 新增：更新商户优惠券
    async updateMerchantCoupon(merId, userCouponId) {
      console.log(`更新商户${merId}优惠券为:`, userCouponId)
      const merchant = this.preOrderData.merchantInfoList.find(m => m.merId === merId)
      if (merchant) {
        merchant.userCouponId = userCouponId
      }
      await this.computePrice()
    },

    // 新增：更新平台优惠券
    async updatePlatformCoupon() {
      console.log('更新平台优惠券为:', this.preOrderData.platUserCouponId)
      await this.computePrice()
    },

    // 新增：更新积分使用
    async updateIntegralUsage() {
      console.log('更新积分使用状态:', this.preOrderData.isUseIntegral)
      await this.computePrice()
    },

    // 新增：计算积分抵扣金额
    calculateIntegralDeduction() {
      if (this.preOrderData.isUseIntegral && this.preOrderData.userIntegral) {
        // 简单计算：100积分 = 1元，实际应根据后端返回的数据
        this.integralDeductionAmount = Math.min(
          this.preOrderData.userIntegral / 100,
          this.preOrderData.proTotalFee || 0
        )
      } else {
        this.integralDeductionAmount = 0
      }
    },

    selectAddress(address) {
      this.selectedAddress = address
    },

    async confirmAddress() {
      this.showAddressDialog = false
      // 地址变更后重新计算价格
      await this.computePrice()
    },

    async submitOrder() {
      try {
        if (!this.selectedAddress) {
          this.$message.error('请选择收货地址')
          return
        }

        this.submitting = true

        const params = {
          preOrderNo: this.preOrderNo,
          addressId: this.selectedAddress.id,
          orderMerchantRequestList: this.preOrderData.merchantInfoList.map(merchant => ({
            merId: merchant.merId,
            userCouponId: merchant.userCouponId || 0,
            shippingType: merchant.shippingType || 1,
            remark: this.merchantRemarks[merchant.merId] || ''
          })),
          isUseIntegral: this.preOrderData.isUseIntegral || false,
          platUserCouponId: this.preOrderData.platUserCouponId || 0
        }

        console.log('创建订单请求参数:', params)
        const response = await createOrder(params)
        console.log('创建订单响应:', response)

        if (response.code === 200) {
          this.$message.success('订单创建成功')
          // 跳转到支付页面
          this.$router.push({
            path: '/order/pay',
            query: { orderNo: response.data.orderNo }
          })
        } else {
          throw new Error(response.message || '创建订单失败')
        }

      } catch (error) {
        console.error('提交订单失败:', error)
        this.$message.error(error.message || '提交订单失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    // 调试方法
    logPreOrderData() {
      console.log('当前预下单数据:', this.preOrderData)
    },

    logRequestParams() {
      const params = {
        preOrderNo: this.preOrderNo,
        addressId: this.selectedAddress?.id,
        orderMerchantRequestList: this.preOrderData.merchantInfoList.map(merchant => ({
          merId: merchant.merId,
          userCouponId: merchant.userCouponId || 0,
          shippingType: merchant.shippingType || 1,
          remark: this.merchantRemarks[merchant.merId] || ''
        })),
        isUseIntegral: this.preOrderData.isUseIntegral || false,
        platUserCouponId: this.preOrderData.platUserCouponId || 0
      }
      console.log('当前请求参数:', params)
    }
  }
}
</script>

<style scoped>
.order-confirm-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.main-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.address-section,
.goods-section,
.shipping-section,
.coupon-section,
.platform-coupon-section,
.integral-section,
.remark-section,
.price-section,
.submit-section,
.debug-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.address-section h3,
.goods-section h3,
.shipping-section h3,
.coupon-section h3,
.platform-coupon-section h3,
.integral-section h3,
.remark-section h3,
.price-section h3,
.debug-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 地址样式 */
.no-address {
  text-align: center;
  padding: 40px;
  color: #999;
}

.address-card {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.address-card.selected {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.address-info {
  margin-bottom: 8px;
}

.address-info .name {
  font-weight: 600;
  margin-right: 15px;
}

.address-info .phone {
  color: #666;
  margin-right: 15px;
}

.address-info .default {
  background: #409eff;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}

.address-detail {
  color: #666;
  font-size: 14px;
}

.change-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}

/* 商品样式 */
.merchant-group {
  margin-bottom: 20px;
}

.merchant-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.store-icon {
  margin-right: 8px;
}

.merchant-name {
  font-weight: 600;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.goods-info {
  flex: 1;
  margin-right: 15px;
}

.goods-name {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.goods-sku {
  font-size: 14px;
  color: #999;
}

.goods-price,
.goods-num,
.goods-total {
  width: 80px;
  text-align: right;
  font-weight: 600;
}

.goods-total {
  color: #e6a23c;
}

/* 配送、优惠券、积分样式 */
.merchant-shipping,
.merchant-coupon,
.merchant-remark {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.merchant-label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.shipping-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shipping-desc {
  color: #666;
  font-size: 14px;
}

.coupon-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.coupon-option {
  line-height: 1.4;
}

.coupon-name {
  font-weight: 500;
}

.coupon-info {
  font-size: 12px;
  color: #999;
}

.coupon-amount {
  color: #e6a23c;
  font-weight: 600;
}

.no-coupon {
  color: #999;
}

.integral-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.integral-info {
  font-weight: 500;
}

.integral-amount {
  color: #e6a23c;
  font-weight: 600;
}

/* 费用明细样式 */
.price-detail {
  background: #fafafa;
  padding: 20px;
  border-radius: 4px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-item.total {
  border-top: 1px solid #e6e6e6;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 600;
}

.total-price {
  color: #e6a23c;
  font-size: 18px;
}

.discount {
  color: #67c23a;
}

/* 提交按钮样式 */
.submit-section {
  text-align: center;
  padding: 30px;
}

.submit-section .el-button {
  width: 300px;
  height: 50px;
  font-size: 16px;
}

/* 地址弹窗样式 */
.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover,
.address-item.active {
  border-color: #409eff;
  background-color: #f0f9ff;
}

/* 调试样式 */
.debug-section {
  background: #f9f9f9;
  border-top: 2px solid #409eff;
}

.debug-section .el-button {
  margin-right: 10px;
}
</style> 