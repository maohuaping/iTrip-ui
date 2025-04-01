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
          <q-form @submit="handleLogin" class="q-gutter-md">
            <q-input
              v-model="loginForm.email"
              label="邮箱"
              type="email"
              :rules="[val => !!val || '请输入邮箱', isValidEmail]"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-email-outline" />
              </template>
            </q-input>

            <q-input
              v-model="loginForm.password"
              label="密码"
              :type="isPwdVisible ? 'text' : 'password'"
              :rules="[val => !!val || '请输入密码']"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-lock-outline" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwdVisible ? 'eva-eye-outline' : 'eva-eye-off-outline'"
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
                @click="showForgetPasswordDialog = true"
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
        </q-card-section>

        <!-- 注册表单 -->
        <q-card-section v-else>
          <q-form @submit="handleRegister" class="q-gutter-md">
            <q-input
              v-model="registerForm.email"
              label="邮箱"
              type="email"
              :rules="[val => !!val || '请输入邮箱', isValidEmail]"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-email-outline" />
              </template>
            </q-input>

            <div class="row q-col-gutter-sm">
              <div class="col-8">
                <q-input
                  v-model="registerForm.verificationCode"
                  label="验证码"
                  :rules="[
                    val => !!val || '请输入验证码',
                    val => val.length === 6 || '验证码长度应为6位'
                  ]"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="eva-shield-outline" />
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
              v-model="registerForm.password"
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
                <q-icon name="eva-lock-outline" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwdVisible ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                  class="cursor-pointer"
                  @click="isPwdVisible = !isPwdVisible"
                />
              </template>
            </q-input>

            <q-input
              v-model="registerForm.confirmPassword"
              label="确认密码"
              :type="isPwdVisible ? 'text' : 'password'"
              :rules="[
                val => !!val || '请确认密码',
                val => val === registerForm.password || '两次密码输入不一致'
              ]"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-lock-outline" />
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
    <q-dialog v-model="showForgetPasswordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">忘记密码</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleForgetPassword" class="q-gutter-md">
            <q-input
              v-model="forgetPasswordForm.email"
              label="邮箱"
              type="email"
              :rules="[val => !!val || '请输入邮箱', isValidEmail]"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-email-outline" />
              </template>
            </q-input>

            <div class="row q-col-gutter-sm">
              <div class="col-8">
                <q-input
                  v-model="forgetPasswordForm.verificationCode"
                  label="验证码"
                  :rules="[
                    val => !!val || '请输入验证码',
                    val => val.length === 6 || '验证码长度应为6位'
                  ]"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="eva-shield-outline" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-btn
                  :disable="forgetCodeSending || forgetCodeCountdown > 0"
                  :loading="forgetCodeSending"
                  :label="forgetCodeCountdown > 0 ? `${forgetCodeCountdown}s` : '获取验证码'"
                  color="primary"
                  class="full-width"
                  style="height: 40px"
                  @click="sendForgetPasswordCode"
                />
              </div>
            </div>

            <q-input
              v-model="forgetPasswordForm.newPassword"
              label="新密码"
              :type="isForgetPwdVisible ? 'text' : 'password'"
              :rules="[
                val => !!val || '请输入新密码',
                val => val.length >= 6 || '密码长度至少6位',
                val => val.length <= 20 || '密码长度不超过20位'
              ]"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-lock-outline" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isForgetPwdVisible ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                  class="cursor-pointer"
                  @click="isForgetPwdVisible = !isForgetPwdVisible"
                />
              </template>
            </q-input>

            <q-input
              v-model="forgetPasswordForm.confirmPassword"
              label="确认新密码"
              :type="isForgetPwdVisible ? 'text' : 'password'"
              :rules="[
                val => !!val || '请确认新密码',
                val => val === forgetPasswordForm.newPassword || '两次密码输入不一致'
              ]"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="eva-lock-outline" />
              </template>
            </q-input>

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" color="grey-7" flat v-close-popup class="q-mr-sm" />
              <q-btn
                type="submit"
                label="重置密码"
                color="primary"
                :loading="isForgetLoading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { getAuth } from 'src/api/auth/auth';
