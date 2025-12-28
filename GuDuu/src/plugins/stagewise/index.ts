// Stagewise integration for development mode
import { StagewiseToolbar } from '@stagewise/toolbar-vue';

// Configuration object
const stagewiseConfig = {
  plugins: [],
};

export { StagewiseToolbar, stagewiseConfig };

// Helper function to check if we're in development
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development' || import.meta.env.DEV;
};
