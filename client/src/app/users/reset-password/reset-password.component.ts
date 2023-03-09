import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  snapshotParam: string;
  passwordFlag: boolean = true;
  errMessage: string;
  successFlag:Boolean = false;
  successMsg:string;

  constructor(private route: ActivatedRoute, private apiService: ApiService, public fb: FormBuilder, private ngZone: NgZone, private router: Router) { }

  ngOnInit() {    //Calling validation method
    this.submitResetPassword();
    this.snapshotParam = this.route.snapshot.paramMap.get("token");
  }


  submitResetPassword() { //create method for validation
    try {
      this.resetPasswordForm = this.fb.group({
        password: new FormControl('', Validators.compose([
          Validators.minLength(8),
          Validators.maxLength(12),
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/) //this is for the letters both uppercase & lowercase and numbers.
        ])),
        passwordConfirmation: new FormControl('', Validators.compose([
          Validators.required,
          RxwebValidators.compare({ fieldName: 'password' })
        ]))
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  resetPassword() {  //Create method for submit form value and calling API.
    try {
      if (this.resetPasswordForm.valid) {
        this.apiService.submitResetPasswordData(this.resetPasswordForm.value, this.snapshotParam).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            this.successFlag = true;
            this.successMsg = data.message;
            this.passwordFlag = true;
            setTimeout(() => {
              this.ngZone.run(() => this.router.navigateByUrl('/users/login'));
            }, 1000)
          } else if (data.status === "error" || data.status === 404) {
            this.passwordFlag = false;
            this.errMessage = data.message;
          }
        })
      }
    }
    catch (err) {
      console.log(err);
    }

  }

  //For print Validation and error message.
  validationErrorMessage = {
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: `Password must be at least 8 characters long` },
      { type: 'maxlength', message: `Password should not be greater than 12 characters` },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, one digit and one special characters' }
    ],
    'passwordConfirmation': [
      { type: 'required', message: 'Confirm Password is required' },
      { type: 'compare', message: 'Passwords do not match' },
    ],
  }
}
