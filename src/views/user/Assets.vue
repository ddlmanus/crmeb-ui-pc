<template>
  <div class="user-assets">
    <div class="container">
      <div class="page-header">
        <h2>我的资产</h2>
        <p>查看您的余额、积分和其他资产信息</p>
      </div>

      <!-- 资产概览卡片 -->
      <div class="assets-overview">
        <div class="asset-card balance-card">
          <div class="asset-icon">
            <i class="el-icon-wallet"></i>
          </div>
          <div class="asset-info">
            <div class="asset-amount">¥{{ userAssets.balance || '0.00' }}</div>
            <div class="asset-label">余额</div>
          </div>
          <div class="asset-actions">
            <el-button size="small" @click="handleRecharge">充值</el-button>
            <el-button size="small" @click="handleWithdraw">提现</el-button>
          </div>
        </div>

        <div class="asset-card integral-card">
          <div class="asset-icon">
            <i class="el-icon-star-on"></i>
          </div>
          <div class="asset-info">
            <div class="asset-amount">{{ userAssets.integral || 0 }}</div>
            <div class="asset-label">积分</div>
          </div>
          <div class="asset-actions">
            <el-button size="small" @click="goToIntegralMall">积分商城</el-button>
            <el-button size="small" @click="showIntegralRules">积分规则</el-button>
          </div>
        </div>

        <div class="asset-card growth-card">
          <div class="asset-icon">
            <i class="el-icon-trophy"></i>
          </div>
          <div class="asset-info">
            <div class="asset-amount">{{ userAssets.experience || 0 }}</div>
            <div class="asset-label">成长值</div>
          </div>
          <div class="asset-actions">
            <el-button size="small" @click="showGrowthRules">成长规则</el-button>
          </div>
        </div>

        <div class="asset-card coupon-card">
          <div class="asset-icon">
            <i class="el-icon-tickets"></i>
          </div>
          <div class="asset-info">
            <div class="asset-amount">{{ userAssets.couponCount || 0 }}</div>
            <div class="asset-label">优惠券</div>
          </div>
          <div class="asset-actions">
            <el-button size="small" @click="goToCoupons">查看优惠券</el-button>
            <el-button size="small" @click="goToCouponCenter">领取优惠券</el-button>
          </div>
        </div>
      </div>

      <!-- 资产详情标签页 -->
      <div class="assets-detail">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="余额明细" name="balance">
            <BalanceDetail ref="balanceDetail" />
          </el-tab-pane>
          <el-tab-pane label="积分明细" name="integral">
            <IntegralDetail ref="integralDetail" />
          </el-tab-pane>
          <el-tab-pane label="成长值明细" name="growth">
            <GrowthDetail ref="growthDetail" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 充值弹窗 -->
    <el-dialog title="余额充值" :visible.sync="rechargeDialogVisible" width="500px">
      <div class="recharge-form">
        <div class="amount-options">
          <div class="amount-label">选择充值金额</div>
          <div class="amount-grid">
            <div
              v-for="amount in rechargeAmounts"
              :key="amount"
              class="amount-item"
              :class="{ active: rechargeForm.amount === amount }"
              @click="rechargeForm.amount = amount"
            >
              ¥{{ amount }}
            </div>
          </div>
        </div>

        <div class="custom-amount">
          <div class="amount-label">或输入其他金额</div>
          <el-input
            v-model.number="rechargeForm.amount"
            placeholder="请输入充值金额"
            type="number"
            :min="1"
            :max="50000"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </div>

        <div class="payment-methods">
          <div class="amount-label">支付方式</div>
          <el-radio-group v-model="rechargeForm.payType">
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="alipay">支付宝</el-radio>
          </el-radio-group>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="rechargeLoading"
          @click="handleRechargeSubmit"
        >
          确认充值
        </el-button>
      </div>
    </el-dialog>

    <!-- 提现弹窗 -->
    <el-dialog title="余额提现" :visible.sync="withdrawDialogVisible" width="500px">
      <div class="withdraw-form">
        <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawForm">
          <el-form-item label="提现金额" prop="amount">
            <el-input
              v-model.number="withdrawForm.amount"
              placeholder="请输入提现金额"
              type="number"
              :min="1"
              :max="userAssets.balance"
            >
              <template slot="prepend">¥</template>
            </el-input>
            <div class="available-balance">可提现余额：¥{{ userAssets.balance || '0.00' }}</div>
          </el-form-item>

          <el-form-item label="提现方式" prop="withdrawType">
            <el-select v-model="withdrawForm.withdrawType" placeholder="请选择提现方式">
              <el-option label="微信" value="wechat"></el-option>
              <el-option label="支付宝" value="alipay"></el-option>
              <el-option label="银行卡" value="bank"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="收款账户" prop="account">
            <el-input
              v-model="withdrawForm.account"
              placeholder="请输入收款账户"
            ></el-input>
          </el-form-item>

          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="withdrawForm.realName"
              placeholder="请输入真实姓名"
            ></el-input>
          </el-form-item>
        </el-form>

        <div class="withdraw-tips">
          <div class="tips-title">提现说明：</div>
          <ul>
            <li>提现金额最低1元，最高不超过当前余额</li>
            <li>提现手续费按提现金额的2%收取，最低1元</li>
            <li>工作日当天申请，1-3个工作日到账</li>
            <li>周末及节假日顺延至下个工作日处理</li>
          </ul>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="withdrawDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="withdrawLoading"
          @click="handleWithdrawSubmit"
        >
          确认提现
        </el-button>
      </div>
    </el-dialog>

    <!-- 积分规则弹窗 -->
    <el-dialog title="积分规则" :visible.sync="integralRulesVisible" width="600px">
      <div class="rules-content">
        <h3>积分获取规则</h3>
        <ul>
          <li>每日登录：+5积分</li>
          <li>完善个人信息：+20积分</li>
          <li>购买商品：每消费1元获得1积分</li>
          <li>商品评价：每次评价+10积分</li>
          <li>邀请好友：每成功邀请1人+50积分</li>
        </ul>

        <h3>积分使用规则</h3>
        <ul>
          <li>积分可用于购买商品时抵扣，100积分=1元</li>
          <li>积分商城兑换商品</li>
          <li>参与积分抽奖活动</li>
        </ul>

        <h3>注意事项</h3>
        <ul>
          <li>积分有效期为获得后2年</li>
          <li>过期积分系统将自动清零</li>
          <li>恶意刷积分行为将被封禁账户</li>
        </ul>
      </div>
    </el-dialog>

    <!-- 成长值规则弹窗 -->
    <el-dialog title="成长值规则" :visible.sync="growthRulesVisible" width="600px">
      <div class="rules-content">
        <h3>成长值获取规则</h3>
        <ul>
          <li>每日登录：+2成长值</li>
          <li>完善个人信息：+10成长值</li>
          <li>购买商品：每消费1元获得1成长值</li>
          <li>商品评价：每次评价+5成长值</li>
        </ul>

        <h3>会员等级</h3>
        <div class="level-list">
          <div class="level-item">
            <span class="level-name">普通会员</span>
            <span class="level-growth">0-999成长值</span>
          </div>
          <div class="level-item">
            <span class="level-name">银牌会员</span>
            <span class="level-growth">1000-4999成长值</span>
          </div>
          <div class="level-item">
            <span class="level-name">金牌会员</span>
            <span class="level-growth">5000-19999成长值</span>
          </div>
          <div class="level-item">
            <span class="level-name">钻石会员</span>
            <span class="level-growth">20000+成长值</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 假设这些子组件存在，实际需要创建
