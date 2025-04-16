<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center justify-start">
          <div class="countdown-container">
            <q-badge color="amber" text-color="black" class="countdown-badge">
              <q-icon name="schedule" size="xs" class="q-mr-xs" />
              <span class="countdown-label">截止倒计时:</span>
              <span class="countdown-digits">{{ countdownTime.days }}</span>天
              <span class="countdown-digits">{{ countdownTime.hours }}</span>时
              <span class="countdown-digits">{{ countdownTime.minutes }}</span>分
              <span class="countdown-digits">{{ countdownTime.seconds }}</span>秒
            </q-badge>
          </div>
        </q-toolbar-title>

        <!-- 使用Quasar的split button组件 - 改进版 -->
        <q-btn-dropdown
          flat
          color="primary"
          no-caps
          dense
          class="q-mr-sm copy-btn-dropdown"
          :label="selectedText || 'Flex20190429'"
          icon="content_copy"
          dropdown-icon="arrow_drop_down"
          split
          @click="handleTextSelection(selectedText || 'Flex20190429')"
        >
          <q-list>
            <q-item clickable v-close-popup @click="handleTextSelection('Flex20190429')">
              <q-item-section>
                Flex20190429
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="handleTextSelection('Media@20240218')">
              <q-item-section>
                Media@20240218
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="handleTextSelection('Pi20240219*')">
              <q-item-section>
                Pi20240219*
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="handleTextSelection('Flex@20190429')">
              <q-item-section>
                Flex@20190429
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <div class="status-info">
          <q-chip
            outline
            color="primary"
            text-color="primary"
            icon="task_alt"
            class="status-chip"
          >
            已完成: {{ statusInfo.completed }}
          </q-chip>

          <q-chip
            outline
            color="orange"
            text-color="orange"
            icon="pending"
            class="status-chip"
          >
            待处理: {{ statusInfo.pending }}
          </q-chip>

          <q-chip
            outline
            color="blue-grey"
            text-color="blue-grey"
            icon="inventory"
            class="status-chip"
          >
            总任务: {{ statusInfo.tasks }}
          </q-chip>
        </div>
        
        <!-- 主页按钮移到最右侧 -->
        <q-btn
          flat
          dense
          icon="home"
          no-caps
          :label="$q.screen.gt.xs ? '主页' : ''"
          class="q-ml-sm"
          aria-label="回到主页"
          to="/trip"
          color="primary"
        >
          <q-tooltip>回到主页</q-tooltip>
        </q-btn>
        
        <!-- 添加暗黑主题切换按钮 -->
        <q-btn
          flat
          dense
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          aria-label="切换主题"
          class="q-ml-sm"
          @click="toggleDarkMode"
        >
          <q-tooltip>{{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      class="narrow-drawer"
    >
      <q-list>
        <div class="drawer-header q-px-md">
          <q-item-label header class="q-py-sm">
            我的链接
          </q-item-label>

          <div class="expand-actions q-py-sm">
            <q-btn
              flat
              dense
              no-caps
              class="expand-btn"
              :color="allExpanded ? 'primary' : 'blue-7'"
              :label="allExpanded ? '全部收起' : '全部展开'"
              @click="toggleAllGroups"
            />
          </div>
        </div>

        <q-separator />

        <template v-if="!loading">
          <!-- 使用expand-icon="none"隐藏默认箭头 -->
          <q-expansion-item
            v-for="(group, tag) in groupedUrls"
            :key="tag"
            :model-value="expandedGroups[tag] || false"
            @update:model-value="(val) => updateExpandedState(tag, val)"
            header-class="cursor-pointer group-header"
            expand-separator
            expand-icon="none"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="folder" />
              </q-item-section>

              <q-item-section>
                {{ tag }}
              </q-item-section>
            </template>

            <q-list class="submenu-list">
              <q-item
                v-for="url in group"
                :key="url.id"
                clickable
                tag="a"
                :href="url.address"
                target="_blank"
                class="url-item"
              >
                <q-item-section avatar>
                  <q-icon name="link" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ url.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </template>

        <q-item v-else>
          <q-item-section>
            <q-spinner color="primary" />
            <q-item-label class="q-mt-sm text-center">加载中...</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable @click="openAddUrlDialog" class="add-url-btn q-mt-md">
          <q-item-section avatar>
            <q-icon name="add" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>添加新链接</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page class="work-page-content">
        <div class="q-pa-md">
          <div class="q-mx-auto" style="max-width: 1200px">
            <!-- 任务列表部分 -->
            <TaskList />

            <!-- 工作日志部分 -->
            <WorkLog />
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 添加URL对话框 -->
    <q-dialog v-model="addUrlDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">添加新链接</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newUrl.name"
            label="名称"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newUrl.address"
            label="链接地址"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newUrl.tag"
            label="分类标签"
            dense
            outlined
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="保存" color="primary" @click="saveNewUrl" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import TaskList from './components/TaskList.vue'
import WorkLog from './components/WorkLog.vue'
import { getUrl } from 'src/api/url/url'

// 添加组件名称以解决ESLint警告
defineOptions({
  name: 'WorkPage'
})

// 定义URL数据类型
interface UrlItem {
  id: number
  createdBy: number
  createdAt: string
  updatedBy: number
  updatedAt: string
  tag: string
  name: string
  address: string
  userId: number
}

const $q = useQuasar()
const urlApi = getUrl()

// 暗黑模式状态
const isDark = ref($q.dark.isActive)

// 切换暗黑模式
const toggleDarkMode = () => {
  $q.dark.toggle()
  isDark.value = $q.dark.isActive
  
  // 可选：将用户主题偏好保存到 localStorage
  localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
}

// 在组件挂载时恢复用户的主题偏好
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    const prefersDark = savedDarkMode === 'true'
    $q.dark.set(prefersDark)
    isDark.value = prefersDark
  }
})

