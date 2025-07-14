<template>
  <div id="app">
    <GalgameInterface />
  </div>
</template>

<script setup lang="ts">
import GalgameInterface from '@/components/GalgameInterface.vue'
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
