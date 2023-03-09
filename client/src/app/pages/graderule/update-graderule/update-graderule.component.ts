import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GraderuleApiService } from '../graderule-service/graderule-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-graderule',
  templateUrl: 'update-graderule.component.html'
})

export class UpdateGraderuleComponent implements OnInit {

  graderuleUpdateForm: any;
  gradeRuleId:any;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  permissionInfo: any;

constructor(private api:GraderuleApiService, private fb:FormBuilder,private route:ActivatedRoute,private ngZone: NgZone,private router:Router,
  private util: UtilitiesService){
    this.gradeRuleId = this.route.snapshot.paramMap.get("gradeRuleId");
    this.util.moduleExists(this.gradeRuleId,'GradeRule').subscribe((data)=>{
      if(data.status === 'success'){
        if(!data.data){
          this.router.navigateByUrl('/pages/graderule/list-graderule');
        }
      }
    })
  }

  ngOnInit() {
    this.addMemberValidation();
    this.existingData();
    this.permissionInfo = this.util.permissionRoleInfo;
        if(this.permissionInfo.search('Edit GradeRule') === -1){
          this.graderuleUpdateForm.disable();
        }
  }

  validationMessage = {
    'title': [
      { type: 'required', message: 'Title is required' },
    ],
  }

  addMemberValidation() {
    this.graderuleUpdateForm = this.fb.group({
      title: new FormControl('',Validators.required),
    })
  }

  existingData(){
    this.api.existingData(this.gradeRuleId).subscribe(data=>{
        this.graderuleUpdateForm = this.fb.group({
          title: new FormControl(data.data.title,Validators.required)
        })
    })
  }

  graderuleUpdateData(){
    try{
      let cleanUpdateGradeRuleForm = this.util.cleanFormLevelOne(this.graderuleUpdateForm);
      this.api.updateGadeRule(cleanUpdateGradeRuleForm.value,this.gradeRuleId).subscribe(data=>{
        if(data.status === 'success') {
          this.successMessage = true ;
          this.errorMsg = false ;
          this.successMsg = data.message;
          setTimeout(() => {
            this.handleErrors();
            this.ngZone.run(()=>this.router.navigateByUrl('/pages/graderule/list-graderule'));
          },2000)
        } else {
          this.successMessage = false ;
          this.errorMsg = true ;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrors();
          },3000)
        }
      })
    } catch(err){
      console.log(err);
    }
  }

  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}

}