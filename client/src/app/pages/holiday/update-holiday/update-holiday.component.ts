import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HolidayApiService } from '../holiday-service/holiday-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-holiday',
  templateUrl: 'update-holiday.component.html'
})

export class UpdateHolidayComponent implements OnInit {

  holidayForm: any;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  companyNameStore: [];
  showCard: any;
  companyNameId: any;
  public companyName: [];
  public companyId: any;
  public holidayId: any;
  public leaveId;
  leaveData: Object[] = [];
  holidayData: Object;
  lastVal: [];
  public holidayName = ['NATIONAL', 'STATE', 'WEEKLY', 'FESTIVAL'];
  holidatList: any;
  permissionInfo: any;

  constructor(
    public fb: FormBuilder,
    private router: Router, private ngZone: NgZone, private route: ActivatedRoute,
    private api: HolidayApiService,
    private util: UtilitiesService) {
      this.holidayId = this.route.snapshot.paramMap.get("holidayId");
      this.util.moduleExists(this.holidayId,'Holidays').subscribe((data)=>{
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/holiday/list-holiday');
          }
        }
      })
    }

  ngOnInit() {
    this.companyDataValidate();
    this.existingData();
    this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Edit Holiday') === -1){
        this.holidayForm.disable();
      }
  }

  existingData(){
    this.api.holidayDetails(this.holidayId).subscribe(data=>{
      this.holidatList = data.data;
        this.holidayForm = this.fb.group({
          title: new FormControl(this.holidatList.title,Validators.required),
          holidayDate: new FormControl(this.holidatList.holidayDate.substring(0,10),Validators.required),
          type: new FormControl (this.holidatList.type,Validators.required)
        })
    })
  }

  companyDataValidate() {
    try {
      this.holidayForm = this.fb.group({
        title: new FormControl('',Validators.required),
        holidayDate: new FormControl('',Validators.required),
        type: new FormControl ('',Validators.required)
      })
    }
    catch (err) {
      console.log(err.message);
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

  updateHolidayList() {
    try {
      let cleanHolidayUpdateForm = this.util.cleanFormLevelOne(this.holidayForm);
      if (this.holidayForm.value) {
        this.api.updateHoliday(cleanHolidayUpdateForm.value,this.holidayId).subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.ngZone.run(() => this.router.navigateByUrl('/pages/holiday/list-holiday'));
            },2000);
          } else if (data.status == "error") {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            },3000);
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