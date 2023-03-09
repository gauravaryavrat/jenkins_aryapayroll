import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveApiService } from '../service-leave/leave-api.service';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
    selector: 'app-add-leave-types',
    templateUrl: './add-leave-types.component.html'
})

export class AddLeaveTypesComponent implements OnInit {


    leaveForm: FormGroup;
    public successMsg:any = String;
    public successMessage: boolean = false;
    public errMsg:any = String;
    public errorMsg: boolean = false;
    public companyNameStore: any;
    public showCard: any;
    public companyListData:any = Object;
    public companyNameId: any;
    public companyName: any =[];
    public companyId: any;
    permissionInfo: any;


    constructor(private _api: ApiService,
      public fb: FormBuilder,
      private ngZone: NgZone,
      private router: Router,
      private api: LeaveApiService,
      private util: UtilitiesService){
        this.isListAvaliable();
      }

    ngOnInit() {
      this.permissionInfo = this.util.permissionRoleInfo;
      this.companyDataValidate();
      if(this.permissionInfo.search('Create LeaveType') === -1){
        this.leaveForm.disable();
      }
    }

    companyDataValidate() {
      try {
        this.leaveForm = this.fb.group({
          leaveTypeName: new FormControl('',Validators.required),
          leaveTypeCode: new FormControl('',Validators.required),
            isPaid: new FormControl(false)
          })
        }
      catch (err) {
        console.log(err);
      }
    }

    leaveFormData() {
      try{
        let cleanLeaveTypeForm = this.util.cleanFormLevelOne(this.leaveForm);
        if (this.leaveForm.value) {
          this.api.leaveDataSubmit(cleanLeaveTypeForm.value).subscribe(data => {
            if(data.status === "success" || data.status === 200){
              this.successMessage = true ;
              this.errorMsg = false ;
              this.successMsg = data.message;
              setTimeout(() => {
                this.handleErrors();
                this.ngZone.run(()=>this.router.navigateByUrl('/pages/leave-types/list-leave-types'));
              }, 2000);
            }
            else if(data.status === "error"|| data.status === 404){
              this.errorMsg = true;
              this.successMessage = false;
              this.errMsg = data.message;
              setTimeout(() => {
                this.handleErrors();
              },3000);
            }
          })
        }
      } catch(err){
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

    handleErrors(){
      this.errorMsg = false;
      this.successMessage = false;
      this.errMsg = '';
      this.successMsg = '';
  }
  isListAvaliable(){
    try{

      this.api.getListData().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.leaveTypes.length > 0 && this.util.leaveStatus !== 1){
            this.router.navigateByUrl("/pages/leave-types/list-leave-types");
            this.util.leaveStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }
}