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





      <!-- 结果展示区域 -->
      <q-card v-if="tableDesignResult" flat bordered class="result-card">
        <q-card-section class="q-pa-none">
          <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary"
            align="justify" narrow-indicator>
            <q-tab name="structure" icon="table_view" label="表结构详情" />
            <q-tab name="sql" icon="code" label="SQL DDL" />
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
                <div class="row items-center q-mb-sm">
                  <q-icon name="table_chart" size="24px" class="q-mr-sm" />
                  <h6 class="q-my-none q-mr-md">
                    {{ tableDesignResult.tableName }}
                  </h6>
                  <q-chip icon="table_rows" color="positive" text-color="white" size="sm">
                    {{ (tableDesignResult.fields || []).length }} 个字段
                  </q-chip>
                </div>
                <p class="text-body2 text-grey-7 q-mb-md">
                  {{ tableDesignResult.tableDescription }}
                </p>
              </div>

              <!-- 批量操作区域 -->
              <div v-if="editingRows.size > 0" class="batch-operations q-mb-md">
                <div class="row justify-end q-gutter-sm">
                  <q-chip icon="edit" color="info" text-color="white" size="sm">
                    正在编辑 {{ editingRows.size }} 个字段
                  </q-chip>
                  <q-btn size="sm" color="positive" icon="check_circle" label="确定所有" @click="saveAllEditing" unelevated>
                    <q-tooltip>保存所有正在编辑的字段</q-tooltip>
                  </q-btn>
                  <q-btn size="sm" color="grey-6" icon="cancel" label="取消所有" @click="cancelAllEditing" unelevated>
                    <q-tooltip>取消所有正在编辑的字段</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <q-table :rows="tableDesignResult.fields || []" :columns="fieldColumns" row-key="fieldName" flat bordered
                class="field-table" :pagination="{ rowsPerPage: 0 }" hide-pagination>
                <template v-slot:body-cell-fieldName="props">
                  <q-td :props="props">
                    <q-input v-if="editingRows.has(props.row.fieldName)"
                      :model-value="editingRowData[props.row.fieldName]?.fieldName || props.value"
                      @update:model-value="(val) => updateEditingField(props.row.fieldName, 'fieldName', val)" dense
                      outlined class="table-edit-input" />
                    <span v-else>{{ props.value }}</span>
                  </q-td>
                </template>
                <template v-slot:body-cell-fieldType="props">
                  <q-td :props="props">
                    <q-select v-if="editingRows.has(props.row.fieldName)"
                      :model-value="editingRowData[props.row.fieldName]?.fieldType || props.value"
                      @update:model-value="(val) => updateEditingField(props.row.fieldName, 'fieldType', val)"
                      :options="fieldTypeOptions" dense outlined class="table-edit-input" />
                    <span v-else>{{ props.value }}</span>
                  </q-td>
                </template>
                <template v-slot:body-cell-isPrimaryKey="props">
                  <q-td :props="props">
                    <q-checkbox v-if="editingRows.has(props.row.fieldName)"
                      :model-value="editingRowData[props.row.fieldName]?.isPrimaryKey || props.value"
                      @update:model-value="(val) => updateEditingField(props.row.fieldName, 'isPrimaryKey', val)"
                      dense />
                    <q-icon v-else :name="props.value ? 'check_circle' : 'cancel'"
                      :color="props.value ? 'positive' : 'negative'" size="sm" />
                  </q-td>
                </template>
                <template v-slot:body-cell-isNotNull="props">
                  <q-td :props="props">
                    <q-checkbox v-if="editingRows.has(props.row.fieldName)"
                      :model-value="editingRowData[props.row.fieldName]?.isNotNull || props.value"
                      @update:model-value="(val) => updateEditingField(props.row.fieldName, 'isNotNull', val)" dense />
                    <q-icon v-else :name="props.value ? 'check_circle' : 'cancel'"
                      :color="props.value ? 'positive' : 'negative'" size="sm" />
                  </q-td>
                </template>
                <template v-slot:body-cell-description="props">
                  <q-td :props="props">
                    <q-input v-if="editingRows.has(props.row.fieldName)"
                      :model-value="editingRowData[props.row.fieldName]?.description || props.value || ''"
                      @update:model-value="(val) => updateEditingField(props.row.fieldName, 'description', val)" dense
                      outlined class="table-edit-input" />
                    <span v-else>{{ props.value || '暂无描述' }}</span>
                  </q-td>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <div class="row q-gutter-xs justify-center">
                      <template v-if="editingRows.has(props.row.fieldName)">
                        <q-btn size="sm" flat round icon="check" color="positive"
                          @click="saveTableRowEdit(props.row.fieldName)">
                          <q-tooltip>保存</q-tooltip>
                        </q-btn>
                        <q-btn size="sm" flat round icon="close" color="negative"
                          @click="cancelTableRowEdit(props.row.fieldName)">
                          <q-tooltip>取消</q-tooltip>
                        </q-btn>
                      </template>
                      <template v-else>
                        <q-btn size="sm" flat round icon="edit" color="primary" @click="startTableRowEdit(props.row)">
                          <q-tooltip>编辑</q-tooltip>
                        </q-btn>
                        <q-btn size="sm" flat round icon="more_vert" color="grey-7">
                          <q-tooltip>更多操作</q-tooltip>
                          <q-menu>
                            <q-list style="min-width: 120px">
                              <q-item clickable v-close-popup @click="duplicateTableRow(props.row)">
                                <q-item-section avatar>
                                  <q-icon name="content_copy" color="primary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>复制字段</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-separator />
                              <q-item clickable v-close-popup @click="deleteTableRow(props.row.fieldName)">
                                <q-item-section avatar>
                                  <q-icon name="delete" color="negative" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-negative">删除字段</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-btn>
                      </template>
                    </div>
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


  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
