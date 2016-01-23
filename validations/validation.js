module.exports = function (options) {
  return function *(next) {
    yield this.validateBody(options);

    if (this.validationErrors) {
      this.status = 400;
      this.body = this.validationErrors;
    } else {
      yield next;
    }
  }
}
