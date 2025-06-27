<template>
  <div class="product-detail">
    <div class="container">
      <!-- 商品详情主体 -->
      <div class="product-main" v-loading="loading">
        <!-- 商品基本信息 -->
        <div class="product-info-section">
          <div class="product-gallery">
            <!-- 主图展示 -->
            <div class="main-image">
              <img :src="selectedImage" :alt="productInfo.name" />
              <div class="image-actions">
                <i class="el-icon-zoom-in" @click="previewImage"></i>
              </div>
            </div>

            <!-- 缩略图列表 -->
            <div class="thumbnail-list">
              <div
                v-for="(image, index) in productInfo.images"
                :key="index"
                class="thumbnail-item"
                :class="{ active: selectedImage === image }"
                @click="selectImage(image)"
              >
                <img :src="image" :alt="`图片${index + 1}`" />
              </div>
            </div>
          </div>

          <div class="product-details">
            <!-- 商品标题和价格 -->
            <div class="product-header">
              <h1 class="product-title">{{ productInfo.name }}</h1>
              <div class="product-subtitle" v-if="productInfo.subtitle">
                {{ productInfo.subtitle }}
              </div>
              <div class="product-labels" v-if="productInfo.labels">
                <span
                  v-for="label in productInfo.labels"
                  :key="label.text"
                  class="product-label"
                  :class="label.type"
                >
                  {{ label.text }}
                </span>
              </div>
            </div>

            <div class="price-section">
              <div class="price-group">
                <span class="current-price">¥{{ selectedSku.price || productInfo.price }}</span>
                <span class="original-price" v-if="productInfo.originalPrice">¥{{ productInfo.originalPrice }}</span>
              </div>
              <div class="price-info">
                <div class="price-item">
                  <span class="label">销量：</span>
                  <span class="value">{{ productInfo.sales }}</span>
                </div>
                <div class="price-item">
                  <span class="label">库存：</span>
                  <span class="value">{{ selectedSku.stock || productInfo.stock }}</span>
                </div>
              </div>
            </div>

            <!-- 规格选择 -->
            <div class="spec-section" v-if="productInfo.specs && productInfo.specs.length">
              <div
                v-for="spec in productInfo.specs"
                :key="spec.name"
                class="spec-group"
              >
                <div class="spec-title">{{ spec.name }}：</div>
                <div class="spec-options">
                  <div
                    v-for="option in spec.options"
                    :key="option.value"
                    class="spec-option"
                    :class="{
                      active: selectedSpecs[spec.name] === option.value,
                      disabled: option.disabled
                    }"
                    @click="selectSpec(spec.name, option.value)"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 数量选择 -->
            <div class="quantity-section">
              <div class="quantity-title">数量：</div>
              <div class="quantity-selector">
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="selectedSku.stock || productInfo.stock"
                  size="small"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                class="add-cart-btn"
                :disabled="!canAddToCart"
                :loading="addingToCart"
                @click="addToCart"
              >
                <i class="el-icon-shopping-cart-full"></i>
                加入购物车
              </el-button>
              <el-button
                type="danger"
                size="large"
                class="buy-now-btn"
                :disabled="!canBuyNow"
                :loading="buyingNow"
                @click="buyNow"
              >
                立即购买
              </el-button>
            </div>

            <!-- 服务保障 -->
            <div class="service-guarantee">
              <div class="service-title">服务保障</div>
              <div class="service-list">
                <div class="service-item">
                  <i class="el-icon-truck"></i>
                  <span>全国包邮</span>
                </div>
                <div class="service-item">
                  <i class="el-icon-refresh"></i>
                  <span>7天无理由退货</span>
                </div>
                <div class="service-item">
                  <i class="el-icon-medal"></i>
                  <span>正品保证</span>
                </div>
                <div class="service-item">
                  <i class="el-icon-service"></i>
                  <span>24小时客服</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品详情内容 -->
        <div class="product-content-section">
          <el-tabs v-model="activeTab" class="product-tabs">
            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-content" v-html="productInfo.detail"></div>
            </el-tab-pane>
            <el-tab-pane label="规格参数" name="params">
              <div class="params-content">
                <table class="params-table">
                  <tr v-for="param in productInfo.params" :key="param.name">
                    <td class="param-name">{{ param.name }}</td>
                    <td class="param-value">{{ param.value }}</td>
                  </tr>
                </table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="用户评价" name="reviews">
              <div class="reviews-content">
                <div class="review-summary">
                  <div class="rating-overview">
                    <div class="rating-score">{{ productInfo.averageRating }}</div>
                    <el-rate v-model="productInfo.averageRating" disabled show-score />
                    <div class="rating-count">{{ productInfo.reviewCount }}条评价</div>
                  </div>
                </div>
                <div class="review-list">
                  <div
                    v-for="review in productInfo.reviews"
                    :key="review.id"
                    class="review-item"
                  >
                    <div class="review-header">
                      <div class="user-info">
                        <img :src="review.avatar" :alt="review.username" class="user-avatar" />
                        <span class="username">{{ review.username }}</span>
                      </div>
                      <div class="review-meta">
                        <el-rate v-model="review.rating" disabled />
                        <span class="review-date">{{ review.date }}</span>
                      </div>
                    </div>
                    <div class="review-content">{{ review.content }}</div>
                    <div class="review-images" v-if="review.images">
                      <img
                        v-for="(image, index) in review.images"
                        :key="index"
                        :src="image"
                        class="review-image"
                        @click="previewReviewImage(image)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 推荐商品 -->
      <div class="recommend-section">
        <h3 class="section-title">相关推荐</h3>
        <div class="recommend-products">
          <div
            v-for="product in recommendProducts"
            :key="product.id"
            class="recommend-item"
            @click="goToProduct(product.id)"
          >
            <img :src="product.image" :alt="product.name" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProductDetail } from '@/api/product'
