import { Component, OnInit, NgZone } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  signupFlag: boolean = true;
  errMessage: string;
  successFlag:boolean = true;
  successMessage:string;

  ngOnInit() { //Calling validation method
    this.submitData();
  }

  constructor(private api: ApiService, public fb: FormBuilder, private ngZone: NgZone,
     private router: Router,
     private spinner: NgxSpinnerService) { }

  //Create method for validation
  submitData() {
    try {
      this.registerForm = this.fb.group({
        email: new FormControl(null, Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])),
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  //Create method for submit input value and calling API
  register() {
    try {
      this.spinner.show();
      //console.log(this.registerForm.value);
      this.api.submitSignup(this.registerForm.value).subscribe((data) => {
        //Manage server status when giving error
        if (data.status === "error" || data.status === 404) {
          this.signupFlag = false;
          this.errMessage = data.message;
          this.successFlag = true;
          this.spinner.hide();
          setTimeout(() => {
            this.handleErrors();
          }, 5000);
        }
        //Manage server status when giving success
        else if (data.status === "success" || data.status === 200) {
          this.successFlag = false;
          this.successMessage = data.message;
          this.signupFlag = true;
          this.spinner.hide();
          setTimeout(()=>{
            this.ngZone.run(() => this.router.navigateByUrl('/users/login'));
            this.handleErrors();
          },10000)
        }
      });
    }
    catch (err) {
      console.log(err);
    }

  }

  //For print validation and error message
  validationErrorMessage = {
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],

  }

  handleErrors(){
    try {
      this.signupFlag = false;
      this.errMessage = '';
      this.successFlag = true;
      this.successMessage = '';
    } catch (error) {
      console.log(error);
    }
  }
}
