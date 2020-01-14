module.exports = {
  PORT: process.env.PORT,
  DB_CONNECTION: process.env.DB_CONNECTION,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXP: '15m',
  JWT_AUD: 'projektor_client',
  JWT_ISS: 'projektor_api',
  DOMAIN: 'https://projektor-api.herokuapp.com'
};
