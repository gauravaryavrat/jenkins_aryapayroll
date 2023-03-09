import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LeaveAction } from 'src/app/auth/leaveAction';
import { dataUri } from '@rxweb/reactive-form-validators';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

 /** Here we provide daynamic environment value from environment */
 endpoint: string = environment.apiBaseUrl;
 headers = new HttpHeaders().set('Contant-Type', 'application/x-www-form-urlencoded');//Set a Header Value.

 constructor(private http: HttpClient) { }

/**Create method for manage errors when request and return response from the server*/
errorMgmt(error: HttpErrorResponse) {
 try {
   let errorMessage = '';
   /** Handle client side error */
   if (error.error instanceof ErrorEvent) {
     errorMessage = error.error.message;
   }
   /** Handle server side error */
   else {
     errorMessage = `Error code:${error.status}\nMessage:${errorMessage}`;
   }
   console.log(errorMessage);
   return throwError(errorMessage);
 }
 catch (err) {
   console.log(err.message);
 }
}

// List All Employees Leave in an individual Company

dateWiseAllLeaveList(date): Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/all-employee/particular-date-leaves/${companyId}/${date}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// Leave Action
leaveActionTaken(data: LeaveAction,userId,leaveId): Observable<any>{
  try {
    let apiURL = `${this.endpoint}/user/activity-leave/${userId}/${leaveId}`;
    return this.http.post(apiURL, data).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}

// Get Individaul Employee Leave List
dateWiseLeaveList(userId,date): Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/particular-date-leaves/${userId}/${date}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

}