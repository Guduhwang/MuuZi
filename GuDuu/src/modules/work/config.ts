import { type ModuleConfig } from '/@/cool';
import { useStore } from '/@/store';
import { config } from '/@/config';
import { t } from '/@/plugins/i18n';
import '/@/modules/base/static/css/index.scss';

export default (): ModuleConfig => {
  return {
    order: 98,
    ignore: {
      NProgress: [
        '/base/open/eps',
        '/base/comm/person',
        '/base/comm/permmenu',
        '/base/comm/upload',
        '/base/comm/uploadMode',
        '/home',
      ],
      token: [
        '/discord',
        '/test',
        '/work',
        '/login',
        '/401',
        '/403',
        '/404',
        '/500',
        '/502',
        '/person',
        '/goods',
        '/home',
        '/register',
        '/share',
      ],
    },
    views: [],
    pages: [
      {
        path: '/',
        name: 'Home',
        component: () => import('/$/work/index/index.vue'),
      },
      {
        path: '/workbench',
        name: 'WorkWorkbench',
        component: () => import('/$/work/workbench/index.vue'),
        props: true,
      },
      {
        path: '/login',
        component: () => import('/$/work/login/index.vue'),
      },
      {
        path: '/register',
        component: () => import('/$/work/register/index.vue'),
        // TODO 此框架这个配置似乎是无用的
        props: (route) => ({
          isShowAdditionalInfo: route.query.isShowAdditionalInfo === '1',
          id: route.query.id,
        }),
      },
      {
        path: '/person/:name',
        name: 'WorkPersonalHomePage',
        component: () => import('/$/work/personal-homepage/index.vue'),
        props: true,
      },
      {
        path: '/personmobile/:name',
        name: 'WorkPersonalHomePageMobile',
        component: () => import('/$/work/personal-homepage/mobile.vue'),
        props: true,
      },
      {
        path: '/goods/:id',
        component: () => import('/$/work/goods/index.vue'),
        props: true,
      },
      {
        path: '/apply_profile',
        component: () => import('/$/work/applyTeam.vue'),
      },
      {
        path: '/join_team',
        component: () => import('/$/work/joinTeam.vue'),
      },
      {
        path: '/discord',
        component: () => import('/$/work/login/discord.vue'),
      },
      {
        path: '/payment',
        component: () => import('/$/work/payment/index.vue'),
      },
      {
        path: '/workflow_store',
        component: () => import('/$/work/workflow-store/index.vue'),
      },
      {
        path: '/share/:code',
        name: 'ShareMember',
        component: () => import('/$/work/pages/share-member/index.vue'),
        props: true,
      },
    ],
    install() {
      // 设置标题
      document.title = config.app.name;

      // 设置加载文案
      const loading = document.querySelector('#Loading');

      if (loading) {
        // loading.querySelector('.preload__name')!.innerHTML = config.app.name;
        loading.querySelector('.preload__title')!.innerHTML = 'Loading resources...';
        loading.querySelector('.preload__sub-title')!.innerHTML =
          'It may take some time for the initial resource loading. Please wait patiently.';
      }
    },
    async onLoad() {
      const { userStore, menu, app } = useStore();

      // token 事件
      async function hasToken(cb: () => Promise<any> | void) {
        if (cb) {
          app.addEvent('hasToken', cb);
          if (userStore.token) {
            await cb();
          }
        }
      }

      await hasToken(async () => {
        // 获取用户信息
        userStore.get();
        // 获取菜单权限
        await menu.get();
      });

      return {
        hasToken,
      };
    },
  };
};
