<template>
    <section id="nameByAI" class="q-mb-xl">
        <div class="q-pa-sm">
            <div class="row justify-between items-center q-mb-lg">
                <h2 class="text-h5 text-weight-bold q-my-none">
                    <q-icon name="auto_awesome" size="28px" class="q-mr-sm" />
                    AI变量命名
                </h2>
                <q-btn color="primary" size="md" icon="psychology" label="智能生成" @click="getNamingSuggestions"
                    :loading="isLoading" :disable="!chineseInput.trim()" class="q-px-md" unelevated rounded />
            </div>

            <q-card flat bordered class="filter-card q-mb-lg">
                <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 text-weight-medium q-mb-md">
                        <q-icon name="edit" class="q-mr-sm" />
                        输入描述
                    </div>

                    <q-input v-model="chineseInput" label="中文描述" placeholder="请输入需要命名的中文描述，例如：用户登录、数据查询、下载文件等" outlined
                        dense type="textarea" rows="2" class="light-field" clearable
                        @keyup.ctrl.enter="getNamingSuggestions">
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
                <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 text-weight-medium q-mb-md">
                        <q-icon name="lightbulb" class="q-mr-sm" />
                        命名建议
                    </div>

                    <div class="suggestions-grid">
                        <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-card"
                            @click="copySuggestion(suggestion.name || '')">
                            <div class="suggestion-header">
                                <q-icon name="code" size="20px" color="primary" class="q-mr-sm" />
                                <span class="suggestion-name">{{ suggestion.name }}</span>
                                <q-icon name="content_copy" size="16px" color="grey-6" class="copy-icon" />
                            </div>
                            <div class="suggestion-description">{{ suggestion.description }}</div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getDevTask } from 'src/api/dev-task/dev-task'
// 导入AI API
import { getAi } from 'src/api/ai/ai'
import type { NamingSuggestion, VariableNamingResponseVO } from 'src/api/api.schemas'

// 初始化
const $q = useQuasar()
const devTaskApi = getDevTask()

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
        // 使用AI命名建议接口
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

// AI命名建议相关数据
const aiApi = getAi()
const chineseInput = ref('')
const suggestions = ref<NamingSuggestion[]>([])
const isLoading = ref(false)
const detectedType = ref('')
const detectionReason = ref('')

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

// 尝试智能检测示例
const tryExample = (input: string) => {
    chineseInput.value = input
    void getNamingSuggestions()
}

// 复制建议 - 修复参数类型
const copySuggestion = (text: string | undefined) => {
    if (!text) return

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


</script>


<style lang="scss" scoped>
// 保留必要的输入框样式
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

// AI命名建议样式
.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.suggestion-card {
  background: rgba($cursor-surface, 0.8);
  border: 1px solid rgba($cursor-border, 0.2);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba($cursor-primary, 0.3);
    background: rgba($cursor-surface, 0.9);
  }

  .suggestion-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .suggestion-name {
      font-weight: 600;
      font-size: 1rem;
      color: $cursor-text;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      flex: 1;
    }

    .copy-icon {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &:hover .copy-icon {
    opacity: 1;
  }

  .suggestion-description {
    color: $cursor-muted;
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
