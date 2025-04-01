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

      <!-- 标签选择 -->
      <div class="q-mb-md">
        <label class="text-subtitle1 text-weight-medium text-dark q-mb-sm block">添加标签</label>
        <div class="row q-gutter-sm">
          <q-badge
            v-for="tag in availableTags"
            :key="tag.name"
            :color="tag.color"
            :text-color="tag.textColor"
            :label="tag.name"
            class="q-pa-xs cursor-pointer"
            @click="toggleTag(tag.name)"
            :class="{ 'selected-tag': selectedTags.includes(tag.name) }"
          />
        </div>
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
      <div class="row items-center q-mb-md">
        <q-icon name="eva-clock-outline" color="grey-5" size="sm" class="q-mr-xs" />
        <h3 class="text-subtitle1 text-weight-medium text-dark q-my-none">工作日志记录</h3>
      </div>

      <!-- 日志列表 -->
      <div class="q-gutter-y-md">
        <q-card
          v-for="log in logs"
          :key="log.id"
          flat
          bordered
          class="q-pa-md glass-card"
          style="border-left: 4px solid #9e9e9e;"
        >
          <div class="row justify-between items-start">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <div class="text-caption text-grey-6 q-mr-md">{{ formatDate(log.date) }}</div>
                <div class="row q-gutter-x-xs">
                  <q-badge
                    v-for="tag in log.tags"
                    :key="tag"
                    :color="getTagColor(tag).color"
                    :text-color="getTagColor(tag).textColor"
                    :label="tag"
                  />
                </div>
              </div>
              <p class="q-mb-sm text-grey-8">{{ log.content }}</p>
            </div>
            <div class="col-auto q-ml-md">
              <div class="row q-gutter-x-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="grey-5"
                  icon="eva-copy-outline"
                  @click="copyLog(log.content)"
                  title="复制日志"
                />
                <q-btn
                  flat
                  round
                  dense
                  color="grey-5"
                  icon="eva-trash-2-outline"
                  @click="deleteLog(log.id)"
                  title="删除日志"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- 无日志时显示 -->
      <div v-if="logs.length === 0" class="text-center q-py-xl">
        <q-icon name="eva-file-text-outline" size="lg" color="grey-5" class="q-mb-md" />
        <p class="text-grey-5 q-mb-xs">暂无工作日志记录</p>
        <p class="text-caption text-grey-6">记录你的工作内容，帮助你更好地管理工作进度</p>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="logs.length > 0" class="flex justify-center q-mt-md">
        <q-btn flat color="grey-5" label="加载更多" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getWorkLog } from 'src/api/work-log/work-log'
import type { WorkLogEntity } from 'src/api/api.schemas'

const $q = useQuasar()
const workLogApi = getWorkLog()

// 日志输入表单
const logContent = ref('')
const characterCount = ref(0)
const maxLength = 500
const selectedTags = ref<string[]>([])
const isLoading = ref(false)

// 日志列表
const logs = ref<WorkLogEntity[]>([])

// 可用标签
const availableTags = [
  { name: '需求分析', color: 'blue-2', textColor: 'blue-8' },
  { name: '开发', color: 'green-2', textColor: 'green-8' },
  { name: '设计', color: 'purple-2', textColor: 'purple-8' },
  { name: '测试', color: 'amber-2', textColor: 'amber-8' },
  { name: 'Bug修复', color: 'red-2', textColor: 'red-8' },
  { name: '会议', color: 'grey-5', textColor: 'white' }
]

// 获取标签颜色
const getTagColor = (tagName: string) => {
  const tag = availableTags.find(t => t.name === tagName)
  return tag || { color: 'grey-5', textColor: 'white' }
}

// 切换标签选择
const toggleTag = (tagName: string) => {
  if (selectedTags.value.includes(tagName)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tagName)
  } else {
    selectedTags.value.push(tagName)
  }
}

// 清空表单
const clearForm = () => {
  logContent.value = ''
  characterCount.value = 0
  selectedTags.value = []
}

// 提交日志
const submitLog = async () => {
  if (logContent.value.trim() === '') return
  
  isLoading.value = true
  
  try {
    const newLog: WorkLogEntity = {
      content: logContent.value,
      tags: selectedTags.value.length > 0 ? selectedTags.value.join(',') : '开发', // API可能需要字符串形式的标签
      // 其他必要的字段根据WorkLogEntity类型添加
    }
    
    const response = await workLogApi.workLogCreate(newLog)
    
    if (response.data.success) {
      // 提交成功后重新获取日志列表
      fetchLogs()
      clearForm()
      $q.notify({
        message: '日志提交成功',
        color: 'positive',
        position: 'bottom-right',
        timeout: 2000
      })
    }
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

// 删除日志
const deleteLog = async (id: number) => {
  try {
    const response = await workLogApi.workLogDelete(id)
    
    if (response.data.success) {
      // 删除成功后更新日志列表
      logs.value = logs.value.filter(log => log.id !== id)
      $q.notify({
        message: '日志已删除',
        color: 'positive',
        position: 'bottom-right',
        timeout: 2000
      })
    }
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
    const response = await workLogApi.workLogMeLogs()
    
    if (response.data.success && response.data.data) {
      logs.value = response.data.data
    }
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

// 格式化日期 - 修改为处理API返回的日期格式
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
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
</style> 