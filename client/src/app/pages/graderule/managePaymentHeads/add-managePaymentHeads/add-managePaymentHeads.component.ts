import { Component, OnInit,NgZone, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { GraderuleApiService } from '../../graderule-service/graderule-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
    selector: 'app-add-managePaymentHeads',
    templateUrl: './add-managePaymentHeads.component.html'
})

export class AddManagePaymentHeadsComponent implements OnInit,OnDestroy {
  permissionInfo: any;
  fixedPaymentHeadsList = [];
  ngOnDestroy(): void {
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).removeAttribute('disabled');
  }

    paymentHeadDataList: any;
    managePaymentForm: any;
    Fixed: Boolean =false;
    Percent: Boolean = false;
    inputValue:any;
    errorMsg: String;
    percentErrorMsg: String;
    gradeRuleId:any;
    gradeType = ['Fixed','Percent'];
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    serverErrorMsg: boolean = false;
    percentOfValue = 'basicSalary';

    constructor(private api:GraderuleApiService, private fb:FormBuilder,private route:ActivatedRoute,private ngZone: NgZone,private router:Router,
      private util: UtilitiesService){}

    // constructor(private api:GraderuleApiService,private fb:FormBuilder,public route:Router,){}

    ngOnInit() {
      this.gradeRuleId = this.route.snapshot.paramMap.get("gradeRuleId");
      this.addMemberValidation();
      this.fixedPaymentHeads();
      this.paymentHeadList();
      (document.getElementById('headerCompanyDropDown')as HTMLInputElement).setAttribute('disabled','disabled');
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create PaymentHeads') === -1){
        this.managePaymentForm.disable();
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

      try{
        let gradeType = name.target.options[name.target.options.selectedIndex].text;
        if(gradeType == 'Fixed')
        {
            this.Fixed = true;
            this.Percent = false;
            this.errorMsg = '';
            this.percentErrorMsg = '';

        this.managePaymentForm.get('paymentHead.value').setValidators(dynamicValidation['fixed']);
        this.managePaymentForm.get('paymentHead.value').updateValueAndValidity();

        } else if (gradeType == 'Percent') {
            this.Percent = true;
            this.Fixed = false;
            if(this.managePaymentForm.get('paymentHead.value').value){
                this.switchTypeValidation(this.managePaymentForm.get('paymentHead.value').value);
            }

            this.managePaymentForm.get('paymentHead.value').setValidators(dynamicValidation['percent']);
            this.managePaymentForm.get('paymentHead.value').updateValueAndValidity();
        }
      }catch(err){
        console.log(err);
      }
    }

    addMemberValidation() {
      try{
        this.managePaymentForm = this.fb.group({
          paymentHead: new FormGroup({
            paymentHeadId: new FormControl('',Validators.required),
            type: new FormControl('',Validators.required),
            value: new FormControl('',Validators.compose([Validators.required,
              Validators.pattern('^[0-9]*$'),])),
          })
        })
      }catch(err){
        console.log(err)
      }
    }

    paymentHeadList(){
      this.api.filterPaymentHeads(this.gradeRuleId).subscribe(data=>{
        this.paymentHeadDataList = data.data;
      })
    }

    managePaymentData(){
      try{
        this.api.addGradules(this.managePaymentForm.value,this.gradeRuleId,this.percentOfValue).subscribe(data=>{
          if(data.status === 'success') {
            this.successMessage = true ;
            this.serverErrorMsg = false ;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.router.navigateByUrl(`pages/graderule/list-managePaymentHeads/${this.gradeRuleId}`);
            },2000)
          } else {
            this.serverErrorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(()=>{
              this.handleErrors();
            },3000)
          }
        })
      }catch(err){
        console.log(err);
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

  handleErrors(){
    this.serverErrorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
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

// Fixed Payment Heads
fixedPaymentHeads(){
  try {
      this.api.fixedPaymentHeads(this.gradeRuleId).subscribe((data) => {
          if(data.status === 'success'){
             this.fixedPaymentHeadsList = data.data;
          }
      })
  } catch (error) {
      console.log(error);
  }
}

percentOf(value){
  this.percentOfValue = value;
}

}