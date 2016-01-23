'use strict';
let validation = require('./validation');

module.exports = function (password) {
  let options = {
    firstname: 'required|minLength:2',
    lastname: 'required|minLength:2',
    email: 'required|email',
    phone: /^\+[0-9]+$/
  };
  options.password = (password ? 'required|' : '' ) + 'minLength:6';

  return validation(options);
}
