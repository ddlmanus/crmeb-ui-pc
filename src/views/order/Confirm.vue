<template>
  <div class="order-confirm">
    <div class="container">
      <div class="page-header">
        <h2>确认订单</h2>
      </div>

      <!-- 收货地址 -->
      <div class="section address-section">
        <div class="section-title">
          <i class="el-icon-location"></i>
          收货地址
        </div>
        <div class="address-content">
          <div v-if="selectedAddress" class="address-item selected">
            <div class="address-info">
              <div class="user-info">
                <span class="name">{{ selectedAddress.realName }}</span>
                <span class="phone">{{ selectedAddress.phone }}</span>
                <span v-if="selectedAddress.isDefault" class="default-tag">默认</span>
              </div>
              <div class="address-detail">
                {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}
              </div>
            </div>
            <div class="address-action">
              <el-button type="text" @click="showAddressList = true">更换地址</el-button>
            </div>
          </div>
          <div v-else class="no-address">
            <i class="el-icon-warning"></i>
            <span>请选择收货地址</span>
            <el-button type="primary" @click="showAddressList = true">选择地址</el-button>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="section goods-section">
        <div class="section-title">
          <i class="el-icon-goods"></i>
          商品信息
        </div>
        <div class="goods-list" v-loading="loading">
          <div v-if="orderGoods && orderGoods.length > 0" class="goods-content">
            <div v-for="item in orderGoods" :key="item.id" class="goods-item">
              <img :src="item.productInfo.image" :alt="item.productInfo.storeName" />
              <div class="goods-info">
                <h4>{{ item.productInfo.storeName }}</h4>
                <div class="goods-specs" v-if="item.productInfo.attrInfo">
                  {{ item.productInfo.attrInfo.suk }}
                </div>
                <div class="goods-price">¥{{ item.truePrice }} × {{ item.cartNum }}</div>
              </div>
              <div class="goods-total">¥{{ (item.truePrice * item.cartNum).toFixed(2) }}</div>
            </div>
          </div>
          <div v-else-if="!loading" class="no-goods">
            <p>暂无商品信息</p>
            <el-button type="primary" @click="debugData">查看调试信息</el-button>
          </div>
        </div>
      </div>

      <!-- 优惠券 -->
      <div class="section coupon-section">
        <div class="section-title">
          <i class="el-icon-ticket"></i>
          店铺优惠
        </div>
        <div v-for="merchant in merchantInfoList" :key="'merchant_coupon_' + merchant.merId" class="merchant-coupon-group">
          <div class="merchant-label">{{ merchant.merName }}</div>
          <div class="coupon-content">
            <div class="coupon-selector" @click="showCouponList = true; currentMerchantId = merchant.merId">
              <span v-if="merchant.selectedCoupon">
                {{ merchant.selectedCoupon.name }} -¥{{ ((merchant.selectedCoupon.money || 0) / 100).toFixed(2) }}
              </span>
              <span v-else class="placeholder">选择优惠券</span>
              <i class="el-icon-arrow-right"></i>
            </div>
            <div class="coupon-amount" v-if="merchant.merCouponFee && parseFloat(merchant.merCouponFee) > 0">
              已优惠：¥{{ parseFloat(merchant.merCouponFee).toFixed(2) }}
            </div>
            <div class="no-coupon" v-else>暂无优惠券</div>
          </div>
        </div>
      </div>

      <!-- 平台优惠券 -->
      <div class="section platform-coupon-section">
        <div class="section-title">
          <i class="el-icon-star-on"></i>
          平台优惠
        </div>
        <div class="coupon-content">
          <div class="coupon-selector" @click="showPlatformCouponList = true">
            <span v-if="selectedPlatformCoupon">
              {{ selectedPlatformCoupon.name }} -¥{{ ((selectedPlatformCoupon.money || 0) / 100).toFixed(2) }}
            </span>
            <span v-else class="placeholder">选择平台优惠券</span>
            <i class="el-icon-arrow-right"></i>
          </div>
          <div class="coupon-amount" v-if="platCouponFee && parseFloat(platCouponFee) > 0">
            已优惠：¥{{ parseFloat(platCouponFee).toFixed(2) }}
          </div>
          <div class="no-coupon" v-else>暂无优惠券</div>
        </div>
      </div>

      <!-- 积分抵扣 -->
      <div class="section integral-section" v-if="integralDeductionSwitch">
        <div class="section-title">
          <i class="el-icon-coin"></i>
          积分抵扣
        </div>
        <div class="integral-content">
          <div class="integral-info">
            <span>当前积分：{{ userIntegral || 0 }}</span>
          </div>
          <div class="integral-switch">
            <el-switch 
              v-model="isUseIntegral" 
              @change="onIntegralChange"
              active-text="使用积分抵扣"
              inactive-text="不使用积分抵扣"
            ></el-switch>
          </div>
          <div class="integral-amount" v-if="isUseIntegral && integralDeductionAmount > 0">
            积分抵扣：-¥{{ integralDeductionAmount.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 配送方式 -->
      <div class="section delivery-section">
        <div class="section-title">
          <i class="el-icon-truck"></i>
          配送方式
        </div>
        <div v-for="merchant in merchantInfoList" :key="'merchant_delivery_' + merchant.merId" class="merchant-delivery-group">
          <div class="merchant-label">{{ merchant.merName }}</div>
          <div class="delivery-options">
            <el-radio-group v-model="merchant.shippingType" @change="onShippingTypeChange(merchant.merId, merchant.shippingType)">
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

      <!-- 买家留言 -->
      <div class="section remark-section">
        <div class="section-title">
          <i class="el-icon-edit"></i>
          买家留言
        </div>
        <div v-for="merchant in merchantInfoList" :key="'merchant_remark_' + merchant.merId" class="merchant-remark-group">
          <div class="merchant-label">{{ merchant.merName }}</div>
          <el-input
            v-model="merchantRemarks[merchant.merId]"
            type="textarea"
            :rows="3"
            placeholder="选填，对本次交易的说明（建议填写已与商家协商一致的内容）"
            maxlength="200"
            show-word-limit
          ></el-input>
        </div>
      </div>

      <!-- 费用明细 -->
      <div class="section total-section">
        <div class="total-list">
          <div class="total-item">
            <span>商品总价</span>
            <span>¥{{ parseFloat(proTotalFee || 0).toFixed(2) }}</span>
          </div>
          <div class="total-item">
            <span>快递费用</span>
            <span v-if="freightFee && parseFloat(freightFee) > 0">¥{{ parseFloat(freightFee).toFixed(2) }}</span>
            <span v-else>免运费</span>
          </div>
          <div class="total-item" v-if="merCouponFee && parseFloat(merCouponFee) > 0">
            <span>店铺优惠</span>
            <span class="discount">-¥{{ parseFloat(merCouponFee).toFixed(2) }}</span>
          </div>
          <div class="total-item" v-if="platCouponFee && parseFloat(platCouponFee) > 0">
            <span>平台优惠</span>
            <span class="discount">-¥{{ parseFloat(platCouponFee).toFixed(2) }}</span>
          </div>
          <div class="total-item" v-if="isUseIntegral && integralDeductionAmount > 0">
            <span>积分抵扣</span>
            <span class="discount">-¥{{ parseFloat(integralDeductionAmount).toFixed(2) }}</span>
          </div>
          <div class="total-item final">
            <span>实付金额</span>
            <span class="amount">¥{{ finalPrice }}</span>
          </div>
        </div>
      </div>

      <!-- 提交订单 -->
      <div class="submit-section">
        <div class="submit-info">
          <div class="total-amount">
            合计：<span>¥{{ finalPrice }}</span>
          </div>
        </div>
        <el-button 
          type="primary" 
          size="large" 
          :loading="submitting"
          @click="submitOrder"
        >
          提交订单
        </el-button>
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
            <div class="coupon-price">¥{{ (coupon.money || 0) / 100 }}</div>
            <div class="coupon-condition">满{{ (coupon.minPrice || 0) / 100 }}元可用</div>
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

    <!-- 平台优惠券列表弹窗 -->
    <el-dialog title="选择平台优惠券" :visible.sync="showPlatformCouponList" width="600px">
      <div class="coupon-list">
        <div 
          v-for="coupon in platformCoupons" 
          :key="coupon.id"
          class="coupon-item"
          :class="{ selected: selectedPlatformCoupon && selectedPlatformCoupon.id === coupon.id }"
          @click="selectPlatformCoupon(coupon)"
        >
          <div class="coupon-left">
            <div class="coupon-price">¥{{ (coupon.money || 0) / 100 }}</div>
            <div class="coupon-condition">满{{ (coupon.minPrice || 0) / 100 }}元可用</div>
          </div>
          <div class="coupon-right">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div class="coupon-time">有效期至：{{ formatDate(coupon.endTime) }}</div>
          </div>
          <div class="coupon-action">
            <i v-if="selectedPlatformCoupon && selectedPlatformCoupon.id === coupon.id" class="el-icon-check"></i>
          </div>
        </div>
        <div class="no-coupon" @click="selectPlatformCoupon(null)">
          <span>不使用平台优惠券</span>
          <i v-if="!selectedPlatformCoupon" class="el-icon-check"></i>
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
      selectedPlatformCoupon: null,
      platformCoupons: [],
      showPlatformCouponList: false
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
        price -= parseFloat((this.selectedCoupon.money || 0) / 100)
      }
      
      return Math.max(0, price).toFixed(2)
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
        
        // 第一步：获取地址列表
        await this.fetchAddressList()
        
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
        
        // 构建商户订单请求参数
        const orderMerchantRequestList = this.merchantInfo.map(merchant => ({
          merId: merchant.merId,
          userCouponId: this.selectedCoupon && this.selectedCoupon.merId === merchant.merId ? this.selectedCoupon.id : 0,
          shippingType: this.deliveryType,
          remark: this.remark
        }))
        
        const computeRequest = {
          preOrderNo: this.preOrderNo,
          addressId: this.selectedAddress ? this.selectedAddress.id : null,
          orderMerchantRequestList: orderMerchantRequestList,
          isUseIntegral: this.isUseIntegral,
          platUserCouponId: 0 // 平台优惠券暂不支持
        }
        
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
        
        // 设置可用优惠券和积分信息（从预下单响应中获取）
        this.availableCoupons = []
        
        // 平台优惠券
        if (data.platCouponUserList && data.platCouponUserList.length > 0) {
          this.platformCoupons = [...data.platCouponUserList]
          this.availableCoupons = [...data.platCouponUserList]
          console.log('平台优惠券:', data.platCouponUserList)
        }
        
        // 商户信息和优惠券
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
          
          // 处理商户优惠券
          data.merchantInfoList.forEach(merchant => {
            if (merchant.merCouponUserList && merchant.merCouponUserList.length > 0) {
              merchant.merCouponUserList.forEach(coupon => {
                this.availableCoupons.push({
                  ...coupon,
                  merId: merchant.merId // 标记是哪个商户的优惠券
                })
              })
              console.log(`商户${merchant.merId}的优惠券:`, merchant.merCouponUserList)
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
           parseFloat(this.totalPrice || 0) >= parseFloat((coupon.minPrice || 0) / 100)
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
        
        // 构建商户订单请求参数
        const orderMerchantRequestList = this.merchantInfo.map(merchant => ({
          merId: merchant.merId,
          userCouponId: this.selectedCoupon && this.selectedCoupon.merId === merchant.merId ? this.selectedCoupon.id : 0,
          shippingType: this.deliveryType,
          remark: this.remark
        }))
        
        const orderData = {
          preOrderNo: this.preOrderNo,
          addressId: this.selectedAddress.id,
          orderMerchantRequestList: orderMerchantRequestList,
          isUseIntegral: this.isUseIntegral,
          platUserCouponId: 0, // 平台优惠券暂不支持
          systemFormId: null,
          orderExtend: null
        }
        
        console.log('创建订单请求参数:', orderData)
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
       if (this.isUseIntegral && this.userIntegral) {
         // 100积分 = 1元
         this.integralDeductionAmount = Math.min(
           this.userIntegral / 100,
           this.proTotalFee || 0
         )
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

     selectPlatformCoupon(coupon) {
       this.selectedPlatformCoupon = coupon
       this.showPlatformCouponList = false
       this.computeOrderPrice()
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
.order-confirm {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0 100px 0; /* 底部增加padding避免被固定底部遮挡 */
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
    font-size: 24px;
    font-weight: 500;
  }
}

.section {
  background: #fff;
  margin-bottom: 16px;
  border: 1px solid #e8e8e8;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 500;
    color: #333;
    font-size: 16px;
    margin: 0;
    
    i {
      color: #666;
      font-size: 16px;
    }
  }
}

.address-section {
  .address-content {
    padding: 20px;
    
    .address-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #e8e8e8;
      cursor: pointer;
      
      &.selected {
        border-color: #ff6600;
        background: #fff7f0;
      }
      
      .address-info {
        flex: 1;
        
        .user-info {
          margin-bottom: 8px;
          
          .name {
            font-weight: 500;
            margin-right: 15px;
            font-size: 16px;
            color: #333;
          }
          
          .phone {
            color: #666;
            margin-right: 15px;
          }
          
          .default-tag {
            background: #ff6600;
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
        }
        
        .address-detail {
          color: #666;
          line-height: 1.5;
          font-size: 14px;
        }
      }
      
      .address-action {
        .el-button {
          color: #ff6600;
          border-color: #ff6600;
          background: transparent;
          
          &:hover {
            background: #ff6600;
            color: white;
          }
        }
      }
    }
    
    .no-address {
      text-align: center;
      padding: 40px;
      color: #999;
      border: 1px dashed #e8e8e8;
      
      i {
        font-size: 24px;
        margin-bottom: 10px;
        display: block;
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
  }
}

.goods-section {
  .goods-list {
    .no-goods {
      text-align: center;
      padding: 40px;
      color: #999;
      
      .el-button {
        background: #ff6600;
        border-color: #ff6600;
        
        &:hover {
          background: #e55a00;
          border-color: #e55a00;
        }
      }
    }
    
    .goods-item {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      img {
        width: 70px;
        height: 70px;
        object-fit: cover;
        margin-right: 12px;
        border: 1px solid #e8e8e8;
      }
      
      .goods-info {
        flex: 1;
        
        h4 {
          margin: 0 0 6px;
          font-size: 14px;
          line-height: 1.4;
          color: #333;
          font-weight: 400;
        }
        
        .goods-specs {
          color: #999;
          font-size: 12px;
          margin-bottom: 8px;
        }
        
        .goods-price {
          color: #ff6600;
          font-weight: 500;
          font-size: 14px;
        }
      }
      
      .goods-total {
        font-size: 14px;
        font-weight: 500;
        color: #ff6600;
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

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  
  .submit-info {
    .total-amount {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      
      span {
        color: #ff6600;
        font-size: 20px;
        font-weight: 600;
      }
    }
  }
  
  .el-button {
    min-width: 120px;
    height: 40px;
    background: #ff6600;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    color: white;
    
    &:hover {
      background: #e55a00;
    }
  }
}

// 弹窗样式
.address-list,
.coupon-list {
  max-height: 400px;
  overflow-y: auto;
  
  .address-item,
  .coupon-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &.selected {
      background: #f0f8ff;
    }
    
    &:last-child {
      border-bottom: none;
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
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    
    &:hover {
      border-color: #409eff;
      color: #409eff;
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

/* 新增：积分抵扣样式 */
.integral-section {
  // 移除了复杂的装饰样式
}

.integral-content {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.integral-info {
  font-weight: 500;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:before {
    content: "🪙";
    font-size: 16px;
  }
}

.integral-switch {
  flex: 1;
  
  .el-switch {
    --el-switch-on-color: #ff6600;
  }
}

.integral-amount {
  color: #ff6600;
  font-weight: 500;
  width: 100%;
  margin-top: 12px;
  font-size: 14px;
}

/* 新增：配送方式样式 */
.delivery-section .delivery-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  .el-radio-group {
    flex: 1;
  }
  
  .el-radio {
    margin-right: 20px;
    
    .el-radio__input.is-checked .el-radio__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }
}

.shipping-desc {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
  background: #e8f4fd;
  padding: 8px 16px;
  border-radius: 20px;
  border-left: 4px solid #667eea;
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