<template>
  <div class="work-side-menu">
    <q-scroll-area style="height: calc(100vh - 50px);" class="fit">
      <q-list padding>
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
  </div>
</template>

<script setup lang="ts">
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
