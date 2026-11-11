const LOCAL_CLIENT_ID = 'HGIOgho9HIRhgoepdIOPFdIUWgewi0jw';
const LOCAL_ISSUER = 'http://localhost:3000/';

export type EnabledOneLoginConfig = {
  enabled: true;
  issuer: string;
  clientId: string;
  privateKey: string;
  redirectUrl: string;
  postLogoutRedirectUrl: string;
  scopes: string[];
  vtr: string;
};

export type OneLoginConfig = { enabled: false } | EnabledOneLoginConfig;

const withTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const isLocalHttpIssuer = (issuer: string) => {
  try {
    const url = new URL(issuer);
    return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
};

const required = (env: NodeJS.ProcessEnv, name: string, fallback?: string) => {
  const value = env[name];
  if (value) {
    return value;
  }
  if (fallback) {
    return fallback;
  }
  throw new Error(`Missing env var ${name}`);
};

const scopesFrom = (env: NodeJS.ProcessEnv) => {
  const scopes = (env.ONE_LOGIN_SCOPES || 'openid,email')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!scopes.includes('openid')) {
    scopes.unshift('openid');
  }

  return scopes;
};

/**
 * Builds GOV.UK One Login settings.
 * Local development can omit the client id and use the published simulator client.
 * The private key always comes from ONE_LOGIN_PRIVATE_KEY, including for the simulator.
 * Any other issuer, including integration and production, must supply its own client id and private key.
 */
const buildOneLoginConfig = (env: NodeJS.ProcessEnv, isProduction: boolean): OneLoginConfig => {
  if (env.AUTH_PROVIDER !== 'one-login') {
    return { enabled: false };
  }

  const issuer = withTrailingSlash(env.ONE_LOGIN_ISSUER || LOCAL_ISSUER);
  const localSimulator = !isProduction && isLocalHttpIssuer(issuer);
  const port = env.PORT || '8001';
  const localOrigin = `http://localhost:${port}`;

  return {
    enabled: true,
    issuer,
    clientId: required(env, 'ONE_LOGIN_CLIENT_ID', localSimulator ? LOCAL_CLIENT_ID : undefined),
    privateKey: required(env, 'ONE_LOGIN_PRIVATE_KEY'),
    redirectUrl: required(
      env,
      'ONE_LOGIN_REDIRECT_URL',
      localSimulator ? `${localOrigin}/oidc/authorization-code/callback` : undefined,
    ),
    postLogoutRedirectUrl: required(
      env,
      'ONE_LOGIN_POST_LOGOUT_REDIRECT_URL',
      localSimulator ? `${localOrigin}/signed-out` : undefined,
    ),
    scopes: scopesFrom(env),
    vtr: env.ONE_LOGIN_VTR || 'Cl.Cm',
  };
};

export default buildOneLoginConfig;
