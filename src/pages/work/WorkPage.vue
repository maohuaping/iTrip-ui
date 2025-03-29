<template>
  <div class="work-page-container">
    <!-- 引入侧边栏组件 -->
    <WorkSidebar />
    
    <!-- 主内容区域，添加左侧边距以避免被侧边栏遮挡 -->
    <q-page class="work-page-content">
      <!-- 主内容区域 -->
      <div class="q-pa-md">
        <div class="q-mx-auto" style="max-width: 1200px">
          <!-- 任务列表部分 -->
          <section id="tasks" class="q-mb-xl q-pa-md rounded-borders shadow-10" style="background: rgba(30, 41, 59, 0.25); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05);">
            <div class="row justify-between q-mb-md">
              <h2 class="text-h5 text-weight-bold text-white q-my-none">任务列表</h2>
              <div class="row q-gutter-sm">
                <q-btn color="primary" size="sm" icon="eva-plus-outline" label="新建任务" @click="showNewTaskModal = true" />
                <q-btn color="grey-7" size="sm" label="筛选" icon="eva-funnel-outline" />
              </div>
            </div>

            <!-- 两栏布局：呼入/呼出 -->
            <div class="row q-col-gutter-md">
              <!-- 呼入任务列表 -->
              <div class="col-12 col-md-6">
                <div class="row items-center q-mb-sm">
                  <q-icon name="eva-corner-left-down-outline" color="blue-4" size="sm" class="q-mr-sm" />
                  <h3 class="text-subtitle1 text-weight-medium text-grey-3 q-my-none">呼入任务</h3>
                </div>
                
                <div class="q-gutter-y-sm">
                  <!-- 呼入任务项 1 -->
                  <q-card flat bordered class="task-card q-pa-sm cursor-pointer" style="background: rgba(30, 41, 59, 0.25); border-left: 4px solid #1976D2;">
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
                          <q-badge color="blue-8" text-color="blue-3" label="呼入" />
                        </div>
                        
                        <div class="row items-center">
                          <div style="min-width: 140px">
                            <q-badge color="amber-8" text-color="amber-3" label="Gitee" class="q-ml-md" />
                          </div>
                          <div class="row q-gutter-x-xs">
                            <q-badge color="blue-8" text-color="blue-3" label="需求" />
                            <q-badge color="purple-8" text-color="purple-3" label="设计" />
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- 呼入任务项 2 -->
                  <q-card flat bordered class="task-card q-pa-sm cursor-pointer" style="background: rgba(30, 41, 59, 0.25); border-left: 4px solid #1976D2;">
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
                          <q-badge color="blue-8" text-color="blue-3" label="呼入" />
                        </div>
                        
                        <div class="row items-center">
                          <div style="min-width: 140px">
                            <q-badge color="amber-8" text-color="amber-3" label="Gitee" class="q-ml-md" />
                          </div>
                          <div class="row q-gutter-x-xs">
                            <q-badge color="blue-8" text-color="blue-3" label="需求" />
                            <q-badge color="purple-8" text-color="purple-3" label="设计" />
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- 呼入任务项 3 -->
                  <q-card flat bordered class="task-card q-pa-sm cursor-pointer" style="background: rgba(30, 41, 59, 0.25); border-left: 4px solid #1976D2;">
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
                          <q-badge color="blue-8" text-color="blue-3" label="呼入" />
                        </div>
                        
                        <div class="row items-center">
                          <div style="min-width: 140px">
                            <q-badge color="amber-8" text-color="amber-3" label="Gitee" class="q-ml-md" />
                          </div>
                          <div class="row q-gutter-x-xs">
                            <q-badge color="blue-8" text-color="blue-3" label="需求" />
                            <q-badge color="red-8" text-color="red-3" label="Bug" />
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="q-mt-md">
                  <q-btn flat color="grey-7" label="查看全部呼入任务" class="full-width" icon-right="eva-arrow-right-outline" />
                </div>
              </div>

              <!-- 呼出任务列表 -->
              <div class="col-12 col-md-6">
                <div class="row items-center q-mb-sm">
                  <q-icon name="eva-corner-right-up-outline" color="green-4" size="sm" class="q-mr-sm" />
                  <h3 class="text-subtitle1 text-weight-medium text-grey-3 q-my-none">呼出任务</h3>
                </div>
                
                <div class="q-gutter-y-sm">
                  <!-- 呼出任务项 1 -->
                  <q-card flat bordered class="task-card q-pa-sm cursor-pointer" style="background: rgba(30, 41, 59, 0.25); border-left: 4px solid #26A69A;">
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
                          <q-badge color="green-8" text-color="green-3" label="呼出" />
                        </div>
                        
                        <div class="row items-center">
                          <div style="min-width: 140px">
                            <q-badge color="amber-8" text-color="amber-3" label="Gitee" class="q-ml-md" />
                          </div>
                          <div class="row q-gutter-x-xs">
                            <q-badge color="blue-8" text-color="blue-3" label="需求" />
                            <q-badge color="purple-8" text-color="purple-3" label="设计" />
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="q-mt-md">
                  <q-btn flat color="grey-7" label="查看全部呼出任务" class="full-width" icon-right="eva-arrow-right-outline" />
                </div>
              </div>
            </div>
          </section>

          <!-- 工作日志部分 -->
          <section id="worklog" class="q-mb-xl q-pa-md rounded-borders shadow-10" style="background: rgba(30, 41, 59, 0.25); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05);">
            <div class="row justify-between q-mb-md">
              <h2 class="text-h5 text-weight-bold text-white q-my-none">工作日志</h2>
              <q-btn color="primary" size="sm" icon="eva-plus-outline" label="记录工作" />
            </div>
            
            <!-- 日志列表 -->
            <div class="q-gutter-y-md">
              <!-- 日志项 1 -->
              <q-card flat bordered class="q-pa-md" style="background: rgba(30, 41, 59, 0.25);">
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-subtitle1 text-weight-medium">API 接口开发</div>
                  <q-badge color="blue-8" text-color="blue-3" label="开发" />
                </div>
                <p class="q-mb-sm text-grey-4">完成了用户认证 API 的开发和测试，解决了 token 过期处理的问题。</p>
                <div class="row justify-between items-center text-caption text-grey-6">
                  <div>2023-06-15 14:30</div>
                  <div class="row items-center">
                    <q-icon name="eva-clock-outline" size="xs" class="q-mr-xs" />
                    <span>3.5 小时</span>
                  </div>
                </div>
              </q-card>
            </div>
          </section>

          <!-- 快速访问部分 -->
          <section id="quickaccess" class="q-mb-xl q-pa-md rounded-borders shadow-10" style="background: rgba(30, 41, 59, 0.25); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05);">
            <h2 class="text-h5 text-weight-bold text-white q-mb-md">快速访问</h2>
            
            <div class="row q-col-gutter-md">
              <!-- 快速访问卡片 -->
              <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <q-card flat bordered class="cursor-pointer" style="background: rgba(30, 41, 59, 0.25);">
                  <q-card-section class="q-pa-md">
                    <div class="row items-center no-wrap">
                      <q-icon name="eva-code-outline" color="blue-5" size="md" class="q-mr-sm" />
                      <div>
                        <div class="text-subtitle1 text-weight-medium">API 平台</div>
                        <div class="text-caption text-grey-5">接口文档和测试</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              
              <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <q-card flat bordered class="cursor-pointer" style="background: rgba(30, 41, 59, 0.25);">
                  <q-card-section class="q-pa-md">
                    <div class="row items-center no-wrap">
                      <q-icon name="eva-folder-outline" color="green-5" size="md" class="q-mr-sm" />
                      <div>
                        <div class="text-subtitle1 text-weight-medium">代码仓库</div>
                        <div class="text-caption text-grey-5">项目源代码管理</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 新建任务模态框 -->
      <q-dialog v-model="showNewTaskModal">
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">新建任务</div>
            <q-space />
            <q-btn icon="eva-close-outline" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-input v-model="newTask.title" label="任务标题" outlined dense />
            <q-select v-model="newTask.type" :options="taskTypes" label="任务类型" outlined dense class="q-mt-sm" />
            <q-input v-model="newTask.description" label="任务描述" type="textarea" outlined class="q-mt-sm" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="grey-7" v-close-popup />
            <q-btn flat label="创建" color="primary" @click="createTask" v-close-popup />
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
  description: ''
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
    description: ''
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
}

.work-page-content {
  flex: 1;
  margin-left: 0; /* 移除左侧边距 */
}

// 自定义样式
.task-card {
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(51, 65, 85, 0.4) !important;
  }
}

// 确保内容溢出时显示省略号
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
</style>
