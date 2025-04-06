<template>
  <div class="q-pa-md">
    <div class="row justify-between q-mb-md">
      <h2 class="text-h5 text-weight-bold text-dark q-my-none">工作日志</h2>
    </div>

    <!-- 日志输入表单 -->
    <div class="glass-card rounded-lg q-pa-md q-mb-md" style="border-left: 4px solid #1976D2;">
      <div class="q-mb-md">
        <div class="row justify-between items-center q-mb-sm">
          <label for="logContent" class="text-subtitle1 text-weight-medium text-dark">今日工作内容</label>
          <span class="text-caption text-grey-6">{{ characterCount }}/{{ maxLength }}</span>
        </div>
        <q-input
          id="logContent"
          v-model="logContent"
          @update:model-value="characterCount = logContent.length"
          type="textarea"
          outlined
          dense
          class="dark-field"
          placeholder="记录今天完成的工作内容、遇到的问题和解决方案..."
          rows="4"
          :maxlength="maxLength"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="row justify-end q-gutter-sm">
        <q-btn
          flat
          color="grey-5"
          label="清空"
          @click="clearForm"
        />
        <q-btn
          color="blue-6"
          label="提交日志"
          @click="submitLog"
        />
      </div>
    </div>

    <!-- 日志列表 -->
    <div>
      <div class="row items-center q-mb-sm">
        <q-icon name="eva-clock-outline" color="primary" size="sm" class="q-mr-xs" />
        <h3 class="text-subtitle1 text-weight-medium text-dark q-my-none">工作日志记录</h3>
        <q-space />
        <q-btn flat dense round icon="eva-funnel-outline" color="grey-7">
          <q-tooltip>筛选日志</q-tooltip>
        </q-btn>
      </div>

      <!-- 日志列表 - 更紧凑的设计 -->
      <div class="q-gutter-y-sm">
        <q-card
          v-for="log in logs"
          :key="log.id"
          flat
          bordered
          class="q-py-sm q-px-md glass-card log-card"
          :class="{'today-log': isToday(log.date)}"
        >
          <div class="row justify-between items-center">
            <div class="col-grow">
              <div class="row items-center q-mb-xs">
                <q-chip
                  dense
                  size="sm"
                  :color="isToday(log.date) ? 'blue-6' : 'grey-5'"
                  text-color="white"
                  class="q-mr-sm"
                  style="min-width: 40px; height: 20px"
                >
                  {{ formatDateShort(log.date) }}
                </q-chip>
                <div class="text-caption text-grey-7">{{ formatTime(log.date) }}</div>
                
                <!-- 操作按钮 - 移到右侧 -->
                <div class="row q-gutter-x-xs q-ml-md">
                  <q-btn
                    flat
                    round
                    dense
                    size="xs"
                    color="grey-7"
                    icon="eva-copy-outline"
                    @click="copyLog(log.content)"
                  >
                    <q-tooltip>复制日志</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    size="xs"
                    color="blue-7"
                    icon="eva-edit-outline"
                    @click="editLog(log)"
                  >
                    <q-tooltip>编辑日志</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    size="xs"
                    color="red-7"
                    icon="eva-trash-2-outline"
                    @click="confirmDelete(log.id)"
                  >
                    <q-tooltip>删除日志</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <p class="q-my-none text-grey-8 log-content text-body2">{{ log.content }}</p>
            </div>
          </div>
        </q-card>
      </div>

      <!-- 无日志时显示 -->
      <div v-if="logs.length === 0" class="text-center q-py-md empty-state">
        <q-icon name="eva-file-text-outline" size="md" color="grey-5" class="q-mb-sm" />
        <p class="text-grey-5 q-mb-xs text-caption">暂无工作日志记录</p>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="logs.length > 0" class="flex justify-center q-mt-sm">
        <q-btn flat dense color="primary" label="加载更多" :loading="isLoadingMore" @click="loadMore" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { getWorkLog } from 'src/api/work-log/work-log'
import type { WorkLogEntity } from 'src/api/api.schemas'

const $q = useQuasar()
const workLogApi = getWorkLog()

// 日志输入表单
const logContent = ref('')
const characterCount = ref(0)
const maxLength = 500
const isLoading = ref(false)
const isLoadingMore = ref(false)
const editingLogId = ref<number | null>(null)

// 日志列表
const logs = ref<WorkLogEntity[]>([
  {
    id: 1,
    content: '今天完成了首页的UI设计和交互优化，解决了移动端适配问题。明天计划开始后台管理系统的开发。',
    date: new Date().toISOString(),
    userId: 1
  },
  {
    id: 2,
    content: '参加了产品需求讨论会议，梳理了用户反馈的问题清单。修复了登录页面的验证码显示bug。',
    date: new Date(Date.now() - 86400000).toISOString(), // 昨天
    userId: 1
  },
  {
    id: 3,
    content: '完成了数据统计模块的开发，包括图表展示和数据导出功能。遇到的问题：大数据量下图表渲染性能较差，通过分批渲染解决。',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 前天
    userId: 1
  },
  {
    id: 4,
    content: '进行了代码重构，优化了项目结构，提高了代码复用率。编写了单元测试用例，当前测试覆盖率达到85%。',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    userId: 1
  }
])

