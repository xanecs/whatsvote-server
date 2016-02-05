'use strict';
let config = require('./config.json');
let koa = require('koa');
let bodyParser = require('koa-bodyparser');
let koaStatic = require('koa-static');
let koaRouter = require('koa-router');
let koaJwt = require('koa-jwt');
let koaCors = require('koa-cors');
let koaValidation = require('koa-validation');
let http = require('http');
let rethinkdb = require('rethinkdbdash');
let mqtt = require('mqtt');
let whatsappApi = require('./api/whatsapp');
let Mailgun = require('mailgun');

let r = rethinkdb(config.rethinkdb);

let mqttClient = mqtt.connect(config.mqtt);
mqttClient.on('connect', () => {
  mqttClient.subscribe('whatsapp/incoming');
  mqttClient.subscribe('whatsapp/iq');
  console.log('Connected to mqtt');
});

let mailgun = new Mailgun.Mailgun(config.mailgun);

let whatsapp = new whatsappApi(r, mqttClient);

let app = koa();

app.use(koaCors());
app.use(bodyParser());

app.use(function *(next) {
  this.r = r;
  this.whatsapp = whatsapp;
  yield next;
});

app.use(koaJwt({secret: config.jwt.secret}).unless({path: ['/auth/signup', '/auth/login', /^\/polls\/vote\/[^\/]+\/[^\/]+$/, /^\/results\/[^\/]+$/, /^\/auth\/verify\/[^\/]+\/[^\/]+$/]}));
app.use(koaValidation());

let router = koaRouter();

require('./routes/auth')(router, mailgun);
require('./routes/user')(router, mailgun);
require('./routes/groups')(router, mailgun);
require('./routes/poll')(router, mailgun);

app.use(router.routes());
app.use(router.allowedMethods());

r.connect
app.listen(config.koa.port);
