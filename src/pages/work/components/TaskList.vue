<template>
  <section id="tasks" class="q-mb-xl glass rounded-borders-xl">
    <div class="q-pa-lg">
      <!-- 标题栏优化 -->
      <div class="row justify-between items-center q-mb-lg">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="task_alt" size="28px" class="q-mr-sm" />
          任务列表
        </h2>
        <q-btn 
          color="primary" 
          size="md" 
          icon="add" 
          label="新建任务" 
          @click="openNewTaskDialog"
          class="q-px-md"
          unelevated
          rounded
        />
      </div>

      <!-- 标签页样式优化 -->
      <q-tabs
        v-model="activeTab"
        class="text-weight-medium"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
        dense
      >
        <q-tab name="incoming" class="q-px-md">
          <q-icon name="call_received" class="q-mr-xs" />
          呼入任务
          <q-badge color="primary" floating rounded>{{ incomingTasks.length }}</q-badge>
        </q-tab>
        <q-tab name="outgoing" class="q-px-md">
          <q-icon name="call_made" class="q-mr-xs" />
          呼出任务
          <q-badge color="teal" floating rounded>{{ outgoingTasks.length }}</q-badge>
        </q-tab>
      </q-tabs>

      <q-separator class="q-mb-md" />

      <!-- 任务卡片样式优化 -->
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="incoming" class="q-pa-none">
          <div class="row q-col-gutter-md">
            <div v-for="task in visibleIncomingTasks" 
                 :key="task.id" 
                 class="col-12"
            >
              <q-card flat bordered class="task-card">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="row items-center q-gutter-x-sm">
                        <q-avatar size="32px" color="primary" text-color="white" icon="assignment" />
                        <div class="column">
                          <div 
                            class="text-subtitle1 text-weight-medium text-dark ellipsis cursor-pointer" 
                            @click="copyToClipboard(task.requirementName)"
                            title="点击复制任务名称"
                          >
                            {{ task.requirementName }}
                          </div>
                          <div 
                            class="text-caption text-grey-7 cursor-pointer"
                            @click="copyToClipboard(task.requirementId)"
                            title="点击复制需求编号"
                          >
                            #{{ task.requirementId }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="row items-center q-gutter-x-sm q-ml-md">
                      <q-chip
                        v-for="tag in getTaskTags(task)"
                        :key="tag.label"
                        dense
                        size="sm"
                        :icon="tag.icon"
                        :color="tag.color"
                        :text-color="tag.textColor"
                        :label="tag.label"
                        :clickable="!!tag.clickable"
                        @click="tag.onClick ? tag.onClick() : null"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- 展示更多按钮 -->
          <div v-if="incomingTasks.length > maxVisibleTasks && !showAllIncomingTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              :label="`查看更多 (${incomingTasks.length - maxVisibleTasks})`"
              @click="showAllIncomingTasks = true"
              icon-right="expand_more"
            />
          </div>

          <!-- 收起按钮 -->
          <div v-if="showAllIncomingTasks && incomingTasks.length > maxVisibleTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              label="收起"
              @click="showAllIncomingTasks = false"
              icon-right="expand_less"
            />
          </div>
        </q-tab-panel>

        <!-- 呼出任务面板 -->
        <q-tab-panel name="outgoing" class="q-pa-none">
          <div class="row q-col-gutter-md">
            <div v-for="task in visibleOutgoingTasks" 
                 :key="task.id" 
                 class="col-12"
            >
              <q-card flat bordered class="task-card">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="row items-center q-gutter-x-sm">
                        <q-avatar size="32px" color="teal" text-color="white" icon="assignment" />
                        <div class="column">
                          <div 
                            class="text-subtitle1 text-weight-medium text-dark ellipsis cursor-pointer" 
                            @click="copyToClipboard(task.requirementName)"
                            title="点击复制任务名称"
                          >
                            {{ task.requirementName }}
                          </div>
                          <div 
                            class="text-caption text-grey-7 cursor-pointer"
                            @click="copyToClipboard(task.requirementId)"
                            title="点击复制需求编号"
                          >
                            #{{ task.requirementId }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="row items-center q-gutter-x-sm q-ml-md">
                      <q-chip
                        v-for="tag in getTaskTags(task)"
                        :key="tag.label"
                        dense
                        size="sm"
                        :icon="tag.icon"
                        :color="tag.color"
                        :text-color="tag.textColor"
                        :label="tag.label"
                        :clickable="!!tag.clickable"
                        @click="tag.onClick ? tag.onClick() : null"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- 展示更多按钮 -->
          <div v-if="outgoingTasks.length > maxVisibleTasks && !showAllOutgoingTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              :label="`查看更多 (${outgoingTasks.length - maxVisibleTasks})`"
              @click="showAllOutgoingTasks = true"
              icon-right="expand_more"
            />
          </div>

          <!-- 收起按钮 -->
          <div v-if="showAllOutgoingTasks && outgoingTasks.length > maxVisibleTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              label="收起"
              @click="showAllOutgoingTasks = false"
              icon-right="expand_less"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </section>

  <q-dialog v-model="showNewTaskDialog">
    <new-task-dialog 
      :model-value="showNewTaskDialog"
      @update:model-value="showNewTaskDialog = $event"
      @create-task="handleTaskCreated" 
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getRequirement } from 'src/api/requirement/requirement'
import { Notify } from 'quasar'
// 导入NewTaskDialog组件
import NewTaskDialog from './NewTaskDialog.vue'

