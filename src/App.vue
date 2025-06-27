<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'CRMEB PC商城',
    titleTemplate: '%s - CRMEB商城系统'
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.clearfix:after {
  content: "";
  display: table;
  clear: both;
}

.clearfix {
  zoom: 1;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.float-left {
  float: left;
}

.float-right {
  float: right;
}

.cursor-pointer {
  cursor: pointer;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.fixed {
  position: fixed;
}
</style> 