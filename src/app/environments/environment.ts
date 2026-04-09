export const ENVIRONMENTS = {
  development: {
    API_URL: 'https://localhost:7224/api',
    DEBUG: true,
    ENV_NAME: 'development'
  },
  staging: {
    API_URL: 'https://staging-api.thetechmenders.com/api',
    DEBUG: true,
    ENV_NAME: 'staging'
  },
  production: {
    API_URL: 'https://class.thetechmenders.com/api',
    DEBUG: false,
    ENV_NAME: 'production'
  }
};

export const environment = ENVIRONMENTS.production;
