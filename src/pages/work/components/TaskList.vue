<template>
  <section id="tasks" class="q-mb-xl glass rounded-borders-xl">
    <div class="q-pa-lg">
      <!-- 标题栏优化 -->
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="task_alt" size="28px" class="q-mr-sm" />
          任务列表
        </h2>
        <q-btn color="primary" size="md" icon="add" label="新建任务" @click="openNewTaskDialog" class="q-px-md" unelevated
          rounded />
      </div>

      <!-- 过滤查询表头 - 使用卡片样式 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="filter_list" class="q-mr-sm" />
            筛选条件
          </div>

          <!-- 常规筛选区域 -->
          <div class="row q-col-gutter-md items-end">
            <!-- 需求编号搜索 -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="filterParams.requirementId" label="需求编号" outlined dense clearable placeholder="请输入需求编号"
                class="light-field" @update:model-value="handleFilterChange">
                <template v-slot:prepend>
                  <q-icon name="tag" size="16px" />
                </template>
              </q-input>
            </div>

            <!-- 需求名称搜索 -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="filterParams.requirementName" label="需求名称" outlined dense clearable
                placeholder="请输入需求名称" class="light-field" @update:model-value="handleFilterChange">
                <template v-slot:prepend>
                  <q-icon name="description" size="16px" />
                </template>
              </q-input>
            </div>

            <!-- 系统分类选择 -->
            <div class="col-12 col-sm-6 col-md-2">
              <q-select v-model="filterParams.systemCategory" :options="systemCategoryOptions" label="系统分类" outlined
                dense clearable class="light-field" @update:model-value="handleFilterChange">
                <template v-slot:prepend>
                  <q-icon name="category" size="16px" />
                </template>
              </q-select>
            </div>

            <!-- 操作按钮 -->
            <div class="col-12 col-sm-6 col-md-4">
              <div class="row q-gutter-sm">
                <q-btn color="primary" icon="search" label="搜索" dense unelevated @click="handleSearch" />
                <q-btn color="secondary" icon="refresh" label="重置" dense unelevated @click="handleReset" />
                <q-btn color="accent" icon="filter_list" label="高级筛选" dense unelevated
                  @click="showAdvancedFilter = !showAdvancedFilter" />
              </div>
            </div>
          </div>

          <!-- 高级筛选区域 -->
          <div v-show="showAdvancedFilter" class="advanced-filter q-mt-md">
            <q-separator class="q-mb-md" />
            <div class="row q-col-gutter-md items-end">
              <!-- 需求文档搜索 -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filterParams.relatedRequirementDocs" label="需求文档" outlined dense clearable
                  placeholder="请输入需求文档名称" class="light-field" @update:model-value="handleFilterChange">
                  <template v-slot:prepend>
                    <q-icon name="article" size="16px" />
                  </template>
                </q-input>
              </div>

              <!-- 设计文档搜索 -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filterParams.relatedDesignDocs" label="设计文档" outlined dense clearable
                  placeholder="请输入设计文档名称" class="light-field" @update:model-value="handleFilterChange">
                  <template v-slot:prepend>
                    <q-icon name="design_services" size="16px" />
                  </template>
                </q-input>
              </div>

              <!-- 创建时间范围 -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filterParams.createdAtRange" label="创建时间" outlined dense readonly placeholder="选择时间范围"
                  class="light-field" @click="showDatePicker = true">
                  <template v-slot:prepend>
                    <q-icon name="event" size="16px" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="calendar_today" size="16px" class="cursor-pointer" />
                  </template>
                </q-input>
              </div>

              <!-- 状态筛选 -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-select v-model="filterParams.status" :options="statusOptions" label="状态" outlined dense clearable
                  class="light-field" @update:model-value="handleFilterChange">
                  <template v-slot:prepend>
                    <q-icon name="flag" size="16px" />
                  </template>
                </q-select>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 任务列表 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-md">
          <!-- 高效数据展示区域 -->
          <div class="data-grid">
            <!-- 表头 -->
            <div class="data-header">
              <div class="data-cell header-cell">需求名称</div>
              <div class="data-cell header-cell">需求编号</div>
              <div class="data-cell header-cell">系统分类</div>
              <div class="data-cell header-cell">关联文档</div>
              <div class="data-cell header-cell">操作</div>
            </div>

            <!-- 数据行 -->
            <div v-for="task in allTasks" :key="task.id || `task-${Math.random()}`" class="data-row">
              <!-- 需求名称列 -->
              <div class="data-cell requirement-name">
                <div class="requirement-name-content" @click="copyToClipboard(task.requirementName || '')"
                  title="点击复制需求名称">
                  {{ task.requirementName || '未命名需求' }}
                </div>
              </div>

              <!-- 需求编号列 -->
              <div class="data-cell requirement-id">
                <div class="requirement-id-content" @click="copyToClipboard(task.requirementId || '')" title="点击复制需求编号">
                  #{{ task.requirementId || '无编号' }}
                </div>
              </div>

              <!-- 系统分类列 -->
              <div class="data-cell system-category">
                <div class="system-category-text">
                  {{ task.systemCategory === 'callin' ? '呼入' : task.systemCategory === 'callout' ? '呼出' : '其他' }}
                </div>
              </div>

              <!-- 关联文档列 -->
              <div class="data-cell documents">
                <div class="doc-tags">
                  <q-chip v-if="task.relatedRequirementDocs" dense size="sm" color="info" text-color="white"
                    label="需求文档" clickable @click="handleRequirementClick(task, task.relatedRequirementDocs)"
                    class="doc-chip" />
                  <q-chip v-if="task.relatedDesignDocs" dense size="sm" color="accent" text-color="white" label="设计文档"
                    clickable @click="handleRequirementClick(task, task.relatedDesignDocs)" class="doc-chip" />
                </div>
              </div>

              <!-- 操作列 -->
              <div class="data-cell actions">
                <div class="action-buttons">
                  <q-btn flat round dense color="primary" icon="call_split"
                    @click="handleSystemClick(task.systemCategory || 'other', task.requirementId || '')" title="Git分支"
                    class="action-btn" />
                  <q-btn flat round dense color="secondary" icon="more_vert" @click="showTaskMenu(task)" title="更多操作"
                    class="action-btn" />
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="allTasks.length === 0" class="empty-state">
              <q-icon name="task_alt" size="64px" color="grey-5" />
              <div class="text-h6 text-grey-6 q-mt-md">暂无任务数据</div>
              <div class="text-body2 text-grey-5">点击"新建任务"开始创建您的第一个任务</div>
            </div>
          </div>

          <!-- 紧凑型分页组件 -->
          <div v-if="allTasks.length > 0" class="q-mt-lg">
            <div class="compact-pagination">
              <!-- 左侧：分页信息 -->
              <div class="pagination-summary">
                <span class="text-body2 text-grey-7">
                  共 <span class="text-weight-medium text-primary">{{ currentPagination.total }}</span> 条
                </span>
              </div>

              <!-- 中间：分页控件 -->
              <div class="pagination-controls">
                <q-pagination v-model="currentPagination.current" :max="currentPagination.pages || 1" :max-pages="5"
                  boundary-numbers direction-links @update:model-value="handlePageChange" color="primary"
                  active-color="accent" size="sm" />
              </div>

              <!-- 右侧：每页条数选择 -->
              <div class="page-size-control">
                <q-select v-model="pageSize" :options="pageSizeOptions" dense borderless
                  @update:model-value="handlePageSizeChange" class="compact-page-size-select">
                  <template v-slot:prepend>
                    <span class="text-body2 text-grey-7">每页</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body2 text-grey-7">条</span>
                  </template>
                </q-select>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </section>

  <section id="nameByAI" class="q-mb-xl glass rounded-borders-xl">
    <div class="q-pa-lg">
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="auto_awesome" size="28px" class="q-mr-sm" />
          AI变量命名
        </h2>
        <q-btn color="primary" size="md" icon="psychology" label="智能生成" @click="getNamingSuggestions"
          :loading="isLoading" :disable="!chineseInput.trim()" class="q-px-md" unelevated rounded />
      </div>

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
          </div>

          <div class="suggestions-grid">
            <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-card"
              @click="copySuggestion(suggestion.name)">
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

      <!-- 智能检测示例 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="lightbulb_outline" class="q-mr-sm" />
            智能检测示例
          </div>
          <div class="examples-grid">
            <div v-for="(example, index) in examples" :key="index" class="example-card cursor-pointer"
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


  <!-- 将独立的NewTaskDialog内容直接集成到这里 -->
  <q-dialog v-model="showNewTaskDialog">
    <q-card style="min-width: 500px; background: white;">
      <q-card-section class="bg-grey-2 q-pb-sm border-bottom">
        <div class="text-h6 text-cursor-text">新建任务</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-mt-sm q-mr-sm" color="grey-7" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- 任务类型和编号 -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-5">
            <q-select v-model="newTask.type" :options="taskTypes" label="任务类型" outlined dense class="light-field" />
          </div>
          <div class="col-7">
            <q-input v-model="newTask.id" label="任务编号" outlined dense class="light-field" />
          </div>
        </div>

        <!-- 任务标题 -->
        <q-input v-model="newTask.title" label="任务标题" outlined dense class="light-field q-mb-md"
          placeholder="请输入任务标题" />

        <!-- 关联文档 -->
        <div class="q-mb-md">
          <div class="row justify-between items-center q-mb-xs">
            <div class="text-subtitle2 text-cursor-text">关联文档</div>
            <div class="text-caption text-grey-7">点击标签上传相关文档</div>
          </div>

          <div class="row q-gutter-sm q-mb-md">
            <div class="doc-label doc-requirement cursor-pointer" :class="{ 'doc-active': hasRequirementDocs }"
              @click="triggerFileUpload('requirement')">
              需求
            </div>

            <div class="doc-label doc-design cursor-pointer" :class="{ 'doc-active': hasDesignDocs }"
              @click="triggerFileUpload('design')">
              设计
            </div>
          </div>

          <!-- 显示已上传的文档列表 -->
          <div class="q-mt-md">
            <!-- 需求文档列表 -->
            <div v-if="newTask.docsList.requirement.length > 0">
              <div class="text-caption text-weight-medium q-mb-xs">需求文档:</div>
              <div class="q-gutter-y-sm">
                <div v-for="(doc, index) in newTask.docsList.requirement" :key="index"
                  class="uploaded-doc requirement-doc">
                  <q-icon name="description" size="18px" class="q-mr-xs" />
                  <span class="ellipsis">{{ doc }}</span>
                  <q-btn flat round dense icon="close" size="xs" @click="removeDoc('requirement', index)"
                    class="q-ml-xs" />
                </div>
              </div>
            </div>

            <!-- 设计文档列表 -->
            <div v-if="newTask.docsList.design.length > 0" class="q-mt-sm">
              <div class="text-caption text-weight-medium q-mb-xs">设计文档:</div>
              <div class="q-gutter-y-sm">
                <div v-for="(doc, index) in newTask.docsList.design" :key="index" class="uploaded-doc design-doc">
                  <q-icon name="description" size="18px" class="q-mr-xs" />
                  <span class="ellipsis">{{ doc }}</span>
                  <q-btn flat round dense icon="close" size="xs" @click="removeDoc('design', index)" class="q-ml-xs" />
                </div>
              </div>
            </div>
          </div>

          <!-- 隐藏的文件上传输入框 -->
          <input type="file" ref="requirementFileInput" @change="handleFileUpload('requirement', $event)"
            style="display: none" />
          <input type="file" ref="designFileInput" @change="handleFileUpload('design', $event)" style="display: none" />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn flat label="创建" color="blue-6" @click="createTask" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getDevTask } from 'src/api/dev-task/dev-task'
