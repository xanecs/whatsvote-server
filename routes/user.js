module.exports = function(router) {
  router.get('/user', function *(next) {
    this.status = 200;
    this.body = {
      ok: true,
      user: this.state.user
    };
  });
}
