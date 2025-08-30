<template>
  <div class="login-page-container">
    <div class="login-card-container">
      <q-card class="login-card">
        <!-- 头部Logo和标题 -->
        <q-card-section class="text-center q-pt-xl q-pb-lg">
          <div class="logo-container q-mb-md">
            <q-icon name="flight" size="48px" class="logo-icon" />
          </div>
          <div class="text-h4 text-weight-bold login-title">iTrip</div>
          <div class="text-subtitle2 login-subtitle q-mt-sm">
            智能旅行规划助手
          </div>
        </q-card-section>

        <!-- 邮箱验证码登录表单 -->
        <q-card-section class="q-px-xl q-pb-xl">
          <q-form @submit="handleEmailVerification" class="email-form">
            <!-- 邮箱输入 -->
            <div class="q-mb-lg">
              <q-input v-model="email" type="email" label="邮箱地址" outlined rounded
                :rules="[val => !!val || '请输入邮箱地址', val => isValidEmail(val) || '请输入有效的邮箱地址']" class="email-input"
                :disable="isCodeSent">
                <template v-slot:prepend>
                  <q-icon name="mail" class="input-icon" />
                </template>
              </q-input>
            </div>

            <!-- 验证码输入（邮箱填写后显示） -->
            <div v-if="isCodeSent" class="q-mb-lg">
              <q-input v-model="verificationCode" label="验证码" outlined rounded maxlength="6"
                :rules="[val => !!val || '请输入验证码', val => val.length === 6 || '验证码为6位数字']" class="code-input">
                <template v-slot:prepend>
                  <q-icon name="security" class="input-icon" />
                </template>
                <template v-slot:append>
                  <q-btn flat dense :label="countdown > 0 ? `${countdown}s` : '重新发送'" :disable="countdown > 0"
                    @click="sendVerificationCode" class="resend-btn" />
                </template>
              </q-input>
            </div>

            <!-- 提交按钮 -->
            <q-btn type="submit" :label="isCodeSent ? '验证登录' : '发送验证码'" rounded unelevated size="lg"
              class="full-width submit-btn q-mb-md" :loading="loading"
              :disable="!email || (isCodeSent && !verificationCode)" />

            <!-- 重新输入邮箱 -->
            <div v-if="isCodeSent" class="text-center">
              <q-btn flat dense label="重新输入邮箱" @click="resetForm" class="reset-email-btn" />
            </div>
          </q-form>
        </q-card-section>

        <!-- 底部提示 -->
        <q-card-section class="text-center q-pt-none q-pb-lg">
          <div class="login-hint">
            <q-icon name="info" size="16px" class="q-mr-xs" />
            新用户首次验证邮箱即完成注册
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// 表单数据
const email = ref('');
const verificationCode = ref('');
const isCodeSent = ref(false);
const loading = ref(false);
const countdown = ref(0);

let countdownTimer: NodeJS.Timeout | null = null;

// 邮箱验证
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!email.value || !isValidEmail(email.value)) {
    $q.notify({
      type: 'negative',
      message: '请输入有效的邮箱地址',
      position: 'top'
    });
    return;
  }

  loading.value = true;

  try {
    // TODO: 调用发送验证码API
    // await api.sendVerificationCode(email.value);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    isCodeSent.value = true;
    startCountdown();

    $q.notify({
      type: 'positive',
      message: '验证码已发送到您的邮箱',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '发送验证码失败，请重试',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!);
      countdownTimer = null;
    }
  }, 1000);
};

