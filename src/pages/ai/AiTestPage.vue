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
          @click="activeTab = 'detect'"
        >
          智能检测
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'practices' }" 
          @click="activeTab = 'practices'"
        >
          开发建议
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'prompt' }" 
          @click="activeTab = 'prompt'"
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
        <button @click="testDetectNamingType" :disabled="loading" class="action-btn">
          {{ loading ? '分析中...' : '开始分析' }}
        </button>
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
        <div class="form-group">
          <label>AI模型</label>
          <select v-model="practicesForm.model">
            <option value="deepseek">DeepSeek</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <button @click="testJavaBestPractices" :disabled="loading" class="action-btn">
          {{ loading ? '分析中...' : '获取建议' }}
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
        <div class="form-group">
          <label>AI模型</label>
          <select v-model="promptForm.model">
            <option value="deepseek">DeepSeek</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <button @click="testOptimizePrompt" :disabled="loading" class="action-btn">
          {{ loading ? '优化中...' : '开始优化' }}
        </button>
      </div>
  
      <!-- 结果展示 -->
      <div v-if="result" class="result-section">
        <h3>分析结果</h3>
        <div class="result-box">
          <pre>{{ formattedResult }}</pre>
        </div>
        <div class="result-actions">
          <button @click="copyResult" class="copy-btn">复制结果</button>
          <button @click="clearResults" class="clear-btn">清空结果</button>
        </div>
      </div>
  
      <!-- 错误信息 -->
      <div v-if="error" class="error-section">
        <h3>处理异常</h3>
        <div class="error-box">
          <pre>{{ error }}</pre>
        </div>
        <button @click="clearResults" class="clear-btn">清除异常</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
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
  const loading = ref(false)
  const result = ref<any>(null)
  const error = ref('')
  
  // 表单数据
  const detectForm = ref({
    description: ''
  })
  
  const practicesForm = ref({
    question: '',
    focusArea: 'general',
    model: 'deepseek'
  })
  
  const promptForm = ref({
    originalPrompt: '',
    optimizationGoal: 'general',
    model: 'deepseek'
  })
  
  // API 调用函数
  const testDetectNamingType = async () => {
    if (!detectForm.value.description.trim()) {
      error.value = '业务描述不能为空'
      return
    }
  
    loading.value = true
    error.value = ''
    result.value = null
  
    try {
      const params: DetectNamingTypeParams = {
        description: detectForm.value.description
      }
      
      const response = await aiApi.detectNamingType(params)
      result.value = response
    } catch (err: any) {
      error.value = `分析失败: ${err.message || err}`
      console.error('命名类型检测失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  const testJavaBestPractices = async () => {
    if (!practicesForm.value.question.trim()) {
      error.value = '问题描述不能为空'
      return
    }
  
    loading.value = true
    error.value = ''
    result.value = null
  
    try {
      const params: GetJavaBestPracticesParams = {
        question: practicesForm.value.question,
        focusArea: practicesForm.value.focusArea,
        model: practicesForm.value.model
      }
      
      const response = await aiApi.getJavaBestPractices(params)
      result.value = response
    } catch (err: any) {
      error.value = `获取建议失败: ${err.message || err}`
      console.error('Java最佳实践获取失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  const testOptimizePrompt = async () => {
    if (!promptForm.value.originalPrompt.trim()) {
      error.value = '原始提示词不能为空'
      return
    }
  
    loading.value = true
    error.value = ''
    result.value = null
  
    try {
      const params: OptimizePromptParams = {
        originalPrompt: promptForm.value.originalPrompt,
        optimizationGoal: promptForm.value.optimizationGoal,
        model: promptForm.value.model
      }
      
      const response = await aiApi.optimizePrompt(params)
      result.value = response
    } catch (err: any) {
      error.value = `优化失败: ${err.message || err}`
      console.error('提示词优化失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 格式化结果显示
  const formattedResult = computed(() => {
    return JSON.stringify(result.value, null, 2)
  })
  
  // 复制结果到剪贴板
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(formattedResult.value)
      alert('结果已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
      // 兜底方案
      const textArea = document.createElement('textarea')
      textArea.value = formattedResult.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('结果已复制到剪贴板')
    }
  }
  
  // 清空结果
  const clearResults = () => {
    result.value = null
    error.value = ''
  }
  
  // 切换标签时清空结果
  const switchTab = (tab: string) => {
    activeTab.value = tab
    clearResults()
  }
  </script>
  
  <style scoped>
  .ai-assistant-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  .title {
    font-size: 32px;
    margin: 0 0 12px 0;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  
  .subtitle {
    font-size: 16px;
    margin: 0;
    opacity: 0.9;
    font-weight: 400;
  }
  
  .function-tabs {
    display: flex;
    background: white;
    border-radius: 16px;
    padding: 6px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow-x: auto;
  }
  
  .tab {
    flex: 1;
    padding: 14px 20px;
    text-align: center;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 15px;
    white-space: nowrap;
    min-width: 120px;
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
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .function-section h2 {
    margin: 0 0 24px 0;
    color: #1e293b;
    font-size: 22px;
    font-weight: 700;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
    font-size: 15px;
  }
  
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
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
    min-height: 90px;
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
  
  .result-section,
  .error-section {
    background: white;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .result-section h3 {
    margin: 0 0 20px 0;
    color: #059669;
    font-size: 20px;
    font-weight: 700;
  }
  
  .error-section h3 {
    margin: 0 0 20px 0;
    color: #dc2626;
    font-size: 20px;
    font-weight: 700;
  }
  
  .result-box,
  .error-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    overflow-x: auto;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .error-box {
    background: #fef2f2;
    border-color: #fecaca;
  }
  
  .result-box pre,
  .error-box pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #374151;
  }
  
  .result-actions {
    display: flex;
    gap: 12px;
  }
  
  .copy-btn {
    background: #059669;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .copy-btn:hover {
    background: #047857;
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
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .ai-assistant-page {
      padding: 16px;
    }
    
    .title {
      font-size: 26px;
    }
    
    .function-tabs {
      gap: 4px;
    }
    
    .tab {
      padding: 12px 16px;
      font-size: 14px;
      min-width: 100px;
    }
    
    .function-section {
      padding: 20px;
    }
    
    .result-box,
    .error-box {
      max-height: 300px;
    }
    
    .result-actions {
      flex-direction: column;
    }
  }
  </style>