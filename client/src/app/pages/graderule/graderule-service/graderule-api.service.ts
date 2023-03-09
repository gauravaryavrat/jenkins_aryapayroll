import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { gradeuRule } from  '../../../auth/gradeRule';
import { UpdateGraderuleComponent } from '../update-graderule/update-graderule.component';
import {updateGadeRuleData } from '../../../auth/updateGadeRuleData';
import { gradeuRulePaymentHead } from '../../../auth/gradeuRulePaymentHead';
import { updatePaymentHead } from 'src/app/auth/updatePaymentHead';

@Injectable({
  providedIn: 'root'
})

export class GraderuleApiService {

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

getGradeRule(data:gradeuRule, percentOfValue):Observable<any>{
  try{

    if(percentOfValue === 'basicSalary'){
      data.paymentHead.fixedPercentOfName = percentOfValue;
      data.paymentHead.fixedPercentOfId = '';
    } else {
      data.paymentHead.fixedPercentOfId = percentOfValue;
      data.paymentHead.fixedPercentOfName = '';
    }

    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/add-grade-rule/${companyId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

updateGadeRule(data:updateGadeRuleData,gradeRuleId:string):Observable<any>{
  try{
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/update-grade-rule/${companyId}/${gradeRuleId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Update Payment Heads
updatePaymentHeads(data,paymentHeadsId:string,gradeRuleId:string,percentOfValue,percent):Observable<any>{
  try{
    if(percent){
      if(percentOfValue === 'basicSalary'){
        data.fixedPercentOfName = percentOfValue;
      } else {
        data.fixedPercentOfId = percentOfValue;
      }
    }
    let apiURL = `${this.endpoint}/company/update-grade-rule-payment-head/${paymentHeadsId}/${gradeRuleId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
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

getGradeRuleList():Observable<any>{
  try{
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/company/list-all-grade-rule/${companyId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

existingData(gradeRuleId:string):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/grade-rule-list/${gradeRuleId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

removeData(gradeRuleId:string):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/delete-grade-rule/${gradeRuleId}`;
    return this.http.delete(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err){
    console.log(err);
  }
}

// Manage Payment heads start here

companyPaymentHeads(paymentHeadId:string):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/payment-head-details/${paymentHeadId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// addgrad rule payment heads
addGradules(data,gradeRuleId:string,percentOfValue):Observable<any>{
  try{
    if(percentOfValue === 'basicSalary'){
      data.paymentHead.fixedPercentOfName = percentOfValue;
    } else {
      data.paymentHead.fixedPercentOfId = percentOfValue;
    }
    console.log(data);
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/company/add-grade-rule-payment-head/${gradeRuleId}/${companyId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    );
  }catch(err){
    console.log(err);
  }
}

removeGradeData(paymentHeadsId:string,gradeRuleId:string):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/delete-grade-rule-payment-head/${paymentHeadsId}/${gradeRuleId}`;
    return this.http.delete(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }
  catch(err){
    console.log(err);
  }
}

// Get Fixed Payment Heads
fixedPaymentHeads(gradeRuleId):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/company/fixed-payment-heads/${gradeRuleId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Get Filter payment heads
filterPaymentHeads(gradeRuleId): Observable<any>{
  try {
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/company/filter-payment-heads/${companyId}/${gradeRuleId}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  } catch (error) {
    console.log(error);
  }
}

}
