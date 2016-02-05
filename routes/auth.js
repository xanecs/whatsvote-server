'use strict';
let validateUser = require('../validations/user');
let jwt = require('koa-jwt');
let config = require('../config.json');
let bcrypt = require('bcrypt-then');
let emailBlacklist = require('disposable-email-domains');
let crypto = require('crypto');

let verifyTemplate = require('../templates/verify');

module.exports = function (router, mailgun) {
  router.post('/auth/signup', validateUser(true), function *(next) {
    let newUser = this.request.body;

    // Check if the user is using a disposable email address
    let emailDomain = newUser.email.split('@')[1].toLowerCase();

    if (emailBlacklist.indexOf(emailDomain) >= 0) {
      this.status = 400;
      this.body = {ok: false, error: 'blocked_email_domain', message: 'This email domain is blocked'};
      return;
    }

    newUser.password = yield bcrypt.hash(newUser.password);
    newUser.notverified = true;
    newUser.mailtoken = crypto.randomBytes(8).toString('hex');

    let result = yield this.r.table('users').insert(newUser, {
      returnChanges: true
    }).run();
    if (result.errors > 0) {
      this.status = 500;
      this.body = {ok: false, message: result.first_error.split(':')[0]};
      return;
    }
    let response = result.changes[0].new_val;
    delete response.password;
    delete response.mailtoken;

    let message = verifyTemplate(response);
    mailgun.sendText(config.email.sender, response.email, message.subject, message.body);

    response.ok = true;
    this.status = 200;
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
      this.body = {ok: false, message: 'Invalid email'};
      return;
    }

    if (!(yield bcrypt.compare(this.request.body.password, result.password))) {
      this.status = 401;
      this.body = {ok: false, message: 'Invalid password'};
      return;
    }

    if (result.notverified) {
      this.status = 401;
      this.body = {ok: false, error: 'email_not_verified', message: 'Your email address is not yet verified. Check your inbox for an activation message.'};
      return;
    }

    delete result.password;
    delete result.groups;

    let token = jwt.sign(result, config.jwt.secret, {expiresIn: '30d'});
    this.status = 200;
    this.body = {ok: true, token: token, user: result};
  });

  router.post('/auth/verify/:userid/:token', function *(next) {
    let userId = this.params.userid;
    let token = this.params.token;
    let user = yield this.r.table('users').get(userId);
    if (!user || user.mailtoken !== token) {
      this.status = 404;
      this.body = {ok: false, message: 'Invalid email or token'};
      return;
    }

    yield this.r.table('users').get(userId).update({notverified: false});

    this.status = 200;
    this.body = {ok: true};

  });
}
