<template>
  <section id="worklog" class="q-mb-xl glass rounded-xl shadow-2xl">
    <div class="q-pa-md">
      <div class="section-header q-pb-md flex justify-between items-center">
        <h2 class="text-h5 text-weight-bold q-my-none">
          <q-icon name="task_alt" size="28px" class="q-mr-sm" />
          工作日志
        </h2>
        <q-btn color="primary" label="添加日志" icon="add" rounded unelevated @click="showNewLogDialog = true"
          :disable="isLoading" />
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="q-pa-lg flex flex-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-ml-sm">加载中...</div>
      </div>

      <!-- 日志列表 -->
      <div class="work-logs q-mt-md" v-else-if="logs.length > 0">
        <div v-for="(log, index) in visibleLogs" :key="index" class="work-log-item q-mb-md">
          <q-card flat bordered class="log-card">
            <q-card-section>
              <div class="row justify-between items-start">
                <div class="col-9">
                  <!-- 使用日期作为标题，带有彩色条带样式 -->
                  <div class="date-title">
                    <span class="text-h6">{{ getRelativeDate(log.date) }}</span>
                    <div class="date-line" :class="getDateLineClass(log.date)"></div>
                  </div>

                  <!-- 日志内容 -->
                  <div class="text-body2 q-mt-sm log-content">{{ log.content }}</div>
                </div>

                <div class="col-3 text-right">
                  <div class="q-mt-sm">
                    <q-btn flat round dense color="blue-7" icon="content_copy" @click="copyLog(log)" class="q-mr-xs">
                      <q-tooltip>复制内容</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(index)">
                      <q-tooltip>删除日志</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 展示更多按钮 -->
        <div v-if="logs.length > maxVisibleLogs && !showAllLogs" class="text-center q-mt-md">
          <q-btn flat color="primary" label="查看更多" @click="showAllLogs = true" icon-right="expand_more" />
        </div>

        <!-- 收起按钮 -->
        <div v-if="showAllLogs && logs.length > maxVisibleLogs" class="text-center q-mt-md">
          <q-btn flat color="primary" label="收起" @click="showAllLogs = false" icon-right="expand_less" />
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
            <!-- 需求类型与内容添加区域 -->
            <div>
              <div v-for="(item, index) in logItems" :key="index" class="q-mb-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <q-select v-model="item.type" :options="requirementOptions" label="需求" outlined dense map-options
                      emit-value :rules="[val => !!val || '请选择需求']" />
                  </div>
                  <div class="col-7">
                    <q-input v-model="item.content" label="内容" outlined dense :rules="[val => !!val || '请输入内容']" />
                  </div>
                  <div class="col-1 flex items-center">
                    <q-btn v-if="index > 0" flat round dense color="negative" icon="remove_circle"
                      @click="removeLogItem(index)" />
                  </div>
                </div>
              </div>

              <div class="q-mt-sm">
                <q-btn outline color="primary" icon="add" label="添加需求项" size="sm" @click="addLogItem" />
              </div>
            </div>

            <!-- 字数统计显示 -->
            <div class="text-caption text-grey-7 text-right">
              当前字数: {{ totalCharCount }} 字
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
import { ref, watch, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { getWorkLog } from '../../../api/work-log/work-log'
import { getTask } from 'src/api/task/task' // 使用task中的接口
import type { WorkLogEntity } from 'src/api/api.schemas';

// 初始化通知
const $q = useQuasar()
const workLogApi = getWorkLog()
const taskApi = getTask() // 使用task API

// 定义日志接口
interface WorkLogItem {
  id?: number | undefined  // 明确指定id可以是undefined
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
const requirementOptions = ref<{ label: string; value: string }[]>([])

// 获取需求类型列表
async function fetchRequirementOptions() {
  try {
    const response = await taskApi.getAllRequirementNames() // 使用task中的接口
    if (response.data.isOk && response.data.okData) {
      // 将API返回的字符串数组转换为选项格式
      requirementOptions.value = response.data.okData.map(name => ({
        label: name,
        value: name
      }))
    } else {
      $q.notify({
        color: 'negative',
        message: '获取需求类型失败',
        icon: 'error'
      })
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '获取需求类型出错:' + String(error),
      icon: 'error'
    })
  }
}

// 初始化日志列表
const logs = ref<WorkLogItem[]>([])
const isLoading = ref(false)
const maxVisibleLogs = ref(5) // 默认显示的日志数量
const showAllLogs = ref(false) // 控制是否显示所有日志

// 新增日志模态框状态
const showNewLogDialog = ref(false)

// 删除确认对话框状态
const showDeleteDialog = ref(false)
const deleteIndex = ref(-1)

// 日志项目管理
const logItems = ref<LogItemEntry[]>([
  { type: '', content: '' }
])

// 计算当前所有日志项总字数
const totalCharCount = computed(() => {
  return logItems.value
    .map(item => {
      // 计算每个日志项的字符数（包括类型和内容）
      const typeChars = item.type ? item.type.length : 0;
      const contentChars = item.content ? item.content.length : 0;
      return typeChars + contentChars;
    })
    .reduce((sum, current) => sum + current, 0);
});

// 获取日志列表
async function fetchLogs() {
  isLoading.value = true
  try {
    // 假设后端API已经提供按日期降序排序的数据
    const response = await workLogApi.listWorkLogOfMe()
    if (response.data.isOk && response.data.okData) {
      // 直接使用后端返回的已排序数据
      logs.value = response.data.okData.map(item => ({
        id: item.id,
        content: item.content || '',
        date: item.logDate || formatDateForInput(new Date(item.createdAt || new Date()))
      })) as WorkLogItem[]  // 添加类型断言
    } else {
      $q.notify({
        color: 'negative',
        message: '获取日志列表失败',
        icon: 'error'
      })
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '获取日志列表出错: ' + String(error),
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 获取要显示的日志列表
const visibleLogs = computed(() => {
  return showAllLogs.value ? logs.value : logs.value.slice(0, maxVisibleLogs.value)
})

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
async function deleteLog() {
  if (deleteIndex.value > -1 && deleteIndex.value < logs.value.length) {
    const logToDelete = logs.value[deleteIndex.value]!;

    if (!logToDelete.id) {
      $q.notify({
        color: 'negative',
        message: '无法删除，日志ID不存在',
        icon: 'error'
      })
      return
    }

    try {
      const response = await workLogApi.deleteWorkLog(logToDelete.id)
      if (response.data.isOk) {
        logs.value.splice(deleteIndex.value, 1)
        $q.notify({
          color: 'positive',
          message: '日志已删除',
          icon: 'check_circle'
        })
      } else {
        $q.notify({
          color: 'negative',
          message: '删除失败: ' + (response.data.okData || '未知错误'),
          icon: 'error'
        })
      }
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: '删除日志出错: ' + String(error),
        icon: 'error'
      })
    }
  }
}

// 获取日期线条样式类
function getDateLineClass(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dayBeforeYesterday = new Date(today)
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

  const inputDate = new Date(dateStr)
  inputDate.setHours(0, 0, 0, 0)

  if (inputDate.getTime() === today.getTime()) {
    return 'today'
  } else if (inputDate.getTime() === yesterday.getTime()) {
    return 'yesterday'
  } else if (inputDate.getTime() === dayBeforeYesterday.getTime()) {
    return 'day-before-yesterday'
  } else {
    return 'older'
  }
}

// 添加新日志
async function addNewLog() {
  // 确保至少有一个有效的需求项
  if (!logItems.value.some(item => item.type && item.content)) {
    $q.notify({
      color: 'negative',
      message: '请至少添加一个需求项',
      icon: 'error'
    })
    return
  }

  // 拼接所有需求内容
  const combinedContent = logItems.value
    .filter(item => item.type && item.content)
    .map(item => `【${item.type}】${item.content}`)
    .join('\n')

  const newLog: WorkLogEntity = {
    content: combinedContent,
    logDate: formatDateForInput(new Date())
  }

  try {
    const response = await workLogApi.saveWorkLog(newLog)
    if (response.data.isOk) {
      // 重新获取最新的日志列表
      await fetchLogs()

      // 重置表单
      logItems.value = [{ type: '', content: '' }]

      // 关闭对话框
      showNewLogDialog.value = false

      // 显示通知
      $q.notify({
        color: 'positive',
        message: '工作日志已添加',
        icon: 'check_circle'
      })
    } else {
      $q.notify({
        color: 'negative',
        message: '添加失败: ' + (response.data.failMsg || '未知错误'),
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('添加日志出错:', error)
    $q.notify({
      color: 'negative',
      message: '添加日志出错',
      icon: 'error'
    })
  }
}

// 格式化日期显示 - 使用相对时间
function getRelativeDate(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dayBeforeYesterday = new Date(today)
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

  const inputDate = new Date(dateStr)
  inputDate.setHours(0, 0, 0, 0)

  if (inputDate.getTime() === today.getTime()) {
    return '今天'
  } else if (inputDate.getTime() === yesterday.getTime()) {
    return '昨天'
  } else if (inputDate.getTime() === dayBeforeYesterday.getTime()) {
    return '前天'
  } else {
    // 带星期几的日期格式
    return formatDateWithWeekday(dateStr)
  }
}

// 格式化带星期几的日期
function formatDateWithWeekday(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[date.getDay()]

  return `${year}年${month}月${day}日 ${weekday}`
}

// 格式化日期为输入框格式 YYYY-MM-DD
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 复制日志内容
function copyLog(log: WorkLogItem) {
  const textToCopy = `${log.content}\n日期：${formatDateWithWeekday(log.date)}`

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

// 当打开新建对话框时重置表单
function resetForm() {
  logItems.value = [{ type: '', content: '' }]
}

// 监听对话框打开
watch(showNewLogDialog, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

// 组件加载后获取日志列表和需求类型
onMounted(() => {
  fetchLogs().catch(error => {
    console.error('获取日志时出错:', error)
    $q.notify({
      color: 'negative',
      message: '加载日志出错',
      icon: 'error'
    })
  })

  fetchRequirementOptions().catch(error => {
    console.error('获取需求选项时出错:', error)
    $q.notify({
      color: 'negative',
      message: '加载需求类型出错',
      icon: 'error'
    })
  })
})

// 组件选项
defineOptions({
  name: 'WorkLog'
})
</script>

<style lang="scss" scoped>
.log-card {
  transition: all 0.3s ease;
  background: rgba($cursor-surface, 0.9);

  &:hover {
    box-shadow: $elevation-2;
    transform: translateY(-2px);
  }
}

.log-content {
  color: $cursor-text; // 使用变量系统
  line-height: 1.5;
  white-space: pre-line;
}

.section-header {
  border-bottom: 1px solid $cursor-border; // 使用变量系统
}

.date-title {
  position: relative;
  padding-left: 12px;
  margin-bottom: 8px;
}

.date-line {
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 4px;
  border-radius: 2px;

  &.today {
    background-color: $cursor-error; // 使用变量系统
  }

  &.yesterday {
    background-color: $cursor-warning; // 使用变量系统
  }

  &.day-before-yesterday {
    background-color: $cursor-warning; // 使用变量系统
  }

  &.older {
    background-color: $cursor-info; // 使用变量系统
  }
}
</style>
