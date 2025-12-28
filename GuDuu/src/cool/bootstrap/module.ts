import { type App, type Directive } from 'vue';
import { assign, isFunction, orderBy, mergeWith } from 'lodash-es';
import { filename } from '../utils';
import { module } from '../module';
import { hmr } from '../hooks';
import { config } from '/@/config';

// 扫描文件
const files = import.meta.glob('/src/{modules,plugins}/*/{config.ts,service/**,directives/**}', {
  eager: true,
  import: 'default',
});

// 模块列表
module.list = hmr.getData('modules', []);

// 解析
for (const i in files) {
  // 分割
  const [, , type, name, action] = i.split('/');

  // 文件名
  const n = filename(i);

  // 文件内容
  const v = files[i];

  // 模块是否存在
  const m = module.get(name);

  // 数据
  const d = m || {
    name,
    type,
    value: null,
    services: [],
    directives: [],
  };

  // 配置
  if (action == 'config.ts') {
    d.value = v;
  }
  // 服务
  else if (action == 'service') {
    const s = new (v as any)();

    if (s) {
      d.services?.push({
        path: s.namespace,
        value: s,
      });
    }
  }
  // 指令
  else if (action == 'directives') {
    d.directives?.push({ name: n, value: v as Directive });
  }

  if (!m) {
    module.add(d);
  }
}

// 创建
export async function createModule(app: App) {
  // 排序
  module.list.forEach((e) => {
    const d = isFunction(e.value) ? e.value(app) : e.value;

    if (d) {
      assign(e, d);
    }

    if (!d.order) {
      e.order = 0;
    }
  });

  const list = orderBy(module.list, 'order', 'desc');
  
  // 并行注册所有模块的组件，提升加载性能
  const componentPromises: Promise<void>[] = [];
  
  list.forEach((e) => {
    if (e.enable !== false) {
      // 初始化
      e.install?.(app, e.options);

      // 注册组件 - 并行加载优化
      if (e.components && e.components.length > 0) {
        const moduleComponentPromises = e.components.map(async (c: any) => {
          try {
            const v = await (isFunction(c) ? c() : c);
            const n = v.default || v;

            if (n.name) {
              app.component(n.name, n);
            }
          } catch (err) {
            console.error(`[Module ${e.name}] Component registration error:`, err);
          }
        });
        componentPromises.push(...moduleComponentPromises);
      }

      // 注册指令
      e.directives?.forEach((v) => {
        app.directive(v.name, v.value);
      });

      // 合并忽略配置
      config.ignore = mergeWith({}, config.ignore, e.ignore, (a, b) => a?.concat(b));
    }

    // 附加值
    e.pages?.forEach((v) => {
      v.isPage = true;
    });
  });
  
  // 等待所有组件注册完成
  await Promise.all(componentPromises);

  return {
    // 模块列表
    list,
    // 事件加载 - 保持串行以确保依赖关系正确
    async eventLoop() {
      const events: any = {};

      for (let i = 0; i < list.length; i++) {
        if (list[i].onLoad) {
          try {
            const result = await list[i]?.onLoad?.(events);
            if (result) {
              assign(events, result);
            }
          } catch (err) {
            console.error(`[Module ${list[i].name}] onLoad error:`, err);
          }
        }
      }
    },
  };
}
