import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {Department} from '../../../auth/DepartmentData';
import { UpdateDepatment } from '../../../auth/UpdateDepatment';


@Injectable({
  providedIn: 'root'
})

export class DepartmentApiService {

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

getDepartment(): Observable<any> {
  try {
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/departments/list-all/${companyId}`;
     return this.http.get(apiURL).pipe(
       catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}

// Method ForIndividual List
getDepartmentDetails(departmentId: String): Observable<any> {
  try {
    
    let apiURL = `${this.endpoint}/branch/department-details/${departmentId}`;
     return this.http.get(apiURL).pipe(
       catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}

addDepatment(data:Department,branchId:string): Observable<any> {
  try{
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/branch/add-department/${branchId}/${companyId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err) {
    console.log(err);
  }
}


updateDepartment(data:UpdateDepatment,branchId:string,departmentId:string,):Observable<any> {
  try {
    let apiURL = `${this.endpoint}/branch/update-department/${branchId}/${departmentId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err) {
    console.log(err);
  }
}

removeData(departmentId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/branch/delete-department/${departmentId}`;
    return this.http.delete(apiURL).pipe(
      catchError(this.errorMgmt)
    )   
  }
  catch(err){
    console.log(err);
  }
}

DepartmentList():Observable<any>{
  try{
    const companyParentId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/branch-list/${companyParentId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}


}
