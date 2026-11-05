import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.applemusic.stream',
  appName: 'Apple Music',
  webDir: 'dist',
  backgroundColor: '#000000',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
  },
};

export default config;
