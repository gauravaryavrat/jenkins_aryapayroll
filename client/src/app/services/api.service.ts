import { Injectable } from '@angular/core';
import { Auth } from '../auth/auth';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError} from 'rxjs';
import { CompanyData } from '../auth/company-data';
import { environment } from '../../environments/environment';
import { AddCurrency } from '../auth/addCurrency';
import { UpdateProfile } from '../auth/updateProfile';
import { gradeuRule } from '../auth/gradeRule';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  endpoint: string = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');//Set a Header Value.
  constructor(private http: HttpClient) { }

  //Method for calling Register API
  submitSignup(data: Auth): Observable<any> {
    try {
      data.redirectUrl = `${environment.appBaseUrl}/users/generate-password`;   // Provide daynamic environment
      let apiURL = `${this.endpoint}/user/signup-via-email`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for calling login API
  submitLogin(data: Auth): Observable<any> {
    try {
      let apiURL = `${this.endpoint}/users/login`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for Submit password and calling API
  submitPasswordData(data: Auth, token: string): Observable<any> {
    try {
      data.token = token;
      let apiURL = `${this.endpoint}/user/confirm-registration`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for Submit forgot mail and calling API
  submitForgotPasswordData(data: Auth): Observable<any> {
    try {
      data.redirectUrl = `${environment.appBaseUrl}/users/reset-password`;
      let apiURL = `${this.endpoint}/user/password/request-reset`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for Submit password and calling API
  submitResetPasswordData(data: Auth, token: string): Observable<any> {
    try {
      data.token = token;
      let apiURL = `${this.endpoint}/user/password/set`;
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

//Method for logout
  submitLogout(): void {
    localStorage.setItem('token', "undefined");
    sessionStorage.removeItem('companyId');
  }

  //Method for submit company form Data and calling API
  submitCompanyData(data: CompanyData,countryName,stateName): Observable<any> {
    try {
      data.countryName = countryName;
      data.stateName = stateName;
      const parentUserId = localStorage.getItem("token");
      let apiURL = `${this.endpoint}/company/add-company/${parentUserId}`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

  // Method for add currency
  submitCurrency(data: AddCurrency): Observable<any>{
    try{
      const userId = localStorage.getItem('token');
      let apiURL = `${this.endpoint}/company/add-currency/${userId}`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch(err){
      console.log(err);
    }
  }

  // List Currency
  listCurrency(): Observable<any>{
    try{
      const userId = localStorage.getItem('token');
      let apiURL = `${this.endpoint}/company/list-currency/${userId}`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch(err){
      console.log(err);
    }
  }

  //Method for submit updated company form Data and calling API
  submitUpdateCompanyData(data: CompanyData,companyId: String): Observable<any> {
    try {
      const parentUserId = localStorage.getItem("token");
      let apiURL = `${this.endpoint}/company/update-company/${parentUserId}/${companyId}`;
      return this.http.post(apiURL, data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
  }

// Method for get data from server and show company list
  getListData(): Observable<any> {
    try {
      const parentUserId = localStorage.getItem("token");
      let apiURL = `${this.endpoint}/company/company-list/${parentUserId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
       )
    }
    catch (err) {
      console.log(err);
    }
  }

  // Method for get individual company data
  getIndividualData(companyId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/company/details/${companyId}`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err);
    }
  }

//Method for Delete data of company list
    removeData(companyId:String):Observable<any>{
      try{
        let apiURL = `${this.endpoint}/company/delete-company/${companyId}`;
        return this.http.delete(apiURL).pipe(
          catchError(this.errorMgmt)
        )
      }
      catch(err){
        console.log(err);
      }
    }

  // Upload Company Logo and Company Report Logo
  uploadCompanyLogo(data,type,isCompanyLogo): Observable<any>{
    try {
      let companyId = sessionStorage.getItem('companyId');
      const formData = new FormData();
      formData.append('companyLogo',data.get('companyLogo').value);
      let apiUrl = `${this.endpoint}/company/upload-logo/${companyId}/${type}/${isCompanyLogo}`;
      return this.http.post<any>(apiUrl, formData).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);

    }
  }

  // Method for get User Details
  getUserDetails():Observable<any>{
    try{
      let userId = localStorage.getItem('token');
      let apiURL = `${this.endpoint}/user-details/${userId}`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err);
    }
  }

  // Get Time Zones
  getTimeZone(): Observable<any>{
    try {
      let apiURL = `${this.endpoint}/availabe-timezone`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);
    }
  }

  // Update User Profile
  updateUSerProfile(data: UpdateProfile, timezone):Observable<any>{
    try {
      data.timeZone = timezone;
      let userId = localStorage.getItem('token');
      let apiUrl = `${this.endpoint}/user/update-details/${userId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);
    }
  }

  // Upload Profile Image
  uploadProfileImage(data,type,employeeId): Observable<any>{
    try {
      let companyId,userId;
      if(type === 'User'){
        userId = localStorage.getItem('token');
        companyId = undefined;
      } else if(type === 'Employee'){
        companyId = sessionStorage.getItem('companyId');
        userId = employeeId;
      }
      const formData = new FormData();
      formData.append('avatar',data.get('avatar').value);
      let apiUrl = `${this.endpoint}/user/upload-profile-picture/${userId}/${companyId}/${type}`;
      return this.http.post<any>(apiUrl, formData).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);

    }
  }

  // Get User Permission
  permissionDetails():Observable<any>{
    try {
      let userId = localStorage.getItem('token');
      let apiURL = `${this.endpoint}/user/permission-details/${userId}`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);
    }
  }


  // Get User Permission
  getCompanyReport(startDate, endDate, gradeuRuleId):Observable<any>{
    try {
      let companyId = localStorage.getItem('companyId');
      let apiURL = `${this.endpoint}/company/excel-compnay-details/${companyId}/${startDate}/${endDate}/${gradeuRuleId}`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch (error) {
      console.log(error);
    }
  }
}
