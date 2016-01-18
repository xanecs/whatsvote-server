import {Component} from 'angular2/core';
import {MATERIAL_DIRECTIVES} from 'ng2-material/all';
import {Router, RouterLink} from 'angular2/router';
import {Http} from 'angular2/http';
import {FORM_DIRECTIVES} from 'angular2/common';
import {UserService} from '../common/user';

@Component({
  selector: 'login',
  templateUrl: 'app/login/login.html',
  directives: [MATERIAL_DIRECTIVES, RouterLink, FORM_DIRECTIVES]
})
export class LoginComponent {
  constructor(public router: Router, public http: Http, public user: UserService) { }
  login(event, email, password) {
    event.preventDefault();
    this.user.login(email, password).then(() => {
      this.router.parent.navigateByUrl('/home');
    });
  }
}