// 定义响应数据接口
interface TaskItem {
  id: number
  createdBy: number
  createdAt: string
  updatedBy: number
  updatedAt: string
  requirementId: string
  requirementName: string
  relatedRequirementDocs: string
  relatedDesignDocs: string
  systemCategory: 'callin' | 'callout'
  userId: number
}

// 活动标签页
const activeTab = ref('incoming')

// 控制新建任务对话框的显示
const showNewTaskDialog = ref(false)

// 任务数据
const incomingTasks = ref<Array<TaskItem>>([])
const outgoingTasks = ref<Array<TaskItem>>([])

// 控制展开/收起状态
const maxVisibleTasks = 4 // 默认显示的任务数量
const showAllIncomingTasks = ref(false)
const showAllOutgoingTasks = ref(false)

// 计算要显示的任务列表
const visibleIncomingTasks = computed(() => {
  return showAllIncomingTasks.value 
    ? incomingTasks.value 
    : incomingTasks.value.slice(0, maxVisibleTasks)
})

const visibleOutgoingTasks = computed(() => {
  return showAllOutgoingTasks.value 
    ? outgoingTasks.value 
    : outgoingTasks.value.slice(0, maxVisibleTasks)
})

// 获取任务数据
const fetchTasks = async () => {
  try {
    const requirementApi = getRequirement()
    const response = await requirementApi.requirementMe()
    
    if (response.data?.success && response.data.payload) {
      // 根据systemCategory字段区分呼入和呼出任务
      const allTasks = response.data.payload
      
      incomingTasks.value = allTasks.filter(task => task.systemCategory === 'callin')
      outgoingTasks.value = allTasks.filter(task => task.systemCategory === 'callout')
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

// 在组件挂载时获取数据
onMounted(fetchTasks)

// 转换任务标签
const getTaskTags = (task: TaskItem) => {
  const tags = []
  
  // 根据requirementId添加Git分支标签，用于根据需求号跳转对应的Gitee仓库
  if (task.requirementId) {
    tags.push({
      label: 'Git分支',
      color: 'blue-2',
      textColor: 'blue-8',
      clickable: true,
      onClick: () => handleSystemClick(task.systemCategory, task.requirementId)
    })
  }
  
  // 根据相关文档添加标签
  if (task.relatedRequirementDocs) {
    tags.push({
      label: '需求文档',
      color: 'green-2',
      textColor: 'green-8'
    })
  }
  
  if (task.relatedDesignDocs) {
    tags.push({
      label: '设计文档',
      color: 'purple-2',
      textColor: 'purple-8'
    })
  }
  
  return tags
}

// 添加系统点击处理方法
const handleSystemClick = (system: SystemType, branch: string) => {
  if (system === 'other') return
  
  const baseUrls = {
    callin: 'http://code.devops.piccnet/picc/_source/picc/picc__picc-life-ccin/Flex-Media/-/branches',
    callout: 'http://code.devops.piccnet/picc/_source/picc/picc__picc-life-ccout/Flex-Callout/-/branches'
  }
  
  const url = `${baseUrls[system]}?search=${branch}`
  window.open(url, '_blank')
}

// 确保SystemType类型定义正确
type SystemType = 'callin' | 'callout' | 'other'

// 复制文本到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // 复制成功提示
      Notify.create({
        message: '已复制到剪贴板',
        color: 'positive',
        position: 'top',
        timeout: 1000
      })
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 处理任务创建成功
const handleTaskCreated = () => {
  // 关闭对话框
  showNewTaskDialog.value = false
  // 重新获取任务列表
  fetchTasks()
}

// 修改emit定义，添加open-new-task事件的处理
const emit = defineEmits(['open-new-task'])

// 添加打开新建任务对话框的方法
const openNewTaskDialog = () => {
  showNewTaskDialog.value = true
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
</style>
