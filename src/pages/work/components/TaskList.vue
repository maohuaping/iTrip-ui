<template>
  <section id="tasks" class="q-mb-xl">
    <div class="q-pa-sm">
      <!-- 标题栏优化 -->
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="task_alt" size="28px" class="q-mr-sm" />
          任务列表
        </h2>
        <!-- 更多按钮 -->
        <q-btn round flat icon="more_horiz" color="text" class="new-task-btn" @click="showTaskMenuButton">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup @click="openNewTaskDialog()">
                <q-item-section avatar>
                  <q-icon name="add_task" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>新建任务</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- 查询表头 - 使用卡片样式 -->
      <q-card flat bordered class="filter-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-medium q-mb-md">
            <q-icon name="filter_list" class="q-mr-sm" />
            筛选条件
          </div>

          <!-- 常规筛选区域 -->
          <div class="row q-col-gutter-md items-end">
            <!-- 需求名称搜索 -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="filterParams.requirementName" label="需求名称" outlined dense clearable
                placeholder="请输入需求名称" class="light-field" @update:model-value="handleFilterChange">
                <template v-slot:prepend>
                  <q-icon name="description" size="16px" />
                </template>
              </q-input>
            </div>

            <!-- 需求编号搜索 -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="filterParams.requirementId" label="需求编号" outlined dense clearable placeholder="请输入需求编号"
                class="light-field" @update:model-value="handleFilterChange">
                <template v-slot:prepend>
                  <q-icon name="tag" size="16px" />
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
              <!-- 关联文档搜索 -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filterParams.relatedRequirementDocs" label="关联文档" outlined dense clearable
                  placeholder="请输入文档名称" class="light-field" @update:model-value="handleFilterChange">
                  <template v-slot:prepend>
                    <q-icon name="article" size="16px" />
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

      <!-- 任务列表表格 -->
      <q-card flat bordered class="task-table-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <!-- 使用 q-table 但保持原有样式 -->
          <q-table :rows="allTasks" :columns="tableColumns" :loading="loading" row-key="id" flat bordered
            class="custom-task-table" v-model:pagination="pagination" :rows-per-page-options="[5, 10, 20, 50, 100]"
            :rows-per-page-label="'每页条数'" :no-data-label="'暂无数据'" :loading-label="'加载中...'"
            :pagination-label="getPaginationLabel" @request="onRequest" binary-state-sort>
            <!-- 自定义列模板 - 需求名称 -->
            <template v-slot:body-cell-requirementName="props">
              <q-td :props="props" class="requirement-name-cell">
                <div class="requirement-name-content cursor-pointer"
                  @click="copyToClipboard(props.row.requirementName || '')" title="点击复制需求名称">
                  {{ props.row.requirementName || '未命名需求' }}
                </div>
              </q-td>
            </template>

            <!-- 自定义列模板 - 需求编号 -->
            <template v-slot:body-cell-requirementId="props">
              <q-td :props="props" class="requirement-id-cell">
                <div class="requirement-id-content cursor-pointer"
                  @click="copyToClipboard(props.row.requirementId || '')" title="点击复制需求编号">
                  #{{ props.row.requirementId || '无编号' }}
                </div>
              </q-td>
            </template>

            <!-- 自定义列模板 - 系统分类 -->
            <template v-slot:body-cell-systemCategory="props">
              <q-td :props="props" class="system-category-cell">
                <div class="system-category-text">
                  {{ props.row.systemCategoryDesc || '' }}
                </div>
              </q-td>
            </template>

            <!-- 自定义列模板 - 关联文档（方案二：图标+弹出卡片） -->
            <template v-slot:body-cell-documents="props">
              <q-td :props="props" class="documents-cell">
                <div class="documents-wrapper">
                  <!-- 当有关联文件时显示图标和数量 -->
                  <div v-if="getDocumentCount(props.row) > 0" class="documents-indicator">
                    <q-btn flat round dense color="primary" :icon="'attach_file'" size="sm" class="documents-btn">
                      <!-- 文档数量徽章 -->
                      <q-badge floating color="red" :label="getDocumentCount(props.row)" class="documents-badge" />

                      <!-- 弹出卡片 -->
                      <q-popup-proxy transition-show="scale" transition-hide="scale" class="documents-popup">
                        <q-card class="documents-card" style="min-width: 300px; max-width: 400px;">
                          <q-card-section class="q-pb-none">
                            <div class="text-h6 text-weight-medium">
                              <q-icon name="folder_open" class="q-mr-sm" />
                              关联文档
                            </div>
                          </q-card-section>

                          <q-card-section class="q-pt-sm">
                            <!-- 文档列表 -->
                            <div v-if="props.row.relatedFileList && props.row.relatedFileList.length > 0"
                              class="documents-list">
                              <div v-for="(file, index) in props.row.relatedFileList" :key="index" class="document-item"
                                @click="handleDocumentClick(file)">
                                <q-icon :name="getFileIcon(file.fileType || '')"
                                  :color="getFileIconColor(file.fileType || '')" size="20px" class="q-mr-sm" />
                                <div class="document-info">
                                  <div class="document-name">{{ file.fileName || '未命名文件' }}</div>
                                  <div class="document-meta">
                                    <span class="document-type">{{ getFileTypeLabel(file.fileType || '') }}</span>
                                    <span v-if="file.createdAt" class="document-date">{{ formatDate(file.createdAt)
                                      }}</span>
                                  </div>
                                </div>
                                <q-icon name="open_in_new" size="16px" color="grey-6" />
                              </div>
                            </div>

                            <!-- 空状态 -->
                            <div v-else class="text-center text-grey-6 q-py-md">
                              <q-icon name="folder_open" size="32px" class="q-mb-sm" />
                              <div>暂无关联文档</div>
                            </div>
                          </q-card-section>

                          <!-- 操作按钮 -->
                          <q-card-actions align="right" class="q-pt-none">
                            <q-btn flat dense color="primary" icon="add" label="添加关联" size="sm"
                              @click="handleAddDocument(props.row)" />
                          </q-card-actions>
                        </q-card>
                      </q-popup-proxy>
                    </q-btn>
                  </div>

                  <!-- 无文档时显示占位符 -->
                  <div v-else class="no-documents">
                    <span class="text-grey-5">无</span>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- 自定义列模板 - 操作 -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="actions-cell">
                <div class="action-buttons">
                  <q-btn flat round dense color="primary" icon="call_split"
                    @click="handleSystemClick(props.row.systemCategory || 'other', props.row.requirementId || '')"
                    title="Git分支" class="action-btn" />
                  <q-btn flat round dense color="secondary" icon="more_vert" @click="showTaskMenu(props.row)"
                    title="更多操作" class="action-btn" />
                </div>
              </q-td>
            </template>

            <!-- 空状态 -->
            <template v-slot:no-data>
              <div class="full-width flex justify-center items-center" style="min-height: 300px; padding: 60px 20px;">
                <div class="text-center">
                  <q-icon name="task_alt" size="64px" color="grey-5" class="q-mb-md" />
                  <div class="text-h6 text-grey-6 q-mb-sm">暂无任务数据</div>
                  <div class="text-body2 text-grey-5">点击"新建任务"开始创建您的第一个任务</div>
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </section>

  <!-- 将独立的NewTaskDialog内容直接集成到这里 -->
  <q-dialog v-model="showNewTaskDialog" :maximized="$q.screen.lt.md" :full-width="$q.screen.lt.md"
    :full-height="$q.screen.lt.md">
    <q-card class="bg-cursor-surface" :style="{
      width: $q.screen.lt.md ? '100%' : 'min(90vw, 600px)',
      maxWidth: $q.screen.lt.md ? '100%' : '600px',
      minWidth: $q.screen.lt.md ? '100%' : '320px'
    }">
      <q-card-section class="bg-cursor-bg q-pb-sm border-bottom">
        <div class="text-h6 text-cursor-text">新建任务</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-mt-sm q-mr-sm" color="grey-7" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- 任务类型和编号 -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-5">
            <q-select v-model="newTask.type" :options="taskTypes" label="任务类型" outlined dense class="light-field" />
          </div>
          <div class="col-12 col-sm-7">
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
            <div class="text-caption text-grey-7">上传相关文档</div>
          </div>

          <!-- 拖拽上传区域 -->
          <div class="q-mb-md">
            <div class="drag-upload-area" :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
              @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"
              @click="triggerFileInput">
              <div class="drag-upload-content">
                <q-icon :name="isUploading ? 'cloud_upload' : 'cloud_upload'" size="48px" class="q-mb-md upload-icon" />
                <div class="text-h6 text-weight-medium q-mb-xs upload-title">
                  {{ isDragOver ? '释放文件开始上传' : isUploading ? '正在上传文件...' : '拖拽文件到此处或点击选择' }}
                </div>
                <div class="text-caption upload-subtitle">
                  支持 PDF、Word、Excel、文本文档等格式，单个文件不超过 10MB
                </div>
                <div v-if="isUploading" class="q-mt-md">
                  <q-spinner-dots size="24px" color="primary" />
                  <div class="text-caption q-mt-xs">正在上传...</div>
                </div>
              </div>

              <!-- 隐藏的文件输入框 -->
              <input ref="fileInputRef" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
                @change="handleFileInputChange" style="display: none;" />
            </div>
          </div>

          <!-- 显示已上传的文档列表 -->
          <div v-if="newTask.docsList.length > 0" class="q-mt-md">
            <div class="text-caption text-weight-medium q-mb-xs">已上传文档:</div>
            <div class="q-gutter-y-sm">
              <div v-for="(doc, index) in newTask.docsList" :key="index" class="uploaded-doc">
                <q-icon name="description" size="18px" class="q-mr-xs" />
                <span class="ellipsis">{{ doc.fileName }}</span>
                <q-btn flat round dense icon="close" size="xs" @click="removeDoc(index)" class="q-mr-xs" />
                <q-btn flat round dense icon="download" size="xs" @click="downloadFile(doc)" class="q-ml-xs" />
              </div>
            </div>
          </div>

          <!-- 上传进度条 -->
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="q-mt-md">
            <q-linear-progress :value="uploadProgress / 100" color="primary" class="q-mb-xs" />
            <div class="text-caption text-center">{{ uploadProgress.toFixed(1) }}%</div>
          </div>
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
import { getEnum } from 'src/api/enum/enum'
// EnumVO 类型已不再需要，移除此导入

