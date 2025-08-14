<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div style="max-width: 450px; width: 100%;">
      
      <div style="opacity: 0.6;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12em" height="12em" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
      </div>

      <div class="text-h4" style="opacity:.8; margin-top: 20px; font-weight: bold;">
        哎呀！页面不见了
      </div>

      <div class="q-mt-md" style="opacity:.6;">
        您要访问的页面好像不存在，或者已经被移动到其他地方了。
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="返回首页"
        no-caps
        size="lg"
        style="border-radius: 8px;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 这个页面不需要任何逻辑
</script>

<style scoped>
/* 你可以在这里添加额外的样式，不过 Quasar 的类已经足够好用了 */
</style>
