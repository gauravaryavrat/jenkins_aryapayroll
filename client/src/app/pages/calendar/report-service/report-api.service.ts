import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
 
@Injectable({
  providedIn: 'root'
})

export class ReportApiService {

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


getHoliday(): Observable<any> {
  try {
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/list-all-holidays/${companyId}`;
     return this.http.get(apiURL).pipe(
       catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}

userLeave(): Observable<any> {
  try {
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/attendance/${companyId}`;
     return this.http.get(apiURL).pipe(
       catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}


}