const activeTab = ref('structure')
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



// 表格内联编辑数据
const editingRows = ref<Set<string>>(new Set())
const editingRowData = ref<Record<string, EditableField>>({})



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
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center' as const,
    field: 'actions'
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



// 获取编辑行数据的安全方法
const getEditingRowData = (fieldName: string) => {
  return editingRowData.value[fieldName] || null
}

// 安全的编辑数据计算属性
const safeEditingData = computed(() => {
  const result: Record<string, EditableField> = {}
  Object.keys(editingRowData.value).forEach(key => {
    const data = editingRowData.value[key]
    if (data) {
      result[key] = data
    }
  })
  return result
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









// 更新编辑字段的方法
const updateEditingField = (fieldName: string, property: keyof EditableField, value: any) => {
  if (editingRowData.value[fieldName]) {
    ; (editingRowData.value[fieldName] as any)[property] = value
  }
}

// 表格内联编辑方法
const startTableRowEdit = (row: TableField) => {
  // 创建编辑数据的副本
  const editData: EditableField = {
    ...row,
    id: generateUniqueId(),
    baseType: row.fieldType?.split('(')[0] || 'VARCHAR',
    typeLength: '',
    typeScale: '',
    defaultValue: ''
  }

  if (row.fieldName) {
    editingRowData.value[row.fieldName] = editData
    editingRows.value.add(row.fieldName)
  }
}

const saveTableRowEdit = (fieldName: string) => {
  const editData = editingRowData.value[fieldName]
  if (!editData || !editData.fieldName?.trim()) {
    $q.notify({
      type: 'warning',
      message: '字段名不能为空',
      position: 'top'
    })
    return
  }

  // 更新原始数据
  if (tableDesignResult.value?.fields) {
    const index = tableDesignResult.value.fields.findIndex(f => f.fieldName === fieldName)
    if (index !== -1) {
      tableDesignResult.value.fields[index] = {
        fieldName: editData.fieldName,
        fieldType: editData.fieldType || 'VARCHAR(50)',
        isPrimaryKey: editData.isPrimaryKey || false,
        isNotNull: editData.isNotNull || false,
        description: editData.description || '',
        isAuditField: editData.isAuditField || false
      }
    }
  }

  // 同步更新可编辑字段数据
  const editableIndex = editableFields.value.findIndex(f => f.fieldName === fieldName)
  if (editableIndex !== -1) {
    editableFields.value[editableIndex] = editData
  }

  // 清理编辑状态
  editingRows.value.delete(fieldName)
  delete editingRowData.value[fieldName]

  $q.notify({
    type: 'positive',
    message: '字段更新成功',
    position: 'top'
  })
}

const cancelTableRowEdit = (fieldName: string) => {
  editingRows.value.delete(fieldName)
  delete editingRowData.value[fieldName]
}

// 批量操作方法
const saveAllEditing = () => {
  const editingFieldNames = Array.from(editingRows.value)
  let successCount = 0
  let failCount = 0

  editingFieldNames.forEach(fieldName => {
    const editData = editingRowData.value[fieldName]
    if (!editData || !editData.fieldName?.trim()) {
      failCount++
      return
    }

    // 更新原始数据
    if (tableDesignResult.value?.fields) {
      const index = tableDesignResult.value.fields.findIndex(f => f.fieldName === fieldName)
      if (index !== -1) {
        tableDesignResult.value.fields[index] = {
          fieldName: editData.fieldName,
          fieldType: editData.fieldType || 'VARCHAR(50)',
          isPrimaryKey: editData.isPrimaryKey || false,
          isNotNull: editData.isNotNull || false,
          description: editData.description || '',
          isAuditField: editData.isAuditField || false
        }
      }
    }

    // 同步更新可编辑字段数据
    const editableIndex = editableFields.value.findIndex(f => f.fieldName === fieldName)
    if (editableIndex !== -1) {
      editableFields.value[editableIndex] = editData
    }

    successCount++
  })

  // 清理所有编辑状态
  editingRows.value.clear()
  Object.keys(editingRowData.value).forEach(key => {
    delete editingRowData.value[key]
  })

  // 显示结果通知
  if (failCount > 0) {
    $q.notify({
      type: 'warning',
      message: `保存完成：${successCount} 个成功，${failCount} 个失败（字段名不能为空）`,
      position: 'top'
    })
  } else {
    $q.notify({
      type: 'positive',
      message: `批量保存成功：已保存 ${successCount} 个字段`,
      position: 'top'
    })
  }
}

const cancelAllEditing = () => {
  const editingCount = editingRows.value.size

  // 清理所有编辑状态
  editingRows.value.clear()
  Object.keys(editingRowData.value).forEach(key => {
    delete editingRowData.value[key]
  })

  $q.notify({
    type: 'info',
    message: `已取消 ${editingCount} 个字段的编辑`,
    position: 'top'
  })
}



const deleteTableRow = (fieldName: string) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除字段 "${fieldName}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    // 从表格数据中删除
    if (tableDesignResult.value?.fields) {
      const index = tableDesignResult.value.fields.findIndex(f => f.fieldName === fieldName)
      if (index !== -1) {
        tableDesignResult.value.fields.splice(index, 1)
      }
    }

    // 从可编辑字段中删除
    const editableIndex = editableFields.value.findIndex(f => f.fieldName === fieldName)
    if (editableIndex !== -1) {
      editableFields.value.splice(editableIndex, 1)
    }

    // 清理编辑状态
    editingRows.value.delete(fieldName)
    delete editingRowData.value[fieldName]

    $q.notify({
      type: 'positive',
      message: '字段删除成功',
      position: 'top'
    })
  })
}

