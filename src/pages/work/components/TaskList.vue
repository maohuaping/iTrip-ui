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
          <!-- 数据统计区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat class="stat-card bg-gradient-primary text-white">
                <q-card-section class="text-center">
                  <div class="text-h4 text-weight-bold">{{ allTasks.length }}</div>
                  <div class="text-subtitle2">总任务数</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat class="stat-card bg-gradient-info text-white">
                <q-card-section class="text-center">
                  <div class="text-h4 text-weight-bold">{{ incomingTasks.length }}</div>
                  <div class="text-subtitle2">呼入任务</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat class="stat-card bg-gradient-accent text-white">
                <q-card-section class="text-center">
                  <div class="text-h4 text-weight-bold">{{ outgoingTasks.length }}</div>
                  <div class="text-subtitle2">呼出任务</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat class="stat-card bg-gradient-warning text-white">
                <q-card-section class="text-center">
                  <div class="text-h4 text-weight-bold">{{ getActiveTasksCount }}</div>
                  <div class="text-subtitle2">进行中</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- 高效数据展示区域 -->
          <div class="data-grid">
            <!-- 表头 -->
            <div class="data-header">
              <div class="data-cell header-cell">任务信息</div>
              <div class="data-cell header-cell">系统分类</div>
              <div class="data-cell header-cell">关联文档</div>
              <div class="data-cell header-cell">操作</div>
            </div>

            <!-- 数据行 -->
            <div v-for="task in allTasks" :key="task.id || `task-${Math.random()}`" class="data-row">
              <!-- 任务信息列 -->
              <div class="data-cell task-info">
                <div class="task-main">
                  <div class="task-title" @click="copyToClipboard(task.requirementName || '')" title="点击复制任务名称">
                    {{ task.requirementName || '未命名任务' }}
                  </div>
                  <div class="task-id" @click="copyToClipboard(task.requirementId || '')" title="点击复制需求编号">
                    #{{ task.requirementId || '无编号' }}
                  </div>
                </div>
              </div>

              <!-- 系统分类列 -->
              <div class="data-cell system-category">
                <q-chip :color="task.systemCategory === 'callin' ? 'info' : 'accent'" text-color="white" size="sm" dense
                  class="system-chip">
                  <q-icon :name="task.systemCategory === 'callin' ? 'call_in' : 'call_out'" class="q-mr-xs" />
                  {{ task.systemCategory === 'callin' ? '呼入' : '呼出' }}
                </q-chip>
              </div>

              <!-- 关联文档列 -->
              <div class="data-cell documents">
                <div class="doc-tags">
                  <q-chip v-if="task.relatedRequirementDocs" dense size="sm" color="info" text-color="white"
                    icon="description" label="需求文档" clickable
                    @click="handleRequirementClick(task, task.relatedRequirementDocs)" class="doc-chip" />
                  <q-chip v-if="task.relatedDesignDocs" dense size="sm" color="accent" text-color="white" icon="article"
                    label="设计文档" clickable @click="handleRequirementClick(task, task.relatedDesignDocs)"
                    class="doc-chip" />
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

          <!-- 分页组件 -->
          <div v-if="allTasks.length > 0" class="q-mt-lg text-center">
            <q-pagination v-model="currentPagination.current" :max="currentPagination.pages || 1" :max-pages="6"
              boundary-numbers direction-links @update:model-value="handlePageChange" color="primary"
              active-color="accent" />
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
import type { DevTask, QueryDevTaskInParam, IPageDevTask } from 'src/api/api.schemas'

// 初始化
const $q = useQuasar()
const devTaskApi = getDevTask()

// 控制新建任务对话框的显示
const showNewTaskDialog = ref(false)

// 任务数据
const incomingTasks = ref<DevTask[]>([])
const outgoingTasks = ref<DevTask[]>([])

// 合并所有任务的计算属性
const allTasks = computed(() => {
  return [...incomingTasks.value, ...outgoingTasks.value]
})

// 分页数据
const incomingPagination = ref<IPageDevTask>({
  current: 1,
  size: 5,
  total: 0,
  pages: 0
})

const outgoingPagination = ref<IPageDevTask>({
  current: 1,
  size: 5,
  total: 0,
  pages: 0
})

// 当前分页状态（用于显示）
const currentPagination = computed(() => {
  const total = (incomingPagination.value.total || 0) + (outgoingPagination.value.total || 0)
  const maxPages = Math.max(incomingPagination.value.pages || 0, outgoingPagination.value.pages || 0)

  return {
    current: Math.max(incomingPagination.value.current || 1, outgoingPagination.value.current || 1),
    size: 10, // 合并后的每页大小
    total,
    pages: maxPages
  }
})

// 过滤参数
const filterParams = ref({
  requirementId: '',
  requirementName: '',
  systemCategory: '',
  relatedRequirementDocs: '',
  relatedDesignDocs: '',
  createdAtRange: '',
  status: ''
})

// 控制高级筛选显示
const showAdvancedFilter = ref(false)
const showDatePicker = ref(false)

