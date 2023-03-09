import { Component, OnInit,NgZone, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { skillCategoryApiService } from '../skillCategory-service/skillCategory-api.service';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { JobCategoryApiService } from '../../job category/jobCategory-service/jobCategory-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
    selector: 'app-add-skill-category',
    templateUrl: './add-skill-category.component.html'
})

export class AddSkillCategoryComponent implements OnInit {

    skillForm: FormGroup;
    successMsg:any= String;
    successMessage: boolean = false;
    errMsg:any= String;
    errorMsg: boolean = false;
    companyNameStore: any;
    showCard: any;
    companyListData: any = [];
    companyNameId: any;
    public companyName:any= [];
    public companyId: any;
    categoryList: any;
    demo = ['Akshay'];
  permissionInfo: any;

    constructor(private _api: ApiService,
      public fb: FormBuilder,
      private ngZone: NgZone,
      private router: Router,
      private api: skillCategoryApiService,
      private apiService: JobCategoryApiService,
      private util: UtilitiesService){
        this.isListAvaliable();
      }

    ngOnInit() {
      this.getCategoryList();
      this.companyDataValidate();
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create SkillCategory') === -1){
        this.skillForm.disable();
      }
    }

    companyDataValidate() {
      try {
        this.skillForm = this.fb.group({
          skillName: new FormControl('',Validators.required),
          categoryId: new FormControl('',Validators.required)
          })
        }
      catch (err) {
        console.log(err);
      }
    }

    companyValue() {
      this._api.getListData().subscribe(data =>{
        if(data.status == 'success' || data.status == 200) {
          this.companyNameStore = data.company;
        }
      })
    }

    getCategoryList() {
      try {
        this.apiService.getJobCategoryData().subscribe(data =>{
          this.categoryList = data.jobCategory;
        })
      } catch (err) {
        console.log(err.message);
      }
    }

    onChangeCompany(value:String) {
      this.companyId = value;
    }

    skillData() {
      try{
        let cleanSkillCategoryForm = this.util.cleanFormLevelOne(this.skillForm);
        if (this.skillForm.value) {
          this.api.addSkillCategoy(cleanSkillCategoryForm.value).subscribe(data => {
            if(data.status === "success" || data.status === 200){
              this.successMessage = true ;
              this.errorMsg = false ;
              this.successMsg = data.message;
              setTimeout(() => {
                this.handleErrors();
                this.ngZone.run(()=>this.router.navigateByUrl('/pages/skill-category/list-skill-category'));
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
      'skillName': [
        { type: 'required', message: 'Skill Name is required' },
      ],
      'categoryId': [
        { type: 'required', message: 'Category Name is required' },
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
      this.api.skillCategoryData().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.skillCategory.length > 0 && this.util.skillCategoryStatus !== 1){
            this.router.navigateByUrl("/pages/skill-category/list-skill-category");
            this.util.skillCategoryStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }
}