import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { JOB } from  '../../../auth/job'; 
import { UpdateJob } from '../../../auth/UpdateJob';
 
@Injectable({
  providedIn: 'root'
})

export class JobCategoryApiService {

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

  /**Create Method for Get Job Category list */
  getJobCategoryData(): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/list-job-categories/${companyId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  jobCategoryDetails(jobCategoryId:string): Observable<any> {
    try {
      let apiURL = `${this.endpoint}/company/job-category-details/${jobCategoryId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }
/**Create Method for add Job Category  */
  addJobCategoy(data:JOB): Observable<any> {
    try{
      const companyId = sessionStorage.getItem("companyId");
      console.log(companyId)
      let apiURL = `${this.endpoint}/company/add-job-category/${companyId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /** Method for Update Job Category   */
  updateJobCategory(data:UpdateJob, jobCategoryId:string,):Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/update-job-category/${companyId}/${jobCategoryId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /**Method for delete (remove) Job Category*/
  removeData(jobCategoryId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/company/delete-job-category/${jobCategoryId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )   
    }
    catch(err){
      console.log(err);
    }
  }
}
