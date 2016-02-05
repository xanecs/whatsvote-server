'use strict';

let config = require('../config.json');
module.exports = function(user) {
  return {
    subject: 'WhatsVote email confirmation',
    body: `Hello ${user.firstname},
    You have registered for an account at WhatsVote.
    To confirm your account, please visit ${config.frontend}verify/${user.email}/${user.mailtoken}

    Regards,
    the WhatsVote bot`
  };
}
