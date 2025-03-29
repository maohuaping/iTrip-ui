<template>
  <div class="work-page-container">
    <!-- 引入侧边栏组件 -->
    <WorkSidebar />
    
    <!-- 主内容区域 -->
    <q-page class="work-page-content">
      <!-- 主内容区域 -->
      <div class="q-pa-md">
        <div class="q-mx-auto" style="max-width: 1200px">
          <!-- 任务列表部分 -->
          <section id="tasks" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
            <div class="q-pa-md">
              <div class="row justify-between q-mb-md">
                <h2 class="text-h5 text-weight-bold text-white q-my-none">任务列表</h2>
                <div class="row q-gutter-sm">
                  <q-btn color="blue-6" size="sm" icon="eva-plus-outline" label="新建任务" @click="showNewTaskModal = true" />
                  <q-btn flat color="grey-5" size="sm" label="筛选" icon="eva-funnel-outline" />
                </div>
              </div>

              <!-- 两栏布局：呼入/呼出 -->
              <div class="row q-col-gutter-md">
                <!-- 呼入任务列表 -->
                <div class="col-12 col-md-6">
                  <div class="row items-center q-mb-sm">
                    <q-icon name="eva-corner-left-down-outline" color="blue-6" size="sm" class="q-mr-sm" />
                    <h3 class="text-subtitle1 text-weight-medium text-slate-300 q-my-none">呼入任务</h3>
                  </div>
                  
                  <div class="q-gutter-y-sm">
                    <!-- 呼入任务项 1 -->
                    <q-card flat bordered class="task-card q-pa-sm cursor-pointer glass-card" style="border-left: 4px solid #1976D2;">
                      <q-card-section class="q-pa-sm">
                        <div class="column q-gutter-y-sm">
                          <div class="row items-center q-gutter-x-md">
                            <div class="row items-center" style="min-width: 140px">
                              <div class="q-mr-sm" style="width: 8px; height: 8px; border-radius: 50%; background: #1976D2;"></div>
                              <q-btn flat dense padding="none" no-caps text-color="grey-5" href="#" class="text-caption">
                                28241226890
                              </q-btn>
                            </div>
                            <div class="ellipsis">
                              <q-btn flat dense padding="none" no-caps text-color="white" href="#" class="text-body2">
                                有广告信息需要发布广告位的服务
                              </q-btn>
                            </div>
                            <q-badge color="blue-2" text-color="blue-8" label="呼入" />
                          </div>
                          
                          <div class="row items-center">
                            <div style="min-width: 140px">
                              <q-badge color="amber-2" text-color="amber-8" label="Gitee" class="q-ml-md" />
                            </div>
                            <div class="row q-gutter-x-xs">
                              <q-badge color="blue-2" text-color="blue-8" label="需求" class="badge-link" />
                              <q-badge color="purple-2" text-color="purple-8" label="设计" class="badge-link" />
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>

                    <!-- 呼入任务项 2 -->
                    <q-card flat bordered class="task-card q-pa-sm cursor-pointer glass-card" style="border-left: 4px solid #1976D2;">
                      <q-card-section class="q-pa-sm">
                        <div class="column q-gutter-y-sm">
                          <div class="row items-center q-gutter-x-md">
                            <div class="row items-center" style="min-width: 140px">
                              <div class="q-mr-sm" style="width: 8px; height: 8px; border-radius: 50%; background: #1976D2;"></div>
                              <q-btn flat dense padding="none" no-caps text-color="grey-5" href="#" class="text-caption">
                                28241226892
                              </q-btn>
                            </div>
                            <div class="ellipsis">
                              <q-btn flat dense padding="none" no-caps text-color="white" href="#" class="text-body2">
                                数据分析平台的用户反馈优化需求
                              </q-btn>
                            </div>
                            <q-badge color="blue-2" text-color="blue-8" label="呼入" />
                          </div>
                          
                          <div class="row items-center">
                            <div style="min-width: 140px">
                              <q-badge color="amber-2" text-color="amber-8" label="Gitee" class="q-ml-md" />
                            </div>
                            <div class="row q-gutter-x-xs">
                              <q-badge color="blue-2" text-color="blue-8" label="需求" class="badge-link" />
                              <q-badge color="purple-2" text-color="purple-8" label="设计" class="badge-link" />
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>

                    <!-- 呼入任务项 3 -->
                    <q-card flat bordered class="task-card q-pa-sm cursor-pointer glass-card" style="border-left: 4px solid #1976D2;">
                      <q-card-section class="q-pa-sm">
                        <div class="column q-gutter-y-sm">
                          <div class="row items-center q-gutter-x-md">
                            <div class="row items-center" style="min-width: 140px">
                              <div class="q-mr-sm" style="width: 8px; height: 8px; border-radius: 50%; background: #1976D2;"></div>
                              <q-btn flat dense padding="none" no-caps text-color="grey-5" href="#" class="text-caption">
                                28241226894
                              </q-btn>
                            </div>
                            <div class="ellipsis">
                              <q-btn flat dense padding="none" no-caps text-color="white" href="#" class="text-body2">
                                客户端性能优化与崩溃问题修复
                              </q-btn>
                            </div>
                            <q-badge color="blue-2" text-color="blue-8" label="呼入" />
                          </div>
                          
                          <div class="row items-center">
                            <div style="min-width: 140px">
                              <q-badge color="amber-2" text-color="amber-8" label="Gitee" class="q-ml-md" />
                            </div>
                            <div class="row q-gutter-x-xs">
                              <q-badge color="blue-2" text-color="blue-8" label="需求" class="badge-link" />
                              <q-badge color="red-2" text-color="red-8" label="Bug" class="badge-link" />
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="q-mt-md">
                    <q-btn flat color="grey-5" label="查看全部呼入任务" class="full-width" icon-right="eva-arrow-right-outline" />
                  </div>
                </div>

                <!-- 呼出任务列表 -->
                <div class="col-12 col-md-6">
                  <div class="row items-center q-mb-sm">
                    <q-icon name="eva-corner-right-up-outline" color="green-6" size="sm" class="q-mr-sm" />
                    <h3 class="text-subtitle1 text-weight-medium text-slate-300 q-my-none">呼出任务</h3>
                  </div>
                  
                  <div class="q-gutter-y-sm">
                    <!-- 呼出任务项 1 -->
                    <q-card flat bordered class="task-card q-pa-sm cursor-pointer glass-card" style="border-left: 4px solid #26A69A;">
                      <q-card-section class="q-pa-sm">
                        <div class="column q-gutter-y-sm">
                          <div class="row items-center q-gutter-x-md">
                            <div class="row items-center" style="min-width: 140px">
                              <div class="q-mr-sm" style="width: 8px; height: 8px; border-radius: 50%; background: #26A69A;"></div>
                              <q-btn flat dense padding="none" no-caps text-color="grey-5" href="#" class="text-caption">
                                28241226891
                              </q-btn>
                            </div>
                            <div class="ellipsis">
                              <q-btn flat dense padding="none" no-caps text-color="white" href="#" class="text-body2">
                                智慧乡镇化的乡村村入户服务需求产品相关的需求反馈
                              </q-btn>
                            </div>
                            <q-badge color="green-2" text-color="green-8" label="呼出" />
                          </div>
                          
                          <div class="row items-center">
                            <div style="min-width: 140px">
                              <q-badge color="amber-2" text-color="amber-8" label="Gitee" class="q-ml-md" />
                            </div>
                            <div class="row q-gutter-x-xs">
                              <q-badge color="blue-2" text-color="blue-8" label="需求" class="badge-link" />
                              <q-badge color="purple-2" text-color="purple-8" label="设计" class="badge-link" />
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="q-mt-md">
                    <q-btn flat color="grey-5" label="查看全部呼出任务" class="full-width" icon-right="eva-arrow-right-outline" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 工作日志部分 -->
          <section id="worklog" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
            <div class="q-pa-md">
              <div class="row justify-between q-mb-md">
                <h2 class="text-h5 text-weight-bold text-white q-my-none">工作日志</h2>
                <q-btn color="blue-6" size="sm" icon="eva-plus-outline" label="记录工作" />
              </div>
              
              <!-- 日志列表 -->
              <div class="q-gutter-y-md">
                <!-- 日志项 1 -->
                <q-card flat bordered class="q-pa-md glass-card">
                  <div class="row justify-between items-center q-mb-sm">
                    <div class="text-subtitle1 text-weight-medium text-white">API 接口开发</div>
                    <q-badge color="blue-2" text-color="blue-8" label="开发" />
                  </div>
                  <p class="q-mb-sm text-grey-5">完成了用户认证 API 的开发和测试，解决了 token 过期处理的问题。</p>
                  <div class="row justify-between items-center text-caption text-grey-6">
                    <div>2023-06-15 14:30</div>
                    <div class="row items-center">
                      <q-icon name="eva-clock-outline" size="xs" class="q-mr-xs" />
                      <span>3.5 小时</span>
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
          </section>

          <!-- 快速访问部分 -->
          <section id="quickaccess" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
            <div class="q-pa-md">
              <h2 class="text-h5 text-weight-bold text-white q-mb-md">快速访问</h2>
              
              <div class="row q-col-gutter-md">
                <!-- 快速访问卡片 -->
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                  <q-card flat bordered class="cursor-pointer quick-access-card glass-card">
                    <q-card-section class="q-pa-md">
                      <div class="row items-center no-wrap">
                        <q-avatar color="blue-1" text-color="blue-8" icon="eva-code-outline" size="md" class="q-mr-sm" />
                        <div>
                          <div class="text-subtitle1 text-weight-medium text-white">API 平台</div>
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
                          <div class="text-subtitle1 text-weight-medium text-white">代码仓库</div>
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

      <!-- 新建任务模态框 -->
      <q-dialog v-model="showNewTaskModal">
        <q-card class="glass-card" style="min-width: 500px">
          <q-card-section class="bg-slate-800 q-pb-sm border-bottom">
            <div class="text-h6 text-white">新建任务</div>
            <q-space />
            <q-btn icon="eva-close-outline" flat round dense v-close-popup class="absolute-top-right q-mt-sm q-mr-sm" color="grey-5" />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <!-- 任务类型和编号 -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-5">
                <q-select 
                  v-model="newTask.type" 
                  :options="taskTypes" 
                  label="任务类型" 
                  outlined 
                  dense 
                  dark
                  color="blue-6"
                  bg-color="slate-800"
                  class="dark-field"
                />
              </div>
              <div class="col-7">
                <q-input 
                  v-model="newTask.id" 
                  label="任务编号" 
                  outlined 
                  dense 
                  dark
                  color="blue-6"
                  bg-color="slate-800"
                  class="dark-field"
                />
              </div>
            </div>

            <q-input 
              v-model="newTask.title" 
              label="任务标题" 
              outlined 
              dense 
              dark
              color="blue-6"
              bg-color="slate-800"
              class="dark-field q-mb-md"
            />

            <!-- 关联文档 -->
            <div class="q-mb-md">
              <div class="row justify-between items-center q-mb-xs">
                <div class="text-sm text-slate-300">关联文档</div>
                <div class="text-xs text-slate-400">如需关联多个文档，请用逗号分隔</div>
              </div>
              
              <div class="row q-gutter-sm q-mb-sm">
                <q-checkbox
                  v-model="newTask.docs.requirement"
                  label="需求"
                  class="doc-checkbox"
                  dense
                >
                  <template v-slot:default>
                    <span class="doc-label doc-requirement">需求</span>
                  </template>
                </q-checkbox>
                
                <q-checkbox
                  v-model="newTask.docs.design"
                  label="设计"
                  class="doc-checkbox"
                  dense
                >
                  <template v-slot:default>
                    <span class="doc-label doc-design">设计</span>
                  </template>
                </q-checkbox>
              </div>
              
              <!-- 动态显示文档名称输入字段 -->
              <div class="q-gutter-y-sm">
                <q-input 
                  v-if="newTask.docs.requirement"
                  v-model="newTask.docNames.requirement" 
                  label="需求文档名称" 
                  outlined 
                  dense 
                  dark
                  color="blue-6"
                  bg-color="slate-800"
                  class="dark-field requirement-field"
                />
                
                <q-input 
                  v-if="newTask.docs.design"
                  v-model="newTask.docNames.design" 
                  label="设计文档名称" 
                  outlined 
                  dense 
                  dark
                  color="purple-6"
                  bg-color="slate-800"
                  class="dark-field design-field"
                />
              </div>
            </div>

            <q-input 
              v-model="newTask.description" 
              label="任务描述" 
              type="textarea" 
              outlined 
              dark
              color="blue-6"
              bg-color="slate-800"
              class="dark-field q-mb-md"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="取消" color="grey-5" v-close-popup />
            <q-btn flat label="创建" color="blue-6" @click="createTask" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkSidebar from './components/WorkSidebar.vue'

