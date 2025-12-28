import { defineStore } from 'pinia';

export const usePublishDialogStore = defineStore('publishDialog', {
  state: () => ({
    hasNew: false,
  }),
  actions: {
    setHasNew(hasNew: boolean) {
      this.hasNew = hasNew;
    },
  },
});
