<template>
  <div class="ai-assistant-page">
    <div class="header">
      <h1 class="title">AI 智能助手</h1>
      <p class="subtitle">提供智能开发建议和代码优化服务</p>
    </div>

    <!-- 功能选择 -->
    <div class="function-tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'detect' }" 
        @click="switchTab('detect')"
      >
        智能检测
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'practices' }" 
        @click="switchTab('practices')"
      >
        开发建议
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'prompt' }" 
        @click="switchTab('prompt')"
      >
        提示词优化
      </div>
    </div>

    <!-- 智能检测 -->
    <div v-if="activeTab === 'detect'" class="function-section">
      <h2>命名类型智能检测</h2>
      <div class="form-group">
        <label>业务描述 *</label>
        <textarea 
          v-model="detectForm.description" 
          placeholder="请输入业务描述，例如：计算用户年龄、处理订单支付、验证用户权限"
          rows="3"
        ></textarea>
      </div>
      <button @click="submitDetectNamingType" class="action-btn" :disabled="detecting">
        {{ detecting ? '分析中...' : '开始分析' }}
      </button>
      
      <!-- 检测结果 -->
      <div v-if="detectResult" class="result-section">
        <h3>检测结果</h3>
        <div class="result-box">
          <div class="result-item">
            <span class="result-label">命名类型：</span>
            <span class="result-value">{{ detectResult.type }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">推荐理由：</span>
            <span class="result-value">{{ detectResult.reason }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 开发建议 -->
    <div v-if="activeTab === 'practices'" class="function-section">
      <h2>Java开发最佳实践</h2>
      <div class="form-group">
        <label>问题描述 *</label>
        <textarea 
          v-model="practicesForm.question" 
          placeholder="请描述您的Java开发问题，例如：如何优化数据库查询性能、如何设计缓存策略"
          rows="3"
        ></textarea>
      </div>
      <div class="form-group">
        <label>关注领域</label>
        <select v-model="practicesForm.focusArea">
          <option value="general">通用开发</option>
          <option value="hutool">Hutool工具类</option>
          <option value="performance">性能优化</option>
          <option value="design-pattern">设计模式</option>
          <option value="spring">Spring框架</option>
        </select>
      </div>
      <button @click="submitJavaBestPractices" class="action-btn">
        提交咨询任务
      </button>
    </div>

    <!-- 提示词优化 -->
    <div v-if="activeTab === 'prompt'" class="function-section">
      <h2>AI提示词优化</h2>
      <div class="form-group">
        <label>原始提示词 *</label>
        <textarea 
          v-model="promptForm.originalPrompt" 
          placeholder="请输入您想要优化的提示词，例如：帮我写一个Java方法"
          rows="4"
        ></textarea>
      </div>
      <div class="form-group">
        <label>优化目标</label>
        <select v-model="promptForm.optimizationGoal">
          <option value="general">通用优化</option>
          <option value="clarity">提升清晰度</option>
          <option value="performance">优化性能</option>
          <option value="creativity">增强创意</option>
          <option value="accuracy">提高准确性</option>
        </select>
      </div>
      <button @click="submitOptimizePrompt" class="action-btn">
        提交优化任务
      </button>
    </div>

    <!-- 任务提交成功提示 -->
    <div v-if="taskSubmitted" class="success-section">
      <h3>任务提交成功</h3>
      <div class="success-box">
        <div class="success-icon">✅</div>
        <div class="success-content">
          <p class="success-title">您的{{ getTaskTypeName() }}任务已成功提交！</p>
          <p class="success-description">
            任务ID: <span class="task-id">{{ lastTaskId }}</span>
          </p>
          <p class="success-description">
            AI正在后台处理您的请求，预计需要1-3分钟完成。
          </p>
          <p class="success-notice">
            <strong>请注意观察您的邮箱</strong>，处理完成后我们会将结果发送到您的注册邮箱。
          </p>
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-section">
      <h3>操作失败</h3>
      <div class="error-box">
        <pre>{{ error }}</pre>
      </div>
      <button @click="clearError" class="clear-btn">重新尝试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAi } from 'src/api/ai/ai'
import type {
  DetectNamingTypeParams,
  GetJavaBestPracticesParams,
  OptimizePromptParams
} from 'src/api/api.schemas'

// 初始化AI API客户端
const aiApi = getAi()

// 状态管理
const activeTab = ref('detect')
const taskSubmitted = ref(false)
const error = ref('')
const lastTaskId = ref('')
const lastTaskType = ref('')

// 智能检测专用状态
const detecting = ref(false)
const detectResult = ref<{ type: string; reason: string } | null>(null)

// 默认AI模型
const DEFAULT_MODEL = 'deepseek'

// 表单数据
const detectForm = ref({
  description: ''
})

const practicesForm = ref({
  question: '',
  focusArea: 'general'
})

const promptForm = ref({
  originalPrompt: '',
  optimizationGoal: 'general'
})

// 生成任务ID
const generateTaskId = () => {
  return 'TASK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase()
}

// 获取任务类型名称
const getTaskTypeName = () => {
  const typeMap: Record<string, string> = {
    'detectNamingType': '命名类型检测',
    'getJavaBestPractices': 'Java最佳实践咨询',
    'optimizePrompt': '提示词优化'
  }
  return typeMap[lastTaskType.value] || '处理'
}

// 智能检测提交函数
const submitDetectNamingType = async () => {
  if (!detectForm.value.description.trim()) {
    error.value = '业务描述不能为空'
    return
  }

  detecting.value = true
  error.value = ''
  detectResult.value = null
  
  try {
    const params: DetectNamingTypeParams = {
      description: detectForm.value.description,
      model: DEFAULT_MODEL
    }
    
    const response = await aiApi.detectNamingType(params)
    console.log('智能检测结果:', response)
    
    // 修改：正确处理axios响应结构
    const apiData = response.data
    
    if (apiData?.isOk && apiData?.okData) {
      detectResult.value = {
        type: apiData.okData.type,
        reason: apiData.okData.reason
      }
      console.log('成功设置检测结果:', detectResult.value)
    } else if (apiData?.failMsg) {
      error.value = `检测失败: ${apiData.failMsg}`
    } else {
      error.value = '检测失败: 未知错误'
    }
    
  } catch (err: any) {
    error.value = `检测失败: ${err.message || err}`
    console.error('智能检测失败:', err)
  } finally {
    detecting.value = false
  }
}

// 通用任务提交处理（用于其他功能）
const submitTask = async (apiCall: () => Promise<any>, taskType: string) => {
  error.value = ''
  taskSubmitted.value = false
  
  try {
    // 生成任务ID
    const taskId = generateTaskId()
    lastTaskId.value = taskId
    lastTaskType.value = taskType
    
    console.log(`提交${taskType}任务，任务ID: ${taskId}`)
    
    // 实际调用API
    const response = await apiCall()
    console.log('API调用成功:', response)
    
    taskSubmitted.value = true
    
  } catch (err: any) {
    error.value = `任务提交失败: ${err.message || err}`
    console.error(`${taskType} 任务提交失败:`, err)
  }
}

// API 调用函数
const submitJavaBestPractices = async () => {
  if (!practicesForm.value.question.trim()) {
    error.value = '问题描述不能为空'
    return
  }

  await submitTask(async () => {
    const params: GetJavaBestPracticesParams = {
      question: practicesForm.value.question,
      focusArea: practicesForm.value.focusArea,
      model: DEFAULT_MODEL
    }
    return await aiApi.getJavaBestPractices(params)
  }, 'getJavaBestPractices')
}

const submitOptimizePrompt = async () => {
  if (!promptForm.value.originalPrompt.trim()) {
    error.value = '原始提示词不能为空'
    return
  }

  await submitTask(async () => {
    const params: OptimizePromptParams = {
      originalPrompt: promptForm.value.originalPrompt,
      optimizationGoal: promptForm.value.optimizationGoal,
      model: DEFAULT_MODEL
    }
    return await aiApi.optimizePrompt(params)
  }, 'optimizePrompt')
}

// 清空任务状态
const clearTaskStatus = () => {
  taskSubmitted.value = false
  lastTaskId.value = ''
  lastTaskType.value = ''
}

// 清空错误
const clearError = () => {
  error.value = ''
}

// 清空检测结果
const clearDetectResult = () => {
  detectResult.value = null
  detecting.value = false
}

// 切换标签时的处理
const switchTab = (tab: string) => {
  activeTab.value = tab
  clearTaskStatus()
  clearError()
  if (tab !== 'detect') {
    clearDetectResult()
  }
}
</script>

<style scoped>
.ai-assistant-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.title {
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.function-tabs {
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  min-width: 100px;
  color: #64748b;
}

.tab:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.function-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.function-section h2 {
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #fafbfc;
}

.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  width: 100%;
  margin-top: 8px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.success-section,
.error-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.success-section h3 {
  margin: 0 0 16px 0;
  color: #059669;
  font-size: 18px;
  font-weight: 700;
}

.error-section h3 {
  margin: 0 0 16px 0;
  color: #dc2626;
  font-size: 18px;
  font-weight: 700;
}

.success-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 2px solid #34d399;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.success-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.success-content {
  flex: 1;
}

.success-title {
  font-size: 16px;
  font-weight: 600;
  color: #059669;
  margin: 0 0 10px 0;
}

.success-description {
  color: #374151;
  margin: 6px 0;
  line-height: 1.5;
  font-size: 14px;
}

.task-id {
  font-family: 'Monaco', 'Menlo', 'JetBrains Mono', monospace;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

.success-notice {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 10px;
  margin-top: 12px;
  color: #92400e;
  font-size: 13px;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.error-box pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #374151;
}

.clear-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clear-btn:hover {
  background: #4b5563;
}

/* 新增检测结果样式 */
.result-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.result-section h3 {
  margin: 0 0 16px 0;
  color: #059669;
  font-size: 18px;
  font-weight: 700;
}

.result-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 2px solid #34d399;
  border-radius: 16px;
  padding: 20px;
}

.result-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  line-height: 1.6;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  font-weight: 600;
  color: #059669;
  min-width: 80px;
  flex-shrink: 0;
}

.result-value {
  color: #374151;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-assistant-page {
    padding: 16px;
    justify-content: center;
  }
  
  .header {
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 13px;
  }
  
  .function-tabs {
    margin-bottom: 16px;
  }
  
  .tab {
    padding: 10px 12px;
    font-size: 13px;
    min-width: 80px;
  }
  
  .function-section {
    padding: 20px;
    margin-bottom: 16px;
    min-height: 50vh;
    justify-content: center;
  }
  
  .function-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .success-box {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }
  
  .success-icon {
    font-size: 24px;
    align-self: center;
  }
  
  .action-btn {
    font-size: 15px;
    padding: 12px 24px;
  }
}

@media (max-width: 480px) {
  .function-section {
    min-height: 45vh;
  }
  
  .form-group textarea {
    min-height: 70px;
  }
}
</style>