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
            <q-tab name="original-sql" icon="code_off" label="原始 DDL" />
            <q-tab name="raw" icon="data_object" label="原生响应" />
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
                  <div class="row items-center q-gutter-sm">
                    <q-select v-model="databaseType" :options="[
                      { label: 'MySQL', value: 'mysql' },
                      { label: 'PostgreSQL', value: 'postgresql' }
                    ]" emit-value map-options dense outlined style="min-width: 120px"
                      @update:model-value="onDatabaseTypeChange" class="database-type-select" />
                    <q-btn flat round dense :icon="sqlCopied ? 'check' : 'content_copy'"
                      :color="sqlCopied ? 'positive' : 'grey-7'" @click="copySQL" class="copy-btn">
                      <q-tooltip>{{ sqlCopied ? '已复制!' : '复制SQL' }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>
                <pre class="sql-code"><code>{{ tableDesignResult.ddlSql }}</code></pre>
              </div>
            </q-tab-panel>

            <!-- 接口原始DDL 页签 -->
            <q-tab-panel name="original-sql" class="q-pa-none">
              <div class="code-block-container">
                <div class="code-header">
                  <span class="code-title">
                    <q-icon name="code_off" class="q-mr-xs" />
                    接口返回的原始DDL
                  </span>
                  <q-btn flat round dense :icon="originalSqlCopied ? 'check' : 'content_copy'"
                    :color="originalSqlCopied ? 'positive' : 'grey-7'" @click="copyOriginalSQL" class="copy-btn">
                    <q-tooltip>{{ originalSqlCopied ? '已复制!' : '复制原始DDL' }}</q-tooltip>
                  </q-btn>
                </div>
                <pre class="sql-code"><code>{{ originalDdlSql || '暂无原始DDL数据' }}</code></pre>
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
                  <q-td :props="props" class="actions-cell">
                    <div class="row no-wrap items-center justify-center action-buttons">
                      <template v-if="editingRows.has(props.row.fieldName)">
                        <q-btn :size="isMobile ? 'xs' : 'sm'" flat round icon="check" color="positive"
                          @click="saveTableRowEdit(props.row.fieldName)" class="action-btn">
                          <q-tooltip>保存</q-tooltip>
                        </q-btn>
                        <q-btn :size="isMobile ? 'xs' : 'sm'" flat round icon="close" color="negative"
                          @click="cancelTableRowEdit(props.row.fieldName)" class="action-btn">
                          <q-tooltip>取消</q-tooltip>
                        </q-btn>
                      </template>
                      <template v-else>
                        <q-btn :size="isMobile ? 'xs' : 'sm'" flat round icon="edit" color="primary"
                          @click="startTableRowEdit(props.row)" class="action-btn">
                          <q-tooltip>编辑</q-tooltip>
                        </q-btn>
                        <q-btn :size="isMobile ? 'xs' : 'sm'" flat round icon="more_vert" color="grey-7"
                          class="action-btn">

                          <q-menu>
                            <q-list style="min-width: 140px">
                              <q-item clickable @click="handleDuplicateField(props.row)">
                                <q-item-section avatar>
                                  <q-icon name="content_copy" color="primary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>复制字段</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-separator />
                              <q-item clickable @click="handleDeleteField(props.row.fieldName)">
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

              <!-- 索引管理区域 -->
              <div class="q-mt-lg">
                <div class="row items-center justify-between q-mb-md">
                  <h6 class="q-my-none">
                    <q-icon name="speed" class="q-mr-sm" />
                    索引信息
                  </h6>
                  <q-btn size="sm" color="primary" icon="add" label="新建索引" @click="openIndexDialog()" unelevated />
                </div>

                <q-table :rows="editableIndexes" :columns="indexColumns" row-key="id" flat bordered
                  class="index-table q-mt-sm" :pagination="{ rowsPerPage: 10 }" no-data-label="暂无索引">
                  <template v-slot:body-cell-indexName="props">
                    <q-td :props="props">
                      <span class="text-weight-medium">{{ props.value }}</span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-indexType="props">
                    <q-td :props="props">
                      <q-chip :color="getIndexTypeColor(props.value)" text-color="white" size="sm">
                        {{ getIndexTypeLabel(props.value) }}
                      </q-chip>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-fields="props">
                    <q-td :props="props">
                      <div class="row q-gutter-xs">
                        <q-chip v-for="field in props.value" :key="field" size="sm" color="grey-3" text-color="grey-8"
                          icon="table_rows">
                          {{ field }}
                        </q-chip>
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props" class="actions-cell">
                      <div class="row no-wrap items-center justify-center action-buttons">
                        <q-btn :size="isMobile ? 'xs' : 'sm'" flat round icon="edit" color="primary"
                          @click="openIndexDialog(props.row)" class="action-btn">
                          <q-tooltip>编辑索引</q-tooltip>
                        </q-btn>
                        <q-btn :size="isMobile ? 'xs' : 'sm'" flat round icon="more_vert" color="grey-7"
                          class="action-btn">

                          <q-menu>
                            <q-list style="min-width: 120px">
                              <q-item clickable @click="handleDeleteIndex(props.row.id)">
                                <q-item-section avatar>
                                  <q-icon name="delete" color="negative" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-negative">删除索引</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-btn>
                      </div>
                    </q-td>
                  </template>
                </q-table>
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

  <!-- 索引编辑对话框 (桌面端) -->
  <q-dialog v-model="indexDialogOpen" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isNewIndex ? '新建索引' : '编辑索引' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <!-- 索引名称 -->
          <q-input v-if="editingIndex" v-model="editingIndex.indexName" label="索引名称" outlined dense
            :rules="[val => !!val || '索引名称不能为空']">
            <template v-slot:prepend>
              <q-icon name="speed" />
            </template>
          </q-input>

          <!-- 索引类型 -->
          <q-select v-if="editingIndex" v-model="editingIndex.indexType" :options="indexTypeOptions" label="索引类型"
            outlined dense emit-value map-options>
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <!-- 索引字段 -->
          <q-select v-if="editingIndex" v-model="editingIndex.fields" :options="availableFieldOptions" label="索引字段"
            outlined dense multiple use-chips emit-value map-options
            :rules="[val => val && val.length > 0 || '至少选择一个字段']">
            <template v-slot:prepend>
              <q-icon name="table_rows" />
            </template>
          </q-select>

          <!-- 索引注释 -->
          <q-input v-if="editingIndex" v-model="editingIndex.comment" label="索引注释（可选）" outlined dense type="textarea"
            rows="2">
            <template v-slot:prepend>
              <q-icon name="comment" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" v-close-popup />
        <q-btn color="primary" label="保存" @click="saveIndex"
          :disable="!editingIndex?.indexName || !editingIndex?.fields?.length" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 索引编辑对话框 (移动端) -->
  <q-dialog v-model="indexDrawerOpen" persistent position="bottom" class="mobile-index-dialog">
    <q-card class="mobile-index-card">
      <!-- 对话框头部 -->
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="speed" size="24px" class="q-mr-sm" color="primary" />
        <div class="text-h6 text-weight-medium">{{ isNewIndex ? '新建索引' : '编辑索引' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="indexDrawerOpen = false" />
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section>
        <div class="column q-gutter-md">
          <!-- 索引名称 -->
          <q-input v-if="editingIndex" v-model="editingIndex.indexName" label="索引名称" outlined
            :rules="[val => !!val || '索引名称不能为空']">
            <template v-slot:prepend>
              <q-icon name="speed" />
            </template>
          </q-input>

          <!-- 索引类型 -->
          <q-select v-if="editingIndex" v-model="editingIndex.indexType" :options="indexTypeOptions" label="索引类型"
            outlined emit-value map-options>
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <!-- 索引字段 -->
          <q-select v-if="editingIndex" v-model="editingIndex.fields" :options="availableFieldOptions" label="索引字段"
            outlined multiple use-chips emit-value map-options :rules="[val => val && val.length > 0 || '至少选择一个字段']">
            <template v-slot:prepend>
              <q-icon name="table_rows" />
            </template>
          </q-select>

          <!-- 索引注释 -->
          <q-input v-if="editingIndex" v-model="editingIndex.comment" label="索引注释（可选）" outlined type="textarea"
            rows="3">
            <template v-slot:prepend>
              <q-icon name="comment" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <!-- 对话框底部操作 -->
      <q-card-actions class="q-pt-none">
        <q-btn flat label="取消" @click="indexDrawerOpen = false" class="col" />
        <q-btn color="primary" label="保存" @click="saveIndex"
          :disable="!editingIndex?.indexName || !editingIndex?.fields?.length" class="col" unelevated />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getAi } from 'src/api/ai/ai'
import type { TableDesignResponseVO, TableField } from 'src/api/api.schemas'
// import draggable from 'vuedraggable' // 暂时注释，需要安装包

const $q = useQuasar()

// 移动端检测
const isMobile = computed(() => $q.screen.lt.md)

// 缓存相关常量
const CACHE_KEY = 'ai_table_design_cache'

// 扩展的字段接口，添加唯一ID和类型参数
interface EditableField extends TableField {
  id: string
  baseType?: string // 基础类型，如 VARCHAR, DECIMAL
  typeLength?: string // 类型长度，如 VARCHAR(50) 中的 50
  typeScale?: string // 类型精度，如 DECIMAL(10,2) 中的 2
  defaultValue?: string // 默认值
}

// 索引相关接口
interface TableIndex {
  id: string
  indexName: string
  indexType: 'PRIMARY' | 'UNIQUE' | 'NORMAL' | 'FULLTEXT'
  fields: string[] // 索引包含的字段名数组
  comment?: string // 索引注释（用于前端展示和编辑）
  description?: string // API返回的原始描述字段
}

interface EditableIndex extends TableIndex {
  isEditing?: boolean
}

// 响应式数据
const requirementDescription = ref('')
const isLoading = ref(false)
const activeTab = ref('structure')
const sqlCopied = ref(false)
const jsonCopied = ref(false)
const originalSqlCopied = ref(false)

// 接口返回的原始DDL
const originalDdlSql = ref('')

// 数据库类型选择
const databaseType = ref('postgresql') // 默认为 PostgreSQL

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

// 索引类型选项
const indexTypeOptions = [
  { label: '主键索引', value: 'PRIMARY' },
  { label: '唯一索引', value: 'UNIQUE' },
  { label: '普通索引', value: 'NORMAL' },
  { label: '全文索引', value: 'FULLTEXT' }
]



// 表格内联编辑数据
const editingRows = ref<Set<string>>(new Set())
const editingRowData = ref<Record<string, EditableField>>({})

// 索引相关数据
const editableIndexes = ref<EditableIndex[]>([])
const indexDialogOpen = ref(false)
const indexDrawerOpen = ref(false) // 移动端底部抽屉
const editingIndex = ref<EditableIndex | null>(null)
const isNewIndex = ref(false)



// 索引表格列定义
const indexColumns = [
  {
    name: 'indexName',
    label: '索引名称',
    align: 'left' as const,
    field: 'indexName',
    sortable: true
  },
  {
    name: 'indexType',
    label: '索引类型',
    align: 'center' as const,
    field: 'indexType'
  },
  {
    name: 'fields',
    label: '索引字段',
    align: 'left' as const,
    field: 'fields'
  },
  {
    name: 'comment',
    label: '注释',
    align: 'left' as const,
    field: 'comment'
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center' as const,
    field: 'actions'
  }
]

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

// 可用字段选项（用于索引字段选择）
const availableFieldOptions = computed(() => {
  if (!tableDesignResult.value?.fields) return []
  return tableDesignResult.value.fields.map(field => ({
    label: `${field.fieldName} (${field.fieldType})`,
    value: field.fieldName
  }))
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

  // 重新生成SQL DDL
  updateSqlDdl()

  // 保存到缓存
  saveCacheData()

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

// 更新SQL DDL的方法
const updateSqlDdl = () => {
  if (!tableDesignResult.value) return

  try {
    // 构建表结构数据
    const tableStructure = {
      tableName: editableTableName.value || tableDesignResult.value.tableName,
      tableDescription: editableTableDescription.value || tableDesignResult.value.tableDescription,
      fields: tableDesignResult.value.fields?.map(field => ({
        fieldName: field.fieldName || '',
        fieldType: field.fieldType || 'VARCHAR(50)',
        isPrimaryKey: field.isPrimaryKey || false,
        isNotNull: field.isNotNull || false,
        description: field.description || '',
        isAuditField: field.isAuditField || false
      })) || [],
      indexes: editableIndexes.value || []
    }

    // 生成新的SQL DDL
    const newDdlSql = generateDDLFromFields(tableStructure, databaseType.value)

    // 更新表设计结果中的SQL
    tableDesignResult.value.ddlSql = newDdlSql
    if (tableStructure.tableName) {
      tableDesignResult.value.tableName = tableStructure.tableName
    }
    if (tableStructure.tableDescription) {
      tableDesignResult.value.tableDescription = tableStructure.tableDescription
    }

    console.log('SQL DDL已更新')
  } catch (error) {
    console.error('更新SQL DDL失败:', error)
  }
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

  // 重新生成SQL DDL
  if (successCount > 0) {
    updateSqlDdl()
  }

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



// 处理复制字段
const handleDuplicateField = (row: TableField) => {
  console.log('handleDuplicateField called with row:', row)
  duplicateTableRow(row)
}

// 处理删除字段
const handleDeleteField = (fieldName: string) => {
  console.log('handleDeleteField called with fieldName:', fieldName)
  deleteTableRow(fieldName)
}

const deleteTableRow = (fieldName: string) => {
  console.log('deleteTableRow called with fieldName:', fieldName)
  $q.dialog({
    title: '确认删除',
    message: `确定要删除字段 "${fieldName}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    console.log('Delete confirmed for field:', fieldName)
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

    // 重新生成SQL DDL
    updateSqlDdl()

    // 保存到缓存
    saveCacheData()

    $q.notify({
      type: 'positive',
      message: '字段删除成功',
      position: 'top'
    })
  })
}

// 索引管理方法
const openIndexDialog = (index?: EditableIndex) => {
  if (index) {
    // 编辑现有索引
    isNewIndex.value = false
    editingIndex.value = { ...index }
  } else {
    // 新建索引
    isNewIndex.value = true
    editingIndex.value = {
      id: Date.now().toString(),
      indexName: '',
      indexType: 'NORMAL',
      fields: [],
      comment: ''
    }
  }

  // 根据设备类型选择对话框或抽屉
  if (isMobile.value) {
    indexDrawerOpen.value = true
  } else {
    indexDialogOpen.value = true
  }
}

const saveIndex = () => {
  if (!editingIndex.value?.indexName || !editingIndex.value?.fields?.length) {
    $q.notify({
      type: 'warning',
      message: '请填写索引名称和字段',
      position: 'top'
    })
    return
  }

  if (isNewIndex.value) {
    // 新建索引
    editableIndexes.value.push({ ...editingIndex.value })
    $q.notify({
      type: 'positive',
      message: '索引创建成功',
      position: 'top'
    })
  } else {
    // 编辑索引
    const index = editableIndexes.value.findIndex(idx => idx.id === editingIndex.value?.id)
    if (index !== -1) {
      editableIndexes.value[index] = { ...editingIndex.value }
      $q.notify({
        type: 'positive',
        message: '索引更新成功',
        position: 'top'
      })
    }
  }

  // 重新生成SQL
  updateSqlDdl()

  // 保存到缓存
  saveCacheData()

  indexDialogOpen.value = false
  indexDrawerOpen.value = false
}

// 处理删除索引
const handleDeleteIndex = (indexId: string) => {
  console.log('handleDeleteIndex called with indexId:', indexId)
  deleteIndex(indexId)
}

const deleteIndex = (indexId: string) => {
  console.log('deleteIndex called with indexId:', indexId)
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这个索引吗？',
    cancel: true,
    persistent: true
  }).onOk(() => {
    console.log('Delete confirmed for index:', indexId)
    const index = editableIndexes.value.findIndex(idx => idx.id === indexId)
    if (index !== -1) {
      editableIndexes.value.splice(index, 1)
      updateSqlDdl()

      // 保存到缓存
      saveCacheData()

      $q.notify({
        type: 'positive',
        message: '索引删除成功',
        position: 'top'
      })
    }
  })
}

const getIndexTypeColor = (type: string) => {
  switch (type) {
    case 'PRIMARY': return 'red'
    case 'UNIQUE': return 'orange'
    case 'NORMAL': return 'blue'
    case 'FULLTEXT': return 'green'
    default: return 'grey'
  }
}

const getIndexTypeLabel = (type: string) => {
  const option = indexTypeOptions.find(opt => opt.value === type)
  return option?.label || type
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

  // 重新生成SQL DDL
  updateSqlDdl()

  $q.notify({
    type: 'positive',
    message: '字段复制成功',
    position: 'top'
  })
}

// 转换API返回的索引数据为前端期望的格式
const convertToEditableIndexes = (indexes: any[] = []) => {
  return indexes.map((index, idx) => {
    const editableIndex: EditableIndex = {
      id: `index_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
      indexName: index.indexName || '',
      indexType: convertIndexType(index.indexType || 'BTREE'),
      fields: index.fieldName ? [index.fieldName] : [],
      comment: index.comment || index.description || '', // 同时支持comment和description字段
      description: index.description || '' // 保留原始描述字段
    }
    return editableIndex
  })
}

// 转换索引类型
const convertIndexType = (apiIndexType: string): 'PRIMARY' | 'UNIQUE' | 'NORMAL' | 'FULLTEXT' => {
  switch (apiIndexType.toUpperCase()) {
    case 'BTREE':
    case 'HASH':
    case 'INDEX':
      return 'NORMAL'
    case 'UNIQUE':
      return 'UNIQUE'
    case 'PRIMARY':
      return 'PRIMARY'
    case 'FULLTEXT':
      return 'FULLTEXT'
    default:
      return 'NORMAL'
  }
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


const generateDDLFromFields = (tableStructure: any, dbType: string = 'mysql') => {
  const { tableName, tableDescription, fields, indexes = [] } = tableStructure

  if (dbType === 'postgresql') {
    return generatePostgreSQLDDL(tableStructure)
  } else {
    return generateMySQLDDL(tableStructure)
  }
}

const generateMySQLDDL = (tableStructure: any) => {
  const { tableName, tableDescription, fields, indexes = [] } = tableStructure

  // 表注释
  let ddl = `-- ${tableDescription || tableName + '表'}\n`

  // 表定义
  ddl += `CREATE TABLE ${tableName} (\n`

  const fieldLines = fields.map((field: any) => {
    let line = `    ${field.fieldName} ${field.fieldType}`

    if (field.isPrimaryKey) {
      line += ' PRIMARY KEY'
    }

    if (field.isNotNull && !field.isPrimaryKey) {
      line += ' NOT NULL'
    }

    return line
  })

  ddl += fieldLines.join(',\n')
  ddl += `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='${tableDescription || tableName + '表'}';\n\n`

  // 字段注释（分离的ALTER语句）
  const commentStatements = fields
    .filter((field: any) => field.description && field.description.trim())
    .map((field: any) => {
      return `ALTER TABLE ${tableName} MODIFY COLUMN ${field.fieldName} ${field.fieldType}${field.isPrimaryKey ? ' PRIMARY KEY' : ''}${field.isNotNull && !field.isPrimaryKey ? ' NOT NULL' : ''} COMMENT '${field.description}';`
    })

  if (commentStatements.length > 0) {
    ddl += '-- 字段注释\n'
    ddl += commentStatements.join('\n')
    ddl += '\n\n'
  }

  // 索引SQL（分离的CREATE INDEX语句）
  const indexStatements = indexes
    .filter((index: any) => index.indexName && index.fields && index.fields.length > 0)
    .map((index: any) => {
      const fields = index.fields.join(', ')
      let indexSql = ''

      switch (index.indexType) {
        case 'PRIMARY':
          // 主键索引在表定义中已经处理，这里跳过
          return null
        case 'UNIQUE':
          indexSql = `CREATE UNIQUE INDEX ${index.indexName} ON ${tableName} (${fields});`
          break
        case 'FULLTEXT':
          indexSql = `CREATE FULLTEXT INDEX ${index.indexName} ON ${tableName} (${fields});`
          break
        case 'NORMAL':
        default:
          indexSql = `CREATE INDEX ${index.indexName} ON ${tableName} (${fields});`
          break
      }

      // 添加索引注释
      if (index.comment && index.comment.trim()) {
        indexSql += ` -- ${index.comment}`
      }

      return indexSql
    })
    .filter(Boolean) // 过滤掉null值

  if (indexStatements.length > 0) {
    ddl += '-- 索引\n'
    ddl += indexStatements.join('\n')
  }

  return ddl
}

const generatePostgreSQLDDL = (tableStructure: any) => {
  const { tableName, tableDescription, fields, indexes = [] } = tableStructure

  // 1. 创建表结构
  let ddl = `-- 1. 创建表结构\n`
  ddl += `CREATE TABLE ${tableName} (\n`

  const fieldLines = fields.map((field: any) => {
    let line = `    ${field.fieldName} ${field.fieldType}`

    if (field.isPrimaryKey) {
      line += ' PRIMARY KEY'
    }

    if (field.isNotNull && !field.isPrimaryKey) {
      line += ' NOT NULL'
    }

    return line
  })

  ddl += fieldLines.join(',\n')
  ddl += `\n);\n\n`

  // 2. 添加表和字段注释
  ddl += `-- 2. 添加表和字段注释\n`
  ddl += `COMMENT ON TABLE ${tableName} IS '${tableDescription || tableName + '表'}';\n`

  const commentStatements = fields
    .filter((field: any) => field.description && field.description.trim())
    .map((field: any) => {
      return `COMMENT ON COLUMN ${tableName}.${field.fieldName} IS '${field.description}';`
    })

  if (commentStatements.length > 0) {
    ddl += commentStatements.join('\n')
    ddl += '\n\n'
  }

  // 3. 创建索引
  const indexStatements = indexes
    .filter((index: any) => index.indexName && index.fields && index.fields.length > 0)
    .map((index: any) => {
      const fields = index.fields.join(', ')
      let indexSql = ''

      switch (index.indexType) {
        case 'PRIMARY':
          // 主键索引在表定义中已经处理，这里跳过
          return null
        case 'UNIQUE':
          indexSql = `CREATE UNIQUE INDEX ${index.indexName} ON ${tableName}(${fields});`
          break
        case 'NORMAL':
        default:
          indexSql = `CREATE INDEX ${index.indexName} ON ${tableName}(${fields});`
          break
      }

      return indexSql
    })
    .filter(Boolean) // 过滤掉null值

  if (indexStatements.length > 0) {
    ddl += `-- 3. 创建索引\n`
    ddl += indexStatements.join('\n')
    ddl += '\n\n'
  }

  // 4. 添加索引注释
  const indexCommentStatements = indexes
    .filter((index: any) => index.indexName && index.fields && index.fields.length > 0 && index.comment && index.comment.trim())
    .map((index: any) => {
      return `COMMENT ON INDEX ${index.indexName} IS '${index.comment}';`
    })

  if (indexCommentStatements.length > 0) {
    ddl += `-- 4. 添加索引注释\n`
    ddl += indexCommentStatements.join('\n')
  }

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

  // 清除之前的缓存数据
  clearCacheData()

  isLoading.value = true
  try {
    const aiApi = getAi()
    const response = await aiApi.getTableDesign({
      prompt: requirementDescription.value,
      model: 'deepseek'
    })

    // 修复API响应结构问题
    if (response.data?.isOk && response.data?.okData) {
      // 保存接口返回的原始DDL
      originalDdlSql.value = response.data.okData.ddlSql || ''

      // 转换为可编辑字段并填充编辑器
      editableFields.value = convertToEditableFields(response.data.okData.fields)
      editableTableName.value = response.data.okData.tableName || 'new_table'
      editableTableDescription.value = response.data.okData.tableDescription || ''

      // 转换索引数据
      console.log('原始索引数据:', response.data.okData.indexes)
      editableIndexes.value = convertToEditableIndexes(response.data.okData.indexes || [])
      console.log('转换后的索引数据:', editableIndexes.value)
      console.log('索引数量:', editableIndexes.value.length)

      // 详细转换验证
      if (editableIndexes.value.length > 0) {
        console.log('索引转换验证:')
        editableIndexes.value.forEach((idx, i) => {
          console.log(`索引 ${i + 1}:`, {
            id: idx.id,
            name: idx.indexName,
            type: idx.indexType,
            fields: idx.fields,
            comment: idx.comment
          })
        })
      }

      // 根据表结构动态生成DDL，而不是使用API返回的DDL
      const tableStructure = {
        tableName: editableTableName.value,
        tableDescription: editableTableDescription.value,
        fields: response.data.okData.fields || [],
        indexes: editableIndexes.value || []
      }

      const generatedDDL = generateDDLFromFields(tableStructure, databaseType.value)

      // 构建完整的表设计结果对象
      tableDesignResult.value = {
        inputPrompt: requirementDescription.value,
        tableName: editableTableName.value,
        tableDescription: editableTableDescription.value,
        ddlSql: generatedDDL, // 使用动态生成的DDL
        fields: response.data.okData.fields || [],
        indexes: editableIndexes.value || [],
        rawResponse: JSON.stringify(response.data.okData),
        durationMs: response.data.okData.durationMs || 0,
        durationSeconds: response.data.okData.durationSeconds || 0,
        model: response.data.okData.model || 'deepseek'
      }

      activeTab.value = 'structure' // 默认显示表结构详情页签

      // 保存到缓存
      saveCacheData()

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

const copyOriginalSQL = async () => {
  if (!originalDdlSql.value) return

  try {
    await navigator.clipboard.writeText(originalDdlSql.value)
    originalSqlCopied.value = true
    $q.notify({
      type: 'positive',
      message: '原始DDL已复制到剪贴板',
      position: 'top'
    })
    setTimeout(() => {
      originalSqlCopied.value = false
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

// 数据库类型变化处理
const onDatabaseTypeChange = () => {
  // 重新生成DDL
  updateSqlDdl()
  $q.notify({
    type: 'info',
    message: `已切换到 ${databaseType.value === 'mysql' ? 'MySQL' : 'PostgreSQL'} 语法`,
    position: 'top'
  })
}

// 缓存管理方法
const saveCacheData = () => {
  try {
    const cacheData = {
      requirementDescription: requirementDescription.value,
      tableDesignResult: tableDesignResult.value,
      editableFields: editableFields.value,
      editableTableName: editableTableName.value,
      editableTableDescription: editableTableDescription.value,
      editableIndexes: editableIndexes.value,
      originalDdlSql: originalDdlSql.value,
      databaseType: databaseType.value,
      activeTab: activeTab.value,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    console.log('数据已缓存到浏览器')
  } catch (error) {
    console.error('缓存数据失败:', error)
  }
}

const loadCacheData = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY)
    if (cachedData) {
      const data = JSON.parse(cachedData)

      // 检查缓存是否过期（7天）
      const isExpired = Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY)
        return false
      }

      // 恢复数据
      requirementDescription.value = data.requirementDescription || ''
      tableDesignResult.value = data.tableDesignResult || null
      editableFields.value = data.editableFields || []
      editableTableName.value = data.editableTableName || ''
      editableTableDescription.value = data.editableTableDescription || ''
      editableIndexes.value = data.editableIndexes || []
      originalDdlSql.value = data.originalDdlSql || ''
      databaseType.value = data.databaseType || 'postgresql'
      activeTab.value = data.activeTab || 'structure'

      console.log('从浏览器恢复缓存数据')
      $q.notify({
        type: 'info',
        message: '已恢复上次的表设计数据',
        position: 'top'
      })
      return true
    }
  } catch (error) {
    console.error('恢复缓存数据失败:', error)
    localStorage.removeItem(CACHE_KEY)
  }
  return false
}

const clearCacheData = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
    console.log('已清除缓存数据')
  } catch (error) {
    console.error('清除缓存数据失败:', error)
  }
}

// 页面挂载时恢复缓存数据
onMounted(() => {
  loadCacheData()
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

    .database-type-select {
      :deep(.q-field__control) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }

      :deep(.q-field__native) {
        color: #cccccc;
        font-size: 12px;
      }

      :deep(.q-icon) {
        color: #cccccc;
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

  // 移动端表格样式修复
  .field-table {
    :deep(.q-table thead th) {
      background: rgba(var(--q-primary-rgb, 148, 190, 206), 0.1) !important;
      color: var(--q-text-color, $text-color) !important;
      border-bottom: 1px solid var(--q-border-color, $border-color);
    }

    // 移动端操作按钮样式优化
    :deep(.q-table tbody td) {
      padding: 6px 8px;
    }

    // 操作列特殊处理
    .actions-cell {
      width: 80px !important;
      min-width: 80px !important;
      padding: 4px !important;

      .action-buttons {
        gap: 2px !important;

        .action-btn {
          min-width: 24px !important;
          min-height: 24px !important;
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          margin: 0 1px !important;

          :deep(.q-btn__content) {
            font-size: 12px !important;
          }

          :deep(.q-icon) {
            font-size: 14px !important;
          }
        }
      }
    }
  }

  // 索引表格样式
  .index-table {
    :deep(.q-table__top) {
      padding: 0;
    }

    :deep(.q-table tbody td) {
      padding: 6px 8px;
    }

    :deep(.q-table thead th) {
      padding: 12px 12px;
      font-weight: 600;
      background: rgba(var(--q-primary-rgb, 148, 190, 206), 0.1) !important;
      color: var(--q-text-color, $text-color) !important;
      border-bottom: 1px solid var(--q-border-color, $border-color);
    }

    // 索引表格操作列样式
    .actions-cell {
      width: 80px !important;
      min-width: 80px !important;
      padding: 4px !important;

      .action-buttons {
        gap: 2px !important;

        .action-btn {
          min-width: 24px !important;
          min-height: 24px !important;
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          margin: 0 1px !important;

          :deep(.q-btn__content) {
            font-size: 12px !important;
          }

          :deep(.q-icon) {
            font-size: 14px !important;
          }
        }
      }
    }

    .q-chip {
      margin: 2px;
    }
  }
}

// 移动端对话框样式
.mobile-index-dialog {
  :deep(.q-dialog__inner) {
    padding: 0;
    align-items: flex-end;
  }

  .mobile-index-card {
    width: 100%;
    max-width: 100%;
    background: var(--q-card-bg, $card-bg);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    margin: 0;

    .text-h6 {
      color: var(--q-text-color, $text-color);
    }

    .q-btn {
      font-weight: 500;
    }

    .q-card-actions {
      padding: 16px;
      gap: 12px;
    }
  }
}
</style>
