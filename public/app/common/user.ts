import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import {contentHeaders} from '../common/headers';
import {AuthHttp} from 'angular2-jwt';

export class User {
  constructor(
    public firstname: String,
    public lastname: String,
    public email: String
  ) {}
}

@Injectable()
export class UserService{
  user: User;

  constructor(private http: Http, private authHttp: AuthHttp) {}

  login(email, password) {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify({email, password});
      this.http.post(
        window.location.origin + '/login',
        body,
        {headers: contentHeaders}
      ).subscribe(response => {
        localStorage.setItem('jwt', response.json().token);
        let u = response.json().user;
        this.user = new User(u.firstname, u.lastname, u.email);
        resolve();
      }, reject);
    })
  }

  getUser() {
    if (this.user != undefined) return Promise.resolve(this.user);
    return new Promise((resolve, reject) => {
      this.authHttp.get('/user', {headers: contentHeaders})
        .subscribe(response => {
          console.log(response);
          let u = response.json().user;
          this.user = new User(u.firstname, u.lastname, u.email);
          console.log(this.user);
          resolve(this.user);
        }, reject);
    });
  }

  loggedIn() {
    return !!localStorage.getItem('jwt');
  }
}
