import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DepartmentApiService } from '../department-service/department-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-department',
  templateUrl: 'update-department.component.html'
})

export class UpdateDepartmentComponent implements OnInit {

  DepartmentUpdateForm: FormGroup;
  userId;
  departmentData: any;
  branchId;
  successMsg: String;
  successMessage: boolean = false; 
  errMsg: String;
  errorMsg: boolean = false;
  permissionInfo: any;


  constructor( public fb: FormBuilder,private api:DepartmentApiService,
    private router: Router, private ngZone: NgZone, private route: ActivatedRoute,
    private util: UtilitiesService){
      let departmentId = this.route.snapshot.paramMap.get("id");
      this.util.moduleExists(departmentId,'Department').subscribe((data) => {
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/department/list-department');
          }
        }
      })
    }

ngOnInit() {
  // Deparment ID
  this.permissionInfo = this.util.permissionRoleInfo;
  this.userId = this.route.snapshot.paramMap.get("id");
  // Branch ID
  this.branchId = this.route.snapshot.paramMap.get("userId");
  this.departmentDataValidate();
  this.existingData();
  if(this.permissionInfo.search('Edit Department') === -1){
    this.DepartmentUpdateForm.disable();
  }
}

existingData(){
  this.api.getDepartmentDetails(this.userId).subscribe(data=>{
      if (data.status == 'success'){
        this.departmentData = data.data;
            this.DepartmentUpdateForm = this.fb.group({
              title: new FormControl(this.departmentData.title,Validators.required),
              description: new FormControl(this.departmentData.description)
            })
      }
    });
}

departmentDataValidate() {
  try {
    this.DepartmentUpdateForm = this.fb.group({
        title: new FormControl('', Validators.required),
        description: new FormControl('')
      })
    }
  catch (err) {
    console.log(err);
  }
}

//Method for show validdation message
validationMessage = {
  'title': [
    { type: 'required', message: 'Title is required' },
  ]
}

updateDepartment(){
  try{
    let cleanUpdateDepartmentForm = this.util.cleanFormLevelOne(this.DepartmentUpdateForm);
    if(this.DepartmentUpdateForm.valid) {
      this.api.updateDepartment(cleanUpdateDepartmentForm.value,this.branchId,this.userId).subscribe(data=> {
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() => {
            this.handleErrors();
            this.router.navigateByUrl("/pages/department/list-department");
          }, 2000);
        }
        else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(() => {
            this.handleErrors();
          }, 3000);
        }
      })
    }
  }catch(err){
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