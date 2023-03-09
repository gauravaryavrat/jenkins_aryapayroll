import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BranchData } from 'src/app/auth/branch';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Department } from 'src/app/auth/department';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  endpoint: string = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Contant-Type', 'application/x-www-form-urlencoded');//Set a Header Value.

  constructor(private http: HttpClient) { }

  //Method For submit branch form data to the server
  submitBranchFormData(data: BranchData, companyParentId: String,countryName,stateName): Observable<any> {
    try {
      data.countryName = countryName;
      data.countryState = stateName;
      let apiUrl = `${this.endpoint}/company/add-branch/${companyParentId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err);
    }
  }

  //Method for get branch list Data
  getBranchListData(): Observable<any> {
    try {
      const companyParentId = sessionStorage.getItem("companyId");
      let apiUrl = `${this.endpoint}/company/branch-list/${companyParentId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err);
    }
  }

  //Method for Individual Branch Details
  getBranchDetails(branchId: String): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/company/branch-details/${branchId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err);
    }
  }

  //Method for submit updated branch data
  submitUpdatedData(data: BranchData, branchId: String): Observable<any> {
    try {
      const companyParentId = sessionStorage.getItem("companyId");
      let apiUrl = `${this.endpoint}/company/update-branch/${companyParentId}/${branchId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }

  }

  //Create method for manage errors when request and return response from the server
  errorMgmt(error: HttpErrorResponse) {
    try {
      let errorMessage = '';
      //Handle client side error
      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      }
      //Handle server side error
      else {
        errorMessage = `Error code:${error.status}\nMessage:${errorMessage}`;
      }
      console.log(errorMessage);
      return throwError(errorMessage);
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for delete branch
  removeData(branchId: String): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/company/delete-branch/${branchId}`;
      return this.http.delete(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err.message);
    }

  }

  //Method for add department
  submitDepartmentData(data: Department, branchId: String): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/branch/add-department/${branchId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

    //Method for add department
    updateDepartmentData(data: Department, branchId: String, departmentId:String): Observable<any> {
      try {
        let apiUrl = `${this.endpoint}/branch/update-department/${branchId}/${departmentId}`;
        return this.http.post(apiUrl, data).pipe(
          catchError(this.errorMgmt)
        )
      } catch (err) {
        console.log(err.message);
      }
    }


  //Method for get department list
  getDepartmentData(branchId:String):Observable<any>{
    try{
      let apiUrl = `${this.endpoint}/branch/list-department/${branchId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err);
    }
  }

  //Method for remove department
  removeDepartmentData(departmentId:String):Observable<any>{
    try{
      let apiUrl = `${this.endpoint}/branch/delete-department/${departmentId}`;
      return this.http.delete(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
  }


}
