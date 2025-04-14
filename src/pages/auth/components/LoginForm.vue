<template>
  <q-form @submit="handleLogin" class="q-gutter-md">
    <q-input
      v-model="form.email"
      label="邮箱"
      type="email"
      :rules="[val => !!val || '请输入邮箱', isValidEmail]"
      outlined
      dense
    >
      <template v-slot:prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <q-input
      v-model="form.password"
      label="密码"
      :type="isPwdVisible ? 'text' : 'password'"
      :rules="[val => !!val || '请输入密码']"
      outlined
      dense
    >
      <template v-slot:prepend>
        <q-icon name="lock" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="isPwdVisible ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          @click="isPwdVisible = !isPwdVisible"
        />
      </template>
    </q-input>

    <div class="row justify-between items-center q-mt-sm">
      <q-checkbox v-model="rememberMe" label="记住我" dense />
      <q-btn
        flat
        no-caps
        color="primary"
        label="忘记密码?"
        @click="$emit('forget-password')"
        dense
      />
    </div>

    <div class="q-mt-md">
      <q-btn
        type="submit"
        color="primary"
        class="full-width"
        label="登录"
        :loading="isLoading"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { getAuth } from 'src/api/auth/auth';

const $q = useQuasar();
const authApi = getAuth();

// 密码可见性
const isPwdVisible = ref(false);

// 记住我
const rememberMe = ref(false);

// 加载状态
const isLoading = ref(false);

// 登录表单
const form = ref({
  email: '',
  password: ''
});

// 邮箱验证
const isValidEmail = (val: string) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(val) || '请输入有效的邮箱地址';
};

// 处理登录
const handleLogin = async () => {
  try {
    isLoading.value = true;
    const response = await authApi.login({
      email: form.value.email,
      password: form.value.password
    });

    if (response.data.success && response.data.payload) {
      const { token, user } = response.data.payload;

      // 保存token到localStorage或sessionStorage
      if (rememberMe.value) {
        localStorage.setItem('token', token || '');
      } else {
        sessionStorage.setItem('token', token || '');
      }

      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(user));

      $q.notify({
        message: '登录成功',
        color: 'positive',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    $q.notify({
      message: '登录失败，请检查邮箱和密码',
      color: 'negative',
      position: 'top'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
