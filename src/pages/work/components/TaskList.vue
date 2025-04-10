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
          @click="openNewTaskDialog"
          class="q-px-md"
          unelevated
          rounded
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
            <div v-for="task in visibleIncomingTasks" 
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
                          <div 
                            class="text-subtitle1 text-weight-medium text-dark ellipsis cursor-pointer" 
                            @click="copyToClipboard(task.requirementName)"
                            title="点击复制任务名称"
                          >
                            {{ task.requirementName }}
                          </div>
                          <div 
                            class="text-caption text-grey-7 cursor-pointer"
                            @click="copyToClipboard(task.requirementId)"
                            title="点击复制需求编号"
                          >
                            #{{ task.requirementId }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="row items-center q-gutter-x-sm q-ml-md">
                      <q-chip
                        v-for="tag in getTaskTags(task)"
                        :key="tag.label"
                        dense
                        size="sm"
                        :icon="tag.icon"
                        :color="tag.color"
                        :text-color="tag.textColor"
                        :label="tag.label"
                        :clickable="!!tag.clickable"
                        @click="tag.onClick ? tag.onClick() : null"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- 展示更多按钮 -->
          <div v-if="incomingTasks.length > maxVisibleTasks && !showAllIncomingTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              :label="`查看更多 (${incomingTasks.length - maxVisibleTasks})`"
              @click="showAllIncomingTasks = true"
              icon-right="expand_more"
            />
          </div>

          <!-- 收起按钮 -->
          <div v-if="showAllIncomingTasks && incomingTasks.length > maxVisibleTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              label="收起"
              @click="showAllIncomingTasks = false"
              icon-right="expand_less"
            />
          </div>
        </q-tab-panel>

        <!-- 呼出任务面板 -->
        <q-tab-panel name="outgoing" class="q-pa-none">
          <div class="row q-col-gutter-md">
            <div v-for="task in visibleOutgoingTasks" 
                 :key="task.id" 
                 class="col-12"
            >
              <q-card flat bordered class="task-card">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="row items-center q-gutter-x-sm">
                        <q-avatar size="32px" color="teal" text-color="white" icon="assignment" />
                        <div class="column">
                          <div 
                            class="text-subtitle1 text-weight-medium text-dark ellipsis cursor-pointer" 
                            @click="copyToClipboard(task.requirementName)"
                            title="点击复制任务名称"
                          >
                            {{ task.requirementName }}
                          </div>
                          <div 
                            class="text-caption text-grey-7 cursor-pointer"
                            @click="copyToClipboard(task.requirementId)"
                            title="点击复制需求编号"
                          >
                            #{{ task.requirementId }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="row items-center q-gutter-x-sm q-ml-md">
                      <q-chip
                        v-for="tag in getTaskTags(task)"
                        :key="tag.label"
                        dense
                        size="sm"
                        :icon="tag.icon"
                        :color="tag.color"
                        :text-color="tag.textColor"
                        :label="tag.label"
                        :clickable="!!tag.clickable"
                        @click="tag.onClick ? tag.onClick() : null"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- 展示更多按钮 -->
          <div v-if="outgoingTasks.length > maxVisibleTasks && !showAllOutgoingTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              :label="`查看更多 (${outgoingTasks.length - maxVisibleTasks})`"
              @click="showAllOutgoingTasks = true"
              icon-right="expand_more"
            />
          </div>

          <!-- 收起按钮 -->
          <div v-if="showAllOutgoingTasks && outgoingTasks.length > maxVisibleTasks" class="text-center q-mt-md">
            <q-btn
              flat
              color="primary"
              label="收起"
              @click="showAllOutgoingTasks = false"
              icon-right="expand_less"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </section>

  <!-- 将独立的NewTaskDialog内容直接集成到这里 -->
  <q-dialog v-model="showNewTaskDialog">
    <q-card style="min-width: 500px; background: white;">
      <q-card-section class="bg-grey-2 q-pb-sm border-bottom">
        <div class="text-h6 text-dark">新建任务</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-mt-sm q-mr-sm" color="grey-7" />
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
              class="light-field"
            />
          </div>
          <div class="col-7">
            <q-input 
              v-model="newTask.id" 
              label="任务编号" 
              outlined 
              dense 
              class="light-field"
            />
          </div>
        </div>

        <!-- 任务标题 -->
        <q-input 
          v-model="newTask.title" 
          label="任务标题" 
          outlined 
          dense 
          class="light-field q-mb-md"
          placeholder="请输入任务标题"
        />

        <!-- 关联文档 -->
        <div class="q-mb-md">
          <div class="row justify-between items-center q-mb-xs">
            <div class="text-subtitle2 text-dark">关联文档</div>
            <div class="text-caption text-grey-7">点击标签上传相关文档</div>
          </div>
          
          <div class="row q-gutter-sm q-mb-md">
            <div 
              class="doc-label doc-requirement cursor-pointer"
              :class="{ 'doc-active': hasRequirementDocs }"
              @click="triggerFileUpload('requirement')"
            >
              需求
            </div>
            
            <div 
              class="doc-label doc-design cursor-pointer"
              :class="{ 'doc-active': hasDesignDocs }"
              @click="triggerFileUpload('design')"
            >
              设计
            </div>
          </div>
          
          <!-- 显示已上传的文档列表 -->
          <div class="q-mt-md">
            <!-- 需求文档列表 -->
            <div v-if="newTask.docsList.requirement.length > 0">
              <div class="text-caption text-weight-medium q-mb-xs">需求文档:</div>
              <div class="q-gutter-y-sm">
                <div 
                  v-for="(doc, index) in newTask.docsList.requirement" 
                  :key="index"
                  class="uploaded-doc requirement-doc"
                >
                  <q-icon name="description" size="18px" class="q-mr-xs" /> 
                  <span class="ellipsis">{{ doc }}</span>
                  <q-btn 
                    flat 
                    round 
                    dense 
                    icon="close" 
                    size="xs" 
                    @click="removeDoc('requirement', index)" 
                    class="q-ml-xs" 
                  />
                </div>
              </div>
            </div>
            
            <!-- 设计文档列表 -->
            <div v-if="newTask.docsList.design.length > 0" class="q-mt-sm">
              <div class="text-caption text-weight-medium q-mb-xs">设计文档:</div>
              <div class="q-gutter-y-sm">
                <div 
                  v-for="(doc, index) in newTask.docsList.design" 
                  :key="index"
                  class="uploaded-doc design-doc"
                >
                  <q-icon name="description" size="18px" class="q-mr-xs" /> 
                  <span class="ellipsis">{{ doc }}</span>
                  <q-btn 
                    flat 
                    round 
                    dense 
                    icon="close" 
                    size="xs" 
                    @click="removeDoc('design', index)" 
                    class="q-ml-xs" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 隐藏的文件上传输入框 -->
          <input
            type="file"
            ref="requirementFileInput"
            @change="handleFileUpload('requirement', $event)"
            style="display: none"
          />
          <input
            type="file"
            ref="designFileInput"
            @change="handleFileUpload('design', $event)"
            style="display: none"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn flat label="创建" color="blue-6" @click="createTask" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getRequirement } from 'src/api/requirement/requirement'