import { addCartItem } from '@/api/cart'
import { mapActions } from 'vuex'

export default {
  name: 'ProductDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      productInfo: {
        id: 1,
        name: '阿迪达斯官网 adidas BBALL CAP COT 男女训练运动帽子',
        subtitle: '经典款式，适合运动和日常佩戴',
        price: 100.00,
        originalPrice: 200.00,
        sales: 233,
        stock: 50,
        averageRating: 4.8,
        reviewCount: 156,
        images: [
          'https://dummyimage.com/500x500/2196f3/ffffff&text=adidas帽子1',
          'https://dummyimage.com/500x500/4caf50/ffffff&text=adidas帽子2',
          'https://dummyimage.com/500x500/ff9800/ffffff&text=adidas帽子3',
          'https://dummyimage.com/500x500/e91e63/ffffff&text=adidas帽子4'
        ],
        labels: [
          { text: '热销', type: 'hot' },
          { text: '新品', type: 'new' }
        ],
        specs: [
          {
            name: '颜色',
            options: [
              { label: '黑色', value: 'black' },
              { label: '白色', value: 'white' },
              { label: '蓝色', value: 'blue' }
            ]
          },
          {
            name: '尺码',
            options: [
              { label: 'S', value: 'S' },
              { label: 'M', value: 'M' },
              { label: 'L', value: 'L' },
              { label: 'XL', value: 'XL' }
            ]
          }
        ],
        skus: [
          { specs: { '颜色': 'black', '尺码': 'S' }, price: 95, stock: 10 },
          { specs: { '颜色': 'black', '尺码': 'M' }, price: 100, stock: 15 },
          { specs: { '颜色': 'white', '尺码': 'L' }, price: 105, stock: 8 }
        ],
        detail: '<div><img src="https://dummyimage.com/800x600/f0f0f0/333&text=商品详情图1" /><p>这是商品的详细描述...</p></div>',
        params: [
          { name: '品牌', value: 'adidas' },
          { name: '材质', value: '100%棉' },
          { name: '产地', value: '中国' },
          { name: '适用季节', value: '四季' }
        ],
        reviews: [
          {
            id: 1,
            username: '用户***1',
            avatar: 'https://dummyimage.com/40x40/409eff/ffffff&text=U1',
            rating: 5,
            date: '2024-01-15',
            content: '质量很好，款式也不错，值得购买！',
            images: ['https://dummyimage.com/100x100/67c23a/ffffff&text=评价图1']
          },
          {
            id: 2,
            username: '用户***2',
            avatar: 'https://dummyimage.com/40x40/67c23a/ffffff&text=U2',
            rating: 4,
            date: '2024-01-10',
            content: '帽子很舒适，但颜色稍微有点色差。',
            images: []
          }
        ]
      },
      recommendProducts: [
        {
          id: 2,
          name: '运动T恤',
          image: 'https://dummyimage.com/200x200/ff9800/ffffff&text=T恤',
          price: 89.00
        },
        {
          id: 3,
          name: '运动鞋',
          image: 'https://dummyimage.com/200x200/9c27b0/ffffff&text=运动鞋',
          price: 299.00
        }
      ],
      selectedImage: '',
      selectedSpecs: {},
      selectedSku: {},
      quantity: 1,
      activeTab: 'detail',
      addingToCart: false,
      buyingNow: false
    }
  },
  computed: {
    canAddToCart() {
      return this.hasRequiredSpecs && this.selectedSku.stock > 0
    },
    canBuyNow() {
      return this.hasRequiredSpecs && this.selectedSku.stock > 0
    },
    hasRequiredSpecs() {
      // 如果没有规格或者是单规格商品，直接返回true
      if (!this.productInfo.specs || this.productInfo.specs.length === 0) {
        return true
      }
      
      // 多规格商品需要检查所有规格是否都已选择
      return this.productInfo.specs.every(spec => this.selectedSpecs[spec.name])
    }
  },
  watch: {
    selectedSpecs: {
      handler() {
        this.updateSelectedSku()
      },
      deep: true
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    ...mapActions(['getCartCount']),
    async initData() {
      this.loading = true
      try {
        await this.loadProductDetail()
        this.selectedImage = this.productInfo.images[0]
        this.initDefaultSpecs()
      } catch (error) {
        this.$message.error('加载商品详情失败')
      } finally {
        this.loading = false
      }
    },
    async loadProductDetail() {
      try {
        console.log('正在加载商品详情，ID:', this.id)
        const res = await getProductDetail(this.id)
        console.log('商品详情API响应:', res)

        if (res.code === 200 && res.data) {
          const data = res.data
          const productInfo = data.productInfo
          const productAttr = data.productAttr || []
          const productValue = data.productValue || {}

          // 处理图片数据 - 正确解析JSON字符串
          let images = []
          if (productInfo.sliderImage) {
            try {
              const sliderImages = JSON.parse(productInfo.sliderImage)
              images = Array.isArray(sliderImages) ? sliderImages : [productInfo.image]
            } catch (e) {
              console.warn('解析sliderImage失败，使用默认图片:', e)
              images = [productInfo.image]
            }
          } else {
            images = [productInfo.image]
          }

          // 处理规格数据
          const specs = this.formatSpecs(productAttr)

          // 处理SKU数据
          const skus = this.formatSkus(productValue, specs)

          this.productInfo = {
            id: productInfo.id,
            name: productInfo.name,
            subtitle: productInfo.intro || '',
            price: parseFloat(productInfo.price || 0),
            originalPrice: parseFloat(productInfo.otPrice || productInfo.price || 0),
            sales: productInfo.sales || 0,
            stock: productInfo.stock || 0,
            averageRating: 5.0,
            reviewCount: 0,
            images: images,
            labels: [],
            specs: specs,
            skus: skus,
            detail: productInfo.content || '<p>暂无详细描述</p>',
            params: this.formatParams(productInfo),
            reviews: []
          }
        }

      } catch (error) {
        console.error('加载商品详情失败:', error)
        throw error
      }
    },
    formatSpecs(productAttr) {
      // 格式化商品规格数据
      if (!productAttr || productAttr.length === 0) return []

      const specs = {}
      productAttr.forEach(attr => {
        if (!specs[attr.attrName]) {
          specs[attr.attrName] = {
            name: attr.attrName,
            options: []
          }
        }
        // 处理attrValues，可能是字符串或数组
        let values = []
        if (typeof attr.attrValues === 'string') {
          values = attr.attrValues.split(',').filter(v => v.trim())
        } else if (Array.isArray(attr.attrValues)) {
          values = attr.attrValues
        }

        values.forEach(value => {
          if (!specs[attr.attrName].options.find(opt => opt.value === value)) {
            specs[attr.attrName].options.push({
              label: value,
              value: value
            })
          }
        })
      })

      return Object.values(specs)
    },
    formatSkus(productValue, specs) {
      // 格式化SKU数据
      if (!productValue || Object.keys(productValue).length === 0) {
        return []
      }

      const skus = []
      Object.keys(productValue).forEach(skuKey => {
        const sku = productValue[skuKey]

        // 根据规格名称构建specs对象
        const skuSpecs = {}
        if (specs && specs.length > 0) {
          // 如果有规格，解析skuKey中的规格值
          specs.forEach((spec, index) => {
            // 对于单规格，skuKey可能就是规格值
            if (specs.length === 1) {
              skuSpecs[spec.name] = skuKey
            } else {
              // 多规格需要按照某种格式解析
              const specValues = skuKey.split(',')
              skuSpecs[spec.name] = specValues[index] || skuKey
            }
          })
        }

        skus.push({
          id: sku.id, // 使用后端返回的真实ID，这是attrValueId
          specs: skuSpecs,
          price: parseFloat(sku.price || 0),
          stock: parseInt(sku.stock || 0),
          image: sku.image,
          sku: sku.sku || skuKey,
          skuKey: skuKey // 保留原始的sku字符串
        })
      })

      console.log('格式化后的SKUs:', skus)

      // 如果没有SKU数据但有商品基础信息，创建一个默认SKU
      if (skus.length === 0 && this.productInfo && this.productInfo.price !== undefined) {
        skus.push({
          id: null, // 单规格商品可能没有attrValueId
          specs: {},
          price: parseFloat(this.productInfo.price || 0),
          stock: parseInt(this.productInfo.stock || 0),
          image: this.productInfo.image,
          sku: 'default',
          skuKey: 'default'
        })
      }

      return skus
    },
    formatParams(productInfo) {
      // 格式化商品参数
      return [
        { name: '商品编号', value: productInfo.id },
        { name: '商品名称', value: productInfo.name },
        { name: '库存数量', value: productInfo.stock },
        { name: '计量单位', value: productInfo.unitName || '件' },
        { name: '销售量', value: productInfo.sales || 0 }
      ]
    },
    initDefaultSpecs() {
      // 清空之前的选择
      this.selectedSpecs = {}
      
      if (this.productInfo.specs && this.productInfo.specs.length > 0) {
        // 多规格商品，选择第一个可用的规格
        this.productInfo.specs.forEach(spec => {
          const firstAvailable = spec.options.find(option => !option.disabled)
          if (firstAvailable) {
            this.$set(this.selectedSpecs, spec.name, firstAvailable.value)
          }
        })
      }
      
      this.updateSelectedSku()
      
      console.log('初始化默认规格完成:')
      console.log('- selectedSpecs:', this.selectedSpecs)
      console.log('- selectedSku:', this.selectedSku)
      console.log('- specs length:', this.productInfo.specs ? this.productInfo.specs.length : 0)
      console.log('- skus length:', this.productInfo.skus ? this.productInfo.skus.length : 0)
    },
    selectImage(image) {
      this.selectedImage = image
    },
    selectSpec(specName, value) {
      this.$set(this.selectedSpecs, specName, value)
    },
    updateSelectedSku() {
      if (this.productInfo.skus && this.productInfo.skus.length > 0) {
        // 如果有SKU数据，查找匹配的SKU
        if (Object.keys(this.selectedSpecs).length > 0) {
          const sku = this.productInfo.skus.find(sku => {
            return Object.keys(this.selectedSpecs).every(key =>
              sku.specs[key] === this.selectedSpecs[key]
            )
          })
          this.selectedSku = sku || this.productInfo.skus[0] || { 
            id: 'default',
            price: this.productInfo.price, 
            stock: this.productInfo.stock 
          }
        } else {
          // 没有选择规格时，使用第一个SKU
          this.selectedSku = this.productInfo.skus[0] || { 
            id: 'default',
            price: this.productInfo.price, 
            stock: this.productInfo.stock 
          }
        }
      } else {
        // 没有SKU数据，使用商品基础信息
        this.selectedSku = { 
          id: 'default',
          price: this.productInfo.price, 
          stock: this.productInfo.stock 
        }
      }
    },
    async addToCart() {
      if (!this.canAddToCart) return

      // 检查登录状态
      if (!this.$store.getters.token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        this.addingToCart = true

        // 构建购物车数据，使用后端要求的参数格式
        const cartData = {
          productId: this.productInfo.id,
          productAttrUnique: this.selectedSku.id, // 这是关键参数
          cartNum: this.quantity
        }

        console.log('添加到购物车的数据:', cartData)

        await addCartItem(cartData)

        // 更新购物车数量
        await this.getCartCount()
        this.$message.success('已添加到购物车')

      } catch (error) {
        console.error('添加购物车失败:', error)
        if (error.code === 401) {
          this.$message.warning('登录已过期，请重新登录')
          this.$router.push('/login')
        } else {
          this.$message.error(error.message || '添加购物车失败')
        }
      } finally {
        this.addingToCart = false
      }
    },
    async buyNow() {
      // 检查规格选择
      if (!this.canBuyNow) {
        if (!this.hasRequiredSpecs) {
          this.$message.warning('请选择规格')
          return
        }
        if (this.selectedSku.stock <= 0) {
          this.$message.warning('商品库存不足')
          return
        }
        return
      }

      // 检查登录状态
      if (!this.$store.getters.token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        this.buyingNow = true

        // 构建购物车数据，使用后端要求的参数格式
        const cartData = {
          productId: this.productInfo.id,
          productAttrUnique: this.selectedSku.id || '', // SKU的唯一标识
          cartNum: this.quantity
        }

        console.log('立即购买的数据:', cartData)

        // 先添加到购物车
        await addCartItem(cartData)

        // 跳转到确认订单页面
        const queryParams = {
          type: 'buyNow',
          productId: this.productInfo.id,
          quantity: this.quantity,
          specs: JSON.stringify(this.selectedSpecs)
        }

        // 只有当selectedSku.id存在时才传递attrValueId
        if (this.selectedSku.id) {
          queryParams.attrValueId = this.selectedSku.id
        }

        console.log('跳转到订单确认页面，参数:', queryParams)

        this.$router.push({
          path: '/order/confirm',
          query: queryParams
        })

      } catch (error) {
        console.error('立即购买失败:', error)
        if (error.code === 401) {
          this.$message.warning('登录已过期，请重新登录')
          this.$router.push('/login')
        } else {
          this.$message.error(error.message || '立即购买失败')
        }
      } finally {
        this.buyingNow = false
      }
    },
    previewImage() {
      // 图片预览功能
      this.$alert(`<img src="${this.selectedImage}" style="max-width: 100%; max-height: 80vh;" />`, '图片预览', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        showClose: true
      })
    },
    previewReviewImage(image) {
      this.$alert(`<img src="${image}" style="max-width: 100%; max-height: 80vh;" />`, '评价图片', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        showClose: true
      })
    },
    goToProduct(productId) {
      this.$router.push(`/product/detail/${productId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.product-detail {
  background: #f5f5f5;
  min-height: calc(100vh - 160px);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  // 商品主体信息
  .product-main {
    background: white;
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 20px;

    .product-info-section {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;

      .product-gallery {
        flex: 0 0 400px;

        .main-image {
          position: relative;
          width: 400px;
          height: 400px;
          border: 1px solid #e6e6e6;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 15px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-actions {
            position: absolute;
            top: 10px;
            right: 10px;

            i {
              background: rgba(0, 0, 0, 0.5);
              color: white;
              padding: 8px;
              border-radius: 4px;
              cursor: pointer;

              &:hover {
                background: rgba(0, 0, 0, 0.7);
              }
            }
          }
        }

        .thumbnail-list {
          display: flex;
          gap: 10px;

          .thumbnail-item {
            width: 60px;
            height: 60px;
            border: 2px solid transparent;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;

            &.active {
              border-color: #409eff;
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .product-details {
        flex: 1;

        .product-header {
          margin-bottom: 20px;

          .product-title {
            font-size: 24px;
            color: #333;
            margin: 0 0 10px 0;
            line-height: 1.4;
          }

          .product-subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .product-labels {
            .product-label {
              display: inline-block;
              padding: 2px 6px;
              font-size: 12px;
              color: white;
              border-radius: 2px;
              margin-right: 8px;

              &.hot {
                background: #f56c6c;
              }

              &.new {
                background: #67c23a;
              }
            }
          }
        }

        .price-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;

          .price-group {
            margin-bottom: 10px;

            .current-price {
              color: #f56c6c;
              font-size: 28px;
              font-weight: bold;
            }

            .original-price {
              color: #999;
              text-decoration: line-through;
              font-size: 18px;
              margin-left: 10px;
            }
          }

          .price-info {
            display: flex;
            gap: 30px;
            font-size: 14px;

            .price-item {
              .label {
                color: #666;
              }

              .value {
                color: #333;
                font-weight: 500;
              }
            }
          }
        }

        .spec-section {
          margin-bottom: 25px;

          .spec-group {
            margin-bottom: 20px;

            .spec-title {
              font-size: 14px;
              color: #333;
              margin-bottom: 10px;
            }

            .spec-options {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;

              .spec-option {
                padding: 8px 16px;
                border: 1px solid #e6e6e6;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;

                &:hover:not(.disabled) {
                  border-color: #409eff;
                  color: #409eff;
                }

                &.active {
                  border-color: #409eff;
                  background: #409eff;
                  color: white;
                }

                &.disabled {
                  background: #f5f5f5;
                  color: #c0c4cc;
                  cursor: not-allowed;
                }
              }
            }
          }
        }

        .quantity-section {
          display: flex;
          align-items: center;
          margin-bottom: 30px;

          .quantity-title {
            font-size: 14px;
            color: #333;
            margin-right: 15px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;

          .el-button {
            flex: 1;
            height: 50px;
            font-size: 16px;
            border-radius: 25px;

            i {
              margin-right: 5px;
            }
          }
        }

        .service-guarantee {
          .service-title {
            font-size: 16px;
            color: #333;
            margin-bottom: 15px;
          }

          .service-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;

            .service-item {
              display: flex;
              align-items: center;
              font-size: 14px;
              color: #666;

              i {
                color: #67c23a;
                margin-right: 8px;
              }
            }
          }
        }
      }
    }

    // 商品详情内容
    .product-content-section {
      .product-tabs {
        ::v-deep .el-tabs__header {
          background: #f8f9fa;
          padding: 0 20px;
          margin: 0;
        }

        ::v-deep .el-tabs__content {
          padding: 30px 20px;
        }

        .detail-content {
          line-height: 1.6;

          img {
            max-width: 100%;
            height: auto;
          }
        }

        .params-table {
          width: 100%;
          border-collapse: collapse;

          tr {
            border-bottom: 1px solid #e6e6e6;

            td {
              padding: 12px 15px;

              &.param-name {
                background: #f8f9fa;
                font-weight: 500;
                width: 200px;
              }
            }
          }
        }

        .reviews-content {
          .review-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;

            .rating-overview {
              display: flex;
              align-items: center;
              gap: 15px;

              .rating-score {
                font-size: 36px;
                font-weight: bold;
                color: #f56c6c;
              }

              .rating-count {
                color: #666;
              }
            }
          }

          .review-list {
            .review-item {
              border-bottom: 1px solid #e6e6e6;
              padding: 20px 0;

              &:last-child {
                border-bottom: none;
              }

              .review-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;

                .user-info {
                  display: flex;
                  align-items: center;
                  gap: 10px;

                  .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                  }

                  .username {
                    font-weight: 500;
                  }
                }

                .review-meta {
                  display: flex;
                  align-items: center;
                  gap: 10px;

                  .review-date {
                    color: #999;
                    font-size: 12px;
                  }
                }
              }

              .review-content {
                margin-bottom: 10px;
                line-height: 1.6;
              }

              .review-images {
                display: flex;
                gap: 10px;

                .review-image {
                  width: 80px;
                  height: 80px;
                  object-fit: cover;
                  border-radius: 4px;
                  cursor: pointer;
                }
              }
            }
          }
        }
      }
    }
  }

  // 推荐商品
  .recommend-section {
    background: white;
    border-radius: 8px;
    padding: 30px;

    .section-title {
      font-size: 20px;
      color: #333;
      margin: 0 0 20px 0;
      text-align: center;
    }

    .recommend-products {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;

      .recommend-item {
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-4px);
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .product-info {
          .product-name {
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .product-price {
            color: #f56c6c;
            font-weight: bold;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .product-detail {
    .product-main {
      padding: 20px;

      .product-info-section {
        flex-direction: column;
        gap: 20px;

        .product-gallery {
          flex: none;
          align-self: center;

          .main-image {
            width: 300px;
            height: 300px;
          }
        }

        .service-guarantee {
          .service-list {
            grid-template-columns: 1fr;
          }
        }
      }

      .action-buttons {
        flex-direction: column;

        .el-button {
          flex: none;
        }
      }
    }

    .recommend-section {
      .recommend-products {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
      }
    }
  }
}
</style>
