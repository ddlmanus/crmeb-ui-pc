<template>
  <div class="refund-list-container">
    <div class="page-header">
      <h2>售后管理</h2>
      <div class="header-actions">
        <button @click="refreshList" class="refresh-btn">刷新</button>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >
        全部
        <span class="count" v-if="statusCounts.all">({{ statusCounts.all }})</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'pending' }"
        @click="switchTab('pending')"
      >
        待审核
        <span class="count" v-if="statusCounts.pending">({{ statusCounts.pending }})</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'approved' }"
        @click="switchTab('approved')"
      >
        已同意
        <span class="count" v-if="statusCounts.approved">({{ statusCounts.approved }})</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'rejected' }"
        @click="switchTab('rejected')"
      >
        已拒绝
        <span class="count" v-if="statusCounts.rejected">({{ statusCounts.rejected }})</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'completed' }"
        @click="switchTab('completed')"
      >
        已完成
        <span class="count" v-if="statusCounts.completed">({{ statusCounts.completed }})</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input">
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索订单号或商品名称"
          @keyup.enter="handleSearch"
        >
        <button @click="handleSearch" class="search-btn">搜索</button>
      </div>
      <div class="search-filters">
        <select v-model="searchParams.type">
          <option value="">全部类型</option>
          <option value="1">仅退款</option>
          <option value="2">退货退款</option>
        </select>
        <input
          type="date"
          v-model="searchParams.startDate"
          placeholder="开始日期"
        >
        <input
          type="date"
          v-model="searchParams.endDate"
          placeholder="结束日期"
        >
      </div>
    </div>

    <!-- 退款列表 -->
    <div class="refund-list">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="refundList.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无售后申请</div>
        <div class="empty-desc">您还没有任何售后申请记录</div>
      </div>

      <div v-else class="refund-items">
        <div class="refund-item" v-for="refund in refundList" :key="refund.id">
          <div class="refund-header">
            <div class="refund-info">
              <span class="refund-no">售后单号：{{ refund.refundOrderSn }}</span>
              <span class="refund-time">申请时间：{{ refund.createTime }}</span>
            </div>
            <div class="refund-status">
              <span class="status-tag" :class="getStatusClass(refund.status)">
                {{ getStatusText(refund.status) }}
              </span>
            </div>
          </div>

          <div class="refund-content">
            <div class="order-info">
              <span class="order-label">订单编号：</span>
              <span class="order-no">{{ refund.orderSn }}</span>
            </div>

            <div class="goods-info">
              <div class="goods-item" v-for="item in refund.cartInfo" :key="item.id">
                <img :src="item.productInfo.image" :alt="item.productInfo.storeName" class="goods-image">
                <div class="goods-detail">
                  <div class="goods-name">{{ item.productInfo.storeName }}</div>
                  <div class="goods-attr" v-if="item.productInfo.attrInfo">
                    {{ item.productInfo.attrInfo.sku }}
                  </div>
                  <div class="goods-price">
                    <span class="price">¥{{ item.productInfo.price }}</span>
                    <span class="quantity">×{{ item.cartNum }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="refund-details">
              <div class="detail-item">
                <span class="label">退款类型：</span>
                <span class="value">{{ refund.type === 1 ? '仅退款' : '退货退款' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">退款金额：</span>
                <span class="value amount">¥{{ refund.refundPrice }}</span>
              </div>
              <div class="detail-item" v-if="refund.explain">
                <span class="label">问题描述：</span>
                <span class="value">{{ refund.explain }}</span>
              </div>
              <div class="detail-item" v-if="refund.reason">
                <span class="label">退款原因：</span>
                <span class="value">{{ refund.reason }}</span>
              </div>
            </div>

            <!-- 管理员回复 -->
            <div class="admin-reply" v-if="refund.adminReply">
              <div class="reply-title">客服回复：</div>
              <div class="reply-content">{{ refund.adminReply }}</div>
              <div class="reply-time">{{ refund.replyTime }}</div>
            </div>
          </div>

          <div class="refund-actions">
            <button
              @click="viewDetail(refund)"
              class="btn-detail"
            >
              查看详情
            </button>

            <button
              v-if="refund.status === 0"
              @click="cancelRefund(refund.id)"
              class="btn-cancel"
            >
              取消申请
            </button>

            <button
              v-if="refund.status === 1 && refund.type === 2"
              @click="fillLogistics(refund)"
              class="btn-logistics"
            >
              填写快递
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="pagination.total > pagination.pageSize">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="page-btn"
        >
          上一页
        </button>

        <div class="page-numbers">
          <span
            v-for="page in pageNumbers"
            :key="page"
            class="page-number"
            :class="{ active: page === pagination.page }"
            @click="changePage(page)"
          >
            {{ page }}
          </span>
        </div>

        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 物流信息弹窗 -->
    <div class="logistics-modal" v-if="showLogisticsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>填写退货物流信息</h3>
          <button @click="closeLogisticsModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label>快递公司：</label>
            <select v-model="logisticsForm.company">
              <option value="">请选择快递公司</option>
              <option value="顺丰速运">顺丰速运</option>
              <option value="中通快递">中通快递</option>
              <option value="圆通速递">圆通速递</option>
              <option value="申通快递">申通快递</option>
              <option value="韵达速递">韵达速递</option>
              <option value="百世快递">百世快递</option>
              <option value="德邦快递">德邦快递</option>
            </select>
          </div>
          <div class="form-item">
            <label>快递单号：</label>
            <input
              type="text"
              v-model="logisticsForm.trackingNumber"
              placeholder="请输入快递单号"
            >
          </div>
          <div class="form-item">
            <label>备注：</label>
            <textarea
              v-model="logisticsForm.remark"
              placeholder="请输入备注信息（选填）"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeLogisticsModal" class="btn-cancel">取消</button>
          <button @click="submitLogistics" class="btn-submit" :disabled="!canSubmitLogistics">
            提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRefundList, cancelRefund, submitReturnLogistics } from '@/api/refund'

export default {
  name: 'RefundList',
  data() {
    return {
      activeTab: 'all',
      searchKeyword: '',
      searchParams: {
        type: '',
        startDate: '',
        endDate: ''
      },
      refundList: [],
      loading: false,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      statusCounts: {},
      showLogisticsModal: false,
      currentRefund: null,
      logisticsForm: {
        company: '',
        trackingNumber: '',
        remark: ''
      }
    }
  },
  computed: {
    pageNumbers() {
      const total = Math.ceil(this.pagination.total / this.pagination.pageSize)
      const current = this.pagination.page
      const numbers = []

      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)

      for (let i = start; i <= end; i++) {
        numbers.push(i)
      }

      return numbers
    },
    canSubmitLogistics() {
      return this.logisticsForm.company && this.logisticsForm.trackingNumber
    }
  },
  async mounted() {
    await this.loadRefundList()
    await this.loadStatusCounts()
  },
  methods: {
    async loadRefundList() {
      this.loading = true

      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          status: this.getStatusValue(this.activeTab),
          keyword: this.searchKeyword,
          ...this.searchParams
        }

        const response = await getRefundList(params)
        this.refundList = response.data.list
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error('获取售后列表失败')
        console.error('Load refund list error:', error)
      } finally {
        this.loading = false
      }
    },

    async loadStatusCounts() {
      try {
        // 这里应该有一个专门获取各状态数量的接口
        // 暂时模拟数据
        this.statusCounts = {
          all: 25,
          pending: 5,
          approved: 8,
          rejected: 3,
          completed: 9
        }
      } catch (error) {
        console.error('Load status counts error:', error)
      }
    },

    getStatusValue(tab) {
      const statusMap = {
        all: '',
        pending: 0,
        approved: 1,
        rejected: 2,
        completed: 3
      }
      return statusMap[tab]
    },

    getStatusClass(status) {
      const classMap = {
        0: 'pending',
        1: 'approved',
        2: 'rejected',
        3: 'completed'
      }
      return classMap[status] || 'pending'
    },

    getStatusText(status) {
      const textMap = {
        0: '待审核',
        1: '已同意',
        2: '已拒绝',
        3: '已完成'
      }
      return textMap[status] || '未知状态'
    },

    switchTab(tab) {
      this.activeTab = tab
      this.pagination.page = 1
      this.loadRefundList()
    },

    handleSearch() {
      this.pagination.page = 1
      this.loadRefundList()
    },

    changePage(page) {
      if (page >= 1 && page <= Math.ceil(this.pagination.total / this.pagination.pageSize)) {
        this.pagination.page = page
        this.loadRefundList()
      }
    },

    refreshList() {
      this.pagination.page = 1
      this.loadRefundList()
      this.loadStatusCounts()
    },

    viewDetail(refund) {
      this.$router.push(`/refund/detail/${refund.id}`)
    },

    async cancelRefund(refundId) {
      const confirmed = await this.$confirm('确定要取消这个售后申请吗？', '确认取消', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => false)

      if (!confirmed) return

      try {
        await cancelRefund(refundId)
        this.$message.success('取消成功')
        this.loadRefundList()
        this.loadStatusCounts()
      } catch (error) {
        this.$message.error(error.message || '取消失败')
        console.error('Cancel refund error:', error)
      }
    },

    fillLogistics(refund) {
      this.currentRefund = refund
      this.logisticsForm = {
        company: '',
        trackingNumber: '',
        remark: ''
      }
      this.showLogisticsModal = true
    },

    closeLogisticsModal() {
      this.showLogisticsModal = false
      this.currentRefund = null
    },

    async submitLogistics() {
      if (!this.canSubmitLogistics) {
        this.$message.warning('请填写完整的物流信息')
        return
      }

      try {
        await submitReturnLogistics({
          refundId: this.currentRefund.id,
          ...this.logisticsForm
        })

        this.$message.success('物流信息提交成功')
        this.closeLogisticsModal()
        this.loadRefundList()
      } catch (error) {
        this.$message.error(error.message || '提交失败')
        console.error('Submit logistics error:', error)
      }
    }
  }
}
</script>