import { SendVerificationCodeRequestDTOType, UpdatePasswordRequestDTOType, UserLoginRequestDTOType } from 'src/api/api.schemas';

const $q = useQuasar();
const router = useRouter();
const authApi = getAuth();

// 登录/注册切换
const isLogin = ref(true);

// 密码可见性
const isPwdVisible = ref(false);
const isForgetPwdVisible = ref(false);

// 记住我
const rememberMe = ref(false);

// 加载状态
const isLoading = ref(false);
const isForgetLoading = ref(false);

// 登录表单
const loginForm = ref({
  email: '',
  password: ''
});

// 注册表单
const registerForm = ref({
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
});

// 忘记密码表单
const forgetPasswordForm = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
});

// 忘记密码对话框
const showForgetPasswordDialog = ref(false);

// 验证码发送状态
const codeSending = ref(false);
const codeCountdown = ref(0);
const forgetCodeSending = ref(false);
const forgetCodeCountdown = ref(0);

// 邮箱验证
const isValidEmail = (val: string) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(val) || '请输入有效的邮箱地址';
};

// 发送注册验证码
const sendVerificationCode = async () => {
  if (!registerForm.value.email) {
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
      type: SendVerificationCodeRequestDTOType.REGISTER,
      email: registerForm.value.email
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

// 发送忘记密码验证码
const sendForgetPasswordCode = async () => {
  if (!forgetPasswordForm.value.email) {
    $q.notify({
      message: '请先输入邮箱',
      color: 'negative',
      position: 'top'
    });
    return;
  }

  try {
    forgetCodeSending.value = true;
    await authApi.authPasswordCode({
      type: SendVerificationCodeRequestDTOType.FORGET,
      email: forgetPasswordForm.value.email
    });
    
    $q.notify({
      message: '验证码已发送，请查收邮件',
      color: 'positive',
      position: 'top'
    });
    
    // 开始倒计时
    forgetCodeCountdown.value = 60;
    const timer = setInterval(() => {
      forgetCodeCountdown.value--;
      if (forgetCodeCountdown.value <= 0) {
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
    forgetCodeSending.value = false;
  }
};

// 处理登录
const handleLogin = async () => {
  try {
    isLoading.value = true;
    const response = await authApi.authLogin({
      type: UserLoginRequestDTOType.PASSWORD,
      email: loginForm.value.email,
      password: loginForm.value.password
    });

    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      
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
      
      // 检查是否需要重置密码
      if (user?.needResetPassword) {
        router.push('/reset-password');
      } else {
        router.push('/');
      }
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

// 处理注册
const handleRegister = async () => {
  // 这里应该调用注册API，但是根据提供的API，似乎没有直接的注册接口
  // 通常注册后会自动登录，或者跳转到登录页面
  $q.notify({
    message: '注册功能尚未实现，请联系管理员',
    color: 'warning',
    position: 'top'
  });
  
  // 切换到登录页面
  isLogin.value = true;
};

// 处理忘记密码
const handleForgetPassword = async () => {
  if (forgetPasswordForm.value.newPassword !== forgetPasswordForm.value.confirmPassword) {
    $q.notify({
      message: '两次密码输入不一致',
      color: 'negative',
      position: 'top'
    });
    return;
  }

  try {
    isForgetLoading.value = true;
    await authApi.authPassword({
      type: UpdatePasswordRequestDTOType.FORGET,
      email: forgetPasswordForm.value.email,
      verificationCode: forgetPasswordForm.value.verificationCode,
      newPassword: forgetPasswordForm.value.newPassword,
      forgetUpdate: true
    });
    
    $q.notify({
      message: '密码重置成功，请使用新密码登录',
      color: 'positive',
      position: 'top'
    });
    
    // 关闭对话框并清空表单
    showForgetPasswordDialog.value = false;
    forgetPasswordForm.value = {
      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // 切换到登录页面
    isLogin.value = true;
  } catch (error) {
    console.error('重置密码失败:', error);
    $q.notify({
      message: '重置密码失败，请检查邮箱和验证码',
      color: 'negative',
      position: 'top'
    });
  } finally {
    isForgetLoading.value = false;
  }
};
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