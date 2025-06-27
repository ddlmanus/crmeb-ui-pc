<template>
  <div class="app-footer">
    <div class="footer-content">
      <div class="container">
        <div class="footer-info">
          <div class="footer-text">
            <span>友情链接：</span>
            <a href="#" class="footer-link">百度</a>
          </div>
        </div>
        
        <div class="footer-contact">
          <div class="contact-info">
            <span class="contact-item">
              <span>联系电话：400-8888-794</span>
            </span>
            <span class="contact-divider">|</span>
            <span class="contact-item">
              <span>地址：陕西省西安市高新区沣惠南路16号泰华金贸国际广场大厦3层</span>
            </span>
          </div>
          
          <div class="copyright">
            <span>Copyright ©2024 CRMEB. All Rights</span>
            <span class="divider">|</span>
            <span>陕ICP备14010498号-3</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style lang="scss" scoped>
.app-footer {
  background: #f8f8f8;
  border-top: 1px solid #e6e6e6;
  padding: 20px 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-info {
    margin-bottom: 15px;
    
    .footer-text {
      font-size: 12px;
      color: #666;
      
      .footer-link {
        color: #666;
        text-decoration: none;
        margin-left: 5px;
        
        &:hover {
          color: #409eff;
        }
      }
    }
  }
  
  .footer-contact {
    .contact-info {
      margin-bottom: 10px;
      font-size: 12px;
      color: #666;
      
      .contact-item {
        margin-right: 10px;
      }
      
      .contact-divider {
        margin: 0 10px;
        color: #999;
      }
    }
    
    .copyright {
      font-size: 12px;
      color: #999;
      
      .divider {
        margin: 0 10px;
        color: #ccc;
      }
    }
  }
}

@media (max-width: 768px) {
  .app-footer {
    .footer-contact {
      .contact-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        .contact-divider {
          display: none;
        }
      }
    }
  }
}
</style> 