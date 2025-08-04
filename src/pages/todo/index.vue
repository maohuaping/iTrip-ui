<template>
  <q-page class="todo-page">
    <!-- Header -->
    <div class="todo-header">
      <div class="header-content">
        <div class="header-title">
          <h1 class="title-text">我的待办</h1>
          <p class="date-text">{{ currentDate }}</p>
        </div>
        <div class="header-icon">
          <q-icon name="checklist" size="2.5rem" />
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total-card">
          <div class="stat-icon">
            <q-icon name="format_list_bulleted" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalTodos }}</div>
            <div class="stat-label">总计</div>
          </div>
        </div>
        <div class="stat-card completed-card">
          <div class="stat-icon">
            <q-icon name="check_circle" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ completedTodos }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card pending-card">
          <div class="stat-icon">
            <q-icon name="schedule" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingTodos }}</div>
            <div class="stat-label">待完成</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Todo Input -->
    <div class="add-todo-section">
      <div class="add-todo-card">
        <div class="add-todo-content">
          <q-input
            v-model="newTodo"
            placeholder="今天要做什么？"
            borderless
            @keyup.enter="addTodo"
            class="add-todo-input"
          >
            <template v-slot:prepend>
              <q-icon name="add" color="primary" size="1.2rem" />
            </template>
          </q-input>
          <q-btn
            @click="addTodo"
            color="primary"
            icon="send"
            round
            unelevated
            :disable="!newTodo.trim()"
            class="add-btn"
          />
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-section">
      <div class="filter-buttons">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]"
        >
          <q-icon :name="filter.icon" />
          <span>{{ filter.label }}</span>
        </button>
      </div>
    </div>

    <!-- Todo List -->
    <div class="todo-list-container q-px-md">
      <q-list class="todo-list" separator>
        <q-slide-item
          v-for="todo in filteredTodos"
          :key="todo.id"
          @left="onTodoSwipeLeft"
          @right="onTodoSwipeRight"
          left-color="negative"
          right-color="positive"
        >
          <template v-slot:left>
            <q-icon name="delete" />
          </template>
          <template v-slot:right>
            <q-icon :name="todo.completed ? 'undo' : 'check'" />
          </template>

          <q-item
            :class="['todo-item', { 'completed': todo.completed }]"
            clickable
            @click="toggleTodo(todo.id)"
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="todo.completed"
                @update:model-value="toggleTodo(todo.id)"
                color="primary"
                keep-color
              />
            </q-item-section>

            <q-item-section>
              <q-item-label
                :class="{ 'text-strike text-grey-6': todo.completed }"
                class="todo-text"
              >
                {{ todo.text }}
              </q-item-label>
              <q-item-label caption class="todo-time">
                {{ formatTime(todo.createdAt) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center q-gutter-xs">
                <q-chip
                  v-if="todo.priority"
                  :color="getPriorityColor(todo.priority)"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ getPriorityText(todo.priority) }}
                </q-chip>
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  @click.stop="showTodoMenu(todo)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>

      <!-- Empty State -->
      <div v-if="filteredTodos.length === 0" class="empty-state q-pa-xl text-center">
        <q-icon name="task_alt" size="4rem" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">
          {{ getEmptyStateText() }}
        </div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          {{ getEmptyStateSubtext() }}
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="focusAddInput"
        class="fab-btn"
      />
    </q-page-sticky>

    <!-- Todo Menu Dialog -->
    <q-dialog v-model="showMenu" position="bottom">
      <q-card class="menu-card">
        <q-list>
          <q-item clickable @click="editTodo" v-close-popup>
            <q-item-section avatar>
              <q-icon name="edit" color="primary" />
            </q-item-section>
            <q-item-section>编辑</q-item-section>
          </q-item>
          <q-item clickable @click="setPriority" v-close-popup>
            <q-item-section avatar>
              <q-icon name="flag" color="warning" />
            </q-item-section>
            <q-item-section>设置优先级</q-item-section>
          </q-item>
          <q-item clickable @click="deleteTodo" v-close-popup>
            <q-item-section avatar>
              <q-icon name="delete" color="negative" />
            </q-item-section>
            <q-item-section>删除</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>

    <!-- Priority Dialog -->
    <q-dialog v-model="showPriorityDialog">
      <q-card class="priority-dialog">
        <q-card-section>
          <div class="text-h6">设置优先级</div>
        </q-card-section>
        <q-card-section>
          <q-option-group
            v-model="selectedPriority"
            :options="priorityOptions"
            color="primary"
            type="radio"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" color="primary" @click="updatePriority" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  priority?: 'high' | 'medium' | 'low'
}

