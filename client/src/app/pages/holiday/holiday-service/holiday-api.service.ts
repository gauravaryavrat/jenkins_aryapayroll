import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Holiday } from '../../../auth/holiday';
import { updateHoliday } from '../../../auth/updateHoliday';
import { environment } from '../../../../environments/environment';
 
@Injectable({
  providedIn: 'root'
})

export class HolidayApiService {

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

  /**Create Method for Get Company Holiday  */
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

  // Get Individual Holiday List
  holidayDetails(holidayId:string): Observable<any> {
    try {
      
      let apiURL = `${this.endpoint}/company/holiday-details/${holidayId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  /** Method for get data from company for Holiday */
  addHoliday(data:Holiday): Observable<any> {
    try{
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/add-holiday/${companyId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /** Method for Update Holiday type  */
  updateHoliday(data:updateHoliday, holidayId:string,):Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/update-holiday/${companyId}/${holidayId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /**Method for delete (remove) Holiday type */
  removeData(holidayId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/company/delete-holiday/${holidayId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )   
    }
    catch(err){
      console.log(err);
    }
  }
}
