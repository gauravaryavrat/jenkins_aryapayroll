import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/pages/employee-wizard/services/employee.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import { LeaveApiService } from '../../../leave-types/service-leave/leave-api.service';
import { LeaveServicesService } from '../../manage-earned-leave/services/leave-services.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mark-absent',
  templateUrl: './mark-absent.component.html',
  styleUrls: ['./mark-absent.component.scss']
})
export class MarkAbsentComponent implements OnInit {

  addEarnedLeaveForm: any;
  employeeDetails: any;
  errorMsg: boolean;
  successMessage: boolean;
  errMsg: string;
  successMsg: string;
  formToLeaveFor = ['First Half','Second Half','Full Day'];
  addEmployeeAbsentForm: any;
  leaveListData: any;
  showCard:any = {};
  employeeList: any;
  employeeTlList: any;
  showTlOption = false;
  status = 'Active';


  constructor(private fb: FormBuilder,
    private employeeListAPI: EmployeeService,
    private api: LeaveApiService,
    private router: Router,
    private util: UtilitiesService,
    private ngZone: NgZone) { }

  ngOnInit() {
    this.manangeEmployeeLeave();
    this.leaveList();
    this.getEmployeeList();
  }

  manangeEmployeeLeave(){
    try{
      this.addEmployeeAbsentForm = this.fb.group({
          userId: new FormControl('',Validators.required),
          reason: new FormControl('',Validators.required),
          leaveTypeId: new FormControl('',Validators.required),
          fromDate: new FormControl('',Validators.required),
          toDate: new FormControl('',Validators.required),
          fromLeaveFor: new FormControl('',Validators.required),
          toLeaveFor: new FormControl('',Validators.required),
          status: new FormControl('Unsanctioned',Validators.required),
          requestToUserId: new FormControl('', Validators.required)
      })
    } catch(err){
      console.log(err);
    }
  }

  DateCheck(){

    var StartDate= (document.getElementById('txtStartDate')as HTMLInputElement).value;
    var EndDate= (document.getElementById('txtEndDate')as HTMLInputElement).value;
    var eDate = new Date(EndDate);
    var sDate = new Date(StartDate);
    if(StartDate!= '' && StartDate!= '' && sDate> eDate)
      {
      alert("Please ensure that the End Date is after than the Start Date.");
      (document.getElementById('txtEndDate')as HTMLInputElement).value = "";
      }
  }
  absentFieldValidationMessage = {
    'userId':[
      {type:'required', message:'Employee Name is Required'}
    ],
    'reason':[
      {type:'required', message:'Leave Reason is Required'}
    ],
    'leaveTypeId':[
      {type:'required', message:'Leave Type is Required'}
    ],
    'fromDate':[
      {type:'required', message:'Start Date is Required'},
    ],
    'toDate':[
      {type:'required', message:'To Date is Required'}
    ],
    'fromLeaveFor':[
      {type:'required', message:'From Leave is Required'},
    ],
    'toLeaveFor':[
      {type:'required', message:'To Leave is Required'}
    ],
    'requestToUserId':[
      {type:'required', message:'TL/Manager Name is Required'}
    ]
  }

  leaveList() {
    try{
      this.api.getListData().subscribe(data => {
        if (data.status === 'success') {
          this.leaveListData = data.leaveTypes;

          if(data.leaveTypes[0].length == 0){
            // this.route.navigateByUrl("/pages/leave-types/add-leave-types");
          }
          else{
            const len = Object.keys(this.leaveListData).length;

            for (var i = 0; i < len; i++) {
              this.showCard[this.leaveListData[i]._id] = true;
            }
          }

        }
      })
    }catch(err){
      console.log(err.message);
    }

  }

// Get Employee List
getEmployeeList(){
  try{
    this.employeeListAPI.getEmployeeList(this.status).subscribe((data)=>{
      if(data.status === 'success'){
        this.employeeList = data.data;
      }
    })
  }catch(err){
    console.log(err);
  }
}

// Get Employee TL/Manager
getEmployeeTL(employeeId){
  try{
    this.employeeListAPI.employeeTlList(employeeId).subscribe((data)=>{
      if(data.status === 'success'){
        this.employeeTlList = data.data.parentUsersIds;
        this.showTlOption = true;
      }
    })
  }catch(err){
    console.log(err);

  }
}

// Mark Absent Form
markEmployeeAbsent(){
  try{
    this.api.markEmployeeAbsent(this.addEmployeeAbsentForm.value,this.addEmployeeAbsentForm.get('userId').value).subscribe((data)=>{
      if(data.status === 'success'){
        this.successMessage = true;
        this.successMsg = data.message;
        this.errorMsg = false;
        setTimeout(()=>{
          this.handleErrors();
          this.ngZone.run(()=> this.router.navigateByUrl('/pages/leave-management/list-leave'));
        },2000)
      } else if(data.status === 'error'){
        this.successMessage = false;
        this.errMsg = data.message;
        this.errorMsg = true;
        setTimeout(()=>{
          this.handleErrors();
        },3000)
      }
    })
  }catch(err){
    console.log(err);
  }
}

// Handle Errors
handleErrors(){
  this.successMessage = false;
  this.successMsg = '';
  this.errorMsg = false;
  this.errMsg = '';
}

}
