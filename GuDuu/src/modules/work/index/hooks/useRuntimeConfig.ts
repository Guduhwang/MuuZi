/**
 * 从nuxt中迁移，暂时保留congfig
 * */
import config from '../json/developer.json';
export default function useRuntimeConfig() {
  return {
    // The private keys which are only available server-side
    apiSecret: '123',
    // Keys within public are also exposed client-side
    public: {
      apiBase: '/api',
      dev: config,
    },
    dev: config,
  };
}
