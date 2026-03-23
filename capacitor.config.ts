import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luminary.app',
  appName: 'Luminary',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    App: {
      appUrlOpen: 'com.luminary.app://callback',
    },
  },
};

export default config;