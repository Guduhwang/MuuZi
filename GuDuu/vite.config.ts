import { fileURLToPath, URL } from 'node:url';
import { ConfigEnv, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import compression from 'vite-plugin-compression';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import { visualizer } from 'rollup-plugin-visualizer';
import { proxy } from './src/config/proxy';
import { cool } from '@cool-vue/vite-plugin';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolver from 'unplugin-icons/resolver';

function toPath(dir: string) {
  return fileURLToPath(new URL(dir, import.meta.url));
}

// https://vitejs.dev/config
export default ({ mode }: ConfigEnv): UserConfig => {
  const isDev = mode === 'development';

  return {
    plugins: [
      vue(),
      //compression(),
      vueJsx(),
      // vueDevTools(),
      cool({
        type: 'admin',
        proxy,
        eps: {
          enable: true,
        },
        demo: mode == 'demo',
      }),
      // visualizer({
      // 	open: false,
      // 	gzipSize: true,
      // 	brotliSize: true
      // }),
      VueI18nPlugin({
        include: [toPath('./src/{modules,plugins}/**/locales/**')],
      }),
      Components({
        resolvers: [IconsResolver()],
      }),
      Icons({
        compiler: 'vue3',
      }),
    ],

    base: '/',

    server: {
      port: 9000,
      proxy,
      hmr: {
        overlay: true,
      },
      allowedHosts: ['dev.x2mu.plus', 'cosmac.cc', 'www.x2mu.plus', 'x2mu.plus', 'www.cosmac.cc'],
    },

    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          api: 'modern-compiler',
        },
      },
    },

    resolve: {
      alias: {
        '/@': toPath('./src'),
        '/$': toPath('./src/modules'),
        '/#': toPath('./src/plugins'),
        '#': toPath('./src/plugins'),
        '/~': toPath('./packages'),
      },
    },

    esbuild: {
      drop: isDev ? [] : ['console', 'debugger'],
    },

    // ✅ 关键配置项：解决 sodium 打包问题
    optimizeDeps: {
      include: ['libsodium-wrappers-sumo'],
      // 减少并发预构建任务
      esbuildOptions: {
        target: 'es2015',
      },
    },

    build: {
      // 设置构建目标，减少编译工作量
      target: 'es2015',
      minify: 'esbuild',
      sourcemap: isDev,

      // 设置 chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,

      // 启用 CSS 代码分割
      cssCodeSplit: true,

      // ✅ 关键配置项：支持混合模块（如 sodium）
      commonjsOptions: {
        transformMixedEsModules: true,
      },

      rollupOptions: {
        // 限制并行文件操作，避免 CPU 过载
        // 根据服务器 CPU 核心数调整，建议为 CPU 核心数的一半
        maxParallelFileOps: 2,

        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            // 优化 chunk 分割策略，减少小 chunk 数量
            if (id.includes('node_modules')) {
              // 排除不需要打包的依赖
              if (id.includes('prettier')) {
                return;
              }

              // Vue 核心生态必须一起打包，避免
              // 包括 vue、vue-router、pinia、vue-i18n、@tanstack/vue-query 等
              // 注意：element-plus 会单独处理，不在此处
              if (
                (id.includes('/vue') && !id.includes('element-plus') && !id.includes('@element-plus')) ||
                id.includes('vue-router') ||
                id.includes('/pinia') ||
                id.includes('vue-i18n') ||
                id.includes('@intlify') ||
                id.includes('@tanstack/vue-query') ||
                id.includes('@vueuse/core')
              ) {
                return 'vendor-vue-core';
              }

              // 大型库单独打包
              if (id.includes('echarts')) {
                return 'vendor-echarts';
              }

              if (id.includes('gojs')) {
                return 'vendor-gojs';
              }

              if (id.includes('libsodium-wrappers-sumo')) {
                return 'vendor-sodium';
              }

              if (id.includes('element-plus')) {
                return 'vendor-element-plus';
              }

              if (id.includes('@cool-vue/crud')) {
                return 'vendor-cool-crud';
              }

              // 其他 node_modules 按包名分割，但限制最小 chunk 大小
              const packageName = id.toString().split('node_modules/')[1]?.replace('.pnpm/', '').split('/')[0];

              // 只有较大的包才单独打包，小的包合并到 vendor-common
              if (packageName) {
                // 可以将相关的小包合并
                if (['@cosmjs', '@tiptap'].some((prefix) => packageName.startsWith(prefix))) {
                  return `vendor-${packageName.split('/')[0]}`;
                }

                // 其他小包合并到 vendor-common
                return 'vendor-common';
              }
            }
          },
        },
      },
    },
  };
};