// 侧边栏状态
const leftDrawerOpen = ref(false)

// 页面标题和状态信息
const pageTitle = ref('工作台')
const statusInfo = ref({
  tasks: 5,
  completed: 2,
  pending: 3
})

// 倒计时相关
const countdownTime = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

// 修改为2025年4月17日13:30
const targetDate = new Date('2025-04-17T13:30:00+08:00')

let countdownInterval: number | undefined

// 计算倒计时
const calculateCountdown = () => {
  const now = new Date()
  const difference = targetDate.getTime() - now.getTime()

  if (difference <= 0) {
    // 如果已经到期
    countdownTime.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  countdownTime.value = { days, hours, minutes, seconds }
}

// URL列表数据
const urlList = ref<UrlItem[]>([])
const loading = ref(true)

// 存储每个分组的展开状态
const expandedGroups = reactive<Record<string, boolean>>({})

// 检查是否所有组都已展开
const allExpanded = computed(() => {
  const tagKeys = Object.keys(groupedUrls.value)
  if (tagKeys.length === 0) return false

  return tagKeys.every(tag => expandedGroups[tag])
})

// 按标签分组的URL
const groupedUrls = computed(() => {
  const groups: Record<string, UrlItem[]> = {}

  urlList.value.forEach(url => {
    const tag = url.tag || '未分类'
    if (!groups[tag]) {
      groups[tag] = []
    }
    groups[tag].push(url)
  })

  return groups
})

// 添加URL对话框
const addUrlDialog = ref(false)
const newUrl = ref<Partial<UrlItem>>({
  name: '',
  address: '',
  tag: ''
})

// 切换侧边栏
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// 更新展开状态
const updateExpandedState = (tag: string, expanded: boolean) => {
  // 如果要展开一个组，需要先关闭其他已展开的组（手风琴效果）
  if (expanded) {
    Object.keys(expandedGroups).forEach(key => {
      if (key !== tag) {
        expandedGroups[key] = false
      }
    })
  }

  expandedGroups[tag] = expanded
}

// 切换所有分组的展开/收起状态
const toggleAllGroups = () => {
  if (allExpanded.value) {
    // 全部收起
    Object.keys(groupedUrls.value).forEach(tag => {
      expandedGroups[tag] = false
    })
  } else {
    // 全部展开
    Object.keys(groupedUrls.value).forEach(tag => {
      expandedGroups[tag] = true
    })
  }
}

// 打开添加URL对话框
const openAddUrlDialog = () => {
  newUrl.value = {
    name: '',
    address: '',
    tag: ''
  }
  addUrlDialog.value = true
}

// 保存新URL
const saveNewUrl = async () => {
  try {
    if (!newUrl.value.name || !newUrl.value.address) {
      $q.notify({
        color: 'negative',
        message: '名称和链接地址不能为空',
        icon: 'warning'
      })
      return
    }

    // 使用API保存URL
    await urlApi.saveUrl(newUrl.value as any)

    $q.notify({
      color: 'positive',
      message: '链接添加成功',
      icon: 'check_circle'
    })

    fetchUrlList()
    addUrlDialog.value = false
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '添加链接失败，请重试',
      icon: 'error'
    })
    console.error('保存URL失败:', error)
  }
}

