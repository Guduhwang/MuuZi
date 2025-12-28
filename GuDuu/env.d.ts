/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAME: string;
  readonly VITE_TIMEOUT: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'vue-virtual-scroller' {
  import { DefineComponent } from 'vue';

  export const DynamicScroller: DefineComponent;
  export const DynamicScrollerItem: DefineComponent;
  export const RecycleScroller: DefineComponent;
  export const DynamicScrollerItem: DefineComponent;
}
