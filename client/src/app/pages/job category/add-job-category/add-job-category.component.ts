import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobCategoryApiService } from '../jobCategory-service/jobCategory-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
    selector: 'app-add-job-category',
    templateUrl: './add-job-category.component.html'
})

export class AddJobCategoryComponent implements OnInit {

    jobForm: FormGroup;
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    errorMsg: boolean = false;
    companyNameStore: any;
    showCard: any;
    companyNameId: any;
    public companyName:any= [];
    public companyId: any;
    permissionInfo: any;

    constructor(
      public fb: FormBuilder,
      private ngZone: NgZone,
      private router: Router,
      private api:JobCategoryApiService,
      private util: UtilitiesService){
        this.isListAvaliable();
      }

    ngOnInit() {
      this.companyDataValidate();
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create JobCategory') === -1){
        this.jobForm.disable();
      }
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

    jobFormData() {
      try{
        let cleanJobCategoryForm = this.util.cleanFormLevelOne(this.jobForm);
        if (this.jobForm.value) {
          this.api.addJobCategoy(cleanJobCategoryForm.value).subscribe((data) => {
            if(data.status === "success" || data.status === 200){
              this.successMessage = true ;
              this.errorMsg = false ;
              this.successMsg = data.message;
              setTimeout(() => {
                this.handleErrors();
                this.ngZone.run(()=>this.router.navigateByUrl('/pages/job-category/list-job-category'));
              }, 2000);
            }
            else if(data.status === "error"|| data.status === 404){
              this.errorMsg = true;
              this.successMessage = false;
              this.errMsg = data.message;
              setTimeout(() => {
                this.handleErrors();
              }, 3000);
            }
          })
        }
      } catch(err){
        console.log(err);
      }

    }

    validationMessage = {
      'categoryName':[{
        type: 'required', message: 'Category Name is Required'
      },],
    }

    handleErrors(){
      this.errorMsg = false;
      this.successMessage = false;
      this.errMsg = '';
      this.successMsg = '';
  }
  isListAvaliable(){
    try{
      this.api.getJobCategoryData().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.jobCategory.length > 0 && this.util.jobCategoryStatus !== 1){
            this.router.navigateByUrl("/pages/job-category/list-job-category");
            this.util.jobCategoryStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }
}