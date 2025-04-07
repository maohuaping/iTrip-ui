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
            
            <q-input
              v-model="newLog.content"
              label="日志内容"
              type="textarea"
              outlined
              autogrow
              :rows="4"
              :rules="[val => !!val || '请输入内容']"
            />
            
            <q-input
              v-model="newLog.date"
              label="日期"
              outlined
              dense
              readonly
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="newLog.date" mask="YYYY-MM-DD" today-btn />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            
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
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

// 初始化通知
const $q = useQuasar()

// 定义日志接口
interface WorkLogItem {
  title: string
  content: string
  date: string
}

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
  logs.value.unshift({
    title: newLog.title,
    content: newLog.content,
    date: newLog.date
  })
  
  // 重置表单
  newLog.title = ''
  newLog.content = ''
  newLog.date = formatDateForInput(new Date())
  
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