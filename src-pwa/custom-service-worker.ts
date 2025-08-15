/*
 * 此文件（将成为您的服务工作者）
 * 仅当 quasar.config 文件 > pwa > workboxMode 设置为 "InjectManifest" 时
 * 才会被构建系统拾取
 */

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

// 跳过等待，立即激活新的服务工作者
void self.skipWaiting();
// 声明对页面的控制权
clientsClaim();

// 使用预缓存注入
precacheAndRoute(self.__WB_MANIFEST);

// 清理过期的缓存
cleanupOutdatedCaches();

// 非 SSR 回退到 index.html
// 生产环境 SSR 回退到 offline.html（开发环境除外）
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      // 创建绑定到指定 URL 的处理程序
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { 
        // 拒绝列表：排除服务工作者正则匹配的文件和 workbox 相关 JS 文件
        denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] 
      }
    )
  );
}