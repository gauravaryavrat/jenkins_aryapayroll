import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { RxwebValidators, ReactiveFormConfig, pattern } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-generate-password',
  templateUrl: './generate-password.component.html',
  styleUrls: ['./generate-password.component.scss']
})
export class GeneratePasswordComponent implements OnInit {

  setPasswordForm: FormGroup;
  snapshotParam: string;
  passwordFlag: Boolean = true;
  errMessage: String;
  successFlag: Boolean = false;
  successMsg: String;

  constructor(private route: ActivatedRoute, private apiService: ApiService, public fb: FormBuilder, private ngZone: NgZone, private router: Router) { }

  ngOnInit() {  //Calling validation method
    this.submitPassword();
    this.snapshotParam = this.route.snapshot.paramMap.get("token");
    ReactiveFormConfig.set({ "validationMessage": { "compare": "Input does not match" } });
  }

  submitPassword() {   //create method for validation
    this.setPasswordForm = this.fb.group({
      password: new FormControl('', Validators.compose([
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.required,
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
      ])),
      passwordConfirmation: new FormControl('', Validators.compose([
        Validators.required,
        RxwebValidators.compare({ fieldName: 'password' })
      ]))
    });
  }

  setPassword() {  //Create method for submit form value and calling API.
    try {
      if (this.setPasswordForm.valid) {
        this.apiService.submitPasswordData(this.setPasswordForm.value, this.snapshotParam).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            this.successFlag = true;
            this.successMsg = data.message;
            this.passwordFlag = true;
            setTimeout(() => {
              this.ngZone.run(() => this.router.navigateByUrl('/users/login'));
            }, 1000)
          } else if (data.status == "error" || data.status === 404) {
            this.passwordFlag = false;
            this.errMessage = data.message;
            this.successFlag = false;
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
      { type: 'minlength', message: 'Password must be at least 8 characters long' },
      { type: 'maxlength', message: 'Password is too large(maximum length 12)' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, one digit and one special characters' }
    ],
    'passwordConfirmation': [
      { type: 'required', message: 'Confirm Password is required' },
      { type: 'compare', message: 'Password not match' },
    ],
  }
}
