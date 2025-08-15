import { register } from 'register-service-worker';

// ready()、registered()、cached()、updatefound() 和 updated() 事件
// 在它们的参数中传递 ServiceWorkerRegistration 实例。
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // registrationOptions 对象将作为第二个参数传递
  // 给 ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  // 服务工作者准备就绪时的回调
  ready (/* registration */) {
    // console.log('服务工作者已激活。')
  },

  // 服务工作者注册成功时的回调
  registered (/* registration */) {
    // console.log('服务工作者已注册。')
  },

  // 内容已缓存供离线使用时回调
  cached (/* registration */) {
    // console.log('内容已缓存供离线使用。')
  },

  // 发现新内容正在下载时的回调
  updatefound (/* registration */) {
    // console.log('正在下载新内容。')
  },

  // 新内容可用时的回调
  updated (/* registration */) {
    // console.log('新内容可用；请刷新。')
  },

  // 离线状态时的回调
  offline () {
    // console.log('未找到网络连接。应用正在离线模式下运行。')
  },

  // 注册过程中发生错误时的回调
  error (/* err */) {
    // console.error('服务工作者注册过程中发生错误:', err)
  },
});
