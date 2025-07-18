# 游戏后端 API 集成指南

## 概述

本文档描述了前端如何与后端 API 集成，实现完整的游戏流程。根据 `11.md` 文档的规范，我们实现了一个新的组合式函数 `useGameLogic.ts` 来处理所有与后端的交互。

## 实现的功能

### 1. 新增的组合式函数 (`useGameLogic.ts`)

这个文件负责处理所有与后端 API 的交互：

- **开始游戏**: 调用 `/start` API 创建游戏会话
- **获取独白**: 为每个角色调用 `/action` API 获取独白内容
- **管理游戏状态**: 维护会话ID、角色列表、独白队列等状态

#### 主要接口

```typescript
export interface Monologue {
  characterId: string;
  sentences: string[];
}

export function useGameLogic() {
  // 状态管理
  const sessionId = ref<string | null>(null)
  const availableCharacters = ref<string[]>([])
  const monologueQueue = ref<Monologue[]>([])
  const currentMonologueIndex = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 方法
  const startGame = async (scriptId: string) => { ... }
  const advanceToNextMonologue = (): Monologue | null => { ... }
  
  return { ... }
}
```

### 2. 修改的主游戏界面 (`GalgameInterface.vue`)

主要修改包括：

- **引入新的组合式函数**: 导入并使用 `useGameLogic`
- **更新 DialogueSystem 属性**: 使用新的游戏状态数据
- **新增 handleContinue 方法**: 处理独白推进逻辑
- **修改初始化逻辑**: 在组件挂载时自动开始游戏

#### 关键修改点

1. **导入新的组合式函数**:
```typescript
import { useGameLogic, type Monologue } from '@/composables/useGameLogic'
```

2. **使用新的游戏逻辑**:
```typescript
const {
  sessionId,
  monologueQueue,
  currentMonologueIndex,
  isLoading,
  error,
  startGame,
  advanceToNextMonologue
} = useGameLogic()
```

3. **更新 DialogueSystem 属性**:
```vue
<DialogueSystem
  :is-ai-processing="isLoading"
  :current-scene-index="currentMonologueIndex"
  :total-scenes="monologueQueue.length"
  @continue-scene="handleContinue"
  ...
/>
```

4. **新的继续处理逻辑**:
```typescript
const handleContinue = () => {
  if (isTypingActive.value) {
    skipTypingEffect()
    return
  }

  const nextMonologue = advanceToNextMonologue()
  if (nextMonologue) {
    // 显示下一个角色的独白
    // ...
  } else {
    // 所有独白结束，进入下一阶段
    // ...
  }
}
```

## API 集成流程

### 1. 游戏开始流程

1. **用户进入游戏界面**: 通过路由参数获取 `scriptId`
2. **调用开始游戏 API**: 
   ```
   POST /api/v1/langchain-game/start
   {
     "script_id": "script_001",
     "user_id": null
   }
   ```
3. **保存会话信息**: 存储 `session_id` 和 `available_human_characters`

### 2. 独白获取流程

1. **遍历可用角色**: 为每个角色调用独白 API
2. **调用独白 API**:
   ```
   POST /api/v1/langchain-game/session/{session_id}/action
   {
     "action_type": "monologue",
     "character_id": "character_001"
   }
   ```
3. **暂存独白内容**: 将所有角色的独白存储在队列中

### 3. 独白播放流程

1. **用户点击继续**: 触发 `handleContinue` 方法
2. **获取下一个独白**: 从队列中取出下一个角色的独白
3. **更新界面**: 显示角色信息和独白内容
4. **推进索引**: 为下次点击做准备

## 测试和验证

### 1. 开发服务器测试

启动开发服务器：
```bash
npm run dev
```

访问 `http://localhost:3001` 测试完整应用。

### 2. API 集成测试

访问 `http://localhost:3001/game-api-test.html` 进行 API 集成测试：

- 测试开始游戏 API
- 测试获取角色独白
- 测试独白推进逻辑
- 测试完整游戏流程

### 3. 预期行为

1. **游戏开始**: 成功创建会话并获取角色列表
2. **独白加载**: 成功获取所有角色的独白内容
3. **界面更新**: 正确显示角色信息和独白文本
4. **流程推进**: 点击继续按钮能够正确推进到下一个角色
5. **结束处理**: 所有独白播放完毕后显示结束提示

## 错误处理

实现了完整的错误处理机制：

- **网络错误**: 捕获并显示连接失败信息
- **API 错误**: 处理后端返回的错误响应
- **状态错误**: 验证游戏状态的完整性
- **用户反馈**: 通过 UI 显示错误信息

## 扩展性

当前实现为后续功能扩展提供了良好的基础：

- **QNA 阶段**: 独白结束后可以轻松添加问答功能
- **角色交互**: 可以扩展支持更多角色交互类型
- **游戏状态**: 支持保存和恢复游戏进度
- **多剧本**: 支持不同剧本的动态加载

## 注意事项

1. **API 地址**: 确保后端服务运行在 `http://127.0.0.1:8000`
2. **CORS 配置**: 后端需要正确配置 CORS 以支持前端请求
3. **错误处理**: 建议在生产环境中添加更详细的错误日志
4. **性能优化**: 大量角色时可考虑分批加载独白内容
