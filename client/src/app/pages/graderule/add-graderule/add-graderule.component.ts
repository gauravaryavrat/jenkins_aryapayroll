import { Component, NgZone,OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GraderuleApiService } from '../graderule-service/graderule-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
declare const $: any;

@Component({
    selector: 'app-add-graderule',
    templateUrl: './add-graderule.component.html'
})

export class AddGraderuleComponent implements OnInit {

    paymentHeadDataList: any;
    graderuleForm: any;
    Fixed: Boolean = false;
    Percent: Boolean = false;
    inputValue;
    errorMsg: String;
    percentErrorMsg = 'Percent is Required';
    gradeType = ['Fixed','Percent']
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    serverErrorMsg: boolean = false;
    fixedPaymentHeadsList = [];
    percentOfValue = 'basicSalary';



    validationMessage = {
        'title': [
          { type: 'required', message: 'Title is required' },
        ],
        'value': [
          { type: 'required', message: 'Amount is required' },
          { type: 'maxlength', message: 'Amount is too Large' },
          { type: 'pattern', message: 'Amount not valid' },
        ],
        'paymentHeadId':[
            { type: 'required', message: 'Payment Head is required' },
        ],
        'type': [
          { type: 'required', message: 'Type  is required' },
        ],
    }
    permissionInfo: any;

    constructor(private api:GraderuleApiService,private fb:FormBuilder,public router:Router,
        private util: UtilitiesService){
            this.isListAvaliable();
        }

    ngOnInit() {
        this.paymentHeadList();
        this.addMemberValidation();
        this.fixedPaymentHeads();
        this.permissionInfo = this.util.permissionRoleInfo;
        if(this.permissionInfo.search('Create GradeRule') === -1){
          this.graderuleForm.disable();
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

            this.graderuleForm.get('paymentHead.value').setValidators(dynamicValidation['fixed']);
            this.graderuleForm.get('paymentHead.value').updateValueAndValidity();

        } else if (gradeType == 'Percent') {
            this.Percent = true;
            this.Fixed = false;
            if(this.graderuleForm.get('paymentHead.value').value){
                this.switchTypeValidation(this.graderuleForm.get('paymentHead.value').value);
            }

            this.graderuleForm.get('paymentHead.value').setValidators(dynamicValidation['percent']);
            this.graderuleForm.get('paymentHead.value').updateValueAndValidity();
        }
    }

    addMemberValidation() {
        this.graderuleForm = this.fb.group({
            title: new FormControl('',Validators.required),
            paymentHead: new FormGroup({
                paymentHeadId: new FormControl('',Validators.required),
                type: new FormControl('',Validators.required),
                value: new FormControl('',Validators.compose([
                    Validators.required,
                    Validators.maxLength(8),
                    Validators.pattern('^[0-9]*$'),])),
            })
        })
    }

    paymentHeadList(){
        this.api.getPaymentHeadData().subscribe(data=>{
            this.paymentHeadDataList = data.data;
        })
    }

    graderuleData(){
        try{
            this.api.getGradeRule(this.graderuleForm.value, this.percentOfValue).subscribe(data=>{
                if(data.status === 'success'){
                    this.successMessage = true ;
                    this.serverErrorMsg = false ;
                    this.successMsg = data.message;
                    setTimeout(() => {
                        this.handleErrors();
                        this.router.navigateByUrl("pages/graderule/list-graderule");
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
        } catch(err){
            console.log(err);
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

handleErrors(){
    this.serverErrorMsg = false;
    this.successMessage = false;
    this.errMsg = '';
    this.successMsg = '';
}
isListAvaliable(){
    try{
      this.api.getGradeRuleList().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.data.length > 0 && this.util.gradeRuleStatus !== 1){
            this.router.navigateByUrl("/pages/graderule/list-graderule");
            this.util.gradeRuleStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }

  // Fixed Payment Heads
  fixedPaymentHeads(){
      try {
          this.api.fixedPaymentHeads(undefined).subscribe((data) => {
              if(data.status === 'success'){
                 this.fixedPaymentHeadsList = data.data;
              }
          })
      } catch (error) {
          console.log(error);
      }
  }

}


