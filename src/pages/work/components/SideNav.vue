<template>
  <div class="work-side-menu">
    <q-scroll-area style="height: calc(100vh - 50px);" class="fit">
      <q-list padding>
        <!-- 添加新URL的按钮 -->
        <q-item clickable v-ripple class="add-url-btn" @click="showAddUrlDialog = true">
          <q-item-section avatar>
            <q-icon name="add_circle" color="primary" />
          </q-item-section>
          <q-item-section>
            <span class="text-primary">新增URL</span>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <template v-for="item in menuItems" :key="item.label">
          <!-- 有子菜单的项目 -->
          <q-expansion-item
            v-if="item.children"
            :icon="item.icon"
            :label="item.label"
            expand-separator
            class="menu-item"
            header-class="menu-item-header"
          >
            <q-list class="submenu-list">
              <q-item
                v-for="link in item.children"
                :key="link.id"
                :href="link.url"
                target="_blank"
                clickable
                v-ripple
                class="url-item"
              >
                <q-item-section avatar>
                  <q-icon name="link" size="xs" />
                </q-item-section>
                <q-item-section>{{ link.label }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    size="xs"
                    color="grey-7"
                    @click="(e) => deleteUrlItem(link.id, e)"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="item.children.length === 0" class="no-urls-item">
                <q-item-section>
                  <span class="text-grey">暂无保存的链接</span>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- 没有子菜单的项目 -->
          <q-item
            v-else
            :to="item.url"
            clickable
            v-ripple
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-scroll-area>

    <!-- 添加URL的弹窗 -->
    <q-dialog v-model="showAddUrlDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">新增URL</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newUrl.name"
            label="链接名称"
            dense
            autofocus
            class="q-mb-md"
          />
          <q-input
            v-model="newUrl.url"
            label="URL地址"
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="newUrl.category"
            label="所属分类"
            dense
            class="q-mb-md"
            hint="请输入分类标签"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="negative" v-close-popup />
          <q-btn flat label="保存" color="primary" @click="addNewUrl" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUrl } from 'src/api/url/url'

// 显示弹窗的标志
const showAddUrlDialog = ref(false)

// 新URL的数据
const newUrl = reactive({
  name: '',
  url: '',
  category: ''
})

// 从API获取的URL列表
const userUrls = ref<any[]>([])

// 动态生成的菜单项
const menuItems = ref<any[]>([
  {
    label: '工作台',
    icon: 'dashboard',
    url: '/work'
  }
])

// 获取用户URL列表
const fetchUserUrls = async () => {
  try {
    const { listUrlOfMe } = getUrl()
    const response = await listUrlOfMe()
    if (response.data && response.data.success && response.data.payload) {
      userUrls.value = response.data.payload
      // 生成菜单项
      generateMenuFromUrls()
    }
  } catch (error) {
    console.error('获取URL列表失败:', error)
  }
}

// 根据API返回数据生成菜单结构
const generateMenuFromUrls = () => {
  // 按tag分组URLs
  const urlsByTag: Record<string, any[]> = {}
  
  userUrls.value.forEach(url => {
    if (!urlsByTag[url.tag]) {
      urlsByTag[url.tag] = []
    }
    urlsByTag[url.tag].push(url)
  })
  
  // 重置菜单（保留工作台）
  menuItems.value = [menuItems.value[0]]
  
  // 为每个tag创建菜单项
  for (const tag in urlsByTag) {
    menuItems.value.push({
      label: tag,
      icon: getIconForTag(tag),
      children: urlsByTag[tag].map(url => ({
        label: url.name,
        icon: 'link',
        url: url.address,
        id: url.id
      }))
    })
  }
}

// 根据tag选择合适的图标
const getIconForTag = (tag: string) => {
  const iconMap: Record<string, string> = {
    '开发环境': 'code',
    '流水线': 'move_up',
    'API平台': 'api',
    '协作工具': 'handshake',
    '项目文档': 'description',
    '控制台': 'terminal',
    '邮箱': 'email',
    'AI': 'smart_toy',
    '其他': 'more_horiz'
  }
  
  return iconMap[tag] || 'label'
}

// 添加新URL的方法
const addNewUrl = async () => {
  if (!newUrl.name || !newUrl.url) {
    return
  }
  
  try {
    const { saveUrl } = getUrl()
    const urlEntity = {
      name: newUrl.name,
      url: newUrl.url,
      tag: newUrl.category || '其他' // 使用tag替代category
    }
    
    const response = await saveUrl(urlEntity)
    
    if (response.data && response.data.success) {
      // 重新获取URL列表以更新菜单
      await fetchUserUrls()
    }
  } catch (error) {
    console.error('保存URL失败:', error)
  }
  
  // 重置表单
  newUrl.name = ''
  newUrl.url = ''
  newUrl.category = ''
}

// 删除URL的方法
const deleteUrlItem = async (id, event) => {
  // 阻止事件冒泡，防止点击删除按钮时打开链接
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  try {
    const { deleteUrl } = getUrl()
    const response = await deleteUrl(id)
    
    if (response.data && response.data.success) {
      // 重新获取URL列表以更新菜单
      await fetchUserUrls()
    }
  } catch (error) {
    console.error('删除URL失败:', error)
  }
}

// 页面加载时获取URL列表
onMounted(() => {
  fetchUserUrls()
})

defineOptions({
  name: 'WorkSideMenu'
})
</script>

<style lang="scss" scoped>
.work-side-menu {
  width: 260px;
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
}

.add-url-btn {
  border-radius: 8px;
  margin: 4px 8px 12px;
  background: rgba(25, 118, 210, 0.05);
  transition: all 0.2s;

  &:hover {
    background: rgba(25, 118, 210, 0.1);
    transform: translateY(-1px);
  }
}

.menu-item {
  border-radius: 8px;
  margin: 4px 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.menu-item-header {
  min-height: 48px;
  padding: 8px 16px;
  color: #2c3e50;
  font-weight: 500;
}

.submenu-list {
  padding-left: 8px;
  background: rgba(0, 0, 0, 0.01);
}

.submenu-item {
  border-radius: 6px;
  margin: 2px 8px;
  min-height: 40px;
  color: #4a5568;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .q-icon {
    opacity: 0.8;
  }
}

:deep(.q-expansion-item__content) {
  background: transparent;
}

:deep(.q-item.q-router-link--active) {
  color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
  font-weight: 500;

  .q-icon {
    color: #1976d2;
  }
}

.submenu-item-header {
  min-height: 40px;
  padding: 4px 16px;
  color: #4a5568;
  font-weight: 500;
}

.url-item {
  border-radius: 4px;
  margin: 2px 8px 2px 16px;
  min-height: 36px;
  color: #718096;
  
  .q-btn {
    opacity: 0.3;
    transition: all 0.2s;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
    
    .q-btn {
      opacity: 1;
    }
  }
}

.no-urls-item {
  display: flex;
  justify-content: center;
  font-style: italic;
  opacity: 0.6;
}
</style>
