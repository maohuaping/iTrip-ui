import { boot } from 'quasar/wrappers';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Notify, Loading } from 'quasar';
import { api } from './axios'; // 导入现有的 api 实例

// 为 Orval 创建自定义实例函数
export const customInstance = <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  // 显示加载指示器
  Loading.show({
    spinnerColor: 'primary',
    message: '加载中...'
  });

  // 从localStorage或其他存储中获取token
  // const token = localStorage.getItem('auth_token');
  // 在登录注册没有做好之前，先尝试使用临时token
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjE0LCJ1c2VybmFtZSI6IuWcn-aLqOm8oDIxMTUiLCJyb2xlIjoiUk9MRV9BRE1JTiIsImV4cCI6MTc0NDQzNTU3NTc5M30.HT-pkCNCQQDmM4spPqWhrlFXBlHT9z_5danQ7gX4XJc';
  
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
            Notify.create({
              type: 'negative',
              message: '请重新登录',
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
              message: error.response.data?.message || '请求失败',
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
      
      return Promise.reject(error);
    });
};

export default boot(({ app }) => {
  // 这个 boot 文件不需要做任何事情，因为我们只是导出 customInstance
}); 