const $q = useQuasar()

// Reactive data
const todos = ref<Todo[]>([])
const newTodo = ref('')
const activeFilter = ref('all')
const showMenu = ref(false)
const showPriorityDialog = ref(false)
const selectedTodo = ref<Todo | null>(null)
const selectedPriority = ref('')

// Filter options
const filters = [
  { label: '全部', value: 'all', icon: 'list' },
  { label: '待完成', value: 'pending', icon: 'schedule' },
  { label: '已完成', value: 'completed', icon: 'check_circle' }
]

// Priority options
const priorityOptions = [
  { label: '高优先级', value: 'high' },
  { label: '中优先级', value: 'medium' },
  { label: '低优先级', value: 'low' },
  { label: '无优先级', value: '' }
]

// Computed properties
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const totalTodos = computed(() => todos.value.length)
const completedTodos = computed(() => todos.value.filter(todo => todo.completed).length)
const pendingTodos = computed(() => todos.value.filter(todo => !todo.completed).length)

const filteredTodos = computed(() => {
  switch (activeFilter.value) {
    case 'completed':
      return todos.value.filter(todo => todo.completed)
    case 'pending':
      return todos.value.filter(todo => !todo.completed)
    default:
      return todos.value
  }
})

// Methods
const addTodo = () => {
  if (!newTodo.value.trim()) return

  const todo: Todo = {
    id: Date.now(),
    text: newTodo.value.trim(),
    completed: false,
    createdAt: new Date()
  }

  todos.value.unshift(todo)
  newTodo.value = ''
  
  $q.notify({
    message: '待办事项已添加',
    color: 'positive',
    icon: 'check_circle',
    position: 'top'
  })
}

const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    
    $q.notify({
      message: todo.completed ? '任务已完成' : '任务已恢复',
      color: todo.completed ? 'positive' : 'info',
      icon: todo.completed ? 'check_circle' : 'undo',
      position: 'top'
    })
  }
}

const deleteTodo = () => {
  if (!selectedTodo.value) return
  
  const index = todos.value.findIndex(t => t.id === selectedTodo.value!.id)
  if (index > -1) {
    todos.value.splice(index, 1)
    
    $q.notify({
      message: '待办事项已删除',
      color: 'negative',
      icon: 'delete',
      position: 'top'
    })
  }
}

const showTodoMenu = (todo: Todo) => {
  selectedTodo.value = todo
  showMenu.value = true
}

