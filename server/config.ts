const production = process.env.NODE_ENV === 'production'

const getStringConfigValue = (name: string): string => {
  if (process.env[name]) {
    return process.env[name]
  }
  throw new Error(`Missing env var ${name}`)
}

const getBoolConfigValue = (name: string): boolean => {
  return getStringConfigValue(name) === 'true'
}

const getIntConfigValue = (name: string): number => {
  return parseInt(getStringConfigValue(name), 10)
}

const getValkeyConfig = () => {
  const enabled = getBoolConfigValue('VALKEY_ENABLED')

  if (enabled) {
    return {
      enabled: true,
      host: getStringConfigValue('VALKEY_HOST'),
      port: getIntConfigValue('VALKEY_PORT'),
      password: getStringConfigValue('VALKEY_PASSWORD'),
      tls_enabled: getBoolConfigValue('VALKEY_TLS_ENABLED'),
    }
  }

  return {
    enabled: false,
    host: undefined,
    port: undefined,
    password: undefined,
    tls_enabled: undefined,
  }
}

const config = {
  buildNumber: getStringConfigValue('BUILD_NUMBER'),
  gitRef: getStringConfigValue('GIT_REF'),
  gitBranch: getStringConfigValue('GIT_BRANCH'),
  includeWelshLanguage: getBoolConfigValue('INCLUDE_WELSH_LANGUAGE'),
  production,
  useHttps: getBoolConfigValue('USE_HTTPS'),
  staticResourceCacheDuration: getStringConfigValue('STATIC_RESOURCE_CACHE_DURATION'),
  valkey: getValkeyConfig(),
  session: {
    secret: getStringConfigValue('SESSION_SECRET'),
    expiryMinutes: getIntConfigValue('WEB_SESSION_TIMEOUT_IN_MINUTES'),
  },
}

if (production) {
  if (!config.useHttps || !config.valkey.tls_enabled) {
    throw new Error(`HTTPS must be enabled on production environments`)
  }

  if (!config.valkey.enabled) {
    throw new Error(`Valkey must be used on production environments`)
  }
}

export default config
