<template>
  <div class="x2mu-wrap">
    <div id="__nuxt">
      <MobileMenu />
      <AppHeader v-model="viewName" />
      <KeepAlive>
        <component :is="curComponent" @updateView="updateView"></component>
      </KeepAlive>
      <AppFooter />
    </div>
  </div>
</template>
<script lang="ts" setup>
import MobileMenu from './components/MobileMenu.vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import IndexContent from './components/IndexContent.vue';
import Confession from './confession.vue';
import Projects from './projects.vue';
import ContactMe from './contact-me.vue';
import { computed, provide, ref } from 'vue';
import './css/x2mu-index.scss';

const viewName = ref('IndexContent');
const curComponent = computed(() => {
  return {
    IndexContent,
    Confession,
    Projects,
    ContactMe,
  }[viewName.value];
});
function updateView(val: string) {
  viewName.value = val;
}
provide('updateView', updateView);
</script>
