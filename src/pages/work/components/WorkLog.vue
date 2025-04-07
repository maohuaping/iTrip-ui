<template>
  <section id="worklog" class="q-mb-xl glass rounded-xl overflow-hidden shadow-2xl">
    <div class="q-pa-md">
      <div class="section-header q-pb-md flex justify-between items-center">
        <h2 class="text-h5 text-weight-bold text-dark q-mb-none">工作日志</h2>
        <q-btn 
          color="primary" 
          label="添加日志" 
          icon="add" 
          rounded 
          unelevated 
          @click="showNewLogDialog = true"
        />
      </div>
      
      <!-- 日志列表 -->
      <div class="work-logs q-mt-md" v-if="logs.length > 0">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          class="work-log-item q-mb-md"
        >
          <q-card flat bordered class="log-card">
            <q-card-section>
              <div class="row justify-between items-start">
                <div class="col-9">
                  <div class="text-subtitle1 text-weight-medium">{{ log.title }}</div>
                  <div class="text-body2 q-mt-sm log-content">{{ log.content }}</div>
                </div>
                <div class="col-3 text-right">
                  <div class="text-caption text-grey">{{ formatDate(log.date) }}</div>
                  <div class="q-mt-sm">
                    <q-btn 
                      flat 
                      round 
                      dense 
                      color="blue-7" 
                      icon="content_copy" 
                      @click="copyLog(log)"
                      class="q-mr-xs"
                    >
                      <q-tooltip>复制内容</q-tooltip>
                    </q-btn>
                    <q-btn 
                      flat 
                      round 
                      dense 
                      color="negative" 
                      icon="delete" 
                      @click="confirmDelete(index)"
                    >
                      <q-tooltip>删除日志</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="q-pa-lg flex flex-center column">
        <q-icon name="description" size="64px" color="grey-4" />
        <div class="text-subtitle1 q-mt-md text-grey-7">暂无工作日志</div>
        <div class="text-caption text-grey-6 q-mt-sm">点击"添加日志"记录您今天的工作内容</div>
      </div>
    </div>
    
    <!-- 新建日志对话框 -->
    <q-dialog v-model="showNewLogDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">添加工作日志</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <q-form @submit="addNewLog" class="q-gutter-md">
            <q-input
              v-model="newLog.title"
              label="日志标题"
              outlined
              dense
              :rules="[val => !!val || '请输入标题']"
            />
            
            <!-- 需求类型与内容添加区域 -->
            <div>
              <div v-for="(item, index) in logItems" :key="index" class="q-mb-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <q-select
                      v-model="item.type"
                      :options="requirementOptions"
                      label="需求类型"
                      outlined
                      dense
                      map-options
                      emit-value
                      :rules="[val => !!val || '请选择需求类型']"
                    />
                  </div>
                  <div class="col-7">
                    <q-input
                      v-model="item.content"
                      label="内容"
                      outlined
                      dense
                      :rules="[val => !!val || '请输入内容']"
                    />
                  </div>
                  <div class="col-1 flex items-center">
                    <q-btn
                      v-if="index > 0"
                      flat
                      round
                      dense
                      color="negative"
                      icon="remove_circle"
                      @click="removeLogItem(index)"
                    />
                  </div>
                </div>
              </div>
              
              <div class="q-mt-sm">
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="添加需求项"
                  size="sm"
                  @click="addLogItem"
                />
              </div>
            </div>
            
            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup />
              <q-btn label="保存" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!-- 删除确认 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除这条工作日志吗？</span>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="删除" color="negative" @click="deleteLog" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'

// 初始化通知
const $q = useQuasar()

// 定义日志接口
interface WorkLogItem {
  title: string
  content: string
  date: string
}

// 定义需求项接口
interface LogItemEntry {
  type: string
  content: string
}

// 需求类型选项
const requirementOptions = [
  { label: '功能需求', value: '功能需求' },
  { label: '设计需求', value: '设计需求' },
  { label: 'Bug修复', value: 'Bug修复' },
  { label: '性能优化', value: '性能优化' },
  { label: '其他任务', value: '其他任务' }
]

// 初始化日志列表
const logs = ref<WorkLogItem[]>([
  {
    title: '系统架构设计',
    content: '完成了API层和数据层的整体架构设计，明确了各模块间的交互方式和数据流向，并输出设计文档。',
    date: '2023-09-15'
  },
  {
    title: '前端框架搭建',
    content: '基于Vue3和Quasar框架搭建了项目基础结构，完成了路由配置和全局样式定义。',
    date: '2023-09-16'
  }
])

// 新增日志模态框状态
const showNewLogDialog = ref(false)

// 删除确认对话框状态
const showDeleteDialog = ref(false)
const deleteIndex = ref(-1)

// 新日志对象
const newLog = reactive<WorkLogItem>({
  title: '',
  content: '',
  date: formatDateForInput(new Date())
})

// 日志项目管理
const logItems = ref<LogItemEntry[]>([
  { type: '', content: '' }
])

// 添加日志项
function addLogItem() {
  logItems.value.push({ type: '', content: '' })
}

// 移除日志项
function removeLogItem(index: number) {
  logItems.value.splice(index, 1)
}

// 确认删除
function confirmDelete(index: number) {
  deleteIndex.value = index
  showDeleteDialog.value = true
}

// 删除日志
function deleteLog() {
  if (deleteIndex.value > -1) {
    logs.value.splice(deleteIndex.value, 1)
    $q.notify({
      color: 'positive',
      message: '日志已删除',
      icon: 'check_circle'
    })
  }
}

// 添加新日志
function addNewLog() {
  // 拼接所有需求内容
  const combinedContent = logItems.value
    .filter(item => item.type && item.content)
    .map(item => `【${item.type}】${item.content}`)
    .join('\n')
  
  logs.value.unshift({
    title: newLog.title,
    content: combinedContent,
    date: formatDateForInput(new Date())
  })
  
  // 重置表单
  newLog.title = ''
  logItems.value = [{ type: '', content: '' }]
  
  // 关闭对话框
  showNewLogDialog.value = false
  
  // 显示通知
  $q.notify({
    color: 'positive',
    message: '工作日志已添加',
    icon: 'check_circle'
  })
}

// 复制日志内容
function copyLog(log: WorkLogItem) {
  const textToCopy = `【${log.title}】\n${log.content}\n日期：${log.date}`
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      $q.notify({
        color: 'positive',
        message: '日志内容已复制到剪贴板',
        icon: 'content_copy'
      })
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        message: '复制失败',
        icon: 'error'
      })
    })
}

// 格式化日期显示
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 格式化日期为输入框格式 YYYY-MM-DD
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 当打开新建对话框时重置表单
function resetForm() {
  newLog.title = ''
  logItems.value = [{ type: '', content: '' }]
}

// 监听对话框打开
watch(showNewLogDialog, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

// 组件选项
defineOptions({
  name: 'WorkLog'
})
</script>

<style lang="scss" scoped>
.log-card {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.log-content {
  color: #555;
  line-height: 1.5;
  white-space: pre-line;
}

.section-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style> 