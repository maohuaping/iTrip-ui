<template>
  <q-page class="task-management-page">
    <div class="page-container">
      <!-- 页面标题和统计 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">任务管理</h1>
          <div class="task-stats">
            <q-chip color="primary" text-color="white" icon="list">
              总计: {{ taskStats.total }}
            </q-chip>
            <q-chip color="orange" text-color="white" icon="schedule">
              待开始: {{ taskStats.pending }}
            </q-chip>
            <q-chip color="blue" text-color="white" icon="play_circle">
              进行中: {{ taskStats.inProgress }}
            </q-chip>
            <q-chip color="green" text-color="white" icon="check_circle">
              已完成: {{ taskStats.completed }}
            </q-chip>
            <q-chip color="red" text-color="white" icon="block">
              已阻塞: {{ taskStats.blocked }}
            </q-chip>
          </div>
        </div>
        
        <div class="header-actions">
          <q-btn
            color="primary"
            icon="add"
            label="新建任务"
            @click="showCreateDialog = true"
          />
        </div>
      </div>
      
      <!-- 筛选器 -->
      <div class="filters-section">
        <q-card class="filters-card">
          <q-card-section>
            <div class="filters-grid">
              <q-select
                v-model="filter.status"
                :options="statusOptions"
                label="状态筛选"
                clearable
                emit-value
                map-options
                dense
                outlined
              />
              
              <q-select
                v-model="filter.priority"
                :options="priorityOptions"
                label="优先级筛选"
                clearable
                emit-value
                map-options
                dense
                outlined
              />
              
              <q-select
                v-model="filter.type"
                :options="typeOptions"
                label="类型筛选"
                clearable
                emit-value
                map-options
                dense
                outlined
              />
              
              <q-input
                v-model="filter.assignee"
                label="负责人筛选"
                clearable
                dense
                outlined
              />
              
              <q-btn
                flat
                color="primary"
                icon="clear"
                label="清除筛选"
                @click="clearFilter"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- 任务列表 -->
      <div class="tasks-section">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <q-icon name="task_alt" size="4rem" color="grey-4" />
          <div class="empty-text">暂无任务</div>
          <q-btn
            color="primary"
            label="创建第一个任务"
            @click="showCreateDialog = true"
          />
        </div>
        
        <div v-else class="tasks-grid">
          <SubTaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @update:status="updateTaskStatus"
            @edit="editTask"
            @delete="deleteTask"
          />
        </div>
      </div>
    </div>
    
    <!-- 创建任务对话框 -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">创建新任务</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="createNewTask" class="task-form">
            <q-input
              v-model="newTask.title"
              label="任务标题"
              outlined
              dense
              :rules="[val => !!val || '请输入任务标题']"
              class="q-mb-md"
            />
            
            <q-input
              v-model="newTask.description"
              label="任务描述"
              type="textarea"
              outlined
              dense
              rows="3"
              class="q-mb-md"
            />
            
            <div class="form-row">
              <q-select
                v-model="newTask.priority"
                :options="priorityOptions"
                label="优先级"
                emit-value
                map-options
                outlined
                dense
                class="col"
              />
              
              <q-select
                v-model="newTask.type"
                :options="typeOptions"
                label="任务类型"
                emit-value
                map-options
                outlined
                dense
                class="col q-ml-md"
              />
            </div>
            
            <div class="form-row q-mt-md">
              <q-input
                v-model="newTask.assignee"
                label="负责人"
                outlined
                dense
                class="col"
              />
              
              <q-input
                v-model="newTask.estimatedHours"
                label="预估工时(小时)"
                type="number"
                outlined
                dense
                class="col q-ml-md"
              />
            </div>
            
            <q-input
              v-model="dueDateString"
              label="截止日期"
              outlined
              dense
              class="q-mt-md"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dueDateString" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="确定" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            
            <q-input
              v-model="tagsString"
              label="标签 (用逗号分隔)"
              outlined
              dense
              class="q-mt-md"
              hint="例如: 前端,API,紧急"
            />
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" label="创建" @click="createNewTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- 编辑任务对话框 -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">编辑任务</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="updateExistingTask" class="task-form">
            <q-input
              v-model="editingTask.title"
              label="任务标题"
              outlined
              dense
              :rules="[val => !!val || '请输入任务标题']"
              class="q-mb-md"
            />
            
            <q-input
              v-model="editingTask.description"
              label="任务描述"
              type="textarea"
              outlined
              dense
              rows="3"
              class="q-mb-md"
            />
            
            <div class="form-row">
              <q-select
                v-model="editingTask.priority"
                :options="priorityOptions"
                label="优先级"
                emit-value
                map-options
                outlined
                dense
                class="col"
              />
              
              <q-select
                v-model="editingTask.type"
                :options="typeOptions"
                label="任务类型"
                emit-value
                map-options
                outlined
                dense
                class="col q-ml-md"
              />
            </div>
            
            <div class="form-row q-mt-md">
              <q-input
                v-model="editingTask.assignee"
                label="负责人"
                outlined
                dense
                class="col"
              />
              
              <q-input
                v-model="editingTask.estimatedHours"
                label="预估工时(小时)"
                type="number"
                outlined
                dense
                class="col q-ml-md"
              />
            </div>
            
            <q-input
              v-model="editingTask.actualHours"
              label="实际工时(小时)"
              type="number"
              outlined
              dense
              class="q-mt-md"
            />
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" label="保存" @click="updateExistingTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import SubTaskCard from 'src/components/SubTaskCard.vue'
import { useSubTasks } from 'src/composables/useSubTasks'
import {
  type SubTask,
  SubTaskStatus,
  SubTaskPriority,
  SubTaskType,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_TYPE_CONFIG
} from 'src/types/task-status'

