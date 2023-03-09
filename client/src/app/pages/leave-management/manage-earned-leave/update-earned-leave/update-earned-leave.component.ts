import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { LeaveServicesService } from '../services/leave-services.service';
import { EmployeeService } from 'src/app/pages/employee-wizard/services/employee.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-earned-leave',
  templateUrl: './update-earned-leave.component.html',
  styleUrls: ['./update-earned-leave.component.scss']
})
export class UpdateEarnedLeaveComponent implements OnInit {
earnedLeaveId : any;
employeeId: any;
updateEarnedLeaveForm: any;
employeeDetails: any;
existingUpdateDetails: any;
earnedLeaveMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
errorMsg: boolean;
successMessage: boolean;
errMsg: string;
successMsg: string;
status = "Active";


  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private employeeListAPI: EmployeeService,
    private util: UtilitiesService,
    private earnedLeaveUpdateAPI: LeaveServicesService
    ) { }

  ngOnInit() {
    this.earnedLeaveId = this.route.snapshot.paramMap.get("earnedLeaveId");
    this.employeeId = this.route.snapshot.paramMap.get('employeeId');
    this.employeeList();
    this.leaveUpdateForm();
    this.updateLeaveFormDetails();
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

  // Existing Earned Leave Details
  updateLeaveFormDetails(){
    try{
     // Get Existing Earned Leave Data
      this.earnedLeaveUpdateAPI.existingEarnedLeaveDetails(this.earnedLeaveId,this.employeeId).subscribe((data)=>{
        if(data.status === 'success'){
          this.existingUpdateDetails = data.data;

          // Fill Update Form With existing Values
          this.updateEarnedLeaveForm = this.fb.group({
            earnedLeave: new FormGroup({
              month: new FormControl(this.existingUpdateDetails.month,Validators.required),
              year: new FormControl(this.existingUpdateDetails.year,Validators.compose([
                Validators.required,
                Validators.pattern(/^(19|20)\d{2}$/)])),
              leaveCount: new FormControl(this.existingUpdateDetails.leaveCount,Validators.compose([
                Validators.required,
                Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)
              ])),
              reason: new FormControl(this.existingUpdateDetails.reason)
            }),
            employeeId: new FormControl(this.existingUpdateDetails._id, Validators.required)
          })
        }
      })
    } catch(err){
      console.log(err);
    }
  }

  // Update Leave Form
  leaveUpdateForm(){
    try{
      this.updateEarnedLeaveForm = this.fb.group({
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

  // Validation Messages
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


// Submit Update Data
  updateEarnedLeave(){
    try{
      this.earnedLeaveUpdateAPI.updateEarnedLeave(this.updateEarnedLeaveForm.value,this.earnedLeaveId,this.employeeId).subscribe((data)=>{
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
