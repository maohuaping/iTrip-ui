<template>
  <section id="tasks" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
    <div class="q-pa-md">
      <div class="row justify-between q-mb-md">
        <h2 class="text-h5 text-weight-bold text-dark q-my-none">任务列表</h2>
        <div class="row q-gutter-sm">
          <q-btn color="blue-6" size="sm" icon="add" label="新建任务" @click="$emit('open-new-task')" />
        </div>
      </div>

      <q-tabs
        v-model="activeTab"
        class="text-grey-8"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="incoming" icon="call_received" label="呼入任务" />
        <q-tab name="outgoing" icon="call_made" label="呼出任务" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- 呼入任务面板 -->
        <q-tab-panel name="incoming" class="q-pa-none q-mt-md">
          <div class="q-gutter-y-sm">
            <q-card v-for="task in incomingTasks" :key="task.id"
                    flat
                    bordered
                    class="task-card q-pa-md cursor-pointer hover-effect"
                    style="border-left: 4px solid #1976D2; background-color: white;"
            >
              <q-card-section class="q-pa-none">
                <div class="column q-gutter-y-md">
                  <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-x-md">
                      <div class="row items-center">
                        <div class="task-dot q-mr-sm"></div>
                        <q-btn flat dense padding="none" no-caps class="text-caption text-grey-6">
                          {{ task.id }}
                        </q-btn>
                      </div>
                      <q-badge color="blue-2" text-color="blue-8" label="呼入" />
                    </div>
                  </div>

                  <div class="text-subtitle1 text-weight-medium text-dark">
                    {{ task.title }}
                  </div>

                  <div class="row items-center q-gutter-x-md">
                    <q-badge color="amber-2" text-color="amber-8" label="Gitee" />
                    <div class="row q-gutter-x-xs">
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
            <q-btn flat class="full-width" color="grey-7" label="查看全部呼入任务" />
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
                    <div class="row items-center q-gutter-x-md">
                      <div class="row items-center">
                        <div class="task-dot outgoing-dot q-mr-sm"></div>
                        <q-btn flat dense padding="none" no-caps class="text-caption text-grey-6">
                          {{ task.id }}
                        </q-btn>
                      </div>
                      <q-badge color="green-2" text-color="green-8" label="呼出" />
                    </div>
                  </div>

                  <div class="text-subtitle1 text-weight-medium text-dark">
                    {{ task.title }}
                  </div>

                  <div class="row items-center q-gutter-x-md">
                    <q-badge color="amber-2" text-color="amber-8" label="Gitee" />
                    <div class="row q-gutter-x-xs">
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