const $q = useQuasar()

// 使用组合式函数
const {
  tasks,
  loading,
  filter,
  filteredTasks,
  taskStats,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  clearFilter,
  initializeSampleData
} = useSubTasks()

// 对话框状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)

// 新任务表单数据
const newTask = ref({
  title: '',
  description: '',
  priority: SubTaskPriority.MEDIUM,
  type: SubTaskType.OTHER,
  assignee: '',
  estimatedHours: undefined as number | undefined
})

const dueDateString = ref('')
const tagsString = ref('')

// 编辑任务数据
const editingTask = ref<Partial<SubTask>>({})

// 选项数据
const statusOptions = computed(() => 
  Object.entries(TASK_STATUS_CONFIG).map(([value, config]) => ({
    label: config.label,
    value: value as SubTaskStatus
  }))
)

const priorityOptions = computed(() => 
  Object.entries(TASK_PRIORITY_CONFIG).map(([value, config]) => ({
    label: config.label,
    value: value as SubTaskPriority
  }))
)

const typeOptions = computed(() => 
  Object.entries(TASK_TYPE_CONFIG).map(([value, config]) => ({
    label: config.label,
    value: value as SubTaskType
  }))
)

// 方法
const createNewTask = () => {
  if (!newTask.value.title.trim()) {
    $q.notify({
      message: '请输入任务标题',
      color: 'negative',
      icon: 'warning'
    })
    return
  }
  
  const taskData = {
    ...newTask.value,
    status: SubTaskStatus.PENDING,
    reporter: '当前用户', // 实际项目中应该从用户状态获取
    dueDate: dueDateString.value ? new Date(dueDateString.value) : undefined,
    tags: tagsString.value ? tagsString.value.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
  }
  
  createTask(taskData)
  
  // 重置表单
  newTask.value = {
    title: '',
    description: '',
    priority: SubTaskPriority.MEDIUM,
    type: SubTaskType.OTHER,
    assignee: '',
    estimatedHours: undefined
  }
  dueDateString.value = ''
  tagsString.value = ''
  showCreateDialog.value = false
}

const editTask = (task: SubTask) => {
  editingTask.value = { ...task }
  showEditDialog.value = true
}

const updateExistingTask = () => {
  if (!editingTask.value.id || !editingTask.value.title?.trim()) {
    $q.notify({
      message: '任务信息不完整',
      color: 'negative',
      icon: 'warning'
    })
    return
  }
  
  updateTask(editingTask.value.id, editingTask.value)
  showEditDialog.value = false
}

// 生命周期
onMounted(() => {
  initializeSampleData()
})
</script>

<style lang="scss" scoped>
.task-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.task-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filters-section {
  margin-bottom: 24px;
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.tasks-section {
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-text {
  font-size: 1.2rem;
  color: #666;
  margin: 16px 0 24px 0;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.task-form {
  .form-row {
    display: flex;
    gap: 16px;
    
    @media (max-width: 600px) {
      flex-direction: column;
      gap: 16px;
    }
  }
}

// 动画效果
.tasks-grid > * {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>