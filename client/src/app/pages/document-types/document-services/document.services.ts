import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Document } from '../../../auth/document'; 
import { DocUpdate } from '../../../auth/docUpdate';
 
@Injectable({
  providedIn: 'root'
})

export class DocumentServices {

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

  /**Create Method for Get document List  */
    documentData(): Observable<any> {
    try {
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/list-all-document-types/${companyId}`;
       return this.http.get(apiURL).pipe(
         catchError(this.errorMgmt)
      )
    }
    catch (err) {
      console.log(err);
    }
    }

// Individual document type details
documentTypeDetails(documentTypeId: string): Observable<any> {
  try {
    let apiURL = `${this.endpoint}/company/document-type-details/${documentTypeId}`;
     return this.http.get(apiURL).pipe(
       catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
  }

  /** Method for get data from company for document */
    addDocumentSubmit(data:Document, companyId:String): Observable<any> {
    try{
      const companyId = sessionStorage.getItem("companyId");
      let apiURL = `${this.endpoint}/company/add-document-types/${companyId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
    }

  /** Method for Update document type  */
    updateDocument(data:DocUpdate, companyId: string, documentTypeId:string,):Observable<any> {
    try {
      let apiURL = `${this.endpoint}/company/update-document-types/${companyId}/${documentTypeId}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
    }
    catch(err) {
      console.log(err);
    }
  }

  /**Method for delete (remove) document type */
  removeDocument(documentTypeId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/company/delete-document-type/${documentTypeId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )   
    }
    catch(err){
      console.log(err);
    }
  }
}
