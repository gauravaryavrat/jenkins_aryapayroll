import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { throwError, Observable } from 'rxjs';
import { AddEarnedLeave } from '../../../../auth/addEarnedLeave'
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LeaveServicesService {

  /** Here we provide daynamic environment value from environment */
  endpoint: string = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');//Set a Header Value.

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

// Add Earned Leave Balance
addEarnedLeave(data: AddEarnedLeave,employeeId:String): Observable<any>{
  try{
    let userId = localStorage.getItem('token');
    let apiURL = `${this.endpoint}/employee/add-earned-leave/${employeeId}/${userId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// All Earned Leave List
listAllEarnedLeave(year: String, month: String): Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/employee/list-all-eraned-leave/${companyId}/${year}/${month}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// Filter Earned Leave Details
filterEarnedLeaveDetails(employeeId,year,month): Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/earned-leave-details/${employeeId}/${year}/${month}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Individual earned leave details for update earned leaves
existingEarnedLeaveDetails(earnedLeaveId,employeeId): Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/earned-leave-details/${earnedLeaveId}/${employeeId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// Submit Update Form Data
updateEarnedLeave(data: AddEarnedLeave, earnedLeaveId,employeeId): Observable<any>{
  try{
    let userId = localStorage.getItem('token');
    let apiURL = `${this.endpoint}/employee/update-earned-leave/${earnedLeaveId}/${employeeId}/${userId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// Earned leave history
fetchHistory(employeeId,year,month): Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/earned-leave-history/${employeeId}/${year}/${month}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// Delete Earned Leave
deleteEarnedLeave(employeeId,year,month,leaveCount): Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/delete-earned-leave/${employeeId}/${year}/${month}/${leaveCount}`;
    return this.http.delete(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err){
    console.log(err);
  }
}

}
