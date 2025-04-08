<template>
  <div class="work-page-container">
    
    <!-- 主内容区域 -->
    <q-page class="work-page-content">
      <!-- 主内容区域 -->
      <div class="q-pa-md">
        <div class="q-mx-auto" style="max-width: 1200px">
          <!-- 任务列表部分 -->
          <TaskList @open-new-task="showNewTaskModal = true" />

          <!-- 工作日志部分 -->
          <WorkLog />
           
          <!-- 快速访问部分 -->
          <section id="quickaccess" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
            <div class="q-pa-md">
              <h2 class="text-h5 text-weight-bold text-dark q-mb-md">快速访问</h2>
              
              <div class="row q-col-gutter-md">
                <!-- 快速访问卡片 -->
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                  <q-card flat bordered class="cursor-pointer quick-access-card glass-card">
                    <q-card-section class="q-pa-md">
                      <div class="row items-center no-wrap">
                        <q-avatar color="blue-1" text-color="blue-8" icon="eva-code-outline" size="md" class="q-mr-sm" />
                        <div>
                          <div class="text-subtitle1 text-weight-medium text-dark">API 平台</div>
                          <div class="text-caption text-grey-5">接口文档和测试</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                  <q-card flat bordered class="cursor-pointer quick-access-card glass-card">
                    <q-card-section class="q-pa-md">
                      <div class="row items-center no-wrap">
                        <q-avatar color="green-1" text-color="green-8" icon="eva-folder-outline" size="md" class="q-mr-sm" />
                        <div>
                          <div class="text-subtitle1 text-weight-medium text-dark">代码仓库</div>
                          <div class="text-caption text-grey-5">项目源代码管理</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 使用新的独立组件 -->
      <NewTaskDialog v-model="showNewTaskModal" @create-task="handleCreateTask" />
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NewTaskDialog from './components/NewTaskDialog.vue'
import TaskList from './components/TaskList.vue'
import WorkLog from './components/WorkLog.vue'

// 新建任务模态框状态
const showNewTaskModal = ref(false)

// 处理创建任务
const handleCreateTask = (task) => {
  console.log('创建任务:', task)
  // 这里添加创建任务的逻辑
}

// 添加组件名称以解决ESLint警告
defineOptions({
  name: 'WorkPage'
})
</script>

<style lang="scss" scoped>
.work-page-container {
  display: flex;
  background: white;
  min-height: 100vh;
}

.work-page-content {
  flex: 1;
  margin-left: 0;
}

// 玻璃效果修改为适合白色背景的样式
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 自定义样式 - 更新颜色以适应白色背景
.task-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
  }
}

// 快速访问卡片样式
.quick-access-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
  }
}

// 确保内容溢出时显示省略号
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

// 添加部分样式
section {
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

// 标签链接样式
.badge-link {
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
}

// 暗色主题输入框改为亮色主题
.dark-field {
  .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input {
    color: #333;
  }
}

// 文档标签样式
.doc-checkbox {
  display: none;
}

.doc-label {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.doc-requirement {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
    
    &:hover {
      background: rgba(59, 130, 246, 0.3);
    }
  }
  
  &.doc-design {
    background: rgba(168, 85, 247, 0.2);
    color: #d8b4fe;
    
    &:hover {
      background: rgba(168, 85, 247, 0.3);
    }
  }
}

// 文档输入框样式
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

// 边框底部
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

// 任务项样式
.task-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
  }
}

// 任务点样式
.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  
  &.incoming-dot {
    background: #1976D2;
  }
  
  &.outgoing-dot {
    background: #26A69A;
  }
}

// 呼入任务项左边框
.task-item:has(.incoming-dot) {
  border-left-color: #1976D2;
}

// 呼出任务项左边框
.task-item:has(.outgoing-dot) {
  border-left-color: #26A69A;
}
</style>
