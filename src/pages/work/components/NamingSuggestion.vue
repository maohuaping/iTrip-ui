<template>
  <section id="naming-suggestion" class="q-mb-xl glass rounded-xl shadow-2xl">
    <div class="q-pa-lg">
      <!-- 标题栏 -->
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="auto_awesome" size="28px" class="q-mr-sm" color="primary" />
          智能命名建议
          <div class="text-caption text-grey-7 q-mt-xs">
            自动检测命名类型 • AI智能生成 • 一键复制
          </div>
        </h2>
        <q-btn color="primary" size="md" icon="psychology" label="智能生成" @click="getNamingSuggestions"
          :loading="isLoading" :disable="!chineseInput.trim()" class="q-px-md" unelevated rounded />
      </div>

      <!-- 输入区域 -->
      <div class="q-mb-lg">
        <q-input v-model="chineseInput" label="输入中文描述" placeholder="请输入需要命名的中文描述，例如：用户登录、数据查询、下载文件等" outlined
          type="textarea" rows="2" class="naming-input" clearable @keyup.ctrl.enter="getNamingSuggestions">
          <template v-slot:hint>
            <div class="text-caption">
              <q-icon name="auto_awesome" size="14px" class="q-mr-xs" />
              智能检测命名类型：系统会自动判断应该生成什么类型的命名（方法、变量、常量等）
              <span class="text-primary q-ml-sm">Ctrl+Enter 快速获取</span>
            </div>
          </template>
        </q-input>
      </div>

      <!-- 检测类型显示 -->
      <div v-if="detectedType" class="q-mb-md">
        <q-chip color="primary" text-color="white" icon="auto_awesome" size="sm"
          :label="`检测类型：${getDetectedTypeLabel(detectedType)}`" />
        <div v-if="detectionReason" class="text-caption text-grey-6 q-mt-xs q-ml-sm">
          {{ detectionReason }}
        </div>
      </div>

      <!-- 建议结果区域 - 紧凑布局 -->
      <div v-if="suggestions.length > 0" class="suggestions-container">
        <div class="text-subtitle2 text-weight-medium q-mb-md">
          <q-icon name="lightbulb" class="q-mr-xs" />
          命名建议
          <q-badge color="positive" :label="suggestions.length" class="q-ml-sm" />
        </div>

        <!-- 紧凑的卡片布局 -->
        <div class="suggestions-grid">
          <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item"
            @click="copySuggestion(suggestion.name)">
            <div class="suggestion-content">
              <div class="suggestion-name">{{ suggestion.name }}</div>
              <div class="suggestion-desc">{{ suggestion.description }}</div>
            </div>
            <div class="copy-indicator">
              <q-icon name="content_copy" size="16px" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!isLoading && hasSearched" class="q-pa-lg flex flex-center column">
        <q-icon name="search_off" size="64px" color="grey-4" />
        <div class="text-subtitle1 q-mt-md text-grey-7">暂无命名建议</div>
        <div class="text-caption text-grey-6 q-mt-sm">请检查输入内容或重新获取建议</div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="isLoading" class="q-pa-lg flex flex-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-ml-sm">正在调用AI生成命名建议...</div>
      </div>

      <!-- 历史记录 -->
      <div v-if="searchHistory.length > 0" class="q-mt-xl">
        <div class="text-subtitle2 text-weight-medium q-mb-md">
          <q-icon name="history" class="q-mr-xs" />
          搜索历史
          <q-btn flat dense size="sm" color="grey-7" label="清空" @click="clearHistory" class="q-ml-sm" />
        </div>

        <div class="history-chips">
          <q-chip v-for="(item, index) in searchHistory.slice(0, 10)" :key="index" clickable color="grey-3"
            text-color="grey-8" @click="loadFromHistory(item)" class="q-ma-xs" size="sm">
            {{ item }}
          </q-chip>
        </div>
      </div>

      <!-- 智能检测示例 -->
      <div v-if="!hasSearched && searchHistory.length === 0" class="q-mt-xl">
        <div class="text-subtitle2 text-weight-medium q-mb-md">
          <q-icon name="lightbulb" class="q-mr-xs" color="amber" />
          智能检测示例
        </div>

        <div class="example-grid">
          <q-card v-for="example in examples" :key="example.input" flat bordered class="example-card cursor-pointer"
            @click="tryExample(example.input)">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-primary q-mb-xs">{{ example.type }}</div>
              <div class="text-body2 text-weight-medium">{{ example.input }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">{{ example.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getAi } from 'src/api/ai/ai'
import type { NamingSuggestion, VariableNamingResponseVO } from 'src/api/api.schemas'

// 定义建议类型（根据API响应结构）
interface NamingSuggestion {
  name: string
  description: string
}

// 初始化
const $q = useQuasar()
const aiApi = getAi()

// 响应式数据
const chineseInput = ref('')
const suggestions = ref<NamingSuggestion[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const searchHistory = ref<string[]>([])
const detectedType = ref('')
const detectionReason = ref('')

// 智能检测示例
const examples = ref([
  {
    input: '用户登录',
    type: '方法命名',
    description: '描述中包含"登录"，且是用户操作，通常是方法'
  },
  {
    input: '用户数据',
    type: '变量命名',
    description: '描述中包含"数据"，且是用户相关的数据，通常是变量'
  },
  {
    input: '下载文件',
    type: '方法命名',
    description: '描述中包含"下载"，且是文件操作，通常是方法'
  },
  {
    input: '用户列表',
    type: '变量命名',
    description: '描述中包含"列表"，且是用户相关的数据，通常是变量'
  },
  {
    input: '上传图片',
    type: '方法命名',
    description: '描述中包含"上传"，且是图片操作，通常是方法'
  },
  {
    input: '配置信息',
    type: '变量命名',
    description: '描述中包含"信息"，且是配置相关的数据，通常是变量'
  }
])

// 组件挂载时加载历史记录
onMounted(() => {
  loadSearchHistory()
})

// 获取命名建议
const getNamingSuggestions = async () => {
  if (!chineseInput.value.trim()) {
    $q.notify({
      color: 'warning',
      message: '请输入中文描述',
      icon: 'warning'
    })
    return
  }

  isLoading.value = true
  hasSearched.value = true

  // 清空之前的结果
  suggestions.value = []
  detectedType.value = ''
  detectionReason.value = ''

  // 显示调用中的提示
  $q.notify({
    color: 'info',
    message: '正在调用AI接口生成命名建议...',
    icon: 'cloud_sync',
    timeout: 2000
  })

  try {
    // 使用正确的AI命名建议接口
    const response = await aiApi.getNameSuggestion({
      description: chineseInput.value.trim()
    })

    if (response.data?.isOk && response.data.okData) {
      const aiResponse: VariableNamingResponseVO = response.data.okData

      // 设置检测类型和原因
      if (aiResponse.detectedType) {
        detectedType.value = aiResponse.detectedType
      }
      if (aiResponse.detectionReason) {
        detectionReason.value = aiResponse.detectionReason
      }

      // 直接使用API返回的建议
      if (aiResponse.suggestions && Array.isArray(aiResponse.suggestions)) {
        suggestions.value = aiResponse.suggestions.map((suggestion: NamingSuggestion) => ({
          name: suggestion.name || '',
          description: suggestion.description || ''
        }))

        // 保存到搜索历史
        saveToHistory(chineseInput.value.trim())

        $q.notify({
          color: 'positive',
          message: `✨ 成功生成 ${suggestions.value.length} 个命名建议！点击即可复制`,
          icon: 'check_circle',
          timeout: 2500
        })
      } else {
        $q.notify({
          color: 'warning',
          message: '未能从返回结果中提取到命名建议',
          icon: 'warning'
        })
      }
    } else {
      $q.notify({
        color: 'negative',
        message: '获取命名建议失败',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('获取命名建议出错:', error)
    $q.notify({
      color: 'negative',
      message: 'AI接口调用失败，请检查网络连接',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 复制建议
const copySuggestion = (text: string) => {
  void navigator.clipboard.writeText(text)
    .then(() => {
      $q.notify({
        color: 'positive',
        message: `📋 已复制: ${text}`,
        icon: 'content_copy',
        position: 'top',
        timeout: 1500
      })
    })
    .catch((error) => {
      console.error('复制失败:', error)
      $q.notify({
        color: 'negative',
        message: '复制失败，请重试',
        icon: 'error'
      })
    })
}

// 尝试智能检测示例
const tryExample = (input: string) => {
  chineseInput.value = input
  void getNamingSuggestions()
}

// 获取检测类型标签
const getDetectedTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    method: '方法',
    variable: '变量',
    class: '类',
    function: '函数',
    constant: '常量',
    field: '字段',
    parameter: '参数'
  }
  return labels[type] || type
}

// 保存到搜索历史
const saveToHistory = (term: string) => {
  if (!term || searchHistory.value.includes(term)) return

  searchHistory.value.unshift(term)
  // 保持最多20条历史记录
  if (searchHistory.value.length > 20) {
    searchHistory.value = searchHistory.value.slice(0, 20)
  }

  // 保存到localStorage
  localStorage.setItem('naming_search_history', JSON.stringify(searchHistory.value))
}

// 从历史记录加载
const loadFromHistory = (term: string) => {
  chineseInput.value = term
  void getNamingSuggestions()
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('naming_search_history')
  $q.notify({
    color: 'positive',
    message: '搜索历史已清空',
    icon: 'delete_sweep',
    timeout: 1000
  })
}

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('naming_search_history')
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 组件选项
defineOptions({
  name: 'NamingSuggestion'
})
</script>

<style lang="scss" scoped>
.naming-input {
  :deep(.q-field__native) {
    font-size: 1rem;
  }

  :deep(.q-field__control) {
    min-height: 60px;
  }
}

.suggestions-container {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 紧凑的网格布局
.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

.suggestion-item {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $elevation-2;
    border-color: rgba($cursor-primary, 0.3);
    background: $cursor-surface;

    .suggestion-name {
      color: $cursor-primary;
    }

    .copy-indicator {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

.suggestion-content {
  flex: 1;
  min-width: 0; // 防止内容溢出
}

.suggestion-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: $cursor-text;
  margin-bottom: 4px;
  transition: color 0.2s ease;
  word-break: break-word;
}

.suggestion-desc {
  font-size: 0.8rem;
  color: $cursor-muted;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden; // 这里保留，因为是文本省略号
}

.copy-indicator {
  opacity: 0.4;
  color: $cursor-primary;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.history-chips {
  max-height: 120px;
  overflow-y: auto;

  :deep(.q-chip) {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.example-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(25, 118, 210, 0.3);
    background: rgba(255, 255, 255, 1);
  }
}
</style>