<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-btn flat dense icon="link" color="primary" class="q-ml-sm" @click="handleTodoLink">
          <q-tooltip>虚拟机</q-tooltip>
        </q-btn>

        <q-toolbar-title class="row items-center justify-center">
          <!-- 添加待办列表下拉按钮 -->
          <q-btn-dropdown flat color="green-7" no-caps dense class="q-mr-sm todo-dropdown" label="待办事项"
            icon="checklist">
            <q-list style="min-width: 250px">
              <q-item-label header>今日待办</q-item-label>

              <template v-if="todoItems.length > 0">
                <q-item v-for="(item, index) in todoItems" :key="index" tag="label" v-ripple>
                  <q-item-section side>
                    <q-checkbox v-model="item.done" color="green-7" @update:model-value="updateTodoStatus(index)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="{ 'text-strike': item.done }">{{ item.text }}</q-item-label>
                    <q-item-label caption v-if="item.dueTime">{{ item.dueTime }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round dense icon="delete" color="grey-7" size="sm" @click.stop="removeTodo(index)" />
                  </q-item-section>
                </q-item>
              </template>

              <q-item v-else>
                <q-item-section>
                  <q-item-label class="text-center text-grey-7">暂无待办事项</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section>
                  <q-input v-model="newTodo" dense placeholder="添加新待办..." @keyup.enter="addTodo" class="new-todo-input">
                    <template v-slot:append>
                      <q-btn round dense flat icon="add" color="green-7" @click="addTodo" />
                    </template>
                  </q-input>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- 使用Quasar的split button组件 - 改进版 -->
          <q-btn-dropdown flat color="primary" no-caps dense class="q-mr-sm copy-btn-dropdown"
            :label="selectedText || 'Flex20190429'" icon="content_copy" dropdown-icon="arrow_drop_down" split
            @click="handleTextSelection(selectedText || 'Flex20190429')">
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

              <q-separator />

              <q-item clickable v-close-popup @click="copyCurrentDateTime">
                <q-item-section>
                  当前时间 (yyyyMMddHHmmss)
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="copyOracleTimestamp">
                <q-item-section>
                  Oracle时间 (yyyy-MM-dd HH:mm:ss.000)
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- 主页按钮移到最右侧 -->
          <q-btn flat dense icon="home" no-caps :label="$q.screen.gt.xs ? '主页' : ''" class="q-ml-sm" aria-label="回到主页"
            to="/trip" color="primary">
            <q-tooltip>回到主页</q-tooltip>
          </q-btn>

          <!-- 添加暗黑主题切换按钮 -->
          <q-btn flat dense :icon="isDark ? 'light_mode' : 'dark_mode'" aria-label="切换主题" class="q-ml-sm"
            @click="toggleDarkMode">
            <q-tooltip>{{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}</q-tooltip>
          </q-btn>

        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="240" class="narrow-drawer">
      <q-list>
        <div class="drawer-header q-px-md">
          <q-item-label header class="q-py-sm">
            我的链接
          </q-item-label>

          <div class="expand-actions q-py-sm">
            <q-btn flat dense no-caps class="expand-btn" :color="allExpanded ? 'primary' : 'blue-7'"
              :label="allExpanded ? '全部收起' : '全部展开'" @click="toggleAllGroups" />
          </div>
        </div>

        <q-separator />

        <template v-if="!loading">
          <!-- 使用expand-icon="none"隐藏默认箭头 -->
          <q-expansion-item v-for="(group, tag) in groupedUrls" :key="tag" :model-value="expandedGroups[tag] || false"
            @update:model-value="(val) => updateExpandedState(tag, val)" header-class="cursor-pointer group-header"
            expand-separator expand-icon="none">
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="folder" />
              </q-item-section>

              <q-item-section>
                {{ tag }}
              </q-item-section>
            </template>

            <q-list class="submenu-list">
              <q-item v-for="url in group" :key="url.id" clickable tag="a" :href="url.address" target="_blank"
                class="url-item">
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
      <q-page class="work-page">
        <div class="work-page-content">
          <div class="content-wrapper">
            <!-- 任务列表部分 -->
            <TaskList />

            <!-- 命名建议部分 -->
            <NamingSuggestion />

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
          <q-input v-model="newUrl.name" label="名称" dense outlined class="q-mb-md" />
          <q-input v-model="newUrl.address" label="链接地址" dense outlined class="q-mb-md" />
          <q-select v-model="newUrl.tag" :options="tagOptions" label="分类标签" dense outlined use-input use-chips
            input-debounce="300" new-value-mode="add-unique" @filter="filterTagOptions" @input-value="onTagInputValue"
            class="q-mb-md" hint="可选择现有分类或输入新分类">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  没有找到匹配的分类，输入回车创建新分类
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
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
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import TaskList from './components/TaskList.vue'
import WorkLog from './components/WorkLog.vue'
import NamingSuggestion from './components/NamingSuggestion.vue'
import { getUrl } from 'src/api/url/url'
import { getTodo } from 'src/api/todo/todo'
import type { SysUrl, TodoVO } from 'src/api/api.schemas'

// 添加组件名称以解决ESLint警告
defineOptions({
  name: 'WorkPage'
})

// 定义待办事项类型 - 使用正确的接口类型
interface TodoItem {
  id?: string | undefined // 使用string类型，与TodoVO一致，允许undefined
  text: string
  done: boolean
  dueTime?: string | undefined
}

// 定义URL数据类型 - 使用正确的接口类型
interface UrlItem extends SysUrl {
  id: number // 确保id是必选的
}

const $q = useQuasar()
const urlApi = getUrl()
const todoApi = getTodo()

// 暗黑模式状态
const isDark = ref($q.dark.isActive)

// 切换暗黑模式
const toggleDarkMode = () => {
  $q.dark.toggle()
  isDark.value = $q.dark.isActive

  // 可选：将用户主题偏好保存到 localStorage
  localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
}

const handleTodoLink = async () => {
  try {
    const response = await urlApi.getUrlByCondition({ name: "虚拟机" });
    const urlList = response.data?.okData;
    if (urlList && Array.isArray(urlList) && urlList.length > 0) {
      const firstUrl = urlList[0];
      if (firstUrl?.address) {
        window.open(firstUrl.address, '_blank'); // 新窗口打开
      } else {
        $q.notify({
          color: 'negative',
          message: '未获取到跳转链接',
          icon: 'error'
        });
      }
    } else {
      $q.notify({
        color: 'negative',
        message: '未获取到跳转链接',
        icon: 'error'
      });
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '获取链接失败',
      icon: 'error'
    });
  }
};

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
    groups[tag]!.push(url) // 添加非空断言
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
const openAddUrlDialog = async () => {
  newUrl.value = {
    name: '',
    address: '',
    tag: ''
  }
  addUrlDialog.value = true

  // 获取最新的标签选项
  await fetchTagOptions()
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
    const response = await urlApi.getUrlByCondition({})

    // 检查返回的数据格式是否符合预期
    if (response.data?.isOk && response.data.okData) {
      // 确保每个URL都有id
      urlList.value = response.data.okData.map(url => ({
        ...url,
        id: url.id || 0 // 提供默认值
      })) as UrlItem[]
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

// 待办事项列表
const todoItems = ref<TodoItem[]>([])
const newTodo = ref('')

// 获取待办事项列表
const fetchTodos = async () => {
  try {
    const response = await todoApi.getTodoByCondition({})
    if (response.data?.okData) {
      todoItems.value = response.data.okData.map((item: TodoVO) => ({
        text: item.title || '',
        done: item.completed || false,
        id: item.id, // 直接使用string类型的id
        dueTime: undefined // TodoVO中没有dueDate字段
      }))
    }
  } catch (error) {
    console.error('获取待办列表失败:', error)
    $q.notify({
      color: 'negative',
      message: '获取待办列表失败',
      icon: 'error'
    })
  }
}

// 添加待办事项
const addTodo = async () => {
  if (newTodo.value.trim()) {
    try {
      // 创建待办事项对象
      const todoEntity = {
        title: newTodo.value.trim(),
        completed: false,
        description: '',
        priority: 0,
        category: '工作'
      }

      // 调用API保存待办事项
      const response = await todoApi.saveTodo(todoEntity)

      if (response.data?.isOk) {
        $q.notify({
          color: 'positive',
          message: '待办事项添加成功',
          icon: 'check_circle'
        })

        // 重新获取待办列表
        fetchTodos()

        // 清空输入
        newTodo.value = ''
      }
    } catch (error) {
      console.error('添加待办事项失败:', error)
      $q.notify({
        color: 'negative',
        message: '添加待办事项失败',
        icon: 'error'
      })
    }
  }
}

// 更新待办事项状态
const updateTodoStatus = async (index: number) => {
  try {
    const todoItem = todoItems.value[index]

    // 确保待办项有ID
    if (!todoItem?.id) {
      console.error('待办项缺少ID')
      return
    }

    if (todoItem.done) {
      // 如果标记为完成，调用完成API
      await todoApi.completeTodo(todoItem.id)
    } else {
      // 如果标记为未完成，调用更新API
      const todoEntity = {
        id: Number(todoItem.id), // 转换为 number 类型
        title: todoItem.text,
        completed: false
      }
      await todoApi.updateTodo(todoEntity)
    }

    $q.notify({
      color: 'positive',
      message: todoItem.done ? '已完成待办事项' : '已恢复待办事项',
      icon: 'check_circle',
      position: 'top',
      timeout: 1000
    })
  } catch (error) {
    console.error('更新待办状态失败:', error)
    $q.notify({
      color: 'negative',
      message: '更新待办状态失败',
      icon: 'error'
    })
  }
}

// 删除待办事项
const removeTodo = async (index: number) => {
  try {
    const todoItem = todoItems.value[index]

    // 确保待办项有ID
    if (!todoItem?.id) {
      console.error('待办项缺少ID')
      return
    }

    // 调用API删除待办事项
    await todoApi.deleteTodo(todoItem.id)

    // 从列表中移除
    todoItems.value.splice(index, 1)

    $q.notify({
      color: 'positive',
      message: '已删除待办事项',
      icon: 'delete',
      position: 'top',
      timeout: 1000
    })
  } catch (error) {
    console.error('删除待办事项失败:', error)
    $q.notify({
      color: 'negative',
      message: '删除待办事项失败',
      icon: 'error'
    })
  }
}

// 在组件挂载时加载待办事项
onMounted(() => {
  fetchUrlList()
  fetchTodos() // 从API获取待办事项
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

// 复制当前时间函数
const copyCurrentDateTime = () => {
  const now = new Date()
  const formattedDateTime = formatDateTime(now)

  // 调用已有的处理函数进行复制
  handleTextSelection(formattedDateTime)
}

// 格式化日期时间为 yyyyMMddHHmmss 格式
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

// 复制Oracle时间戳格式
const copyOracleTimestamp = () => {
  const now = new Date()
  const formattedTimestamp = formatOracleTimestamp(now)

  // 调用已有的处理函数进行复制
  handleTextSelection(formattedTimestamp)
}

// 格式化为Oracle时间戳格式：yyyy-MM-dd HH:mm:ss.000
const formatOracleTimestamp = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

// 标签选项
const tagOptions = ref<string[]>([])
const allTagOptions = ref<string[]>([])

// 获取标签分类
const fetchTagOptions = async () => {
  try {
    const response = await urlApi.getUrlTag()
    if (response.data?.isOk && response.data.okData) {
      allTagOptions.value = response.data.okData
      tagOptions.value = [...allTagOptions.value]
    }
  } catch (error) {
    console.error('获取标签分类失败:', error)
    // 如果获取失败，使用默认分类
    allTagOptions.value = ['工具', '学习', '娱乐', '工作', '其他']
    tagOptions.value = [...allTagOptions.value]
  }
}

// 过滤标签选项
const filterTagOptions = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      tagOptions.value = [...allTagOptions.value]
    } else {
      const needle = val.toLowerCase()
      tagOptions.value = allTagOptions.value.filter(
        tag => tag.toLowerCase().includes(needle)
      )
    }
  })
}

// 处理标签输入值
const onTagInputValue = (val: string) => {
  // 这里可以添加自定义逻辑，比如验证输入格式等
  if (val && val.length > 20) {
    $q.notify({
      color: 'warning',
      message: '标签名称不能超过20个字符',
      icon: 'warning'
    })
  }
}
</script>

<style lang="scss" scoped>
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

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.toggle-menu-btn {
  margin-right: 16px;
  color: $cursor-primary; // 使用变量系统
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    background: rgba($cursor-primary, 0.1);
  }
}

