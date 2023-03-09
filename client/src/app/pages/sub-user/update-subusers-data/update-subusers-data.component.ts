import { Component, OnInit, NgZone } from '@angular/core';
import { SubUserService } from '../sub-user-service/sub-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-subusers-data',
  templateUrl: './update-subusers-data.component.html',
  styleUrls: ['./update-subusers-data.component.scss']
})
export class UpdateSubusersDataComponent implements OnInit {

  snapshotParam:any = String;
  updateSubUserForm: FormGroup;
  successMsg:any= String;
  successMessage: Boolean = false;
  errMsg:any= String;
  errorMsg: Boolean = false;
  genderList: String[]= ['Male','Female','Others','N/A']



  constructor(private route: ActivatedRoute, private api: SubUserService, public fb: FormBuilder, private ngZone: NgZone,
    private router: Router,
    private util: UtilitiesService) { }

  ngOnInit() {
    this.snapshotParam = this.route.snapshot.paramMap.get("subUserId");
    this.subUserFormValidation();
    this.getSubUserExistingData();
  }


  //method for sub user validation
  subUserFormValidation() {
    try {
      this.updateSubUserForm = this.fb.group({
        name: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z ]*$'),
        ])),
        phone: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
        ])),
        birthday: new FormControl(),
        zipCode: new FormControl('', Validators.compose([
          Validators.pattern('^[0-9]{6}(?:-[0-9]{4})?$'),
        ])),
        gender: new FormControl(),
        email:new FormControl(),
      })
    }
    catch (err) {
      console.log(err);
    }
  }

//Method for Update Sub-User Details
  updateSubUserFormData() {
    try {
      let cleanUpdateSubUserForm = this.util.cleanFormLevelOne(this.updateSubUserForm);
      this.api.submitUpdateSubUserData(cleanUpdateSubUserForm.value, this.snapshotParam).subscribe((data) => {
        if (data.status === "success" || data.status === 200) {
          this.getSubUserExistingData();
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() => {
            this.handleErrors();
            this.router.navigateByUrl('/pages/sub-user/show-subusers-list');
          }, 2000);
        }
        else if (data.status == "error") {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(() => {
            this.handleErrors();
          },3000)
        }
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for Get existing data load on the form(autofill form)
  getSubUserExistingData() {
    try {
      this.api.subUserDetails(this.snapshotParam).subscribe(data => {
        if (data.status === "success") {
              this.updateSubUserForm = this.fb.group({
                name: new FormControl(data.data.name, Validators.compose([
                  Validators.required,
                  Validators.pattern('^[a-zA-Z ]*$'),
                ])),
                phone: new FormControl(data.data.phone, Validators.compose([
                  Validators.required,
                  Validators.minLength(10),
                  Validators.maxLength(15),
                  Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
                ])),
                birthday: new FormControl(),
                zipCode: new FormControl('', Validators.compose([
                  Validators.pattern('^[0-9]{6}(?:-[0-9]{4})?$'),
                ])),
                gender: new FormControl(),
                email:new FormControl(data.data.email),
              })
        }
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  //Property for show error message
  validationMessage = {
    'name': [
      { type: 'required', message: 'Name Is Required'},
      { type: 'pattern', message: 'Not a valid' }
    ],
    'phone': [
      { type: 'required', message: 'Phone Number Is Required'},
      { type: 'minlength', message: 'Not a phone number ' },
      { type: 'maxlength', message: 'Phone no. is too large' },
      { type: 'pattern', message: 'Phone Number not valid' },
    ],
    'zipCode': [
      { type: 'pattern', message: 'ZIP code not valid' },
    ],
  }

  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}

}
