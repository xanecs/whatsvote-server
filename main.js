'use strict';
let config = require('./config.json');
let koa = require('koa');
let bodyParser = require('koa-bodyparser');
let koaStatic = require('koa-static');
let koaRouter = require('koa-router');
let koaJwt = require('koa-jwt');
let koaValidation = require('koa-validation');
let http = require('http');
let rethinkdb = require('rethinkdbdash');

let r = rethinkdb(config.rethinkdb);

let app = koa();

app.use(koaStatic('public'));
app.use(bodyParser());

app.use(function *(next) {
  this.r = r;
  yield next;
});

app.use(koaJwt({secret: config.jwt.secret}).unless({path: ['/signup', '/login']}));
app.use(koaValidation());

let router = koaRouter();

require('./routes/auth')(router);

require('./routes/user')(router);
router.get('/secret', function *(next) {
  this.body = 'Kittens';
});

app.use(router.routes());
app.use(router.allowedMethods());

r.connect
app.listen(config.koa.port);
