// 应用配置文件
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // 应用启动文件 (/src/boot)
    // --> 启动文件是 "main.js" 的一部分
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'axios',
      'orval-client'
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // 这个或者 'roboto-font'，永远不要同时使用！
      'material-icons', // 可选的，你不必绑定它

      // 'roboto-font', // 注释掉，使用系统字体替代
    ],

    // 完整选项列表: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: [ 'es2022', 'firefox115', 'chrome115', 'safari14' ],
        node: 'node20'
      },

      typescript: {
        strict: true,
        vueShim: true
        // extendTsConfig (tsConfig) {}
      },

      vueRouterMode: 'history', // 可用值: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // 启动时重建 Vite/检查器等缓存

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

    vitePlugins: [
        // https://vite-plugin-checker.netlify.app/introduction/introduction.html
      //   ['vite-plugin-checker', {
      //     vueTsc: true,
      //     eslint: {
      //       lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
      //       useFlatConfig: true
      //     },
      //     overlay: {
      //       initialIsOpen: false
      //     },  // 即使有错误或警告，也不自动打开诊断面板（用户需要手动点击徽章才能查看）
      //   }, { server: false }]
      ]
    },

    // 完整选项列表: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // https: true,
      // open: true // 自动打开浏览器窗口
      proxy: {
        // 将 /api 开头的请求代理到后端服务器
        '/api': {
          target: 'http://localhost:8080', // 后端服务地址
          changeOrigin: true, // 修改请求头中的 Origin 和 Host 值，使其与目标服务器匹配
          // pathRewrite: { '^/api': '' } // 在转发请求之前重写 URL 路径，移除 /api 前缀
        }
      }
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {
        dark: true
      },

      // iconSet: 'material-icons', // Quasar 图标集
      // lang: 'en-US', // Quasar 语言包

      // 对于自动导入策略无法影响的特殊情况
      // (比如函数式组件作为示例之一)，
      // 你可以手动指定 Quasar 组件/指令在任何地方都可用:
      //
      // components: [],
      // directives: [],

      // Quasar 插件
      plugins: [
        'Notify',  // 添加 Notify 插件
        'Dialog',  // 添加 Dialog 插件
        'Loading'  // 添加 Loading 插件
      ],

      // --- 在这里手动添加 sassVariables 配置 ---
      sassVariables: 'src/css/quasar.variables.scss'
    },

    // animations: 'all', // --- 包含所有动画
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // 生产服务器应该使用的默认端口
                      // (如果在运行时指定了 process.env.PORT，则会被覆盖)

      middlewares: [
        'render' // 保持这个作为最后一个
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false
      // pwaOfflineHtmlFilename: 'offline.html', // 不要使用 index.html 作为名称！

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW' // 'GenerateSW' 或 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPwaMetaTags: false,
      // extendPWACustomSWConf (esbuildConf) {},
      // extendGenerateSWOptions (cfg) {},
      // extendInjectManifestOptions (cfg) {}
    },

    // 完整选项列表: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // 只有在你知道你在做什么时才取消注释
    },

    // 完整选项列表: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // 完整选项列表: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf) {},
      // extendElectronPreloadConf (esbuildConf) {},

      // extendPackageJson (json) {},

      // 来自 /src-electron 的 Electron 预加载脚本（如果有的话），不带文件扩展名
      preloadScripts: [ 'electron-preload' ],

      // 指定在开发模式下运行 Electron 应用时使用的调试端口
      inspectPort: 5858,

      bundler: 'packager', // 'packager' 或 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // 仅限 Windows
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'itrip-ui'
      }
    },

    // 完整选项列表: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * 不在你的 bex 清单中的额外脚本（js/ts）列表，你想要
       * 编译并在你的浏览器扩展中使用。也许动态使用它们？
       *
       * 列表中的每个条目应该是相对于 /src-bex/ 的文件名
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: []
    }
  }
});
