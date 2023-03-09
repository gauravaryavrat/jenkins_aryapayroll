import { Component, OnInit, NgZone, OnDestroy} from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GraderuleApiService } from '../../graderule-service/graderule-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-managePaymentHeads',
  templateUrl: 'update-managePaymentHeads.component.html'
})

export class UpdateManagePaymentHeadsComponent implements OnInit,OnDestroy {
  permissionInfo: any;
  fixedPaymentHeadsList: any;
  percentOfValue: any;
  routePercentOfValue: any;
  ngOnDestroy(): void {
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).removeAttribute('disabled');
  }

  gradeRuleId;
  updateManagePaymentForm: any;
  paymentHeadDataList: any;
  paymentHeadId;
  existingGradeRule: any;
  existingPaymentHeadId: any;
  existingPaymentHeadName: any;
  gradeType = ['Fixed','Percent'];
  Fixed: Boolean = false;
  Percent: Boolean = false;
  percentErrorMsg: String;
  errorMsg: String;
  inputValue;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  serverErrorMsg: boolean = false;



  constructor(
    public fb: FormBuilder,private api:GraderuleApiService,
    private router: Router, private ngZone: NgZone, private route: ActivatedRoute,
    private util: UtilitiesService) { }

  ngOnInit() {
    this.paymentHeadId = this.route.snapshot.paramMap.get("paymentHeadId");
    this.gradeRuleId = this.route.snapshot.paramMap.get("gradeRuleId");
    this.paymentHeadList();
    this.addMemberValidation();
    this.existing();
    this.fixedPaymentHeadList();
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).setAttribute('disabled','disabled');
    this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Edit PaymentHeads') === -1){
        this.updateManagePaymentForm.disable();
      }
  }

  existing(){
    try{
      this.api.existingData(this.gradeRuleId).subscribe(data=>{
        if(data.status === 'success'){
          this.existingGradeRule = data.data.paymentHeads;
          this.existingGradeRule.forEach((items) => {
            if(items._id == this.paymentHeadId){
              if(items.type === 'Percent'){
                this.Percent = true;
                this.Fixed = false;
                this.percentOfValue = items.percentOfValue;
                this.percentOfFunction(items.percentOfValue);
                this.errorMsg = '';
                this.percentErrorMsg = '';
                this.updateManagePaymentForm = this.fb.group({
                  paymentHead: new FormGroup({
                    paymentHeadId: new FormControl(items.paymentHeadId),
                    type: new FormControl(items.type),
                    value: new FormControl(items.value, Validators.compose([Validators.required,
                      Validators.maxLength(8),
                      Validators.pattern(/^\d{0,2}(?:\.\d{0,2})?$/),])),
                  })
                })
              } else {
                this.Percent = false;
                this.Fixed = true;
                this.updateManagePaymentForm = this.fb.group({
                  paymentHead: new FormGroup({
                    paymentHeadId: new FormControl(items.paymentHeadId),
                    type: new FormControl(items.type),
                    value: new FormControl(items.value, Validators.compose([Validators.required,
                      Validators.maxLength(8),
                      Validators.pattern('^[0-9]*$'),])),
                  })
                })
              }
              this.existingPaymentHeadId = items._id;
              this.existingPaymentHeadName = items.paymentHeadName
            } else {
              return;
            }
          })
        }
      })
    }catch(err){
      console.log(err);
    }
  }

  paymentHeadList(){
    this.api.getPaymentHeadData().subscribe(data=>{
      this.paymentHeadDataList = data.data;
    })
  }

  // Update Payment Heads
  updatePaymentHeads(){
    try{

      this.api.updatePaymentHeads(this.updateManagePaymentForm.value,this.paymentHeadId,this.gradeRuleId,this.percentOfValue,this.Percent).subscribe(data => {
        if(data.status === 'success'){
          this.successMessage = true ;
          this.serverErrorMsg = false ;
          this.successMsg = data.message;
          setTimeout(() => {
              this.router.navigateByUrl("pages/graderule/list-graderule");
          },1000)
        } else {
          this.serverErrorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
        }
      })
    } catch(err){
      console.log(err);
    }
  }

  addMemberValidation() {
    try{
      this.updateManagePaymentForm = this.fb.group({
        paymentHead: new FormGroup({
          paymentHeadId: new FormControl('',Validators.required),
          type: new FormControl('',Validators.required),
          value: new FormControl('',Validators.compose([Validators.required,
            Validators.maxLength(8),
            Validators.pattern(/^\d{0,2}(?:\.\d{0,2})?$/),])),
        })
      })
    }catch(err){
      console.log(err)
    }
  }

  check(name){
    let dynamicValidation = {
      fixed: [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern('^[0-9]*$')
      ],
      percent: [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(/^\d{0,2}(?:\.\d{0,2})?$/)
      ]
    }
    let gradeType = name.target.options[name.target.options.selectedIndex].text;
    if(gradeType == 'Fixed')
    {
        this.Fixed = true;
        this.Percent = false;
        this.errorMsg = '';
        this.percentErrorMsg = '';

        this.updateManagePaymentForm.get('paymentHead.value').setValidators(dynamicValidation['fixed']);
        this.updateManagePaymentForm.get('paymentHead.value').updateValueAndValidity();

    } else if (gradeType == 'Percent') {
        this.Percent = true;
        this.Fixed = false;
        if(this.updateManagePaymentForm.get('paymentHead.value').value){
            this.switchTypeValidation(this.updateManagePaymentForm.get('paymentHead.value').value);
        }
        this.updateManagePaymentForm.get('paymentHead.value').setValidators(dynamicValidation['percent']);
        this.updateManagePaymentForm.get('paymentHead.value').updateValueAndValidity();
    }
}

