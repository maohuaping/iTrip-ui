import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // 路由守卫
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // 初始化认证状态（从localStorage恢复）
    authStore.initAuth();
    
    // 检查路由是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    
    // 如果不需要认证，直接通过
    if (!requiresAuth) {
      next();
      return;
    }
    
    // 需要认证的路由，检查用户是否已登录
    if (authStore.isAuthenticated && authStore.checkTokenValidity()) {
      // 用户已登录且token有效，允许访问
      next();
    } else {
      // 用户未登录或token无效，清除认证信息并重定向到登录页
      authStore.logout();
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原始目标路径，登录后可以重定向回去
      });
    }
  });

  return Router;
});
