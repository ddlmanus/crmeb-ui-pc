<template>
  <div class="address-page">
    <div class="container">
      <div class="page-header">
        <h2>收货地址管理</h2>
        <el-button type="primary" @click="showAddDialog">
          <i class="el-icon-plus"></i>
          新增地址
        </el-button>
      </div>

      <div class="address-content">
        <div v-if="addressList.length" class="address-list">
          <div
            v-for="address in addressList"
            :key="address.id"
            class="address-item"
            :class="{ 'is-default': address.isDefault }"
          >
            <div class="address-info">
              <div class="user-info">
                <span class="name">{{ address.realName }}</span>
                <span class="phone">{{ address.phone }}</span>
                <el-tag v-if="address.isDefault" type="success" size="mini">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
              </div>
            </div>
            <div class="address-actions">
              <el-button type="text" @click="handleEdit(address)">编辑</el-button>
              <el-button
                v-if="!address.isDefault"
                type="text"
                @click="handleSetDefault(address.id)"
              >
                设为默认
              </el-button>
              <el-button
                type="text"
                class="delete-btn"
                @click="handleDelete(address.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-address">
          <div class="empty-icon">
            <i class="el-icon-location-outline"></i>
          </div>
          <div class="empty-text">暂无收货地址</div>
          <div class="empty-desc">添加收货地址，享受便捷购物体验</div>
          <el-button type="primary" @click="showAddDialog">添加地址</el-button>
        </div>
      </div>
    </div>

    <!-- 地址弹窗 -->
    <AddressSelector
      v-model="showAddressDialog"
      :address-data="currentAddress"
      @success="handleAddressSuccess"
    />
  </div>
</template>

<script>
import { getAddressList, deleteAddress, setDefaultAddress } from '@/api/address'
import AddressSelector from '@/components/AddressSelector'

export default {
  name: 'UserAddress',
  components: {
    AddressSelector
  },
  data() {
    return {
      addressList: [],
      loading: false,
      showAddressDialog: false,
      currentAddress: {}
    }
  },
  created() {
    this.fetchAddressList()
  },
  methods: {
    async fetchAddressList() {
      try {
        this.loading = true
        const response = await getAddressList()
        if (response.code === 200) {
          this.addressList = response.data || []
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
        this.$message.error('获取地址列表失败')
      } finally {
        this.loading = false
      }
    },

    showAddDialog() {
      this.currentAddress = {}
      this.showAddressDialog = true
    },

    handleEdit(address) {
      this.currentAddress = { ...address }
      this.showAddressDialog = true
    },

    async handleSetDefault(id) {
      try {
        await setDefaultAddress(id)
        this.$message.success('设置默认地址成功')
        this.fetchAddressList()
      } catch (error) {
        console.error('设置默认地址失败:', error)
        this.$message.error('设置默认地址失败')
      }
    },

    async handleDelete(id) {
      try {
        await this.$confirm('确定要删除这个地址吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteAddress(id)
        this.$message.success('删除地址成功')
        this.fetchAddressList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除地址失败:', error)
          this.$message.error('删除地址失败')
        }
      }
    },

    handleAddressSuccess() {
      this.fetchAddressList()
    }
  }
}
</script>

<style lang="scss" scoped>
.address-page {
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
  
  h2 {
    margin: 0;
    color: #333;
  }
}

.address-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}

.address-list {
  display: grid;
  gap: 20px;
}

.address-item {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  }
  
  &.is-default {
    border-color: #67c23a;
    background: #f0f9ff;
  }
  
  .address-info {
    flex: 1;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
      
      .name {
        font-weight: bold;
        color: #333;
        font-size: 16px;
      }
      
      .phone {
        color: #666;
        font-size: 14px;
      }
    }
    
    .address-detail {
      color: #666;
      line-height: 1.6;
      font-size: 14px;
    }
  }
  
  .address-actions {
    display: flex;
    gap: 15px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
    
    .delete-btn {
      color: #f56c6c;
      
      &:hover {
        color: #f56c6c;
      }
    }
  }
}

.empty-address {
  text-align: center;
  padding: 80px 20px;
  
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .address-item {
    padding: 15px;
    
    .address-actions {
      flex-direction: column;
      gap: 10px;
      
      .el-button {
        width: 100%;
        margin: 0;
      }
    }
  }
  
  .address-content {
    padding: 15px;
  }
}
</style> 