<template>
  <section id="aiTableDesign" class="q-mb-xl">
    <div class="q-pa-sm">
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="auto_awesome" size="28px" class="q-mr-sm" />
          AI表设计
        </h2>
        <q-btn
          color="primary"
          size="md"
          icon="table_chart"
          label="生成表设计"
          @click="generateTableDesign"
          :loading="isLoading"
          :disable="!requirementDescription.trim()"
          class="q-px-md"
          unelevated
          rounded
        />
      </div>

      <!-- 输入区域 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="edit" class="q-mr-sm" />
            需求描述
          </div>

          <q-input
            v-model="requirementDescription"
            label="需求描述"
            placeholder="请输入需求描述，AI将根据描述生成对应的表设计..."
            outlined
            dense
            type="textarea"
            rows="3"
            class="light-field"
            clearable
            @keyup.ctrl.enter="generateTableDesign"
          >
            <template v-slot:prepend>
              <q-icon name="description" size="16px" />
            </template>
            <template v-slot:hint>
              <div class="text-caption">
                <q-icon name="auto_awesome" size="14px" class="q-mr-xs" />
                AI将生成包含DDL语句、字段详情和索引建议的完整表设计
                <span class="text-primary q-ml-sm">Ctrl+Enter 快速生成</span>
              </div>
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- 需求列表选择区域 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="list" class="q-mr-sm" />
            选择现有需求
          </div>

          <div class="row q-gutter-sm">
            <div class="col-md-6 col-12">
              <q-select
                v-model="selectedRequirement"
                :options="filteredRequirements"
                option-value="requirementId"
                option-label="requirementName"
                label="选择需求"
                outlined
                dense
                clearable
                use-input
                @filter="filterRequirements"
                @update:model-value="onRequirementSelected"
                class="light-field"
              >
                <template v-slot:prepend>
                  <q-icon name="assignment" size="16px" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      没有找到匹配的需求
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.requirementName }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.requirementId }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip size="sm" :color="getSystemCategoryColor(scope.opt.systemCategory)" text-color="white">
                        {{ scope.opt.systemCategoryDesc }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-btn
                color="secondary"
                icon="refresh"
                label="刷新需求列表"
                @click="loadRequirements"
                :loading="loadingRequirements"
                outline
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 结果展示区域 -->
      <q-card v-if="tableDesignResult" flat bordered class="result-card">
        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="sql" icon="code" label="SQL DDL" />
            <q-tab name="structure" icon="table_view" label="表结构详情" />
            <q-tab name="raw" icon="data_object" label="原始数据" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- SQL DDL 页签 -->
            <q-tab-panel name="sql" class="q-pa-none">
              <div class="code-block-container">
                <div class="code-header">
                  <span class="code-title">
                    <q-icon name="code" class="q-mr-xs" />
                    SQL DDL 语句
                  </span>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="sqlCopied ? 'check' : 'content_copy'"
                    :color="sqlCopied ? 'positive' : 'grey-7'"
                    @click="copySQL"
                    class="copy-btn"
                  >
                    <q-tooltip>{{ sqlCopied ? '已复制!' : '复制SQL' }}</q-tooltip>
                  </q-btn>
                </div>
                <pre class="sql-code"><code>{{ tableDesignResult.ddlSql }}</code></pre>
              </div>
            </q-tab-panel>

            <!-- 表结构详情页签 -->
            <q-tab-panel name="structure" class="q-pa-md">
              <div class="table-info q-mb-md">
                <h6 class="q-my-sm">
                  <q-icon name="table_chart" class="q-mr-sm" />
                  {{ tableDesignResult.tableName }}
                </h6>
                <p class="text-body2 text-grey-7 q-mb-md">
                  {{ tableDesignResult.tableDescription }}
                </p>
              </div>

              <q-table
                :rows="tableDesignResult.fields || []"
                :columns="fieldColumns"
                row-key="fieldName"
                flat
                bordered
                class="field-table"
                :pagination="{ rowsPerPage: 0 }"
                hide-pagination
              >
                <template v-slot:body-cell-isPrimaryKey="props">
                  <q-td :props="props">
                    <q-icon
                      :name="props.value ? 'check_circle' : 'cancel'"
                      :color="props.value ? 'positive' : 'negative'"
                      size="sm"
                    />
                  </q-td>
                </template>
                <template v-slot:body-cell-isNotNull="props">
                  <q-td :props="props">
                    <q-icon
                      :name="props.value ? 'check_circle' : 'cancel'"
                      :color="props.value ? 'positive' : 'negative'"
                      size="sm"
                    />
                  </q-td>
                </template>
              </q-table>

              <!-- 索引信息 -->
              <div v-if="tableDesignResult.indexes && tableDesignResult.indexes.length > 0" class="q-mt-lg">
                <h6 class="q-my-sm">
                  <q-icon name="speed" class="q-mr-sm" />
                  索引建议
                </h6>
                <q-list bordered separator class="rounded-borders">
                  <q-item v-for="(index, idx) in tableDesignResult.indexes" :key="index.indexName || `index-${idx}`">
                    <q-item-section avatar>
                      <q-icon name="speed" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ index.indexName }}</q-item-label>
                      <q-item-label caption>{{ index.indexType }} - {{ index.fieldName }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-tab-panel>

            <!-- 原始数据页签 -->
            <q-tab-panel name="raw" class="q-pa-none">
              <div class="code-block-container">
                <div class="code-header">
                  <span class="code-title">
                    <q-icon name="data_object" class="q-mr-xs" />
                    原始JSON数据
                  </span>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="jsonCopied ? 'check' : 'content_copy'"
                    :color="jsonCopied ? 'positive' : 'grey-7'"
                    @click="copyJSON"
                    class="copy-btn"
                  >
                    <q-tooltip>{{ jsonCopied ? '已复制!' : '复制JSON' }}</q-tooltip>
                  </q-btn>
                </div>
                <pre class="json-code"><code>{{ formattedJSON }}</code></pre>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getDevTask } from 'src/api/dev-task/dev-task'
