import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Payment } from  '../../../auth/payment'; 
import { UpdatePaymentHeadl } from '../../../auth/updatePaymentHeadl';
 
@Injectable({
  providedIn: 'root'
})

export class paymentHeadApiService {

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

/**get payment heads data  */
getPaymentHeadData():Observable<any>{
  try{
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/list-payment-heads/${companyId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Individual Payment Heads Details
paymentHeadDetails(paymentHeadId:string):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/payment-head-details/${paymentHeadId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

/** add payment heads */
addPaymentHeads(data:Payment):Observable<any>{
  try{
    const companyId = sessionStorage.getItem("companyId");
    let apiURL =`${this.endpoint}/company/add-payment-head/${companyId}`;
    return this.http.post(apiURL,data).pipe(
      
    )
  }catch(err){
    console.log(err);
  }
}

/**update payment heads */
updatePaymentHeads(data:UpdatePaymentHeadl,paymentHeadId:String):Observable<any>{
  try{
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/update-payment-head/${companyId}/${paymentHeadId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

/**remove payment head */ 
removePaymentHead(paymentHeadId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/delete-payment-head/${paymentHeadId}`;
    return this.http.delete(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

}

