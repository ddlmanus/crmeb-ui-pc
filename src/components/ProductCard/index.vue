<template>
  <div class="product-card" @click="handleClick">
    <div class="product-image">
      <img v-lazy="product.image" :alt="product.storeName" />
      <div class="product-labels" v-if="hasLabels">
        <span class="label hot" v-if="product.isHot">热</span>
        <span class="label new" v-if="product.isNew">新</span>
        <span class="label benefit" v-if="product.isBenefit">惠</span>
        <span class="label best" v-if="product.isBest">精</span>
      </div>
      <div class="product-actions">
        <el-button
          class="action-btn"
          icon="el-icon-view"
          size="mini"
          circle
          @click.stop="handlePreview"
        ></el-button>
        <el-button
          class="action-btn"
          :icon="isCollected ? 'el-icon-star-on' : 'el-icon-star-off'"
          :class="{ 'is-collected': isCollected }"
          size="mini"
          circle
          @click.stop="handleCollect"
        ></el-button>
        <el-button
          class="action-btn"
          icon="el-icon-shopping-cart-2"
          size="mini"
          circle
          @click.stop="handleAddCart"
        ></el-button>
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-title" :title="product.storeName">
        {{ product.storeName }}
      </h3>
      
      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
        <span class="original-price" v-if="product.otPrice && product.otPrice > product.price">
          ¥{{ product.otPrice }}
        </span>
      </div>
      
      <div class="product-meta">
        <div class="sales-info">
          <span class="sales">已售{{ product.sales || 0 }}件</span>
          <div class="rating" v-if="product.rating">
            <el-rate
              v-model="product.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
              :max="5"
              size="mini"
            ></el-rate>
          </div>
        </div>
        
        <div class="product-tags" v-if="product.tags && product.tags.length">
          <el-tag
            v-for="tag in product.tags.slice(0, 2)"
            :key="tag"
            size="mini"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isCollected: false
    }
  },
  computed: {
    hasLabels() {
      return this.product.isHot || this.product.isNew || this.product.isBenefit || this.product.isBest
    }
  },
  mounted() {
    this.checkCollected()
  },
  methods: {
    handleClick() {
      this.$emit('click', this.product)
    },
    handlePreview() {
      this.$emit('preview', this.product)
    },
    async handleCollect() {
      try {
        if (this.isCollected) {
          await this.$api.removeCollect(this.product.id)
          this.$message.success('取消收藏成功')
          this.isCollected = false
        } else {
          await this.$api.addCollect(this.product.id)
          this.$message.success('收藏成功')
          this.isCollected = true
        }
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    async handleAddCart() {
      try {
        // 如果商品有多规格，跳转到详情页选择规格
        if (this.product.specType === 1) {
          this.$router.push(`/product/detail/${this.product.id}`)
          return
        }
        
        // 单规格直接加入购物车
        await this.$store.dispatch('cart/addToCart', {
          productId: this.product.id,
          cartNum: 1,
          uniqueId: this.product.unique || ''
        })
        this.$message.success('加入购物车成功')
      } catch (error) {
        this.$message.error('加入购物车失败')
      }
    },
    async checkCollected() {
      try {
        // 检查是否已收藏
        // const response = await this.$api.checkCollected(this.product.id)
        // this.isCollected = response.data
      } catch (error) {
        // 忽略错误
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    
    .product-actions {
      opacity: 1;
      visibility: visible;
    }
  }
}

.product-image {
  position: relative;
  height: 240px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
}

.product-labels {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  
  .label {
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    font-size: 12px;
    border-radius: 2px;
    margin-right: 4px;
    
    &.hot {
      background-color: #ff4757;
    }
    
    &.new {
      background-color: #5dade2;
    }
    
    &.benefit {
      background-color: #26de81;
    }
    
    &.best {
      background-color: #ffa502;
    }
  }
}

.product-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 3;
  
  .action-btn {
    margin: 0 5px;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    
    &:hover {
      background-color: #409eff;
      color: #fff;
    }
    
    &.is-collected {
      color: #ff9900;
    }
  }
}

.product-info {
  padding: 15px;
}

.product-title {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px 0;
  height: 40px;
  line-height: 20px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
  
  &:hover {
    color: #409eff;
  }
}

.product-price {
  margin-bottom: 10px;
  
  .current-price {
    color: #ff4757;
    font-size: 18px;
    font-weight: bold;
  }
  
  .original-price {
    color: #999;
    font-size: 14px;
    text-decoration: line-through;
    margin-left: 8px;
  }
}

.product-meta {
  .sales-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .sales {
      color: #666;
      font-size: 12px;
    }
    
    .rating {
      ::v-deep .el-rate {
        height: auto;
        
        .el-rate__text {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
  
  .product-tags {
    .el-tag {
      margin-right: 5px;
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .product-image {
    height: 180px;
  }
  
  .product-actions {
    opacity: 1;
    visibility: visible;
    top: 10px;
    right: 10px;
    left: auto;
    transform: none;
    
    .action-btn {
      display: block;
      margin: 5px 0;
    }
  }
  
  .product-title {
    font-size: 13px;
    height: 36px;
  }
  
  .product-price .current-price {
    font-size: 16px;
  }
}
</style> 