// 获取URL列表
const fetchUrlList = async () => {
  try {
    loading.value = true
    const response = await urlApi.listUrlOfMe()

    // 检查返回的数据格式是否符合预期
    if (response.data?.payload) {
      urlList.value = response.data.payload
    } else if (response.data?.data) {
      // 兼容旧的API返回格式
      urlList.value = response.data.data
    } else {
      // 模拟数据用于测试
      urlList.value = mockData.payload
    }
  } catch (error) {
    console.error('获取URL列表失败:', error)
    $q.notify({
      color: 'negative',
      message: '获取链接列表失败',
      icon: 'error'
    })
    // 测试用
    urlList.value = mockData.payload
  } finally {
    loading.value = false
  }
}

// 模拟数据（用于开发阶段测试）
const mockData = {
  success: true,
  payload: [
    {
      id: 4,
      createdBy: 14,
      createdAt: "2025-04-15T17:59:06",
      updatedBy: 14,
      updatedAt: "2025-04-15T17:59:06",
      tag: "开发环境",
      name: "虚拟机",
      address: "https://vdesk.picclife.cn/por/service.csp",
      userId: 14
    },
    {
      id: 7,
      createdBy: 14,
      createdAt: "2025-04-15T17:59:06",
      updatedBy: 14,
      updatedAt: "2025-04-15T17:59:06",
      tag: "流水线",
      name: "回访流水线-develop",
      address: "http://devops.itservice.piccnet/console/pipeline/x8cbec/p-72a6ff7240494d7ab76684d7c519b422/history",
      userId: 14
    },
    // ...其他URL项
  ]
}

// 组件挂载时获取URL列表
onMounted(() => {
  fetchUrlList()

  // 初始化倒计时
  calculateCountdown()
  countdownInterval = setInterval(calculateCountdown, 1000)
})

// 清除定时器
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// 当前选中的文本
const selectedText = ref('Flex20190429')

// 处理文本选择功能
const handleTextSelection = (text: string) => {
  selectedText.value = text // 更新选中的文本
  
  navigator.clipboard.writeText(text)
    .then(() => {
      $q.notify({
        color: 'positive',
        message: `已复制: ${text}`,
        icon: 'content_copy',
        position: 'top',
        timeout: 1000
      })
    })
    .catch(err => {
      console.error('复制失败:', err)
      $q.notify({
        color: 'negative',
        message: '复制失败，请重试',
        icon: 'error',
        position: 'top'
      })
    })
}
</script>

<style lang="scss" scoped>
.work-page-container {
  display: flex;
  background: white;
  min-height: 100vh;
}

.side-menu-container {
  width: 260px;
  transition: width 0.3s ease;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);

  &.collapsed {
    width: 60px;

    :deep(.q-item__section--main),
    :deep(.q-item__section--side),
    :deep(.q-item__label--caption),
    :deep(.q-expansion-item__toggle-icon),
    :deep(.q-expansion-item__content) {
      display: none !important;
    }

    :deep(.q-expansion-item--collapsed) {
      .q-item__section--avatar {
        padding-right: 0;
        min-width: 40px;
        justify-content: center;
      }
    }

    :deep(.add-url-btn) {
      justify-content: center;

      .q-item__section--main {
        display: none;
      }

      .q-item__section--avatar {
        min-width: 40px;
        padding: 0;
        justify-content: center;
      }
    }

    :deep(.menu-item) {
      justify-content: center;

      .q-item__section--avatar {
        min-width: 40px;
        padding: 0;
        justify-content: center;
      }
    }

    :deep(.q-separator) {
      margin: 8px 0;
    }
  }
}

