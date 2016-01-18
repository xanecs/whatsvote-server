import {Component} from 'angular2/core';
import {RouteConfig} from 'angular2/router';
import {LoggedInRouterOutlet} from './router/loggedinrouteroutlet';
import {SignupComponent} from './signup/signup.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {MATERIAL_DIRECTIVES} from 'ng2-material/all';
import {User, UserService} from './common/user';

@Component({
  selector: 'whatsvote-app',
  templateUrl: 'app/app.html',
  directives: [MATERIAL_DIRECTIVES, LoggedInRouterOutlet]
})
@RouteConfig([
  {path: '/', redirectTo: ['/Signup']},
  {path: '/signup', component: SignupComponent, as: 'Signup'},
  {path: '/login', component: LoginComponent, as: 'Login'},
  {path: '/home', component: HomeComponent, as: 'Home'}
])
export class AppComponent {
  private user: User;
  constructor(private userService: UserService) {
    this.userService.getUser().then(user => {
      this.user = user;
      console.log(user);
    });
  }
}