import type { DevTask, QueryDevTaskInParam, IPageDevTaskVO } from 'src/api/api.schemas'

// 导入AI API
import { getAi } from 'src/api/ai/ai'
import type { NamingSuggestion, VariableNamingResponseVO } from 'src/api/api.schemas'

// 初始化
const $q = useQuasar()
const devTaskApi = getDevTask()

// 控制新建任务对话框的显示
const showNewTaskDialog = ref(false)

// 分页大小相关常量和函数
const PAGE_SIZE_CACHE_KEY = 'task-list-page-size'
const DEFAULT_PAGE_SIZE = 10

// 从本地存储获取分页大小，如果没有则使用默认值
const getStoredPageSize = (): number => {
  try {
    const stored = localStorage.getItem(PAGE_SIZE_CACHE_KEY)
    return stored ? parseInt(stored, 10) : DEFAULT_PAGE_SIZE
  } catch {
    return DEFAULT_PAGE_SIZE
  }
}

// 保存分页大小到本地存储
const savePageSize = (size: number): void => {
  try {
    localStorage.setItem(PAGE_SIZE_CACHE_KEY, size.toString())
  } catch (error) {
    console.warn('无法保存分页大小到本地存储:', error)
  }
}

// 任务数据
const incomingTasks = ref<DevTask[]>([])
const outgoingTasks = ref<DevTask[]>([])

