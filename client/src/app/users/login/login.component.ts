import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  flag: boolean = false;
  errorMessageServer: String;
  successMessage: String;
  loginFlag: boolean = false;
  successMsg: String;
  adminLogin: boolean = false;
  userLogin: boolean = false;

  ngOnInit() {    //Calling validation method
    this.loginData();
  }

  constructor(private api: ApiService,
     public fb: FormBuilder,
     private ngZone: NgZone,
     private router: Router,
     private permissionAPI: ApiService,
     private util: UtilitiesService
     ) { }

  //create method for validation
  loginData() {
    try {
      this.loginForm = this.fb.group({
        email:new FormControl(null, Validators.required),
        password:new FormControl(null,Validators.required),
      })
    }
    catch (err) {
      console.log(err.message);
    }
  }

  //Create method for submit form value and calling API.
  login() {
    try {
      if (this.loginForm.valid) {
        this.api.submitLogin(this.loginForm.value).subscribe((data) => {
          if (data.status === "success"|| data.status === 200) {
              localStorage.setItem('myVal',JSON.stringify(data.user.local.email));
              localStorage.setItem("token", data.user._id);
              this.loginFlag = true;
              this.successMessage = data.message;
              this.flag = false;
              this.getCompanyList();
              this.permissionAPI.permissionDetails().subscribe((data)=>{
                if(data.status === 'success'){
                  this.util.permissionRoleInfo = data.data;
                }
              })
          } else if (data.status === "error" || data.status === 404) {
            this.flag = true;
            this.errorMessageServer = data.message;
            this.loginFlag = false;
            setTimeout(() => {
              this.handleErrors();
            }, 4000);
          }
        });
      }
    }
    catch (err) {
      console.log(err.message);
    }
  }

  getCompanyList(){
   try{
    this.api.getListData().subscribe((data)=>{
      if(data.status === "success" || data.status === 200){
        if (data.company.length === 0) {
         this.ngZone.run(() => this.router.navigateByUrl('/pages/company/add-company'));
          sessionStorage.setItem('companyId',undefined);
        } else {
          sessionStorage.setItem("companyId",data.company[0]._id);
          localStorage.setItem('companyId',data.company[0]._id)
          setTimeout(() => {
            this.ngZone.run(() => this.router.navigateByUrl('/pages/dashboard/company-list'));
          }, 500)
        }
      }
    })
   }
   catch(err){
     console.log(err.message);
   }
  }

  //For print Validation and error message.
  validationErrorMessage = {
    'email': [
      { type: 'required', message: 'Email is required' },
    ],
    'password': [
      { type: 'required', message: 'Password is required' },
    ],
  }

  handleErrors(){
    try {
      this.loginFlag = false;
      this.successMessage = '';
      this.errorMessageServer = '';
      this.flag = false;
    } catch (error) {
      console.log(error);
    }
  }
}
