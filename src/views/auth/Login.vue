<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>请输入您的手机号和密码</p>
        </div>

        <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form">
          <el-form-item prop="phone">
            <el-input
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              prefix-icon="el-icon-mobile-phone"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              @click="handleLogin"
              :loading="loginLoading"
              class="login-btn"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <router-link to="/" class="back-home">
            <i class="el-icon-arrow-left"></i>
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loginPure, sendSmsCode } from '@/api/auth'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        phone: '',
        password: ''
      },
      loginRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ]
      },
      loginLoading: false
    }
  },
  methods: {
    async handleLogin() {
      if (this.loginLoading) return

      try {
        await this.$refs.loginForm.validate()
        this.loginLoading = true

        // 构建登录数据 - 目前只支持密码登录
        const loginData = {
          phone: this.loginForm.phone,
          password: this.loginForm.password
        }

        // 调用新的纯token登录接口
        const res = await loginPure(loginData)

        if (res.code === 200) {
          // 存储纯token（不包含前缀）
          await this.$store.dispatch('user/login', {
            token: res.data.token,
            userInfo: res.data.userInfo
          })

          this.$message.success('登录成功')

          // 跳转到首页或指定页面
          const redirect = this.$route.query.redirect || '/'
          this.$router.push(redirect)
        } else {
          this.$message.error(res.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        this.$message.error('登录失败，请重试')
      } finally {
        this.loginLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-box {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    color: #333;
    margin-bottom: 10px;
    font-weight: 600;
  }

  p {
    color: #666;
    font-size: 14px;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .login-btn {
    width: 100%;
    height: 45px;
    font-size: 16px;
    font-weight: 600;
  }
}

.login-footer {
  text-align: center;
  margin-top: 20px;

  .back-home {
    color: #666;
    text-decoration: none;
    font-size: 14px;

    &:hover {
      color: #409eff;
    }

    i {
      margin-right: 5px;
    }
  }
}
</style>
