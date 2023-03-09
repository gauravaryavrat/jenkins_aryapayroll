import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JobCategoryApiService } from '../jobCategory-service/jobCategory-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-job-category',
  templateUrl: 'update-job-category.component.html'
})

export class UpdateJobCategoryComponent implements OnInit {

  jobForm: FormGroup;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  companyNameStore: [];
  showCard: any;
  companyNameId: any;
  public companyName: [];
  public companyId: any;
  public leaveTypeId: any;
  public jobCategoryId: any;
  // leaveData: Object[] = [];
  // leaveFormData: Object;
  public leaveData:any = [];
  public leaveFormData:any;
  permissionInfo: any;

  constructor(
    public fb: FormBuilder,
    private router: Router, private ngZone: NgZone, private route: ActivatedRoute, private api: JobCategoryApiService,
    private util: UtilitiesService) {
      this.jobCategoryId = this.route.snapshot.paramMap.get("jobCategoryId");
      this.util.moduleExists(this.jobCategoryId,'JobCategory').subscribe((data)=>{
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/job-category/list-job-category');
          }
        }
      })
    }

  ngOnInit() {
    this.companyDataValidate();
    this.getExistingData();
    this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Edit JobCategory') === -1){
        this.jobForm.disable();
      }
  }

  getExistingData() {
    this.api.jobCategoryDetails(this.jobCategoryId).subscribe(data => {
        this.leaveFormData = data.data;
            this.jobForm = this.fb.group({
              categoryName: new FormControl(this.leaveFormData.categoryName),
              isActive: new FormControl(this.leaveFormData.isActive)
            })
    });
  }

  companyDataValidate() {
    try {
      this.jobForm = this.fb.group({
          categoryName: new FormControl('',Validators.required),
          isActive: new FormControl(false)
        })
      }
    catch (err) {
      console.log(err);
    }
  }


  updateJobForm() {
    try {
      let cleanJobPofileUpdateForm = this.util.cleanFormLevelOne(this.jobForm);
      if (this.jobForm.value) {
        this.api.updateJobCategory(cleanJobPofileUpdateForm.value,  this.jobCategoryId).subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(()=> {
              this.handleErrors();
              this.ngZone.run(() => this.router.navigateByUrl('/pages/job-category/list-job-category'));
            },2000);
          } else if (data.status == "error") {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(()=> {
              this.handleErrors();
            },3000);
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  validationMessage = {
    'categoryName':[{
      type: 'required', message: 'Category Name is required'
    },],
  }
  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}
}