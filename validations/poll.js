'use strict';
let validation = require('./validation');

module.exports = function () {
  let options = {
    question: 'required|minLength:2',
    description: '',
    method: 'required|in:single-choice,multiple-choice,stv',
    options: 'required',
    group: 'required'
  };

  return validation(options);
}
