import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LeaveApiService } from '../service-leave/leave-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-leave-type',
  templateUrl: 'update-leave-type.component.html'
})

export class UpdateLeaveTypeComponent implements OnInit {

  leaveForm1: FormGroup;
  successMsg:any = String;
  successMessage: boolean = false;
  errMsg:any = String;
  errorMsg: boolean = false;
  companyNameStore:any = [];
  showCard: any;
  companyNameId: any;
  companyName:any=[];
  companyId: any;
  leaveTypeId: string;
  leaveId;
  leaveData: any=[];
  leaveFormData:any = Object;
  existingData:any;
  permissionInfo: any;


  constructor(
    public fb: FormBuilder,
    private router: Router, private ngZone: NgZone, private route: ActivatedRoute,
    private api: LeaveApiService,
    private util: UtilitiesService) {
      this.leaveTypeId = this.route.snapshot.paramMap.get("leaveTypeId");
      this.util.moduleExists(this.leaveTypeId,'LeaveTypes').subscribe((data)=>{
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/leave-types/list-leave-types');
          }
        }
      })
    }

  ngOnInit() {
    this.permissionInfo = this.util.permissionRoleInfo;
    this.companyDataValidate();
    this.existingLeaveTypeValues();
    if(this.permissionInfo.search('Edit LeaveType') === -1){
      this.leaveForm1.disable();
    }
  }

  companyDataValidate() {
    try {
      this.leaveForm1 = this.fb.group({
        leaveTypeName: new FormControl('',Validators.required),
        leaveTypeCode: new FormControl('',Validators.required),
        isPaid: new FormControl(false)
      })
    }
    catch (err) {
      console.log(err.message);
    }
  }

  existingLeaveTypeValues() {
    try {
      this.api.leaveTypeDetails(this.leaveTypeId).subscribe(data => {
        if (data.status === "success" || data.status === 200) {
          this.existingData = data.data;
          this.leaveForm1 = this.fb.group({
            leaveTypeName: new FormControl(this.existingData.leaveTypeName, Validators.required),
            leaveTypeCode: new FormControl(this.existingData.leaveTypeCode, Validators.required),
            isPaid: new FormControl(this.existingData.isPaid),
          })
        }
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  validationMessage = {
    'leaveTypeName': [
      { type: 'required', message: 'Name is required' },
    ],
    'leaveTypeCode':[{
      type: 'required', message: 'Code is required'
    }]
  }

  updateLeaveFormData() {
    try {
      let cleanUpdateLeaveTypeForm = this.util.cleanFormLevelOne(this.leaveForm1);
      if (this.leaveForm1.value) {
        this.api.updateLeaveType(cleanUpdateLeaveTypeForm.value,  this.leaveTypeId).subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.ngZone.run(() => this.router.navigateByUrl('/pages/leave-types/list-leave-types'));
            }, 2000);
          } else if (data.status == "error") {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            }, 3000);
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  handleErrors(){
    this.errorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}
}