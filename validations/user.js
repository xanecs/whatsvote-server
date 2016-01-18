'use strict';
module.exports = function (password) {
  return function *(next) {
    let options = {
      firstname: 'required|minLength:2',
      lastname: 'required|minLength:2',
      email: 'required|email',
      phone: /^\+[0-9]+$/
    };
    options.password = (password ? 'required|' : '' ) + 'minLength:6';

    yield this.validateBody(options);

    if (this.validationErrors) {
      this.status = 400;
      this.body = this.validationErrors;
    } else {
      yield next;
    }
  }
}