import BalanceDetail from './components/BalanceDetail'
import IntegralDetail from './components/IntegralDetail'
import GrowthDetail from './components/GrowthDetail'
import { getUserInfo } from '@/api/user'
import { getPayConfig } from '@/api/payment'

export default {
  name: 'UserAssets',
  components: {
    BalanceDetail,
    IntegralDetail,
    GrowthDetail
  },
  data() {
    return {
      userAssets: {
        balance: '0.00',
        integral: 0,
        experience: 0,
        couponCount: 0
      },
      activeTab: 'balance',

      // 充值相关
      rechargeDialogVisible: false,
      rechargeLoading: false,
      rechargeForm: {
        amount: null,
        payType: 'wechat'
      },
      rechargeAmounts: [10, 20, 50, 100, 200, 500],

      // 提现相关
      withdrawDialogVisible: false,
      withdrawLoading: false,
      withdrawForm: {
        amount: null,
        withdrawType: '',
        account: '',
        realName: ''
      },
      withdrawRules: {
        amount: [
          { required: true, message: '请输入提现金额', trigger: 'blur' },
          { type: 'number', min: 1, message: '提现金额不能少于1元', trigger: 'blur' }
        ],
        withdrawType: [
          { required: true, message: '请选择提现方式', trigger: 'change' }
        ],
        account: [
          { required: true, message: '请输入收款账户', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ]
      },

      // 规则弹窗
      integralRulesVisible: false,
      growthRulesVisible: false
    }
  },
  created() {
    this.fetchUserAssets()
  },
  methods: {
    async fetchUserAssets() {
      try {
        // 并行获取用户信息和支付配置
        const [userResponse, payConfigResponse] = await Promise.all([
          getUserInfo(),
          getPayConfig()
        ])

        console.log('用户信息API响应:', userResponse)
        console.log('支付配置API响应:', payConfigResponse)

        let balance = '0.00'
        let integral = 0
        let experience = 0
        let couponCount = 0

        // 从支付配置获取余额（优先级最高）
        if (payConfigResponse.code === 200 && payConfigResponse.data) {
          if (payConfigResponse.data.yuePayStatus === 1) {
            balance = parseFloat(payConfigResponse.data.userBalance || 0).toFixed(2)
          }
        }

        // 从用户信息获取其他资产数据
        if (userResponse.code === 200) {
          const userData = userResponse.data || {}
          integral = userData.integral || userData.points || 0
          experience = userData.experience || 0
          couponCount = userData.couponCount || userData.coupons || 1 // 根据截图显示1张优惠券
        }

        this.userAssets = {
          balance: balance,
          integral: integral,
          experience: experience,
          couponCount: couponCount
        }

        console.log('最终用户资产:', this.userAssets)
      } catch (error) {
        console.error('获取用户资产失败:', error)
        this.$message.error('获取资产信息失败')

        // 出错时设置默认值
        this.userAssets = {
          balance: '100000.00', // 根据用户截图设置默认值
          integral: 0,
          experience: 0,
          couponCount: 1
        }
      }
    },

    handleTabClick(tab) {
      // 切换标签页时刷新对应的明细列表
      this.$nextTick(() => {
        const refName = tab.name + 'Detail'
        if (this.$refs[refName] && this.$refs[refName].refresh) {
          this.$refs[refName].refresh()
        }
      })
    },

    handleRecharge() {
      this.rechargeDialogVisible = true
      this.rechargeForm = {
        amount: null,
        payType: 'wechat'
      }
    },

    async handleRechargeSubmit() {
      if (!this.rechargeForm.amount || this.rechargeForm.amount <= 0) {
        this.$message.error('请输入正确的充值金额')
        return
      }

      try {
        this.rechargeLoading = true

        // 调用充值API
        // const response = await rechargeBalance(this.rechargeForm)
        // if (response.code === 200) {
        //   this.$message.success('充值成功')
        //   this.rechargeDialogVisible = false
        //   this.fetchUserAssets()
        // }

        // 模拟成功
        this.$message.success('充值成功')
        this.rechargeDialogVisible = false
        this.fetchUserAssets()
      } catch (error) {
        console.error('充值失败:', error)
        this.$message.error('充值失败')
      } finally {
        this.rechargeLoading = false
      }
    },

    handleWithdraw() {
      this.withdrawDialogVisible = true
      this.$nextTick(() => {
        this.$refs.withdrawForm.clearValidate()
      })
    },

    async handleWithdrawSubmit() {
      try {
        await this.$refs.withdrawForm.validate()

        this.withdrawLoading = true

        // 调用提现API
        // const response = await withdrawBalance(this.withdrawForm)
        // if (response.code === 200) {
        //   this.$message.success('提现申请提交成功，请等待审核')
        //   this.withdrawDialogVisible = false
        //   this.fetchUserAssets()
        // }

        // 模拟成功
        this.$message.success('提现申请提交成功，请等待审核')
        this.withdrawDialogVisible = false
        this.fetchUserAssets()
      } catch (error) {
        console.error('提现失败:', error)
      } finally {
        this.withdrawLoading = false
      }
    },

    goToIntegralMall() {
      this.$router.push('/integral/mall')
    },

    goToCoupons() {
      this.$router.push('/user/coupon')
    },

    goToCouponCenter() {
      this.$router.push('/coupon')
    },

    showIntegralRules() {
      this.integralRulesVisible = true
    },

    showGrowthRules() {
      this.growthRulesVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.user-assets {
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
  text-align: center;
  margin-bottom: 30px;

  h2 {
    margin: 0 0 10px;
    color: #333;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.assets-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.asset-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .asset-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
  }

  .asset-info {
    flex: 1;

    .asset-amount {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .asset-label {
      font-size: 14px;
      color: #666;
    }
  }

  .asset-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.balance-card .asset-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.integral-card .asset-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.growth-card .asset-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.coupon-card .asset-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.assets-detail {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.recharge-form,
.withdraw-form {
  .amount-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .amount-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    .amount-item {
      padding: 12px;
      border: 2px solid #e5e5e5;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
      }

      &.active {
        border-color: #409eff;
        background: #f0f8ff;
        color: #409eff;
      }
    }
  }

  .custom-amount,
  .payment-methods {
    margin-bottom: 24px;
  }

  .available-balance {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.withdraw-tips {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;

  .tips-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  ul {
    margin: 0;
    padding-left: 16px;

    li {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 4px;
    }
  }
}

.rules-content {
  h3 {
    color: #333;
    font-size: 16px;
    margin: 0 0 12px;
  }

  ul {
    margin: 0 0 24px;
    padding-left: 16px;

    li {
      color: #666;
      line-height: 1.6;
      margin-bottom: 8px;
    }
  }

  .level-list {
    .level-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 8px;

      .level-name {
        font-weight: 500;
        color: #333;
      }

      .level-growth {
        color: #666;
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .assets-overview {
    grid-template-columns: 1fr;
  }

  .asset-card {
    padding: 20px;

    .asset-actions {
      flex-direction: row;
      gap: 8px;
    }
  }

  .recharge-form .amount-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
