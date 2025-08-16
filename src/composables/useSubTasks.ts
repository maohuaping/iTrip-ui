import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  type SubTask,
  SubTaskStatus,
  SubTaskPriority,
  SubTaskType,
  isValidTransition
} from 'src/types/task-status'

/**
 * 子任务管理的组合式函数
 */
export function useSubTasks() {
  const $q = useQuasar()
  
  // 响应式数据
  const tasks = ref<SubTask[]>([])
  const loading = ref(false)
  const filter = ref({
    status: null as SubTaskStatus | null,
    priority: null as SubTaskPriority | null,
    type: null as SubTaskType | null,
    assignee: null as string | null
  })
  
  // 计算属性
  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      if (filter.value.status && task.status !== filter.value.status) return false
      if (filter.value.priority && task.priority !== filter.value.priority) return false
      if (filter.value.type && task.type !== filter.value.type) return false
      if (filter.value.assignee && task.assignee !== filter.value.assignee) return false
      return true
    })
  })
  
  const taskStats = computed(() => {
    const stats = {
      total: tasks.value.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      blocked: 0,
      cancelled: 0
    }
    
    tasks.value.forEach(task => {
      switch (task.status) {
        case SubTaskStatus.PENDING:
          stats.pending++
          break
        case SubTaskStatus.IN_PROGRESS:
          stats.inProgress++
          break
        case SubTaskStatus.COMPLETED:
          stats.completed++
          break
        case SubTaskStatus.BLOCKED:
          stats.blocked++
          break
        case SubTaskStatus.CANCELLED:
          stats.cancelled++
          break
      }
    })
    
    return stats
  })
  
  // 方法
  const createTask = (taskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: SubTask = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    tasks.value.push(newTask)
    
    $q.notify({
      message: '任务创建成功',
      color: 'positive',
      icon: 'add_task'
    })
    
    return newTask
  }
  
  const updateTaskStatus = (taskId: string, newStatus: SubTaskStatus) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) {
      $q.notify({
        message: '任务不存在',
        color: 'negative',
        icon: 'error'
      })
      return false
    }
    
    if (!isValidTransition(task.status, newStatus)) {
      $q.notify({
        message: '无效的状态转换',
        color: 'negative',
        icon: 'error'
      })
      return false
    }
    
    task.status = newStatus
    task.updatedAt = new Date()
    
    // 如果任务完成，记录完成时间
    if (newStatus === SubTaskStatus.COMPLETED && !task.actualHours && task.estimatedHours) {
      task.actualHours = task.estimatedHours
    }
    
    return true
  }
  
  const updateTask = (taskId: string, updates: Partial<SubTask>) => {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      $q.notify({
        message: '任务不存在',
        color: 'negative',
        icon: 'error'
      })
      return false
    }
    
    tasks.value[taskIndex] = {
      ...tasks.value[taskIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    $q.notify({
      message: '任务更新成功',
      color: 'positive',
      icon: 'edit'
    })
    
    return true
  }
  
  const deleteTask = (taskId: string) => {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      $q.notify({
        message: '任务不存在',
        color: 'negative',
        icon: 'error'
      })
      return false
    }
    
    tasks.value.splice(taskIndex, 1)
    
    $q.notify({
      message: '任务删除成功',
      color: 'positive',
      icon: 'delete'
    })
    
    return true
  }
  
  const getTasksByStatus = (status: SubTaskStatus) => {
    return tasks.value.filter(task => task.status === status)
  }
  
  const getTasksByPriority = (priority: SubTaskPriority) => {
    return tasks.value.filter(task => task.priority === priority)
  }
  
  const getOverdueTasks = () => {
    const now = new Date()
    return tasks.value.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== SubTaskStatus.COMPLETED &&
      task.status !== SubTaskStatus.CANCELLED
    )
  }
  
  const setFilter = (newFilter: Partial<typeof filter.value>) => {
    filter.value = { ...filter.value, ...newFilter }
  }
  
  const clearFilter = () => {
    filter.value = {
      status: null,
      priority: null,
      type: null,
      assignee: null
    }
  }
  
  // 初始化示例数据
  const initializeSampleData = () => {
    const sampleTasks: SubTask[] = [
      {
        id: '1',
        title: '实现用户登录功能',
        description: '开发用户登录页面和相关API接口',
        status: SubTaskStatus.IN_PROGRESS,
        priority: SubTaskPriority.HIGH,
        type: SubTaskType.DEVELOPMENT,
        assignee: '张三',
        reporter: '李四',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 3600000),
        dueDate: new Date(Date.now() + 86400000 * 3),
        estimatedHours: 8,
        actualHours: 5,
        tags: ['前端', 'API', '认证']
      },
      {
        id: '2',
        title: '编写API文档',
        description: '为新开发的API接口编写详细文档',
        status: SubTaskStatus.PENDING,
        priority: SubTaskPriority.MEDIUM,
        type: SubTaskType.DOCUMENTATION,
        assignee: '王五',
        reporter: '李四',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        dueDate: new Date(Date.now() + 86400000 * 5),
        estimatedHours: 4,
        tags: ['文档', 'API']
      },
      {
        id: '3',
        title: 'UI设计评审',
        description: '对新版本的UI设计进行评审',
        status: SubTaskStatus.UNDER_REVIEW,
        priority: SubTaskPriority.HIGH,
        type: SubTaskType.REVIEW,
        assignee: '赵六',
        reporter: '李四',
        createdAt: new Date(Date.now() - 3600000 * 6),
        updatedAt: new Date(Date.now() - 3600000 * 2),
        dueDate: new Date(Date.now() + 86400000),
        estimatedHours: 2,
        tags: ['设计', '评审']
      },
      {
        id: '4',
        title: '数据库性能优化',
        description: '优化查询性能，减少响应时间',
        status: SubTaskStatus.COMPLETED,
        priority: SubTaskPriority.URGENT,
        type: SubTaskType.DEVELOPMENT,
        assignee: '张三',
        reporter: '李四',
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(Date.now() - 86400000),
        dueDate: new Date(Date.now() - 86400000 * 2),
        estimatedHours: 12,
        actualHours: 10,
        tags: ['数据库', '性能', '优化']
      }
    ]
    
    tasks.value = sampleTasks
  }
  
  // 工具函数
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  return {
    // 响应式数据
    tasks,
    loading,
    filter,
    
    // 计算属性
    filteredTasks,
    taskStats,
    
    // 方法
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    setFilter,
    clearFilter,
    initializeSampleData
  }
}