demo(){
  if((document.getElementById('typeValue') as HTMLInputElement).value != 'Fixed') {
      this.inputValue = (document.getElementById('percentValue') as HTMLInputElement).value;
  if(this.inputValue >0 && this.inputValue <= 100 ){
      this.percentErrorMsg = '';
      this.errorMsg = '';
  } else if(this.inputValue.length == 0){
      this.percentErrorMsg = 'Percent is Required';
      this.errorMsg = '';
  } else if(this.inputValue.length >6){
      this.percentErrorMsg = 'Percent Value is too Large';
      this.errorMsg = '';
  } else {
      this.percentErrorMsg = '';
      this.errorMsg = 'Enter value is not valid';
  }
}
  }

// Check For Validation When User Switch The Type
switchTypeValidation(inputValue:Number){
  if(inputValue >0 && inputValue <= 100 ){
      this.percentErrorMsg = '';
      this.errorMsg = '';
  } else if((inputValue).toString().length == 0){
      this.percentErrorMsg = 'Percent is Required';
      this.errorMsg = '';
  } else if((inputValue).toString().length > 6) {
      this.percentErrorMsg = 'Percent Value is too Large';
      this.errorMsg = '';
  } else {
      this.percentErrorMsg = '';
      this.errorMsg = 'Enter value is not valid';
  }
}

validationMessage = {
  'value': [
    { type: 'required', message: 'Amount is Required' },
    { type: 'maxlength', message: 'Amount is too Large' },
    { type: 'pattern', message: 'Amount not valid' },
  ],
  'paymentHeadId':[
      { type: 'required', message: 'Payment Head is Required' },
  ],
  'type': [
    { type: 'required', message: 'Type  is Required' },
  ],
}

fixedPaymentHeadList(){
  this.api.fixedPaymentHeads(this.gradeRuleId).subscribe((data) => {
    if(data.status === 'success'){
       this.fixedPaymentHeadsList = data.data;
    }
})
}

percentOf(value){
  this.percentOfValue = value;
}

percentOfFunction = function percentOfFunction(percentValue) {
  setTimeout(() => {
    (document.getElementById('percentOfValue') as HTMLInputElement).value = percentValue;
  },200);
}


}