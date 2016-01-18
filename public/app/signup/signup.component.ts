import {Component} from 'angular2/core';
import {MATERIAL_DIRECTIVES} from 'ng2-material/all';
import {Router, RouterLink} from 'angular2/router';
import {Http} from 'angular2/http';
import {FORM_DIRECTIVES} from 'angular2/common';
import {contentHeaders} from '../common/headers';

@Component({
  selector: 'signup',
  templateUrl: 'app/signup/signup.html',
  directives: [MATERIAL_DIRECTIVES, RouterLink, FORM_DIRECTIVES]
})
export class SignupComponent {
  constructor(public router: Router, public http: Http) { }

  signup(event, firstname, lastname, email, password) {
    event.preventDefault();
    let body = JSON.stringify({firstname, lastname, email, password});
    this.http.post(
      window.location.origin + '/signup',
      body,
      {headers: contentHeaders}
    ).subscribe(
      response => {
        this.router.parent.navigateByUrl('/login');
      },
      error => {
        alert(error.text());
        console.log(error.text);
      }
    )
  }
}
