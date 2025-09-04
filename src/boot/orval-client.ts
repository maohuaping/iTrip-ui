import { defineBoot } from '#q-app/wrappers';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Notify, Loading } from 'quasar';
import { api } from './axios'; // 导入现有的 api 实例
import { useAuthStore } from 'src/stores/auth';

// 为 Orval 创建自定义实例函数
export const customInstance = <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  // 显示加载指示器
  Loading.show({
    spinnerColor: 'primary',
    message: '加载中...'
  });

  // 从认证store中获取token
  const authStore = useAuthStore();
  const token = authStore.token;

  // 创建请求配置
  const requestConfig = {
    ...config,
    headers: {
      ...config.headers,
      // 如果有token，则添加到Authorization头
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };

  return api(requestConfig)
    .then((response) => {
      Loading.hide();
      return response;
    })
    .catch((error) => {
      Loading.hide();

      // 使用 Quasar Notify 显示错误
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // 清除认证信息并跳转到登录页
            authStore.logout();
            // 这里需要在浏览器环境中才能访问router
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            Notify.create({
              type: 'negative',
              message: '登录已过期，请重新登录',
              position: 'top',
            });
            break;
          case 403:
            Notify.create({
              type: 'negative',
              message: '没有权限执行此操作',
              position: 'top',
            });
            break;
          case 500:
            Notify.create({
              type: 'negative',
              message: '服务器错误，请稍后再试',
              position: 'top',
            });
            break;
          default:
            Notify.create({
              type: 'negative',
              message: error.response.data?.okData || '请求失败',
              position: 'top',
            });
        }
      } else if (error.request) {
        Notify.create({
          type: 'negative',
          message: '网络错误，请检查您的连接',
          position: 'top',
        });
      } else {
        Notify.create({
          type: 'negative',
          message: `请求配置错误: ${error.message}`,
          position: 'top',
        });
      }

      return Promise.reject(new Error(error.message || '请求失败'));
    });
};

export default defineBoot(() => {
  // 这个 boot 文件不需要做任何事情，因为我们只是导出 customInstance
});