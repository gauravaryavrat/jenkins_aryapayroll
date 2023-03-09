import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DepartmentApiService } from '../department-service/department-api.service';
import * as jsPDF from 'jspdf'
import { UtilitiesService } from 'src/app/utilities/utilities.service';


@Component({
    selector: 'app-add-department',
    templateUrl: './add-department.component.html'
})

export class AddDepartmentComponent implements OnInit {

  branchId;
  DepartmentForm: FormGroup;
  departmentNameList: any[];
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  permissionInfo: any;

  constructor( public fb: FormBuilder,private api:DepartmentApiService,
      private router: Router, private ngZone: NgZone, private route: ActivatedRoute,
      private util: UtilitiesService){
        this.isListAvaliable();
      }

  ngOnInit() {
    this.permissionInfo = this.util.permissionRoleInfo;
    this.departmentDataValidate();
    this.departmentName();
    if(this.permissionInfo.search('Create Department') === -1){
      this.DepartmentForm.disable();
    }

  }

  departmentDataValidate() {
    try {
      this.DepartmentForm = this.fb.group({
          title: new FormControl('',Validators.required),
          description: new FormControl(''),
          branchId:new FormControl('',Validators.required)
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
    ],
    'branchId':[
      { type: 'required', message: 'Branch Name is required' },
    ]
  }


  submitDepatmentData(){
    try{
      let cleanDepartmentForm = this.util.cleanFormLevelOne(this.DepartmentForm);
      this.api.addDepatment(cleanDepartmentForm.value,this.branchId).subscribe(data =>{
        if(data.status === "success"|| data.status === 200){
          this.successMessage = true ;
          this.errorMsg = false ;
          this.successMsg = data.message;
          setTimeout(()=>{
          this.handleErrors();
          this.ngZone.run(()=>this.router.navigateByUrl('/pages/department/list-department'));
        }, 1500);
        }else if(data.status == "error"){
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrors();
          }, 3000);
        }
      })
    }catch(err){
      console.log(err);

    }

  }

  departmentName(){
    this.api.DepartmentList().subscribe(data => {
      this.departmentNameList = data.branch;
    })
  }

  onClick(id){
    this.branchId = id;
  }

  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}

isListAvaliable(){
  try{

    this.api.getDepartment().subscribe((data) =>{
      if(data.status === 'success'){
        if(data.data.length > 0 && this.util.departmentSatus !== 1){
          this.router.navigateByUrl("/pages/department/list-department");
          this.util.departmentSatus = 0;
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}

}