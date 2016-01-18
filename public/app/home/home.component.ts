import {Component} from 'angular2/core';
import {MATERIAL_DIRECTIVES} from 'ng2-material/all';
import {Router, RouterLink} from 'angular2/router';
import {Http} from 'angular2/http';
import {FORM_DIRECTIVES} from 'angular2/common';
import {contentHeaders} from '../common/headers';


@Component({
  selector: 'home',
  templateUrl: 'app/home/home.html',
  directives: [MATERIAL_DIRECTIVES, RouterLink, FORM_DIRECTIVES]
})
export class HomeComponent {

}
