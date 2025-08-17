<template>
  <section id="aiTableDesign" class="q-mb-xl">
    <div class="q-pa-sm">
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="auto_awesome" size="28px" class="q-mr-sm" />
          AI表设计
        </h2>
        <div class="row q-gutter-sm">
          <q-btn color="primary" size="md" icon="auto_awesome" label="生成表设计草稿" @click="generateTableDesign"
            :loading="isLoading" :disable="!requirementDescription.trim()" class="q-px-md" unelevated rounded />
          <q-btn v-if="editableFields.length > 0" color="secondary" size="md" icon="code" label="生成最终SQL"
            @click="generateFinalSQL" :loading="isGeneratingSQL" class="q-px-md" unelevated rounded />
        </div>
      </div>

      <!-- 输入区域 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="edit" class="q-mr-sm" />
            需求描述
          </div>

          <q-input v-model="requirementDescription" label="表设计需求"
            placeholder="请详细描述您的表设计需求，例如：&#10;'用户表，需要用户名、手机号、邮箱、密码字段，其中手机号和邮箱不能重复，还需要创建时间和更新时间'" outlined dense
            type="textarea" rows="4" class="light-field" clearable @keyup.ctrl.enter="generateTableDesign">
            <template v-slot:prepend>
              <q-icon name="description" size="16px" />
            </template>
            <template v-slot:hint>
              <div class="text-caption">
                <q-icon name="lightbulb" size="14px" class="q-mr-xs" />
                <strong>提示：</strong>描述得越具体，AI生成的结果越准确。可以包含字段名称、数据类型、约束条件等
                <br />
                <span class="text-primary">Ctrl+Enter 快速生成</span> |
                <span class="text-info">生成后可进行交互式编辑</span>
              </div>
            </template>
          </q-input>
        </q-card-section>
      </q-card>



      <!-- 交互式字段编辑区域 -->
      <q-card v-if="editableFields.length > 0" flat bordered class="interactive-editor q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-subtitle2 text-weight-medium">
              <q-icon name="edit_note" class="q-mr-sm" />
              交互式表设计编辑
            </div>
            <div class="row q-gutter-xs">
              <q-chip size="sm" color="info" text-color="white" icon="info">
                表名: {{ editableTableName }}
              </q-chip>
              <q-chip size="sm" color="positive" text-color="white" icon="table_rows">
                {{ editableFields.length }} 个字段
              </q-chip>
            </div>
          </div>

          <!-- 表名编辑 -->
          <div class="row q-mb-md">
            <div class="col-12">
              <q-input v-model="editableTableName" label="表名" outlined dense class="light-field">
                <template v-slot:prepend>
                  <q-icon name="table_chart" size="16px" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- 表描述编辑 -->
          <div class="row q-mb-lg">
            <div class="col-12">
              <q-input v-model="editableTableDescription" label="表描述" outlined dense type="textarea" rows="2"
                class="light-field">
                <template v-slot:prepend>
                  <q-icon name="description" size="16px" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- 字段列表编辑 -->
          <div class="fields-editor">
            <div class="fields-header q-mb-sm">
              <div class="row items-center justify-between">
                <span class="text-subtitle2 text-weight-medium">字段设计</span>
                <q-btn size="sm" color="primary" icon="add" label="添加字段" @click="addNewField" unelevated rounded />
              </div>
            </div>

            <div class="fields-list">
              <div class="dragArea">
                <div v-for="(field, index) in editableFields" :key="field.id">
                  <q-card flat bordered class="field-item q-mb-sm">
                    <q-card-section class="q-pa-md">
                      <div class="row items-center q-gutter-md">
                        <!-- 字段信息 -->
                        <div class="col">
                          <div class="field-display">
                            <div class="row items-center q-gutter-sm q-mb-xs">
                              <span class="text-weight-medium text-body1">{{ field.fieldName }}</span>
                              <q-chip size="xs" :color="field.isPrimaryKey ? 'warning' : 'grey-6'" text-color="white">
                                {{ field.fieldType }}
                              </q-chip>
                              <q-chip v-if="field.isPrimaryKey" size="xs" color="warning" text-color="white" icon="key">
                                主键
                              </q-chip>
                              <q-chip v-if="field.isNotNull && !field.isPrimaryKey" size="xs" color="blue-grey"
                                text-color="white" icon="not_interested">
                                非空
                              </q-chip>
                              <q-chip v-if="field.isAuditField" size="xs" color="info" text-color="white"
                                icon="schedule">
                                审计
                              </q-chip>
                            </div>
                            <div class="text-caption text-grey-7">
                              {{ field.description || '暂无描述' }}
                            </div>
                          </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="field-actions">
                          <div class="row q-gutter-xs">
                            <q-btn size="sm" flat round icon="edit" color="primary" @click="openFieldEditor(field)">
                              <q-tooltip>编辑字段</q-tooltip>
                            </q-btn>
                            <q-btn size="sm" flat round icon="delete" color="negative" @click="deleteField(index)">
                              <q-tooltip>删除字段</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="editableFields.length === 0" class="empty-state text-center q-pa-lg">
                <q-icon name="table_chart" size="48px" class="text-grey-5 q-mb-md" />
                <div class="text-body1 text-grey-7 q-mb-sm">暂无字段</div>
                <div class="text-caption text-grey-6">点击上方"添加字段"按钮开始设计表结构</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 结果展示区域 -->
      <q-card v-if="tableDesignResult" flat bordered class="result-card">
        <q-card-section class="q-pa-none">
          <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary"
            align="justify" narrow-indicator>
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
                  <q-btn flat round dense :icon="sqlCopied ? 'check' : 'content_copy'"
                    :color="sqlCopied ? 'positive' : 'grey-7'" @click="copySQL" class="copy-btn">
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

              <q-table :rows="tableDesignResult.fields || []" :columns="fieldColumns" row-key="fieldName" flat bordered
                class="field-table" :pagination="{ rowsPerPage: 0 }" hide-pagination>
                <template v-slot:body-cell-isPrimaryKey="props">
                  <q-td :props="props">
                    <q-icon :name="props.value ? 'check_circle' : 'cancel'"
                      :color="props.value ? 'positive' : 'negative'" size="sm" />
                  </q-td>
                </template>
                <template v-slot:body-cell-isNotNull="props">
                  <q-td :props="props">
                    <q-icon :name="props.value ? 'check_circle' : 'cancel'"
                      :color="props.value ? 'positive' : 'negative'" size="sm" />
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
                  <q-btn flat round dense :icon="jsonCopied ? 'check' : 'content_copy'"
                    :color="jsonCopied ? 'positive' : 'grey-7'" @click="copyJSON" class="copy-btn">
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

    <!-- 侧边栏字段编辑器 -->
    <q-drawer v-model="fieldEditorOpen" side="right" overlay behavior="mobile" :width="400" :breakpoint="700"
      class="field-editor-drawer">
      <q-card flat class="full-height">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-medium">
              <q-icon name="edit" class="q-mr-sm" />
              编辑字段
            </div>
            <q-btn flat round dense icon="close" @click="closeFieldEditor" class="text-grey-6" />
          </div>

          <q-separator class="q-mb-lg" />

          <div v-if="editingField" class="field-editor-form">
            <!-- 字段基本信息 -->
            <div class="form-section q-mb-lg">
              <div class="section-title q-mb-md">
                <q-icon name="info" class="q-mr-xs" />
                基本信息
              </div>

              <q-input v-model="editingField.fieldName" label="字段名称" outlined dense class="q-mb-md light-field"
                :rules="[val => !!val?.trim() || '字段名不能为空']">
                <template v-slot:prepend>
                  <q-icon name="label" size="16px" />
                </template>
              </q-input>

              <!-- 数据类型选择 -->
              <div class="datatype-section q-mb-md">
                <q-select v-model="editingField.baseType" :options="fieldTypeOptions" label="数据类型" outlined dense
                  class="light-field" use-input @filter="filterFieldTypes" @update:model-value="onDataTypeChange">
                  <template v-slot:prepend>
                    <q-icon name="data_object" size="16px" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt }}</q-item-label>
                        <q-item-label caption>
                          {{ getDataTypeCategory(scope.opt) }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon :name="getDataTypeIcon(scope.opt)" :color="getDataTypeCategoryColor(scope.opt)"
                          size="16px" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <!-- 动态参数输入 -->
                <div v-if="currentDataType" class="type-params q-mt-sm">
                  <div class="row q-gutter-sm">
                    <!-- 长度参数 -->
                    <div v-if="currentDataType.hasLength" class="col">
                      <q-input v-model="editingField.typeLength" :label="currentDataType.hasScale ? '精度' : '长度'"
                        outlined dense class="light-field" type="number" min="1"
                        :placeholder="currentDataType.defaultLength">
                        <template v-slot:prepend>
                          <q-icon name="straighten" size="14px" />
                        </template>
                      </q-input>
                    </div>

                    <!-- 标度参数 -->
                    <div v-if="currentDataType.hasScale" class="col">
                      <q-input v-model="editingField.typeScale" label="标度" outlined dense class="light-field"
                        type="number" min="0" :placeholder="currentDataType.defaultScale">
                        <template v-slot:prepend>
                          <q-icon name="decimal_increase" size="14px" />
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <!-- 类型预览 -->
                  <div class="type-preview q-mt-xs">
                    <q-chip size="sm" color="info" text-color="white" icon="preview">
                      {{ formatFieldType(editingField) }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <q-input v-model="editingField.description" label="字段描述" outlined dense type="textarea" rows="3"
                class="light-field" placeholder="请输入字段的详细描述...">
                <template v-slot:prepend>
                  <q-icon name="description" size="16px" />
                </template>
              </q-input>

              <!-- 默认值设置 -->
              <q-input v-model="editingField.defaultValue" label="默认值" outlined dense class="q-mt-md light-field"
                placeholder="留空表示无默认值">
                <template v-slot:prepend>
                  <q-icon name="settings" size="16px" />
                </template>
                <template v-slot:hint>
                  <div class="text-caption">
                    可使用如 CURRENT_TIMESTAMP、NULL 等特殊值
                  </div>
                </template>
              </q-input>
            </div>

            <!-- 字段约束 -->
            <div class="form-section q-mb-lg">
              <div class="section-title q-mb-md">
                <q-icon name="security" class="q-mr-xs" />
                字段约束
              </div>

              <div class="constraint-options">
                <q-checkbox v-model="editingField.isPrimaryKey" label="主键 (Primary Key)" class="q-mb-sm"
                  :disable="hasPrimaryKey && !editingField.isPrimaryKey" @update:model-value="onPrimaryKeyChange">
                  <q-tooltip v-if="hasPrimaryKey && !editingField.isPrimaryKey">
                    表中已存在主键字段
                  </q-tooltip>
                </q-checkbox>

                <q-checkbox v-model="editingField.isNotNull" label="非空 (NOT NULL)" class="q-mb-sm"
                  :disable="editingField.isPrimaryKey">
                  <q-tooltip v-if="editingField.isPrimaryKey">
                    主键字段自动为非空
                  </q-tooltip>
                </q-checkbox>

                <q-checkbox v-model="editingField.isAuditField" label="审计字段" class="q-mb-sm"
                  @update:model-value="onAuditFieldChange">
                  <q-icon name="help_outline" class="q-ml-xs text-grey-6 cursor-pointer" size="16px">
                    <q-tooltip class="bg-dark">
                      审计字段通常指 created_at、updated_at、created_by、updated_by 等用于记录数据变更历史的字段
                      <br />勾选后将自动配置常用的审计字段设置
                    </q-tooltip>
                  </q-icon>
                </q-checkbox>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <q-btn color="primary" label="保存更改" icon="save" class="full-width q-mb-sm" @click="saveFieldChanges"
                :disable="!editingField.fieldName?.trim()" unelevated />
              <q-btn color="grey-6" label="取消编辑" icon="cancel" class="full-width" @click="cancelFieldChanges" flat />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-drawer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { getAi } from 'src/api/ai/ai'
import type { TableDesignResponseVO, TableField } from 'src/api/api.schemas'
// import draggable from 'vuedraggable' // 暂时注释，需要安装包

const $q = useQuasar()

// 扩展的字段接口，添加唯一ID和类型参数
interface EditableField extends TableField {
  id: string
  baseType?: string // 基础类型，如 VARCHAR, DECIMAL
  typeLength?: string // 类型长度，如 VARCHAR(50) 中的 50
  typeScale?: string // 类型精度，如 DECIMAL(10,2) 中的 2
  defaultValue?: string // 默认值
}

// 响应式数据
const requirementDescription = ref('')
const isLoading = ref(false)
const isGeneratingSQL = ref(false)
const activeTab = ref('sql')
const sqlCopied = ref(false)
const jsonCopied = ref(false)

// 表设计结果 - 使用API定义的类型
const tableDesignResult = ref<TableDesignResponseVO | null>(null)

// 交互式编辑数据
const editableFields = ref<EditableField[]>([])
const editableTableName = ref('')
const editableTableDescription = ref('')

// 数据类型定义
const dataTypes = [
  { type: 'BIGINT', hasLength: false, hasScale: false, category: 'integer' },
  { type: 'INT', hasLength: false, hasScale: false, category: 'integer' },
  { type: 'SMALLINT', hasLength: false, hasScale: false, category: 'integer' },
  { type: 'TINYINT', hasLength: true, hasScale: false, category: 'integer', defaultLength: '1' },
  { type: 'VARCHAR', hasLength: true, hasScale: false, category: 'string', defaultLength: '50' },
  { type: 'CHAR', hasLength: true, hasScale: false, category: 'string', defaultLength: '10' },
  { type: 'TEXT', hasLength: false, hasScale: false, category: 'string' },
  { type: 'LONGTEXT', hasLength: false, hasScale: false, category: 'string' },
  { type: 'DECIMAL', hasLength: true, hasScale: true, category: 'decimal', defaultLength: '10', defaultScale: '2' },
  { type: 'FLOAT', hasLength: false, hasScale: false, category: 'decimal' },
  { type: 'DOUBLE', hasLength: false, hasScale: false, category: 'decimal' },
  { type: 'DATE', hasLength: false, hasScale: false, category: 'datetime' },
  { type: 'DATETIME', hasLength: false, hasScale: false, category: 'datetime' },
  { type: 'TIMESTAMP', hasLength: false, hasScale: false, category: 'datetime' },
  { type: 'TIME', hasLength: false, hasScale: false, category: 'datetime' },
  { type: 'BOOLEAN', hasLength: false, hasScale: false, category: 'boolean' },
  { type: 'JSON', hasLength: false, hasScale: false, category: 'json' },
  { type: 'BLOB', hasLength: false, hasScale: false, category: 'binary' },
  { type: 'LONGBLOB', hasLength: false, hasScale: false, category: 'binary' }
]

// 字段类型选项（用于显示）
const fieldTypeOptions = dataTypes.map(dt => dt.type)

// 侧边栏编辑器数据
const fieldEditorOpen = ref(false)
const editingField = ref<EditableField | null>(null)
const originalFieldData = ref<EditableField | null>(null)
const filteredFieldTypes = ref(fieldTypeOptions)

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

// 检查是否已有主键
const hasPrimaryKey = computed(() => {
  return editableFields.value.some(field =>
    field.isPrimaryKey && field.id !== editingField.value?.id
  )
})

// 当前选择的数据类型信息
const currentDataType = computed(() => {
  if (!editingField.value?.baseType) return null
  return dataTypes.find(dt => dt.type === editingField.value?.baseType)
})

// 格式化字段类型显示
const formatFieldType = (field: EditableField) => {
  if (!field.baseType) return 'VARCHAR(50)'

  const dataType = dataTypes.find(dt => dt.type === field.baseType)
  if (!dataType) return field.baseType

  if (dataType.hasLength && dataType.hasScale) {
    // DECIMAL类型
    const length = field.typeLength || dataType.defaultLength || '10'
    const scale = field.typeScale || dataType.defaultScale || '2'
    return `${field.baseType}(${length},${scale})`
  } else if (dataType.hasLength) {
    // VARCHAR, CHAR等类型
    const length = field.typeLength || dataType.defaultLength || '50'
    return `${field.baseType}(${length})`
  } else {
    // 不需要参数的类型
    return field.baseType
  }
}

// 工具方法
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 获取数据类型分类描述
const getDataTypeCategory = (type: string) => {
  const dataType = dataTypes.find(dt => dt.type === type)
  const categoryMap = {
    'integer': '整数类型',
    'string': '字符类型',
    'decimal': '小数类型',
    'datetime': '日期时间',
    'boolean': '布尔类型',
    'json': 'JSON类型',
    'binary': '二进制类型'
  }
  return categoryMap[dataType?.category as keyof typeof categoryMap] || '其他类型'
}

// 获取数据类型图标
const getDataTypeIcon = (type: string) => {
  const dataType = dataTypes.find(dt => dt.type === type)
  const iconMap = {
    'integer': 'looks_one',
    'string': 'text_fields',
    'decimal': 'functions',
    'datetime': 'schedule',
    'boolean': 'toggle_on',
    'json': 'data_object',
    'binary': 'storage'
  }
  return iconMap[dataType?.category as keyof typeof iconMap] || 'help'
}

// 获取数据类型分类颜色
const getDataTypeCategoryColor = (type: string) => {
  const dataType = dataTypes.find(dt => dt.type === type)
  const colorMap = {
    'integer': 'blue',
    'string': 'green',
    'decimal': 'purple',
    'datetime': 'orange',
    'boolean': 'pink',
    'json': 'cyan',
    'binary': 'grey'
  }
  return colorMap[dataType?.category as keyof typeof colorMap] || 'grey'
}

// 交互式编辑方法
const addNewField = () => {
  const newField: EditableField = {
    id: generateUniqueId(),
    fieldName: '',
    fieldType: 'VARCHAR(50)',
    baseType: 'VARCHAR',
    typeLength: '50',
    typeScale: '',
    isPrimaryKey: false,
    isNotNull: false,
    description: '',
    isAuditField: false,
    defaultValue: ''
  }
  editableFields.value.push(newField)

  // 直接打开编辑器编辑新字段
  openFieldEditor(newField)

  // 滚动到新添加的字段
  nextTick(() => {
    const fieldItems = document.querySelectorAll('.field-item')
    const lastField = fieldItems[fieldItems.length - 1]
    if (lastField) {
      lastField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 侧边栏编辑器方法
const openFieldEditor = (field: EditableField) => {
  // 保存原始数据以便取消时恢复
  originalFieldData.value = { ...field }
  editingField.value = field
  fieldEditorOpen.value = true
}

const closeFieldEditor = () => {
  fieldEditorOpen.value = false
  editingField.value = null
  originalFieldData.value = null
}

const saveFieldChanges = () => {
  if (!editingField.value?.fieldName?.trim()) {
    $q.notify({
      type: 'warning',
      message: '字段名不能为空',
      position: 'top'
    })
    return
  }

  // 更新字段类型显示
  if (editingField.value) {
    editingField.value.fieldType = formatFieldType(editingField.value)
  }

  $q.notify({
    type: 'positive',
    message: '字段保存成功',
    position: 'top'
  })

  closeFieldEditor()
}

const cancelFieldChanges = () => {
  if (originalFieldData.value && editingField.value) {
    // 恢复原始数据
    Object.assign(editingField.value, originalFieldData.value)
  }
  closeFieldEditor()
}

const onPrimaryKeyChange = (isPrimary: boolean) => {
  if (isPrimary && editingField.value) {
    // 如果设置为主键，自动设置为非空
    editingField.value.isNotNull = true

    // 移除其他字段的主键设置
    editableFields.value.forEach(field => {
      if (field.id !== editingField.value?.id) {
        field.isPrimaryKey = false
      }
    })
  }
}

// 数据类型变化处理
const onDataTypeChange = (newType: string) => {
  if (!editingField.value) return

  const dataType = dataTypes.find(dt => dt.type === newType)
  if (!dataType) return

  // 重置类型参数
  editingField.value.typeLength = dataType.defaultLength || ''
  editingField.value.typeScale = dataType.defaultScale || ''

  // 更新完整的字段类型
  editingField.value.fieldType = formatFieldType(editingField.value)
}

// 审计字段变化处理
const onAuditFieldChange = (isAudit: boolean) => {
  if (!isAudit || !editingField.value) return

  $q.dialog({
    title: '审计字段智能配置',
    message: '检测到您勾选了审计字段，是否要自动配置常用的审计字段设置？',
    options: {
      type: 'radio',
      model: 'created_at',
      items: [
        { label: 'created_at (创建时间)', value: 'created_at' },
        { label: 'updated_at (更新时间)', value: 'updated_at' },
        { label: 'created_by (创建人)', value: 'created_by' },
        { label: 'updated_by (更新人)', value: 'updated_by' }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    if (!editingField.value) return

    // 根据选择自动配置字段
    switch (data) {
      case 'created_at':
        editingField.value.fieldName = 'created_at'
        editingField.value.baseType = 'DATETIME'
        editingField.value.isNotNull = true
        editingField.value.defaultValue = 'CURRENT_TIMESTAMP'
        editingField.value.description = '创建时间'
        break
      case 'updated_at':
        editingField.value.fieldName = 'updated_at'
        editingField.value.baseType = 'DATETIME'
        editingField.value.isNotNull = true
        editingField.value.defaultValue = 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        editingField.value.description = '更新时间'
        break
      case 'created_by':
        editingField.value.fieldName = 'created_by'
        editingField.value.baseType = 'BIGINT'
        editingField.value.isNotNull = false
        editingField.value.defaultValue = ''
        editingField.value.description = '创建人ID'
        break
      case 'updated_by':
        editingField.value.fieldName = 'updated_by'
        editingField.value.baseType = 'BIGINT'
        editingField.value.isNotNull = false
        editingField.value.defaultValue = ''
        editingField.value.description = '更新人ID'
        break
    }

    // 更新字段类型显示
    editingField.value.fieldType = formatFieldType(editingField.value)

    $q.notify({
      type: 'positive',
      message: '审计字段配置成功！',
      position: 'top'
    })
  }).onCancel(() => {
    // 如果取消，保持审计字段勾选状态
  })
}

const filterFieldTypes = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredFieldTypes.value = fieldTypeOptions
    } else {
      const needle = val.toLowerCase()
      filteredFieldTypes.value = fieldTypeOptions.filter(
        type => type.toLowerCase().includes(needle)
      )
    }
  })
}

const deleteField = (index: number) => {
  const field = editableFields.value[index]
  if (!field) return

  $q.dialog({
    title: '确认删除',
    message: `确定要删除字段 "${field.fieldName || '未命名字段'}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    editableFields.value.splice(index, 1)
    $q.notify({
      type: 'positive',
      message: '字段删除成功',
      position: 'top'
    })
  })
}

const convertToEditableFields = (fields: TableField[] = []) => {
  return fields.map((field) => {
    const editableField: EditableField = {
      ...field,
      id: generateUniqueId(),
      defaultValue: ''
    }

    // 解析字段类型，分离基础类型和参数
    if (field.fieldType) {
      const typeMatch = field.fieldType.match(/^(\w+)(?:\((\d+)(?:,(\d+))?\))?/)
      if (typeMatch) {
        editableField.baseType = typeMatch[1] || 'VARCHAR'
        editableField.typeLength = typeMatch[2] || ''
        editableField.typeScale = typeMatch[3] || ''
      } else {
        editableField.baseType = field.fieldType
        editableField.typeLength = ''
        editableField.typeScale = ''
      }
    } else {
      editableField.baseType = 'VARCHAR'
      editableField.typeLength = '50'
      editableField.typeScale = ''
      editableField.fieldType = 'VARCHAR(50)'
    }

    return editableField
  })
}

const generateFinalSQL = async () => {
  if (editableFields.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: '请先添加字段',
      position: 'top'
    })
    return
  }

  // 检查是否有字段正在侧边栏编辑
  if (fieldEditorOpen.value) {
    $q.notify({
      type: 'warning',
      message: '请先保存正在编辑的字段',
      position: 'top'
    })
    return
  }

  isGeneratingSQL.value = true
  try {
    // 构建表结构数据
    const tableStructure = {
      tableName: editableTableName.value,
      tableDescription: editableTableDescription.value,
      fields: editableFields.value.map(field => ({
        fieldName: field.fieldName || '',
        fieldType: field.fieldType || 'VARCHAR(50)',
        isPrimaryKey: field.isPrimaryKey || false,
        isNotNull: field.isNotNull || false,
        description: field.description || '',
        isAuditField: field.isAuditField || false
      }))
    }

    // 生成SQL DDL
    const ddlSql = generateDDLFromFields(tableStructure)

    // 更新结果数据
    tableDesignResult.value = {
      inputPrompt: requirementDescription.value,
      tableName: editableTableName.value,
      tableDescription: editableTableDescription.value,
      ddlSql: ddlSql,
      fields: tableStructure.fields,
      indexes: [], // 可以后续扩展索引功能
      rawResponse: JSON.stringify(tableStructure),
      durationMs: 0,
      durationSeconds: 0,
      model: 'user-edited'
    }

    activeTab.value = 'sql'

    $q.notify({
      type: 'positive',
      message: '最终SQL生成成功！',
      position: 'top'
    })
  } catch (error) {
    console.error('生成最终SQL失败:', error)
    $q.notify({
      type: 'negative',
      message: '生成最终SQL失败',
      position: 'top'
    })
  } finally {
    isGeneratingSQL.value = false
  }
}

const generateDDLFromFields = (tableStructure: any) => {
  const { tableName, tableDescription, fields } = tableStructure

  let ddl = `-- ${tableDescription || tableName + '表'}\n`
  ddl += `CREATE TABLE ${tableName} (\n`

  const fieldLines = fields.map((field: any) => {
    let line = `    ${field.fieldName} ${field.fieldType}`

    if (field.isPrimaryKey) {
      line += ' PRIMARY KEY'
    }

    if (field.isNotNull && !field.isPrimaryKey) {
      line += ' NOT NULL'
    }

    if (field.description) {
      line += ` COMMENT '${field.description}'`
    }

    return line
  })

  ddl += fieldLines.join(',\n')
  ddl += `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='${tableDescription || tableName + '表'}';`

  return ddl
}

// 方法

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

      // 转换为可编辑字段并填充编辑器
      editableFields.value = convertToEditableFields(response.data.okData.fields)
      editableTableName.value = response.data.okData.tableName || 'new_table'
      editableTableDescription.value = response.data.okData.tableDescription || ''

      activeTab.value = 'sql' // 默认显示SQL页签

      $q.notify({
        type: 'positive',
        message: 'AI表设计草稿生成成功！您可以在上方进行交互式编辑',
        position: 'top'
      })
    } else {
      throw new Error(response.data?.failMsg || '生成表设计失败')
    }
  } catch (error) {
    console.error('生成表设计失败:', error)

    // 如果API调用失败，显示错误信息
    const errorMessage = error instanceof Error ? error.message : '请重试'
    $q.notify({
      type: 'negative',
      message: `生成表设计失败: ${errorMessage}`,
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

.interactive-editor {
  background: var(--q-card-bg, $card-bg);
  border: 1px solid var(--q-border-color, $border-color);
  border-radius: 8px;

  .light-field {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.02);
    }
  }
}

.fields-editor {
  .field-item {
    transition: all 0.3s ease;
    border: 1px solid var(--q-border-color, $border-color);

    &:hover {
      border-color: var(--q-primary);
      box-shadow: 0 2px 8px rgba(var(--q-primary-rgb), 0.1);
    }

    &.field-editing {
      border-color: var(--q-primary);
      background: rgba(var(--q-primary-rgb), 0.05);
    }

    .drag-handle {
      cursor: move;

      &:hover {
        .q-icon {
          color: var(--q-primary) !important;
        }
      }
    }

    .field-display {
      .q-chip {
        font-size: 11px;
      }
    }

    .field-edit-form {
      .light-field {
        :deep(.q-field__control) {
          background: rgba(255, 255, 255, 0.02);
        }
      }
    }
  }

  .empty-state {
    border: 2px dashed var(--q-border-color, $border-color);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.01);
  }
}

// 拖拽样式
.dragArea {
  min-height: 50px;
}

.ghost {
  opacity: 0.5;
  background: rgba(var(--q-primary-rgb), 0.1);
  border: 2px dashed var(--q-primary);
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

// 侧边栏编辑器样式
.field-editor-drawer {
  :deep(.q-drawer__content) {
    background: var(--q-card-bg, $card-bg);
  }

  .field-editor-form {
    .form-section {
      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--q-primary);
        display: flex;
        align-items: center;
      }

      .light-field {
        :deep(.q-field__control) {
          background: rgba(255, 255, 255, 0.02);
        }
      }

      .constraint-options {
        .q-checkbox {
          :deep(.q-checkbox__label) {
            font-size: 14px;
          }
        }
      }

      .datatype-section {
        .type-params {
          .light-field {
            :deep(.q-field__control) {
              background: rgba(255, 255, 255, 0.02);
            }
          }
        }

        .type-preview {
          text-align: center;

          .q-chip {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
        }
      }
    }

    .form-actions {
      position: sticky;
      bottom: 0;
      background: var(--q-card-bg, $card-bg);
      padding-top: 16px;
      border-top: 1px solid var(--q-border-color, $border-color);
      margin-top: 16px;
    }
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

  .field-editor-drawer {
    :deep(.q-drawer) {
      width: 100% !important;
    }
  }
}
</style>
