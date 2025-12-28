declare module '@stagewise/toolbar-vue' {
  import { DefineComponent } from 'vue';

  export interface StagewiseConfig {
    plugins: any[];
    [key: string]: any;
  }

  export const StagewiseToolbar: DefineComponent<{
    config: StagewiseConfig;
  }>;
}
