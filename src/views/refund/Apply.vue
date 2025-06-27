<template>
  <div class="refund-apply-container">
    <div class="refund-header">
      <h2>申请售后</h2>
      <div class="refund-steps">
        <div class="step current">
          <span class="step-number">1</span>
          <span class="step-text">申请售后</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <span class="step-number">2</span>
          <span class="step-text">等待审核</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <span class="step-number">3</span>
          <span class="step-text">处理完成</span>
        </div>
      </div>
    </div>

    <div class="refund-content">
      <!-- 订单信息 -->
      <div class="order-info">
        <h3>订单信息</h3>
        <div class="order-detail">
          <div class="order-header">
            <span class="order-no">订单编号：{{ orderInfo.orderSn }}</span>
            <span class="order-time">下单时间：{{ orderInfo.createTime }}</span>
          </div>

          <div class="goods-list">
            <div class="goods-item" v-for="item in orderInfo.cartInfo" :key="item.id">
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
              <div class="item-actions">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="item.id"
                    v-model="selectedItems"
                    @change="updateRefundAmount"
                  >
                  <span>申请退款</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 售后类型 -->
      <div class="refund-type">
        <h3>售后类型</h3>
        <div class="type-options">
          <label class="radio-option" :class="{ active: refundForm.type === 1 }">
            <input type="radio" :value="1" v-model="refundForm.type">
            <div class="option-content">
              <div class="option-title">仅退款</div>
              <div class="option-desc">未收到货，或商品有问题不用退货只退款</div>
            </div>
          </label>

          <label class="radio-option" :class="{ active: refundForm.type === 2 }">
            <input type="radio" :value="2" v-model="refundForm.type">
            <div class="option-content">
              <div class="option-title">退货退款</div>
              <div class="option-desc">已收到货，需要退还商品并退款</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 退款原因 -->
      <div class="refund-reason">
        <h3>退款原因</h3>
        <div class="reason-list">
          <label
            class="reason-item"
            v-for="reason in refundReasons"
            :key="reason.id"
            :class="{ active: refundForm.reasonId === reason.id }"
          >
            <input type="radio" :value="reason.id" v-model="refundForm.reasonId">
            <span>{{ reason.reason }}</span>
          </label>
        </div>
      </div>

      <!-- 退款金额 -->
      <div class="refund-amount">
        <h3>退款金额</h3>
        <div class="amount-info">
          <div class="amount-item">
            <span class="label">订单总金额：</span>
            <span class="value">¥{{ orderInfo.payPrice }}</span>
          </div>
          <div class="amount-item">
            <span class="label">可退金额：</span>
            <span class="value refund-value">¥{{ calculatedRefundAmount }}</span>
          </div>
          <div class="amount-input">
            <label>申请退款金额：</label>
            <input
              type="number"
              v-model="refundForm.refundPrice"
              :max="calculatedRefundAmount"
              step="0.01"
              placeholder="请输入退款金额"
            >
            <span class="currency">元</span>
          </div>
        </div>
      </div>

      <!-- 问题描述 -->
      <div class="refund-description">
        <h3>问题描述</h3>
        <textarea
          v-model="refundForm.explain"
          placeholder="请详细描述问题，有助于客服快速处理（选填）"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ refundForm.explain.length }}/500</div>
      </div>

      <!-- 上传凭证 -->
      <div class="refund-images">
        <h3>上传凭证（最多9张）</h3>
        <div class="image-upload">
          <div class="image-list">
            <div class="image-item" v-for="(image, index) in refundForm.images" :key="index">
              <img :src="image" alt="凭证图片">
              <div class="image-remove" @click="removeImage(index)">×</div>
            </div>
            <div class="upload-btn" @click="selectImage" v-if="refundForm.images.length < 9">
              <div class="upload-icon">+</div>
              <div class="upload-text">上传图片</div>
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleImageUpload"
            accept="image/*"
            multiple
            style="display: none"
          >
          <div class="upload-tips">
            <p>• 支持jpg、png格式，单张图片不超过5MB</p>
            <p>• 建议上传商品问题照片，有助于快速处理</p>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <div class="submit-info">
          <p class="info-text">提交后请等待客服审核，我们会在24小时内处理您的申请</p>
        </div>
        <div class="submit-actions">
          <button @click="goBack" class="btn-cancel">返回</button>
          <button
            @click="submitRefund"
            class="btn-submit"
            :disabled="!canSubmit || loading"
          >
            {{ loading ? '提交中...' : '提交申请' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderInfo } from '@/api/order'
import { getRefundReasons, applyRefund } from '@/api/refund'

export default {
  name: 'RefundApply',
  data() {
    return {
      orderInfo: {},
      refundReasons: [],
      selectedItems: [],
      loading: false,
      refundForm: {
        type: 1, // 1:仅退款, 2:退货退款
        reasonId: '',
        refundPrice: 0,
        explain: '',
        images: []
      }
    }
  },
  computed: {
    calculatedRefundAmount() {
      if (this.selectedItems.length === 0) return 0

      let amount = 0
      this.orderInfo.cartInfo?.forEach(item => {
        if (this.selectedItems.includes(item.id)) {
          amount += parseFloat(item.productInfo.price) * item.cartNum
        }
      })
      return amount.toFixed(2)
    },
    canSubmit() {
      return this.selectedItems.length > 0 &&
             this.refundForm.reasonId &&
             this.refundForm.refundPrice > 0 &&
             this.refundForm.refundPrice <= this.calculatedRefundAmount
    }
  },
  async mounted() {
    await this.loadOrderInfo()
    await this.loadRefundReasons()
  },
  methods: {
    async loadOrderInfo() {
      try {
        const orderId = this.$route.params.orderId
        const response = await getOrderInfo(orderId)
        this.orderInfo = response.data
      } catch (error) {
        this.$message.error('获取订单信息失败')
        console.error('Load order info error:', error)
      }
    },

    async loadRefundReasons() {
      try {
        const response = await getRefundReasons()
        this.refundReasons = response.data
      } catch (error) {
        console.error('Load refund reasons error:', error)
      }
    },

    updateRefundAmount() {
      this.refundForm.refundPrice = parseFloat(this.calculatedRefundAmount)
    },

    selectImage() {
      this.$refs.fileInput.click()
    },

    async handleImageUpload(event) {
      const files = Array.from(event.target.files)
      const remainingSlots = 9 - this.refundForm.images.length
      const filesToUpload = files.slice(0, remainingSlots)

      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) {
          this.$message.warning('图片大小不能超过5MB')
          continue
        }

        try {
          // 这里应该调用实际的上传接口
          const imageUrl = await this.uploadImage(file)
          this.refundForm.images.push(imageUrl)
        } catch (error) {
          this.$message.error('图片上传失败')
          console.error('Upload image error:', error)
        }
      }

      // 清空input
      event.target.value = ''
    },

    async uploadImage(file) {
      // 模拟上传，实际应该调用上传接口
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    },

    removeImage(index) {
      this.refundForm.images.splice(index, 1)
    },

    async submitRefund() {
      if (!this.canSubmit) {
        this.$message.warning('请完整填写退款信息')
        return
      }

      this.loading = true

      try {
        await applyRefund({
          orderId: this.orderInfo.id,
          cartIds: this.selectedItems,
          type: this.refundForm.type,
          reasonId: this.refundForm.reasonId,
          refundPrice: this.refundForm.refundPrice,
          explain: this.refundForm.explain,
          images: this.refundForm.images.join(',')
        })

        this.$message.success('退款申请提交成功')
        this.$router.push('/refund/list')
      } catch (error) {
        this.$message.error(error.message || '提交失败')
        console.error('Submit refund error:', error)
      } finally {
        this.loading = false
      }
    },

    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.refund-apply-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.refund-header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.refund-header h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
}