<style scoped>
.refund-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.refresh-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.refresh-btn:hover {
  background: #3a8ee6;
}

.filter-tabs {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.tab-item {
  flex: 1;
  padding: 15px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-right: 1px solid #f0f0f0;
  position: relative;
}

.tab-item:last-child {
  border-right: none;
}

.tab-item:hover {
  background: #f8f9fa;
}

.tab-item.active {
  background: #409eff;
  color: white;
}

.count {
  margin-left: 5px;
  font-size: 12px;
  opacity: 0.8;
}

.search-bar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.search-btn:hover {
  background: #3a8ee6;
}

.search-filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.search-filters select,
.search-filters input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.refund-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 18px;
  margin-bottom: 10px;
  color: #666;
}

.empty-desc {
  font-size: 14px;
}

.refund-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px;
}

.refund-item:last-child {
  border-bottom: none;
}

.refund-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.refund-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.refund-no {
  font-weight: 600;
  color: #333;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-tag.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-tag.approved {
  background: #f6ffed;
  color: #52c41a;
}

.status-tag.rejected {
  background: #fff2f0;
  color: #ff4d4f;
}

.status-tag.completed {
  background: #f0f7ff;
  color: #1890ff;
}

.refund-content {
  margin-bottom: 15px;
}

.order-info {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.order-label {
  color: #666;
}

.order-no {
  font-weight: 600;
  color: #333;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.goods-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 15px;
}

.goods-detail {
  flex: 1;
}

.goods-name {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.goods-attr {
  color: #666;
  margin-bottom: 5px;
  font-size: 12px;
}

.goods-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goods-price .price {
  color: #e74c3c;
  font-weight: bold;
}

.goods-price .quantity {
  color: #666;
}

.refund-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.detail-item {
  font-size: 14px;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  color: #333;
}

.detail-item .amount {
  color: #e74c3c;
  font-weight: bold;
}

.admin-reply {
  margin-top: 15px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.reply-title {
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.reply-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.refund-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.refund-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-detail {
  background: #f5f5f5;
  color: #666;
}

.btn-detail:hover {
  background: #e9e9e9;
}

.btn-cancel {
  background: #ff4d4f;
  color: white;
}

.btn-cancel:hover {
  background: #ff7875;
}

.btn-logistics {
  background: #52c41a;
  color: white;
}

.btn-logistics:hover {
  background: #73d13d;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  gap: 10px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #409eff;
  color: #409eff;
}

.page-number.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 物流弹窗样式 */
.logistics-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  padding: 0 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-footer .btn-cancel,
.modal-footer .btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.modal-footer .btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-footer .btn-cancel:hover {
  background: #e9e9e9;
}

.modal-footer .btn-submit {
  background: #409eff;
  color: white;
}

.modal-footer .btn-submit:hover:not(:disabled) {
  background: #3a8ee6;
}

.modal-footer .btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .refund-list-container {
    padding: 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .search-filters {
    flex-direction: column;
  }

  .refund-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .refund-info {
    flex-direction: column;
    gap: 5px;
  }

  .goods-item {
    flex-direction: column;
    text-align: center;
  }

  .goods-image {
    margin: 0 0 10px 0;
  }

  .refund-details {
    grid-template-columns: 1fr;
  }

  .refund-actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 15px;
  }

  .page-numbers {
    order: -1;
  }
}
</style>
</code_block_to_apply_changes_from>
