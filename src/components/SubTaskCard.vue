<template>
  <q-card class="subtask-card" :class="`status-${task.status}`">
    <q-card-section class="card-header">
      <div class="task-info">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-meta">
          <q-chip
            :color="statusConfig.color"
            :icon="statusConfig.icon"
            text-color="white"
            size="sm"
            dense
          >
            {{ statusConfig.label }}
          </q-chip>
          
          <q-chip
            :color="priorityConfig.color"
            :icon="priorityConfig.icon"
            text-color="white"
            size="sm"
            dense
            class="q-ml-xs"
          >
            {{ priorityConfig.label }}
          </q-chip>
          
          <q-chip
            :color="typeConfig.color"
            :icon="typeConfig.icon"
            text-color="white"
            size="sm"
            dense
            class="q-ml-xs"
          >
            {{ typeConfig.label }}
          </q-chip>
        </div>
      </div>
      
      <div class="task-actions">
        <q-btn-dropdown
          flat
          round
          dense
          icon="more_vert"
          dropdown-icon="none"
        >
          <q-list>
            <q-item-label header>更改状态</q-item-label>
            <q-item
              v-for="status in availableTransitions"
              :key="status"
              clickable
              @click="changeStatus(status)"
              v-close-popup
            >
              <q-item-section avatar>
                <q-icon :name="getStatusConfig(status).icon" :color="getStatusConfig(status).color" />
              </q-item-section>
              <q-item-section>{{ getStatusConfig(status).label }}</q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable @click="editTask" v-close-popup>
              <q-item-section avatar>
                <q-icon name="edit" color="primary" />
              </q-item-section>
              <q-item-section>编辑任务</q-item-section>
            </q-item>
            
            <q-item clickable @click="deleteTask" v-close-popup>
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>
              <q-item-section>删除任务</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>
    
    <q-card-section v-if="task.description" class="task-description">
      <p>{{ task.description }}</p>
    </q-card-section>
    
    <q-card-section class="task-details">
      <div class="detail-row">
        <q-icon name="person" size="sm" class="detail-icon" />
        <span class="detail-label">负责人:</span>
        <span class="detail-value">{{ task.assignee || '未分配' }}</span>
      </div>
      
      <div class="detail-row" v-if="task.dueDate">
        <q-icon name="schedule" size="sm" class="detail-icon" />
        <span class="detail-label">截止时间:</span>
        <span class="detail-value">{{ formatDate(task.dueDate) }}</span>
      </div>
      
      <div class="detail-row" v-if="task.estimatedHours">
        <q-icon name="timer" size="sm" class="detail-icon" />
        <span class="detail-label">预估时间:</span>
        <span class="detail-value">{{ task.estimatedHours }}h</span>
      </div>
      
      <div class="detail-row" v-if="task.actualHours">
        <q-icon name="hourglass_full" size="sm" class="detail-icon" />
        <span class="detail-label">实际时间:</span>
        <span class="detail-value">{{ task.actualHours }}h</span>
      </div>
    </q-card-section>
    
    <q-card-section v-if="task.tags && task.tags.length > 0" class="task-tags">
      <q-chip
        v-for="tag in task.tags"
        :key="tag"
        size="sm"
        outline
        color="primary"
        class="q-mr-xs"
      >
        {{ tag }}
      </q-chip>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  type SubTask,
  SubTaskStatus,
  getStatusConfig,
  getPriorityConfig,
  getTypeConfig,
  getAvailableTransitions,
  isValidTransition
} from 'src/types/task-status'

interface Props {
  task: SubTask
}

interface Emits {
  (e: 'update:status', taskId: string, status: SubTaskStatus): void
  (e: 'edit', task: SubTask): void
  (e: 'delete', taskId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const $q = useQuasar()

// 计算属性
const statusConfig = computed(() => getStatusConfig(props.task.status))
const priorityConfig = computed(() => getPriorityConfig(props.task.priority))
const typeConfig = computed(() => getTypeConfig(props.task.type))
const availableTransitions = computed(() => getAvailableTransitions(props.task.status))

// 方法
const changeStatus = (newStatus: SubTaskStatus) => {
  if (isValidTransition(props.task.status, newStatus)) {
    emit('update:status', props.task.id, newStatus)
    
    $q.notify({
      message: `任务状态已更改为: ${getStatusConfig(newStatus).label}`,
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
  } else {
    $q.notify({
      message: '无效的状态转换',
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  }
}

const editTask = () => {
  emit('edit', props.task)
}

const deleteTask = () => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这个任务吗？此操作不可撤销。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('delete', props.task.id)
    
    $q.notify({
      message: '任务已删除',
      color: 'positive',
      icon: 'delete',
      position: 'top'
    })
  })
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>
.subtask-card {
  margin-bottom: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  // 根据状态设置左边框颜色
  &.status-pending {
    border-left-color: #9e9e9e;
  }
  
  &.status-in_progress {
    border-left-color: #2196f3;
  }
  
  &.status-completed {
    border-left-color: #4caf50;
  }
  
  &.status-paused {
    border-left-color: #ff9800;
  }
  
  &.status-cancelled {
    border-left-color: #f44336;
  }
  
  &.status-blocked {
    border-left-color: #ff5722;
  }
  
  &.status-under_review {
    border-left-color: #9c27b0;
  }
  
  &.status-rejected {
    border-left-color: #d32f2f;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 8px;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--q-primary);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.task-actions {
  margin-left: 16px;
}

.task-description {
  padding-top: 0;
  padding-bottom: 8px;
  
  p {
    margin: 0;
    color: #666;
    line-height: 1.5;
  }
}

.task-details {
  padding-top: 8px;
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-icon {
  margin-right: 8px;
  color: #666;
}

.detail-label {
  margin-right: 8px;
  color: #666;
  min-width: 80px;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.task-tags {
  padding-top: 8px;
  border-top: 1px solid #eee;
}

// 响应式设计
@media (max-width: 600px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-actions {
    margin-left: 0;
    margin-top: 8px;
    align-self: flex-end;
  }
  
  .task-meta {
    margin-top: 8px;
  }
  
  .detail-row {
    flex-wrap: wrap;
  }
  
  .detail-label {
    min-width: auto;
    margin-right: 4px;
  }
}
</style>