// 统一的搜索函数，通过参数控制搜索类型
const fetchTasks = async (systemCategory?: 'callin' | 'callout'): Promise<void> => {
  try {
    const params: QueryDevTaskInParam = {
      pageParam: {
        current: systemCategory === 'callin'
          ? incomingPagination.value.current || 1
          : outgoingPagination.value.current || 1,
        size: 5
      }
    }

    // 如果指定了系统分类，则添加到参数中
    if (systemCategory) {
      params.systemCategory = systemCategory
    }

    // 添加过滤条件
    if (filterParams.value.requirementId) {
      params.requirementId = filterParams.value.requirementId
    }
    if (filterParams.value.requirementName) {
      params.requirementName = filterParams.value.requirementName
    }
    if (filterParams.value.relatedRequirementDocs) {
      params.relatedRequirementDocs = filterParams.value.relatedRequirementDocs
    }
    if (filterParams.value.relatedDesignDocs) {
      params.relatedDesignDocs = filterParams.value.relatedDesignDocs
    }

    const response = await devTaskApi.queryDevTask(params)

    if (response.data?.isOk && response.data.okData) {
      const records = response.data.okData.records || []
      const paginationData = {
        current: response.data.okData.current || 1,
        size: response.data.okData.size || 10,
        total: response.data.okData.total || 0,
        pages: response.data.okData.pages || 0
      }

      if (systemCategory === 'callin') {
        incomingTasks.value = records
        incomingPagination.value = paginationData
        // 清空呼出任务数据
        outgoingTasks.value = []
        outgoingPagination.value.total = 0
      } else if (systemCategory === 'callout') {
        outgoingTasks.value = records
        outgoingPagination.value = paginationData
        // 清空呼入任务数据
        incomingTasks.value = []
        incomingPagination.value.total = 0
      } else {
        // 没有指定系统分类时，默认处理为呼入任务
        incomingTasks.value = records
        incomingPagination.value = paginationData
        // 清空呼出任务数据
        outgoingTasks.value = []
        outgoingPagination.value.total = 0
      }
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    $q.notify({
      message: '加载任务列表出错',
      color: 'negative',
      position: 'top',
      timeout: 1500
    })
  }
}

// 搜索处理 - 使用统一函数
const handleSearch = () => {
  // 根据系统分类选择，只进行一次搜索
  if (filterParams.value.systemCategory === 'callin') {
    fetchTasks('callin')
  } else if (filterParams.value.systemCategory === 'callout') {
    fetchTasks('callout')
  } else {
    // 没有选择系统分类时，根据其他过滤条件智能判断
    // 如果设置了需求编号、需求名称等具体条件，优先搜索呼入任务
    if (filterParams.value.requirementId || filterParams.value.requirementName ||
      filterParams.value.relatedRequirementDocs || filterParams.value.relatedDesignDocs) {
      fetchTasks('callin')
    } else {
      // 没有具体过滤条件时，默认搜索呼入任务
      fetchTasks('callin')
    }
  }
}

// 重置过滤条件 - 重置后查询所有任务
const handleReset = () => {
  filterParams.value = {
    requirementId: '',
    requirementName: '',
    systemCategory: '',
    relatedRequirementDocs: '',
    relatedDesignDocs: '',
    createdAtRange: '',
    status: ''
  }

  // 重置分页
  incomingPagination.value.current = 1
  outgoingPagination.value.current = 1

  // 重置后查询所有任务
  fetchTasks('callin')
  fetchTasks('callout')
}

// 处理过滤条件变化 - 只重置分页，不自动查询
const handleFilterChange = () => {
  // 只重置分页到第一页，不自动查询
  incomingPagination.value.current = 1
  outgoingPagination.value.current = 1
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchTasks('callin')
  fetchTasks('callout')
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
      fetchTasks(systemCategory)

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
  { label: '呼出系统', value: 'callout' },
  { label: '其他系统', value: 'other' }
]

// 添加状态选项
const statusOptions = [
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已取消', value: 'cancelled' }
]

// 添加分页处理方法
const handlePageChange = (page: number): void => {
  // 根据当前过滤条件决定更新哪个分页
  if (filterParams.value.systemCategory === 'callin') {
    incomingPagination.value.current = page
    fetchTasks('callin')
  } else if (filterParams.value.systemCategory === 'callout') {
    outgoingPagination.value.current = page
    fetchTasks('callout')
  } else {
    // 没有选择系统分类时，默认更新呼入任务分页
    incomingPagination.value.current = page
    fetchTasks('callin')
  }
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
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 1px;
    background-color: $cursor-border;
    padding: 12px 16px;
    font-weight: bold;
    color: $cursor-text;
    font-size: 0.9rem;
  }

  .data-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
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

    &.task-info {
      .task-main {
        flex: 1;
      }

      .task-title {
        font-weight: 500;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

      .task-id {
        font-size: 0.85rem;
        color: $cursor-muted;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &.system-category {
      .system-chip {
        font-weight: 500;
        cursor: pointer;

        &:hover {
          opacity: 0.9;
        }
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
  background: linear-gradient(135deg, $cursor-info 0%, lighten($cursor-info, 15%) 100%) !important;
}

.bg-gradient-accent {
  background: linear-gradient(135deg, $cursor-accent 0%, lighten($cursor-accent, 15%) 100%) !important;
}

.bg-gradient-warning {
  background: linear-gradient(135deg, $cursor-warning 0%, lighten($cursor-warning, 15%) 100%) !important;
}
</style>
