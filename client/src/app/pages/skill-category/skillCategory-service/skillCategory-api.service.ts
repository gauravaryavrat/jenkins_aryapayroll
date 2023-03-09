import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SkillName } from  '../../../auth/skillName'; 
import { UpdateSkill } from '../../../auth/UpdateSkill';
 
@Injectable({
  providedIn: 'root'
})

export class skillCategoryApiService {

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

  /**Create Method for Get skill Category list */
  skillCategoryData(): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/category/list-skill-category/${companyId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  // List Individual category list
  skillCategoryDetails(skillCategoryId:string){
    try{
      let apiURL = `${this.endpoint}/category/skill-category-details/${skillCategoryId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      ) 
    } catch(err){
      console.log(err);
    }
  }

/**Create Method for add Job Category  */
  addSkillCategoy(data:SkillName): Observable<any> {
    try{
      const companyId = sessionStorage.getItem("companyId");
      const userId = localStorage.getItem('token');
      let apiURL = `${this.endpoint}/category/add-skill-category/${companyId}/${userId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /** Method for Update skill Category   */
  updateSkillCategory(data:UpdateSkill, skillCategoryId:string):Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      const userId = localStorage.getItem('token');
      let apiURL = `${this.endpoint}/category/update-skill-category/${skillCategoryId}/${companyId}/${userId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /**Method for delete (remove) skill Category*/
  removeData(skillCategoryId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/category/delete-skill-category/${skillCategoryId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )   
    }
    catch(err){
      console.log(err);
    }
  }
}