// 新建任务模态框状态
const showNewTaskModal = ref(false)

// 新任务数据
const newTask = ref({
  title: '',
  type: null,
  id: '',
  description: '',
  docs: {
    requirement: false,
    design: false
  },
  docNames: {
    requirement: '',
    design: ''
  }
})

// 任务类型选项
const taskTypes = [
  { label: '呼入任务', value: 'incoming' },
  { label: '呼出任务', value: 'outgoing' }
]

// 创建任务方法
const createTask = () => {
  // 这里添加创建任务的逻辑
  console.log('创建任务:', newTask.value)
  // 重置表单
  newTask.value = {
    title: '',
    type: null,
    id: '',
    description: '',
    docs: {
      requirement: false,
      design: false
    },
    docNames: {
      requirement: '',
      design: ''
    }
  }
}

// 添加组件名称以解决ESLint警告
defineOptions({
  name: 'WorkPage'
})
</script>

<style lang="scss" scoped>
.work-page-container {
  display: flex;
  background: linear-gradient(to bottom right, #0f172a, #1e293b);
  min-height: 100vh;
}

.work-page-content {
  flex: 1;
  margin-left: 0;
}

// 玻璃效果
.glass {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(30, 41, 59, 0.25);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

// 自定义样式
.task-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
    background: rgba(30, 41, 59, 0.4);
  }
}

// 快速访问卡片样式
.quick-access-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
    background: rgba(30, 41, 59, 0.4);
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

// 暗色主题输入框
.dark-field {
  .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input {
    color: white;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
