'use strict';
let validation = require('./validation');

module.exports = function () {
  let options = {
    question: 'required|minLength:2',
    description: 'string',
    method: 'required|in:single-choice,multiple-choice,stv',
    options: 'required',
    groupId: 'required'
  };

  return validation(options);
}