import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getDevTask } from 'src/api/dev-task/dev-task'
import type { DevTask, DevTaskVO, QueryDevTaskInParam, IPageDevTaskVO, RelatedFile } from 'src/api/api.schemas'

// 导入AI API
import { getAi } from 'src/api/ai/ai'
import type { NamingSuggestion, VariableNamingResponseVO } from 'src/api/api.schemas'

// 在 script setup 部分添加以下导入
import { getSysFile } from 'src/api/sys-file/sys-file'
import type { SysFile, UploadFileBody } from 'src/api/api.schemas'

// 初始化
const $q = useQuasar()
const devTaskApi = getDevTask()
const sysFileApi = getSysFile()

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

// 任务数据 - 修复类型为 DevTaskVO
const incomingTasks = ref<DevTaskVO[]>([])
const outgoingTasks = ref<DevTaskVO[]>([])

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

// 当前分页状态（用于显示）- 修复为只使用 incomingPagination
const currentPagination = computed(() => {
  return {
    current: incomingPagination.value.current || 1,
    size: incomingPagination.value.size || pageSize.value,
    total: incomingPagination.value.total || 0,
    pages: incomingPagination.value.pages || 0
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

// 分页配置 - 使用正确的结构
const pagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0
})

// 文件上传相关状态
const uploadProgress = ref(0)
const isUploading = ref(false)

// 拖拽上传相关状态
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 统一的搜索函数
const fetchTasks = async (): Promise<void> => {
  try {
    loading.value = true

    // 处理 systemCategory 的类型转换 - 修复类型问题
    let systemCategory: string | undefined = undefined
    if (filterParams.value.systemCategory) {
      if (typeof filterParams.value.systemCategory === 'string') {
        systemCategory = filterParams.value.systemCategory
      } else if (typeof filterParams.value.systemCategory === 'object' && filterParams.value.systemCategory.value) {
        systemCategory = filterParams.value.systemCategory.value
      }
    }

    // 构建查询参数 - 修复类型问题，只传递有值的参数
    const queryParams: QueryDevTaskInParam = {
      pageParam: {
        current: pagination.value.page,
        size: pagination.value.rowsPerPage
      }
    }

    // 只添加有值的参数
    if (filterParams.value.requirementId) {
      queryParams.requirementId = filterParams.value.requirementId
    }
    if (filterParams.value.requirementName) {
      queryParams.requirementName = filterParams.value.requirementName
    }
    if (systemCategory) {
      queryParams.systemCategory = systemCategory
    }
    if (filterParams.value.relatedRequirementDocs) {
      queryParams.relatedRequirementDocs = filterParams.value.relatedRequirementDocs
    }

    // 调用API获取数据
    const response = await devTaskApi.queryDevTask(queryParams)

    if (response.data?.isOk && response.data.okData) {
      const pageData = response.data.okData

      // 更新分页信息
      incomingPagination.value = {
        current: pageData.current || 1,
        size: pageData.size || pagination.value.rowsPerPage,
        total: pageData.total || 0,
        pages: pageData.pages || 0
      }

      // 更新 q-table 的分页配置
      pagination.value = {
        ...pagination.value,
        page: pageData.current || 1,
        rowsPerPage: pageData.size || pagination.value.rowsPerPage,
        rowsNumber: pageData.total || 0
      }

      // 更新任务数据 - 修复类型问题
      incomingTasks.value = pageData.records || []
      outgoingTasks.value = []

      console.log('分页数据更新:', {
        current: pageData.current,
        size: pageData.size,
        total: pageData.total,
        pages: pageData.pages,
        recordsCount: pageData.records?.length
      })

      console.log('pagination 值:', pagination.value)
    }
  } catch (error) {
    console.error('获取任务数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取任务数据失败'
    })
  } finally {
    loading.value = false
  }
}

