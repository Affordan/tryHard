<template>
  <div v-if="visible" class="ending-overlay">
    <div class="ending-content">
      <h2 class="ending-title">最终结局</h2>
      <div class="ending-text-container">
        <p v-for="(line, index) in ending" :key="index" class="ending-line">
          {{ line }}
        </p>
      </div>
      <button @click="goHome" class="action-button">返回主页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// 定义组件接收的props
defineProps<{
  visible: boolean;
  ending: readonly string[];
}>();

// 定义组件可以发出的事件
const emit = defineEmits(['close']);
const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.ending-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ending-content {
  background: #1e293b;
  padding: 2.5rem 3.5rem;
  border-radius: 16px;
  border: 1px solid #475569;
  max-width: 700px;
  width: 90%;
  text-align: center;
  color: #e2e8f0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.6s ease-out 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ending-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #a5b4fc;
  margin: 0 0 2rem 0;
}

.ending-text-container {
  font-size: 1.1rem;
  line-height: 2;
  text-align: left;
  margin-bottom: 2.5rem;
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 1.5rem;
  font-style: italic;
  color: #cbd5e1;
}

/* 美化滚动条 */
.ending-text-container::-webkit-scrollbar {
  width: 6px;
}
.ending-text-container::-webkit-scrollbar-track {
  background: #334155;
  border-radius: 3px;
}
.ending-text-container::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 3px;
}

.ending-line {
  margin-bottom: 1.5rem;
}

.action-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
}
</style>
