<template>
  <div class="login-page">
    <!-- 顶部导航 -->
    <div class="login-header">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/logo.png" alt="CRMEB" />
          <span class="logo-text">crmeb</span>
          <span class="subtitle">官方商城</span>
        </div>
        <div class="header-actions">
          <el-button type="text" @click="goHome">
            <i class="el-icon-position"></i>
            品作合全
          </el-button>
          <el-button type="text" @click="goHome">
            <i class="el-icon-collection"></i>
            低价畅选
          </el-button>
          <el-button type="text" @click="goHome">
            <i class="el-icon-goods"></i>
            正品保证
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="login-main">
      <!-- 左侧3D装饰 -->
      <div class="left-decoration">
        <div class="decoration-container">
          <!-- 3D立体图标 -->
          <div class="isometric-illustration">
            <div class="building building-1"></div>
            <div class="building building-2"></div>
            <div class="building building-3"></div>
            <div class="phone-container">
              <div class="phone">
                <div class="phone-screen">
                  <div class="gift-box">
                    <div class="gift-box-top"></div>
                    <div class="gift-box-bottom"></div>
                    <div class="gift-ribbon"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2>快速登录/注册</h2>
            <div class="qr-code-icon">
              <i class="el-icon-camera"></i>
            </div>
          </div>

          <div class="login-form">
            <div class="phone-input">
              <div class="country-code">+86</div>
              <el-input
                v-model="phone"
                placeholder="请输入手机号"
                class="phone-field"
              />
            </div>

            <div class="verification-input">
              <el-input
                v-model="verificationCode"
                placeholder="请输入验证码"
                class="verification-field"
              />
              <el-button
                type="primary"
                class="get-code-btn"
                :disabled="countdown > 0"
                @click="getVerificationCode"
              >
                {{ countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
              </el-button>
            </div>

            <div class="agreement">
              <el-checkbox v-model="agreeToTerms">
                我已阅读并同意
                <el-button type="text" class="link">《用户协议》</el-button>
                和
                <el-button type="text" class="link">《隐私政策》</el-button>
              </el-checkbox>
            </div>

            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loginLoading"
              @click="handleLogin"
            >
              登录/注册
            </el-button>
          </div>

          <div class="other-login">
            <div class="other-login-text">账号登录</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="login-footer">
      <div class="footer-content">
        <div class="contact-info">
          <span>联系电话：400-8888-794</span>
          <span>地址：陕西省西安区东关南街东方财富地产十层</span>
        </div>
        <div class="copyright">
          <span>陕ICP备140119号-3</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'

export default {
  name: 'LoginIndex',
  data() {
    return {
      phone: '',
      verificationCode: '',
      agreeToTerms: false,
      countdown: 0,
      loginLoading: false
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    getVerificationCode() {
      if (!this.phone) {
        this.$message.warning('请输入手机号')
        return
      }

      // 开始倒计时
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)

      // TODO: 调用发送验证码API
      this.$message.success('验证码已发送')
    },
    async handleLogin() {
      if (!this.phone) {
        this.$message.warning('请输入手机号')
        return
      }
      if (!this.verificationCode) {
        this.$message.warning('请输入验证码')
        return
      }
      if (!this.agreeToTerms) {
        this.$message.warning('请同意用户协议和隐私政策')
        return
      }

      this.loginLoading = true
      try {
        const response = await login({
          phone: this.phone,
          code: this.verificationCode
        })

        this.$message.success('登录成功')
        this.$router.push('/')
      } catch (error) {
        this.$message.error('登录失败：' + error.message)
      } finally {
        this.loginLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ff4757 100%);
  position: relative;
  overflow: hidden;
}

.login-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo img {
  height: 30px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 14px;
  color: #ccc;
}

.header-actions {
  display: flex;
  gap: 20px;
}

.header-actions .el-button {
  color: #fff;
  font-size: 14px;
}

.login-main {
  display: flex;
  min-height: 100vh;
  padding-top: 60px;
}

.left-decoration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.decoration-container {
  width: 500px;
  height: 400px;
  position: relative;
}

/* 3D立体效果 */
.isometric-illustration {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotateY(0deg); }
  50% { transform: translateY(-20px) rotateY(10deg); }
}

/* 建筑物 */
.building {
  position: absolute;
  background: linear-gradient(45deg, #fff3cd, #ffeaa7);
  border: 2px solid #fdcb6e;
}

.building-1 {
  width: 80px;
  height: 120px;
  bottom: 100px;
  left: 50px;
  transform: rotateY(-15deg) rotateX(15deg);
  box-shadow: 10px 10px 20px rgba(0,0,0,0.2);
}

.building-2 {
  width: 100px;
  height: 150px;
  bottom: 100px;
  left: 150px;
  transform: rotateY(-10deg) rotateX(10deg);
  box-shadow: 12px 12px 24px rgba(0,0,0,0.2);
}

.building-3 {
  width: 60px;
  height: 100px;
  bottom: 100px;
  left: 270px;
  transform: rotateY(-20deg) rotateX(20deg);
  box-shadow: 8px 8px 16px rgba(0,0,0,0.2);
}

/* 手机容器 */
.phone-container {
  position: absolute;
  bottom: 150px;
  left: 200px;
  transform: rotateY(-10deg) rotateX(10deg);
}

.phone {
  width: 120px;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 15px 15px 30px rgba(0,0,0,0.3);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 礼品盒 */
.gift-box {
  width: 60px;
  height: 60px;
  position: relative;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.gift-box-bottom {
  width: 60px;
  height: 40px;
  background: linear-gradient(45deg, #ff6b6b, #ff4757);
  border-radius: 5px;
  position: absolute;
  bottom: 0;
}

.gift-box-top {
  width: 60px;
  height: 20px;
  background: linear-gradient(45deg, #ff8e8e, #ff6b6b);
  border-radius: 5px 5px 0 0;
  position: absolute;
  top: 0;
}

.gift-ribbon {
  width: 8px;
  height: 60px;
  background: linear-gradient(45deg, #feca57, #ff9ff3);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}

/* 登录表单容器 */
.login-form-container {
  width: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

.qr-code-icon {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.phone-input {
  display: flex;
  margin-bottom: 20px;
}

.country-code {
  width: 60px;
  height: 40px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.phone-field {
  flex: 1;
}

.phone-field .el-input__inner {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.verification-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.verification-field {
  flex: 1;
}

.get-code-btn {
  background: #ff4757;
  border-color: #ff4757;
  white-space: nowrap;
}

.get-code-btn:hover {
  background: #ff3742;
  border-color: #ff3742;
}

.agreement {
  margin-bottom: 25px;
  font-size: 12px;
  color: #666;
}

.agreement .link {
  color: #ff4757;
  padding: 0;
  font-size: 12px;
}

.login-btn {
  width: 100%;
  height: 45px;
  background: #ff4757;
  border-color: #ff4757;
  font-size: 16px;
  font-weight: 500;
}

.login-btn:hover {
  background: #ff3742;
  border-color: #ff3742;
}

.other-login {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.other-login-text {
  color: #ff4757;
  cursor: pointer;
  font-size: 14px;
}

.other-login-text:hover {
  text-decoration: underline;
}

/* 底部信息 */
.login-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: #ccc;
  padding: 15px 0;
  font-size: 12px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.contact-info {
  display: flex;
  gap: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-main {
    flex-direction: column;
  }

  .left-decoration {
    display: none;
  }

  .login-form-container {
    width: 100%;
    padding: 20px;
  }
}
</style>