.page-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: $cursor-text; // 使用变量系统
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
    color: $cursor-muted; // 使用变量系统

    &:hover {
      color: $cursor-primary; // 使用变量系统
      background: rgba($cursor-primary, 0.1);
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

// 玻璃效果修改为使用颜色系统
.glass {
  background: rgba($cursor-surface, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid $cursor-border;
}

.glass-card {
  background: rgba($cursor-surface, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid $cursor-border;
  box-shadow: $elevation-1;
}

// 自定义样式 - 使用颜色系统
.task-card {
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: $elevation-2;
    transform: translateY(-2px);
    background: $cursor-surface;
  }
}

// 快速访问卡片样式
.quick-access-card {
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: $elevation-2;
    transform: translateY(-2px);
    background: $cursor-surface;
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

  .q-field__native,
  .q-field__prefix,
  .q-field__suffix,
  .q-field__input {
    color: $cursor-text; // 使用变量系统
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
    background: rgba($cursor-info, 0.2);
    color: $cursor-info; // 使用变量系统

    &:hover {
      background: rgba($cursor-info, 0.3);
    }
  }

  &.doc-design {
    background: rgba($cursor-accent, 0.2);
    color: $cursor-accent; // 使用变量系统

    &:hover {
      background: rgba($cursor-accent, 0.3);
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
  border-bottom: 1px solid $cursor-border; // 使用颜色系统的边框颜色
}

// 任务项样式
.task-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: rgba($cursor-surface, 0.9);
  margin-bottom: 12px;
  transition: all 0.3s ease;
  box-shadow: $elevation-1;
  cursor: pointer;

  &:hover {
    box-shadow: $elevation-2;
    transform: translateY(-2px);
    background: $cursor-surface;
  }
}

// 任务点样式
.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;

  &.incoming-dot {
    background: $cursor-primary; // 使用颜色系统的主要颜色
  }

  &.outgoing-dot {
    background: $cursor-secondary; // 使用颜色系统的次要颜色
  }
}

// 呼入任务项左边框
.task-item:has(.incoming-dot) {
  border-left-color: $cursor-primary; // 使用颜色系统的主要颜色
}

// 呼出任务项左边框
.task-item:has(.outgoing-dot) {
  border-left-color: $cursor-secondary; // 使用颜色系统的次要颜色
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

// 侧边栏样式 - 使用颜色变量系统
.narrow-drawer {
  background: $cursor-bg; // 使用变量系统的背景色
  border-right: 1px solid $cursor-border; // 使用变量系统的边框色

  :deep(.q-item) {
    padding: 8px 8px;
    color: $cursor-text; // 使用变量系统的文字颜色
    transition: all 0.2s ease;

    &:hover {
      background: $hover-bg; // 使用变量系统的悬停背景
      color: $cursor-primary; // 悬停时使用主要颜色
    }

    &.q-item--active {
      background: $active-bg; // 使用变量系统的激活背景
      color: $cursor-primary; // 激活状态使用主要颜色
    }
  }

  :deep(.q-item__section--avatar) {
    min-width: 40px;
    padding-right: 8px;
    color: $cursor-text; // 图标颜色使用文字颜色
  }

  :deep(.q-expansion-item__content) {
    padding: 0;
    background: rgba($cursor-bg, 0.5); // 子菜单背景
  }

  :deep(.q-expansion-item__header) {
    color: $cursor-text; // 展开项标题颜色

    &:hover {
      background: $hover-bg;
      color: $cursor-primary;
    }
  }
}

// 分组标题样式
.group-header {
  font-weight: 500;
  color: $cursor-text; // 使用变量系统的文字颜色
  background: rgba($cursor-surface, 0.8); // 使用变量系统的表面色
  border-bottom: 1px solid $cursor-border; // 使用变量系统的边框色
}

// 展开/收起按钮样式
.expand-btn {
  font-size: 0.8rem;
  color: $cursor-primary; // 使用变量系统的主要颜色
  background: rgba($cursor-primary, 0.1); // 使用变量系统的半透明背景

  &:hover {
    background: rgba($cursor-primary, 0.2);
    color: $cursor-primary;
  }
}

// 添加链接按钮样式
.add-url-btn {
  color: $cursor-primary; // 使用变量系统的主要颜色
  background: rgba($cursor-primary, 0.1); // 使用变量系统的半透明背景
  border: 1px solid rgba($cursor-primary, 0.3); // 使用变量系统的边框色
  border-radius: 8px;
  margin: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($cursor-primary, 0.2);
    border-color: rgba($cursor-primary, 0.5);
    transform: translateY(-1px);
  }

  :deep(.q-item__section--avatar) {
    color: $cursor-primary; // 图标颜色
  }

  :deep(.q-item__section--main) {
    color: $cursor-primary; // 文字颜色
  }
}

// 链接项样式
.url-item {
  padding-left: 40px;
  color: $cursor-text; // 使用变量系统的文字颜色
  transition: all 0.2s ease;

  &:hover {
    background: $hover-bg; // 使用变量系统的悬停背景
    color: $cursor-primary; // 悬停时使用主要颜色
    padding-left: 44px; // 悬停时稍微向右移动
  }

  :deep(.q-item__section--avatar) {
    color: $cursor-text; // 图标颜色

    .q-icon {
      color: $cursor-text; // 确保图标颜色一致
    }
  }

  :deep(.q-item__section--main) {
    color: $cursor-text; // 文字颜色
  }
}

// 子菜单列表样式
.submenu-list {
  padding: 0;
  background: rgba($cursor-bg, 0.3); // 使用变量系统的半透明背景

  :deep(.q-item) {
    padding-top: 4px;
    padding-bottom: 4px;
    color: $cursor-muted; // 子菜单项使用次要文字颜色
    font-size: 0.9rem;

    &:hover {
      color: $cursor-primary; // 悬停时使用主要颜色
      background: $hover-bg;
    }
  }
}

// 抽屉头部样式
.drawer-header {
  background: rgba($cursor-surface, 0.9); // 使用变量系统的表面色
  border-bottom: 1px solid $cursor-border; // 使用变量系统的边框色
  padding: 16px;
  margin-bottom: 8px;

  .q-item-label {
    color: $cursor-text; // 使用变量系统的文字颜色
    font-weight: 600;
  }
}

// 展开操作区域样式
.expand-actions {
  .expand-btn {
    background: rgba($cursor-primary, 0.1);
    color: $cursor-primary;
    border: 1px solid rgba($cursor-primary, 0.3);
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.8rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($cursor-primary, 0.2);
      border-color: rgba($cursor-primary, 0.5);
    }
  }
}

// 待办事项下拉样式 - 使用颜色变量
.todo-dropdown {
  .q-btn-dropdown__arrow-container {
    border-left: 1px solid rgba($cursor-success, 0.4); // 使用变量系统的成功色
    margin-left: 4px;
    padding-left: 4px;
  }

  &:hover {
    .q-btn-dropdown__arrow-container {
      border-left-color: rgba($cursor-success, 0.7); // 使用变量系统的成功色
    }
  }
}

// 新建待办输入框样式
.new-todo-input {
  border-bottom: 1px solid $cursor-border; // 使用变量系统的边框色

  :deep(.q-field__control) {
    box-shadow: none;
    background: rgba($cursor-surface, 0.5); // 使用变量系统的表面色
  }

  :deep(.q-field__native) {
    color: $cursor-text; // 使用变量系统的文字颜色
  }
}

// 修复滚动问题的样式
.work-page {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.work-page-content {
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px; // 底部留出空间避免内容被遮挡
}

// 确保页面容器正确设置
:deep(.q-page-container) {
  height: calc(100vh - 50px); // 减去header高度
  overflow: hidden;
}

// 响应式调整
@media (max-width: 768px) {
  .work-page-content {
    padding: 12px;
  }
  
  .content-wrapper {
    padding-bottom: 40px;
  }
}

// 新建待办输入框标签样式
.new-todo-input {
  :deep(.q-field__label) {
    color: $cursor-muted; // 使用变量系统的次要文字颜色
  }
}

// 待办项样式
:deep(.q-item) {
  color: $cursor-text; // 使用变量系统的文字颜色

  .q-checkbox {
    color: $cursor-success; // 使用变量系统的成功色
  }

  .q-item__label {
    color: $cursor-text; // 使用变量系统的文字颜色
  }

  .q-item__label--caption {
    color: $cursor-muted; // 使用变量系统的次要文字颜色
  }
}

// 分割线样式
:deep(.q-separator) {
  background: $cursor-border; // 使用变量系统的边框色
  margin: 8px 0;
}

// 添加删除线样式，用于已完成待办
.text-strike {
  text-decoration: line-through;
  color: $cursor-muted; // 使用变量系统
}

// 将 .work-page-content 的样式应用到 .work-page 上
.work-page {
  background: $cursor-bg; // 使用颜色系统的主背景色
  // 添加 overflow-y: auto; 让 q-page 自身可以滚动
  overflow-y: auto;

  // 自定义滚动条样式 (可选)
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba($cursor-border, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($cursor-border, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba($cursor-border, 0.5);
    }
  }
}
</style>
