<script setup lang="ts">
import { motion } from 'motion-v';
defineOptions({
  name: 'ChatLoading',
});
</script>

<template>
  <div class="chatLoading-container">
    <motion.div
      class="chatLoading-spinner"
      :animate="{ rotate: 360 }"
      :transition="{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }"
    />
  </div>
</template>

<style lang="scss">
.chatLoading-container {
  width: 14px;
  height: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.chatLoading-spinner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #b8babd;
  border-top-color: #000;
  will-change: transform;
}
</style>
