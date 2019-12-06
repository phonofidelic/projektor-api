module.exports = {
  PORT: 4000,
  DB_CONNECTION: 'mongodb://localhost:27017/projektor_dev',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXP: '15m',
  JWT_AUD: 'projektor_client',
  JWT_ISS: 'projektor_api'
};
