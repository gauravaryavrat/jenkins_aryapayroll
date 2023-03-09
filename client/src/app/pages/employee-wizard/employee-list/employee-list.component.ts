import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { state } from '@angular/animations';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {

  employeeList = new Array();
  filterEmployeeDataMsg = '';
  setPasswordForm: any;
  passwordFlag: Boolean;
  errMessage: String;
  successFlag: Boolean;
  successMsg: String;
  employeeId: String;
  minPasswordLength: number = 8;
  maxPasswordLength: number = 14;
  companyTlList: any;
  companyEmployeeTlList: any;
  assignTlForm: any;
  status = "Active";
  employeeLabelName = 'Active Employees';
  activeStatus = 'Inactive';
  url: any;
  userAvatar: any;
  filterEmployeeList = [];
  statusStatus = false;
  permissionInfo: any;

  constructor(public fb: FormBuilder,
    private api: EmployeeService,
    public ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private uploadAvatarAPI: ApiService,
    private util: UtilitiesService
    ) { }

  ngOnInit() {
    this.assignTLForm();
    this.getEmployeeListData();
    this.passwordFormValidation();
    this.getTlList();
    this.userProfileForm();
    this.permissionInfo = this.util.permissionRoleInfo;

  }

  updateFunction(){
    try {
      if(this.permissionInfo.search('Create Employees') === -1){
        (document.getElementById('updateEmployeePermission')as HTMLAnchorElement).classList.add('disabled');
      } else {
        (document.getElementById('updateEmployeePermission')as HTMLAnchorElement).classList.remove('disabled');
      }
    } catch (error) {
      console.log(error);
    }
  }

  getEmployeeListData() {
    try {
      this.api.getEmployeeList(this.status).subscribe(data => {
          if (data.status === "success") {
            if(data.data.length === 0){
              if(this.status === 'Active'){
                (document.getElementById('employeeStatus')as HTMLInputElement).value = "Inactive";
                (document.getElementById('filterClick')as HTMLElement).click();
              } else if(this.status === 'Inactive'){
                this.api.employeeCount().subscribe((data)=>{
                  if(data.status === 'success'){
                    if(data.data === 0){
                      this.router.navigateByUrl("/pages/employee-wizard/employee-profile");
                    } else {
                      this.filterEmployeeDataMsg = 'No Data Found';
                      this.employeeList = [];
                      this.filterEmployeeList = [];
                    }
                  }
                })
              }
            } else {
              this.employeeList = data.data;
              this.filterEmployeeList = data.data;
              this.filterEmployeeDataMsg = '';
            }
        }
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  passwordFormValidation() {
    try {
      this.setPasswordForm = this.fb.group({
        password: new FormControl(null, Validators.compose([
          Validators.minLength(8),
          Validators.maxLength(14),
          Validators.required,
          Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8}$') //this is for the letters both uppercase & lowercase and numbers.
        ])),
        passwordConfirmation: new FormControl(null, Validators.compose([
          Validators.required,
          RxwebValidators.compare({ fieldName: 'password' })
        ]))
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  onSelect(value: String, type) {
    try {
      this.employeeId = value;
      if(type === 'Assign'){
        this.resetModal('Assign');
        if(this.companyTlList.length === 0){
          setTimeout(()=>{
          (document.getElementById('dismissTLModal')as HTMLElement).click();
          },0)
          Swal.fire('Add TL/Manager First');
        }
      } else if(type === 'setPassword'){
        this.resetModal('setPassword');
      } else if(type === 'UnAssign'){
        this.employeeTlList();
      }
    } catch (err) {
      console.log(err.message);
    }

  }

  setPasswordFormData() {
    try {
      if (this.setPasswordForm.valid) {
        this.api.setPassword(this.setPasswordForm.value, this.employeeId).subscribe(data => {
          if (data.status === "success" || data.status === 200) {
            this.successFlag = true;
            this.successMsg = data.message;
            this.passwordFlag = false;
            setTimeout(() => {
              this.ngZone.run(() => this.router.navigateByUrl('/pages/employee-wizard/employee-list'));
              this.handleErrroMessage();
              (document.getElementById('dismissSetPassword')as HTMLElement).click();
            }, 2000)
          } else if (data.status === "error" || data.status === 404) {
            this.passwordFlag = true;
            this.successFlag = false;
            this.errMessage = data.message;
            setTimeout(()=>{
              this.handleErrroMessage();
              (document.getElementById('dismissSetPassword')as HTMLElement).click();
            },3000)
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  //For resetFunctionality of employee fields
  resetFunctionality(){
    (document.getElementById('listEmployee') as HTMLInputElement).value = "";
    (document.getElementById('employeeStatus') as HTMLInputElement).value = "Active";
    this.status = 'Active';
    this.activeStatus = 'Inactive';
    this.filterEmployeeDataMsg = '';
    this.statusStatus = false;
    this.getEmployeeListData();
  }

  // filterFunctionality of employee fields list
  filterFunctionality(){
    try{

      let employeeId = (document.getElementById('listEmployee') as HTMLInputElement).value;
      let status = (document.getElementById('employeeStatus') as HTMLInputElement).value;

      if(employeeId.length != 0){
        status = '';
        this.filterEmployeeDetails(employeeId);
      }
      if(status === "Active"){
        this.status = 'Active';
        this.activeStatus = 'Inactive';
        this.employeeLabelName = 'Active Employees';
        this.getEmployeeListData();
      } else if(status === 'Inactive'){
        this.status = 'Inactive';
        this.activeStatus = 'Active';
        this.employeeLabelName = 'Inactive Employees';
        this.getEmployeeListData();
      }

    }catch(err){
      console.log(err);
    }

  }

  //For print Validation and error message.
  validationErrorMessage = {
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: `Password must be at least ${this.minPasswordLength} characters long` },
      { type: 'maxlength', message: `Password should not be greater than ${this.maxPasswordLength} characters` },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, one digit and one special characters' }
    ],
    'passwordConfirmation': [
      { type: 'required', message: 'Confirm Password is required' },
      { type: 'compare', message: 'Passwords do not match' },
    ],
  }

  // Company Tl List
  getTlList(){
    try{
      this.api.getTlList().subscribe((data)=>{
        if(data.status === 'success'){
          this.companyTlList = data.data;
        }
      })
    } catch(err){
      console.log(err);
    }
  }

// Assign Tl list form
assignTLForm(){
  try{
    this.assignTlForm = this.fb.group({
      parentIdsData: new FormGroup({
        userId: new FormControl(''),
        parentUserId: new FormControl('',Validators.required)
      })
    })
  } catch(err){
    console.log(err);
  }
}

assignTLValidation = {
  'parentUserId': [
    { type: 'required', message: 'TL/Manager Name is Required' }
  ]
}

// Assign And Unassign TL ID
actionOnTl(tlId,type){
try{
  if(type === 'Assign'){
    this.assignTlForm.get('parentIdsData.userId').setValue(this.employeeId);
    this.assignTlForm.get('parentIdsData.parentUserId').setValue(tlId);
  }
} catch(err){
  console.log(err);
}
}

// Submit Assign TL Form
assignTl(){
  try{
      this.api.assignTl(this.assignTlForm.value,this.employeeId).subscribe((data)=>{
        if(data.status === "success"){
          this.successFlag = true;
          this.successMsg = data.message;
          this.passwordFlag = false;
          setTimeout(() => {
            this.ngZone.run(() => this.router.navigateByUrl('/pages/employee-wizard/employee-list'));
            (document.getElementById('dismissTLModal')as HTMLElement).click();
            this.handleErrroMessage();
          }, 2000)
        } else if(data.status === 'error'){
          this.passwordFlag = true;
          this.successFlag = false;
          this.errMessage = data.message;
          setTimeout(()=>{
            (document.getElementById('dismissTLModal')as HTMLElement).click();
            this.handleErrroMessage();
          },3000)
        }
      })
  }catch(err){
    console.log(err);
  }
}

// Error Handling Message
handleErrroMessage(){
  this.successFlag = false;
  this.passwordFlag = false;
  this.successMsg = '';
  this.errMessage = '';
}

resetModal(type){
  try{
    if(type === 'Assign'){
      this.assignTlForm.reset();
    } else if(type === 'setPassword'){
      this.setPasswordForm.reset();
    }
  }catch(err){
    console.log(err);
  }
}

// Unassign TL
unassignTL(tlId){
  try{
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You want to UnAssign TL/Manager",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
      allowOutsideClick: false,
    }as any).then((result) => {
      if (result.value) {
        this.api.unassignTl(this.employeeId,tlId).subscribe((data)=>{
          if(data.status === "success"){
        swalWithBootstrapButtons.fire(
          'Deleted!',
          data.message,
          'success'
        )
        setTimeout(()=>{
          (document.getElementById('dismissUnAssignTLModal') as HTMLElement).click();
        },0)
          }
      })
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          "Didn't UnAssign TL/Manager",
          'error'
        )
      }
    })
  }catch(err){
    console.log(err);
  }
}

//Employee TL List
employeeTlList(){
  try{
    this.api.employeeTlList(this.employeeId).subscribe((data)=>{
      if(data.status === 'success'){
        if(data.data.parentUsersIds.length === 0){
          setTimeout(()=>{
            (document.getElementById('dismissUnAssignTLModal') as HTMLElement).click();
          },0)
          Swal.fire('Nothing to UnAssign');
        } else {
          this.companyEmployeeTlList = data.data.parentUsersIds;
        }
      }
    })
  } catch(err){
    console.log(err);
  }
}

// Change Status
changeStatus(){
  try{
    (document.getElementById('listEmployee') as HTMLInputElement).value = "";
  } catch(err){
    console.log(err);
  }
}

// Get Employee Details
filterEmployeeDetails(employeeId){
  try{
    this.api.filterEmployeeList(employeeId).subscribe((data)=>{
      if(data.status === 'success'){
        this.employeeList = [];
        this.employeeList.push(data.data);
      }
    })
  } catch(err){
    console.log(err);
  }
}

statusConfirmationMessage(value: String){
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  swalWithBootstrapButtons.fire({
    title: 'Are you sure?',
    text: `You want to ${this.activeStatus} the employee status`,
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    reverseButtons: true,
    allowOutsideClick: false,
  }as any).then((result) => {
    if (result.value) {
      this.api.updateEmployeeStatus(value,this.activeStatus).subscribe((data)=>{
        if(data.status === "success"){
      swalWithBootstrapButtons.fire(
        'Employee Status!',
        data.message,
        'success'
      )
      this.filterFunctionality();
        }
    })
    } else if (
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        "Employee Status didn't changed",
        'error'
      )
    }
  })
}

onSelectFile(event,employeeId) {
  if (event.target.files && event.target.files[0]) {
    var reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]); // read file as data url

    reader.onload = (event: any) => { // called once readAsDataURL is completed
      for(var i=0; i<this.employeeList.length; i++){
        if(this.employeeList[i]._id == employeeId){
          this.url = this.employeeList[i].avatar;
          this.employeeList[i].avatar = event.target.result;
          break;
        }
      }
    }
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.userAvatar.get('avatar').setValue(file);
      // Open Modal
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You want to change your profile picture",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        reverseButtons: true,
        allowOutsideClick: false,
      }as any).then((result) => {
        if (result.value) {
        this.uploadAvatarAPI.uploadProfileImage(this.userAvatar,'Employee',employeeId).subscribe((data)=>{
          if(data.status === 'success'){
            swalWithBootstrapButtons.fire(
              'Uploaded!',
              data.message,
              'success'
            )
          }
        })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your profile not changed',
            'error'
          )
          for(var i = 0; i<this.employeeList.length;i++){
            if(this.employeeList[i]._id == employeeId){
              this.employeeList[i].avatar = this.url;
              break;
            }
          }
        }
      })

    }
  }
}

// Profile Image Form
userProfileForm(){
  try {
    this.userAvatar = this.fb.group({
      avatar: ['']
    })
  } catch (error) {
    console.log(error);
  }
}

// Update the filter functionality
employeeFilter(){
  try {
    if((document.getElementById('listEmployee')as HTMLInputElement).value.length !==0){
      this.statusStatus = true;
    } else {
      this.statusStatus = false;
    }
  } catch (error) {
    console.log(error);
  }
}


}



