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
          @click="$emit('open-new-task')"
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
            <div v-for="task in incomingTasks" 
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
                          <div class="text-subtitle1 text-weight-medium text-dark ellipsis">
                            {{ task.requirementName }}
                          </div>
                          <div class="text-caption text-grey-7">
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
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- 呼出任务面板 -->
        <q-tab-panel name="outgoing" class="q-pa-none">
          <div class="row q-col-gutter-md">
            <div v-for="task in outgoingTasks" 
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
                          <div class="text-subtitle1 text-weight-medium text-dark ellipsis">
                            {{ task.requirementName }}
                          </div>
                          <div class="text-caption text-grey-7">
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
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
      
      <div class="text-center q-mt-lg">
        <q-btn 
          :label="`查看全部${activeTab === 'incoming' ? '呼入' : '呼出'}任务`" 
          color="grey-7" 
          flat 
          class="full-width"
          icon-right="chevron_right"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRequirement } from 'src/api/requirement/requirement'

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

// 任务数据
const incomingTasks = ref<Array<TaskItem>>([])
const outgoingTasks = ref<Array<TaskItem>>([])

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
  
  // 根据requirementId添加Gitee的标签，用于根据需求号跳转对应的Gitee仓库
  if (task.requirementId) {
    tags.push({
      label: 'Gitee',
      color: 'blue-2',
      textColor: 'blue-8'
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

defineEmits(['open-new-task'])

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
