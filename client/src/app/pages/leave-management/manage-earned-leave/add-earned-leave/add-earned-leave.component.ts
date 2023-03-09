import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/pages/employee-wizard/services/employee.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import { LeaveServicesService } from '../services/leave-services.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-earned-leave',
  templateUrl: './add-earned-leave.component.html',
  styleUrls: ['./add-earned-leave.component.scss']
})
export class AddEarnedLeaveComponent implements OnInit {
  addEarnedLeaveForm: any;
  earnedLeaveMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  employeeDetails: any;
  errorMsg: boolean;
  successMessage: boolean;
  errMsg: string;
  successMsg: string;
  status = "Active";
  permissionInfo: any;

  constructor(private fb: FormBuilder,
    private employeeListAPI: EmployeeService,
    private api: LeaveServicesService,
    private router: Router,
    private util: UtilitiesService) { }

  ngOnInit() {
    this.employeeList();
    this.manageEarnedLeaveForm();
    this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create EarnedLeave') === -1){
        this.addEarnedLeaveForm.disable();
      }
  }

  manageEarnedLeaveForm(){
    try{
      this.addEarnedLeaveForm = this.fb.group({
        earnedLeave: new FormGroup({
          month: new FormControl('',Validators.required),
          year: new FormControl('',Validators.compose([
            Validators.required,
            Validators.pattern(/^(19|20)\d{2}$/)])),
          leaveCount: new FormControl('',Validators.compose([
            Validators.required,
            Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)
          ])),
          reason: new FormControl('')
        }),
        employeeId: new FormControl('', Validators.required)
      })
    } catch(err){
      console.log(err);
    }
  }

earnedLeavevalidationMessage = {
  'month':[
    {type:'required', message:'Month is Required'}
  ],
  'year':[
    {type:'required', message:'Year is Required'},
    {type:'pattern', message:'Value is not acceptable'}
  ],
  'leaveCount':[
    {type:'required', message:'Earned Balance is Required'},
    {type:'pattern', message:'Value is not acceptable'}
  ],
  'employeeId':[
    {type:'required', message:'Employee Name is Required'}
  ]
}

// Get Employee List
employeeList(){
  try{
    this.employeeListAPI.getEmployeeList(this.status).subscribe((data)=>{
      if(data.status === 'success'){
        this.employeeDetails = data.data;
      }
    })
  } catch(err){
    console.log(err);
  }
}

// Submit Earned Leave Form

addLeaveForm(){
  try{
    console.log(this.addEarnedLeaveForm.get('employeeId').value);
    this.api.addEarnedLeave(this.addEarnedLeaveForm.value,this.addEarnedLeaveForm.get('employeeId').value).subscribe((data)=> {
      if(data.status === 'success'){
        this.successMessage = true ;
        this.errorMsg = false ;
        this.successMsg = data.message;
        setTimeout(()=> {
          this.handleErrors();
          this.router.navigateByUrl("/pages/leave-management/list-earned-leave");
        },2000)
      } else {
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        setTimeout(()=>{
          this.handleErrors();
        }, 3000);
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
