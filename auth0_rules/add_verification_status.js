function (user, context, callback) {
  var namespace = 'https://projectorapp.com/';
  context.accessToken[namespace + 'isVerified'] = user.email_verified;
  return callback(null, user, context);
}