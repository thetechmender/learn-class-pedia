const appSettings = {
  // Environment: 'development' | 'production'
  environment: 'development',
  
  // API Configuration
  api: {
    baseUrl: 'http://localhost:5000/api',
    timeout: 30000,
  },
  
  // Authentication
  auth: {
    tokenKey: 'auth_token',
    userKey: 'auth_user',
    tokenExpiry: 86400000, // 24 hours in ms
  },
  
  // Feature Flags
  features: {
    useMockData: true,
    enableAnalytics: false,
  },
  
  // App Info
  app: {
    name: 'ClassPedia',
    version: '1.0.0',
  }
};

// Helper to check environment
export const isDevelopment = () => appSettings.environment === 'development';
export const isProduction = () => appSettings.environment === 'production';

export default appSettings;
