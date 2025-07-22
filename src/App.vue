<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 路由视图组件会自动处理组件渲染
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  width: 100vw;
  min-height: 100vh;
  /* 移除overflow限制和固定高度，允许内容自然扩展 */
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', sans-serif;
}

/* 为特定页面提供overflow控制 */
.page-no-scroll {
  overflow: hidden;
  height: 100vh;
}

.page-scrollable {
  overflow-y: auto;
  min-height: 100vh;
}
</style>
