import { ref } from 'vue';

export function useTaskTriggerDialog() {
  const showTaskTrigger = ref(false);
  return {
    showTaskTrigger,
  };
}
