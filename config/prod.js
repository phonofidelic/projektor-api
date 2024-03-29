module.exports = {
  PORT: process.env.PORT,
  DB_CONNECTION: process.env.DB_CONNECTION,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXP: '15m',
  JWT_AUD: 'projektor_client',
  JWT_ISS: 'projektor_api',
  SES_KEY: process.env.SES_KEY,
  SES_SECRET: process.env.SES_SECRET,
  DOMAIN: 'https://projektor-api.herokuapp.com',
  CLIENT_DOMAIN: 'https://www.projektorapp.com',
  APP_NAMESPACE: process.env.APP_NAMESPACE,
  AUTH0_API_IDENTIFIER: process.env.AUTH0_API_IDENTIFIER,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
};
