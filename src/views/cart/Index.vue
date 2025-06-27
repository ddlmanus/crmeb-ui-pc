<template>
  <div class="cart-page">
    <div class="container">
      <div class="cart-header">
        <h2>购物车</h2>
        <div class="cart-count">
          共 <span>{{ totalCartItems }}</span> 件商品
        </div>
      </div>

      <div v-if="cartMerchantList.length" class="cart-content">
        <!-- 购物车列表头部 -->
        <div class="cart-list-header">
          <div class="col-check">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          </div>
          <div class="col-product">商品信息</div>
          <div class="col-price">单价</div>
          <div class="col-quantity">数量</div>
          <div class="col-total">小计</div>
          <div class="col-action">操作</div>
        </div>

        <!-- 按商户分组的购物车商品列表 -->
        <div v-for="merchant in cartMerchantList" :key="merchant.merId" class="merchant-section">
          <!-- 商户头部 -->
          <div class="merchant-header">
            <div class="merchant-info">
              <el-checkbox 
                :value="isMerchantSelected(merchant)" 
                @change="handleMerchantSelectAll(merchant, $event)"
              ></el-checkbox>
              <i class="el-icon-shop"></i>
              <span class="merchant-name">{{ merchant.merName }}</span>
              <el-tag v-if="merchant.merIsSelf" type="success" size="mini">自营</el-tag>
            </div>
          </div>

          <!-- 商户商品列表 -->
          <div class="cart-list">
            <div v-for="item in merchant.cartInfoList" :key="item.id" class="cart-item">
              <div class="col-check">
                <el-checkbox v-model="item.checked" @change="handleItemCheck"></el-checkbox>
              </div>
              <div class="col-product">
                <div class="product-info">
                  <img :src="item.image" :alt="item.proName" />
                  <div class="product-details">
                    <h4>{{ item.proName }}</h4>
                    <div class="product-specs" v-if="item.sku">
                      {{ item.sku }}
                    </div>
                    <div class="product-status" v-if="!item.attrStatus">
                      <span class="status-invalid">商品失效</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-price">
                <span class="price">¥{{ item.price }}</span>
                <span v-if="item.isPaidMember && item.vipPrice > 0" class="vip-price">
                  会员价 ¥{{ item.vipPrice }}
                </span>
              </div>
              <div class="col-quantity">
                <div class="quantity-selector" :class="{ disabled: !item.attrStatus }">
                  <button @click="decreaseQuantity(item)" :disabled="item.cartNum <= 1 || !item.attrStatus">-</button>
                  <input 
                    v-model.number="item.cartNum" 
                    @change="updateQuantity(item)" 
                    type="number" 
                    min="1" 
                    :max="item.stock"
                    :disabled="!item.attrStatus"
                  />
                  <button @click="increaseQuantity(item)" :disabled="!item.attrStatus || item.cartNum >= item.stock">+</button>
                </div>
                <div v-if="item.stock <= 5 && item.attrStatus" class="stock-warning">
                  仅剩{{ item.stock }}件
                </div>
              </div>
              <div class="col-total">
                <span class="total-price">¥{{ getItemTotalPrice(item) }}</span>
              </div>
              <div class="col-action">
                <el-button type="text" @click="removeItem(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 购物车底部操作栏 -->
        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
            <el-button type="text" @click="clearSelected">删除选中商品</el-button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span class="selected-count">已选择 {{ selectedCount }} 件商品</span>
              <div class="total-amount">
                <span class="label">合计：</span>
                <span class="amount">¥{{ totalAmount }}</span>
              </div>
            </div>
            <el-button 
              type="primary" 
              size="large" 
              :disabled="selectedCount === 0"
              @click="goToCheckout"
            >
              去结算({{ selectedCount }})
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <div class="empty-icon">
          <i class="el-icon-shopping-cart-2"></i>
        </div>
        <div class="empty-text">购物车还是空的</div>
        <div class="empty-desc">快去挑选心爱的商品吧</div>
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getCartList, updateCartNum, deleteCart } from '@/api/cart'

