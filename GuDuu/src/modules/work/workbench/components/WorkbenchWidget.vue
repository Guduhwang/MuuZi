<template>
  <div class="wrap">
    <div class="head">{{ title }}</div>
    <div class="group-list">
      <div class="group" v-for="group in groupList" :key="group.id">
        <img :src="person.img" alt="" v-for="person in group.persons" :key="person.id" class="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IAIEntity } from '../type/workbench.type';

const props = defineProps<{
  title: string;
  groupList: IAIEntity[];
}>();
</script>

<style lang="scss" scoped>
.wrap {
  // background: var(--theme-bg-0-color);
  background: #fff;
  border: 1px solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  padding: 8px;
  margin-bottom: 10px;
}

.head {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 600;
}

.group-list {
  column-count: 6;
  column-width: 10px;
  column-gap: 4px;
}

.group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  break-inside: avoid;
  margin-bottom: 4px;
  padding: 4px;
  aspect-ratio: 2;
  border: 1px solid var(--theme-border-color);
  background: var(--theme-bg-color);
  border-radius: 6px 6px 0 0;
}

.item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 100%;
}
</style>