// 合并所有任务的计算属性
const allTasks = computed(() => {
  return [...incomingTasks.value, ...outgoingTasks.value]
})

// 分页数据
const incomingPagination = ref<IPageDevTaskVO>({
  current: 1,
  size: getStoredPageSize(),
  total: 0,
  pages: 0
})

const outgoingPagination = ref<IPageDevTaskVO>({
  current: 1,
  size: getStoredPageSize(),
  total: 0,
  pages: 0
})

// 当前分页状态（用于显示）
const currentPagination = computed(() => {
  const total = (incomingPagination.value.total || 0) + (outgoingPagination.value.total || 0)
  const maxPages = Math.max(incomingPagination.value.pages || 0, outgoingPagination.value.pages || 0)

  return {
    current: Math.max(incomingPagination.value.current || 1, outgoingPagination.value.current || 1),
    size: pageSize.value, // 使用动态分页大小
    total,
    pages: maxPages
  }
})

// 过滤参数 - 修复类型问题
const filterParams = ref({
  requirementId: '',
  requirementName: '',
  systemCategory: null as { label: string; value: string } | string | null, // 支持对象和字符串类型
  relatedRequirementDocs: '',
  relatedDesignDocs: '',
  createdAtRange: '',
  status: ''
})

// 控制高级筛选显示
const showAdvancedFilter = ref(false)
const showDatePicker = ref(false)

// 分页大小选项
const pageSizeOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

// 当前分页大小
const pageSize = ref(getStoredPageSize())