.work-page-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  transition: margin-left 0.3s ease;
}

.work-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 60px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.toggle-menu-btn {
  margin-right: 16px;
  color: #1976D2;
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    background: rgba(25, 118, 210, 0.1);
  }
}

.page-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
}

.work-page-content {
  flex: 1;
  background: #f8fafc;
}

.status-info {
  display: flex;
  margin-left: 24px;
}

.status-chip {
  margin: 0 4px;
  font-size: 0.8rem;
}

.header-actions {
  display: flex;

  .action-btn {
    margin-left: 4px;
    color: #718096;

    &:hover {
      color: #1976D2;
      background: rgba(25, 118, 210, 0.1);
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .status-chip {
    .q-chip__content {
      padding: 0 4px;
    }

    span {
      display: none;
    }
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1rem;
  }

  .status-info {
    margin-left: 8px;
  }
}

// 玻璃效果修改为适合白色背景的样式
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 自定义样式 - 更新颜色以适应白色背景
.task-card {
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
  }
}

// 快速访问卡片样式
.quick-access-card {
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
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

// 暗色主题输入框改为亮色主题
.dark-field {
  .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input {
    color: #333;
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

// 任务项样式
.task-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
  }
}

// 任务点样式
.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;

  &.incoming-dot {
    background: #1976D2;
  }

  &.outgoing-dot {
    background: #26A69A;
  }
}

// 呼入任务项左边框
.task-item:has(.incoming-dot) {
  border-left-color: #1976D2;
}

// 呼出任务项左边框
.task-item:has(.outgoing-dot) {
  border-left-color: #26A69A;
}

// 添加侧边栏过渡效果
.side-menu-enter-active,
.side-menu-leave-active {
  transition: transform 0.3s ease;
}

.side-menu-enter-from,
.side-menu-leave-to {
  transform: translateX(-200px);
}

.group-header {
  font-weight: 500;
}

.add-url-btn {
  color: #1976D2;
}

.expand-btn {
  font-size: 0.8rem;

  &:hover {
    background: rgba(25, 118, 210, 0.1);
  }
}

.url-item {
  padding-left: 40px; /* 减少链接项的缩进 */
}

.submenu-list {
  padding: 0;

  :deep(.q-item) {
    padding-top: 4px;
    padding-bottom: 4px;
  }
}

.narrow-drawer {
  :deep(.q-item) {
    padding: 8px 8px;
  }

  :deep(.q-item__section--avatar) {
    min-width: 40px;
    padding-right: 8px;
  }

  :deep(.q-expansion-item__content) {
    padding: 0;
  }
}

// 倒计时样式
.countdown-container {
  display: flex;
  align-items: center;
}

.countdown-badge {
  padding: 6px 10px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 400;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.countdown-label {
  margin-right: 6px;
  font-weight: 500;
}

.countdown-digits {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  padding: 0 2px;
  min-width: 22px;
  text-align: center;
  display: inline-block;
  margin: 0 2px;
}

// 响应式调整
@media (max-width: 768px) {
  .countdown-label {
    display: none;
  }

  .countdown-badge {
    padding: 4px 8px;
  }
}

// 增强复制按钮分割线的样式
.copy-btn-dropdown {
  :deep(.q-btn-dropdown__arrow-container) {
    border-left: 1px solid rgba(25, 118, 210, 0.4);
    margin-left: 4px;
    padding-left: 4px;
  }

  &:hover {
    :deep(.q-btn-dropdown__arrow-container) {
      border-left-color: rgba(25, 118, 210, 0.7);
    }
  }
}
</style>