// 清空表单
const clearForm = () => {
  logContent.value = ''
  characterCount.value = 0
  editingLogId.value = null
}

// 提交日志
const submitLog = async () => {
  if (logContent.value.trim() === '') return
  
  isLoading.value = true
  
  try {
    // 如果是编辑模式
    if (editingLogId.value !== null) {
      const logToUpdate = logs.value.find(log => log.id === editingLogId.value)
      if (logToUpdate) {
        // 调用更新API
        // await workLogApi.workLogUpdate(editingLogId.value, { content: logContent.value })
        
        // 临时更新本地数据
        logToUpdate.content = logContent.value
        
        $q.notify({
          message: '日志更新成功',
          color: 'positive',
          position: 'bottom-right',
          timeout: 2000
        })
      }
    } else {
      // 新建日志
      const newLog: WorkLogEntity = {
        id: Math.max(...logs.value.map(log => log.id || 0), 0) + 1,
        content: logContent.value,
        date: new Date().toISOString(),
        userId: 1
      }
      
      // const response = await workLogApi.workLogCreate(newLog)
      
      // 临时添加到本地数据
      logs.value.unshift(newLog)
      
      $q.notify({
        message: '日志提交成功',
        color: 'positive',
        position: 'bottom-right',
        timeout: 2000
      })
    }
    
    clearForm()
  } catch (error) {
    console.error('提交日志失败:', error)
    $q.notify({
      message: '提交日志失败',
      color: 'negative',
      position: 'bottom-right',
      timeout: 2000
    })
  } finally {
    isLoading.value = false
  }
}

// 编辑日志
const editLog = (log: WorkLogEntity) => {
  logContent.value = log.content
  characterCount.value = log.content.length
  editingLogId.value = log.id
  
  // 滚动到表单位置
  document.getElementById('logContent')?.scrollIntoView({ behavior: 'smooth' })
}

// 确认删除
const confirmDelete = (id: number) => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这条工作日志吗？此操作不可撤销。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteLog(id)
  })
}

// 删除日志
const deleteLog = async (id: number) => {
  try {
    // const response = await workLogApi.workLogDelete(id)
    
    // 临时从本地数据删除
    logs.value = logs.value.filter(log => log.id !== id)
    
    $q.notify({
      message: '日志已删除',
      color: 'positive',
      position: 'bottom-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('删除日志失败:', error)
    $q.notify({
      message: '删除日志失败',
      color: 'negative',
      position: 'bottom-right',
      timeout: 2000
    })
  }
}

// 获取日志列表
const fetchLogs = async () => {
  isLoading.value = true
  
  try {
    // const response = await workLogApi.workLogMeLogs()
    
    // if (response.data.success && response.data.data) {
    //   logs.value = response.data.data
    // }
    
    // 使用示例数据，实际使用时注释掉
    console.log('使用示例数据')
  } catch (error) {
    console.error('获取日志列表失败:', error)
    $q.notify({
      message: '获取日志列表失败',
      color: 'negative',
      position: 'bottom-right',
      timeout: 2000
    })
  } finally {
    isLoading.value = false
  }
}

// 加载更多日志
const loadMore = async () => {
  isLoadingMore.value = true
  
  try {
    // 模拟加载更多
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中应该调用API获取更多数据
    // const response = await workLogApi.workLogMeLogs({ page: currentPage.value + 1 })
    
    // 这里只是示例，添加一条模拟数据
    const lastId = Math.min(...logs.value.map(log => log.id || 0))
    logs.value.push({
      id: lastId - 1,
      content: '参加了技术分享会，学习了最新的前端框架和性能优化技巧。',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      userId: 1
    })
  } catch (error) {
    console.error('加载更多日志失败:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// 复制日志
const copyLog = (content: string) => {
  navigator.clipboard.writeText(content)
    .then(() => {
      $q.notify({
        message: '日志已复制到剪贴板',
        color: 'blue-6',
        position: 'bottom-right',
        timeout: 2000
      })
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 格式化日期 - 完整格式
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 格式化日期 - 短格式
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 判断是否为今天
const isToday = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// 从API加载日志
onMounted(() => {
  fetchLogs()
})

// 添加组件名称
defineOptions({
  name: 'WorkLog'
})
</script>

<style lang="scss" scoped>
.selected-tag {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.q-badge {
  transition: all 0.2s ease;
  padding: 4px 8px;
  font-size: 0.8rem;
  
  &:hover {
    opacity: 0.9;
    cursor: pointer;
  }
}

.log-card {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .q-btn {
      opacity: 1;
    }
  }
  
  &.today-log {
    border-left: 3px solid #1976D2 !important;
    background-color: rgba(25, 118, 210, 0.03);
  }
  
  .q-btn {
    opacity: 0.7;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 1;
    }
  }
}

.log-content {
  white-space: pre-line;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-state {
  opacity: 0.8;
  padding: 1rem;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}
</style> 