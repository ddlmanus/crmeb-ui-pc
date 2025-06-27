<template>
  <div class="news-page">
    <!-- 新闻分类选项卡 -->
    <div class="news-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="购物心得" name="shopping"></el-tab-pane>
        <el-tab-pane label="消费文化" name="culture"></el-tab-pane>
        <el-tab-pane label="品牌资讯" name="brand"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新闻列表 -->
    <div class="news-container">
      <div class="news-list">
        <div class="news-item" v-for="item in newsList" :key="item.id">
          <div class="news-image">
            <img :src="item.image" :alt="item.title">
          </div>
          <div class="news-content">
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-summary">{{ item.summary }}</p>
            <div class="news-meta">
              <span class="news-date">{{ item.createTime }}</span>
              <span class="news-views">{{ item.views }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧热门资讯 -->
      <div class="hot-news-sidebar">
        <div class="sidebar-title">
          <i class="el-icon-s-flag"></i>
          更多
        </div>
        <div class="sidebar-title" style="margin-top: 20px;">
          <i class="el-icon-star-off"></i>
          热门资讯
        </div>
        <div class="hot-news-list">
          <div class="hot-news-item" v-for="item in hotNews" :key="item.id">
            <span class="hot-news-number">{{ item.index }}.</span>
            <a href="#" class="hot-news-title">{{ item.title }}</a>
            <span class="hot-news-date">{{ item.createTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsIndex',
  data() {
    return {
      activeTab: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      newsList: [
        {
          id: 1,
          title: '暖能消费｜老狗优选迈向文化消费新时代',
          summary: '消费文化的发展趋势和未来展望...',
          image: 'https://via.placeholder.com/200x150',
          createTime: '2025-04-01 16:34',
          views: 977
        },
        {
          id: 2,
          title: '电商对决"618"国货引领消费新风尚',
          summary: '618购物节国货品牌表现亮眼...',
          image: 'https://via.placeholder.com/200x150',
          createTime: '2025-04-01 16:33',
          views: 249
        },
        {
          id: 3,
          title: '稀罕｜国内外KOL，是如何测评谷川',
          summary: 'KOL评测分析和市场反馈...',
          image: 'https://via.placeholder.com/200x150',
          createTime: '2025-04-01 16:33',
          views: 196
        },
        {
          id: 4,
          title: '把重要的日子放在桌面',
          summary: '生活方式和时间管理的艺术...',
          image: 'https://via.placeholder.com/200x150',
          createTime: '2025-04-01 16:32',
          views: 69
        }
      ],
      hotNews: [
        { id: 1, index: 1, title: '暖能消费｜老狗优选迈向文化消费新时代', createTime: '2025-04-01 16:34' },
        { id: 2, index: 2, title: '电商对决"618"国货引领消费新风尚', createTime: '2025-04-01 16:33' },
        { id: 3, index: 3, title: '稀罕｜国内外KOL，是如何测评谷川', createTime: '2025-04-01 16:33' },
        { id: 4, index: 4, title: '把重要的日子放在桌面', createTime: '2025-04-01 16:32' }
      ]
    }
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name
      this.loadNews()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.loadNews()
    },
    loadNews() {
      // TODO: 调用API加载新闻数据
      console.log('加载新闻数据', this.activeTab, this.currentPage)
    }
  },
  mounted() {
    this.loadNews()
  }
}
</script>

<style scoped>
.news-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.news-tabs {
  margin-bottom: 30px;
}

.news-container {
  display: flex;
  gap: 30px;
}

.news-list {
  flex: 1;
}

.news-item {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.news-image {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.news-content {
  flex: 1;
}

.news-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 10px 0;
  line-height: 1.4;
  color: #333;
}

.news-summary {
  color: #666;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.news-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

.hot-news-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
}

.hot-news-list {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
}

.hot-news-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 14px;
}

.hot-news-number {
  color: #ff4757;
  font-weight: 500;
  min-width: 20px;
}

.hot-news-title {
  flex: 1;
  color: #333;
  text-decoration: none;
  line-height: 1.4;
}

.hot-news-title:hover {
  color: #ff4757;
}

.hot-news-date {
  color: #999;
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style> 