import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HolidayApiService } from '../holiday-service/holiday-api.service';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
    selector: 'app-add-holiday',
    templateUrl: './add-holiday.component.html'
})

export class AddHolidayComponent implements OnInit {

    holidayForm: FormGroup;
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    errorMsg: boolean = false;
    companyNameStore: any;
    showCard: any;
    companyListData: Object;
    companyNameId: any;
    public holidayName = ['NATIONAL', 'STATE', 'WEEKLY', 'FESTIVAL'];
    public companyId: any;
  permissionInfo: any;

    constructor(private _api: ApiService,
      public fb: FormBuilder,
      private ngZone: NgZone,
      private router: Router,
      private api: HolidayApiService,
      private util: UtilitiesService){
        this.isListAvaliable();
      }

    ngOnInit() {
      this.companyDataValidate();
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create Holiday') === -1){
        this.holidayForm.disable();
      }
    }

    companyDataValidate() {
      try {
        this.holidayForm = this.fb.group({
          title: new FormControl('',Validators.required),
          holidayDate: new FormControl('',Validators.required),
          type: new FormControl('',Validators.required)
          })
        }
      catch (err) {
        console.log(err);
      }
    }

    holidayDataSubmit() {
      try{
        let cleanHolidayForm = this.util.cleanFormLevelOne(this.holidayForm);
        if (this.holidayForm.value) {
          this.api.addHoliday(cleanHolidayForm.value).subscribe((data) => {
            if(data.status === "success" || data.status === 200){
              this.successMessage = true ;
              this.errorMsg = false ;
              this.successMsg = data.message;
              setTimeout(() => {
                this.handleErrors();
                this.ngZone.run(()=>this.router.navigateByUrl('/pages/holiday/list-holiday'));
              },2000);
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
      'title':[{
        type: 'required', message: 'Holiday Title is Required'
      },],
      'holidayDate':[
        {type:'required',message: 'Holiday Date is Required'},
      ],
      'type':[
        {type:'required', message: 'Holiday Type is Required'}
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
      this.api.getHoliday().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.data.length > 0 && this.util.holidaysStatus !== 1){
            this.router.navigateByUrl("/pages/holiday/list-holiday");
            this.util.holidaysStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }

}