import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class PayrollApiService {

  /** Here we provide daynamic environment value from environment */
  endpoint: string = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');//Set a Header Value.

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

getPayrolData(year,month):Observable<any>{
  try{
    let data = {
      year:year,
      month:month
    }
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/employee/salary-slip-list/${companyId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

getSalarySlip(salarySlipId:String): Observable<any> {
  try {
    let apiURL = `${this.endpoint}/employee/salary-slip-details/${salarySlipId}`;
    return this.http.get(apiURL).pipe(
    catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}

// Generate Salary Slip
generateSalarySlip(employeeIdArray,year,month): Observable<any>{
  try{
    let data = {
      year:year,
      month:month,
      employeeIdArray: employeeIdArray.employeeIdArray
    }
    const companyId = sessionStorage.getItem("companyId");
    let apiURL = `${this.endpoint}/employee/generate-salary-slip/${companyId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Filter Employee Data
filterSalarySlip(modeType,year,month):Observable<any>{
  try {
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/employee/filter-salary-slip/${companyId}/${modeType}/${year}/${month}`;
    return this.http.get(apiURL).pipe(
    catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}

// List Employee salary slip upto date
listSalarySlipDetails(month,year):Observable<any>{
  try {
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/employee/current-month-salary-slip/${companyId}/${year}/${month}`;
    return this.http.get(apiURL).pipe(
    catchError(this.errorMgmt)
    )
  } catch (error) {
    console.log(error);
  }
}

// Generate and Update the employee salary slip
monthlyGenerateSlip(data,month,year,type): Observable<any>{
try {
  let companyId = sessionStorage.getItem('companyId');
  let apiURL = `${this.endpoint}/employee/generate-current-month-slip/${companyId}/${year}/${month}/${type}`;
      return this.http.post(apiURL,data).pipe(
        catchError(this.errorMgmt)
      )
} catch (error) {
  console.log(error);
}
}

// Filter Employee Data
filterCurrentSalarySlip(modeType,year,month):Observable<any>{
  try {
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/employee/filter-current-month-salary-slip/${companyId}/${modeType}/${year}/${month}`;
    return this.http.get(apiURL).pipe(
    catchError(this.errorMgmt)
    )
  }
  catch (err) {
    console.log(err);
  }
}


// GENERATE BANK STATEMENT(SALARY UPLOAD) API
 bankStatement(data): Observable<any> {
   try {
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/company/bank-statement/${companyId}`;
    return this.http.post(apiURL, data).pipe(
    catchError(this.errorMgmt)
    )
   } catch (error) {
     console.log(error);
   }
 }


//  ADD CHEQUE DETAILS API
addChequeApi(salaryId,data):Observable<any> {
  try {
    let apiUrl = `${this.endpoint}/user/add-cheque-details/${salaryId}`;
    return this.http.post(apiUrl, data).pipe(
      catchError(this.errorMgmt)
      )
  } catch (error) {
    console.log(error);
  }
}


//  GET CHEQUE DETAILS API
getChequeApi(salaryId):Observable<any> {
  try {
    let apiUrl = `${this.endpoint}/user/get-cheque-details/${salaryId}`;
    return this.http.get(apiUrl).pipe(
      catchError(this.errorMgmt)
      )
  } catch (error) {
    console.log(error);
  }
}

//  GET CHEQUE DETAILS API
getCompanyDetails(companyId):Observable<any> {
  try {
    let apiUrl = `${this.endpoint}/company/details/${companyId}`;
    return this.http.get(apiUrl).pipe(
      catchError(this.errorMgmt)
      )
  } catch (error) {
    console.log(error);
  }
}


}
