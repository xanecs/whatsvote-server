'use strict';
let validateUser = require('../validations/user');
let jwt = require('koa-jwt');
let config = require('../config.json');
let bcrypt = require('bcrypt-then');

module.exports = function (router) {
  router.post('/auth/signup', validateUser(true), function *(next) {
    let newUser = this.request.body;
    newUser.password = yield bcrypt.hash(newUser.password);

    let result = yield this.r.table('users').insert(newUser, {
      returnChanges: true
    }).run();
    if (result.errors > 0) {
      this.status = 500;
      this.body = result.first_error.split(':')[0];
      return;
    }
    this.status = 200;
    let response = result.changes[0].new_val;
    delete response.password;

    response.ok = true;
    this.body = response;
  });

  router.post('/auth/login', function *(next) {
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

    if (!(yield bcrypt.compare(this.request.body.password, result.password))) {
      this.status = 401;
      this.body = {ok: false, message: "Invalid password"};
      return;
    }

    delete result.password;
    delete response.groups;

    let token = jwt.sign(result, config.jwt.secret, {expiresIn: "30d"});
    this.status = 200;
    this.body = {ok: true, token: token, user: result};
  });
}