// 处理邮箱验证
const handleEmailVerification = async () => {
  if (!isCodeSent.value) {
    await sendVerificationCode();
    return;
  }

  if (!verificationCode.value || verificationCode.value.length !== 6) {
    $q.notify({
      type: 'negative',
      message: '请输入6位验证码',
      position: 'top'
    });
    return;
  }

  loading.value = true;

  try {
    // TODO: 调用验证码验证API
    // const result = await api.verifyEmailCode(email.value, verificationCode.value);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    $q.notify({
      type: 'positive',
      message: '登录成功',
      position: 'top'
    });

    // TODO: 处理登录成功逻辑，如跳转到主页
    // router.push('/dashboard');

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '验证码错误或已过期',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  email.value = '';
  verificationCode.value = '';
  isCodeSent.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdown.value = 0;
};

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.login-page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $gradient-primary;
  padding: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(ellipse 800px 600px at 50% 0%, rgba(148, 190, 206, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 600px 400px at 80% 100%, rgba(123, 168, 184, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.login-card-container {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: $elevation-3;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

// Logo和标题样式
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .logo-icon {
    color: $cursor-primary;
    background: rgba(148, 190, 206, 0.1);
    border-radius: 50%;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(148, 190, 206, 0.3);
  }
}

.login-title {
  color: $cursor-primary;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.login-subtitle {
  color: $cursor-text;
  opacity: 0.8;
}

// 表单样式
.email-form {

  .email-input,
  .code-input {
    :deep(.q-field__control) {
      height: 56px;
      border-radius: 16px;
      background: rgba(148, 190, 206, 0.05);
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(148, 190, 206, 0.08);
        border-color: rgba(148, 190, 206, 0.2);
      }
    }

    :deep(.q-field--focused .q-field__control) {
      background: rgba(148, 190, 206, 0.1);
      border-color: $cursor-primary;
      box-shadow: 0 0 0 3px rgba(148, 190, 206, 0.15);
    }

    :deep(.q-field__label) {
      color: $cursor-text;
      font-weight: 500;
    }

    :deep(.q-field--focused .q-field__label) {
      color: $cursor-primary;
    }
  }

  .input-icon {
    color: $cursor-primary;
  }

  .resend-btn {
    color: $cursor-primary;
    font-weight: 500;
    border-radius: 8px;

    &:hover {
      background: rgba(148, 190, 206, 0.1);
    }

    &:disabled {
      color: $cursor-muted;
    }
  }

  .submit-btn {
    height: 56px;
    background: $gradient-primary;
    color: white;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.5px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(148, 190, 206, 0.4);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(148, 190, 206, 0.5);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      background: $cursor-muted;
      color: rgba(255, 255, 255, 0.6);
      transform: none;
      box-shadow: none;
    }
  }

  .reset-email-btn {
    color: $cursor-text;
    font-size: 14px;

    &:hover {
      color: $cursor-primary;
      background: rgba(148, 190, 206, 0.1);
    }
  }
}

// 底部提示
.login-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $cursor-text;
  font-size: 14px;
  background: rgba(148, 190, 206, 0.08);
  padding: 12px 20px;
  border-radius: 12px;
  margin: 0 20px;

  .q-icon {
    color: $cursor-accent;
  }
}

// 响应式设计
@media (max-width: 599px) {
  .login-page-container {
    padding: 16px;
  }

  .login-card-container {
    max-width: 100%;
  }

  .login-card {
    border-radius: 20px;
  }

  .login-title {
    font-size: 28px;
  }

  .email-form {

    .email-input,
    .code-input {
      :deep(.q-field__control) {
        height: 52px;
        border-radius: 14px;
      }
    }

    .submit-btn {
      height: 52px;
      border-radius: 14px;
      font-size: 15px;
    }
  }

  .login-hint {
    font-size: 13px;
    padding: 10px 16px;
    margin: 0 16px;
  }
}

@media (max-width: 480px) {
  .login-card {
    margin: 0 8px;
    border-radius: 16px;
  }

  .logo-container .logo-icon {
    padding: 10px;
  }

  .login-title {
    font-size: 24px;
  }
}

// 动画效果
.email-input,
.code-input {
  animation: slideInUp 0.6s ease-out;
}

.submit-btn {
  animation: slideInUp 0.8s ease-out;
}

.login-hint {
  animation: slideInUp 1s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 验证码输入的特殊动画
.code-input {
  animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>