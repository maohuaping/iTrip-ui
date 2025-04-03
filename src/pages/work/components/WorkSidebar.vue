<template>
  <div class="work-sidebar q-py-md">
    <!-- Logo/品牌图标 -->
    <div class="q-mb-lg flex justify-center">
      <q-avatar size="40px" class="bg-dark">
        <q-icon name="code" color="blue-5" />
      </q-avatar>
    </div>

    <!-- 分隔线 -->
    <q-separator class="q-my-md" />

    <!-- 导航图标 -->
    <div class="column items-center q-gutter-y-md">
      <q-btn round flat icon="chat" size="md" />
      <q-btn round flat icon="description" size="md" />
      <q-btn round flat icon="grid_view" size="md" />
    </div>

    <!-- 分隔线 -->
    <q-separator class="q-my-md" />

    <!-- 底部图标 -->
    <div class="column items-center q-gutter-y-md">
      <q-btn round flat color="primary" label="登录" />
      <q-btn round flat icon="remove" size="md" />
      <q-btn round flat icon="monitor" size="md" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style lang="scss" scoped>
.work-sidebar {
  position: fixed;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding: 16px 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

// 美化按钮样式
:deep(.q-btn) {
  opacity: 0.7;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
