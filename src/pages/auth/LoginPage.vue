<template>
  <div class="login-page-container">
    <div class="login-card-container">
      <q-card class="login-card">
        <q-card-section class="text-center q-pt-lg">
          <div class="text-h5 text-weight-bold">{{ isLogin ? '登录' : '注册' }}</div>
          <div class="text-caption text-grey-7 q-mt-sm">
            {{ isLogin ? '欢迎回来，请登录您的账号' : '创建一个新账号' }}
          </div>
        </q-card-section>

        <!-- 登录表单 -->
        <q-card-section v-if="isLogin">
          <login-form @forget-password="showForgetPasswordDialog = true" />
        </q-card-section>

        <!-- 注册表单 -->
        <q-card-section v-else>
          <register-form @switch-to-login="isLogin = true" />
        </q-card-section>

        <q-card-section class="text-center q-pt-none">
          <q-separator class="q-my-md" />
          <div>
            {{ isLogin ? '还没有账号?' : '已有账号?' }}
            <q-btn
              flat
              no-caps
              color="primary"
              :label="isLogin ? '立即注册' : '立即登录'"
              @click="isLogin = !isLogin"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 忘记密码对话框 -->
    <forget-password-dialog 
      v-model="showForgetPasswordDialog"
      @password-reset="isLogin = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import ForgetPasswordDialog from './components/ForgetPasswordDialog.vue';

// 登录/注册切换
const isLogin = ref(true);

// 忘记密码对话框
const showForgetPasswordDialog = ref(false);
</script>

<style lang="scss" scoped>
.login-page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 599px) {
  .login-card-container {
    max-width: 100%;
  }
}
</style> 