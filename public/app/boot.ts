import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app.component';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {provide} from 'angular2/core';
import {AuthConfig, AuthHttp} from 'angular2-jwt';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {FORM_PROVIDERS} from 'angular2/common';
import {UserService} from './common/user';

bootstrap(AppComponent, [
  FORM_PROVIDERS,
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  UserService,
  provide(LocationStrategy, {useClass: HashLocationStrategy}),
  provide(AuthHttp, {
    useFactory: (http) => {
      return new AuthHttp(new AuthConfig({
        tokenName: 'jwt'
      }), http);
    },
    deps: [Http]
  })
]);
