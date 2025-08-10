<template>
  <section id="naming-suggestion" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
    <div class="q-pa-lg">
      <!-- 标题栏 -->
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="auto_awesome" size="28px" class="q-mr-sm" color="primary" />
          智能命名建议
          <div class="text-caption text-grey-7 q-mt-xs">
            自动检测命名类型 • 多风格生成
          </div>
        </h2>
        <q-btn
          color="primary"
          size="md"
          icon="psychology"
          label="智能生成"
          @click="getNamingSuggestions"
          :loading="isLoading"
          :disable="!chineseInput.trim()"
          class="q-px-md"
          unelevated
          rounded
        />
      </div>

      <!-- 输入区域 -->
      <div class="q-mb-lg">
        <q-input
          v-model="chineseInput"
          label="输入中文描述"
          placeholder="请输入需要命名的中文描述，例如：用户登录、数据查询、删除用户权限等"
          outlined
          type="textarea"
          rows="3"
          class="naming-input"
          clearable
          @keyup.ctrl.enter="getNamingSuggestions"
        >
          <template v-slot:hint>
            <div class="text-caption">
              <q-icon name="auto_awesome" size="14px" class="q-mr-xs" />
              智能检测命名类型：系统会自动判断应该生成什么类型的命名（方法、变量、常量等）
              <span class="text-primary q-ml-sm">Ctrl+Enter 快速获取</span>
            </div>
          </template>
        </q-input>
      </div>

      <!-- 建议结果区域 -->
      <div v-if="suggestions.length > 0" class="suggestions-container">
        <!-- 调试信息区域 -->
        <q-expansion-item
          v-if="debugInfo"
          icon="bug_report"
          label="调试信息"
          class="q-mb-md"
          header-class="text-caption"
        >
          <q-card flat bordered class="q-pa-md">
            <div class="text-caption text-grey-7 q-mb-sm">API 原始返回内容：</div>
            <pre class="debug-text">{{ debugInfo }}</pre>
          </q-card>
        </q-expansion-item>
        
        <div class="text-subtitle2 text-weight-medium q-mb-md">
          <q-icon name="lightbulb" class="q-mr-xs" />
          命名建议
        </div>
        
        <div class="row q-col-gutter-md">
          <div 
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="col-12 col-md-6"
          >
            <q-card flat bordered class="suggestion-card">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="suggestion-type text-caption text-grey-7 q-mb-xs">
                      {{ getSuggestionTypeLabel(suggestion.type) }}
                    </div>
                    <div 
                      class="suggestion-text text-subtitle1 text-weight-medium cursor-pointer"
                      @click="copySuggestion(suggestion.text)"
                      :title="'点击复制: ' + suggestion.text"
                    >
                      {{ suggestion.text }}
                    </div>
                    <div v-if="suggestion.description" class="text-caption text-grey-6 q-mt-xs">
                      {{ suggestion.description }}
                    </div>
                  </div>
                  <div class="suggestion-actions">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="content_copy"
                      @click="copySuggestion(suggestion.text)"
                      size="sm"
                    >
                      <q-tooltip>复制</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
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
        <div class="q-ml-sm">正在生成命名建议...</div>
      </div>

      <!-- 历史记录 -->
      <div v-if="searchHistory.length > 0" class="q-mt-xl">
        <div class="text-subtitle2 text-weight-medium q-mb-md">
          <q-icon name="history" class="q-mr-xs" />
          搜索历史
          <q-btn 
            flat 
            dense 
            size="sm" 
            color="grey-7" 
            label="清空" 
            @click="clearHistory"
            class="q-ml-sm"
          />
        </div>
        
        <div class="history-chips">
          <q-chip
            v-for="(item, index) in searchHistory.slice(0, 10)"
            :key="index"
            clickable
            color="grey-3"
            text-color="grey-8"
            @click="loadFromHistory(item)"
            class="q-ma-xs"
          >
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
          <q-card 
            v-for="example in examples" 
            :key="example.input"
            flat 
            bordered 
            class="example-card cursor-pointer"
            @click="tryExample(example.input)"
          >
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
import { getDeepSeek } from 'src/api/deep-seek/deep-seek'

// 定义建议类型
interface NamingSuggestion {
  type: 'camelCase' | 'pascalCase' | 'snakeCase' | 'kebabCase' | 'constant' | 'method' | 'variable' | 'class' | 'function'
  text: string
  description?: string
}