// 统一的搜索函数
const fetchTasks = async (): Promise<void> => {
  try {
    // 严格按照API接口定义构建参数
    const params: QueryDevTaskInParam = {
      pageParam: {
        current: incomingPagination.value.current || 1,
        size: pageSize.value
      }
    }

    // 只有当过滤条件有值时才添加到参数中，避免传递空字符串
    if (filterParams.value.requirementId && filterParams.value.requirementId.trim()) {
      params.requirementId = filterParams.value.requirementId.trim()
    }

    if (filterParams.value.requirementName && filterParams.value.requirementName.trim()) {
      params.requirementName = filterParams.value.requirementName.trim()
    }

    // 系统分类需要传递实际的值，而不是对象
    if (filterParams.value.systemCategory) {
      // 如果systemCategory是对象，取其value值；如果是字符串，直接使用
      const categoryValue = typeof filterParams.value.systemCategory === 'object'
        ? filterParams.value.systemCategory.value
        : filterParams.value.systemCategory
      params.systemCategory = categoryValue
    }

    if (filterParams.value.relatedRequirementDocs && filterParams.value.relatedRequirementDocs.trim()) {
      params.relatedRequirementDocs = filterParams.value.relatedRequirementDocs.trim()
    }

    if (filterParams.value.relatedDesignDocs && filterParams.value.relatedDesignDocs.trim()) {
      params.relatedDesignDocs = filterParams.value.relatedDesignDocs.trim()
    }

    console.log('当前过滤条件:', filterParams.value)
    console.log('发送搜索请求，参数:', params)
    console.log('系统分类参数值:', params.systemCategory)

    const response = await devTaskApi.queryDevTask(params)
    console.log('搜索响应:', response.data)

    if (response.data?.isOk && response.data.okData) {
      const records = response.data.okData.records || []
      const paginationData = {
        current: response.data.okData.current || 1,
        size: response.data.okData.size || 10,
        total: response.data.okData.total || 0,
        pages: response.data.okData.pages || 0
      }

      // 将DevTaskVO转换为DevTask格式以保持兼容性
      const convertedRecords = records.map(record => ({
        id: undefined, // DevTaskVO没有id字段
        requirementId: record.requirementId,
        requirementName: record.requirementName,
        systemCategory: record.systemCategory,
        relatedRequirementDocs: record.relatedRequirementDocs,
        relatedDesignDocs: record.relatedDesignDocs,
        userId: record.userId
      }))

      // 获取实际的系统分类值
      const actualSystemCategory = typeof filterParams.value.systemCategory === 'object'
        ? filterParams.value.systemCategory?.value
        : filterParams.value.systemCategory

      // 根据选择的系统分类来处理数据
      if (actualSystemCategory === 'callin') {
        // 只显示呼入任务
        incomingTasks.value = convertedRecords
        incomingPagination.value = paginationData
        outgoingTasks.value = []
        outgoingPagination.value = { current: 1, size: pageSize.value, total: 0, pages: 0 }
      } else if (actualSystemCategory === 'callout') {
        // 只显示呼出任务
        outgoingTasks.value = convertedRecords
        outgoingPagination.value = paginationData
        incomingTasks.value = []
        incomingPagination.value = { current: 1, size: pageSize.value, total: 0, pages: 0 }
      } else {
        // 没有选择系统分类，显示所有任务
        incomingTasks.value = convertedRecords
        incomingPagination.value = paginationData
        outgoingTasks.value = []
        outgoingPagination.value = { current: 1, size: pageSize.value, total: 0, pages: 0 }
      }
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    $q.notify({
      message: '搜索任务失败，请检查网络连接或稍后重试',
      color: 'negative',
      position: 'top',
      timeout: 2000
    })
  }
}

// 搜索处理 - 统一搜索逻辑
const handleSearch = () => {
  console.log('开始搜索，当前过滤条件:', filterParams.value)

  // 重置分页到第一页
  incomingPagination.value.current = 1
  outgoingPagination.value.current = 1

  // 执行搜索
  fetchTasks()
}

// 重置过滤条件
const handleReset = () => {
  console.log('重置搜索条件')

  filterParams.value = {
    requirementId: '',
    requirementName: '',
    systemCategory: null,
    relatedRequirementDocs: '',
    relatedDesignDocs: '',
    createdAtRange: '',
    status: ''
  }

  // 重置分页
  incomingPagination.value.current = 1
  outgoingPagination.value.current = 1

  // 重置后查询所有任务
  fetchTasks()

  $q.notify({
    message: '搜索条件已重置',
    color: 'info',
    position: 'top',
    timeout: 1000
  })
}

// 处理过滤条件变化 - 只重置分页，不自动查询
const handleFilterChange = () => {
  // 只重置分页到第一页，不自动查询
  incomingPagination.value.current = 1
  outgoingPagination.value.current = 1
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchTasks()
})

// 添加 requirementBasePath 常量
const requirementBasePath = '/Users/maohuaping/中科软/需求文档/'

// 定义任务标签接口
interface TaskTag {
  label: string;
  color: string;
  textColor: string;
  icon?: string;
  clickable?: boolean;
  onClick?: () => void | Promise<void>;
  index?: number;
}

// 确保SystemType类型定义正确
type SystemType = 'callin' | 'callout' | 'other'