import { getAi } from 'src/api/ai/ai'
import type { DevTaskVO, TableDesignResponseVO } from 'src/api/api.schemas'

const $q = useQuasar()

// 响应式数据
const requirementDescription = ref('')
const selectedRequirement = ref<DevTaskVO | null>(null)
const requirementOptions = ref<DevTaskVO[]>([])
const filteredRequirements = ref<DevTaskVO[]>([])
const loadingRequirements = ref(false)
const isLoading = ref(false)
const activeTab = ref('sql')
const sqlCopied = ref(false)
const jsonCopied = ref(false)

// 表设计结果 - 使用API定义的类型
const tableDesignResult = ref<TableDesignResponseVO | null>(null)

// 表格列定义
const fieldColumns = [
  {
    name: 'fieldName',
    required: true,
    label: '字段名',
    align: 'left' as const,
    field: 'fieldName',
    sortable: true
  },
  {
    name: 'fieldType',
    label: '字段类型',
    align: 'left' as const,
    field: 'fieldType',
    sortable: true
  },
  {
    name: 'isPrimaryKey',
    label: '主键',
    align: 'center' as const,
    field: 'isPrimaryKey'
  },
  {
    name: 'isNotNull',
    label: '非空',
    align: 'center' as const,
    field: 'isNotNull'
  },
  {
    name: 'description',
    label: '描述',
    align: 'left' as const,
    field: 'description'
  }
]

// 计算属性
const formattedJSON = computed(() => {
  if (!tableDesignResult.value?.rawResponse) return ''
  try {
    const parsed = JSON.parse(tableDesignResult.value.rawResponse)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return tableDesignResult.value.rawResponse
  }
})

// 方法
const loadRequirements = async () => {
  loadingRequirements.value = true
  try {
    const devTaskApi = getDevTask()
    const response = await devTaskApi.queryDevTask({
      pageParam: { current: 1, size: 100 }
    })

    // 修复API响应结构问题
    if (response.data?.isOk && response.data?.okData?.records) {
      requirementOptions.value = response.data.okData.records
      filteredRequirements.value = response.data.okData.records
    }
  } catch (error) {
    console.error('加载需求列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载需求列表失败',
      position: 'top'
    })
  } finally {
    loadingRequirements.value = false
  }
}

