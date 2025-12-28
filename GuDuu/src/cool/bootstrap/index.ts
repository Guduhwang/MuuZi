import { createPinia } from 'pinia';
import { type App } from 'vue';
import { createModule } from './module';
import { router } from '../router';
import { Loading } from '../utils';
import { createEps } from './eps';
import 'virtual:svg-register';
import piniaPluginReset from '../../modules/base/plugin/pinia/restore';

export async function bootstrap(app: App) {
  // pinia
  const pinia = createPinia();
  pinia.use(piniaPluginReset);
  app.use(pinia);

  // 路由
  app.use(router);

  // 模块 - 等待组件注册完成
  const { eventLoop } = await createModule(app);

  // eps
  createEps();

  // 加载
  Loading.set([eventLoop()]);
}
