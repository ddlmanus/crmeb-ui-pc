<template>
  <div class="category-page">
    <div class="container">
      <!-- 分类导航区域 -->
      <div class="category-nav">
        <div class="nav-item" :class="{ active: !selectedCategory }" @click="selectCategory(null)">
          全部
        </div>
        <div
          v-for="category in categories"
          :key="category.id"
          class="nav-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="filter-bar">
        <div class="filter-left">
          <span class="filter-label">分类：</span>
          <div class="filter-tags">
            <el-button
              v-for="filter in filters"
              :key="filter.value"
              :type="selectedFilter === filter.value ? 'primary' : ''"
              size="small"
              @click="selectFilter(filter.value)"
            >
              {{ filter.label }}
            </el-button>
          </div>
        </div>
        <div class="filter-right">
          <span class="filter-label">排序：</span>
          <el-select v-model="sortBy" size="small" style="width: 120px" @change="onSortChange">
            <el-option label="默认" value="default" />
            <el-option label="价格 ↑" value="price_asc" />
            <el-option label="价格 ↓" value="price_desc" />
            <el-option label="上架时间" value="time" />
          </el-select>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="product-list" v-loading="loading">
        <div
          v-for="product in productList"
          :key="product.id"
          class="product-item"
          @click="goToProductDetail(product.id)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-labels" v-if="product.labels && product.labels.length">
              <span
                v-for="label in product.labels"
                :key="label.text"
                class="product-label"
                :class="label.type"
              >
                {{ label.text }}
              </span>
            </div>
            <div class="product-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="addToCart(product)"
                :loading="product.adding"
              >
                加入购物车
              </el-button>
            </div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="price-group">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="product-meta">
              <span class="sales">{{ product.sales }}人付款</span>
              <div class="rating" v-if="product.rating">
                <el-rate
                  v-model="product.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                  class="product-rating"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 40, 60, 80]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getCategoryList } from '@/api/home'
import { getProductList, getProductCategories, getProductsByCategoryId } from '@/api/product'
import { addCartItem } from '@/api/cart'
import { mapActions } from 'vuex'

