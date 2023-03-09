import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { JobProfileService } from '../job-profile-services/job-profile.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-profile-data',
  templateUrl: './update-profile-data.component.html',
  styleUrls: ['./update-profile-data.component.scss']
})
export class UpdateProfileDataComponent implements OnInit {

  updateJobProfileForm: FormGroup;
  public jobProfileList: any;
  public snapShotParam: any = String;
  public profileData= new Array();
  public successMsg: any = String;
  public successMessage: boolean = false;
  public errMsg: any = String;
  public errorMsg: boolean = false;
  permissionInfo: any;

  constructor(public fb: FormBuilder, private api: JobProfileService, public ngZone: NgZone, private router: Router,
     private route: ActivatedRoute,
     private util: UtilitiesService) {
      this.snapShotParam = this.route.snapshot.paramMap.get("jobProfileId");
      this.util.moduleExists(this.snapShotParam,'JobProfile').subscribe((data)=>{
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/job-profile/job-profile-list');
          }
        }
      })
     }

  ngOnInit() {
    this.jobProfileFormValidation();
    this.UpdateJobProfileFormValidation();
    this.permissionInfo = this.util.permissionRoleInfo;
    if(this.permissionInfo.search('Edit JobProfile') === -1){
      this.updateJobProfileForm.disable();
    }
  }

//Method for validation
jobProfileFormValidation() {
  try{
        this.updateJobProfileForm = this.fb.group({
          positionName: new FormControl('',Validators.required),
          payBasis: new FormControl('',Validators.required),
          isActive: new FormControl('false'),
        })

  }catch(err){
    console.log(err.message)
  }
}
  //Method for validation
  UpdateJobProfileFormValidation() {
    try{
      this.api.jobProfileDetails(this.snapShotParam).subscribe((data) => {
        if (data.status === 'success' || data.status === 200) {
           this.jobProfileList = data.data;
          this.updateJobProfileForm = this.fb.group({
            positionName: new FormControl(this.jobProfileList.positionName,Validators.required),
            payBasis: new FormControl(this.jobProfileList.payBasis,Validators.required),
            isActive: new FormControl(this.jobProfileList.isActive),
          })
        }
      })

    }catch(err){
      console.log(err.message)
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


  //Method for submit updated form data
  updateJobProfileFormData() {
    try {
      let cleanJobProfileUpdateForm = this.util.cleanFormLevelOne(this.updateJobProfileForm)
      if (this.updateJobProfileForm.valid) {
        this.api.updatedSubmitData(cleanJobProfileUpdateForm.value, this.snapShotParam).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() => {
              this.ngZone.run(() => {
                this.handleErrors();
                this.router.navigateByUrl("/pages/job-profile/job-profile-list");
              })
            }, 2000);
          } else if (data.status === "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.ngZone.run(() => {
                this.handleErrors();
              })
            }, 3000);
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }
  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}
}
