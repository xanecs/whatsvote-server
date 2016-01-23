'use strict';
let validateGroup = require('../validations/group');
let crypto = require('crypto');
let uuid = require('node-uuid');

module.exports = function(router) {
  router.get('/groups', function *(next) {
    let userId = this.state.user.email;
    let user = yield this.r.table('users').get(userId);
    if (!user) {
      this.status = 404;
      this.body = {ok: false, message: 'Invalid user id'};
      return;
    }
    this.body = {
      ok: true,
      groups: user.groups
    };
  });

  router.post('/groups', validateGroup(), function *(next) {
    let userId = this.state.user.email;
    let group = this.request.body;
    group.registertoken = crypto.randomBytes(8).toString('hex');
    group.id = uuid.v4();

    let result = yield this.r.table('users').get(userId).update({
      groups: this.r.row('groups').default([]).append(group)
    });

    if (result.errors > 0) {
      this.status = 500;
      this.body = {ok: false, message: result.first_error.split(':')[0]};
      return;
    }

    group.ok = true;
    this.body = group;
  });

  router.delete('/groups/:id', function *(next) {
    let userId = this.state.user.email;
    let groupId = this.params.id;

    let result = yield this.r.table('users').get(userId).update({
      groups: this.r.row('groups')
        .default([])
        .filter(item => item('id').ne(groupId))
    });

    if (result.errors > 0) {
      this.status = 500;
      this.body = {ok: false, message: result.first_error.split(':')[0]};
      return;
    }

    if (result.unchanged > 0) {
      this.status = 404;
      this.body = {ok: false, message: 'No group with this id'};
      return;
    }

    this.body = {ok: true};

  });

  router.get('/groups/:id', function *(next) {
    let userId = this.state.user.email;
    let groupId = this.params.id;

    let result = yield this.r.table('users').get(userId)('groups').default([]).filter({
      id: groupId
    });

    if (result.length === 0) {
      this.status = 404;
      this.body = {ok: false, message: 'No group with this id'};
    }

    let response = result[0];
    response.ok = true;
    this.body = response;
  })
};
