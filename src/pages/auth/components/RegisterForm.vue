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
import { ref, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { getAuth } from 'src/api/auth/auth';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
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
let timer: ReturnType<typeof setInterval> | null = null;

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
    await authApi.sendVerifyCode({
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
    timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
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
  // 表单验证
  if (!form.value.email || !form.value.password || !form.value.confirmPassword) {
    $q.notify({
      message: '请填写完整注册信息',
      type: 'negative'
    });
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    $q.notify({
      message: '两次输入的密码不一致',
      type: 'negative'
    });
    return;
  }

  try {
    const response = await authApi.register({
      email: form.value.email,
      password: form.value.password,
      code: form.value.verificationCode
    });

    if (response.data?.isOk) {
      $q.notify({
        message: '注册成功',
        type: 'positive'
      });

      // 注册成功后导航到登录页面
      void router.push('/login');
    } else {
      $q.notify({
        message: '注册失败',
        type: 'negative'
      });
    }
  } catch (error) {
    console.error('注册出错:', error);
    $q.notify({
      message: '注册失败，请稍后重试',
      type: 'negative'
    });
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
