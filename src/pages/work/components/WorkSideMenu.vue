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
                v-for="child in item.children"
                :key="child.label"
                :to="child.url"
                clickable
                v-ripple
                class="submenu-item"
              >
                <q-item-section avatar>
                  <q-icon :name="child.icon" size="xs" />
                </q-item-section>
                <q-item-section>{{ child.label }}</q-item-section>
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
import { ref, reactive } from 'vue'

// 显示弹窗的标志
const showAddUrlDialog = ref(false)

// 新URL的数据
const newUrl = reactive({
  name: '',
  url: '',
  category: ''
})

// 添加新URL的方法
const addNewUrl = () => {
  // 这里添加保存URL的逻辑
  console.log('添加新URL:', newUrl)
  
  // 重置表单
  newUrl.name = ''
  newUrl.url = ''
  newUrl.category = ''
}

const menuItems = [
  {
    label: '工作台',
    icon: 'dashboard',
    url: '/work'
  },
  {
    label: 'API 平台',
    icon: 'api',
    children: [
      {
        label: '测试环境',
        icon: 'bug_report',
        url: 'https://test-api.example.com'
      },
      {
        label: '生产环境',
        icon: 'public',
        url: 'https://api.example.com'
      }
    ]
  },
  {
    label: '代码仓库',
    icon: 'source',
    children: [
      {
        label: '前端仓库',
        icon: 'code',
        url: 'https://github.com/frontend'
      },
      {
        label: '后端仓库',
        icon: 'storage',
        url: 'https://github.com/backend'
      }
    ]
  },
  {
    label: '文档中心',
    icon: 'description',
    children: [
      {
        label: '开发文档',
        icon: 'integration_instructions',
        url: '/docs/dev'
      },
      {
        label: '设计文档',
        icon: 'design_services',
        url: '/docs/design'
      }
    ]
  },
  {
    label: '监控中心',
    icon: 'monitor', // 修改这里，使用 'monitor' 替代 'monitoring'
    url: '/monitoring'
  },
  {
    label: 'URL管理',
    icon: 'link',
    children: [
      {
        label: '我的链接',
        icon: 'bookmark',
        url: '/url/my-links'
      },
      {
        label: '新增链接',
        icon: 'add_link',
        url: '/url/add-new'
      },
      {
        label: '分类管理',
        icon: 'category',
        url: '/url/categories'
      }
    ]
  }
]

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
</style>
