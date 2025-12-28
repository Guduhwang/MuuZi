import './sodium-init';
import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import App from './App.vue';
import { bootstrap } from './cool';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
//import './assets/styles/main.scss'; // 引入字体样式文件
import draggableDirective from './directives/draggable.directive';
import './assets/styles/base.scss';
import './assets/styles/theme-yellow.scss';
import './assets/styles/theme-excludes.scss'; // 主题排除样式，必须在 theme-yellow 之后引入
import vue3GoogleLogin from 'vue3-google-login';
import '/src/assets/styles/fonts.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const app = createApp(App);
app.use(ElementPlus);
app.use(vue3GoogleLogin, {
  clientId,
});
app.config.globalProperties.$apiUrl = '/dev/';
app.config.globalProperties.$getUid = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo')).id;
};
app.config.globalProperties.$getToken = () => localStorage.getItem('token')?.replace(/"/g, '');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
//app.directive('draggable', draggableDirective);

app.use(VueQueryPlugin);

// 启动
bootstrap(app)
  .then(() => {
    app.mount('#app');
  })
  .catch((err) => {
    console.error('COOL-ADMIN 启动失败', err);
  });

window.apiUrl = '/dev/';

window.getInfo = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo;
};

window.getUid = () => {
  const userInfo = getInfo();
  return userInfo.id;
};

window.isLogined = () => {
  const info = localStorage.getItem('userInfo');
  if (!info) {
    return false;
  } else {
    return true;
  }
};

window.getToken = () => {
  return localStorage.getItem('token')?.replace(/"/g, '');
};

window.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
