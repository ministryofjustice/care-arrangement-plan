const production = process.env.NODE_ENV === 'production';

const getStringConfigValue = (name: string): string => {
  if (process.env[name]) {
    return process.env[name];
  }
  throw new Error(`Missing env var ${name}`);
};

const getBoolConfigValue = (name: string): boolean => {
  return getStringConfigValue(name) === 'true';
};

const getIntConfigValue = (name: string): number => {
  return parseInt(getStringConfigValue(name), 10);
};

const getStringArray = (name: string) => getStringConfigValue(name).split(',');

const getValkeyConfig = () => {
  const enabled = getBoolConfigValue('VALKEY_ENABLED');

  if (enabled) {
    return {
      enabled: true,
      host: getStringConfigValue('VALKEY_HOST'),
      port: getIntConfigValue('VALKEY_PORT'),
      password: getStringConfigValue('VALKEY_PASSWORD'),
      tls_enabled: getBoolConfigValue('VALKEY_TLS_ENABLED'),
    };
  }

  return {
    enabled: false,
    host: undefined,
    port: undefined,
    password: undefined,
    tls_enabled: undefined,
  };
};

const config = {
  buildNumber: getStringConfigValue('BUILD_NUMBER'),
  gitRef: getStringConfigValue('GIT_REF'),
  gitBranch: getStringConfigValue('GIT_BRANCH'),
  includeWelshLanguage: getBoolConfigValue('INCLUDE_WELSH_LANGUAGE'),
  production,
  useHttps: getBoolConfigValue('USE_HTTPS'),
  staticResourceCacheDuration: getStringConfigValue('STATIC_RESOURCE_CACHE_DURATION'),
  analytics: {
    ga4Id: process.env.GA4_ID,
  },
  valkey: getValkeyConfig(),
  session: {
    secret: getStringConfigValue('SESSION_SECRET'),
    expiryMinutes: getIntConfigValue('WEB_SESSION_TIMEOUT_IN_MINUTES'),
  },
  passwords: getStringArray('BETA_ACCESS_PASSWORDS'),
  useAuth: getBoolConfigValue('USE_AUTH'),
  feedbackUrl: getStringConfigValue('FEEDBACK_URL'),
  contactEmail: getStringConfigValue('CONTACT_EMAIL'),
  previewEnd: new Date(getStringConfigValue('PREVIEW_END')),
};

// if (production) {
//   // TODO C5141-953
//   if (!config.useHttps || !config.valkey.tls_enabled) {
//     throw new Error(`HTTPS must be enabled on production environments`)
//   }
//   // TODO C5141-954
//   if (!config.valkey.enabled) {
//     throw new Error(`Valkey must be used on production environments`)
//   }
// }

export default config;
