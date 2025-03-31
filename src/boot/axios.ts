import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// 在使用SSR时要小心跨请求状态污染
// 因为这里创建了一个单例实例；
// 如果任何客户端更改了这个（全局）实例，
// 最好将这个实例创建移到下面的
// "export default () => {}" 函数内部（该函数为每个客户端单独运行）
const api = axios.create({ baseURL: 'https://api.example.com' });

export default defineBoot(({ app }) => {
  // 用于在Vue文件内部（选项式API）通过this.$axios和this.$api使用

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ 这将允许你使用this.$axios（用于Vue选项式API）
  //       所以你不必在每个vue文件中都导入axios

  app.config.globalProperties.$api = api;
  // ^ ^ ^ 这将允许你使用this.$api（用于Vue选项式API）
  //       所以你可以轻松地对你的应用API执行请求
});

export { api };
