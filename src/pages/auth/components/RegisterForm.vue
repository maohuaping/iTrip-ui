<template>
  <q-form @submit="handleRegister" class="q-gutter-md">
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

    <div class="row q-col-gutter-sm">
      <div class="col-8" style="padding-left: 0">
        <q-input
          v-model="form.verificationCode"
          label="验证码"
          :rules="[
            val => !!val || '请输入验证码',
            val => val.length === 6 || '验证码长度应为6位'
          ]"
          outlined
          dense
        >
          <template v-slot:prepend>
            <q-icon name="security" />
          </template>
        </q-input>
      </div>
      <div class="col-4">
        <q-btn
          :disable="codeSending || codeCountdown > 0"
          :loading="codeSending"
          :label="codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'"
          color="primary"
          class="full-width"
          style="height: 40px"
          @click="sendVerificationCode"
        />
      </div>
    </div>

    <q-input
      v-model="form.password"
      label="密码"
      :type="isPwdVisible ? 'text' : 'password'"
      :rules="[
        val => !!val || '请输入密码',
        val => val.length >= 6 || '密码长度至少6位',
        val => val.length <= 20 || '密码长度不超过20位'
      ]"
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

    <q-input
      v-model="form.confirmPassword"
      label="确认密码"
      :type="isPwdVisible ? 'text' : 'password'"
      :rules="[
        val => !!val || '请确认密码',
        val => val === form.password || '两次密码输入不一致'
      ]"
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

    <div class="q-mt-md">
      <q-btn
        type="submit"
        color="primary"
        class="full-width"
        label="注册"
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

// 加载状态
const isLoading = ref(false);

// 注册表单
const form = ref({
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
});

// 验证码发送状态
const codeSending = ref(false);
const codeCountdown = ref(0);

// 邮箱验证
const isValidEmail = (val: string) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(val) || '请输入有效的邮箱地址';
};

// 发送注册验证码
const sendVerificationCode = async () => {
  if (!form.value.email) {
    $q.notify({
      message: '请先输入邮箱',
      color: 'negative',
      position: 'top'
    });
    return;
  }

  try {
    codeSending.value = true;
    await authApi.authCode({
      type: "register",
      email: form.value.email
    });

    $q.notify({
      message: '验证码已发送，请查收邮件',
      color: 'positive',
      position: 'top'
    });

    // 开始倒计时
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    console.error('发送验证码失败:', error);
    $q.notify({
      message: '发送验证码失败，请稍后重试',
      color: 'negative',
      position: 'top'
    });
  } finally {
    codeSending.value = false;
  }
};

// 处理注册
const handleRegister = async () => {
  // 这里应该调用注册API，但是根据提供的API，似乎没有直接的注册接口
  // 通常注册后会自动登录，或者跳转到登录页面
  $q.notify({
    message: '注册功能尚未实现，请联系管理员',
    color: 'warning',
    position: 'top'
  });

  // 通知父组件切换到登录页面
  emit('switch-to-login');
};

const emit = defineEmits(['switch-to-login']);
</script>