export default {
  name: 'CategoryPage',
  data() {
    return {
      categories: [
        { id: 1, name: '生活家居' },
        { id: 2, name: '运动专区' },
        { id: 3, name: '电子产品' },
        { id: 4, name: '家用电器' },
        { id: 5, name: '家具软装' },
        { id: 6, name: '鞋靴个护' },
        { id: 7, name: '居家餐厨' },
        { id: 8, name: '电视影音' },
        { id: 9, name: '日用文创' },
        { id: 10, name: '棉品' }
      ],
      filters: [
        { label: '全部', value: 'all' },
        { label: '收纳', value: 'storage' },
        { label: '香薰', value: 'fragrance' }
      ],
      selectedCategory: null,
      selectedFilter: 'all',
      sortBy: 'default',
      loading: false,
      productList: [
        {
          id: 1,
          name: '阿迪达斯官网 adidas BBALL CAP COT 男女训练运动帽子',
          image: 'https://dummyimage.com/300x300/2196f3/ffffff&text=adidas帽子',
          price: 100.00,
          originalPrice: 200.00,
          sales: 233,
          rating: 5.0,
          labels: [],
          adding: false
        },
        {
          id: 2,
          name: '松典数码相机5K微单复古女学生入门级高清旅游专用vlog摄影照相机',
          image: 'https://dummyimage.com/300x300/ff9800/ffffff&text=相机',
          price: 959.00,
          originalPrice: 1000.00,
          sales: 39,
          rating: 4.0,
          labels: [],
          adding: false
        },
        {
          id: 3,
          name: 'HEFANG何方珠宝细钢链组织小方糖项链轻奢简约饰品生日礼物',
          image: 'https://dummyimage.com/300x300/4caf50/ffffff&text=项链',
          price: 990.00,
          originalPrice: 1200.00,
          sales: 21,
          rating: 5.0,
          labels: [],
          adding: false
        },
        {
          id: 4,
          name: '【Gucci七夕礼物】GUCCI古驰蜂色云雾眉眼膏光203 粽子',
          image: 'https://dummyimage.com/300x300/9c27b0/ffffff&text=Gucci',
          price: 395.00,
          originalPrice: 500.00,
          sales: 1033,
          rating: 5.0,
          labels: [{ text: '券', type: 'coupon' }],
          adding: false
        },
        {
          id: 5,
          name: '[LESHUCANGHUA] 创意画动漫人物月野兔SailorMoon',
          image: 'https://dummyimage.com/300x300/e91e63/ffffff&text=动漫画',
          price: 299.00,
          originalPrice: 354.00,
          sales: 210,
          rating: 3.5,
          labels: [],
          adding: false
        },
        {
          id: 6,
          name: 'CHICVEN「摩登工业」科技感反光渐变羽绒服立领面包服',
          image: 'https://dummyimage.com/300x300/607d8b/ffffff&text=羽绒服',
          price: 1000.00,
          originalPrice: 1200.00,
          sales: 8390216,
          rating: 7.4,
          labels: [{ text: '券', type: 'coupon' }],
          adding: false
        },
        {
          id: 7,
          name: '广儿不能穿的鞋子',
          image: 'https://dummyimage.com/300x300/795548/ffffff&text=鞋子',
          price: 0.00,
          originalPrice: 2899.00,
          sales: 593,
          rating: 4.3,
          labels: [],
          adding: false
        },
        {
          id: 8,
          name: '小米家保温杯茶水茶电热杯茶杯旅行便携式体水壶真空3',
          image: 'https://dummyimage.com/300x300/009688/ffffff&text=小米杯子',
          price: 100.00,
          originalPrice: 200.00,
          sales: 846,
          rating: 8.9,
          labels: [],
          adding: false
        },
        {
          id: 9,
          name: '丿忙熊猫狗双封闭收纳全棉时代',
          image: 'https://dummyimage.com/300x300/ff5722/ffffff&text=熊猫',
          price: 49.90,
          originalPrice: 89.00,
          sales: 0,
          rating: 0,
          labels: [{ text: '全棉时代双11专享价', type: 'sale' }],
          adding: false
        },
        {
          id: 10,
          name: 'bencross北欧简约化妆品收纳盒竹提分区储物盒防尘',
          image: 'https://dummyimage.com/300x300/3f51b5/ffffff&text=收纳盒',
          price: 69.00,
          originalPrice: 99.00,
          sales: 0,
          rating: 0,
          labels: [],
          adding: false
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 10
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    '$route.params.categoryId': {
      handler(newVal) {
        this.selectedCategory = newVal ? parseInt(newVal) : null
        this.loadData()
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['getCartCount']),
    async loadData() {
      try {
        this.loading = true

        // 根据路由参数设置当前分类
        const categoryId = this.$route.params.categoryId
        if (categoryId) {
          this.selectedCategory = parseInt(categoryId)
        }

        // 加载分类列表
        try {
          const categoryRes = await getCategoryList()
          if (categoryRes.code === 200 && categoryRes.data) {
            this.categories = categoryRes.data.map(category => ({
              id: category.id,
              name: category.name
            }))
          }
        } catch (error) {
          console.error('加载分类失败:', error)
        }

        // 加载商品数据
        try {
          let productRes
          if (this.selectedCategory) {
            // 根据分类ID获取商品
            productRes = await getProductsByCategoryId(this.selectedCategory, {
              page: this.currentPage,
              limit: this.pageSize
            })
          } else {
            // 获取全部商品
            productRes = await getProductList({
              page: this.currentPage,
              limit: this.pageSize
            })
          }

          if (productRes.code === 200 && productRes.data) {
            this.productList = productRes.data.list || productRes.data || []
            this.total = productRes.data.total || this.productList.length

            // 转换数据格式
            this.productList = this.productList.map(product => ({
              id: product.id,
              name: product.storeName || product.name,
              image: product.image,
              price: product.price,
              originalPrice: product.otPrice || product.originalPrice,
              sales: product.sales || 0,
              rating: Math.random() * 5, // 随机评分，实际应该从后端获取
              labels: [],
              adding: false
            }))
          }
        } catch (error) {
          console.error('加载商品数据失败:', error)
        }

      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      this.currentPage = 1

      if (categoryId) {
        this.$router.push(`/product/category/${categoryId}`)
      } else {
        this.$router.push('/product/category')
      }

      this.loadData()
    },
    selectFilter(filter) {
      this.selectedFilter = filter
      this.currentPage = 1
      this.loadData()
    },
    onSortChange() {
      this.currentPage = 1
      this.loadData()
    },
    goToProductDetail(productId) {
      this.$router.push(`/product/detail/${productId}`)
    },
    async addToCart(product) {
      try {
        product.adding = true

        // 调用添加购物车API
        await addCartItem({
          productId: product.id,
          quantity: 1,
          skuId: null
        })

        // 更新购物车数量
        await this.getCartCount()

        this.$message.success('添加购物车成功')
      } catch (error) {
        console.error('添加购物车失败:', error)
        this.$message.error('添加购物车失败')
      } finally {
        product.adding = false
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.category-page {
  background: #f5f5f5;
  min-height: calc(100vh - 160px);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  // 分类导航
  .category-nav {
    display: flex;
    background: white;
    border-radius: 4px;
    margin-bottom: 20px;
    padding: 0 20px;

    .nav-item {
      padding: 15px 20px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      color: #666;
      transition: all 0.3s;

      &:hover {
        color: #f56c6c;
      }

      &.active {
        color: #f56c6c;
        border-bottom-color: #f56c6c;
      }
    }
  }

  // 筛选条
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 15px 20px;
    border-radius: 4px;
    margin-bottom: 20px;

    .filter-left {
      display: flex;
      align-items: center;

      .filter-label {
        margin-right: 10px;
        color: #666;
      }

      .filter-tags {
        display: flex;
        gap: 10px;
      }
    }

    .filter-right {
      display: flex;
      align-items: center;

      .filter-label {
        margin-right: 10px;
        color: #666;
      }
    }
  }

  // 商品列表
  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .product-item {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);

        .product-actions {
          opacity: 1;
        }
      }

      .product-image {
        position: relative;
        height: 220px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-labels {
          position: absolute;
          top: 10px;
          left: 10px;

          .product-label {
            display: inline-block;
            padding: 2px 6px;
            font-size: 12px;
            color: white;
            border-radius: 2px;
            margin-right: 5px;

            &.hot {
              background: #f56c6c;
            }

            &.new {
              background: #67c23a;
            }

            &.sale {
              background: #e6a23c;
            }

            &.coupon {
              background: #409eff;
            }
          }
        }

        .product-actions {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: all 0.3s;
        }
      }

      .product-info {
        padding: 15px;

        .product-name {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
          margin: 0 0 10px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          height: 40px;
        }

        .price-group {
          margin-bottom: 8px;

          .current-price {
            color: #f56c6c;
            font-size: 18px;
            font-weight: bold;
          }

          .original-price {
            color: #999;
            text-decoration: line-through;
            margin-left: 8px;
            font-size: 14px;
          }
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #999;

          .product-rating {
            ::v-deep .el-rate {
              height: 14px;
              line-height: 14px;

              .el-rate__item {
                font-size: 12px;
              }

              .el-rate__text {
                font-size: 12px;
                margin-left: 4px;
              }
            }
          }
        }
      }
    }
  }

  // 分页
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    background: white;
    padding: 20px;
    border-radius: 4px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .category-page {
    .category-nav {
      overflow-x: auto;
      white-space: nowrap;

      .nav-item {
        flex-shrink: 0;
      }
    }

    .filter-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .product-list {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 15px;
    }
  }
}
</style>
