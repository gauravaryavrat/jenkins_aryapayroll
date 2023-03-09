import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { skillCategoryApiService } from '../skillCategory-service/skillCategory-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-skill-category',
  templateUrl: 'update-skill-category.component.html'
})

export class UpdateSkillCategoryComponent implements OnInit {

  skillForm: FormGroup;
  successMsg:any= String;
  successMessage: boolean = false;
  errMsg: any= String;
  errorMsg: boolean = false;
  companyNameStore:any= [];
  showCard: any;
  companyNameId: any;
  companyName:any= [];
  skillCategoryId: any;
  leaveTypeId: any;
  leaveId: any;
  leaveData: any= [];
  leaveFormData: any=[];
  existinglist: any;
  permissionInfo: any;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private api: skillCategoryApiService,
    private util: UtilitiesService) {
      this.skillCategoryId = this.route.snapshot.paramMap.get("categoryId");
      this.util.moduleExists(this.skillCategoryId,'SkillCategory').subscribe((data)=>{
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/skill-category/list-skill-category');
          }
        }
      })
    }

  ngOnInit() {
    this.companyDataValidate();
    this.existingData();
    this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Edit SkillCategory') === -1){
        this.skillForm.disable();
      }
  }

  existingData(){
    this.api.skillCategoryDetails(this.skillCategoryId).subscribe((data)=>{
      this.existinglist = data;
        this.skillForm = this.fb.group({
          skillName: new FormControl(this.existinglist.data.skillName),
        })
    })
  }


  companyDataValidate() {
    try {
      this.skillForm = this.fb.group({
        skillName: new FormControl('', Validators.required),
      })
    }
    catch (err) {
      console.log(err.message);
    }
  }

  skillDataUpdate() {
    try {
      let cleanSkillCategoryUpdateForm = this.util.cleanFormLevelOne(this.skillForm);
      if (this.skillForm.value) {
        this.api.updateSkillCategory(cleanSkillCategoryUpdateForm.value,this.skillCategoryId).subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.ngZone.run(() => this.router.navigateByUrl('/pages/skill-category/list-skill-category'));
            },2000);

          } else if (data.status == "error") {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            },3000)
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  validationMessage = {
    'skillName': [
      { type: 'required', message: 'Skill Name is Required' },
    ],
  }
  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}
}