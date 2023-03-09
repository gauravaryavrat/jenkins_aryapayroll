import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Employee } from 'src/app/auth/employee';
import { Address } from 'src/app/auth/employee-address';
import { Educational } from 'src/app/auth/educational';
import { EmployeeBio } from 'src/app/auth/employeeBio';
import { BankDetails } from '../../../auth/BankDetails';
import { AddExprience } from '../../../auth/addExprience';
import { Auth } from 'src/app/auth/auth';
import { UpdateAddess } from '../../../auth/updateAddess';
import { AddFamily } from '../../../auth/addFamily';
import { UpdateEducation } from '../../../auth/educationUpdate';
import { UpdateExprience} from '../../../auth/updateExprience';
import { PayrollData } from '../../../auth/payrollData';
import { LanguageSkill } from '../../../auth/languageSkill';
import { updateLanguageSkill } from '../../../auth/updateLanguageSkills'
import { AddLeaveSettings } from 'src/app/auth/addLeaveSettings';
import { AssignTl } from 'src/app/auth/assignTl';
import { IdentityProofs } from '../../../auth/identityProofs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  endpoint: String = environment.apiBaseUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');//Set a Header Value.

  constructor(private http: HttpClient) { }

  //Get Company List Data
  getCompanyData(): Observable<any> {
    try {
      const parentUserId = localStorage.getItem("token");
      let apiUrl = `${this.endpoint}/company/company-list/${parentUserId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for get branch list Data
  getBranchListData(companyParentId: String): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/company/branch-list/${companyParentId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err);
    }
  }

  //Method for get job profile data
  getJobProfileListData(companyId:String):Observable<any>{
    try{
      let api = `${this.endpoint}/company/list-all-job-profiles/${companyId}`;
      return this.http.get(api).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
  }

  //Method for get department list
  getDepartmentData(branchId: String): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/branch/list-department/${branchId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err);
    }
  }

  //Method for get the job profile data
  getJobProfileData(companyId: String): Observable<any> {
    try {
      let apiUrl = `${this.endpoint}/company/list-all-job-profiles/${companyId}`;
      return this.http.get(apiUrl).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method to Add Employee form Data
  submitData(data: Employee): Observable<any> {
    try {
      data.isActive = true;
      const parentUserId = localStorage.getItem('token');
      let apiUrl = `${this.endpoint}/user/add-employee/${parentUserId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err) {

    }
  }

  // Method For Update Employee Profile with basic details
  updateEmployeeBasicDetails(data:Employee, employeeId:String): Observable<any>{
    try{
      const parentUserId = localStorage.getItem('token');
      let apiUrl = `${this.endpoint}/employee/update-employee-profile/${employeeId}/${parentUserId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    } catch(err){
      return err;
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

  //Method for submit address
  submitAddress(data:Address,employeeId:String):Observable<any>{
    try{
      let apiUrl = `${this.endpoint}/employee/add-employee-address/${employeeId}`;
      return this.http.post(apiUrl, data).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
  }

  /**add employe bank details */
  employBank(data:BankDetails,employeeId:String):Observable<any>{
    try{
      let apiUrl =`${this.endpoint}/employee/add-employee-bank-details/${employeeId}`;
      return this.http.post(apiUrl,data).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
  }

  /** add work experience  */
  experiAdd(data:AddExprience,employeeId:String):Observable<any>{
  try{
    let apiUrl =`${this.endpoint}/employee/add-employee-work-experiences/${employeeId}`;
    return this.http.post(apiUrl,data).pipe(
      catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
  }

  /** add family members of employee */
  addFamilyMember(data:AddFamily,employeeId:String):Observable<any>{
    try{
      let apiUrl = `${this.endpoint}/employee/add-employee-family/${employeeId}`;
      return this.http.post(apiUrl,data).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err);
    }
  }


//Method for submit educational details
submitEducationalData(data:Educational,employeeId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/add-employee-educational-details/${employeeId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
}

//Method for submit employee bio details
submitBioData(data:EmployeeBio,employeeId:String):Observable<any>{
    try{
      let api = `${this.endpoint}/employee/add-employee-bio/${employeeId}`;
      return this.http.post( api, data).pipe(
        catchError(this.errorMgmt)
      )
    }
  catch(err){
    console.log(err.message);
  }
}

// Update the Employee Bio Profile
updateBio(data:EmployeeBio,employeeId:String): Observable<any>{
  try{
    let api = `${this.endpoint}/employee/update-bio/${employeeId}`;
      return this.http.post( api, data).pipe(
        catchError(this.errorMgmt)
      )
  } catch(err){
    console.log(err);
  }
}

//Method for get employee list
getEmployeeList(status):Observable<any>{
  try{
    const companyId = sessionStorage.getItem("companyId");
    let api =`${this.endpoint}/company/list-employees/${companyId}/${status}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

//Method for filter employee list
filterEmployeeList(employeeId):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-details/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

//Method for set Password of employee
setPassword(data:Auth,employeeId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/user/employee-set-password/${employeeId}`;
    return this.http.post(api, data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

/** List employee address */
oldAddress(employeeId:String):Observable<any> {
    try{
      let apiURL = `${this.endpoint}/employee/list-addresses/${employeeId}`;
      return this.http.get(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch(err){
        console.log(err.message);
    }
}

/** Update address employee*/
updateAddess(data:UpdateAddess,employeeId:String,addressId:String):Observable<any> {
    try{
      let api = `${this.endpoint}/employee/update-address/${employeeId}/${addressId}`;
      return this.http.post(api,data).pipe(
        catchError(this.errorMgmt)
      )
    }catch(err){
      console.log(err.message);
    }
}

/**Delete employee address */
deleteAddress(employeeId:String,addressId:String):Observable<any>{
    try{
      let apiURL = `${this.endpoint}/employee/delete-address/${employeeId}/${addressId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )
    } catch (err){
      console.log(err.message);
    }
}

//Method for get employee family-details
getFamilyData(employeeId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/list-family-details/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

//Method for remove employee family details
removeFamilyDetails(employeeId:String,familyId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/delete-family-detail/${employeeId}/${familyId}`;
    return this.http.delete(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

//Method for update employee family details
updateFamilyDetails(data:AddFamily, employeeId:String,familyId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/update-family-details/${employeeId}/${familyId}`;
    return this.http.post(api, data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

/** list of education details */
removeEducation(employeeId:String,educationId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/delete-educational-detail/${employeeId}/${educationId}`;
    return this.http.delete(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

educationDetails(employeeId:String):Observable<any> {
  try{
    let api = `${this.endpoint}/employee/list-educational-details/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

updateEducation(data:UpdateEducation,employeeId:String,educationId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/update-educational-detail/${employeeId}/${educationId}`;
    return this.http.post(api,data).pipe(
      catchError(this.errorMgmt))
    }catch(err){
      console.log(err.message);
    }
}

/**work Exprience start */
removeExprience(employeeId:String,workExperienceId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/delete-work-experience/${employeeId}/${workExperienceId}`;
    return this.http.delete(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

workExprience(employeeId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/list-work-experiences/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err.message);
  }
}

updateWokExprience(data:UpdateExprience,employeeId:String,workExperienceId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/update-work-experiences/${employeeId}/${workExperienceId}`;
    return this.http.post(api,data).pipe(
      catchError(this.errorMgmt))
  }catch(err){
    console.log(err.message);
  }
}

/** Bank details */
bankDetailsList(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-bank-details/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch (err){
    console.log(err.message);
  }
}

/** submit payroll setting data  */
payrollDataSubmit(data:PayrollData,employeeId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/add-payroll-setting/${employeeId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Update Payroll Settings
updatePayrollSettings(data:PayrollData,employeeId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/update-payroll-setting/${employeeId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

payollDataList(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-payroll-settings/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Grade Rule List
gradeRuleList():Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let api =`${this.endpoint}/company/list-all-grade-rule/${companyId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err)
  }
}

/** bio list api configation */
bioDataList(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-bio/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

/** language skill api configation  */
addLanguageSkill(data:LanguageSkill,employeeId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/add-employee-language-skills/${employeeId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}


updateLanguageSkill(data:updateLanguageSkill,employeeId:String,languageId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/update-language-skill/${employeeId}/${languageId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}




LanguageSkill(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-language-skills/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}



employeeList(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-details/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Employee Leave Settings Details

leaveEmployeeDataList(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-leave-settings/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Add Leave Settings

addLeaveSettings(data: AddLeaveSettings,employeeId:String):Observable<any>{
  try{
    let userId = localStorage.getItem('token');
    let apiURL =`${this.endpoint}/employee/add-leave-settings/${employeeId}/${userId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Update Leave Settings
updateLeaveSettings(data:AddLeaveSettings, employeeId:String,leaveSettingId:String):Observable<any>{
  try{
    console.log(data);
    let userId = localStorage.getItem('token');
    let apiURL =`${this.endpoint}/employee/update-leave-settings/${leaveSettingId}/${employeeId}/${userId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Employee Id Proofs List Details
employeeIdProofsDataList(employeeId:String):Observable<any>{
  try{
    let api =`${this.endpoint}/employee/list-identity-proofs/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}

// Add Employee Identity Proofs  Details

addEmployeeIdProofs(data:IdentityProofs,employeeId:String):Observable<any>{
  try{
    let apiURL = `${this.endpoint}/employee/add-employee-identity-proofs/${employeeId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}
// Update Id Proofs Settings
updateIdProofsSettings(data:IdentityProofs, employeeId:String,proofId:String):Observable<any>{
  try{

    let apiURL =`${this.endpoint}/employee/update-identity-proofs/${employeeId}/${proofId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}
//Method for Delete employee Id Proofs details
removeIdProofsDetails(employeeId:String,proofId:String):Observable<any>{
  try{
    let api = `${this.endpoint}/employee/delete-identity-proof/${employeeId}/${proofId}`;
    return this.http.delete(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err.message);
  }
}


// Get company TL/Manager List
getTlList():Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let api =`${this.endpoint}/company/get-tl-list/${companyId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err)
  }
}

// Assign Tl to Employee
assignTl(data: AssignTl, userId): Observable<any>{
  try{
    let apiURL =`${this.endpoint}/user/assign-parentId/${userId}`;
    return this.http.post(apiURL,data).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Employee TL List
employeeTlList(employeeId): Observable<any>{
  try{
    let api =`${this.endpoint}/employee/parent-child-ids/${employeeId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  } catch(err){
    console.log(err);
  }
}

// Unassign TL/Manager
unassignTl(userId, parentUserId): Observable<any>{
  try{
    let api =`${this.endpoint}/user/unassign-parentId/${userId}/${parentUserId}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// update employee status
updateEmployeeStatus(employeeId,status): Observable<any>{
  try{
    let api =`${this.endpoint}/company/employee-status/${employeeId}/${status}`;
    return this.http.get(api).pipe(
      catchError(this.errorMgmt)
    )
  }catch(err){
    console.log(err);
  }
}

// Get Employee Documnet which is not yet uploaded
uploadedDocuments(employeeId): Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let api =`${this.endpoint}/employee/uploaded-documnets/${employeeId}/${companyId}`;
      return this.http.get(api).pipe(
        catchError(this.errorMgmt)
      )
  } catch(err){
    console.log(err);
  }
}

// Upload Employee Documents
uploadDocuments(data,documentTypeId,employeeId,type): Observable<any>{
  try{
      const formData = new FormData();
      formData.append('document',data.get('document').value);
      let userId = localStorage.getItem('token');
      let companyId = sessionStorage.getItem('companyId')
      let apiUrl = `${this.endpoint}/user/upload-documents/${userId}/${documentTypeId}/${employeeId}/${type}/${companyId}`;
      return this.http.post<any>(apiUrl, formData).pipe(
        catchError(this.errorMgmt)
      )
  }catch(err){
    console.log(err);
  }
}

// Get uploaded document by employee
employeeDocumentList(employeeId): Observable<any>{
  try{
    let api =`${this.endpoint}/user/list-documents/${employeeId}`;
      return this.http.get(api).pipe(
        catchError(this.errorMgmt)
      )
  }catch(err){
    console.log(err);
  }
}

// Delete Employee Document
deleteEmployeeDocument(documentTypeId,employeeId): Observable<any>{
  try{
    let apiURL = `${this.endpoint}/user/remove-documnets/${documentTypeId}/${employeeId}`;
      return this.http.delete(apiURL).pipe(
        catchError(this.errorMgmt)
      )
  }catch(err){
    console.log(err);
  }
}

// Get employee count
employeeCount(): Observable<any>{
  try{
    let companyId = sessionStorage.getItem('companyId');
    let api =`${this.endpoint}/company/employee-count/${companyId}`;
      return this.http.get(api).pipe(
        catchError(this.errorMgmt)
      )
  }catch(err){
    console.log(err);
  }
}

// Is Admin
isAdmin():Observable<any>{
  try {
    let userId = localStorage.getItem('token');
    let api =`${this.endpoint}/user/is-admin/${userId}`;
      return this.http.get(api).pipe(
        catchError(this.errorMgmt)
      )
  } catch (error) {
    console.log(error);
  }
}

}