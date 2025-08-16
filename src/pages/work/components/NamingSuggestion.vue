<template>
  <section id="naming-suggestion" class="q-mb-xl glass rounded-borders-xl">
    <div class="q-pa-lg">
      <!-- 标题栏优化 -->
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="auto_awesome" size="28px" class="q-mr-sm" />
          智能命名建议
        </h2>
        <q-btn color="primary" size="md" icon="psychology" label="智能生成" @click="getNamingSuggestions"
          :loading="isLoading" :disable="!chineseInput.trim()" class="q-px-md" unelevated rounded />
      </div>

      <!-- 输入区域 - 使用卡片样式 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="edit" class="q-mr-sm" />
            输入描述
          </div>

          <q-input v-model="chineseInput" label="中文描述" placeholder="请输入需要命名的中文描述，例如：用户登录、数据查询、下载文件等" outlined dense
            type="textarea" rows="2" class="light-field" clearable @keyup.ctrl.enter="getNamingSuggestions">
            <template v-slot:prepend>
              <q-icon name="description" size="16px" />
            </template>
            <template v-slot:hint>
              <div class="text-caption">
                <q-icon name="auto_awesome" size="14px" class="q-mr-xs" />
                智能检测命名类型：系统会自动判断应该生成什么类型的命名（方法、变量、常量等）
                <span class="text-primary q-ml-sm">Ctrl+Enter 快速获取</span>
              </div>
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- 检测类型显示 -->
      <div v-if="detectedType" class="q-mb-md">
        <q-chip color="primary" text-color="white" icon="auto_awesome" size="sm"
          :label="`检测类型：${getDetectedTypeLabel(detectedType)}`" />
        <div v-if="detectionReason" class="text-caption text-grey-6 q-mt-xs q-ml-sm">
          {{ detectionReason }}
        </div>
      </div>

      <!-- 建议结果区域 -->
      <q-card v-if="suggestions.length > 0" flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="lightbulb" class="q-mr-sm" />
            命名建议
            <q-badge color="positive" :label="suggestions.length" class="q-ml-sm" />
          </div>

          <!-- 高效数据展示区域 -->
          <div class="data-grid">
            <!-- 表头 -->
            <div class="data-header">
              <div class="data-cell header-cell">命名建议</div>
              <div class="data-cell header-cell">说明描述</div>
              <div class="data-cell header-cell">操作</div>
            </div>

            <!-- 数据行 -->
            <div v-for="(suggestion, index) in suggestions" :key="index" class="data-row">
              <!-- 命名建议列 -->
              <div class="data-cell suggestion-name">
                <div class="suggestion-name-content" @click="copySuggestion(suggestion.name)" title="点击复制命名">
                  {{ suggestion.name }}
                </div>
              </div>

              <!-- 说明描述列 -->
              <div class="data-cell suggestion-desc">
                <div class="suggestion-desc-content">
                  {{ suggestion.description }}
                </div>
              </div>

              <!-- 操作列 -->
              <div class="data-cell actions">
                <div class="action-buttons">
                  <q-btn flat round dense color="primary" icon="content_copy" @click="copySuggestion(suggestion.name)"
                    title="复制命名" class="action-btn" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

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
      <q-card v-if="searchHistory.length > 0" flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-md">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-subtitle2 text-weight-medium">
              <q-icon name="history" class="q-mr-sm" />
              搜索历史
            </div>
            <q-btn flat dense size="sm" color="grey-7" label="清空" @click="clearHistory" />
          </div>

          <div class="history-chips">
            <q-chip v-for="(item, index) in searchHistory.slice(0, 10)" :key="index" clickable color="grey-3"
              text-color="grey-8" @click="loadFromHistory(item)" class="q-ma-xs" size="sm">
              {{ item }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <!-- 智能检测示例 -->
      <q-card v-if="!hasSearched && searchHistory.length === 0" flat bordered class="filter-card">
        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="lightbulb" class="q-mr-sm" />
            智能检测示例
          </div>

          <div class="example-grid">
            <div v-for="example in examples" :key="example.input" class="example-item cursor-pointer"
              @click="tryExample(example.input)">
              <div class="example-content">
                <div class="example-type">{{ example.type }}</div>
                <div class="example-input">{{ example.input }}</div>
                <div class="example-desc">{{ example.description }}</div>
              </div>
              <div class="try-indicator">
                <q-icon name="play_arrow" size="16px" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
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
// 使用系统颜色变量，参考TaskList样式

// 玻璃效果 - 与TaskList保持一致
.glass {
  background: rgba($cursor-surface, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid $cursor-border;
}

// 过滤卡片样式
.filter-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.07);
    border-color: rgba(0, 0, 0, 0.12);
  }
}

// 轻量输入框样式
.light-field {

  .q-field__native,
  .q-field__prefix,
  .q-field__suffix,
  .q-field__input {
    color: $cursor-text !important;
  }

  .q-field__label {
    color: $cursor-muted !important;
  }

  &.q-field--outlined .q-field__control {
    background-color: $cursor-surface !important;
    border-color: $cursor-border !important;
  }
}

// 数据网格样式
.data-grid {
  border: 1px solid rgba($cursor-border, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background-color: $cursor-surface;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .data-header {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr;
    gap: 1px;
    background-color: $cursor-border;
    padding: 12px 16px;
    font-weight: bold;
    color: $cursor-text;
    font-size: 0.9rem;
  }

  .data-row {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr;
    gap: 1px;
    background-color: $cursor-surface;
    padding: 12px 16px;
    align-items: center;

    &:hover {
      background-color: $hover-bg;
    }
  }

  .data-cell {
    display: flex;
    align-items: center;
    padding: 0 8px;
    font-size: 0.9rem;
    color: $cursor-text;

    &.header-cell {
      font-weight: bold;
      color: $cursor-text;
    }

    &.suggestion-name {
      .suggestion-name-content {
        font-weight: 600;
        cursor: pointer;
        color: $cursor-primary;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &.suggestion-desc {
      .suggestion-desc-content {
        font-size: 0.85rem;
        color: $cursor-muted;
        line-height: 1.4;
      }
    }

    &.actions {
      .action-buttons {
        display: flex;
        gap: 8px;
      }

      .action-btn {
        &:hover {
          opacity: 0.9;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: $cursor-muted;

    .q-icon {
      margin-bottom: 16px;
    }
  }
}

// 历史记录芯片样式
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

// 示例网格样式
.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.example-item {
  background: rgba($cursor-surface, 0.9);
  border: 1px solid rgba($cursor-border, 0.3);
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
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: rgba($cursor-primary, 0.3);
    background: $cursor-surface;

    .example-input {
      color: $cursor-primary;
    }

    .try-indicator {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

.example-content {
  flex: 1;
  min-width: 0;
}

.example-type {
  font-size: 0.75rem;
  color: $cursor-primary;
  font-weight: 500;
  margin-bottom: 4px;
}

.example-input {
  font-size: 0.9rem;
  font-weight: 600;
  color: $cursor-text;
  margin-bottom: 4px;
  transition: color 0.2s ease;
}

.example-desc {
  font-size: 0.8rem;
  color: $cursor-muted;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.try-indicator {
  opacity: 0.4;
  color: $cursor-primary;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

// 动画效果
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

.data-grid {
  animation: fadeInUp 0.3s ease-out;
}

// 响应式调整
@media (max-width: 768px) {
  .data-grid {

    .data-header,
    .data-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .data-cell {
      padding: 8px;
      border-bottom: 1px solid rgba($cursor-border, 0.1);

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>