const editTodo = () => {
  if (!selectedTodo.value) return
  
  $q.dialog({
    title: '编辑待办事项',
    message: '请输入新的内容：',
    prompt: {
      model: selectedTodo.value.text,
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk((data: string) => {
    if (selectedTodo.value && data.trim()) {
      selectedTodo.value.text = data.trim()
      
      $q.notify({
        message: '待办事项已更新',
        color: 'positive',
        icon: 'edit',
        position: 'top'
      })
    }
  })
}

const setPriority = () => {
  if (!selectedTodo.value) return
  
  selectedPriority.value = selectedTodo.value.priority || ''
  showPriorityDialog.value = true
}

const updatePriority = () => {
  if (!selectedTodo.value) return
  
  selectedTodo.value.priority = selectedPriority.value as 'high' | 'medium' | 'low' | undefined
  
  $q.notify({
    message: '优先级已更新',
    color: 'positive',
    icon: 'flag',
    position: 'top'
  })
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'grey'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return ''
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const getEmptyStateText = () => {
  switch (activeFilter.value) {
    case 'completed': return '还没有完成的任务'
    case 'pending': return '太棒了！没有待完成的任务'
    default: return '还没有待办事项'
  }
}

const getEmptyStateSubtext = () => {
  switch (activeFilter.value) {
    case 'completed': return '完成一些任务来查看它们'
    case 'pending': return '你已经完成了所有任务'
    default: return '点击下方按钮添加第一个待办事项'
  }
}

const focusAddInput = () => {
  const input = document.querySelector('.add-todo-input input') as HTMLInputElement
  if (input) {
    input.focus()
  }
}

const onTodoSwipeLeft = ({ reset }: { reset: () => void }) => {
  if (selectedTodo.value) {
    deleteTodo()
  }
  reset()
}

const onTodoSwipeRight = ({ reset }: { reset: () => void }) => {
  if (selectedTodo.value) {
    toggleTodo(selectedTodo.value.id)
  }
  reset()
}

// Initialize with sample data
onMounted(() => {
  const sampleTodos: Todo[] = [
    {
      id: 1,
      text: '完成项目文档',
      completed: false,
      createdAt: new Date(Date.now() - 3600000),
      priority: 'high'
    },
    {
      id: 2,
      text: '回复客户邮件',
      completed: true,
      createdAt: new Date(Date.now() - 7200000),
      priority: 'medium'
    },
    {
      id: 3,
      text: '准备明天的会议',
      completed: false,
      createdAt: new Date(Date.now() - 1800000),
      priority: 'high'
    },
    {
      id: 4,
      text: '购买生活用品',
      completed: false,
      createdAt: new Date(Date.now() - 900000),
      priority: 'low'
    }
  ]
  
  todos.value = sampleTodos
})
</script>

<style lang="scss" scoped>
.todo-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.todo-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  border-radius: 0 0 24px 24px;
  margin-bottom: -12px;
  position: relative;
  z-index: 1;
}

.stats-container {
  position: relative;
  z-index: 2;
}

.stats-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.add-todo-container {
  position: relative;
  z-index: 2;
}

.add-todo-card {
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.add-todo-input {
  :deep(.q-field__control) {
    border-radius: 12px;
  }
}

.add-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.filter-container {
  position: relative;
  z-index: 2;
}

.filter-tabs {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  
  :deep(.q-tab) {
    border-radius: 12px;
    margin: 4px;
    transition: all 0.2s ease;
    
    &.q-tab--active {
      background: rgba(25, 118, 210, 0.1);
    }
  }
}

.todo-list-container {
  position: relative;
  z-index: 2;
  padding-bottom: 100px;
}

.todo-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.todo-item {
  transition: all 0.3s ease;
  border-radius: 0;
  
  &:hover {
    background: rgba(25, 118, 210, 0.05);
  }
  
  &.completed {
    opacity: 0.7;
    background: rgba(76, 175, 80, 0.05);
  }
}

.todo-text {
  font-size: 16px;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.todo-time {
  font-size: 12px;
  margin-top: 4px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
}

.fab-btn {
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(25, 118, 210, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.menu-card {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  
  .q-item {
    border-radius: 12px;
    margin: 4px 8px;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(25, 118, 210, 0.05);
    }
  }
}

.priority-dialog {
  border-radius: 16px;
  min-width: 280px;
  
  .q-card-section {
    padding: 20px;
  }
}

// Mobile optimizations
@media (max-width: 600px) {
  .todo-header {
    padding: 20px 16px;
  }
  
  .stats-container {
    padding: 0 16px 16px;
  }
  
  .add-todo-container,
  .filter-container,
  .todo-list-container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .todo-text {
    font-size: 15px;
  }
  
  .fab-btn {
    :deep(.q-btn__wrapper) {
      padding: 16px;
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .todo-page {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .add-todo-card,
  .todo-list,
  .empty-state {
    background: rgba(45, 55, 72, 0.95);
    color: white;
  }
  
  .filter-tabs {
    background: rgba(45, 55, 72, 0.9);
    color: white;
  }
}

// Animations
@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.todo-item {
  animation: slideInUp 0.3s ease;
}

// Swipe indicators
:deep(.q-slide-item__left),
:deep(.q-slide-item__right) {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

// Custom scrollbar
.todo-list-container {
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(25, 118, 210, 0.3);
    border-radius: 2px;
  }
}
</style>