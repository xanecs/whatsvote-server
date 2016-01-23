'use strict';

module.exports = function(router) {
  router.get('/auth/me', function *(next) {
    this.status = 200;
    let response = this.state.user;
    response.ok = true;
    this.body = response;
  });
}
