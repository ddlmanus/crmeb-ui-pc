<template>
  <div class="app-footer">
    <div class="footer-content">
      <div class="container">
        <!-- 友情链接 -->
        <div class="footer-links" v-if="bottomNavigationData && bottomNavigationData.length > 0">
          <div class="footer-text">
            <span>友情链接：</span>
            <template v-for="(item, index) in bottomNavigationData">
              <a v-if="item.url" :key="'link-' + index" :href="item.url" class="footer-link" target="_blank">{{ item.name }}</a>
              <span v-else :key="'text-' + index" class="footer-link">{{ item.name }}</span>
              <span v-if="index < bottomNavigationData.length - 1" :key="'divider-' + index" class="link-divider">|</span>
            </template>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="footer-contact">
          <div class="contact-info">
            <span class="contact-item">
              <span>联系电话：{{ contactPhone || '400-8888-794' }}</span>
            </span>
            <span class="contact-divider">|</span>
            <span class="contact-item">
              <span>地址：{{ contactAddress || '陕西省西安市高新区沣惠南路16号泰华金贸国际广场大厦3层' }}</span>
            </span>
          </div>

          <!-- 版权信息 -->
          <div class="copyright">
            <span>{{ copyrightText || 'Copyright ©2024 CRMEB. All Rights' }}</span>
            <span class="divider">|</span>
            <span>{{ recordNumber || '陕ICP备14010498号-3' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getBottomNavigation } from '@/api/home'

export default {
  name: 'AppFooter',
  data() {
    return {
      bottomNavigationData: [],
      isCustom: false,
      contactPhone: '',
      contactAddress: '',
      copyrightText: '',
      recordNumber: ''
    }
  },
  created() {
    this.loadBottomNavigationData()
  },
  methods: {
    async loadBottomNavigationData() {
      try {
        console.log('开始获取底部导航数据...')
        const response = await getBottomNavigation()
        console.log('底部导航API响应:', response)

        if (response.code === 200 && response.data) {
          this.isCustom = response.data.isCustom === '1'
          
          if (response.data.bottomNavigationList && response.data.bottomNavigationList.length > 0) {
            // 处理底部导航数据
            this.bottomNavigationData = response.data.bottomNavigationList.map(item => ({
              name: item.name || item.title || item.text,
              url: item.url || item.link,
              image: item.image || item.pic,
              type: item.type
            }))
            
            // 从导航数据中提取联系信息
            this.extractContactInfo(response.data.bottomNavigationList)
          }
          
          console.log('底部导航数据处理完成:', this.bottomNavigationData)
        } else {
          console.error('获取底部导航数据失败:', response.msg)
        }
      } catch (error) {
        console.error('获取底部导航数据出错:', error)
        // 出错时使用默认数据
        this.setDefaultData()
      }
    },
    
    extractContactInfo(navigationList) {
      // 从导航数据中提取联系信息
      navigationList.forEach(item => {
        if (item.phone) {
          this.contactPhone = item.phone
        }
        if (item.address) {
          this.contactAddress = item.address
        }
        if (item.copyright) {
          this.copyrightText = item.copyright
        }
        if (item.record) {
          this.recordNumber = item.record
        }
      })
    },
    
    setDefaultData() {
      // 设置默认友情链接数据
      this.bottomNavigationData = [
        { name: '百度', url: 'https://www.baidu.com' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  background: #f8f8f8;
  border-top: 1px solid #e6e6e6;
  padding: 20px 0;
  text-align: center; /* 确保所有内容居中 */

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer-links {
    margin-bottom: 15px;

    .footer-text {
      font-size: 12px;
      color: #666;
      text-align: center;

      .footer-link {
        color: #666;
        text-decoration: none;
        margin: 0 5px;

        &:hover {
          color: #409eff;
          text-decoration: underline;
        }
      }

      .link-divider {
        margin: 0 8px;
        color: #999;
      }
    }
  }

  .footer-contact {
    text-align: center;

    .contact-info {
      margin-bottom: 10px;
      font-size: 12px;
      color: #666;
      text-align: center;

      .contact-item {
        margin: 0 10px;
      }

      .contact-divider {
        margin: 0 15px;
        color: #999;
      }
    }

    .copyright {
      font-size: 12px;
      color: #999;
      text-align: center;

      .divider {
        margin: 0 15px;
        color: #ccc;
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .footer-contact {
      .contact-info {
        flex-direction: column;
        gap: 5px;

        .contact-divider {
          display: none;
        }
      }
    }

    .footer-links {
      .footer-text {
        .link-divider {
          display: block;
          margin: 5px 0;
        }
      }
    }
  }
}
</style>
