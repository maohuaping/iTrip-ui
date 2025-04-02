<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">忘记密码</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="closeDialog" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleForgetPassword" class="q-gutter-md">
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
                style="height: 40px; font-size: 12px; padding: 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                @click="sendForgetPasswordCode"
              />
            </div>
          </div>

          <q-input
            v-model="form.newPassword"
            label="新密码"
            :type="isPwdVisible ? 'text' : 'password'"
            :rules="[
              val => !!val || '请输入新密码',
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
            label="确认新密码"
            :type="isPwdVisible ? 'text' : 'password'"
            :rules="[
              val => !!val || '请确认新密码',
              val => val === form.newPassword || '两次密码输入不一致'
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

          <div class="row justify-end q-mt-md">
            <q-btn label="取消" color="grey-7" flat @click="closeDialog" class="q-mr-sm" />
            <q-btn
              type="submit"
              label="重置密码"
              color="primary"
              :loading="isLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { getAuth } from 'src/api/auth/auth';
import { SendVerificationCodeRequestDTOType, UpdatePasswordRequestDTOType } from 'src/api/api.schemas';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'password-reset']);

const $q = useQuasar();
const authApi = getAuth();

// 对话框显示状态
const showDialog = ref(props.modelValue);

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal;
});

// 监听内部状态变化
watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal);
});

// 密码可见性
const isPwdVisible = ref(false);

// 加载状态
const isLoading = ref(false);

// 忘记密码表单
const form = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
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

// 发送忘记密码验证码
const sendForgetPasswordCode = async () => {
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
    await authApi.authPasswordCode({
      type: SendVerificationCodeRequestDTOType.FORGET,
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

// 处理忘记密码
const handleForgetPassword = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    $q.notify({
      message: '两次密码输入不一致',
      color: 'negative',
      position: 'top'
    });
    return;
  }

  try {
    isLoading.value = true;
    await authApi.authPassword({
      type: UpdatePasswordRequestDTOType.FORGET,
      email: form.value.email,
      verificationCode: form.value.verificationCode,
      newPassword: form.value.newPassword,
      forgetUpdate: true
    });
    
    $q.notify({
      message: '密码重置成功，请使用新密码登录',
      color: 'positive',
      position: 'top'
    });
    
    // 关闭对话框并清空表单
    closeDialog();
    
    // 通知父组件密码已重置
    emit('password-reset');
  } catch (error) {
    console.error('重置密码失败:', error);
    $q.notify({
      message: '重置密码失败，请检查邮箱和验证码',
      color: 'negative',
      position: 'top'
    });
  } finally {
    isLoading.value = false;
  }
};

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false;
  // 清空表单
  form.value = {
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  };
};
</script> 