import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {
timeZone = 'Asia/Kolkata';
departmentSatus: any;
branchesSatus: any;
leaveStatus: any;
jobProfileStatus: any;
jobCategoryStatus: any;
skillCategoryStatus: any;
documentTypeStatus: any;
holidaysStatus: any;
paymentHeadStatus: any;
gradeRuleStatus: any;
permissionRoleInfo: any;

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

  /**
   * Clean Form or clear unwanted values
   */
public cleanFormLevelTwo(formGroup: FormGroup) {
  try{
    let cleaningStuff = formGroup.value;

    for(var key in cleaningStuff){
          if(typeof(cleaningStuff[key]) === 'object'){
          for(var nestedKey in cleaningStuff[key]){
              if(typeof(cleaningStuff[key][nestedKey]) === 'object'){
              for(var nestedNestedKey in cleaningStuff[key][nestedKey]){
                if(cleaningStuff[key][nestedKey][nestedNestedKey] === null){
                  formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey).setValue('');
                } else if(cleaningStuff[key][nestedKey][nestedNestedKey] === true || cleaningStuff[key][nestedKey][nestedNestedKey] === false) {
                  // Do Nothing
                } else {
                  formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey).setValue(formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey).value.trim());
                }
              }
            } else{
              if(cleaningStuff[key][nestedKey] === null){
                formGroup.get(key+'.'+nestedKey).setValue('');
            } else if(cleaningStuff[key][nestedKey] === true || cleaningStuff[key][nestedKey] === false) {
              // DO Nothhing
            } else {
              formGroup.get(key+'.'+nestedKey).setValue(formGroup.get(key+'.'+nestedKey).value.trim());
            }
            }
        }
      } else{
        if(cleaningStuff[key] === null){
          formGroup.get(key).setValue('');
        } else if (cleaningStuff[key] === true || cleaningStuff[key] === false){
          // Do Nothing
        } else {
          formGroup.get(key).setValue(formGroup.get(key).value.trim());
        }
      }

  }
  return formGroup;
  } catch(err){
    console.log(err);
  }

}

public cleanFormLevelOne(formGroup: FormGroup) {
  try{
      let cleaningStuff = formGroup.value;
  for(var key in cleaningStuff){
    if(typeof(cleaningStuff[key]) === 'object'){
      for(var nestedKey in cleaningStuff[key]){
        if(cleaningStuff[key][nestedKey] === null){
          formGroup.get(key+'.'+nestedKey).setValue('');
      } else if(cleaningStuff[key][nestedKey] === true || cleaningStuff[key][nestedKey] === false) {
        // DO Nothing
      } else {
        formGroup.get(key+'.'+nestedKey).setValue(formGroup.get(key+'.'+nestedKey).value.trim());
      }
    }
  } else {
    if(cleaningStuff[key] === null){
      formGroup.get(key).setValue('');
    } else if(cleaningStuff[key] === true || cleaningStuff[key] === false) {
      // DO Nothing
    } else {
      formGroup.get(key).setValue(formGroup.get(key).value.trim());

    }
  }
}
  return formGroup;
  } catch(err){
    console.log(err);
  }

}

 // Clean Form or clear unwanted values
 public cleanFormLevelThree(formGroup: FormGroup) {
  try{
    let cleaningStuff = formGroup.value;
    for(var key in cleaningStuff){
          if(typeof(cleaningStuff[key]) === 'object'){
          for(var nestedKey in cleaningStuff[key]){
              if(typeof(cleaningStuff[key][nestedKey]) === 'object'){
              for(var nestedNestedKey in cleaningStuff[key][nestedKey]){
                if(typeof(cleaningStuff[key][nestedKey][nestedNestedKey]) === 'object'){
                  for(var nestedNestedNestedKey in cleaningStuff[key][nestedKey][nestedNestedKey]){
                    if(cleaningStuff[key][nestedKey][nestedNestedKey][nestedNestedNestedKey] === null){
                      formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey+'.'+nestedNestedNestedKey).setValue('');
                    } else if(cleaningStuff[key][nestedKey][nestedNestedKey][nestedNestedNestedKey] === true || cleaningStuff[key][nestedKey][nestedNestedKey][nestedNestedNestedKey] === false) {
                      // Do Nothing
                    } else {
                      formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey+'.'+nestedNestedNestedKey).setValue(formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey+'.'+nestedNestedNestedKey).value.trim());
                    }
                  }
                } else {
                  if(cleaningStuff[key][nestedKey][nestedNestedKey] === null){
                    formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey).setValue('');
                  } else if(cleaningStuff[key][nestedKey][nestedNestedKey] === true || cleaningStuff[key][nestedKey][nestedNestedKey] === false) {
                    // Do Nothing
                  } else {
                    formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey).setValue(formGroup.get(key+'.'+nestedKey+'.'+nestedNestedKey).value.trim());
                  }
                }
              }
            } else{
              if(cleaningStuff[key][nestedKey] === null){
                formGroup.get(key+'.'+nestedKey).setValue('');
            } else if(cleaningStuff[key][nestedKey] === true || cleaningStuff[key][nestedKey] === false) {
              // DO Nothhing
            } else {
              formGroup.get(key+'.'+nestedKey).setValue(formGroup.get(key+'.'+nestedKey).value.trim());
            }
            }
        }
      } else{
        if(cleaningStuff[key] === null){
          formGroup.get(key).setValue('');
        } else if (cleaningStuff[key] === true || cleaningStuff[key] === false){
          // Do Nothing
        } else {
          formGroup.get(key).setValue(formGroup.get(key).value.trim());
        }
      }

  }
  return formGroup;
  } catch(err){
    console.log(err);
  }

}

// Check Module Exists
moduleExists(moduleId,type): Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let apiURL = `${this.endpoint}/company/check-module-exist/${moduleId}/${companyId}/${type}`;
    return this.http.get(apiURL).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}
}