// 修改getTaskTags函数添加返回类型
const getTaskTags = (task: DevTask): TaskTag[] => {
  const tags: TaskTag[] = []

  // Git分支标签 - 添加图标
  if (task.requirementId) {
    tags.push({
      label: 'Git分支',
      color: 'blue-2',
      textColor: 'blue-8',
      icon: 'call_split',
      clickable: true,
      onClick: () => handleSystemClick((task.systemCategory as SystemType) || 'other', task.requirementId || '')
    })
  }

  // 需求文档处理
  if (task.relatedRequirementDocs) {
    let reqDocs: string[] = [];
    try {
      // 尝试多种分隔方式，确保能正确分割
      if (task.relatedRequirementDocs.includes(';')) {
        reqDocs = task.relatedRequirementDocs.split(';');
      } else if (task.relatedRequirementDocs.includes(',')) {
        reqDocs = task.relatedRequirementDocs.split(',');
      } else {
        reqDocs = [task.relatedRequirementDocs];
      }

      // 过滤空值
      reqDocs = reqDocs.filter(doc => doc && doc.trim() !== '');
    } catch {
      reqDocs = [task.relatedRequirementDocs];
    }

    // 判断文档数量并创建标签
    if (reqDocs.length === 1) {
      // 单个文档
      tags.push({
        label: '需求文档',
        color: 'green-2',
        textColor: 'green-8',
        icon: 'description',
        clickable: true,
        onClick: () => void handleRequirementClick(task, reqDocs[0]?.trim() || '')
      });
    } else if (reqDocs.length > 1) {
      // 多个文档 - 为每个创建标签
      reqDocs.forEach((doc, index) => {
        const trimmedDoc = doc.trim();
        if (trimmedDoc) {
          tags.push({
            label: `需求文档v${index + 1}`,
            color: 'green-2',
            textColor: 'green-8',
            icon: 'description',
            clickable: true,
            index: index,
            onClick: () => void handleRequirementClick(task, trimmedDoc)
          });
        }
      });
    }
  }

  // 同样处理设计文档
  if (task.relatedDesignDocs) {
    let designDocs: string[] = [];
    try {
      if (task.relatedDesignDocs.includes(';')) {
        designDocs = task.relatedDesignDocs.split(';');
      } else if (task.relatedDesignDocs.includes(',')) {
        designDocs = task.relatedDesignDocs.split(',');
      } else {
        designDocs = [task.relatedDesignDocs];
      }

      designDocs = designDocs.filter(doc => doc && doc.trim() !== '');
    } catch {
      designDocs = [task.relatedDesignDocs];
    }

    if (designDocs.length === 1) {
      tags.push({
        label: '设计文档',
        color: 'purple-2',
        textColor: 'purple-8',
        icon: 'article',
        clickable: true,
        onClick: () => void handleRequirementClick(task, designDocs[0]?.trim() || '')
      });
    } else if (designDocs.length > 1) {
      designDocs.forEach((doc, index) => {
        const trimmedDoc = doc.trim();
        if (trimmedDoc) {
          tags.push({
            label: `设计文档v${index + 1}`,
            color: 'purple-2',
            textColor: 'purple-8',
            icon: 'article',
            clickable: true,
            index: index,
            onClick: () => void handleRequirementClick(task, trimmedDoc)
          });
        }
      });
    }
  }

  return tags;
}

// 修复 TypeScript 类型转换语法问题
const handleSystemClick = (system: string, branch: string): void => {
  if (system === 'other' || !branch) return

  const baseUrls: Partial<Record<string, string>> = {
    callin: 'http://code.devops.piccnet/picc/_source/picc/picc__picc-life-ccin/Flex-Media/-/branches',
    callout: 'http://code.devops.piccnet/picc/_source/picc/picc__picc-life-ccout/Flex-Callout/-/branches'
  }

  if (system === 'callin' || system === 'callout') {
    const url = `${baseUrls[system]}?search=${branch}`
    window.open(url, '_blank')
  }
}

