<template>
  <div class="work-page-header">
    <div class="header-left">
      <q-btn 
        flat 
        dense 
        round 
        :icon="collapsed ? 'menu_open' : 'menu'" 
        @click="$emit('toggle-menu')" 
        class="toggle-menu-btn" 
        color="primary"
        :title="collapsed ? '展开菜单' : '收起菜单'"
      />
      <div class="page-title">{{ title }}</div>
    </div>
    
    <div class="header-right">
      <div class="status-info">
        <q-chip 
          outline 
          color="primary" 
          text-color="primary" 
          icon="task_alt" 
          class="status-chip"
        >
          已完成: {{ statusInfo.completed }}
        </q-chip>
        
        <q-chip 
          outline 
          color="orange" 
          text-color="orange" 
          icon="pending" 
          class="status-chip"
        >
          待处理: {{ statusInfo.pending }}
        </q-chip>
        
        <q-chip 
          outline 
          color="blue-grey" 
          text-color="blue-grey" 
          icon="inventory" 
          class="status-chip"
        >
          总任务: {{ statusInfo.tasks }}
        </q-chip>
      </div>
      
      <div class="header-actions">
        <q-btn flat round dense icon="refresh" class="action-btn" title="刷新" />
        <q-btn flat round dense icon="settings" class="action-btn" title="设置" />
        <q-btn flat round dense icon="help_outline" class="action-btn" title="帮助" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WorkPageHeader'
})

// 定义组件属性
const props = defineProps({
  title: {
    type: String,
    default: '工作台'
  },
  statusInfo: {
    type: Object,
    default: () => ({
      tasks: 0,
      completed: 0,
      pending: 0
    })
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
defineEmits(['toggle-menu'])
</script>

<style lang="scss" scoped>
.work-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 60px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.toggle-menu-btn {
  margin-right: 16px;
  color: #1976D2;
  transition: all 0.3s ease;
  z-index: 100;
  background: rgba(25, 118, 210, 0.05);
  
  &:hover {
    background: rgba(25, 118, 210, 0.15);
    transform: scale(1.1);
  }
}

.page-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
}

.status-info {
  display: flex;
  margin-right: 24px;
}

.status-chip {
  margin: 0 4px;
  font-size: 0.8rem;
}

.header-actions {
  display: flex;
  
  .action-btn {
    margin-left: 4px;
    color: #718096;
    
    &:hover {
      color: #1976D2;
      background: rgba(25, 118, 210, 0.1);
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .status-chip {
    .q-chip__content {
      padding: 0 4px;
    }
    
    span {
      display: none;
    }
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1rem;
  }
  
  .status-info {
    margin-right: 8px;
  }
}
</style> 