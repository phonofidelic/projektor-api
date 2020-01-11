process.env.DEBUG = 'node-ses';
const ses = require('node-ses');
const { SES_KEY, SES_SECRET } = require('../../config/keys');

console.log('SES_KEY:', SES_KEY);
console.log('SES_SECRET:', SES_SECRET);

exports.sendTestEmail = () => {
  const client = ses.createClient({
    key: SES_KEY,
    secret: SES_SECRET,
    amazon: 'https://email.us-west-2.amazonaws.com'
  });
  const emailParams = {
    to: 'chris.clemons85@gmail.com',
    from: 'team@projektorapp.com',
    subject: 'test',
    message: 'This is a test',
    altText: 'This is a test'
  };

  return new Promise((resolve, reject) => {
    client.sendEmail(emailParams, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      console.log('sendTestEmail response:', data);
      resolve(data);
    });
  });
};