// 修改handleRequirementClick函数，明确设置参数类型
const handleRequirementClick = async (item: DevTask, fileName: string): Promise<void> => {
  if (!fileName) {
    return;
  }

  // 确保文件名被正确处理（去除可能的空格）
  const trimmedFileName = fileName.trim();
  const fullPath = `${requirementBasePath}${trimmedFileName}`;

  try {
    const response = await fetch(`http://localhost:8090/open?path=${encodeURIComponent(fullPath)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      $q.notify({
        message: `文件 "${trimmedFileName}" 已打开`,
        type: 'positive'
      });
    } else {
      $q.notify({
        message: result.message || '打开文件失败',
        type: 'negative'
      });
    }
  } catch (error) {
    console.error('无法打开文件:', error);
    $q.notify({
      message: '无法打开文件，请确保本地服务已启动',
      type: 'negative'
    });
  }
};

// 复制文本到剪贴板
const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // 复制成功提示
      $q.notify({
        message: '已复制到剪贴板',
        color: 'positive',
        position: 'top',
        timeout: 1000
      })
    })
    .catch((error: Error) => {
      console.error('复制失败:', error)
    })
}

// 添加新建任务相关的数据
const taskTypes = [
  { label: '呼入任务', value: 'incoming' },
  { label: '呼出任务', value: 'outgoing' }
]

// 修改newTask定义，明确指定类型
interface TaskType {
  label: string;
  value: string;
}

interface DocLists {
  requirement: string[];
  design: string[];
}

interface DocNames {
  requirement: string;
  design: string;
}

interface DocFlags {
  requirement: boolean;
  design: boolean;
}

interface NewTask {
  title: string;
  type: TaskType;
  id: string;
  docs: DocFlags;
  docNames: DocNames;
  docsList: DocLists;
}

// 初始化newTask，使用正确的类型
const newTask = ref<NewTask>({
  title: '',
  type: { label: '呼入任务', value: 'incoming' },
  id: '',
  docs: {
    requirement: false,
    design: false
  },
  docNames: {
    requirement: '',
    design: ''
  },
  docsList: {
    requirement: [],
    design: []
  }
})

// 判断是否有文档的计算属性
const hasRequirementDocs = computed(() => newTask.value.docsList.requirement.length > 0)
const hasDesignDocs = computed(() => newTask.value.docsList.design.length > 0)

// 添加触发文件上传点击事件返回类型
const triggerFileUpload = (type: 'requirement' | 'design'): void => {
  if (type === 'requirement' && requirementFileInput.value) {
    requirementFileInput.value.click()
  } else if (type === 'design' && designFileInput.value) {
    designFileInput.value.click()
  }
}

// 修改处理文件上传，添加到文档数组而不是替换
const handleFileUpload = (type: 'requirement' | 'design', event: Event): void => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]!
    const fileName = file.name

    // 添加文件名到对应的文档数组
    if (type === 'requirement') {
      newTask.value.docsList.requirement.push(fileName)
    } else if (type === 'design') {
      newTask.value.docsList.design.push(fileName)
    }

    // 同时更新单文档字段，用分号分隔的文件名列表
    updateDocNamesFromList(type)

    // 清空文件输入框，方便下次选择同一个文件
    target.value = ''

    // 提示用户文件名已获取
    $q.notify({
      message: `已添加文件: ${fileName}`,
      color: 'positive',
      position: 'top',
      timeout: 1500
    })
  }
}

// 添加从数组更新到字符串函数的返回类型
const updateDocNamesFromList = (type: 'requirement' | 'design'): void => {
  if (type === 'requirement') {
    newTask.value.docNames.requirement = newTask.value.docsList.requirement.join(';')
  } else if (type === 'design') {
    newTask.value.docNames.design = newTask.value.docsList.design.join(';')
  }
}

// 添加移除文档方法的返回类型
const removeDoc = (type: 'requirement' | 'design', index: number): void => {
  if (type === 'requirement') {
    newTask.value.docsList.requirement.splice(index, 1)
  } else if (type === 'design') {
    newTask.value.docsList.design.splice(index, 1)
  }

  // 更新字符串形式的文档名
  updateDocNamesFromList(type)
}

// 修复重置表单函数
const resetNewTaskForm = (): void => {
  newTask.value = {
    title: '',
    type: { label: '呼入任务', value: 'incoming' },
    id: '',
    docs: {
      requirement: false,
      design: false
    },
    docNames: {
      requirement: '',
      design: ''
    },
    docsList: {
      requirement: [],
      design: []
    }
  }
}

// 修改创建任务方法，使用dev-task API
const createTask = async (): Promise<void> => {
  try {
    // 明确转换systemCategory类型
    const systemCategory: SystemType =
      newTask.value.type.value === 'incoming' ? 'callin' : 'callout';

    // 使用DevTask接口
    const devTask: DevTask = {
      requirementId: newTask.value.id,
      requirementName: newTask.value.title,
      systemCategory,
      relatedRequirementDocs: newTask.value.docsList.requirement.length > 0
        ? newTask.value.docsList.requirement.join(';')
        : '',
      relatedDesignDocs: newTask.value.docsList.design.length > 0
        ? newTask.value.docsList.design.join(';')
        : ''
    };

    const response = await devTaskApi.saveDevTask(devTask);

    if (response.data?.isOk) {
      $q.notify({
        message: '任务创建成功',
        color: 'positive',
        position: 'top',
        timeout: 1500
      })

      // 重新获取任务列表
      fetchTasks()

      // 使用重置函数
      resetNewTaskForm()
    } else {
      $q.notify({
        message: '任务创建失败: ' + (response.data?.failMsg || '未知错误'),
        color: 'negative',
        position: 'top',
        timeout: 1500
      })
    }
  } catch (error) {
    console.error('创建任务出错:', error)
    $q.notify({
      message: '创建任务出错',
      color: 'negative',
      position: 'top',
      timeout: 1500
    })
  }
}

// 添加打开新建任务对话框方法的返回类型
const openNewTaskDialog = (): void => {
  showNewTaskDialog.value = true
}

// 添加文件上传相关的ref
const requirementFileInput = ref<HTMLInputElement | null>(null)
const designFileInput = ref<HTMLInputElement | null>(null)

// 添加系统分类选项
const systemCategoryOptions = [
  { label: '呼入系统', value: 'callin' },
  { label: '呼出系统', value: 'callout' }
]

// 添加状态选项
const statusOptions = [
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已取消', value: 'cancelled' }
]

// 分页处理方法
const handlePageChange = (page: number): void => {
  // 更新当前分页
  incomingPagination.value.current = page

  // 重新获取数据
  fetchTasks()
}

// 处理分页大小变化
const handlePageSizeChange = (newSize: { label: string; value: number } | number): void => {
  const size = typeof newSize === 'object' ? newSize.value : newSize

  console.log('分页大小变化:', size)

  // 更新分页大小
  pageSize.value = size

  // 保存到本地存储
  savePageSize(size)

  // 更新分页数据的size
  incomingPagination.value.size = size
  outgoingPagination.value.size = size

  // 重置到第一页
  incomingPagination.value.current = 1
  outgoingPagination.value.current = 1

  // 重新获取数据
  fetchTasks()

  // 提示用户
  $q.notify({
    message: `每页显示条数已设置为 ${size} 条`,
    color: 'positive',
    position: 'top',
    timeout: 1500
  })
}

// 获取活跃任务数量的计算属性
const getActiveTasksCount = computed(() => {
  // 由于 DevTask 类型中没有 status 字段，我们暂时返回 0
  // 或者可以根据其他逻辑来判断活跃状态
  return 0;
});

// 添加任务菜单方法
const showTaskMenu = (task: DevTask) => {
  $q.bottomSheet({
    message: `任务: ${task.requirementName || '未命名任务'} (ID: ${task.requirementId || 'N/A'})`,
    actions: [
      { label: '查看详情', icon: 'info', handler: () => $q.notify(`查看任务详情: ${task.requirementName}`) },
      { label: '编辑', icon: 'edit', handler: () => $q.notify(`编辑任务: ${task.requirementName}`) },
      { label: '删除', icon: 'delete', color: 'negative', handler: () => $q.notify(`删除任务: ${task.requirementName}`) },
      { label: '取消', icon: 'cancel', color: 'warning', handler: () => $q.notify(`暂停任务: ${task.requirementName}`) },
      { label: '完成', icon: 'check_circle', color: 'positive', handler: () => $q.notify(`完成任务: ${task.requirementName}`) },
    ]
  });
};

// AI命名建议相关数据
const aiApi = getAi()
const chineseInput = ref('')
const suggestions = ref<NamingSuggestion[]>([])
const isLoading = ref(false)
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

defineOptions({
  name: 'TaskList'
})
</script>

<style lang="scss" scoped>
.task-card {
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.07);
    border-color: rgba(0, 0, 0, 0.12);
  }
}

.text-dark {
  color: rgba(0, 0, 0, 0.87);
}

:deep(.q-tab) {
  min-height: 40px;
  padding: 0 24px;
}

:deep(.q-badge) {
  font-size: 10px;
  padding: 2px 4px;
}

.task-card {
  transition: all 0.3s ease;

  .task-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1976D2;

    &.outgoing-dot {
      background: #26A69A;
    }
  }

  .text-dark {
    color: rgba(0, 0, 0, 0.87) !important;
  }
}

.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.badge-link {
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

// 添加新建任务对话框相关样式
.light-field {

  .q-field__native,
  .q-field__prefix,
  .q-field__suffix,
  .q-field__input {
    color: $cursor-text !important; // 使用变量系统
  }

  .q-field__label {
    color: $cursor-muted !important; // 使用变量系统
  }

  &.q-field--outlined .q-field__control {
    background-color: $cursor-surface !important; // 使用变量系统
    border-color: $cursor-border !important; // 使用变量系统
  }
}

.doc-label {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &.doc-requirement {
    background: rgba($cursor-info, 0.2);
    color: $cursor-info; // 使用变量系统

    &:hover {
      background: rgba($cursor-info, 0.3);
    }

    &.doc-active {
      background: rgba($cursor-info, 0.5);
      color: $cursor-info; // 使用变量系统
      font-weight: 500;
    }
  }

  &.doc-design {
    background: rgba($cursor-accent, 0.2);
    color: $cursor-accent; // 使用变量系统

    &:hover {
      background: rgba($cursor-accent, 0.3);
    }

    &.doc-active {
      background: rgba($cursor-accent, 0.5);
      color: $cursor-accent; // 使用变量系统
      font-weight: 500;
    }
  }
}

.requirement-field {
  :deep(.q-field__control) {
    border-color: rgba(59, 130, 246, 0.5) !important;
  }
}

.design-field {
  :deep(.q-field__control) {
    border-color: rgba(168, 85, 247, 0.5) !important;
  }
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.uploaded-doc {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: rgba($cursor-border, 0.05);
  margin-top: 8px;
  max-width: 100%;

  &.requirement-doc {
    color: $cursor-info; // 使用变量系统
    background-color: rgba($cursor-info, 0.1);
  }

  &.design-doc {
    color: $cursor-accent; // 使用变量系统
    background-color: rgba($cursor-accent, 0.1);
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden; // 这里保留，因为是文本省略号
    text-overflow: ellipsis;
    flex: 1;
  }
}

// 自定义任务标签样式
.task-tag {
  font-size: 0.9rem;
  padding: 4px 8px;
  height: 28px;

  :deep(.q-chip__icon) {
    font-size: 1.1rem;
    padding-right: 6px;
  }

  :deep(.q-chip__content) {
    padding: 0 4px;
  }
}

// 过滤表头样式
.filter-header {
  background: rgba($cursor-surface, 0.5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba($cursor-border, 0.1);

  .advanced-filter {
    transition: all 0.3s ease;
  }
}

// 搜索按钮组样式
.q-btn {
  &.q-btn--dense {
    padding: 8px 16px;
    font-size: 0.875rem;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .filter-header {
    .row {
      .col {
        margin-bottom: 16px;
      }
    }
  }
}

// 任务统计样式
.task-stats {
  .q-chip {
    font-weight: 500;
  }
}

// 任务卡片样式 - 与查询表头保持一致
.task-card {
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

  .q-card-section {
    padding: 16px;
  }
}

// 任务列表样式
.task-list {
  .task-card {
    margin-bottom: 16px;
  }
}

// 新增样式
.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
}

.data-grid {
  border: 1px solid rgba($cursor-border, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background-color: $cursor-surface;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .data-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 1px;
    background-color: $cursor-border;
    padding: 12px 16px;
    font-weight: bold;
    color: $cursor-text;
    font-size: 0.9rem;
  }

  .data-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 1px;
    background-color: $cursor-surface;
    padding: 12px 16px;
    align-items: center;

    &:hover {
      background-color: $hover-bg; // 使用已定义的变量
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

    &.requirement-name {
      .requirement-name-content {
        font-weight: 500;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &.requirement-id {
      .requirement-id-content {
        font-weight: 500;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &.system-category {
      .system-category-text {
        font-weight: 500;
        cursor: pointer;
      }
    }

    &.documents {
      .doc-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .doc-chip {
        cursor: pointer;

        &:hover {
          opacity: 0.9;
        }
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

// 添加渐变背景样式
.bg-gradient-primary {
  background: $gradient-primary !important;
}

.bg-gradient-info {
  background: linear-gradient(135deg, $cursor-info 0%, mix(white, $cursor-info, 15%) 100%) !important;
}

.bg-gradient-accent {
  background: linear-gradient(135deg, $cursor-accent 0%, mix(white, $cursor-accent, 15%) 100%) !important;
}

.bg-gradient-warning {
  background: linear-gradient(135deg, $cursor-warning 0%, mix(white, $cursor-warning, 15%) 100%) !important;
}

// 紧凑型分页样式
.compact-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: rgba($cursor-surface, 0.8);
  border-radius: 8px;
  border: 1px solid rgba($cursor-border, 0.1);
  min-height: 48px;

  .pagination-summary {
    flex: 0 0 auto;
    font-size: 0.875rem;
  }

  .pagination-controls {
    flex: 1;
    display: flex;
    justify-content: center;

    :deep(.q-pagination) {
      .q-btn {
        min-width: 32px;
        height: 32px;
        margin: 0 1px;
        border-radius: 4px;
        font-size: 0.875rem;

        &.q-btn--active {
          font-weight: 600;
        }
      }
    }
  }

  .page-size-control {
    flex: 0 0 auto;

    .compact-page-size-select {
      min-width: 100px;

      :deep(.q-field__control) {
        min-height: 32px;
        background-color: rgba(white, 0.8);
        border-radius: 16px;
        padding: 0 12px;
      }

      :deep(.q-field__native) {
        padding: 4px 0;
        font-size: 0.875rem;
        text-align: center;
        font-weight: 500;
      }

      :deep(.q-field__prepend) {
        padding-right: 6px;
      }

      :deep(.q-field__append) {
        padding-left: 6px;
      }

      :deep(.q-field__dropdown-icon) {
        font-size: 16px;
        color: $cursor-muted;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .compact-pagination {
    flex-direction: column;
    gap: 12px;
    padding: 16px;

    .pagination-summary {
      order: 1;
    }

    .pagination-controls {
      order: 2;
    }

    .page-size-control {
      order: 3;
    }
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

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.example-card {
  background: rgba($cursor-surface, 0.6);
  border: 1px solid rgba($cursor-border, 0.15);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba($cursor-surface, 0.8);
    border-color: rgba($cursor-primary, 0.3);
    transform: translateY(-1px);
  }

  .example-content {
    .example-type {
      font-size: 0.75rem;
      color: $cursor-primary;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .example-input {
      font-weight: 500;
      color: $cursor-text;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }

    .example-desc {
      font-size: 0.75rem;
      color: $cursor-muted;
      line-height: 1.3;
    }
  }

  .try-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    color: $cursor-muted;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  &:hover .try-indicator {
    opacity: 1;
    color: $cursor-primary;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }
}
</style>
