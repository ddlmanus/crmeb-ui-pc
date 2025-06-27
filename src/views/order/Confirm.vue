<template>
  <div class="order-confirm-page">
    <div class="container">
      <!-- 收货地址 -->
      <div class="address-section">
        <h3 class="section-title">收货地址</h3>
        <div class="address-content">
          <div v-if="selectedAddress" class="address-box" @click="showAddressList = true">
            <div class="address-info">
              <div class="contact-line">
                <span class="name">{{ selectedAddress.realName }}</span>
                <span class="phone">{{ selectedAddress.phone }}</span>
                <span v-if="selectedAddress.isDefault" class="default-tag">默认</span>
              </div>
              <div class="address-line">
                {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}
              </div>
            </div>
          </div>
          <div v-else class="address-box add-address-box" @click="showAddressList = true">
            <div class="add-address-prompt">
              <i class="el-icon-plus"></i>
              <span>添加新地址</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-section">
        <h3 class="section-title">订单信息</h3>
        <div class="order-content" v-loading="loading">
          <div v-if="orderGoods && orderGoods.length > 0" class="goods-list">
            <div v-for="item in orderGoods" :key="item.id" class="goods-item">
              <div class="goods-image">
                <img :src="item.productInfo.image" :alt="item.productInfo.storeName" />
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ item.productInfo.storeName }}</div>
                <div class="goods-spec" v-if="item.productInfo.attrInfo">
                  {{ item.productInfo.attrInfo.suk }}
                </div>
              </div>
              <div class="goods-price">¥{{ item.truePrice }}</div>
              <div class="goods-quantity">×{{ item.cartNum }}</div>
              <div class="goods-total">{{ (item.truePrice * item.cartNum).toFixed(0) }}</div>
            </div>
          </div>
          <div v-else-if="!loading" class="empty-goods">
            <p>暂无商品信息</p>
          </div>
        </div>
      </div>

      <!-- 使用优惠券 -->
      <div class="coupon-section">
        <h3 class="section-title">使用优惠券</h3>
        <div class="coupon-content">
          <div class="coupon-cards-row">
            <template v-if="availableCoupons.length > 0">
              <div 
                v-for="coupon in availableCoupons.slice(0, 3)" 
                :key="coupon.id"
                class="coupon-card"
                :class="{ 'selected': selectedCoupon && selectedCoupon.id === coupon.id }"
                @click="selectCoupon(coupon)"
              >
                <div class="coupon-left">
                  <div class="coupon-type">通用券</div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-amount">满{{ Math.floor(coupon.minPrice || 0) }}减{{ Math.floor(coupon.money || 0) }}</div>
                </div>
              </div>
              <div v-if="availableCoupons.length > 3" class="more-coupon-card" @click="showCouponList = true">
                <div class="more-icon">...</div>
                <div class="more-text">更多优惠券</div>
              </div>
            </template>
            <div v-else class="no-coupons-card">
              <div class="no-coupon-icon">🎫</div>
              <span>暂无可用优惠券</span>
            </div>
          </div>
          <div class="coupon-discount">
            <span class="discount-amount">-¥{{ selectedCoupon ? Math.floor(selectedCoupon.money || 0) : 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 积分抵扣 -->
      <div class="integral-section" v-if="integralDeductionSwitch">
        <h3 class="section-title">积分抵扣</h3>
        <div class="integral-content">
          <div 
            class="integral-card" 
            :class="{ 
              'selected': isUseIntegral, 
              'disabled': !canUseIntegral 
            }" 
            @click="canUseIntegral ? toggleIntegral() : null"
          >
            <div class="integral-radio">
              <i class="radio-icon" :class="{ 'checked': isUseIntegral }"></i>
            </div>
            <div class="integral-info">
              <span class="integral-text">当前积分</span>
              <span class="integral-number">{{ userIntegral || 0 }}</span>
              <span v-if="!canUseIntegral" class="integral-tip">积分不足</span>
            </div>
          </div>
          <div class="integral-discount">
            <span class="discount-amount">-¥{{ isUseIntegral ? integralDeductionAmount : 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 买家留言 -->
      <div class="remark-section">
        <h3 class="section-title">买家留言</h3>
        <div class="remark-content">
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="请写下对本次交易的说明（建议填写已与商家协商一致的内容），限150字符"
            maxlength="150"
            show-word-limit
          ></el-input>
        </div>
      </div>

      <!-- 价格汇总 -->
      <div class="price-summary-section">
        <div class="price-item">
          <span class="price-label">{{ orderGoods.length }}件商品，总商品金额：</span>
          <span class="price-value">¥{{ parseFloat(proTotalFee || 0).toFixed(2) }}</span>
        </div>
        <div class="price-item" v-if="deliveryType === 1 && shippingFee > 0">
          <span class="price-label">运费：</span>
          <span class="price-value">¥{{ parseFloat(shippingFee || 0).toFixed(2) }}</span>
        </div>
        <div class="price-item" v-if="selectedCoupon">
          <span class="price-label">优惠券：</span>
          <span class="price-value discount">-¥{{ Math.floor(selectedCoupon.money || 0) }}</span>
        </div>
        <div class="price-item" v-if="isUseIntegral && integralDeductionAmount > 0">
          <span class="price-label">积分抵扣：</span>
          <span class="price-value discount">-¥{{ integralDeductionAmount }}</span>
        </div>
        <div class="price-item final-price">
          <span class="price-label">应付总额：</span>
          <span class="price-value final-amount">¥{{ finalPrice }}</span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button
          type="danger"
          size="large"
          :loading="submitting"
          @click="submitOrder"
          class="submit-btn"
        >
          {{ submitting ? '正在提交...' : '提交订单' }}
        </el-button>
      </div>

      <!-- 底部服务保障 -->
      <div class="service-guarantee">
        <div class="guarantee-item">
          <i class="guarantee-icon">🏪</i>
          <span>品种齐全，购物轻松</span>
        </div>
        <div class="guarantee-item">
          <i class="guarantee-icon">🚛</i>
          <span>多仓直发，极速配送</span>
        </div>
        <div class="guarantee-item">
          <i class="guarantee-icon">⭐</i>
          <span>正品行货，精致服务</span>
        </div>
        <div class="guarantee-item">
          <i class="guarantee-icon">🌟</i>
          <span>天天低价，畅选无忧</span>
        </div>
      </div>
    </div>

    <!-- 地址列表弹窗 -->
    <el-dialog title="选择收货地址" :visible.sync="showAddressList" width="600px">
      <div class="address-list">
        <div
          v-for="address in addressList"
          :key="address.id"
          class="address-item"
          :class="{ selected: selectedAddress && selectedAddress.id === address.id }"
          @click="selectAddress(address)"
        >
          <div class="address-info">
            <div class="user-info">
              <span class="name">{{ address.realName }}</span>
              <span class="phone">{{ address.phone }}</span>
              <span v-if="address.isDefault" class="default-tag">默认</span>
            </div>
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
            </div>
          </div>
          <div class="address-action">
            <i v-if="selectedAddress && selectedAddress.id === address.id" class="el-icon-check"></i>
          </div>
        </div>
        <div class="add-address" @click="addNewAddress">
          <i class="el-icon-plus"></i>
          <span>添加新地址</span>
        </div>
      </div>
    </el-dialog>

    <!-- 优惠券列表弹窗 -->
    <el-dialog title="选择优惠券" :visible.sync="showCouponList" width="600px">
      <div class="coupon-list">
        <div
          v-for="coupon in availableCoupons"
          :key="coupon.id"
          class="coupon-item"
          :class="{ selected: selectedCoupon && selectedCoupon.id === coupon.id }"
          @click="selectCoupon(coupon)"
        >
          <div class="coupon-left">
            <div class="coupon-price">¥{{ Math.floor(coupon.money || 0) }}</div>
            <div class="coupon-condition">满{{ Math.floor(coupon.minPrice || 0) }}元可用</div>
          </div>
          <div class="coupon-right">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div class="coupon-time">有效期至：{{ formatDate(coupon.endTime) }}</div>
          </div>
          <div class="coupon-action">
            <i v-if="selectedCoupon && selectedCoupon.id === coupon.id" class="el-icon-check"></i>
          </div>
        </div>
        <div class="no-coupon" @click="selectCoupon(null)">
          <span>不使用优惠券</span>
          <i v-if="!selectedCoupon" class="el-icon-check"></i>
        </div>
      </div>
    </el-dialog>



    <!-- 地址选择器弹窗 -->
    <el-dialog title="选择地址" :visible.sync="showAddressSelector" width="600px">
      <AddressSelector
        :address="editingAddress"
        @success="handleAddressSuccess"
      ></AddressSelector>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AddressSelector from '@/components/AddressSelector'
import { getAddressList, deleteAddress as deleteAddressApi } from '@/api/address'
import { calculateCartPrice, preOrder, loadPreOrder, computedOrderPrice, createOrder } from '@/api/order'
import { getPayConfig } from '@/api/payment'

export default {
  name: 'OrderConfirm',
  components: {
    AddressSelector
  },
  data() {
    return {
      preOrderNo: '', // 预下单号
      orderGoods: [],
      addressList: [],
      selectedAddress: null,
      availableCoupons: [],
      selectedCoupon: null,
      deliveryType: 1, // 1-快递配送 2-到店自提
      remark: '',
      shippingFee: 0,
      totalPrice: 0,
      submitting: false,
      showAddressList: false,
      showCouponList: false,
      showAddressSelector: false,
      editingAddress: {},
      merchantInfo: [], // 商户信息
      loading: false,
      userBalance: 0,
      currentMerchantId: null,
      platCouponFee: 0,
      merCouponFee: 0,
      proTotalFee: 0,
      freightFee: 0,
      userIntegral: 0,
      isUseIntegral: false,
      integralDeductionAmount: 0,
      integralDeductionSwitch: false,
      merchantRemarks: {},
      merchantInfoList: [],
      platformCoupons: [],
      payConfig: null, // 支付配置
      userBalance: 0 // 用户余额（从支付配置中获取）
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    finalPrice() {
      let price = parseFloat(this.totalPrice || 0)

      // 加运费
      if (this.deliveryType === 1) {
        price += parseFloat(this.shippingFee || 0)
      }

      // 减优惠券
      if (this.selectedCoupon) {
        price -= parseFloat(this.selectedCoupon.money || 0)
      }

      // 减积分抵扣
      if (this.isUseIntegral && this.integralDeductionAmount > 0) {
        price -= parseFloat(this.integralDeductionAmount)
      }

      return Math.max(0, price).toFixed(2)
    },
    // 判断积分是否可用
    canUseIntegral() {
      return this.integralDeductionSwitch && 
             this.userIntegral > 0 && 
             Math.floor(this.userIntegral / 100) > 0
    }
  },
  created() {
    this.initOrderData()
  },
  methods: {
    async initOrderData() {
      try {
        this.loading = true

        console.log('开始初始化订单数据...')
        console.log('路由参数:', this.$route.query)

        // 检查路由参数
        if (!this.$route.query.productId && !this.$route.query.cartIds) {
          this.$message.error('缺少商品信息参数')
          this.$router.push('/cart')
          return
        }

        // 第一步：获取地址列表和支付配置
        await Promise.all([
          this.fetchAddressList(),
          this.fetchPayConfig()
        ])

        // 第二步：预下单
        await this.doPreOrder()

        // 第三步：加载预下单详情
        if (this.preOrderNo) {
          await this.loadPreOrderDetail()
        } else {
          console.error('预下单失败，没有获得预下单号')
          this.$message.error('预下单失败，请重试')
        }

        // 第四步：计算订单价格
        if (this.preOrderNo && this.selectedAddress) {
          await this.computeOrderPrice()
        }
      } catch (error) {
        console.error('初始化订单数据失败:', error)
        this.$message.error('获取订单信息失败: ' + (error.message || error))
      } finally {
        this.loading = false
      }
    },

    async computeOrderPrice() {
      if (!this.preOrderNo) {
        console.warn('预下单号为空，无法计算价格')
        return
      }

      try {
        console.log('开始计算订单价格...')

        // 根据后端CouponUser字段确定使用的优惠券类型（与submitOrder使用相同逻辑）
        let platUserCouponId = 0
        let selectedMerchantCoupons = {}

        if (this.selectedCoupon) {
          // 根据publisher字段判断：1-平台，2-商户
          if (this.selectedCoupon.publisher === 1 || this.selectedCoupon.merId === 0) {
            // 平台优惠券：publisher=1 或 merId=0
            platUserCouponId = this.selectedCoupon.id
          } else if (this.selectedCoupon.publisher === 2 && this.selectedCoupon.merId > 0) {
            // 商家优惠券：publisher=2 且 merId>0
            selectedMerchantCoupons[this.selectedCoupon.merId] = this.selectedCoupon.id
          }
        }

        // 构建商户订单请求参数
        const orderMerchantRequestList = this.merchantInfo.map(merchant => {
          // 查找该商户的优惠券ID
          const userCouponId = selectedMerchantCoupons[merchant.merId] || 0

          return {
            merId: merchant.merId,
            userCouponId: userCouponId,
            shippingType: this.deliveryType,
            remark: this.remark || ''
          }
        })

        const computeRequest = {
          preOrderNo: this.preOrderNo,
          addressId: this.selectedAddress ? this.selectedAddress.id : null,
          orderMerchantRequestList: orderMerchantRequestList,
          isUseIntegral: this.isUseIntegral,
          platUserCouponId: platUserCouponId
        }

        console.log('=== 计算价格参数详情 ===')
        console.log('使用积分:', this.isUseIntegral)
        console.log('选中优惠券:', this.selectedCoupon)
        console.log('平台优惠券ID:', platUserCouponId)
        console.log('商户优惠券映射:', selectedMerchantCoupons)
        console.log('商户订单列表:', orderMerchantRequestList)
        console.log('计算价格请求参数:', computeRequest)
        
        const response = await computedOrderPrice(computeRequest)
        console.log('计算价格响应:', response)

        // 更新价格信息
        if (response.data) {
          this.totalPrice = response.data.totalPrice || this.totalPrice
          this.shippingFee = response.data.shippingFee || this.shippingFee
          console.log('更新后的价格 - 总价:', this.totalPrice, '运费:', this.shippingFee)
        }

      } catch (error) {
        console.error('计算订单价格失败:', error)
        this.$message.error('计算订单价格失败: ' + (error.message || error))
      }
    },

    async doPreOrder() {
      try {
        // 构建预下单请求参数
        const preOrderRequest = {
          preOrderType: 'buyNow', // 立即购买
          orderDetails: []
        }

        // 根据路由参数构建订单详情
        if (this.$route.query.cartIds) {
          // 购物车下单
          preOrderRequest.preOrderType = 'shoppingCart'
          const cartIds = this.$route.query.cartIds.split(',').map(id => parseInt(id))
          preOrderRequest.orderDetails = cartIds.map(cartId => ({
            shoppingCartId: cartId
          }))
        } else if (this.$route.query.productId) {
          // 立即购买
          preOrderRequest.orderDetails = [{
            productId: parseInt(this.$route.query.productId),
            attrValueId: parseInt(this.$route.query.uniqueId || this.$route.query.attrValueId),
            productNum: parseInt(this.$route.query.quantity || 1)
          }]
        }

        console.log('预下单请求参数:', preOrderRequest)
        const response = await preOrder(preOrderRequest)
        console.log('预下单完整响应:', response)

        // 确保正确获取预下单号
        if (response.data && response.data.preOrderNo) {
          this.preOrderNo = response.data.preOrderNo
          console.log('预下单成功，预下单号:', this.preOrderNo)
        } else if (response.data && response.data.orderNo) {
          this.preOrderNo = response.data.orderNo
          console.log('预下单成功，订单号:', this.preOrderNo)
        } else {
          console.error('预下单响应中没有找到订单号，响应数据:', response.data)
          throw new Error('预下单响应格式异常')
        }
      } catch (error) {
        console.error('预下单失败:', error)
        throw error
      }
    },

    async loadPreOrderDetail() {
      try {
        if (!this.preOrderNo) {
          throw new Error('预下单号为空，无法加载详情')
        }

        console.log('正在加载预下单详情，预下单号:', this.preOrderNo)
        console.log('调用API: /api/pc/order/load/pre/' + this.preOrderNo)

        const response = await loadPreOrder(this.preOrderNo)
        console.log('预下单详情完整响应:', response)

        const data = response.data
        console.log('预下单详情数据:', data)

        // 设置商户信息
        this.merchantInfo = data.merchantInfoList || []
        console.log('商户信息:', this.merchantInfo)

        // 设置订单商品信息（从所有商户的orderInfoList合并）
        this.orderGoods = []
        if (this.merchantInfo && this.merchantInfo.length > 0) {
          console.log('开始处理商户商品信息...')
          this.merchantInfo.forEach((merchant, merchantIndex) => {
            console.log(`商户${merchantIndex}:`, merchant)
            if (merchant.orderInfoList && merchant.orderInfoList.length > 0) {
              console.log(`商户${merchantIndex}的商品列表:`, merchant.orderInfoList)
              merchant.orderInfoList.forEach((item, itemIndex) => {
                console.log(`商品${itemIndex}详细信息:`, item)

                // 根据API响应数据和PreOrderInfoDetailVo字段定义进行正确映射
                const goodsItem = {
                  id: item.productId,
                  productInfo: {
                    productId: item.productId,
                    storeName: item.productName,  // 后端字段名：productName
                    image: this.getImageUrl(item.image), // 后端字段名：image，处理图片URL
                    attrInfo: {
                      suk: item.sku               // 后端字段名：sku
                    }
                  },
                  truePrice: parseFloat(item.price || 0),           // 后端字段名：price (BigDecimal类型)
                  cartNum: parseInt(item.payNum || 0),             // 后端字段名：payNum (购买数量)
                  payPrice: parseFloat(item.payPrice || 0)         // 后端字段名：payPrice (实际支付金额)
                }

                console.log(`转换后的商品${itemIndex}:`, goodsItem)
                console.log(`- 商品名称: ${goodsItem.productInfo.storeName}`)
                console.log(`- 商品图片: ${goodsItem.productInfo.image}`)
                console.log(`- 商品价格: ${goodsItem.truePrice}`)
                console.log(`- 购买数量: ${goodsItem.cartNum}`)

                this.orderGoods.push(goodsItem)
              })
            } else {
              console.log(`商户${merchantIndex}没有orderInfoList或为空`)
            }
          })
        } else {
          console.log('没有商户信息或商户信息为空')
        }

        console.log('最终的订单商品列表:', this.orderGoods)

        // 设置价格信息
        this.totalPrice = parseFloat(data.proTotalFee || 0)
        this.shippingFee = parseFloat(data.freightFee || 0)
        console.log('价格信息 - 商品总价:', this.totalPrice, '运费:', this.shippingFee)
        console.log('原始价格数据 - proTotalFee:', data.proTotalFee, 'freightFee:', data.freightFee)

        // 设置用户信息
        this.userBalance = parseFloat(data.userBalance || 0)
        console.log('用户余额:', this.userBalance)
        console.log('原始用户余额数据:', data.userBalance)

        // 根据后端API字段正确设置优惠券数据
        this.platformCoupons = []
        this.availableCoupons = []

        // 平台优惠券 (platCouponUserList) - 发行方为平台的优惠券
        if (data.platCouponUserList && data.platCouponUserList.length > 0) {
          this.platformCoupons = data.platCouponUserList.map(coupon => ({
            ...coupon,
            // 后端CouponUser.money是Long类型，单位为分，需要转换为元
            money: (coupon.money || 0) / 100,
            minPrice: (coupon.minPrice || 0) / 100,
            type: 'platform', // 标记为平台优惠券
            publisher: 1 // 发行方：1-平台
          }))
          // 平台优惠券加入到可选优惠券列表
          this.availableCoupons.push(...this.platformCoupons)
          console.log('平台优惠券 (platCouponUserList):', this.platformCoupons)
        }

        // 商户信息和商家优惠券
        if (data.merchantInfoList && data.merchantInfoList.length > 0) {
          this.merchantInfoList = data.merchantInfoList.map(merchant => ({
            ...merchant,
            selectedCoupon: null,
            userCouponId: 0,
            shippingType: merchant.shippingType || 1
          }))

          // 初始化商户留言
          this.merchantInfoList.forEach(merchant => {
            this.$set(this.merchantRemarks, merchant.merId, '')
          })

          // 处理商家优惠券 (merCouponUserList) - 发行方为商户的优惠券
          data.merchantInfoList.forEach(merchant => {
            if (merchant.merCouponUserList && merchant.merCouponUserList.length > 0) {
              const merchantCoupons = merchant.merCouponUserList.map(coupon => ({
                ...coupon,
                // 后端CouponUser.money是Long类型，单位为分，需要转换为元
                money: (coupon.money || 0) / 100,
                minPrice: (coupon.minPrice || 0) / 100,
                merId: merchant.merId, // CouponUser对象中已有merId字段
                type: 'merchant', // 标记为商家优惠券
                publisher: 2 // 发行方：2-商户
              }))
              this.availableCoupons.push(...merchantCoupons)
              console.log(`商户${merchant.merId}的商家优惠券 (merCouponUserList):`, merchantCoupons)
            }
          })
        }

        // 积分信息
        this.userIntegral = data.userIntegral || 0
        this.integralDeductionSwitch = data.integralDeductionSwitch || false
        this.isUseIntegral = data.isUseIntegral || false

        // 价格信息
        this.proTotalFee = parseFloat(data.proTotalFee || 0)
        this.freightFee = parseFloat(data.freightFee || 0)
        this.merCouponFee = parseFloat(data.merCouponFee || 0)
        this.platCouponFee = parseFloat(data.platCouponFee || 0)

        console.log('所有可用优惠券:', this.availableCoupons)
        console.log('积分信息:', { userIntegral: this.userIntegral, integralDeductionSwitch: this.integralDeductionSwitch })
        
        // 检查积分抵扣可用性并初始化积分抵扣金额计算
        if (this.integralDeductionSwitch && this.isUseIntegral) {
          // 如果积分不足，自动禁用积分抵扣
          if (!this.canUseIntegral) {
            this.isUseIntegral = false
            this.integralDeductionAmount = 0
            console.log('积分不足，自动禁用积分抵扣')
          } else {
            this.calculateIntegralDeduction()
          }
        }
        
        console.log('=== 加载预下单详情完成 ===')

      } catch (error) {
        console.error('加载预下单详情失败:', error)
        console.error('错误详情:', error.response || error)
        this.$message.error('加载订单详情失败: ' + (error.message || error))

        // 如果是404错误，可能是预下单号不正确
        if (error.response && error.response.status === 404) {
          this.$message.error('找不到预下单信息，预下单号: ' + this.preOrderNo)
        }
      }
    },

    async fetchAddressList() {
      try {
        const response = await getAddressList()
        if (response.code === 200) {
          this.addressList = response.data
          // 设置默认地址
          this.selectedAddress = this.addressList.find(addr => addr.isDefault) || this.addressList[0]

          // 地址已选择，如果有预下单号则重新加载详情
          if (this.selectedAddress && this.preOrderNo) {
            await this.loadPreOrderDetail()
          }
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
        this.$message.error('获取地址列表失败')
      }
    },

    // 过滤可用优惠券（已在loadPreOrderDetail中获取）
    filterAvailableCoupons() {
      if (this.availableCoupons && this.availableCoupons.length > 0) {
        // 根据订单金额过滤可用优惠券
        this.availableCoupons = this.availableCoupons.filter(coupon =>
          parseFloat(this.totalPrice || 0) >= parseFloat(coupon.minPrice || 0)
        )
      }
    },

    async selectAddress(address) {
      this.selectedAddress = address
      this.showAddressList = false

      // 重新计算订单价格
      if (this.preOrderNo) {
        await this.computeOrderPrice()
      }
    },

    async selectCoupon(coupon) {
      this.selectedCoupon = coupon
      this.showCouponList = false

      console.log('选择优惠券:', coupon)

      // 重新计算积分抵扣（因为优惠券会影响积分抵扣的计算）
      if (this.isUseIntegral) {
        this.calculateIntegralDeduction()
      }

      // 重新计算订单价格
      if (this.preOrderNo) {
        await this.computeOrderPrice()
      }
    },

    // 监听配送方式变化
    async onDeliveryTypeChange() {
      if (this.preOrderNo) {
        await this.computeOrderPrice()
      }
    },

    addNewAddress() {
      this.editingAddress = {}
      this.showAddressList = false
      this.showAddressSelector = true
    },

    editAddress(address) {
      this.editingAddress = { ...address }
      this.showAddressList = false
      this.showAddressSelector = true
    },

    async deleteAddress(id) {
      try {
        await this.$confirm('确定要删除这个地址吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteAddressApi(id)
        this.$message.success('删除成功')
        await this.fetchAddressList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    handleAddressSuccess() {
      this.fetchAddressList()
    },

    async submitOrder() {
      if (!this.selectedAddress) {
        this.$message.warning('请选择收货地址')
        return
      }

      if (!this.preOrderNo) {
        this.$message.error('预下单信息不完整，请刷新页面重试')
        return
      }

      try {
        this.submitting = true

        // 根据后端CouponUser字段确定使用的优惠券类型
        let platUserCouponId = 0
        let selectedMerchantCoupons = {}

        if (this.selectedCoupon) {
          // 根据publisher字段判断：1-平台，2-商户
          if (this.selectedCoupon.publisher === 1 || this.selectedCoupon.merId === 0) {
            // 平台优惠券：publisher=1 或 merId=0
            platUserCouponId = this.selectedCoupon.id
            console.log('使用平台优惠券:', this.selectedCoupon)
          } else if (this.selectedCoupon.publisher === 2 && this.selectedCoupon.merId > 0) {
            // 商家优惠券：publisher=2 且 merId>0
            selectedMerchantCoupons[this.selectedCoupon.merId] = this.selectedCoupon.id
            console.log('使用商家优惠券:', this.selectedCoupon)
          }
        }

        // 构建商户订单请求参数
        const orderMerchantRequestList = this.merchantInfo.map(merchant => {
          // 查找该商户的优惠券ID
          const userCouponId = selectedMerchantCoupons[merchant.merId] || 0

          return {
            merId: merchant.merId,
            userCouponId: userCouponId,
            shippingType: this.deliveryType,
            remark: this.remark || ''
          }
        })

        const orderData = {
          preOrderNo: this.preOrderNo,
          addressId: this.selectedAddress.id,
          orderMerchantRequestList: orderMerchantRequestList,
          isUseIntegral: this.isUseIntegral,
          platUserCouponId: platUserCouponId,
          systemFormId: null,
          orderExtend: null
        }

        console.log('=== 创建订单参数详情 ===')
        console.log('预下单号:', this.preOrderNo)
        console.log('地址ID:', this.selectedAddress.id)
        console.log('使用积分:', this.isUseIntegral)
        console.log('选中优惠券:', this.selectedCoupon)
        console.log('平台优惠券ID:', platUserCouponId)
        console.log('商户优惠券映射:', selectedMerchantCoupons)
        console.log('商户订单列表:', orderMerchantRequestList)
        console.log('完整订单数据:', orderData)
        
        const response = await createOrder(orderData)
        console.log('创建订单完整响应:', response)

        const data = response.data
        this.$message.success('订单创建成功')

        // 跳转到支付页面
        if (data && (data.orderNo || data.orderId || data.orderSn)) {
          const orderNo = data.orderNo || data.orderId || data.orderSn
          console.log('跳转到支付页面，订单号:', orderNo)

          // 准备支付页面需要的数据
          const payData = {
            orderNo: orderNo,
            totalPrice: this.finalPrice,
            addressInfo: `${this.selectedAddress.realName} ${this.selectedAddress.phone} ${this.selectedAddress.province}${this.selectedAddress.city}${this.selectedAddress.district} ${this.selectedAddress.detail}`,
            productNames: this.orderGoods.map(item => item.productInfo.storeName).join('、')
          }

          this.$router.push({
            path: `/order/pay/${orderNo}`,
            query: payData
          })
        } else {
          console.error('创建订单成功但未返回订单号:', data)
          this.$message.warning('订单创建成功，但无法跳转到支付页面')
        }
      } catch (error) {
        console.error('订单创建失败:', error)
        this.$message.error(error.message || '订单创建失败')
      } finally {
        this.submitting = false
      }
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    // 处理图片URL
    getImageUrl(imagePath) {
      if (!imagePath) return ''

      // 如果已经是完整的URL，直接返回
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // 如果是相对路径，需要拼接域名
      // 这里需要根据实际的图片服务器地址进行调整
      const baseUrl = process.env.VUE_APP_BASE_URL || window.location.origin
      return imagePath.startsWith('/') ? baseUrl + imagePath : baseUrl + '/' + imagePath
    },

    // 调试数据方法
    debugData() {
      console.log('=== 调试信息 ===')
      console.log('预下单号:', this.preOrderNo)
      console.log('商户信息:', this.merchantInfo)
      console.log('订单商品:', this.orderGoods)
      console.log('总价格:', this.totalPrice)
      console.log('运费:', this.shippingFee)
      console.log('用户余额:', this.userBalance)
      console.log('可用优惠券:', this.availableCoupons)
      console.log('路由参数:', this.$route.query)

      // 弹出提示框显示关键信息
      this.$alert(`
        预下单号: ${this.preOrderNo}
        商户数量: ${this.merchantInfo.length}
        商品数量: ${this.orderGoods.length}
        总价格: ¥${this.totalPrice}
        运费: ¥${this.shippingFee}
        路由参数: ${JSON.stringify(this.$route.query)}
      `, '调试信息', {
        confirmButtonText: '确定'
      })
    },

    async onShippingTypeChange(merId, shippingType) {
      console.log(`商户${merId}配送方式更改为:`, shippingType)
      // 重新计算价格
      await this.computeOrderPrice()
    },

    async onIntegralChange() {
      console.log('积分抵扣状态更改为:', this.isUseIntegral)
      // 计算积分抵扣金额
      this.calculateIntegralDeduction()
      // 重新计算价格
      await this.computeOrderPrice()
    },

    calculateIntegralDeduction() {
      if (this.isUseIntegral && this.userIntegral && this.integralDeductionSwitch) {
        // 100积分 = 1元，计算最大可抵扣金额
        const maxIntegralDeduction = Math.floor(this.userIntegral / 100)
        
        // 计算当前订单可抵扣的最大金额（不能超过订单总金额）
        let orderAmount = parseFloat(this.totalPrice || this.proTotalFee || 0)
        
        // 如果已选择优惠券，减去优惠券金额后再计算积分抵扣
        if (this.selectedCoupon) {
          const couponMoney = parseFloat(this.selectedCoupon.money || 0)
          orderAmount -= couponMoney
        }
        
        // 最终积分抵扣金额 = min(最大可用积分抵扣, 订单剩余金额)
        this.integralDeductionAmount = Math.min(maxIntegralDeduction, Math.max(0, orderAmount))
        
        console.log('积分抵扣计算:', {
          userIntegral: this.userIntegral,
          integralDeductionSwitch: this.integralDeductionSwitch,
          maxIntegralDeduction: maxIntegralDeduction,
          orderAmount: orderAmount,
          selectedCoupon: this.selectedCoupon,
          finalIntegralDeduction: this.integralDeductionAmount
        })
      } else {
        this.integralDeductionAmount = 0
      }
    },

    selectMerchantCoupon(merchant, coupon) {
      merchant.selectedCoupon = coupon
      merchant.userCouponId = coupon ? coupon.id : 0
      this.showCouponList = false
      this.computeOrderPrice()
    },





    toggleIntegral() {
      // 检查积分是否可用
      if (!this.canUseIntegral) {
        this.$message.warning('当前积分不足或积分抵扣功能未开启')
        return
      }
      
      this.isUseIntegral = !this.isUseIntegral
      console.log('切换积分抵扣状态:', this.isUseIntegral)
      
      // 重新计算积分抵扣金额
      this.calculateIntegralDeduction()
      
      // 重新计算订单价格
      if (this.preOrderNo) {
        this.computeOrderPrice()
      }
    },

    async fetchPayConfig() {
      try {
        console.log('正在获取支付配置...')
        const response = await getPayConfig()
        console.log('支付配置响应:', response)

        if (response.code === 200 && response.data) {
          this.payConfig = response.data
          // 从支付配置中获取用户余额
          if (response.data.yuePayStatus === 1) {
            this.userBalance = parseFloat(response.data.userBalance || 0)
          }
          console.log('用户余额:', this.userBalance)
        }
      } catch (error) {
        console.error('获取支付配置失败:', error)
        // 不阻断流程，只是记录错误
      }
    }
  },

  watch: {
    // 监听配送方式变化
    deliveryType() {
      this.onDeliveryTypeChange()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-confirm-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 15px 0;
  padding-left: 10px;
  border-left: 3px solid #ff6600;
}

.address-section {
  margin-bottom: 20px;

  .address-content {
    .address-box {
      border: 2px dashed #007bff;
      border-radius: 8px;
      padding: 20px;
      position: relative;
      background: #fff;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #0056b3;
        background: #f8f9fa;
      }

      .address-info {
        .contact-line {
          margin-bottom: 8px;
          display: flex;
          align-items: center;

          .name {
            font-weight: 500;
            font-size: 16px;
            color: #333;
            margin-right: 15px;
          }

          .phone {
            color: #666;
            font-size: 14px;
            margin-right: 15px;
          }

          .default-tag {
            background: #dc3545;
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
        }

        .address-line {
          color: #666;
          line-height: 1.5;
          font-size: 14px;
        }
      }

      &.add-address-box {
        border: 2px dashed #ddd;
        
        .add-address-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #999;
          min-height: 60px;

          i {
            font-size: 20px;
          }

          &:hover {
            color: #007bff;
          }
        }
      }
    }
  }
}

.order-section {
  margin-bottom: 20px;

  .order-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;

    .goods-list {
      .goods-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .goods-image {
          margin-right: 15px;

          img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border: 1px solid #e8e8e8;
          }
        }

        .goods-info {
          flex: 1;

          .goods-name {
            font-size: 14px;
            line-height: 1.4;
            color: #333;
            margin-bottom: 8px;
          }

          .goods-spec {
            color: #999;
            font-size: 12px;
          }
        }

        .goods-price {
          color: #333;
          font-size: 14px;
          margin-right: 15px;
        }

        .goods-quantity {
          color: #333;
          font-size: 14px;
          margin-right: 15px;
        }

        .goods-total {
          color: #dc3545;
          font-size: 16px;
          font-weight: 500;
          min-width: 60px;
          text-align: right;
        }
      }
    }

    .empty-goods {
      text-align: center;
      padding: 40px;
      color: #999;

      .el-button {
        color: #007bff;
        border: none;
        background: transparent;

        &:hover {
          color: #0056b3;
        }
      }
    }
  }
}

.coupon-section {
  .coupon-content {
    padding: 20px;

    .coupon-selector {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #e8e8e8;
      cursor: pointer;

      .placeholder {
        color: #999;
        font-size: 14px;
      }

      i {
        color: #999;
        font-size: 14px;
      }
    }
  }
}

.delivery-section {
  .delivery-options {
    padding: 20px;
  }
}

.remark-section {
  padding: 20px;
}

.total-section {
  .total-list {
    padding: 20px;

    .total-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      color: #333;

      &:last-child {
        margin-bottom: 0;
      }

      &.final {
        border-top: 1px solid #e8e8e8;
        padding-top: 16px;
        margin-top: 16px;
        font-size: 16px;
        font-weight: 600;

        .amount {
          color: #ff6600;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .discount {
        color: #ff6600;
        font-weight: 500;
      }

      span:first-child {
        font-weight: 400;
      }
    }
  }
}

.coupon-section,
.integral-section,
.remark-section {
  margin-bottom: 30px;

  .coupon-content,
  .integral-content,
  .remark-content {
    background: #fff;
    padding: 20px;
  }

  .coupon-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;

    .el-button {
      &.el-button--primary {
        background: #dc3545;
        border-color: #dc3545;
      }
    }
  }

  .coupon-discount,
  .integral-discount {
    color: #dc3545;
    font-size: 16px;
    font-weight: 500;
    text-align: right;
  }

  .integral-info {
    font-size: 14px;
    color: #333;
  }
}

.price-summary-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;

  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;

    &.final-price {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #f0f0f0;

      .final-amount {
        color: #dc3545;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .price-label {
      color: #333;
    }

    .price-value {
      color: #333;
      font-weight: 500;
    }
  }
}

.submit-section {
  text-align: center;
  margin-bottom: 30px;

  .submit-btn {
    width: 200px;
    height: 45px;
    font-size: 16px;
    font-weight: 500;
    background: #dc3545;
    border-color: #dc3545;

    &:hover {
      background: #c82333;
      border-color: #bd2130;
    }
  }
}

.service-guarantee {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;

  .guarantee-item {
    text-align: center;
    color: #666;
    font-size: 12px;

    .guarantee-icon {
      font-size: 20px;
      margin-bottom: 5px;
      display: block;
    }
  }
}

// 弹窗样式
.address-list,
.coupon-list {
  max-height: 450px;
  overflow-y: auto;

  .address-item,
  .coupon-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    border-radius: 8px;
    margin-bottom: 8px;

    &:hover {
      background: #f8f9fa;
    }

    &.selected {
      background: #fff7f0;
      border-color: #ff6600;
      box-shadow: 0 2px 4px rgba(255, 102, 0, 0.2);
    }

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
  }

  .add-address,
  .no-coupon {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    border: 2px dashed #e5e5e5;
    border-radius: 8px;
    cursor: pointer;
    color: #666;
    margin-top: 12px;

    &:hover {
      border-color: #ff6600;
      color: #ff6600;
    }

    i {
      color: #ff6600;
    }
  }
}

.coupon-item {
  .coupon-left {
    width: 100px;
    text-align: center;
    margin-right: 15px;

    .coupon-price {
      font-size: 18px;
      font-weight: bold;
      color: #ff4757;
    }

    .coupon-condition {
      font-size: 12px;
      color: #999;
    }
  }

  .coupon-right {
    flex: 1;

    .coupon-title {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .coupon-time {
      font-size: 12px;
      color: #999;
    }
  }

  .coupon-action {
    width: 30px;
    text-align: center;

    .el-icon-check {
      color: #409eff;
      font-size: 18px;
    }
  }
}

/* 新增：商户分组样式 */
.merchant-coupon-group,
.merchant-delivery-group,
.merchant-remark-group {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-left: 3px solid #ff6600;
  background: #fff;
}

.merchant-label {
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:before {
    content: "🏪";
    font-size: 16px;
  }
}

/* 新增：平台优惠券样式 */
.platform-coupon-section {
  // 移除了复杂的装饰样式
}

.coupon-amount {
  color: #ff6600;
  font-weight: 500;
  font-size: 14px;
  margin-top: 8px;
}

.no-coupon {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

/* 优惠券部分样式 */
.coupon-section {
  margin-bottom: 20px;

  .coupon-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .coupon-cards-row {
      flex: 1;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .coupon-card {
        display: flex;
        overflow: hidden;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
        height: 60px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &.selected {
          box-shadow: 0 4px 16px rgba(255, 102, 0, 0.3);
          
          .coupon-left {
            background: #ff6600;
          }
          
          .coupon-right {
            border-color: #ff6600;
            background: #fff8f5;
          }
        }

                 .coupon-left {
           width: 80px;
           background: #dc3545;
           display: flex;
           align-items: center;
           justify-content: center;
           position: relative;

           .coupon-type {
             color: #fff;
             font-size: 12px;
             font-weight: 600;
             text-align: center;
           }
         }

        .coupon-right {
          flex: 1;
          background: #fff;
          border: 2px solid #e0e0e0;
          border-left: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 15px;

          .coupon-amount {
            font-size: 14px;
            color: #333;
            font-weight: 600;
            text-align: center;
          }
        }
      }

      .more-coupon-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 15px;
        background: #f9f9f9;
        border: 2px dashed #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 100px;
        height: 60px;

        &:hover {
          border-color: #ff6600;
          background: #fff8f5;
        }

        .more-icon {
          font-size: 18px;
          color: #666;
          margin-bottom: 2px;
        }

        .more-text {
          font-size: 11px;
          color: #666;
          font-weight: 500;
          text-align: center;
        }
      }

      .no-coupons-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 15px;
        background: #f9f9f9;
        border: 2px dashed #ddd;
        border-radius: 8px;
        min-width: 150px;
        height: 60px;

        .no-coupon-icon {
          font-size: 18px;
          margin-bottom: 2px;
        }

        span {
          color: #999;
          font-size: 12px;
          text-align: center;
        }
      }
    }

    .coupon-discount {
      .discount-amount {
        color: #ff6600;
        font-weight: 500;
        font-size: 16px;
      }
    }
  }
}

/* 积分抵扣样式 */
.integral-section {
  margin-bottom: 20px;

  .integral-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .integral-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px 20px;
      background: #f9f9f9;
      border: 2px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
      height: 60px;

      &:hover {
        border-color: #ff6600;
        background: #fff8f5;
      }

      &.selected {
        border-color: #ff6600;
        background: #fff8f5;
        
        .radio-icon {
          background: #ff6600;
          border-color: #ff6600;
          
          &::after {
            opacity: 1;
          }
        }
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f5f5f5;
        border-color: #ddd;

        &:hover {
          border-color: #ddd;
          background: #f5f5f5;
        }

        .integral-number {
          color: #999;
        }
      }

      .integral-radio {
        .radio-icon {
          width: 16px;
          height: 16px;
          border: 2px solid #ddd;
          border-radius: 50%;
          background: #fff;
          position: relative;
          transition: all 0.3s ease;

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 6px;
            height: 6px;
            background: #fff;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          &.checked {
            background: #ff6600;
            border-color: #ff6600;
            
            &::after {
              opacity: 1;
            }
          }
        }
      }

      .integral-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .integral-text {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .integral-number {
          font-size: 14px;
          color: #ff6600;
          font-weight: 600;
        }

        .integral-tip {
          font-size: 12px;
          color: #999;
          margin-left: 8px;
        }
      }
    }

    .integral-discount {
      .discount-amount {
        color: #ff6600;
        font-weight: 500;
        font-size: 16px;
      }
    }
  }
}

/* 买家留言样式 */
.remark-section {
  margin-bottom: 20px;

  .remark-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;

    .el-textarea :deep(.el-textarea__inner) {
      border-radius: 4px;
      border: 1px solid #ddd;
      
      &:focus {
        border-color: #ff6600;
      }
    }
  }
}

/* 价格汇总样式 */
.price-summary-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;

    .price-label {
      color: #666;
    }

    .price-value {
      font-weight: 500;
      color: #333;

      &.discount {
        color: #ff6600;
      }
    }

    &.final-price {
      padding-top: 10px;
      border-top: 1px solid #f0f0f0;
      margin-top: 10px;
      font-size: 16px;

      .price-label {
        color: #333;
        font-weight: 500;
      }

      .final-amount {
        color: #ff6600;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}

/* 提交按钮样式 */
.submit-section {
  text-align: center;
  margin-bottom: 30px;

  .submit-btn {
    width: 200px;
    height: 50px;
    background: #ff6600;
    border-color: #ff6600;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 500;

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

/* 服务保障样式 */
.service-guarantee {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .guarantee-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;

    .guarantee-icon {
      font-size: 24px;
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }

  .goods-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .submit-section {
    flex-direction: column;
    gap: 15px;
  }

  .integral-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