const filterRequirements = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredRequirements.value = requirementOptions.value
    } else {
      const needle = val.toLowerCase()
      filteredRequirements.value = requirementOptions.value.filter(
        req => req.requirementName?.toLowerCase().includes(needle) ||
               req.requirementId?.toLowerCase().includes(needle)
      )
    }
  })
}

const onRequirementSelected = (requirement: DevTaskVO | null) => {
  if (requirement) {
    requirementDescription.value = requirement.requirementName || ''
  }
}

const getSystemCategoryColor = (category?: string) => {
  const colorMap: Record<string, string> = {
    'callin': 'blue',
    'callout': 'green',
    'system': 'purple',
    'web': 'orange'
  }
  return colorMap[category || ''] || 'grey'
}

const generateTableDesign = async () => {
  if (!requirementDescription.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '请输入需求描述',
      position: 'top'
    })
    return
  }

  isLoading.value = true
  try {
    const aiApi = getAi()
    const response = await aiApi.getTableDesign({
      prompt: requirementDescription.value,
      model: 'deepseek'
    })

    // 修复API响应结构问题
    if (response.data?.isOk && response.data?.okData) {
      tableDesignResult.value = response.data.okData
      activeTab.value = 'sql' // 默认显示SQL页签

      $q.notify({
        type: 'positive',
        message: 'AI表设计生成成功！',
        position: 'top'
      })
    } else {
      throw new Error(response.data?.failMsg || '生成表设计失败')
    }
  } catch (error) {
    console.error('生成表设计失败:', error)

    // 如果API调用失败，显示错误信息
    $q.notify({
      type: 'negative',
      message: `生成表设计失败: ${error.message || '请重试'}`,
      position: 'top'
    })
  } finally {
    isLoading.value = false
  }
}

const copySQL = async () => {
  if (!tableDesignResult.value?.ddlSql) return

  try {
    await navigator.clipboard.writeText(tableDesignResult.value.ddlSql)
    sqlCopied.value = true
    $q.notify({
      type: 'positive',
      message: 'SQL已复制到剪贴板',
      position: 'top'
    })
    setTimeout(() => {
      sqlCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    $q.notify({
      type: 'negative',
      message: '复制失败',
      position: 'top'
    })
  }
}

const copyJSON = async () => {
  if (!tableDesignResult.value?.rawResponse) return

  try {
    await navigator.clipboard.writeText(formattedJSON.value)
    jsonCopied.value = true
    $q.notify({
      type: 'positive',
      message: 'JSON已复制到剪贴板',
      position: 'top'
    })
    setTimeout(() => {
      jsonCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    $q.notify({
      type: 'negative',
      message: '复制失败',
      position: 'top'
    })
  }
}

// 生命周期
onMounted(() => {
  loadRequirements()
})
</script>

<style lang="scss" scoped>
.filter-card {
  background: var(--q-card-bg, $card-bg);
  border: 1px solid var(--q-border-color, $border-color);
  border-radius: 8px;

  .light-field {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.02);
    }
  }
}

.result-card {
  background: var(--q-card-bg, $card-bg);
  border: 1px solid var(--q-border-color, $border-color);
  border-radius: 8px;
  overflow: hidden;
}

.code-block-container {
  position: relative;
  background: #1e1e1e;
  color: #d4d4d4;

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #2d2d30;
    border-bottom: 1px solid #3e3e42;

    .code-title {
      font-weight: 500;
      color: #cccccc;
    }

    .copy-btn {
      opacity: 0.7;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }
  }

  pre {
    margin: 0;
    padding: 16px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;

    &.sql-code {
      color: #9cdcfe;

      code {
        color: inherit;
      }
    }

    &.json-code {
      color: #ce9178;

      code {
        color: inherit;
      }
    }
  }
}

.field-table {
  :deep(.q-table__top) {
    padding: 12px 16px;
  }

  :deep(.q-table thead th) {
    font-weight: 600;
    background: rgba(var(--q-primary-rgb), 0.1);
  }

  :deep(.q-table tbody td) {
    padding: 8px 16px;
  }
}

.table-info {
  h6 {
    color: var(--q-primary);
    margin-bottom: 8px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .code-block-container {
    .code-header {
      padding: 8px 12px;

      .code-title {
        font-size: 14px;
      }
    }

    pre {
      padding: 12px;
      font-size: 12px;
    }
  }
}
</style>
