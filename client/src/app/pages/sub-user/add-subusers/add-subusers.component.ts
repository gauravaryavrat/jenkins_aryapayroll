import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubUserService } from '../sub-user-service/sub-user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import { RolesService } from '../../roles/roles-service/roles.service';

@Component({
  selector: 'app-add-subusers',
  templateUrl: './add-subusers.component.html',
  styleUrls: ['./add-subusers.component.scss']
})
export class AddSubusersComponent implements OnInit {

  subUserForm: FormGroup;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  genderList:String[]= ['Male','Female','Others','N/A'];
  rolePermissionInfo: any;

  constructor(public fb: FormBuilder, private api:SubUserService,private ngZone: NgZone, private router: Router,
    private spinner: NgxSpinnerService,
    private util: UtilitiesService,
    private roleAPI: RolesService
     ) { }

  ngOnInit() {
    this.subUserFormValidation();
    this.rolePermission();
  }

  //method for sub user validation
  subUserFormValidation(){
    try{
    this.subUserForm = this.fb.group({
    name:new FormControl('',Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z ]*$'),
    ])),
      phone: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15),
        Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
      ])),
      email:new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
      ])),
      roleId: new FormControl('',Validators.required)
    })
  }
  catch(err){
    console.log(err);
  }
}

//Method for submit add new sub-users form data an
subUserFormData(){
  try{
    let cleansubUserForm = this.util.cleanFormLevelOne(this.subUserForm);
    this.spinner.show();
    this.api.addSubUsersData(cleansubUserForm.value).subscribe(data=>{
      if(data.status === "success"|| data.status === 200){
        this.successMessage = true ;
        this.errorMsg = false ;
        this.successMsg = data.message;
        this.spinner.hide();
        setTimeout(() => {
          this.handleErrroMessage();
          this.ngZone.run(()=>this.router.navigateByUrl('/pages/sub-user/show-subusers-list'));
        }, 7000);
      }
      else if(data.status == "error"){
        this.subUserForm.get('email').setValue('');
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        this.spinner.hide();
        setTimeout(()=> {
          this.handleErrroMessage();
        },2000)
      }
    })
  } catch(err){
    console.log(err);
  }

  }


//Property for show error message
validationMessage = {
  'name': [
    { type: 'required', message: 'Name is required' },
    { type: 'pattern', message: 'Not a valid name' }
  ],
  'email': [
    { type: 'required', message: 'Email is required' },
    { type: 'pattern', message: 'Enter a valid email' }
  ],
  'phone': [
    { type: 'required', message: 'Phone No. is required' },
    { type: 'minlength', message: 'Not a phone number ' },
    { type: 'maxlength', message: 'Phone no. is too large' },
    { type: 'pattern', message: 'Phone Number not valid' },
  ],
  'roleId': [
    { type: 'required', message: 'Role is required' },
  ],
}
// Error Handling Message
handleErrroMessage(){
  this.successMessage = false;
  this.errorMsg = false;
  this.successMsg = '';
  this.errMsg = '';
}

// roles permissions
rolePermission(){
  try {
    this.roleAPI.listAllRole().subscribe((data)=>{
      if(data.status === 'success'){
        this.rolePermissionInfo = data.data;
      }
    })
  } catch (error) {
    console.log(error);
  }
}

}