// 初始化
const $q = useQuasar()
const deepSeekApi = getDeepSeek()

// 响应式数据
const chineseInput = ref('')
const suggestions = ref<NamingSuggestion[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const searchHistory = ref<string[]>([])
const debugInfo = ref('') // 用于存储API原始返回内容

// 智能检测示例
const examples = ref([
  {
    input: '用户登录',
    type: '方法命名',
    description: '描述中包含“登录”，且是用户操作，通常是方法'
  },
  {
    input: '用户数据',
    type: '变量命名',
    description: '描述中包含“数据”，且是用户相关的数据，通常是变量'
  },
  {
    input: '删除用户权限',
    type: '方法命名',
    description: '描述中包含“删除”和“权限”，且是用户操作，通常是方法'
  },
  {
    input: '用户列表',
    type: '变量命名',
    description: '描述中包含“列表”，且是用户相关的数据，通常是变量'
  },
  {
    input: '用户注册',
    type: '方法命名',
    description: '描述中包含“注册”，且是用户操作，通常是方法'
  },
  {
    input: '用户信息',
    type: '变量命名',
    description: '描述中包含“信息”，且是用户相关的数据，通常是变量'
  },
  {
    input: '用户删除',
    type: '方法命名',
    description: '描述中包含“删除”，且是用户操作，通常是方法'
  },
  {
    input: '用户编辑',
    type: '方法命名',
    description: '描述中包含“编辑”，且是用户操作，通常是方法'
  },
  {
    input: '用户搜索',
    type: '方法命名',
    description: '描述中包含“搜索”，且是用户操作，通常是方法'
  },
  {
    input: '用户查看',
    type: '方法命名',
    description: '描述中包含“查看”，且是用户操作，通常是方法'
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
  
  // 清空之前的结果和调试信息
  suggestions.value = []
  debugInfo.value = ''
  
  try {
    // 使用专门的变量命名接口，利用智能检测功能
    const response = await deepSeekApi.generateVariableNaming({
      description: chineseInput.value.trim()
      // 移除type参数，让API自动智能检测命名类型
    })
    
    if (response.data?.isOk && response.data.okData) {
      // 保存调试信息
      debugInfo.value = response.data.okData
      
      try {
        // 首先尝试解析DeepSeek API的原始响应
        const deepSeekResponse = JSON.parse(response.data.okData)
        
        if (deepSeekResponse.choices && deepSeekResponse.choices[0]?.message?.content) {
          // 提取DeepSeek返回的内容
          const content = deepSeekResponse.choices[0].message.content
          console.log('DeepSeek返回内容:', content)
          
          // 解析内容并生成建议
          handleDeepSeekResponse(content)
        } else {
          // 如果不是DeepSeek格式，尝试直接解析为我们的格式
          const parsedSuggestions = deepSeekResponse as NamingSuggestion[]
          suggestions.value = parsedSuggestions
        }
        
        // 保存到搜索历史
        saveToHistory(chineseInput.value.trim())
        
        $q.notify({
          color: 'positive',
          message: '命名建议获取成功',
          icon: 'check_circle',
          timeout: 1500
        })
      } catch (parseError) {
        console.error('解析建议结果失败:', parseError)
        console.log('原始返回数据:', response.data.okData)
        
        // 如果JSON解析失败，尝试直接显示返回的文本
        handlePlainTextResponse(response.data.okData)
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
      message: '获取命名建议出错，请检查网络连接',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 处理DeepSeek API响应
const handleDeepSeekResponse = (content: string) => {
  const extractedSuggestions: NamingSuggestion[] = []
  
  // 按行分割内容
  const lines = content.split('\n').filter(line => line.trim())
  
  lines.forEach((line, index) => {
    // 匹配形如 "1. variableName - description" 或 "variableName - description" 的格式
    const match = line.match(/(?:\d+\.\s*)?([a-zA-Z][a-zA-Z0-9_-]*)\s*[-–—]\s*(.+)/)
    
    if (match && match[1] && match[2]) {
      const variableName = match[1]
      const description = match[2]
      
      // 智能判断命名类型（基于描述内容）
      let type: NamingSuggestion['type'] = 'camelCase'
      
      // 从描述中检测类型提示
      const lowerDescription = description.toLowerCase()
      if (lowerDescription.includes('method') || lowerDescription.includes('方法')) {
        type = 'method'
      } else if (lowerDescription.includes('class') || lowerDescription.includes('类')) {
        type = 'class'
      } else if (lowerDescription.includes('function') || lowerDescription.includes('函数')) {
        type = 'function'
      } else if (lowerDescription.includes('constant') || lowerDescription.includes('常量')) {
        type = 'constant'
      } else if (lowerDescription.includes('variable') || lowerDescription.includes('变量')) {
        type = 'variable'
      } else {
        // 基于命名格式推断类型
        if (/^[A-Z]/.test(variableName) && /[a-z]/.test(variableName)) {
          type = 'pascalCase'
        } else if (variableName.includes('_')) {
          type = variableName === variableName.toUpperCase() ? 'constant' : 'snakeCase'
        } else if (variableName.includes('-')) {
          type = 'kebabCase'
        } else if (/^[a-z]/.test(variableName) && /[A-Z]/.test(variableName)) {
          type = 'camelCase'
        }
      }
      
      extractedSuggestions.push({
        type,
        text: variableName.trim(),
        description: description.trim()
      })
    } else {
      // 如果不匹配标准格式，尝试提取英文单词
      const englishWords = line.match(/[a-zA-Z][a-zA-Z0-9_-]*/g)
      if (englishWords && englishWords.length > 0) {
        englishWords.forEach(word => {
          // 过滤掉一些常见的非变量名词汇
          const excludeWords = [
            'represents', 'indicates', 'contains', 'completed', 'currently', 
            'general', 'information', 'registration', 'system', 'active', 
            'logged', 'profile', 'method', 'function', 'class', 'variable',
            'should', 'would', 'could', 'used', 'when', 'with', 'from'
          ]
          
          if (!excludeWords.includes(word.toLowerCase()) && word.length > 2) {
            let type: NamingSuggestion['type'] = 'camelCase'
            
            // 智能推断类型
            if (/^[A-Z]/.test(word) && /[a-z]/.test(word)) {
              type = 'pascalCase'
            } else if (word.includes('_')) {
              type = word === word.toUpperCase() ? 'constant' : 'snakeCase'
            } else if (word.includes('-')) {
              type = 'kebabCase'
            }
            
            extractedSuggestions.push({
              type,
              text: word,
              description: `智能提取的建议 (第${index + 1}行)`
            })
          }
        })
      }
    }
  })
  
  // 去重
  const uniqueSuggestions = extractedSuggestions.reduce((acc, current) => {
    const exists = acc.find(item => item.text === current.text)
    if (!exists) {
      acc.push(current)
    }
    return acc
  }, [] as NamingSuggestion[])
  
  if (uniqueSuggestions.length > 0) {
    // 为每个基础建议生成不同命名风格的变体
    const enhancedSuggestions = generateVariationSuggestions(uniqueSuggestions)
    suggestions.value = enhancedSuggestions
    
    $q.notify({
      color: 'positive',
      message: `智能检测到 ${enhancedSuggestions.length} 个命名建议`,
      icon: 'check_circle',
      timeout: 1500
    })
  } else {
    $q.notify({
      color: 'warning',
      message: '未能从返回结果中提取到有效的命名建议',
      icon: 'warning'
    })
  }
}

// 为基础命名生成不同风格的变体
const generateVariationSuggestions = (baseSuggestions: NamingSuggestion[]): NamingSuggestion[] => {
  const variations: NamingSuggestion[] = []
  
  // 选择最好的几个基础建议
  const topSuggestions = baseSuggestions.slice(0, 3)
  
  topSuggestions.forEach(baseSuggestion => {
    const baseText = baseSuggestion.text
    const baseDescription = baseSuggestion.description || '命名建议'
    
    // 将基础命名转换为单词数组（处理camelCase, snake_case等）
    const words = splitIntoWords(baseText)
    
    if (words.length > 0) {
      // 生成camelCase
      const camelCase = words[0]!.toLowerCase() + words.slice(1).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('')
      
      // 生成PascalCase
      const pascalCase = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('')
      
      // 生成snake_case
      const snakeCase = words.map(word => word.toLowerCase()).join('_')
      
      // 生成kebab-case
      const kebabCase = words.map(word => word.toLowerCase()).join('-')
      
      // 生成CONSTANT_CASE
      const constantCase = words.map(word => word.toUpperCase()).join('_')
      
      // 添加不同风格的建议
      variations.push({
        type: 'camelCase',
        text: camelCase,
        description: `${baseDescription} - 驼峰命名`
      })
      
      if (pascalCase !== camelCase) {
        variations.push({
          type: 'pascalCase',
          text: pascalCase,
          description: `${baseDescription} - 帕斯卡命名`
        })
      }
      
      if (snakeCase !== camelCase.toLowerCase()) {
        variations.push({
          type: 'snakeCase',
          text: snakeCase,
          description: `${baseDescription} - 下划线命名`
        })
      }
      
      if (kebabCase !== camelCase.toLowerCase()) {
        variations.push({
          type: 'kebabCase',
          text: kebabCase,
          description: `${baseDescription} - 短横线命名`
        })
      }
      
      variations.push({
        type: 'constant',
        text: constantCase,
        description: `${baseDescription} - 常量命名`
      })
    }
  })
  
  // 去重并限制数量
  const uniqueVariations = variations.reduce((acc, current) => {
    const exists = acc.find(item => item.text === current.text)
    if (!exists) {
      acc.push(current)
    }
    return acc
  }, [] as NamingSuggestion[])
  
  return uniqueVariations.slice(0, 10) // 最多返回10个建议
}

// 将文本分割为单词数组
const splitIntoWords = (text: string): string[] => {
  // 处理camelCase和PascalCase
  const camelCaseWords = text.replace(/([a-z])([A-Z])/g, '$1 $2')
  
  // 处理snake_case和kebab-case
  const words = camelCaseWords
    .split(/[\s_-]+/)
    .filter(word => word.length > 0)
    .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(word => word.length > 0)
  
  return words
}

// 处理纯文本响应（当返回不是JSON格式时）
const handlePlainTextResponse = (textResponse: string) => {
  // 尝试从文本中提取命名建议
  const lines = textResponse.split('\n').filter(line => line.trim())
  const extractedSuggestions: NamingSuggestion[] = []
  
  lines.forEach((line, index) => {
    // 如果行中包含英文字母，可能是命名建议
    if (/[a-zA-Z]/.test(line)) {
      // 提取可能的变量名（连续的字母、数字、下划线、短横线）
      const matches = line.match(/[a-zA-Z][a-zA-Z0-9_-]*/g)
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          // 判断命名类型
          let type: NamingSuggestion['type'] = 'camelCase'
          if (/^[A-Z]/.test(match) && /[a-z]/.test(match)) {
            type = 'pascalCase'
          } else if (match.includes('_')) {
            type = match === match.toUpperCase() ? 'constant' : 'snakeCase'
          } else if (match.includes('-')) {
            type = 'kebabCase'
          }
          
          extractedSuggestions.push({
            type,
            text: match,
            description: `从返回结果第${index + 1}行提取`
          })
        })
      }
    }
  })
  
  if (extractedSuggestions.length > 0) {
    suggestions.value = extractedSuggestions
    saveToHistory(chineseInput.value.trim())
    $q.notify({
      color: 'positive',
      message: '命名建议获取成功（文本解析）',
      icon: 'check_circle',
      timeout: 1500
    })
  } else {
    $q.notify({
      color: 'warning',
      message: '未能从返回结果中提取到有效的命名建议',
      icon: 'warning'
    })
  }
}

// 复制建议
const copySuggestion = (text: string) => {
  void navigator.clipboard.writeText(text)
    .then(() => {
      $q.notify({
        color: 'positive',
        message: `已复制: ${text}`,
        icon: 'content_copy',
        position: 'top',
        timeout: 1000
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

// 获取建议类型标签
const getSuggestionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    camelCase: '驼峰命名（小写）',
    pascalCase: '帕斯卡命名（大写）',
    snakeCase: '下划线命名',
    kebabCase: '短横线命名',
    constant: '常量命名',
    method: '方法命名',
    variable: '变量命名',
    class: '类命名',
    function: '函数命名'
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
    min-height: 80px;
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

.suggestion-card {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.12);
    
    .suggestion-text {
      color: #1976d2;
    }
  }
}

.suggestion-text {
  transition: color 0.2s ease;
  word-break: break-word;
  
  &:hover {
    color: #1976d2;
  }
}

.suggestion-type {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-actions {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  .suggestion-card:hover & {
    opacity: 1;
  }
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.example-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(25, 118, 210, 0.3);
    background: rgba(255, 255, 255, 1);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .suggestions-container {
    .col-md-6 {
      width: 100%;
    }
  }
}

// 调试信息样式
.debug-text {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 