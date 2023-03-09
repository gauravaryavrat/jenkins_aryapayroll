import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
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

  //Method for get rules list for create, edit and delete
  getRolesListData(): Observable<any>{
    try {
      const apiUrl = `${this.endpoint}/user/role-list/`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method to Add Role
  addRole(data): Observable<any> {
    try {
      const userId = localStorage.getItem('token');
      let apiUrl = `${this.endpoint}/user/add-role/${userId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {

    }
  }

  //Method for get all role list
  listAllRole(): Observable<any>{
    try {
      let userId = localStorage.getItem('token');
      const apiUrl = `${this.endpoint}/user/all-role-list/${userId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for get individaul role list
  listIndividualRole(roleId): Observable<any>{
    try {
      const apiUrl = `${this.endpoint}/user/individaul-role-list/${roleId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method to Update Role
  updateRole(data,roleId): Observable<any> {
    try {
      const userId = localStorage.getItem('token');
      let apiUrl = `${this.endpoint}/user/update-role/${userId}/${roleId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {

    }
  }

  //Method for get individaul permission list
  listIndividualPermissions(roleId): Observable<any>{
    try {
      const apiUrl = `${this.endpoint}/user/individaul-permissions-list/${roleId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  // Update Role Permissions
  updateRolePermissions(data,roleId): Observable<any>{
    try {
      const userId = localStorage.getItem('token');
      let apiUrl = `${this.endpoint}/user/update-role-permission/${userId}/${roleId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Permission
  deletePermission(roleId,permissionId): Observable<any>{
    try {
      let apiURL = `${this.endpoint}/user/delete-permission/${permissionId}/${roleId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error)
    }
  }

}
