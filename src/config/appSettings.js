// Application Settings Configuration
// Change the CURRENT_ENVIRONMENT to switch between environments

const ENVIRONMENTS = {
    development: {
        API_URL: 'https://localhost:7043/api',
        DEBUG: true,
        ENV_NAME: 'development'
    },
    staging: {
        API_URL: 'https://staging-api.thetechmenders.com/api',
        DEBUG: true,
        ENV_NAME: 'staging'
    },
    production: {
        API_URL: 'https://classroomapi.thetechmenders.com/api',
        DEBUG: false,
        ENV_NAME: 'production'
    }
};

// ========================================
// SET CURRENT ENVIRONMENT HERE
// ========================================
const CURRENT_ENVIRONMENT = 'production';
// ========================================

const currentConfig = ENVIRONMENTS[CURRENT_ENVIRONMENT] || ENVIRONMENTS.production;

export const appSettings = {
    // API Configuration
    apiUrl: currentConfig.API_URL,
    
    // Portal URL
    mainPortalUrl: '/',
    
    // Environment Info
    environment: currentConfig.ENV_NAME,
    isProduction: currentConfig.ENV_NAME === 'production',
    isDevelopment: currentConfig.ENV_NAME === 'development',
    isStaging: currentConfig.ENV_NAME === 'staging',
    
    // Debug Settings
    debug: currentConfig.DEBUG,
    
    // API Timeout Settings
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
};

// Helper function to get full API endpoint
export const getApiEndpoint = (path) => {
    const baseUrl = appSettings.apiUrl.endsWith('/') 
        ? appSettings.apiUrl.slice(0, -1) 
        : appSettings.apiUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

export default appSettings;