import { Notify } from 'quasar'
import { useQuasar } from 'quasar'

// 活动标签页
const activeTab = ref('incoming')

// 控制新建任务对话框的显示
const showNewTaskDialog = ref(false)

// 任务数据
const incomingTasks = ref<Array<TaskItem>>([])
const outgoingTasks = ref<Array<TaskItem>>([])

// 控制展开/收起状态
const maxVisibleTasks = 4 // 默认显示的任务数量
const showAllIncomingTasks = ref(false)
const showAllOutgoingTasks = ref(false)

// 计算要显示的任务列表
const visibleIncomingTasks = computed(() => {
  return showAllIncomingTasks.value 
    ? incomingTasks.value 
    : incomingTasks.value.slice(0, maxVisibleTasks)
})

const visibleOutgoingTasks = computed(() => {
  return showAllOutgoingTasks.value 
    ? outgoingTasks.value 
    : outgoingTasks.value.slice(0, maxVisibleTasks)
})

// 获取任务数据
const fetchTasks = async () => {
  try {
    const requirementApi = getRequirement()
    const response = await requirementApi.requirementMe()
    
    if (response.data?.success && response.data.payload) {
      // 根据systemCategory字段区分呼入和呼出任务
      const allTasks = response.data.payload
      
      incomingTasks.value = allTasks.filter(task => task.systemCategory === 'callin')
      outgoingTasks.value = allTasks.filter(task => task.systemCategory === 'callout')
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

// 在组件挂载时获取数据
onMounted(fetchTasks)

// 添加 requirementBasePath 常量
const requirementBasePath = '/Users/maohuaping/中科软/需求文档/'

// 在 setup 中声明
const $q = useQuasar()

// 转换任务标签
const getTaskTags = (task: TaskItem) => {
  const tags = []
  
  // 根据requirementId添加Git分支标签，用于根据需求号跳转对应的Gitee仓库
  if (task.requirementId) {
    tags.push({
      label: 'Git分支',
      color: 'blue-2',
      textColor: 'blue-8',
      clickable: true,
      onClick: () => handleSystemClick(task.systemCategory, task.requirementId)
    })
  }
  
  // 根据相关文档添加标签
  if (task.relatedRequirementDocs) {
    tags.push({
      label: '需求文档',
      color: 'green-2',
      textColor: 'green-8',
      clickable: true,
      onClick: () => handleRequirementClick(task, task.relatedRequirementDocs)
    })
  }
  
  if (task.relatedDesignDocs) {
    tags.push({
      label: '设计文档',
      color: 'purple-2',
      textColor: 'purple-8'
    })
  }
  
  return tags
}

// 添加系统点击处理方法
const handleSystemClick = (system: SystemType, branch: string) => {
  if (system === 'other') return
  
  const baseUrls = {
    callin: 'http://code.devops.piccnet/picc/_source/picc/picc__picc-life-ccin/Flex-Media/-/branches',
    callout: 'http://code.devops.piccnet/picc/_source/picc/picc__picc-life-ccout/Flex-Callout/-/branches'
  }
  
  const url = `${baseUrls[system]}?search=${branch}`
  window.open(url, '_blank')
}

// 添加处理需求文档点击的方法
const handleRequirementClick = async (item: any, fileName: string) => {
  if (fileName) {
    const fullPath = `${requirementBasePath}${fileName}`
    try {
      const response = await fetch(`http://localhost:8090/open?path=${encodeURIComponent(fullPath)}`)
      const result = await response.json()
      
      if (result.success) {
        $q.notify({
          message: '文件已打开',
          type: 'positive'
        })
      } else {
        $q.notify({
          message: result.message,
          type: 'negative'
        })
      }
    } catch (error) {
      $q.notify({
        message: '无法打开文件，请确保本地服务已启动',
        type: 'negative'
      })
    }
  }
}

// 确保SystemType类型定义正确
type SystemType = 'callin' | 'callout' | 'other'

// 复制文本到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // 复制成功提示
      Notify.create({
        message: '已复制到剪贴板',
        color: 'positive',
        position: 'top',
        timeout: 1000
      })
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 添加新建任务相关的数据
const taskTypes = [
  { label: '呼入任务', value: 'incoming' },
  { label: '呼出任务', value: 'outgoing' }
]

// 修改任务数据结构，使用数组存储多个文档
const newTask = ref({
  title: '',
  type: { label: '呼入任务', value: 'incoming' },
  id: '',
  docs: {
    requirement: false,
    design: false
  },
  docNames: {
    requirement: '',
    design: ''
  },
  // 添加文档列表数组
  docsList: {
    requirement: [],
    design: []
  }
})

// 判断是否有文档的计算属性
const hasRequirementDocs = computed(() => newTask.value.docsList.requirement.length > 0)
const hasDesignDocs = computed(() => newTask.value.docsList.design.length > 0)

// 触发文件上传点击事件
const triggerFileUpload = (type: 'requirement' | 'design') => {
  if (type === 'requirement' && requirementFileInput.value) {
    requirementFileInput.value.click()
  } else if (type === 'design' && designFileInput.value) {
    designFileInput.value.click()
  }
}

// 修改处理文件上传，添加到文档数组而不是替换
const handleFileUpload = (type: 'requirement' | 'design', event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    const file = files[0]
    const fileName = file.name
    
    // 添加文件名到对应的文档数组
    if (type === 'requirement') {
      newTask.value.docsList.requirement.push(fileName)
    } else if (type === 'design') {
      newTask.value.docsList.design.push(fileName)
    }
    
    // 同时更新单文档字段，用逗号分隔的文件名列表
    updateDocNamesFromList(type)
    
    // 清空文件输入框，方便下次选择同一个文件
    target.value = ''
    
    // 提示用户文件名已获取
    Notify.create({
      message: `已添加文件: ${fileName}`,
      color: 'positive',
      position: 'top',
      timeout: 1500
    })
  }
}

// 从数组更新到字符串
const updateDocNamesFromList = (type: 'requirement' | 'design') => {
  if (type === 'requirement') {
    newTask.value.docNames.requirement = newTask.value.docsList.requirement.join(',')
  } else if (type === 'design') {
    newTask.value.docNames.design = newTask.value.docsList.design.join(',')
  }
}

// 修改移除文档方法，现在需要指定索引
const removeDoc = (type: 'requirement' | 'design', index: number) => {
  if (type === 'requirement') {
    newTask.value.docsList.requirement.splice(index, 1)
  } else if (type === 'design') {
    newTask.value.docsList.design.splice(index, 1)
  }
  
  // 更新字符串形式的文档名
  updateDocNamesFromList(type)
}

// 修改创建任务方法，恢复表单时清空文档列表
const createTask = async () => {
  try {
    const requirementApi = getRequirement()
    
    const requirementEntity = {
      requirementId: newTask.value.id,
      requirementName: newTask.value.title,
      systemCategory: newTask.value.type.value === 'incoming' ? 'callin' : 'callout',
      relatedRequirementDocs: newTask.value.docs.requirement ? newTask.value.docNames.requirement : '',
      relatedDesignDocs: newTask.value.docs.design ? newTask.value.docNames.design : ''
    }

    const response = await requirementApi.requirementCreate(requirementEntity)
    
    if (response.data?.success) {
      Notify.create({
        message: '任务创建成功',
        color: 'positive',
        position: 'top',
        timeout: 1500
      })
      
      // 重新获取任务列表
      fetchTasks()
      
      // 重置表单，现在也重置文档列表
      newTask.value = {
        title: '',
        type: { label: '呼入任务', value: 'incoming' },
        id: '',
        docs: {
          requirement: false,
          design: false
        },
        docNames: {
          requirement: '',
          design: ''
        },
        docsList: {
          requirement: [],
          design: []
        }
      }
    } else {
      Notify.create({
        message: '任务创建失败: ' + (response.data?.payload || '未知错误'),
        color: 'negative',
        position: 'top',
        timeout: 1500
      })
    }
  } catch (error) {
    console.error('创建任务出错:', error)
    Notify.create({
      message: '创建任务出错',
      color: 'negative',
      position: 'top',
      timeout: 1500
    })
  }
}

// 修改emit定义，添加open-new-task事件的处理
const emit = defineEmits(['open-new-task'])

// 添加打开新建任务对话框的方法
const openNewTaskDialog = () => {
  showNewTaskDialog.value = true
}

// 添加文件上传相关的ref
const requirementFileInput = ref<HTMLInputElement | null>(null)
const designFileInput = ref<HTMLInputElement | null>(null)

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

// 添加新建任务对话框相关样式
.light-field {
  .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input {
    color: #333 !important;
  }
  
  .q-field__label {
    color: rgba(0, 0, 0, 0.7) !important;
  }
  
  &.q-field--outlined .q-field__control {
    background-color: white !important;
    border-color: rgba(0, 0, 0, 0.2) !important;
  }
}

.doc-label {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &.doc-requirement {
    background: rgba(59, 130, 246, 0.2);
    color: #1e40af;
    
    &:hover {
      background: rgba(59, 130, 246, 0.3);
    }
    
    &.doc-active {
      background: rgba(59, 130, 246, 0.5);
      color: #1e40af;
      font-weight: 500;
    }
  }
  
  &.doc-design {
    background: rgba(168, 85, 247, 0.2);
    color: #6b21a8;
    
    &:hover {
      background: rgba(168, 85, 247, 0.3);
    }
    
    &.doc-active {
      background: rgba(168, 85, 247, 0.5);
      color: #6b21a8;
      font-weight: 500;
    }
  }
}

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

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.uploaded-doc {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.05);
  margin-top: 8px;
  max-width: 100%;
  
  &.requirement-doc {
    color: #1e40af;
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  &.design-doc {
    color: #6b21a8;
    background-color: rgba(168, 85, 247, 0.1);
  }
  
  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
}
</style>
