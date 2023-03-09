import { Injectable } from '@angular/core';
import { HttpHeaders,HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SubUserData } from 'src/app/auth/sub-user';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubUserService {

  endpoint: string = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');//Set a Header Value.
  constructor(private http: HttpClient) { }

//Method for add new sub-users and submit sub-users form data

addSubUsersData(data:SubUserData):Observable<any>{
  try{
    data.redirectUrl = `${environment.appBaseUrl}/users/generate-password`;
    const parentUserId = localStorage.getItem("token");
    let apiURL = `${this.endpoint}/user/add-subuser/${parentUserId}`;
    return this.http.post(apiURL, data).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err){
    console.log(err);
  }
}

// Method for get data from server and show company list
getSubUsersListData(): Observable<any> {
try {
  const parentUserId = localStorage.getItem("token");
  let apiURL = `${this.endpoint}/user/list-subusers/${parentUserId}`;
   return this.http.get(apiURL).pipe(
     catchError(this.errorMgmt)
   )
}
catch (err) {
  console.log(err);
}
}

//Method for Delete data of company list
removeSubUsersData(subUserId:String):Observable<any>{
  try{
    const parentUserId = localStorage.getItem("token");
    let apiURL = `${this.endpoint}/user/delete-subuser/${parentUserId}/${subUserId}`;
    return this.http.delete(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err){
    console.log(err);
  }
}

//Method for submit updated subusres details  Data and calling API
submitUpdateSubUserData(data:SubUserData,subUserId: String): Observable<any> {
  try {
    const parentUserId = localStorage.getItem("token");
    let apiURL = `${this.endpoint}/user/update-subuser/${parentUserId}/${subUserId}`;
    return this.http.post(apiURL, data).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
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

// Sub User Details
subUserDetails(userId):Observable<any>{
  try {
  let apiURL = `${this.endpoint}/user/subuser-details/${userId}`;
   return this.http.get(apiURL).pipe(
     catchError(this.errorMgmt)
   )
  } catch (error) {
    console.log(error);
  }
}

}
