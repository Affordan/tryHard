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
  height: 100vh;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', sans-serif;
}
</style>