// 搜索处理 - 统一搜索逻辑
const handleSearch = () => {
  console.log('开始搜索，当前过滤条件:', filterParams.value)

  // 重置分页到第一页
  pagination.value.page = 1
  pagination.value.rowsPerPage = pageSize.value

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
  pagination.value.page = 1
  pagination.value.rowsPerPage = pageSize.value

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
  pagination.value.page = 1
  pagination.value.rowsPerPage = pageSize.value
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchTasks()
  loadSystemCategories()
  loadTaskTypes()
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
const handleRequirementClick = async (item: DevTaskVO, fileName: string): Promise<void> => {
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
const taskTypes = ref<{ label: string; value: string }[]>([])

// 修改newTask定义，明确指定类型
interface TaskType {
  label: string;
  value: string;
}

interface NewTask {
  title: string;
  type: TaskType;
  id: string;
  docsList: SysFile[];
  uploadFiles: File[] | null;
}

// 初始化newTask，type初始化为空对象，等待从接口获取
const newTask = ref<NewTask>({
  title: '',
  type: { label: '', value: '' }, // 初始化为空，等待从接口获取
  id: '',
  docsList: [],
  uploadFiles: null
})

// 判断是否有文档的计算属性
const hasDocuments = computed(() => newTask.value.docsList.length > 0)

// 处理文件选择 - 立即上传
const handleFileSelect = async (files: File[] | null): Promise<void> => {
  if (!files || files.length === 0) return

  // 设置上传状态
  isUploading.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      // 更新进度
      uploadProgress.value = (i / files.length) * 50 // 前50%用于准备

      try {
        // 调用上传API
        const uploadFileBody: UploadFileBody = {
          file: file
        }

        const response = await sysFileApi.uploadFile(uploadFileBody)

        if (response.data?.isOk && response.data.okData) {
          // 上传成功后，尝试移动文件到最终目录
          try {
            const fileName = response.data.okData.fileName || file.name
            const moveResponse = await sysFileApi.moveToFinalDirectory({ tempFileName: fileName })

            if (moveResponse.data?.isOk) {
              // 文件移动成功，添加到文档列表
              const sysFile: SysFile = {
                ...response.data.okData,
                fileName: file.name,
                fileType: file.name.split('.').pop() || '',
              }

              newTask.value.docsList.push(sysFile)

              $q.notify({
                message: `文件 "${file.name}" 上传成功`,
                color: 'positive',
                position: 'top',
                timeout: 1500
              })
            } else {
              console.warn('文件移动失败:', moveResponse.data?.failMsg)
              // 即使移动失败，也添加到列表中
              const sysFile: SysFile = {
                ...response.data.okData,
                fileName: file.name,
                fileType: file.name.split('.').pop() || '',
              }

              newTask.value.docsList.push(sysFile)

              $q.notify({
                message: `文件 "${file.name}" 上传成功（文件移动可能失败）`,
                color: 'warning',
                position: 'top',
                timeout: 2000
              })
            }
          } catch (moveError) {
            console.warn('文件移动异常:', moveError)
            // 即使移动异常，也添加到列表中
            const sysFile: SysFile = {
              ...response.data.okData,
              fileName: file.name,
              fileType: file.name.split('.').pop() || '',
            }

            newTask.value.docsList.push(sysFile)

            $q.notify({
              message: `文件 "${file.name}" 上传成功（文件移动异常）`,
              color: 'warning',
              position: 'top',
              timeout: 2000
            })
          }
        } else {
          throw new Error(response.data?.failMsg || '上传失败')
        }
      } catch (error) {
        console.error('文件上传失败:', error)
        $q.notify({
          message: `文件 "${file.name}" 上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
          color: 'negative',
          position: 'top',
          timeout: 3000
        })
      }

      // 更新进度
      uploadProgress.value = ((i + 1) / files.length) * 100
    }
  } finally {
    // 重置上传状态
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
    }, 1000)
  }
}

// 处理文件移除
const handleFileRemove = (): void => {
  // Quasar的file组件会自动处理移除，这里只需要清空docsList
  newTask.value.docsList = []
}

// 删除单个文档
const removeDoc = async (index: number): Promise<void> => {
  const doc = newTask.value.docsList[index]

  // 从本地列表中移除
  newTask.value.docsList.splice(index, 1)

  // TODO: 如果需要的话，可以在这里调用删除文件的API
  // 目前只是从本地列表中移除，文件仍保存在服务器上

  $q.notify({
    message: '文档已从列表中删除',
    color: 'positive',
    position: 'top',
    timeout: 1000
  })
}

// 拖拽上传相关函数
const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = async (event: DragEvent): Promise<void> => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await processFiles(Array.from(files))
  }
}

const triggerFileInput = (): void => {
  fileInputRef.value?.click()
}

const handleFileInputChange = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await processFiles(Array.from(files))
  }
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

// 处理文件的统一函数
const processFiles = async (files: File[]): Promise<void> => {
  // 验证文件类型
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.md']
  const validFiles = files.filter(file => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return allowedTypes.includes(extension)
  })

  // 验证文件大小 (限制为 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  const oversizedFiles = validFiles.filter(file => file.size > maxSize)

  if (oversizedFiles.length > 0) {
    $q.notify({
      message: `文件 "${oversizedFiles[0]?.name}" 超过 10MB 限制`,
      color: 'warning',
      position: 'top',
      timeout: 3000
    })
    return
  }

  if (validFiles.length !== files.length) {
    $q.notify({
      message: `只支持 ${allowedTypes.join(', ')} 格式的文件`,
      color: 'warning',
      position: 'top',
      timeout: 3000
    })
  }

  if (validFiles.length > 0) {
    // 检查是否有重复文件
    const existingFileNames = newTask.value.docsList.map(doc => doc.fileName)
    const newFiles = validFiles.filter(file => !existingFileNames.includes(file.name))

    if (newFiles.length !== validFiles.length) {
      $q.notify({
        message: '已过滤重复文件',
        color: 'info',
        position: 'top',
        timeout: 2000
      })
    }

    if (newFiles.length > 0) {
      await handleFileSelect(newFiles)
    }
  }
}


// 修复重置表单函数
const resetNewTaskForm = (): void => {
  newTask.value = {
    title: '',
    type: { label: '', value: '' }, // 初始化为空，等待从接口获取
    id: '',
    docsList: [],
    uploadFiles: null
  }

  // 重置拖拽状态
  isDragOver.value = false
  isUploading.value = false
  uploadProgress.value = 0
}

// 修改创建任务方法，使用dev-task API
const createTask = async (): Promise<void> => {
  try {
    // 检查是否有文件正在上传
    if (isUploading.value) {
      $q.notify({
        message: '请等待文件上传完成',
        color: 'warning',
        position: 'top',
        timeout: 2000
      })
      return
    }

    // 检查是否有文件URL为空的情况（上传失败的文件）
    const failedUploads = newTask.value.docsList.filter(doc => !doc.fileUrl)
    if (failedUploads.length > 0) {
      $q.notify({
        message: `有 ${failedUploads.length} 个文件上传失败，请重新上传`,
        color: 'warning',
        position: 'top',
        timeout: 3000
      })
      return
    }

    // 直接使用下拉框选择的任务类型值作为systemCategory
    const systemCategory: SystemType = newTask.value.type.value as SystemType;

    // 使用DevTask接口
    const devTask: DevTask = {
      requirementId: newTask.value.id || '',
      requirementName: newTask.value.title || '',
      systemCategory,
      relatedRequirementDocs: newTask.value.docsList.length > 0
        ? newTask.value.docsList.map(doc => doc.fileName || '').join(';')
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

// 修改openNewTaskDialog方法，使用从接口获取的任务类型
const openNewTaskDialog = (taskType: string = 'requirement'): void => {
  // 从接口获取的任务类型中查找匹配的类型
  const foundType = taskTypes.value.find(type => type.value === taskType)

  if (foundType) {
    newTask.value.type = foundType
  } else if (taskTypes.value.length > 0) {
    // 如果没找到匹配的类型，使用第一个可用的类型
    newTask.value.type = taskTypes.value[0]!
  } else {
    // 如果没有任何类型，设置默认值
    newTask.value.type = { label: '', value: '' }
  }

  showNewTaskDialog.value = true
}

// 文件上传相关的引用已经不再需要

// 系统分类选项
const systemCategoryOptions = ref<{ label: string; value: string }[]>([])

// 获取系统分类枚举数据
const enumApi = getEnum()
const loadSystemCategories = async () => {
  try {
    const response = await enumApi.getEnumByName('TaskTypeEnum')
    if (response.data?.isOk && response.data?.okData) {
      // 转换枚举数据为下拉框选项格式
      systemCategoryOptions.value = response.data.okData.map((item: any) => ({
        label: item.desc || item.code || '',
        value: item.code || ''
      }))
    } else {
      console.warn('获取系统分类失败:', response.data?.failMsg)
      // 显示失败通知
      $q.notify({
        type: 'warning',
        message: `获取系统分类失败: ${response.data?.failMsg || '未知错误'}`,
        position: 'top',
        timeout: 3000
      })
    }
  } catch (error) {
    console.error('获取系统分类异常:', error)
    // 显示失败通知
    $q.notify({
      type: 'warning',
      message: `获取系统分类失败: ${error || '未知错误'}`,
      position: 'top',
      timeout: 3000
    })
  }
}

// 获取任务类型枚举数据
const loadTaskTypes = async () => {
  try {
    const response = await enumApi.getEnumByName('TaskTypeEnum')
    if (response.data?.isOk && response.data?.okData) {
      // 转换枚举数据为下拉框选项格式
      taskTypes.value = response.data.okData.map((item: any) => ({
        label: item.desc || item.code || '',
        value: item.code || ''
      }))

      // 从接口获取的数据中设置默认值
      if (taskTypes.value.length > 0) {
        newTask.value.type = taskTypes.value[0]!
      }
    } else {
      console.warn('获取任务类型失败:', response.data?.failMsg)
      // 显示失败通知
      $q.notify({
        type: 'warning',
        message: `获取任务类型失败: ${response.data?.failMsg || '未知错误'}`,
        position: 'top',
        timeout: 3000
      })

      // 如果获取失败，使用默认值
      taskTypes.value = [
        { label: '呼入任务', value: 'incoming' },
        { label: '呼出任务', value: 'outgoing' }
      ]
      // 设置默认类型
      newTask.value.type = taskTypes.value[0]!
    }
  } catch (error) {
    console.error('获取任务类型异常:', error)
    // 显示失败通知
    $q.notify({
      type: 'warning',
      message: `获取任务类型失败: ${error || '未知错误'}`,
      position: 'top',
      timeout: 3000
    })

    // 如果获取异常，使用默认值
    taskTypes.value = [
      { label: '呼入任务', value: 'incoming' },
      { label: '呼出任务', value: 'outgoing' }
    ]
    // 设置默认类型
    newTask.value.type = taskTypes.value[0]!
  }
}

// 添加状态选项
const statusOptions = [
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已取消', value: 'cancelled' }
]

// 分页处理方法
const handlePageChange = async (page: number): Promise<void> => {
  // 更新当前分页
  pagination.value.page = page
  pagination.value.rowsPerPage = pageSize.value

  // 重新获取数据
  await fetchTasks()
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
  pagination.value.rowsPerPage = size

  // 重置到第一页
  pagination.value.page = 1

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
computed(() => {
  // 由于 DevTask 类型中没有 status 字段，我们暂时返回 0
  // 或者可以根据其他逻辑来判断活跃状态
  return 0;
});

// 添加任务菜单方法 - 修复类型
const showTaskMenu = (task: DevTaskVO) => {
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

// 表格列定义 - 优化列宽分配
const tableColumns = [
  {
    name: 'requirementName',
    label: '需求名称',
    field: 'requirementName',
    align: 'left' as const,
    sortable: true,
    style: 'width: 35%; min-width: 250px' // 使用百分比 + 最小宽度
  },
  {
    name: 'requirementId',
    label: '需求编号',
    field: 'requirementId',
    align: 'left' as const,
    sortable: true,
    style: 'width: 25%; min-width: 180px' // 增加需求编号列宽
  },
  {
    name: 'systemCategory',
    label: '系统分类',
    field: 'systemCategory',
    align: 'center' as const,
    sortable: true,
    style: 'width: 15%; min-width: 100px' // 使用百分比
  },
  {
    name: 'documents',
    label: '关联文档',
    field: 'documents',
    align: 'center' as const,
    sortable: false,
    style: 'width: 15%; min-width: 120px' // 使用百分比
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
    style: 'width: 10%; min-width: 100px' // 使用百分比
  }
]

// 自定义分页标签函数
const getPaginationLabel = (firstRowIndex: number, endRowIndex: number, totalRowsNumber: number) => {
  if (totalRowsNumber === 0) {
    return '暂无数据'
  }

  const currentPage = Math.ceil(firstRowIndex / pagination.value.rowsPerPage)
  const totalPages = Math.ceil(totalRowsNumber / pagination.value.rowsPerPage)

  return `第 ${currentPage} 页，共 ${totalPages} 页 (显示第 ${firstRowIndex}-${endRowIndex} 条，总计 ${totalRowsNumber} 条)`
}

// 添加缺失的按钮点击处理函数
const showTaskMenuButton = () => {
  // 这里可以添加按钮菜单的逻辑，或者直接调用现有的菜单
  console.log('显示任务菜单按钮')
}

// 表格分页配置 - 直接使用响应式数据，不使用计算属性
const tablePagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
  pagesNumber: 0
})

// 加载状态
const loading = ref(false)

// 表格请求处理函数
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  console.log('onRequest 被调用:', props.pagination)

  // 更新分页配置
  pagination.value = {
    sortBy,
    descending,
    page,
    rowsPerPage,
    rowsNumber: pagination.value.rowsNumber
  }

  // 重新获取数据
  await fetchTasks()
}

// 新增方法：获取文档数量
const getDocumentCount = (task: DevTaskVO): number => {
  if (!task.relatedFileList || !Array.isArray(task.relatedFileList)) {
    return 0
  }
  return task.relatedFileList.length
}

// 新增方法：获取文件图标
const getFileIcon = (fileType: string | undefined): string => {
  const iconMap: Record<string, string> = {
    'requirement': 'description',
    'design': 'design_services',
    'doc': 'description',
    'docx': 'description',
    'pdf': 'picture_as_pdf',
    'xls': 'table_chart',
    'xlsx': 'table_chart',
    'ppt': 'slideshow',
    'pptx': 'slideshow',
    'txt': 'text_snippet',
    'md': 'text_snippet',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'svg': 'image',
    'zip': 'archive',
    'rar': 'archive',
    'default': 'insert_drive_file'
  }

  const key = fileType?.toLowerCase() || 'default'
  return iconMap[key] || 'insert_drive_file'
}

// 新增方法：获取文件图标颜色
const getFileIconColor = (fileType: string | undefined): string => {
  const colorMap: Record<string, string> = {
    'requirement': 'blue',
    'design': 'purple',
    'doc': 'blue',
    'docx': 'blue',
    'pdf': 'red',
    'xls': 'green',
    'xlsx': 'green',
    'ppt': 'orange',
    'pptx': 'orange',
    'txt': 'grey',
    'md': 'grey',
    'jpg': 'pink',
    'jpeg': 'pink',
    'png': 'pink',
    'gif': 'pink',
    'svg': 'pink',
    'zip': 'brown',
    'rar': 'brown',
    'default': 'grey-6'
  }

  const key = fileType?.toLowerCase() || 'default'
  return colorMap[key] || 'grey-6'
}

// 新增方法：获取文件类型标签
const getFileTypeLabel = (fileType: string | undefined): string => {
  const labelMap: Record<string, string> = {
    'requirement': '需求文档',
    'design': '设计文档',
    'doc': 'Word文档',
    'docx': 'Word文档',
    'pdf': 'PDF文档',
    'xls': 'Excel表格',
    'xlsx': 'Excel表格',
    'ppt': 'PPT演示',
    'pptx': 'PPT演示',
    'txt': '文本文件',
    'md': 'Markdown',
    'jpg': 'JPEG图片',
    'jpeg': 'JPEG图片',
    'png': 'PNG图片',
    'gif': 'GIF图片',
    'svg': 'SVG图片',
    'zip': 'ZIP压缩包',
    'rar': 'RAR压缩包',
    'default': '未知文件'
  }

  const key = fileType?.toLowerCase() || 'default'
  return labelMap[key] || '未知文件'
}

// 新增方法：格式化日期
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return '未知日期'
  }
}

// 新增方法：处理文档点击
const handleDocumentClick = async (file: RelatedFile): Promise<void> => {
  if (!file.fileName) {
    $q.notify({
      message: '文件名为空，无法打开',
      type: 'warning'
    })
    return
  }

  // 如果有文件URL，直接打开
  if (file.fileUrl) {
    window.open(file.fileUrl, '_blank')
    return
  }

  // 否则使用本地路径打开
  const fullPath = `${requirementBasePath}${file.fileName}`

  try {
    const response = await fetch(`http://localhost:8090/open?path=${encodeURIComponent(fullPath)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      $q.notify({
        message: `文件 "${file.fileName}" 已打开`,
        type: 'positive'
      })
    } else {
      $q.notify({
        message: result.message || '打开文件失败',
        type: 'negative'
      })
    }
  } catch (error) {
    console.error('无法打开文件:', error)
    $q.notify({
      message: '无法打开文件，请确保本地服务已启动',
      type: 'negative'
    })
  }
}

// 新增方法：处理添加文档
const handleAddDocument = (task: DevTaskVO): void => {
  $q.notify({
    message: `为任务 "${task.requirementName}" 添加关联文档功能待实现`,
    type: 'info'
  })
  // TODO: 实现添加文档功能
}

// 删除重复的sysFileApi声明

// 这个旧版本的函数已经被简化的新版本替代，删除此版本

// 旧的uploadFile函数已被简化的新版本替代，删除此旧版本

// 这些函数已经被简化的新函数替代，不再需要

// 添加下载文件方法
const downloadFile = (file: SysFile): void => {
  if (file.fileUrl) {
    // 创建一个临时的 a 标签来下载文件
    const link = document.createElement('a')
    link.href = file.fileUrl
    link.download = file.fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    $q.notify({
      message: '文件下载链接不可用',
      color: 'warning',
      position: 'top',
      timeout: 2000
    })
  }
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

// 新建任务省略号按钮样式
.new-task-btn {
  background: transparent !important;
  color: $cursor-text !important;

  &:hover {
    background: rgba($cursor-text, 0.08) !important;
  }

  &:active {
    background: rgba($cursor-text, 0.12) !important;
  }
}

// 下拉菜单内容样式
.q-list {
  .q-item {
    border-radius: 8px;
    margin: 4px 8px;

    &:hover {
      background: rgba($cursor-primary, 0.08);
    }

    .q-item__label {
      color: $cursor-text;
      font-weight: 500;
    }

    .q-item__label--caption {
      color: $cursor-muted;
      font-size: 0.8rem;
    }
  }
}

.new-task-dialog {
  width: 90vw;
  max-width: 600px;
  min-width: 320px;
}

@media (max-width: 599px) {
  .new-task-dialog {
    width: 95vw;
    margin: 0 2.5vw;
  }
}

/* 自定义表格样式，保持原有的美观效果 */
.custom-task-table {
  /* 继承原有的表格样式 */
  border-radius: 8px;
}

.custom-task-table .q-table__top {
  display: none;
  /* 隐藏默认的表格顶部 */
}

.custom-task-table .q-table__bottom {
  display: none;
  /* 隐藏默认的表格底部 */
}



/* 优化表格列宽样式 */
.custom-task-table {
  width: 100%;
  table-layout: fixed;
  /* 固定表格布局以确保列宽按比例分配 */
}

/* 需求名称列优化 */
.requirement-name-cell {
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-border-color);
  width: 35% !important;
  min-width: 250px !important;
}

.requirement-name-content {
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  /* 使用100%宽度而不是固定像素 */
}

.requirement-name-content:hover {
  color: var(--q-primary);
}

/* 需求编号列优化 */
.requirement-id-cell {
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-border-color);
  width: 25% !important;
  min-width: 180px !important;
}

