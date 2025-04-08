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
                            {{ task.title }}
                          </div>
                          <div class="text-caption text-grey-7">
                            #{{ task.id }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="row items-center q-gutter-x-sm q-ml-md">
                      <q-chip
                        dense
                        size="sm"
                        icon="source"
                        color="amber-2"
                        text-color="amber-8"
                        label="Gitee"
                      />
                      <q-chip
                        v-for="tag in task.tags"
                        :key="tag.label"
                        dense
                        size="sm"
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
        <q-tab-panel name="outgoing" class="q-pa-none q-mt-md">
          <div class="q-gutter-y-sm">
            <q-card v-for="task in outgoingTasks" :key="task.id"
                    flat
                    bordered
                    class="task-card q-pa-md cursor-pointer hover-effect"
                    style="border-left: 4px solid #26A69A; background-color: white;"
            >
              <q-card-section class="q-pa-none">
                <div class="column q-gutter-y-md">
                  <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-x-md w-100">
                      <div class="row items-center">
                        <div class="task-dot outgoing-dot q-mr-sm"></div>
                        <q-btn flat dense padding="none" no-caps class="text-caption text-grey-6">
                          {{ task.id }}
                        </q-btn>
                      </div>
                      
                      <div class="text-subtitle1 text-weight-medium text-dark ellipsis">
                        {{ task.title }}
                      </div>
                    </div>
                  </div>

                  <div class="row items-center">
                    <div class="q-ml-md">
                      <q-badge color="amber-2" text-color="amber-8" label="Gitee" />
                    </div>
                    <div class="row q-gutter-x-xs q-ml-auto">
                      <q-badge v-for="tag in task.tags"
                              :key="tag.label"
                              :color="tag.color"
                              :text-color="tag.textColor"
                              :label="tag.label"
                              class="badge-link"
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="q-mt-md">
            <q-btn flat class="full-width" color="grey-7" label="查看全部呼出任务" />
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
import { ref } from 'vue'

// 活动标签页
const activeTab = ref('incoming')

// 模拟数据
const incomingTasks = ref([
  {
    id: '28241226890',
    title: '有广告信息需要发布广告位的服务',
    tags: [
      { label: '需求', color: 'blue-2', textColor: 'blue-8' },
      { label: '设计', color: 'purple-2', textColor: 'purple-8' }
    ]
  },
  {
    id: '28241226892',
    title: '数据分析平台的用户反馈优化需求',
    tags: [
      { label: '需求', color: 'blue-2', textColor: 'blue-8' },
      { label: '设计', color: 'purple-2', textColor: 'purple-8' }
    ]
  },
  {
    id: '28241226894',
    title: '客户端性能优化与崩溃问题修复',
    tags: [
      { label: '需求', color: 'blue-2', textColor: 'blue-8' },
      { label: 'Bug', color: 'red-2', textColor: 'red-8' }
    ]
  }
])

const outgoingTasks = ref([
  {
    id: '28241226891',
    title: '智慧乡镇化的乡村村入户服务需求产品相关的需求反馈',
    tags: [
      { label: '需求', color: 'blue-2', textColor: 'blue-8' },
      { label: '优化', color: 'orange-2', textColor: 'orange-8' }
    ]
  },
  {
    id: '28241226893',
    title: '移动端应用界面交互体验改进建议',
    tags: [
      { label: '需求', color: 'blue-2', textColor: 'blue-8' },
      { label: 'UI', color: 'purple-2', textColor: 'purple-8' }
    ]
  },
  {
    id: '28241226895',
    title: '后台管理系统权限模块重构方案',
    tags: [
      { label: '需求', color: 'blue-2', textColor: 'blue-8' },
      { label: '重构', color: 'yellow-2', textColor: 'yellow-8' }
    ]
  }
])

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
