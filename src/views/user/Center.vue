<template>
  <div class="user-center-page">
    <div class="container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-info">
          <div class="avatar">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.nickname" />
            <div v-else class="default-avatar">
              <i class="el-icon-user"></i>
            </div>
          </div>
          <div class="user-details">
            <h3>{{ userInfo.nickname || '未设置昵称' }}</h3>
            <p class="phone">{{ userInfo.phone }}</p>
            <div class="user-tags">
              <el-tag v-if="userInfo.isVip" type="warning" size="mini">VIP用户</el-tag>
              <el-tag v-if="userInfo.level" type="success" size="mini">等级{{ userInfo.level }}</el-tag>
            </div>
          </div>
        </div>
        <div class="user-actions">
          <el-button type="primary" @click="editProfile">编辑资料</el-button>
        </div>
      </div>

      <div class="center-content">
        <!-- 快捷功能 -->
        <div class="quick-actions">
          <div class="action-item" @click="$router.push('/user/coupon')">
            <div class="action-icon coupon-icon">
              <i class="el-icon-tickets"></i>
            </div>
            <div class="action-text">我的优惠券</div>
            <div class="action-count">{{ userStats.couponCount || 0 }}张</div>
          </div>

          <div class="action-item" @click="$router.push('/user/assets')">
            <div class="action-icon assets-icon">
              <i class="el-icon-wallet"></i>
            </div>
            <div class="action-text">我的资产</div>
            <div class="action-count">¥{{ userStats.balance || '0.00' }}</div>
          </div>

          <div class="action-item" @click="goToOrderList('-1')">
            <div class="action-icon order-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="action-text">我的订单</div>
            <div class="action-count">{{ userStats.orderCount || 0 }}个</div>
          </div>

          <div class="action-item" @click="$router.push('/user/address')">
            <div class="action-icon address-icon">
              <i class="el-icon-location"></i>
            </div>
            <div class="action-text">收货地址</div>
            <div class="action-count">{{ userStats.addressCount || 0 }}个</div>
          </div>
        </div>

        <!-- 订单统计 -->
        <div class="section order-stats">
          <div class="section-header">
            <h3>我的订单</h3>
            <el-button type="text" @click="goToOrderList('-1')">查看全部</el-button>
          </div>
          <div class="stats-grid">
            <div class="stat-item" @click="goToOrderList('-1')">
              <div class="stat-number">{{ orderStats.total || 0 }}</div>
              <div class="stat-label">全部</div>
            </div>
            <div class="stat-item" @click="goToOrderList('0')">
              <div class="stat-number">{{ orderStats.waitPay || 0 }}</div>
              <div class="stat-label">待支付</div>
            </div>
            <div class="stat-item" @click="goToOrderList('1')">
              <div class="stat-number">{{ orderStats.waitDeliver || 0 }}</div>
              <div class="stat-label">待发货</div>
            </div>
            <div class="stat-item" @click="goToOrderList('2')">
              <div class="stat-number">{{ orderStats.partDeliver || 0 }}</div>
              <div class="stat-label">部分发货</div>
            </div>
            <div class="stat-item" @click="goToOrderList('3')">
              <div class="stat-number">{{ orderStats.waitVerify || 0 }}</div>
              <div class="stat-label">待核销</div>
            </div>
            <div class="stat-item" @click="goToOrderList('4')">
              <div class="stat-number">{{ orderStats.waitReceive || 0 }}</div>
              <div class="stat-label">待收货</div>
            </div>
            <div class="stat-item" @click="goToOrderList('5')">
              <div class="stat-number">{{ orderStats.received || 0 }}</div>
              <div class="stat-label">已收货</div>
            </div>
            <div class="stat-item" @click="goToOrderList('6')">
              <div class="stat-number">{{ orderStats.completed || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item" @click="goToOrderList('9')">
              <div class="stat-number">{{ orderStats.cancelled || 0 }}</div>
              <div class="stat-label">已取消</div>
            </div>
          </div>
        </div>

        <!-- 资产信息 -->
        <div class="section asset-info">
          <div class="section-header">
            <h3>我的资产</h3>
          </div>
          <div class="asset-grid">
            <div class="asset-item">
              <div class="asset-icon">
                <i class="el-icon-wallet"></i>
              </div>
              <div class="asset-info">
                <div class="asset-value">¥{{ userAssets.balance || '0.00' }}</div>
                <div class="asset-label">账户余额</div>
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-icon">
                <i class="el-icon-present"></i>
              </div>
              <div class="asset-info">
                <div class="asset-value">{{ userAssets.coupons || 0 }}</div>
                <div class="asset-label">优惠券</div>
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-icon">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="asset-info">
                <div class="asset-value">{{ userAssets.points || 0 }}</div>
                <div class="asset-label">积分</div>
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-icon">
                <i class="el-icon-collection"></i>
              </div>
              <div class="asset-info">
                <div class="asset-value">{{ userAssets.collections || 0 }}</div>
                <div class="asset-label">收藏</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="section function-menu">
          <div class="section-header">
            <h3>功能菜单</h3>
          </div>
          <div class="menu-grid">
            <div class="menu-item" @click="$router.push('/user/address')">
              <div class="menu-icon">
                <i class="el-icon-location"></i>
              </div>
              <div class="menu-label">收货地址</div>
            </div>
            <div class="menu-item" @click="$router.push('/refund/list')">
              <div class="menu-icon">
                <i class="el-icon-s-order"></i>
              </div>
              <div class="menu-label">售后管理</div>
            </div>
            <div class="menu-item" @click="$router.push('/user/coupon')">
              <div class="menu-icon">
                <i class="el-icon-ticket"></i>
              </div>
              <div class="menu-label">我的优惠券</div>
            </div>
            <div class="menu-item" @click="$router.push('/coupon/center')">
              <div class="menu-icon">
                <i class="el-icon-present"></i>
              </div>
              <div class="menu-label">领券中心</div>
            </div>
            <div class="menu-item" @click="$router.push('/user/collections')">
              <div class="menu-icon">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="menu-label">我的收藏</div>
            </div>
            <div class="menu-item" @click="$router.push('/user/points')">
              <div class="menu-icon">
                <i class="el-icon-coin"></i>
              </div>
              <div class="menu-label">积分明细</div>
            </div>
            <div class="menu-item" @click="$router.push('/user/bills')">
              <div class="menu-icon">
                <i class="el-icon-document-copy"></i>
              </div>
              <div class="menu-label">账单明细</div>
            </div>
            <div class="menu-item" @click="handleLogout">
              <div class="menu-icon">
                <i class="el-icon-switch-button"></i>
              </div>
              <div class="menu-label">退出登录</div>
            </div>
          </div>
        </div>

        <!-- 最近订单 -->
        <div class="section recent-orders">
          <div class="section-header">
            <h3>最近订单</h3>
            <el-button type="text" @click="$router.push('/order/list')">查看更多</el-button>
          </div>
          <div v-if="recentOrders.length" class="order-list">
            <div v-for="order in recentOrders" :key="order.orderSn" class="order-item" @click="goToOrderDetail(order.orderSn)">
              <div class="order-info">
                <div class="order-header">
                  <span class="order-sn">{{ order.orderSn }}</span>
                  <el-tag :type="getStatusType(order.status)" size="mini">{{ getStatusText(order.status) }}</el-tag>
                </div>
                <div class="order-goods">
                  <img v-if="order.orderDetailList && order.orderDetailList[0]"
                       :src="order.orderDetailList[0].image"
                       :alt="order.orderDetailList[0].productName" />
                  <div class="goods-info">
                    <p v-if="order.orderDetailList && order.orderDetailList[0]">
                      {{ order.orderDetailList[0].productName }}
                      <span v-if="order.orderDetailList.length > 1">等{{ order.orderDetailList.length }}件商品</span>
                    </p>
                    <span class="order-price">¥{{ order.payPrice }}</span>
                  </div>
                </div>
              </div>
              <div class="order-actions">
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
          </div>
          <div v-else class="no-orders">
            <p>暂无订单</p>
            <el-button type="primary" @click="$router.push('/')">去购物</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <el-dialog title="编辑资料" :visible.sync="showEditDialog" width="500px">
      <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="头像">
          <div class="avatar-upload">
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar-preview" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <input type="file" @change="handleAvatarChange" accept="image/*" style="display: none" ref="avatarInput" />
            <el-button size="small" @click="$refs.avatarInput.click()">选择头像</el-button>
          </div>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="handleUpdateProfile">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserInfo, updateUserInfo } from '@/api/user'
import { getOrderList } from '@/api/order'

export default {
  name: 'UserCenter',
  data() {
    return {
      userInfo: {},
      orderStats: {},
      userAssets: {},
      userStats: {
        couponCount: 0,
        balance: '0.00',
        orderCount: 0,
        addressCount: 0
      },
      recentOrders: [],
      loading: false,
      showEditDialog: false,
      updating: false,
      editForm: {
        nickname: '',
        avatar: ''
      },
      editRules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchUserInfo()
    this.fetchRecentOrders()
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await getUserInfo()
        if (response.code === 200) {
          this.userInfo = response.data.userInfo || {}
          this.orderStats = response.data.orderStats || {}
          this.userAssets = response.data.userAssets || {}

          // 更新快捷功能统计数据
          this.userStats = {
            couponCount: response.data.userAssets?.coupons || 0,
            balance: response.data.userAssets?.balance || '0.00',
            orderCount: response.data.orderStats?.total || 0,
            addressCount: response.data.addressCount || 0
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 使用模拟数据
        this.userStats = {
          couponCount: 12,
          balance: '1280.50',
          orderCount: 28,
          addressCount: 3
        }
      }
    },

    async fetchRecentOrders() {
      try {
        const response = await getOrderList({
          page: 1,
          limit: 3,
          status: -1  // 添加必需的status参数，-1表示获取全部订单
        })
        if (response.code === 200) {
          // 处理不同的响应数据结构
          let orderData = response.data

          // 如果data是数组，直接使用
          if (Array.isArray(orderData)) {
            this.recentOrders = orderData
          }
          // 如果data是对象，尝试从list字段获取
          else if (orderData && orderData.list) {
            this.recentOrders = orderData.list || []
          }
          // 如果data是对象但没有list，尝试从其他可能的字段获取
          else if (orderData && orderData.records) {
            this.recentOrders = orderData.records || []
          }
          // 如果都没有，设置为空
          else {
            this.recentOrders = []
          }
        }
      } catch (error) {
        console.error('获取最近订单失败:', error)
        this.recentOrders = []
      }
    },

    editProfile() {
      this.editForm = {
        nickname: this.userInfo.nickname || '',
        avatar: this.userInfo.avatar || ''
      }
      this.showEditDialog = true
    },

    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 这里应该上传到服务器，暂时使用本地预览
        const reader = new FileReader()
        reader.onload = (e) => {
          this.editForm.avatar = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    async handleUpdateProfile() {
      try {
        await this.$refs.editForm.validate()
        this.updating = true

        const response = await updateUserInfo(this.editForm)
        if (response.code === 200) {
          this.$message.success('更新成功')
          this.showEditDialog = false
          this.fetchUserInfo()
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        this.$message.error('更新失败')
      } finally {
        this.updating = false
      }
    },

    goToOrderList(status) {
      this.$router.push({
        path: '/order/list',
        query: { status: status !== undefined ? status : '-1' }
      })
    },

    goToOrderDetail(orderSn) {
      this.$router.push(`/order/detail/${orderSn}`)
    },

    async handleLogout() {
      try {
        await this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 清除登录状态
        this.$store.dispatch('user/logout')
        this.$router.push('/login')
        this.$message.success('已退出登录')
      } catch (error) {
        // 用户取消
      }
    },

    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'primary',
        2: 'primary',
        3: 'primary',
        4: 'primary',
        5: 'success',
        6: 'success',
        9: 'info'
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        0: '待支付',
        1: '待发货',
        2: '部分发货',
        3: '待核销',
        4: '待收货',
        5: '已收货',
        6: '已完成',
        9: '已取消'
      }
      return textMap[status] || '未知状态'
    }
  }
}
</script>

<style lang="scss" scoped>
.user-center-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .user-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.3);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .default-avatar {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .user-details {
      h3 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: bold;
      }

      .phone {
        margin: 0 0 12px;
        opacity: 0.8;
        font-size: 14px;
      }

      .user-tags {
        display: flex;
        gap: 8px;
      }
    }
  }

  .user-actions {
    .el-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.center-content {
  display: grid;
  gap: 20px;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
  }
}

.order-stats {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;

    .stat-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
      }

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
        margin-bottom: 8px;
      }

      .stat-label {
        color: #666;
        font-size: 14px;
      }
    }
  }
}

.asset-info {
  .asset-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .asset-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;

      .asset-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #409eff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
      }

      .asset-info {
        .asset-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .asset-label {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
}

.function-menu {
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;

    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
      }

      .menu-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #67c23a;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        margin-bottom: 12px;
      }

      .menu-label {
        color: #333;
        font-size: 14px;
        text-align: center;
      }
    }
  }
}

.recent-orders {
  .order-list {
    display: grid;
    gap: 15px;

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }

      .order-info {
        flex: 1;

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .order-sn {
            font-size: 14px;
            color: #666;
          }
        }

        .order-goods {
          display: flex;
          gap: 15px;

          img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
          }

          .goods-info {
            flex: 1;

            p {
              margin: 0 0 8px;
              color: #333;
              font-size: 14px;
              line-height: 1.4;
            }

            .order-price {
              color: #ff4757;
              font-weight: bold;
            }
          }
        }
      }

      .order-actions {
        color: #999;
        font-size: 18px;
      }
    }
  }

  .no-orders {
    text-align: center;
    padding: 40px;
    color: #666;

    p {
      margin-bottom: 20px;
    }
  }
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 15px;

  .avatar-preview {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-uploader-icon {
    width: 60px;
    height: 60px;
    border: 2px dashed #d9d9d9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #ccc;
  }
}

// 快捷功能样式
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  .action-item {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin: 0 auto 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.coupon-icon {
        background: linear-gradient(135deg, #43e97b, #38f9d7);
      }

      &.assets-icon {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }

      &.order-icon {
        background: linear-gradient(135deg, #f093fb, #f5576c);
      }

      &.address-icon {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
      }
    }

    .action-text {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
    }

    .action-count {
      font-size: 14px;
      color: #666;
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;

    .user-info {
      flex-direction: column;
      text-align: center;
    }
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 10px;

    .stat-item {
      padding: 15px 8px;

      .stat-number {
        font-size: 20px;
      }

      .stat-label {
        font-size: 12px;
      }
    }
  }

  .asset-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .menu-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 15px;

    .order-actions {
      align-self: flex-end;
    }
  }
}
</style>