.refund-steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
}

.step.current {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-weight: bold;
}

.step.current .step-number {
  background: #409eff;
  color: white;
}

.step-text {
  font-size: 14px;
  color: #666;
}

.step-arrow {
  margin: 0 40px;
  color: #ddd;
  font-size: 20px;
}

.refund-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.order-info,
.refund-type,
.refund-reason,
.refund-amount,
.refund-description,
.refund-images {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info h3,
.refund-type h3,
.refund-reason h3,
.refund-amount h3,
.refund-description h3,
.refund-images h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.order-no {
  font-weight: bold;
  color: #333;
}

.order-time {
  color: #666;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.goods-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 20px;
}

.goods-detail {
  flex: 1;
}

.goods-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.goods-attr {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.goods-price {
  display: flex;
  align-items: center;
  gap: 15px;
}

.goods-price .price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
}

.goods-price .quantity {
  color: #666;
}

.item-actions {
  margin-left: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
}

.type-options {
  display: grid;
  gap: 15px;
}

.radio-option {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.2);
}

.radio-option.active {
  border-color: #409eff;
  background: #f0f7ff;
}

.radio-option input {
  margin-right: 15px;
  width: 18px;
  height: 18px;
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.option-desc {
  color: #666;
  font-size: 14px;
}

.reason-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.reason-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reason-item:hover {
  border-color: #409eff;
}

.reason-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}

.reason-item input {
  margin-right: 10px;
  width: 16px;
  height: 16px;
}

.amount-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 16px;
}

.amount-item .label {
  color: #666;
}

.amount-item .value {
  font-weight: bold;
}

.refund-value {
  color: #e74c3c !important;
  font-size: 18px;
}

.amount-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.amount-input label {
  color: #333;
  font-weight: 600;
}

.amount-input input {
  flex: 1;
  max-width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.currency {
  color: #666;
}

.refund-description textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.image-upload {
  margin-top: 15px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.image-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
}

.upload-btn {
  width: 120px;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.upload-btn:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 32px;
  color: #999;
  margin-bottom: 8px;
}

.upload-text {
  color: #999;
  font-size: 14px;
}

.upload-tips {
  margin-top: 15px;
}

.upload-tips p {
  margin: 5px 0;
  color: #999;
  font-size: 14px;
}

.submit-section {
  padding: 30px;
  background: #f8f9fa;
}

.submit-info {
  margin-bottom: 20px;
}

.info-text {
  color: #666;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.submit-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 30px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e9e9e9;
}

.btn-submit {
  background: #409eff;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #3a8ee6;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .refund-apply-container {
    padding: 15px;
  }

  .refund-header,
  .order-info,
  .refund-type,
  .refund-reason,
  .refund-amount,
  .refund-description,
  .refund-images,
  .submit-section {
    padding: 20px;
  }

  .goods-item {
    flex-direction: column;
    text-align: center;
  }

  .goods-image {
    margin: 0 0 15px 0;
  }

  .order-header {
    flex-direction: column;
    gap: 10px;
  }

  .reason-list {
    grid-template-columns: 1fr;
  }

  .submit-actions {
    flex-direction: column;
  }
}
</style>
</rewritten_file>
