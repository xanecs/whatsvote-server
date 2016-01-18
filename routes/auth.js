'use strict';
let validateUser = require('../validations/user');
let jwt = require('koa-jwt');
let config = require('../config.json');

module.exports = function (router) {
  router.post('/signup', validateUser(true), function *(next) {
    let result = yield this.r.table('users').insert(this.request.body, {returnChanges: true}).run();
    if (result.errors > 0) {
      this.status = 500;
      this.body = result.first_error.split(':')[0];
      return;
    }
    this.status = 200;
    let response = result.changes[0].new_val;
    response.ok = true;
    this.body = response;
  });

  router.post('/login', function *(next) {
    this.validateBody({
      email: 'required',
      password: 'required'
    });

    if (this.validationErrors) {
      this.status = 400;
      this.body = this.validationErrors;
      return;
    }

    let result = yield this.r.table('users').get(this.request.body.email).run();

    if (!result) {
      this.status = 401;
      this.body = {ok: false, message: "Invalid email"};
      return;
    }

    //TODO: You know what to do... No cleartext
    if (this.request.body.password !== result.password) {
      this.status = 401;
      this.body = {ok: false, message: "Invalid password"};
      return;
    }

    delete result.password;

    let token = jwt.sign(result, config.jwt.secret, {expiresIn: "30d"});
    this.status = 200;
    this.body = {ok: true, token: token, user: result};
  });
}
