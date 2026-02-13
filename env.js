// env.js - Environment variable loader
export const config = {
  firebase: {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
  },
  site: {
    name: import.meta.env.VITE_SITE_NAME || 'Cemil Meriç Ortaokulu',
    adminCode: import.meta.env.VITE_ADMIN_CODE || '3535',
  },
};