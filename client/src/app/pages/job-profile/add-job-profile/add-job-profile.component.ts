import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { JobProfileService } from '../job-profile-services/job-profile.service';
import { Router } from '@angular/router';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import { IfStmt } from '@angular/compiler';


@Component({
  selector: 'app-add-job-profile',
  templateUrl: './add-job-profile.component.html',
  styleUrls: ['./add-job-profile.component.scss']
})
export class AddJobProfileComponent implements OnInit {

  jobProfileForm: FormGroup;
  public payType = ['Daily Wages','Monthly Salary'];
  public successMsg:any = String;
  public successMessage: boolean = false;
  public errMsg:any = String;
  public errorMsg: boolean = false;
  permissionInfo: any;


  constructor(public fb: FormBuilder,
     private api: JobProfileService,
     public ngZone: NgZone,
     private router: Router,
     private util: UtilitiesService
     ) {this.isListAvaliable();}

  ngOnInit() {
    this.jobProfileFormValidation();
    this.permissionInfo = this.util.permissionRoleInfo;
    if(this.permissionInfo.search('Create JobProfile') === -1){
      this.jobProfileForm.disable();
    }
  }


  //Method  for form Validation
  jobProfileFormValidation() {
    this.jobProfileForm = this.fb.group({
      positionName: new FormControl('', Validators.required),
      payBasis: new FormControl('Daily Wages', Validators.required),
      isActive: new FormControl('true'),
    })
  }

  //Submit form Data
  jobProfileFormData() {
    try {
      let cleanJobPofieForm = this.util.cleanFormLevelOne(this.jobProfileForm);
      if (this.jobProfileForm.valid) {
        this.api.submitData(cleanJobPofieForm.value).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            this.successMessage = true;
            setTimeout(() => {
              this.handleErrors();
              this.ngZone.run(() => this.router.navigateByUrl('/pages/job-profile/job-profile-list'));
            }, 2000);
            this.errorMsg = false;
            this.successMsg = data.message;
          } else if (data.status === "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            }, 3000);
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  //For Showing errors
  validationMessage = {
    'positionName': [
      { type: 'required', message: 'Position Name is required' },
    ],
    'payBasis': [
      { type: 'required', message: 'Pay Basis is required' },
    ],
  }

  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}
isListAvaliable(){
  try{
    this.api.getJobProfileData().subscribe((data) =>{
      if(data.status === 'success'){
        if(data.data.length > 0 && this.util.jobProfileStatus !== 1){
          this.router.navigateByUrl("/pages/job-profile/job-profile-list");
          this.util.jobProfileStatus = 0;
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}

}