const duplicateTableRow = (row: TableField) => {
  // 创建字段副本
  const duplicatedField: TableField = {
    fieldName: `${row.fieldName}_copy`,
    fieldType: row.fieldType || 'VARCHAR(50)',
    isPrimaryKey: false, // 复制的字段不能是主键
    isNotNull: row.isNotNull || false,
    description: `${row.description || ''} (副本)`,
    isAuditField: row.isAuditField || false
  }

  // 添加到表格数据
  if (tableDesignResult.value?.fields) {
    tableDesignResult.value.fields.push(duplicatedField)
  }

  // 添加到可编辑字段
  const editableField: EditableField = {
    ...duplicatedField,
    id: generateUniqueId(),
    baseType: duplicatedField.fieldType?.split('(')[0] || 'VARCHAR',
    typeLength: '',
    typeScale: '',
    defaultValue: ''
  }
  editableFields.value.push(editableField)

  $q.notify({
    type: 'positive',
    message: '字段复制成功',
    position: 'top'
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

    activeTab.value = 'structure'

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

      activeTab.value = 'structure' // 默认显示表结构详情页签

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

  // 表格内联编辑样式
  .table-edit-input {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      min-height: 32px;
    }

    :deep(.q-field__native) {
      padding: 4px 8px;
      font-size: 13px;
    }
  }

  // 编辑行高亮
  :deep(.q-table tbody tr.editing-row) {
    background: rgba(var(--q-primary-rgb), 0.05);
    border-left: 3px solid var(--q-primary);
  }

  // 操作按钮样式
  .q-btn {
    min-width: 32px;
    min-height: 32px;
  }
}



.table-info {
  h6 {
    color: var(--q-primary);
    margin-bottom: 8px;
  }

  .q-icon {
    color: var(--q-primary);
  }
}

// 批量操作样式
.batch-operations {
  background: rgba(var(--q-primary-rgb), 0.05);
  border: 1px solid rgba(var(--q-primary-rgb), 0.2);
  border-radius: 8px;
  padding: 12px 16px;

  .q-chip {
    font-weight: 500;
  }

  .q-btn {
    font-weight: 500;
    min-width: 80px;
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