.requirement-id-content {
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.requirement-id-content:hover {
  color: var(--q-primary);
}

/* 系统分类列优化 */
.system-category-cell {
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-border-color);
  width: 15% !important;
  min-width: 100px !important;
}

.system-category-text {
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
}

/* 关联文档列优化 - 方案二样式 */
.documents-cell {
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-border-color);
  width: 15% !important;
  min-width: 120px !important;
}

.documents-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.documents-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.documents-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba($cursor-primary, 0.1);
    transform: scale(1.1);
  }
}

.documents-badge {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  border-radius: 8px;
}

.no-documents {
  color: $cursor-muted;
  font-size: 14px;
  text-align: center;
}

/* 文档弹出卡片样式 */
.documents-popup {
  .documents-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    border: 1px solid rgba($cursor-border, 0.2);
  }
}

.documents-list {
  max-height: 300px;
  overflow-y: auto;
}

.document-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 8px;

  &:hover {
    background-color: rgba($cursor-primary, 0.05);
    border-color: rgba($cursor-primary, 0.2);
    transform: translateX(2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.document-info {
  flex: 1;
  margin-left: 8px;
  margin-right: 8px;
}

.document-name {
  font-weight: 500;
  color: $cursor-text;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-all;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: $cursor-muted;
}

.document-type {
  background-color: rgba($cursor-primary, 0.1);
  color: $cursor-primary;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.document-date {
  color: $cursor-muted;
}

/* 操作列优化 */
.actions-cell {
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-border-color);
  width: 10% !important;
  min-width: 100px !important;
}

/* 保持原有的操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  transition: transform 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .requirement-name-cell {
    width: 30% !important;
  }

  .requirement-id-cell {
    width: 30% !important;
  }

  .system-category-cell {
    width: 15% !important;
  }

  .documents-cell {
    width: 15% !important;
  }

  .actions-cell {
    width: 10% !important;
  }
}

@media (max-width: 768px) {
  .custom-task-table {
    table-layout: auto;
    /* 在小屏幕上使用自动布局 */
  }

  .requirement-name-cell,
  .requirement-id-cell,
  .system-category-cell,
  .documents-cell,
  .actions-cell {
    width: auto !important;
    min-width: unset !important;
  }

  .requirement-name-cell {
    min-width: 200px !important;
  }

  .requirement-id-cell {
    min-width: 150px !important;
  }

  .documents-card {
    max-width: 90vw !important;
    margin: 0 auto;
  }
}

