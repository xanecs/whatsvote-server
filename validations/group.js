'use strict';
let validation = require('./validation');

module.exports = function() {
  let options = {
    name: 'required|minLength:2'
  };

  return validation(options);
}
