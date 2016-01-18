import {Directive, Attribute, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {Router, RouterOutlet, ComponentInstruction} from 'angular2/router';

@Directive({
  selector: 'router-outlet'
})
export class LoggedInRouterOutlet extends RouterOutlet {
  private publicRoutes: any;
  constructor(
    elementRef: ElementRef,
    loader: DynamicComponentLoader,
    private parentRouter: Router,
    @Attribute('name') nameAttr: string) {

    super(elementRef, loader, parentRouter, nameAttr);
    this.publicRoutes = {
      '/login': true,
      '/signup': true
    };
  }

  activate(instruction: ComponentInstruction) {
    var url = this.parentRouter.lastNavigationAttempt;
    if(!this.publicRoutes[url] && !localStorage.getItem('jwt')) {
      this.parentRouter.navigateByUrl('/login');
    }
    return super.activate(instruction);
  }
}