/* 滚动条样式优化 */
.documents-list::-webkit-scrollbar {
  width: 4px;
}

.documents-list::-webkit-scrollbar-track {
  background: rgba($cursor-border, 0.1);
  border-radius: 2px;
}

.documents-list::-webkit-scrollbar-thumb {
  background: rgba($cursor-primary, 0.3);
  border-radius: 2px;

  &:hover {
    background: rgba($cursor-primary, 0.5);
  }
}

/* 拖拽上传区域样式 */
.drag-upload-area {
  border: 2px dashed $cursor-border;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba($cursor-surface, 0.6);
  position: relative;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba($cursor-bg, 0.3);

  &:hover {
    border-color: $cursor-primary;
    background: rgba($cursor-primary, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba($cursor-primary, 0.15);

    .upload-icon {
      color: $cursor-primary !important;
      transform: scale(1.05);
    }

    .upload-title {
      color: $cursor-primary !important;
    }

    .upload-subtitle {
      color: $cursor-primary !important;
      opacity: 0.8;
    }
  }

  &.drag-over {
    border-color: $cursor-accent;
    background: rgba($cursor-accent, 0.12);
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba($cursor-accent, 0.25);

    .drag-upload-content {
      transform: scale(1.05);
    }

    .upload-icon {
      color: $cursor-accent !important;
      transform: scale(1.1) rotate(5deg);
    }

    .upload-title {
      color: $cursor-accent !important;
      font-weight: 600;
    }

    .upload-subtitle {
      color: $cursor-accent !important;
      opacity: 0.9;
    }
  }

  &.uploading {
    border-color: $cursor-success;
    background: rgba($cursor-success, 0.08);
    pointer-events: none;

    .upload-icon {
      color: $cursor-success !important;
      animation: pulse 2s infinite;
    }

    .upload-title {
      color: $cursor-success !important;
    }

    .upload-subtitle {
      color: $cursor-success !important;
      opacity: 0.7;
    }
  }
}

.drag-upload-content {
  transition: transform 0.3s ease;
  width: 100%;

  .upload-icon {
    transition: all 0.3s ease;
    color: $cursor-muted !important;
  }

  .upload-title {
    color: $cursor-text !important;
    transition: color 0.3s ease;
  }

  .upload-subtitle {
    color: $cursor-muted !important;
    transition: color 0.3s ease;
  }
}

/* 已上传文档列表样式优化 */
.uploaded-doc {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid $cursor-border;
  border-radius: 8px;
  background: rgba($cursor-surface, 0.8);
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 4px rgba($cursor-bg, 0.2);

  &:hover {
    border-color: $cursor-primary;
    background: rgba($cursor-primary, 0.08);
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba($cursor-primary, 0.15);
  }

  .q-icon {
    color: $cursor-primary;
  }

  .ellipsis {
    flex: 1;
    margin: 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    color: $cursor-text;
  }

  .q-btn {
    opacity: 0.7;
    transition: all 0.3s ease;
    color: $cursor-muted;

    &:hover {
      opacity: 1;
      color: $cursor-primary;
      transform: scale(1.1);
    }
  }
}

/* 动画定义 */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .drag-upload-area {
    padding: 24px 16px;
    min-height: 140px;

    .upload-title {
      font-size: 16px;
    }

    .upload-icon {
      font-size: 36px !important;
    }
  }
}
</style>
