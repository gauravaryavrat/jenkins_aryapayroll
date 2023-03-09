import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Leave } from '../../../auth/leave';
import { Update } from '../../../auth/updateLeave';
import { environment } from '../../../../environments/environment';
import { MarkAbsentComponent } from '../../leave-management/manage-leave-status/mark-absent/mark-absent.component';

@Injectable({
  providedIn: 'root'
})

export class LeaveApiService {

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

  /**Create Method for Get Company List  */
  getListData(): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/list-leave-types/${companyId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  /** Method for get data from company for leave */
  leaveDataSubmit(data:Leave): Observable<any> {
    try{
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/add-leave-type/${companyId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /** Method for Update leave type  */
  updateLeaveType(data:Update, leaveTypeId:string,):Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/update-leave-type/${companyId}/${leaveTypeId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

   /** Getting Individual List Leave Type  */
   leaveTypeDetails(leaveTypeId:string,):Observable<any> {
    try {
      let apiURL = `${this.endpoint}/company/leave-type-details/${leaveTypeId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  /**Method for delete (remove) Leave type */
  removeData(leaveTypeId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/company/delete-leave-type/${leaveTypeId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err){
      console.log(err);
    }
  }

  // Mark Employee Absent
  markEmployeeAbsent(data: MarkAbsentComponent,userId): Observable<any>{
    try{
      let apiURL = `${this.endpoint}/employee/mark-leave-absent-or-sandwich/${userId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    } catch(err){
      console.log(err);
    }
  }
}
