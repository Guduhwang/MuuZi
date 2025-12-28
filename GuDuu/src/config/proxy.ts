const proxy = {
  // API 相关代理 - 优先匹配更具体的路径
  '/api/': {
    target: 'http://47.117.179.35:8001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  },
  '/socket': {
    target: 'http://47.117.179.35:8001',
    changeOrigin: true,
    ws: true, // 支持 WebSocket
  },
  '/dev/': {
    target: 'http://47.117.179.35:8001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/dev/, ''),
  },
  '/api/index-api/': {
    target: 'http://47.117.179.35:8001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/index-api/, ''),
  },
  '/prod/': {
    target: 'http://47.117.179.35:8001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/prod/, '/api'),
  },
  // CosMac 网站的静态资源代理（以_开头的所有路径）
  '^/_.*': {
    target: 'https://home.cosmac.cc',
    changeOrigin: true,
    configure: (proxy: any, options: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
        proxyReq.setHeader('Host', 'home.cosmac.cc');
      });
    },
  },
  // 精确匹配根路径 - 只代理根路径，不包括子路径
  '^/$': {
    target: 'https://home.cosmac.cc',
    changeOrigin: true,
    // 配置 Host 头
    configure: (proxy: any, options: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
        proxyReq.setHeader('Host', 'home.cosmac.cc');
      });
    },
  },
};

const value = 'dev';
const host = proxy[`/${value}/`]?.target;

export { proxy, host, value };
