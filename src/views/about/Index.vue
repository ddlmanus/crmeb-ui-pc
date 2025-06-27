<template>
  <div class="about-page">
    <div class="container">
      <!-- 关于我们主体内容 -->
      <div class="about-content">
        <!-- 公司简介 -->
        <div class="section company-intro">
          <div class="intro-header">
            <div class="header-content">
              <div class="logo-section">
                <img src="@/assets/logo.png" alt="CRMEB" class="company-logo" />
                <div class="company-title">
                  <h1>CRMEB</h1>
                  <p>客户关系管理+营销电商管理系统</p>
                </div>
              </div>
              <div class="company-slogan">
                <h2>打造全渠道生态商业闭环</h2>
                <p>为企业提供一体化的商业运营解决方案</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于我们详情 -->
        <div class="section about-detail" v-loading="loading">
          <div class="section-title">
            <h3>关于我们</h3>
            <div class="title-line"></div>
          </div>
          <div class="detail-content" v-html="aboutContent"></div>
        </div>

        <!-- 企业理念 -->
        <div class="section company-values">
          <div class="section-title">
            <h3>企业理念</h3>
            <div class="title-line"></div>
          </div>
          <div class="values-grid">
            <div class="value-item">
              <div class="value-icon">
                <i class="el-icon-trophy"></i>
              </div>
              <h4>创新驱动</h4>
              <p>持续技术创新，引领行业发展</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <i class="el-icon-user"></i>
              </div>
              <h4>客户至上</h4>
              <p>以客户需求为导向，提供优质服务</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <i class="el-icon-star-on"></i>
              </div>
              <h4>品质保证</h4>
              <p>严格质量把控，确保产品品质</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <i class="el-icon-connection"></i>
              </div>
              <h4>合作共赢</h4>
              <p>与合作伙伴共同成长，实现共赢</p>
            </div>
          </div>
        </div>

        <!-- 联系我们 -->
        <div class="section contact-info">
          <div class="section-title">
            <h3>联系我们</h3>
            <div class="title-line"></div>
          </div>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="contact-icon">
                <i class="el-icon-phone"></i>
              </div>
              <div class="contact-detail">
                <h4>客服热线</h4>
                <p>400-8888-794</p>
                <span>工作时间：9:00-18:00（周一至周五）</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <i class="el-icon-location"></i>
              </div>
              <div class="contact-detail">
                <h4>公司地址</h4>
                <p>陕西省西安市高新区沣惠南路16号</p>
                <span>泰华金贸国际广场大厦3层</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <i class="el-icon-message"></i>
              </div>
              <div class="contact-detail">
                <h4>邮箱地址</h4>
                <p>service@crmeb.com</p>
                <span>技术支持：support@crmeb.com</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <i class="el-icon-link"></i>
              </div>
              <div class="contact-detail">
                <h4>官方网站</h4>
                <p>www.crmeb.com</p>
                <span>帮助文档：help.crmeb.net</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAboutUsInfo } from '@/api/user'

export default {
  name: 'AboutIndex',
  data() {
    return {
      loading: false,
      aboutContent: ''
    }
  },
  created() {
    this.fetchAboutUsInfo()
  },
  methods: {
    async fetchAboutUsInfo() {
      this.loading = true
      try {
        const response = await getAboutUsInfo()
        if (response.data) {
          // 如果后端有数据就显示，否则显示默认内容
          const agreement = JSON.parse(response.data)
          this.aboutContent = agreement.agreement || this.getDefaultContent()
        } else {
          this.aboutContent = this.getDefaultContent()
        }
      } catch (error) {
        console.error('获取关于我们信息失败:', error)
        this.aboutContent = this.getDefaultContent()
      } finally {
        this.loading = false
      }
    },
    getDefaultContent() {
      return `
        <div class="default-about">
          <h3>关于CRMEB</h3>
          <p>CRMEB是一款基于ThinkPHP5.0+Vue+EasyWeChat 开发的一套新零售商城系统，为中小型企业提供最佳的新零售解决方案。</p>
          <p>系统集成了用户管理、商品管理、订单管理、营销管理、内容管理、统计分析等功能，并支持小程序商城、H5商城、APP等多端同步运营。</p>
          <h4>产品特色</h4>
          <ul>
            <li>完整的新零售商业闭环</li>
            <li>多渠道营销推广体系</li>
            <li>精准的用户画像分析</li>
            <li>灵活的商品管理系统</li>
            <li>丰富的营销工具</li>
            <li>专业的技术支持服务</li>
          </ul>
        </div>
      `
    }
  }
}
</script>

<style lang="scss" scoped>
.about-page {
  background: #f5f5f5;
  min-height: calc(100vh - 160px);
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .about-content {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .section {
    padding: 40px;
    
    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
  }
  
  // 公司简介头部
  .company-intro {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 40px;
    
    .intro-header {
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 30px;
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
          
          .company-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.3);
          }
          
          .company-title {
            h1 {
              margin: 0;
              font-size: 36px;
              font-weight: bold;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            p {
              margin: 8px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
          }
        }
        
        .company-slogan {
          text-align: right;
          
          h2 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
        }
      }
    }
  }
  
  // 节标题
  .section-title {
    margin-bottom: 30px;
    text-align: center;
    
    h3 {
      margin: 0 0 15px 0;
      font-size: 28px;
      color: #333;
      font-weight: 600;
    }
    
    .title-line {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      margin: 0 auto;
      border-radius: 2px;
    }
  }
  
  // 详情内容
  .detail-content {
    font-size: 16px;
    line-height: 1.8;
    color: #555;
    
    :deep(.default-about) {
      h3 {
        color: #333;
        font-size: 24px;
        margin-bottom: 20px;
      }
      
      h4 {
        color: #333;
        font-size: 18px;
        margin: 25px 0 15px 0;
      }
      
      p {
        margin-bottom: 15px;
      }
      
      ul {
        li {
          margin-bottom: 8px;
          position: relative;
          padding-left: 20px;
          
          &:before {
            content: '•';
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
        }
      }
    }
  }
  
  // 企业理念
  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    
    .value-item {
      text-align: center;
      padding: 30px 20px;
      border-radius: 12px;
      background: #f8f9ff;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
      }
      
      .value-icon {
        margin-bottom: 20px;
        
        i {
          font-size: 48px;
          color: #667eea;
        }
      }
      
      h4 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 20px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: #666;
        line-height: 1.6;
      }
    }
  }
  
  // 联系我们
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 25px;
      background: #f8f9ff;
      border-radius: 12px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.12);
      }
      
      .contact-icon {
        i {
          font-size: 32px;
          color: #667eea;
        }
      }
      
      .contact-detail {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }
        
        p {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 16px;
          font-weight: 500;
        }
        
        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .about-page {
    .container {
      padding: 10px;
    }
    
    .section {
      padding: 20px;
    }
    
    .company-intro {
      padding: 30px 20px;
      
      .intro-header .header-content {
        flex-direction: column;
        text-align: center;
        
        .company-slogan {
          text-align: center;
        }
      }
    }
    
    .values-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
}
</style>