export default {
  name: 'CartIndex',
  data() {
    return {
      cartMerchantList: [],
      loading: false
    }
  },
  computed: {
    // 获取所有购物车项的扁平列表
    allCartItems() {
      const items = []
      this.cartMerchantList.forEach(merchant => {
        merchant.cartInfoList.forEach(item => {
          items.push({
            ...item,
            merId: merchant.merId,
            merName: merchant.merName
          })
        })
      })
      return items
    },
    
    // 总商品数量
    totalCartItems() {
      return this.allCartItems.reduce((total, item) => total + item.cartNum, 0)
    },
    
    selectAll: {
      get() {
        const validItems = this.allCartItems.filter(item => item.attrStatus)
        return validItems.length > 0 && validItems.every(item => item.checked)
      },
      set(value) {
        this.cartMerchantList.forEach(merchant => {
          merchant.cartInfoList.forEach(item => {
            if (item.attrStatus) {
              item.checked = value
            }
          })
        })
      }
    },
    
    selectedItems() {
      return this.allCartItems.filter(item => item.checked && item.attrStatus)
    },
    
    selectedCount() {
      return this.selectedItems.reduce((total, item) => total + item.cartNum, 0)
    },
    
    totalAmount() {
      return this.selectedItems.reduce((total, item) => {
        const price = this.getEffectivePrice(item)
        return total + (price * item.cartNum)
      }, 0).toFixed(2)
    }
  },
  created() {
    this.fetchCartList()
  },
  methods: {
    async fetchCartList() {
      try {
        this.loading = true
        const response = await getCartList()
        console.log('购物车数据:', response)
        
        if (response.code === 200 && response.data) {
          this.cartMerchantList = response.data.map(merchant => ({
            ...merchant,
            cartInfoList: merchant.cartInfoList.map(item => ({
              ...item,
              checked: false
            }))
          }))
        } else {
          this.cartMerchantList = []
        }
      } catch (error) {
        console.error('获取购物车失败:', error)
        this.$message.error('获取购物车失败')
        this.cartMerchantList = []
      } finally {
        this.loading = false
      }
    },
    
    // 获取商品有效价格（会员价或普通价）
    getEffectivePrice(item) {
      if (item.isPaidMember && item.vipPrice > 0) {
        // 这里应该检查用户是否为付费会员，暂时用普通价格
        return parseFloat(item.price)
      }
      return parseFloat(item.price)
    },
    
    // 获取商品小计价格
    getItemTotalPrice(item) {
      const price = this.getEffectivePrice(item)
      return (price * item.cartNum).toFixed(2)
    },
    
    // 检查商户是否全选
    isMerchantSelected(merchant) {
      const validItems = merchant.cartInfoList.filter(item => item.attrStatus)
      return validItems.length > 0 && validItems.every(item => item.checked)
    },
    
    // 商户全选/取消全选
    handleMerchantSelectAll(merchant, checked) {
      merchant.cartInfoList.forEach(item => {
        if (item.attrStatus) {
          item.checked = checked
        }
      })
    },
    
    handleSelectAll(value) {
      this.cartMerchantList.forEach(merchant => {
        merchant.cartInfoList.forEach(item => {
          if (item.attrStatus) {
            item.checked = value
          }
        })
      })
    },
    
    handleItemCheck() {
      // 更新选中状态
    },
    
    async updateQuantity(item) {
      if (!item.attrStatus) return
      
      try {
        await updateCartNum(item.id, item.cartNum)
        this.$store.dispatch('cart/getCartCount')
      } catch (error) {
        console.error('更新数量失败:', error)
        this.$message.error('更新数量失败')
        this.fetchCartList() // 重新获取数据
      }
    },
    
    decreaseQuantity(item) {
      if (!item.attrStatus || item.cartNum <= 1) return
      item.cartNum--
      this.updateQuantity(item)
    },
    
    increaseQuantity(item) {
      if (!item.attrStatus || item.cartNum >= item.stock) return
      item.cartNum++
      this.updateQuantity(item)
    },
    
    async removeItem(item) {
      try {
        await this.$confirm('确定要删除这件商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteCart([item.id])
        this.fetchCartList() // 重新获取购物车数据
        this.$store.dispatch('cart/getCartCount')
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async clearSelected() {
      const selectedIds = this.selectedItems.map(item => item.id)
      if (selectedIds.length === 0) {
        this.$message.warning('请先选择要删除的商品')
        return
      }
      
      try {
        await this.$confirm(`确定要删除选中的 ${selectedIds.length} 件商品吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteCart(selectedIds)
        this.fetchCartList() // 重新获取购物车数据
        this.$store.dispatch('cart/getCartCount')
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    goToCheckout() {
      if (this.selectedCount === 0) {
        this.$message.warning('请先选择要结算的商品')
        return
      }
      
      // 跳转到订单确认页面
      const cartIds = this.selectedItems.map(item => item.id)
      this.$router.push({
        path: '/order/confirm',
        query: { cartIds: cartIds.join(',') }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #333;
  }
  
  .cart-count {
    color: #666;
    
    span {
      color: #ff4757;
      font-weight: bold;
    }
  }
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.cart-list-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 120px 80px;
  align-items: center;
  padding: 15px 20px;
  background: #fafafa;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.merchant-section {
  border-bottom: 10px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.merchant-header {
  padding: 15px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  
  .merchant-info {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .merchant-name {
      font-weight: bold;
      color: #333;
    }
  }
}

.cart-list {
  .cart-item {
    display: grid;
    grid-template-columns: 60px 1fr 120px 120px 120px 80px;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.col-check {
  text-align: center;
}

.col-product {
  .product-info {
    display: flex;
    align-items: center;
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
        line-height: 1.4;
        color: #333;
      }
      
      .product-specs {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }
      
      .product-status {
        .status-invalid {
          color: #ff4757;
          font-size: 12px;
        }
      }
    }
  }
}

.col-price {
  text-align: center;
  
  .price {
    color: #ff4757;
    font-weight: bold;
    display: block;
  }
  
  .vip-price {
    color: #f39c12;
    font-size: 12px;
    display: block;
    margin-top: 4px;
  }
}

.col-total {
  text-align: center;
  
  .total-price {
    color: #ff4757;
    font-weight: bold;
    font-size: 16px;
  }
}

.col-quantity {
  text-align: center;
  
  .quantity-selector {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    
    &.disabled {
      opacity: 0.5;
      
      button, input {
        cursor: not-allowed;
      }
    }
    
    button {
      width: 30px;
      height: 30px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 16px;
      
      &:hover:not(:disabled) {
        background: #e0e0e0;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    input {
      width: 50px;
      height: 30px;
      border: none;
      text-align: center;
      outline: none;
      
      &:disabled {
        background: #f5f5f5;
      }
    }
  }
  
  .stock-warning {
    font-size: 12px;
    color: #ff4757;
    margin-top: 4px;
  }
}

.col-action {
  text-align: center;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  
  .footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .footer-right {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .total-info {
      text-align: right;
      
      .selected-count {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .total-amount {
        .label {
          color: #333;
          font-size: 16px;
        }
        
        .amount {
          font-size: 24px;
          font-weight: bold;
          color: #ff4757;
          margin-left: 8px;
        }
      }
    }
  }
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
  
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

@media (max-width: 768px) {
  .cart-list-header,
  .cart-item {
    grid-template-columns: 40px 1fr 80px 100px 80px 60px;
    padding: 10px;
    font-size: 12px;
  }
  
  .col-product {
    .product-info {
      gap: 10px;
      
      img {
        width: 60px;
        height: 60px;
      }
      
      .product-details h4 {
        font-size: 13px;
      }
    }
  }
  
  .col-quantity {
    .quantity-selector {
      button {
        width: 25px;
        height: 25px;
        font-size: 14px;
      }
      
      input {
        width: 40px;
        height: 25px;
        font-size: 12px;
      }
    }
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 15px;
    
    .footer-left {
      order: 2;
    }
    
    .footer-right {
      order: 1;
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style> 