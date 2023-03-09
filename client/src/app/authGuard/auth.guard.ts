import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router:Router){
    }

    canActivate(route: ActivatedRouteSnapshot, state:RouterStateSnapshot): boolean {
      let url: string = state.url;
      return this.verifyLogin(url);
    }

    verifyLogin(url) : boolean {
      if(!this.isLoggedIn()){
        this.router.navigateByUrl('users/login');
        return false;
      }
      else if(this.isLoggedIn()){
        return true;
      }
    }

      public isLoggedIn(): boolean{
        let status = false;
        if(localStorage.getItem('token') == "undefined" || localStorage.getItem('token') == null){
          status = false;
        }
        else{
          status = true;
        }
        return status;
      }

}
