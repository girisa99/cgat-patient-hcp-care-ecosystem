import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0e30badfcab5468294591076c06d2310',
  appName: 'cgat-patient-hcp-care-ecosystem',
  webDir: 'dist',
  server: {
    url: 'https://0e30badf-cab5-4682-9459-1076c06d2310.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      correctOrientation: true,
      saveToGallery: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    backgroundColor: '#0f172a',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f172a',
  },
};

export default config;
