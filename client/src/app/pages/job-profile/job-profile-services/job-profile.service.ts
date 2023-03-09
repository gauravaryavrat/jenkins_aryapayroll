import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { JobProfile } from 'src/app/auth/job-profile';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class JobProfileService {


  /** Here we provide daynamic environment value from environment */
  endpoint: string = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Contant-Type', 'application/x-www-form-urlencoded');//Set a Header Value.

  constructor(private http: HttpClient) { }



  //Method for submit job-profile data
  submitData(data: JobProfile): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiUrl = `${this.endpoint}/company/add-job-profile/${companyId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for get the job profile data
  getJobProfileData(): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiUrl = `${this.endpoint}/company/list-all-job-profiles/${companyId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  jobProfileDetails(jobProfileId:string): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/company/job-profile-details/${jobProfileId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }
  //Method for remove job profile
 removeProfileData(jobProfileId:String):Observable<any>{
   try{
     let api = `${this.endpoint}/company/delete-job-profile/${jobProfileId}`;
     return this.http.delete(api).pipe(
       catchError(this.errorMgmt)
     )
   }catch(err){
     console.log(err.message);
   }
 }


  //Create method for manage errors when request and return response from the server
  errorMgmt(error: HttpErrorResponse) {
    try {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        errorMessage = error.message;
      }
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

  //Method for submit updated form data
  updatedSubmitData(data: JobProfile, jobProfileId: String): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiUrl = `${this.endpoint}/company/update-job-profile/${companyId}/${jobProfileId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

}
