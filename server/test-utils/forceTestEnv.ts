// dotenv does not override variables that are already set. A local shell often
// has AUTH_PROVIDER=one-login, USE_AUTH=true and PORT=3001 from .env. Pin the
// values the unit tests assume before config is imported.
process.env.AUTH_PROVIDER = 'password';
process.env.USE_AUTH = 'false';
process.env.PORT = '8001';
