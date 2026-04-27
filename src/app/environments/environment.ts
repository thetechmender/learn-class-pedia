export const ENVIRONMENTS = {
  development: {
    API_URL: 'https://localhost:7224/api',
    DEBUG: true,
    ENV_NAME: 'development',
    HIDE_URL_PARAMS: false
  },
  staging: {
    API_URL: 'https://class.thetechmenders.com/api',
    DEBUG: true,
    ENV_NAME: 'staging',
    HIDE_URL_PARAMS: false
  },
  production: {
    API_URL: 'https://api.classpedia.ai/api',
    DEBUG: false,
    ENV_NAME: 'production',
    HIDE_URL_PARAMS: false
  }
};

export const environment = ENVIRONMENTS.production;
